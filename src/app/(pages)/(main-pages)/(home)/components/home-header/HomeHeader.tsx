import React from "react";
import Header from "@/shared/components/composites/layout/header/Header";
import { BellIcon, PlusIcon, UserIcon } from "@phosphor-icons/react/ssr";

function HomeHeader() {
  return (
    <Header>
      <div className={"flex gap-x-2 items-center"}>
        <div className={"flex justify-center items-center w-12 h-12 rounded-full bg-foreground/5 text-white"}>
          <UserIcon size={24} />
        </div>
        <div className={"flex flex-col gap-y-1"}>
          <span className={"text-[14px] text-foreground"}>بنیامین</span>
          <span className={"text-[14px] text-foreground"}>۰۹۱۸۷۴۵۲۵۷۵</span>
        </div>
      </div>
      <div className={"flex gap-x-3"}>
        <div className={"flex justify-center items-center w-10 h-10 rounded-full bg-foreground/10 text-white"}>
          <BellIcon size={24} />
        </div>
        <div className={"flex bg-primary justify-center items-center w-10 h-10 rounded-full"}>
          <PlusIcon size={24} />
        </div>
      </div>
    </Header>
  );
}

export default HomeHeader;