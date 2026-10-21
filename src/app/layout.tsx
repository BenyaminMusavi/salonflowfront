import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "@/shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Saffa | بدون صف، با صفا",
  description: "رزرو آنلاین نوبت در سالن‌های زیبایی و پیرایش، بدون صف و بدون تماس تلفنی.",
  appleWebApp: {
    capable: true,
    title: "Saffa",
    statusBarStyle: "default",
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

/**
 * On-device error panel for phones without a web inspector (old iPhones). Off for everyone
 * unless the URL has `?debug=1` (remembered for the tab); plain ES5 so it runs on any browser.
 */
const DEBUG_PANEL_SCRIPT = `(function () {
  try {
    if (/[?&]debug=1/.test(location.search)) sessionStorage.setItem("saffa_debug", "1");
    if (sessionStorage.getItem("saffa_debug") !== "1") return;
  } catch (e) { return; }
  var lines = [];
  var box;
  function render() {
    if (!document.body) { return; }
    if (!box) {
      box = document.createElement("pre");
      box.style.cssText = "position:fixed;left:0;right:0;bottom:0;max-height:45%;overflow:auto;margin:0;padding:8px;background:#400;color:#fff;font:11px/1.4 monospace;z-index:2147483647;white-space:pre-wrap;direction:ltr;text-align:left";
      document.body.appendChild(box);
    }
    box.textContent = lines.slice(-12).join("\\n");
  }
  function add(s) { lines.push(s); render(); }
  window.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) add("LOAD FAIL: " + (t.src || t.href));
    else add("ERR: " + e.message + " @" + String(e.filename || "").split("/").pop() + ":" + e.lineno + ":" + e.colno);
  }, true);
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    add("REJECT: " + (r && (r.message || r.toString()) || r) + (r && r.config ? " [" + r.config.url + "]" : ""));
  });
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    var x = this;
    x.addEventListener("loadend", function () { if (!x.status || x.status >= 400) add("HTTP " + x.status + " " + m + " " + u); });
    return open.apply(this, arguments);
  };
  add("debug on · UA: " + navigator.userAgent);
  document.addEventListener("DOMContentLoaded", render);
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
        <script dangerouslySetInnerHTML={{ __html: DEBUG_PANEL_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background">
        {children}
      </body>
    </html>
  );
}
