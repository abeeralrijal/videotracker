import { apiFetch } from "@/lib/api/client";

export type UploadResponse = {
  video_id: string;
  filename: string;
  use_case: string;
  status: string;
};

export async function uploadVideo(
  file: File,
  useCase?: string
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  if (useCase) {
    form.append("use_case", useCase);
  }

  const res = await apiFetch<UploadResponse>("/api/upload", {
    method: "POST",
    body: form,
  });

  return res;
}

export async function startMonitoring(videoId: string): Promise<{ status: string; video_id: string }> {
  return apiFetch<{ status: string; video_id: string }>("/api/start-monitoring", {
    method: "POST",
    body: JSON.stringify({ video_id: videoId }),
  });
}
