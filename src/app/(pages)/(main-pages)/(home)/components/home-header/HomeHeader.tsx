"use client";
import React from "react";
import Header from "@/shared/components/composites/layout/header/Header";
import { BellIcon, UserIcon } from "@phosphor-icons/react/ssr";
import BusinessSwitcher from "@/shared/components/composites/layout/business-switcher/BusinessSwitcher";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";

function HomeHeader() {
  const { data, isLoading } = useQueryAuthMe();
  console.log(data);
  return (
    <Header>
      <div className={"flex gap-x-2 items-center"}>
        <div
          className={
            "flex justify-center items-center w-12 h-12 rounded-full bg-foreground/5 text-white"
          }
        >
          <UserIcon size={24} />
        </div>
        <div className={"flex flex-col gap-y-1"}>
          <span className={"text-[14px] text-foreground"}>
            {(data?.data.firstName || "") + " " + (data?.data.lastName || "")}
          </span>
          <span className={"text-[12px] text-foreground"}>
            {data?.data.phone}
          </span>
        </div>
      </div>
      <div className={"flex gap-x-3"}>
        <div
          className={
            "flex justify-center items-center w-10 h-10 rounded-full bg-foreground/10 text-white"
          }
        >
          <BellIcon size={24} />
        </div>
        <BusinessSwitcher />
      </div>
    </Header>
  );
}

export default HomeHeader;
