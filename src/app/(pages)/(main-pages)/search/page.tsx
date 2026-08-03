import { Suspense } from "react";
import SearchView from "@/app/(pages)/(main-pages)/search/SearchView";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-foreground-muted">
          در حال بارگذاری…
        </div>
      }
    >
      <SearchView />
    </Suspense>
  );
}
