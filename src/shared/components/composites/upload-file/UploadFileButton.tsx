"use client";

import * as React from "react";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { Button } from "@/shared/components/primitives/button/Button";

interface IUploadFileButtonProps {
  buttonText: string;
  onClick: () => void;
  disabled?: boolean;
}

const UploadFileButton = ({
  buttonText,
  onClick,
  disabled = false,
}: IUploadFileButtonProps) => {
  return (
    <Button
      variant="default"
      size="default"
      onClick={onClick}
      disabled={disabled}
      className="w-full gap-x-1"
      type="button"
    >
      {buttonText}
      <UploadSimpleIcon className="mr-2 h-4 w-4" weight="bold" />
    </Button>
  );
};

export default UploadFileButton;
