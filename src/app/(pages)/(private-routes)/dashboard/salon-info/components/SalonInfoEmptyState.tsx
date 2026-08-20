"use client";

import Link from "next/link";
import { Button } from "@/shared/components/primitives/button/Button";
import { RouteAddress } from "@/shared/data/routeAddress";

interface SalonInfoEmptyStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  showOnboardingCta?: boolean;
}

export default function SalonInfoEmptyState({
  title,
  description,
  onRetry,
  isRetrying = false,
  showOnboardingCta = true,
}: SalonInfoEmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4 text-center">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-xs leading-6 text-foreground-muted">{description}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {onRetry && (
          <Button
            type="button"
            variant="secondary"
            onClick={onRetry}
            isLoading={isRetrying}
            className="w-full sm:w-auto"
          >
            تلاش مجدد
          </Button>
        )}
        {showOnboardingCta && (
          <Link
            href={RouteAddress.ONBOARDING.BASE}
            className="inline-flex h-12 w-full items-center justify-center rounded-[2px] bg-primary px-4 text-sm font-medium text-primary-foreground sm:w-auto"
          >
            تکمیل ثبت‌نام سالن
          </Link>
        )}
      </div>
    </div>
  );
}
