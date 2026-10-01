"use client";

import { useState } from "react";
import {
  CalendarDotsIcon,
  CheckIcon,
  CrownIcon,
  EyeIcon,
  QrCodeIcon,
  ScissorsIcon,
  ShareNetworkIcon,
  StorefrontIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import BottomSheet from "@/shared/components/composites/bottom-sheet/BottomSheet";
import SalonLinkCard from "@/shared/components/composites/salon-share/SalonLinkCard";
import { shareOrCopyLink, useSalonShareLink } from "@/shared/utils/salonShareLink";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useQueryStaffRoster } from "@/services/domains/salons/hooks/useQueryStaffRoster";
import { useQueryCatalogOfferings } from "@/services/domains/catalog/hooks";
import { SalonApprovalStatus } from "@/services/common/enums/domain-enums";
import { RouteAddress } from "@/shared/data/routeAddress";
import { APP_LOCALE } from "@/shared/utils/locale";
import { DashboardPage, DashboardPageHeader } from "../_components";
import { PanelListGroup, PanelListRow } from "../_components/PanelList";

/** Compact salon card: name, public link, copy/share — the full QR card opens in a sheet. */
function SalonIdentity({
  username,
  salonName,
  isApproved,
}: {
  username: string | null | undefined;
  salonName: string;
  isApproved: boolean;
}) {
  const { url, display } = useSalonShareLink(username);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    try {
      const outcome = await shareOrCopyLink({
        url,
        title: salonName,
        text: `${salonName} را در صفا ببینید و آنلاین نوبت بگیرید:`,
      });
      if (outcome === "copied") {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* clipboard blocked — the QR sheet still offers the link */
    }
  };

  const iconButton =
    "flex h-10 w-10 items-center justify-center rounded-full bg-surface-hover text-foreground";

  return (
    <div className="flex items-center gap-3 rounded-[16px] bg-background-secondary p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-brand text-lg font-bold text-content-brand">
        {salonName.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-foreground">{salonName}</p>
        <p className="truncate text-xs text-foreground-muted" dir="ltr">
          {display || (isApproved ? "" : "بعد از تأیید سالن فعال می‌شود")}
        </p>
      </div>
      {url ? (
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => void onShare()} className={iconButton} aria-label="اشتراک یا کپی لینک">
            {copied ? <CheckIcon size={18} className="text-primary" /> : <ShareNetworkIcon size={18} />}
          </button>
          <button type="button" onClick={() => setQrOpen(true)} className={iconButton} aria-label="کد QR سالن">
            <QrCodeIcon size={18} />
          </button>
        </div>
      ) : null}
      <BottomSheet open={qrOpen} onClose={() => setQrOpen(false)}>
        <SalonLinkCard username={username} salonName={salonName} isApproved={isApproved} />
      </BottomSheet>
    </div>
  );
}

function countHint(count: number | undefined, unit: string): string | undefined {
  return count == null ? undefined : `${count.toLocaleString(APP_LOCALE)} ${unit}`;
}

/** «سالن» hub — every setup page of the salon in one short list, so the bottom nav stays about daily work. */
export default function SalonHubView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salon = useQuerySalonById(salonPublicId || undefined).data?.data;
  const roster = useQueryStaffRoster(salonPublicId || undefined).data?.data;
  const offerings = useQueryCatalogOfferings(true).data?.data;
  const D = RouteAddress.DASHBOARD;
  const isApproved = salon?.approvalStatus === SalonApprovalStatus.Approved;

  return (
    <DashboardPage className="gap-6">
      <DashboardPageHeader title="سالن" />

      {salon ? (
        <SalonIdentity username={salon.username} salonName={salon.name} isApproved={isApproved} />
      ) : null}

      <PanelListGroup title="کسب‌وکار">
        <PanelListRow
          href={D.STAFF}
          icon={UsersIcon}
          label="پرسنل"
          hint={countHint(roster?.length, "نفر")}
        />
        <PanelListRow
          href={D.CATALOG}
          icon={ScissorsIcon}
          label="خدمات"
          hint={countHint(offerings?.length, "خدمت")}
        />
        <PanelListRow href={D.SCHEDULES} icon={CalendarDotsIcon} label="برنامه‌ی کاری پرسنل" />
      </PanelListGroup>

      <PanelListGroup title="صفحه‌ی سالن">
        <PanelListRow
          href={D.SALON_INFO}
          icon={StorefrontIcon}
          label="اطلاعات، عکس‌ها و شعبه‌ها"
          hint={countHint(salon?.branches?.length, "شعبه")}
        />
        {isApproved && salon?.username ? (
          <PanelListRow
            href={RouteAddress.SALONS.BY_USERNAME(salon.username)}
            icon={EyeIcon}
            label="دیدن صفحه‌ی سالن مثل مشتری"
            external
          />
        ) : null}
      </PanelListGroup>

      <PanelListGroup title="حساب سالن">
        <PanelListRow href={RouteAddress.SUBSCRIPTIONS.BASE} icon={CrownIcon} label="اشتراک" />
      </PanelListGroup>
    </DashboardPage>
  );
}
