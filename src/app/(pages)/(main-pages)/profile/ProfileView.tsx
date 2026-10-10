"use client";

import ProfileHeader from "./components/profile-header/ProfileHeader";
import ProfileAvatar from "./components/profile-avatar/ProfileAvatar";
import ProfileMenuList from "./components/profile-menu-list/ProfileMenuList";

export default function ProfileView() {
  return (
    <div className="flex flex-col gap-6 pb-32 pt-5">
      <ProfileHeader />
      <ProfileAvatar />
      <ProfileMenuList />
    </div>
  );
}
