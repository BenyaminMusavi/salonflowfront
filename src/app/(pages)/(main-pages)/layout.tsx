import BottomNavigation from "@/shared/components/composites/layout/bottom-navigation/BottomNavigation";
import LocationPreferenceSync from "@/shared/components/composites/user-location/LocationPreferenceSync";

export default function MainPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className={"w-full max-w-[600px]"}>
        {children}
        <LocationPreferenceSync />
        <BottomNavigation />
      </div>
    </div>
  );
}
