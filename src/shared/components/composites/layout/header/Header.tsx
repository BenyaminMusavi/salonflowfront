"use client";
import { ReactNode } from "react";

interface IProps {
  children: ReactNode;
}

function Header({children}: IProps) {
  return (
    <div className={"fixed top-0 h-20 inset-x-0 justify-center flex"}>
      <div
        className={
          "w-full flex max-w-[600px] border-b-2 border-border-secondary rounded-b-[20px] bg-white h-full px-safe-area"
        }
      >
       {children}
      </div>
    </div>
  );
}

export default Header;
