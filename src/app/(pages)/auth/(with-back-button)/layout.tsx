"use client";
import React from "react";
import { ArrowRight } from "@phosphor-icons/react";
import Hydration from "@/shared/components/Hydration";
import { Button } from "@/shared/components/primitives/button/Button";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Hydration>
      <div
        className={
          "flex justify-center sm:items-center min-h-screen  w-screen px-safe-area"
        }
      >
        <div
          className={
            "flex flex-col rounded-2xl w-full max-w-[500px]"
          }
        >
          <div className={"flex justify-between items-center mt-4 sm:mt-0 mb-10"}>
            <button className="rounded-full p-2 text-foreground hover:bg-surface-tertiary transition-colors">
              <ArrowRight size={20} />
            </button>
            <div />
          </div>
          {children}
        </div>
      </div>
    </Hydration>
  );
};

export default AuthLayout;
