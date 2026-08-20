"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/className";

export default function PrivateRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-full min-h-screen",
          isDashboard ? "max-w-[720px]" : "max-w-[600px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
