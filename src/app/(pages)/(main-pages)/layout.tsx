import BottomNavigation from "@/shared/components/composites/layout/bottom-navigation/BottomNavigation";

export default function MainPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className={"w-full max-w-[600px]"}>
        {children}
        <BottomNavigation />
      </div>
    </div>
  );
}
