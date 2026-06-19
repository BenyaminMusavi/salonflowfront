"use client";

import React, { useEffect, Suspense } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
//
// import imgCarbonShape from "@/shared/assets/images/realistic_carbon_shape.png";
// import iconLogoFullHorizontal from "@/shared/assets/logos/ic_logo_full-h.png";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useCookiesNext } from "cookies-next";
import {saveAuthCallback} from "@/shared/utils/authRedirect";

interface IProps {
  children: React.ReactNode;
}

function AuthCallbackHandler() {
  const searchParams = useSearchParams();
  const callback = searchParams.get("callback");

  useEffect(() => {
    if (!callback) return;
    saveAuthCallback(callback);
  }, [callback]);

  return null;
}

function AuthLayout({ children }: IProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === RouteAddress.HOME.BASE;

  const { getCookie } = useCookiesNext();
  const accessToken = getCookie("accessToken");

  const isLogoutPage = pathname === RouteAddress.AUTH.LOGOUT.BASE;

  // useEffect(() => {
  //   if (pathname) {
  //     if (isLogoutPage) return;
  //     if (accessToken) {
  //       router.replace(RouteAddress.HOME.BASE);
  //     }
  //   }
  // }, [accessToken, isLogoutPage, pathname]);

  return (
    <div className="flex flex-col items-center h-dvh scroll-smooth relative overflow-hidden">

      <Suspense fallback={null}>
        <AuthCallbackHandler />
      </Suspense>
            {children}
    </div>
  );
}

export default AuthLayout;