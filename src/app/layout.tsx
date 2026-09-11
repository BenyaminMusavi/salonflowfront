import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Saffa | بدون صف، با صفا",
  description: "رزرو آنلاین نوبت سالن‌های زیبایی، بدون صف و بدون تماس تلفنی.",
  appleWebApp: {
    capable: true,
    title: "Saffa",
    statusBarStyle: "black-translucent",
  },
  other: {
    enamad: "9999723",
  },
};

export const viewport: Viewport = {
  themeColor: "#4fa39a",
};

const ravi = localFont({
  src: [
    {
      path: "../shared/assets/fonts/ravi_normal.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/ravi_bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/ravi_medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/ravi_semibold.woff",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-ravi",
  display: "swap",
});

const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = JSON.parse(localStorage.getItem("salon_flow_theme_state"));
    var theme = stored && stored.state && stored.state.theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
  } catch (e) {
    document.documentElement.dataset.theme = "light";
  }
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir={"rtl"}
      className={`${ravi.variable} font-sans`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        {children}
      </body>
    </html>
  );
}
