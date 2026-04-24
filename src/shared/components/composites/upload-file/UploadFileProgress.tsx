"use client";

import * as React from "react";
import { XCircleIcon} from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";

interface IUploadFileProgressProps {
  fileName: string;
  progress: number;
  onCancel: () => void;
}

const UploadFileProgress = ({
  fileName,
  progress,
  onCancel,
}: IUploadFileProgressProps) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[16px] font-medium text-content-primary truncate">{fileName}</span>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-4 overflow-hidden rounded-full bg-surface-secondary">
          <div
            className="h-full rounded-full bg-surface-success-fill transition-all duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-xs font-medium text-content-primary">
          {Math.min(progress, 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-auto px-2 py-1 text-xs text-content-bold hover:text-content-error"
          type="button"
        >
          <XCircleIcon size={20} />
        </Button>
      </div>
    </div>
  );
};

export default UploadFileProgress;
