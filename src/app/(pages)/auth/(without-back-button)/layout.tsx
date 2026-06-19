"use client";
import React from "react";
import Hydration from "@/shared/components/Hydration";

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
            <div></div>
            {/*<IconLogoFull className={"w-[220px]"} />*/}
          </div>
          {children}
        </div>
      </div>
    </Hydration>
  );
};

export default AuthLayout;
