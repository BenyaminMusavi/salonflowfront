"use client";

import { useRouter } from "next/navigation";
import { useQueryMyWallet, useQueryMyWalletTransactions } from "@/services/domains/wallets/hooks";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { RouteAddress } from "@/shared/data/routeAddress";
import { getLoginHref } from "@/shared/utils/authRedirect";
import { formatToman } from "@/shared/utils/salonDisplay";
import BackHeader from "@/shared/components/composites/layout/back-header/BackHeader";

export default function WalletView() {
  const router = useRouter();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const walletQuery = useQueryMyWallet({ enabled: isLoggedIn });
  const txQuery = useQueryMyWalletTransactions({ enabled: isLoggedIn });
  const wallet = walletQuery.data?.data;
  const txs = txQuery.data?.data ?? [];

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center gap-4 pb-32 pt-5 text-center">
        <BackHeader title="کیف پول من" fallbackHref={RouteAddress.PROFILE.BASE} />
        <p className="px-safe-area text-sm text-foreground-muted">
          برای مشاهده موجودی و تراکنش‌ها وارد حساب کاربری شوید.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push(getLoginHref(RouteAddress.WALLET.BASE));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          ورود
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-24 pt-5">
      <BackHeader title="کیف پول من" fallbackHref={RouteAddress.PROFILE.BASE} />

      <div className="mx-safe-area rounded-2xl bg-gradient-to-br from-primary via-primary-hover to-primary-active p-5">
        <p className="text-xs text-primary-foreground/70">موجودی فعلی</p>
        <p className="mt-1 text-2xl font-bold text-primary-foreground">
          {formatToman(wallet?.balance)} تومان
        </p>
      </div>

      <div className="mx-safe-area rounded-lg bg-surface-secondary p-3">
        <h2 className="mb-2 text-sm font-bold text-foreground">تراکنش‌ها</h2>
        {txQuery.isLoading ? (
          <p className="text-xs text-foreground-muted">در حال دریافت تراکنش‌ها...</p>
        ) : txQuery.isError ? (
          <p className="text-xs text-error">دریافت تراکنش‌ها ناموفق بود.</p>
        ) : (
          <div className="space-y-2">
            {txs.map((tx) => (
              <div key={tx.id} className="rounded-md border border-border p-2">
                <p className="text-sm font-bold text-foreground">
                  {formatToman(tx.amount)} تومان
                </p>
                <p className="text-xs text-foreground-muted">
                  {tx.description || "بدون توضیح"}{" "}
                  {tx.createdAt ? `• ${new Date(tx.createdAt).toLocaleString("fa-IR")}` : ""}
                </p>
              </div>
            ))}
            {txs.length === 0 ? (
              <p className="text-xs text-foreground-muted">تراکنشی ثبت نشده است.</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
