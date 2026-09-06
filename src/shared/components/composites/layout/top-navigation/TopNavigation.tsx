"use client"
import React, { ReactNode } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useSmartBack } from "@/shared/hooks";

interface IProps {
  children: ReactNode;
  /** Where to land when there's no in-app history to go back to (deep link, shared link, etc). */
  fallbackHref: string;
}

const TopNavigation = ({ children, fallbackHref }: IProps) => {
  const goBack = useSmartBack(fallbackHref);

  return (
    <div className={"fixed z-20 top-0 bg-transparent inset-x-0 justify-center flex"}>
      <div
        className={
          "w-full flex justify-between max-w-[600px] py-4  h-full px-safe-area"
        }
      >
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={goBack}
            aria-label="بازگشت"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-white"
          >
            <ArrowRightIcon size={20} className="text-foreground-inverse" weight="bold" />
          </button>
          {children && (
            <span className="rounded-full bg-surface-white px-3 py-2 text-xs font-bold text-foreground-inverse">
              {children}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
