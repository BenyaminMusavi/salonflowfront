"use client";

import * as React from "react";
import {
  FilePdfIcon,
  XIcon,
  DownloadIcon,
  ImageIcon,
  TrashIcon,
  CheckCircleIcon, InfoIcon,
} from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { Button } from "@/shared/components/primitives/button/Button";
import UploadFileButton from "./UploadFileButton";
import UploadFileProgress from "./UploadFileProgress";
import { Badge } from "@/shared/components/primitives/badge/Badge";

interface IUploadFileProps {
  title: string;
  description?: string;
  buttonText?: string;
  accept?: string;
  onUpload: (file: File) => Promise<void>;
  onProgress?: (progress: number) => void;
  uploadedUrl?: string;
  uploadedFileName?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onDelete?: () => void;
  hint?: string;
  isRequired?: boolean;
}

const UploadFile = ({
  title,
  description,
  buttonText = "Upload File",
  accept = "image/*,.pdf",
  onUpload,
  onProgress,
  uploadedUrl,
  uploadedFileName,
  error,
  disabled = false,
  className,
  onDelete,
  hint,
                      isRequired
}: IUploadFileProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFileName, setSelectedFileName] = React.useState<string>("");
  const [localError, setLocalError] = React.useState<string | undefined>();

  const handleFileSelect = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError(undefined);
    setSelectedFileName(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          const newProgress = prev + 10;
          onProgress?.(newProgress);
          return newProgress;
        });
      }, 100);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      onProgress?.(100);
    } catch (err) {
      console.log(err);
      setLocalError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setSelectedFileName("");
      }, 500);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setSelectedFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isImage =
    (uploadedUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(uploadedUrl)) ||
    (uploadedFileName &&
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(uploadedFileName));
  const isPdf =
    (uploadedUrl && /\.pdf$/i.test(uploadedUrl)) ||
    (uploadedFileName && /\.pdf$/i.test(uploadedFileName));
  const displayError = error || localError;
  const showUploaded = uploadedUrl || uploadedFileName;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border rounded-[2px] border-dashed w-full p-4",
        displayError
          ? "border-border-error"
          : isUploading
            ? "border-border-success"
            : showUploaded
              ? "border-border-bold"
              : "border-border-primary",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <div className={"flex items-center gap-x-1"}>
          <h3 className="text-sm font-medium text-content-primary">{title}</h3>
          {isRequired &&
            <Badge variant={"error"} kind={"fill"}>
              اجباری
            </Badge>
          }
        </div>
        {description && (
          <p className="text-xs text-content-secondary">{description}</p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {isUploading ? (
        <UploadFileProgress
          fileName={selectedFileName}
          progress={uploadProgress}
          onCancel={handleCancelUpload}
        />
      ) : showUploaded ? (
        <div className="flex items-center gap-3">
          <div>
            {isImage ? (
              <ImageIcon size={24} className="text-content-bold" />
            ) : isPdf ? (
              <FilePdfIcon size={24} className="text-content-bold" />
            ) : (
              <CheckCircleIcon
                size={24}
                className="text-content-success"
                weight="fill"
              />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1 overflow-hidden">
            <span className="truncate text-sm text-content-primary">
              {uploadedFileName || "Uploaded file"}
            </span>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-auto px-2 py-1"
              type="button"
            >
              <TrashIcon size={24} className="text-content-bold" />
            </Button>
          )}
        </div>
      ) : (
        <UploadFileButton
          buttonText={buttonText}
          onClick={handleFileSelect}
          disabled={disabled}
        />
      )}

      {hint && (
        <div className={"flex gap-x-1"}>
          <InfoIcon size={12} />
          <span className={"text-[10px] text-content-quaternary"}>{hint}</span>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-content-error">{displayError}</p>
      )}
    </div>
  );
};

export default UploadFile;
