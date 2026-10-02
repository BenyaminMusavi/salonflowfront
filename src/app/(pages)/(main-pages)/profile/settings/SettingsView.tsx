"use client";

import SettingsHeader from "./components/settings-header/SettingsHeader";
import SettingsList from "./components/settings-list/SettingsList";

/** «حساب من» — shared by the customer app (profile) and the salon panel (account menu). */
export default function SettingsView() {
  return (
    <div className="flex flex-col gap-6 pb-32">
      <SettingsHeader />
      <SettingsList />
    </div>
  );
}
