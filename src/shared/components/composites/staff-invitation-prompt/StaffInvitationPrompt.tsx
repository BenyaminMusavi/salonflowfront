"use client";

import { useState } from "react";
import { useQueryAuthMe } from "@/services/domains/auth/hooks/useQueryAuthMe";
import { useMutateStaffInvitation } from "@/services/domains/salons/hooks/useMutateStaffInvitation";
import { getApiErrorMessage } from "@/services/domains/booking/utils/booking-mappers";
import { Button } from "@/shared/components/primitives/button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/primitives/dialog/Dialog";

/**
 * Global prompt for GET /api/auth/me → pendingStaffInvitations. Mounted app-wide
 * (Providers.tsx) so it surfaces right after OTP login — before switch-context —
 * regardless of which page the user lands on, per guide §1.2/§3.1.
 */
export default function StaffInvitationPrompt() {
  const { data } = useQueryAuthMe();
  const invitations = data?.data?.pendingStaffInvitations ?? [];
  const current = invitations[0];
  const { accept, reject } = useMutateStaffInvitation();
  const [error, setError] = useState("");

  if (!current) return null;

  const isBusy = accept.isPending || reject.isPending;

  const respond = async (action: "accept" | "reject") => {
    setError("");
    const mutate = action === "accept" ? accept.mutateAsync : reject.mutateAsync;
    try {
      await mutate({
        salonPublicId: current.salonPublicId,
        staffPublicId: current.staffPublicId,
      });
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          action === "accept"
            ? "پذیرفتن دعوت ناموفق بود."
            : "رد کردن دعوت ناموفق بود."
        )
      );
    }
  };

  return (
    <Dialog open>
      <DialogContent onClickOverlay={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>دعوت به همکاری</DialogTitle>
          <DialogDescription>
            سالن «{current.salonName}» شما را به‌عنوان پرسنل دعوت کرده است. برای
            نمایش نوبت‌ها و برنامه‌کاری‌تان در این سالن، دعوت را بپذیرید.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-xs font-medium text-error">{error}</p>}

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => void respond("reject")}
            isLoading={reject.isPending}
            disabled={isBusy}
          >
            رد کردن
          </Button>
          <Button
            type="button"
            onClick={() => void respond("accept")}
            isLoading={accept.isPending}
            disabled={isBusy}
          >
            پذیرفتن دعوت
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
