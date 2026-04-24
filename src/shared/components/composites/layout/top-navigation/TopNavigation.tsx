"use client"
import { ReactNode } from "react";
import { Button } from "@/shared/components/primitives/button/Button";
import { CaretRightIcon, QuestionIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface IProps {
  children: ReactNode;
}

const TopNavigation = ({ children }: IProps) => {
  const router = useRouter();
  return (
    <div className={"fixed top-0 bg-surface-white inset-x-0 justify-center flex"}>
      <div
        className={
          "w-full flex justify-between max-w-[600px] py-4 border-b-2 border-border-tertiary  h-full px-safe-area"
        }
      >
        <div className={"min-w-10 w-10 h-10 flex justify-center items-center"}>
          <Button onClick={() => router.back()} shape={"rounded"} variant={"ghost"} size={"icon"}>
            <CaretRightIcon size={24} />
          </Button>
        </div>
        <div className={"flex items-center justify-center w-full text-[16px] font-medium text-content-bold"}>{children}</div>
        <div className={"min-w-10 w-10 h-10 flex justify-center items-center"}>
          <Button shape={"rounded"} variant={"ghost"} size={"icon"}>
            <QuestionIcon size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
