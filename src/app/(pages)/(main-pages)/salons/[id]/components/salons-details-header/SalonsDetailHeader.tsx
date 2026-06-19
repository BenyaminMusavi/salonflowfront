import React from "react";
import Header from "@/shared/components/composites/layout/header/Header";
import { ArrowRightIcon, UploadSimpleIcon } from "@phosphor-icons/react";

function SalonsDetailHeader() {
  return (
    <Header>
      <div className="flex items-center justify-between w-full">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <ArrowRightIcon size={20} className="text-black" weight="bold" />
        </button>
        <span className="text-base font-bold text-white">جزئیات</span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
        >
          <UploadSimpleIcon size={20} className="text-black" weight="bold" />
        </button>
      </div>
    </Header>
  );
}

export default SalonsDetailHeader;
