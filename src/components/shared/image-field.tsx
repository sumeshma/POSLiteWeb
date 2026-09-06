"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveMediaUrl } from "@/lib/media";
import { getErrorMessage } from "@/types/api";
import { uploadCatalogImage, type FileUploadResult } from "@/services/files.service";

type ImageFieldProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  uploadFile?: (file: File) => Promise<FileUploadResult>;
};

export function ImageField({ value, onChange, disabled, uploadFile }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const preview = resolveMediaUrl(value);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setUploading(true);
    try {
      const result = await (uploadFile ?? uploadCatalogImage)(file);
      onChange(result.url);
    } catch (error) {
      toast.error(getErrorMessage(error) || "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-16 w-16 rounded-md object-cover ring-1 ring-border"
        />
      ) : null}
      <Input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
        placeholder="Image URL (optional)"
        disabled={disabled || uploading}
      />
      <div className="flex items-center gap-2">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={disabled || uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            void handleFile(file);
            event.target.value = "";
          }}
        />
        {value ? (
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            onClick={() => onChange(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>
    </div>
  );
}
