"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { AdminSidebar } from "./_components/AdminSidebar";
import { AdminMobileNav } from "./_components/AdminMobileNav";

function Transferring() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-sm text-foreground-muted">
      <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      در حال بررسی دسترسی…
    </div>
  );
}

export default function AdminLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();

  // Start false so SSR never touches zustand persist (undefined during prerender).
  const [tokenReady, setTokenReady] = useState(false);
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);

  const { data, isSuccess, isError } = useQueryAuthMe({
    enabled: tokenReady && isLoggedIn,
  });

  useEffect(() => {
    const persist = useTokenStore.persist;
    if (!persist) return;

    const unsub = persist.onFinishHydration(() => {
      setTokenReady(true);
    });
    if (persist.hasHydrated()) {
      setTokenReady(true);
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!tokenReady) return;

    if (!isLoggedIn) {
      router.replace(getLoginHref(RouteAddress.ADMIN.BASE));
      return;
    }

    if (!isSuccess && !isError) return;

    if (!data?.data?.isAdmin) {
      router.replace(RouteAddress.HOME.BASE);
    }
  }, [tokenReady, isLoggedIn, isSuccess, isError, data, router]);

  const readyToRender = tokenReady && isLoggedIn && isSuccess && data?.data?.isAdmin;

  if (!readyToRender) {
    return <Transferring />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar pathname={pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <p className="text-sm font-bold text-foreground">پنل مدیریت صفا</p>
          <Link
            href={RouteAddress.HOME.BASE}
            className="flex h-9 items-center gap-1 rounded-full bg-surface px-3 text-xs font-semibold text-foreground-muted"
          >
            <ArrowLeftIcon size={14} />
            بازگشت به اپ
          </Link>
        </header>
        <AdminMobileNav pathname={pathname} />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
