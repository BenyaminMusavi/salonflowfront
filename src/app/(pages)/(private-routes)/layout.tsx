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
          // Dashboard: one 720px column on mobile/tablet, sidebar + content on desktop.
          isDashboard ? "max-w-[720px] lg:max-w-[1040px]" : "max-w-[600px]"
        )}
      >
        {children}
      </div>
    </div>
  );
}
