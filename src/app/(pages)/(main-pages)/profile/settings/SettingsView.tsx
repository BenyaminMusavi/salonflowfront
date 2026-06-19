"use client";

import SettingsHeader from "./components/settings-header/SettingsHeader";
import SettingsProfileCard from "./components/settings-profile-card/SettingsProfileCard";
import SettingsList from "./components/settings-list/SettingsList";

export default function SettingsView() {
  return (
    <div className="flex flex-col gap-6 pb-32">
      <SettingsHeader />
      <SettingsProfileCard />
      <SettingsList />
    </div>
  );
}
