"use client"
import React, { ReactNode } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  ArrowRightIcon,
  CaretRightIcon,
  QuestionIcon,
  ShareNetworkIcon,
  UploadSimpleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface IProps {
  children: ReactNode;
}

const TopNavigation = ({ children }: IProps) => {
  const router = useRouter();
  return (
    <div className={"fixed z-20 top-0 bg-surface-white inset-x-0 justify-center flex"}>
      <div
        className={
          "w-full flex justify-between max-w-[600px] py-4  h-full px-safe-area"
        }
      >
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ArrowRightIcon size={20} className="text-black" weight="bold" />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
          >
            <ShareNetworkIcon size={20} className="text-black" weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
