import { apiClient } from "@/lib/api-client";

export type FileUploadResult = {
  url: string;
  fileName: string;
};

export async function uploadCatalogImage(file: File): Promise<FileUploadResult> {
  const body = new FormData();
  body.append("file", file);
  return apiClient.post<FileUploadResult>("/api/files/upload?folder=catalog", body);
}
