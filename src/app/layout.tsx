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
  // The page draws both themes itself (data-theme); this tells browsers' forced dark mode not to re-colour it.
  colorScheme: "light dark",
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
  var collapsed = false;
  function render() {
    if (!document.body) { return; }
    if (!box) {
      box = document.createElement("pre");
      box.style.cssText = "position:fixed;left:0;right:0;bottom:0;max-height:40%;overflow:auto;margin:0;padding:8px 8px max(8px,env(safe-area-inset-bottom));background:#400;color:#fff;font:11px/1.4 monospace;z-index:2147483647;white-space:pre-wrap;word-break:break-all;direction:ltr;text-align:left";
      box.addEventListener("click", function () { collapsed = !collapsed; render(); });
      document.body.appendChild(box);
    }
    var head = (collapsed ? "[+] debug (tap to expand)" : "[-] debug (tap to collapse)") + " errors:" + lines.length;
    box.textContent = collapsed ? head : [head].concat(info, lines.slice(-8)).join("\\n");
  }
  var info = [];
  /* Never show query strings, fragments or long digit runs (phone numbers) from URLs. */
  function clean(u) {
    try { return String(u).split("#")[0].split("?")[0].replace(/\\d{7,}/g, "..."); } catch (e) { return "?"; }
  }
  function safe(fn) { try { return fn(); } catch (e) { return "err"; } }
  function sup(p, v) { return safe(function () { return window.CSS && CSS.supports ? CSS.supports(p, v) : "n/a"; }); }
  /* Device facts for layout bugs (viewport / display scale / fonts / forced dark): shown above the errors. */
  function collect() {
    var d = document.documentElement, b = document.body, vv = window.visualViewport;
    var cs = getComputedStyle(d), bs = b ? getComputedStyle(b) : cs;
    var faces = [];
    safe(function () {
      document.fonts.forEach(function (f) {
        if (/ravi|latin-digits/.test(f.family)) faces.push(f.family.replace(/"/g, "") + " " + f.weight + ":" + f.status);
      });
    });
    info = [
      "vp " + innerWidth + "x" + innerHeight + " screen " + screen.width + "x" + screen.height + " dpr " + devicePixelRatio,
      "vv " + (vv ? Math.round(vv.width) + "x" + Math.round(vv.height) + " scale " + vv.scale : "n/a") + " clientW " + d.clientWidth + " scrollW " + d.scrollWidth,
      "root font " + cs.fontSize + " body font " + bs.fontSize + " ff " + String(bs.fontFamily).slice(0, 70),
      "fonts " + (faces.join(", ") || "none listed"),
      "supports color-mix " + sup("color", "color-mix(in srgb, red 50%, blue)") + " oklab-gradient " + sup("background-image", "linear-gradient(in oklab, red, blue)") + " dvh " + sup("height", "1dvh"),
      "prefers-dark " + safe(function () { return matchMedia("(prefers-color-scheme: dark)").matches; }) + " theme " + d.getAttribute("data-theme") + " scheme " + cs.colorScheme + " bodyBg " + bs.backgroundColor,
      "UA " + navigator.userAgent
    ];
    render();
  }
  function add(s) { lines.push(s); render(); }
  window.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) add("LOAD FAIL: " + clean(t.src || t.href));
    else add("ERR: " + e.message + " @" + clean(String(e.filename || "").split("/").pop()) + ":" + e.lineno + ":" + e.colno);
  }, true);
  window.addEventListener("unhandledrejection", function (e) {
    var r = e.reason;
    add("REJECT: " + (r && (r.message || r.toString()) || r) + (r && r.config ? " [" + clean(r.config.url) + "]" : ""));
  });
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) {
    var x = this;
    x.addEventListener("loadend", function () { if (!x.status || x.status >= 400) add("HTTP " + x.status + " " + m + " " + clean(u)); });
    return open.apply(this, arguments);
  };
  render();
  document.addEventListener("DOMContentLoaded", collect);
  window.addEventListener("load", collect);
  safe(function () { document.fonts.ready.then(collect); });
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
