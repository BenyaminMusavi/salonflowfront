"use client";

import { useState } from "react";
import SearchHeader from "./components/search-header/SearchHeader";
import SearchHero from "./components/search-hero/SearchHero";
import SearchCategories from "./components/search-categories/SearchCategories";
import SearchSegmentedToggle from "./components/search-segmented-toggle/SearchSegmentedToggle";
import SearchCardGrid from "./components/search-card-grid/SearchCardGrid";

export default function SearchView() {
  const [activeTab, setActiveTab] = useState<"new" | "recommended">("new");

  return (
    <div className="flex flex-col gap-5 pt-20 pb-32">
      <SearchHeader />
      <SearchHero />
      <SearchCategories />
      <SearchSegmentedToggle activeTab={activeTab} onTabChange={setActiveTab} />
      <SearchCardGrid />
    </div>
  );
}
