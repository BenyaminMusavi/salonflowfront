import "./globals.css";
import { Vazirmatn } from "next/font/google";

const font = Vazirmatn({
  subsets: ["arabic"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${font.className} bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}