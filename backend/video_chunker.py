import glob
import logging
import os
import subprocess
from typing import List

logger = logging.getLogger(__name__)


def split_video_to_chunks(
    video_path: str, output_dir: str, chunk_duration_seconds: int
) -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    output_pattern = os.path.join(output_dir, "chunk_%04d.mp4")

    cmd_copy = [
        "ffmpeg",
        "-y",
        "-i",
        video_path,
        "-c",
        "copy",
        "-map",
        "0",
        "-f",
        "segment",
        "-segment_time",
        str(chunk_duration_seconds),
        "-reset_timestamps",
        "1",
        output_pattern,
    ]

    try:
        subprocess.run(
            cmd_copy, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except subprocess.CalledProcessError as exc:
        logger.warning(
            "FFmpeg stream copy failed, falling back to re-encode: %s",
            exc.stderr.decode("utf-8", errors="ignore")[:400],
        )
        cmd_encode = [
            "ffmpeg",
            "-y",
            "-i",
            video_path,
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "23",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-f",
            "segment",
            "-segment_time",
            str(chunk_duration_seconds),
            "-reset_timestamps",
            "1",
            output_pattern,
        ]
        subprocess.run(
            cmd_encode, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )

    chunks = sorted(glob.glob(os.path.join(output_dir, "chunk_*.mp4")))
    return chunks


def get_video_duration_seconds(video_path: str) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    result = subprocess.run(
        cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    raw = result.stdout.decode("utf-8").strip()
    try:
        return float(raw)
    except ValueError:
        return 0.0
