"use client";

import WalletHeader from "./components/wallet-header/WalletHeader";
import WalletBalanceCard from "./components/wallet-balance-card/WalletBalanceCard";
import WalletQuickActions from "./components/wallet-quick-actions/WalletQuickActions";
import WalletTransactionHistory from "./components/wallet-transaction-history/WalletTransactionHistory";

export default function WalletView() {
  return (
    <div className="flex flex-col gap-6 pb-32 pt-5">
      <WalletHeader />
      <WalletBalanceCard />
      <WalletQuickActions />
      <WalletTransactionHistory />
    </div>
  );
}
