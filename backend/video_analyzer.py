import io
import json
import logging
import os
import subprocess
import tempfile
from typing import Any, Dict, List

import google.generativeai as genai
from google.api_core import exceptions as gexc
from PIL import Image

logger = logging.getLogger(__name__)


def extract_frames(
    video_path: str, frame_interval_seconds: int = 1, max_frames: int = 6
) -> tuple[List[bytes], str | None]:
    with tempfile.TemporaryDirectory() as tmpdir:
        output_pattern = os.path.join(tmpdir, "frame_%02d.jpg")
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            video_path,
            "-vf",
            f"fps=1/{frame_interval_seconds}",
            "-frames:v",
            str(max_frames),
            output_pattern,
        ]
        try:
            subprocess.run(
                cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )
        except subprocess.CalledProcessError as exc:
            logger.warning(
                "Frame extraction failed for %s: %s",
                video_path,
                exc.stderr.decode("utf-8", errors="ignore")[:400],
            )
            return [], "ffmpeg_error"

        frames = sorted(
            [os.path.join(tmpdir, f) for f in os.listdir(tmpdir) if f.endswith(".jpg")]
        )
        # copy frame paths before temp dir cleanup
        frame_bytes = []
        for frame_path in frames:
            with open(frame_path, "rb") as f:
                frame_bytes.append(f.read())
    # Recreate temp files for caller? We'll return bytes instead of paths
    if not frame_bytes:
        return [], "no_frames"
    return frame_bytes, None


def _extract_json(text: str) -> Dict[str, Any]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in response")
    return json.loads(text[start : end + 1])


class GeminiVisionAnalyzer:
    def __init__(self, api_key: str, model_name: str):
        self.api_key = api_key
        self.model_name = model_name
        if not api_key or api_key.startswith("YOUR_"):
            self.enabled = False
            logger.warning("Gemini API key missing; analyzer disabled.")
        else:
            self.enabled = True
            genai.configure(api_key=api_key)
            self.model_candidates = self._build_model_candidates(model_name)
            self.model_index = 0
            self.model = genai.GenerativeModel(self.model_candidates[self.model_index])

    def _build_model_candidates(self, primary: str) -> List[str]:
        # Order matters: try user-specified model first, then fallbacks.
        base_candidates = [
            primary,
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro-001",
            "gemini-pro-vision",
            "gemini-pro",
        ]
        candidates: List[str] = []
        for name in base_candidates:
            if not name:
                continue
            candidates.append(name)
            if not name.startswith("models/"):
                candidates.append(f"models/{name}")
        # De-duplicate while preserving order and strip empties.
        seen = set()
        cleaned: List[str] = []
        for name in candidates:
            if not name:
                continue
            if name in seen:
                continue
            seen.add(name)
            cleaned.append(name)
        return cleaned

    def _set_model(self, index: int) -> None:
        self.model_index = index
        self.model = genai.GenerativeModel(self.model_candidates[self.model_index])
        self.model_name = self.model_candidates[self.model_index]

    def _generate_with_fallback(self, content):
        last_error: Exception | None = None
        for offset in range(len(self.model_candidates)):
            idx = (self.model_index + offset) % len(self.model_candidates)
            if idx != self.model_index:
                self._set_model(idx)
            try:
                return self.model.generate_content(content)
            except gexc.NotFound as exc:
                last_error = exc
                logger.warning("Gemini model not found: %s", self.model_name)
                continue
            except Exception as exc:
                last_error = exc
                break
        if last_error:
            raise last_error
        raise RuntimeError("No Gemini model available")

    def analyze_chunk(self, video_path: str, use_case: Dict[str, Any]) -> Dict[str, Any]:
        if not self.enabled:
            return {"events": [], "summary": "", "analysis_failed": "disabled"}

        frames, extraction_error = extract_frames(video_path)
        if not frames:
            logger.info("No frames extracted for %s", video_path)
            return {
                "events": [],
                "summary": "",
                "analysis_failed": extraction_error or "frame_extraction",
            }

        prompt = (
            f"{use_case['system_prompt']}\n\n"
            f"Context: {use_case['context']}\n\n"
            "Events to detect:\n"
            + "\n".join([f"- {event}" for event in use_case["events"]])
            + "\n\n"
            "Return JSON only in this format:\n"
            "{\n"
            "  \"summary\": \"1-2 sentence general description of what is happening in the clip (not limited to the event list).\",\n"
            "  \"events\": [\n"
            "    {\"event_type\": \"fight\", \"detected\": true, \"confidence\": 0.82, "
            "\"description\": \"Brief description\", \"explanation\": \"Why you flagged it\"}\n"
            "  ]\n"
            "}\n"
            "If nothing is detected, return {\"summary\": \"\", \"events\": []}."
        )

        content = [prompt]
        for frame in frames:
            content.append(Image.open(io.BytesIO(frame)))

        response = self._generate_with_fallback(content)
        try:
            data = _extract_json(response.text)
        except Exception:
            logger.warning(
                "Gemini response not valid JSON; ignoring. Response: %s",
                (response.text or "")[:400],
            )
            return {"events": [], "summary": "", "analysis_failed": "invalid_json"}
        events = data.get("events", [])
        summary = data.get("summary", "") or ""

        normalized = []
        for event in events:
            if not event.get("detected", False):
                continue
            normalized.append(
                {
                    "event_type": event.get("event_type", "unknown"),
                    "confidence": float(event.get("confidence", 0.0)),
                    "description": event.get("description", ""),
                    "explanation": event.get("explanation", ""),
                }
            )

        return {"events": normalized, "summary": summary, "analysis_failed": None}
