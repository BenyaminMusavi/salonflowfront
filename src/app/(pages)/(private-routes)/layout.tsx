export default function PrivateRoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-[600px] min-h-screen">{children}</div>
    </div>
  );
}
