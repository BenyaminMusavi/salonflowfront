import { Suspense } from "react";
import SubscriptionsView from "./SubscriptionsView";

export default function AdminSubscriptionsPage() {
  return (
    <Suspense>
      <SubscriptionsView />
    </Suspense>
  );
}
