"use client";

import { useEffect, useRef, useState } from "react";
import { RouteAddress } from "@/shared/data/routeAddress";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { useOnboardingDraftStore } from "@/services/domains/salons/store/useOnboardingDraftStore";
import { useQuerySalonById } from "@/services/domains/salons/hooks/useQuerySalonById";
import { useMutateSalonBasicInfo } from "@/services/domains/salons/hooks/useMutateSalonBasicInfo";
import {
  getApiErrorMessage,
  getApiFieldErrorMessage,
} from "@/services/domains/booking/utils/booking-mappers";
import {
  DashboardPage,
  DashboardPageHeader,
  DashboardToast,
  type DashboardToastState,
} from "../../_components";
import { SaveBar } from "../../_components/SaveBar";
import SalonStatusBanner from "../../salon-info/components/SalonStatusBanner";
import SalonInfoSkeleton from "../../salon-info/components/SalonInfoSkeleton";
import SalonInfoEmptyState from "../../salon-info/components/SalonInfoEmptyState";
import BasicInfoSection, {
  type BasicInfoValues,
} from "../../salon-info/components/sections/BasicInfoSection";
import ContactSocialSection, {
  type ContactSocialValues,
} from "../../salon-info/components/sections/ContactSocialSection";
import {
  mapSalonToBasicInfo,
  mapSalonToContactInfo,
} from "../../salon-info/utils/mapSalonToForm";

type Form = { basic: BasicInfoValues; contact: ContactSocialValues };

const sameForm = (a: Form | null, b: Form | null) => JSON.stringify(a) === JSON.stringify(b);

/** «اطلاعات و تماس» — name, public address, description and contact channels, saved together. */
export default function SalonProfileView() {
  const salonPublicId = useSalonContextStore((s) => s.salonPublicId);
  const salonQuery = useQuerySalonById(salonPublicId || undefined);
  const salon = salonQuery.data?.data;
  const save = useMutateSalonBasicInfo();
  const draftSalonPublicId = useOnboardingDraftStore((s) => s.salonPublicId);
  const draftSubmitted = useOnboardingDraftStore((s) => s.submitted);
  const draftStep = useOnboardingDraftStore((s) => s.step);
  const setDraftBasicInfo = useOnboardingDraftStore((s) => s.setBasicInfo);
  const isIncompleteDraft =
    !!salonPublicId && draftSalonPublicId === salonPublicId && !draftSubmitted && draftStep < 7;

  const [form, setForm] = useState<Form | null>(null);
  const baseline = useRef<Form | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [usernameServerError, setUsernameServerError] = useState("");
  const [toast, setToast] = useState<DashboardToastState>(null);

  useEffect(() => {
    if (!salon || baseline.current) return;
    const next = { basic: mapSalonToBasicInfo(salon), contact: mapSalonToContactInfo(salon) };
    baseline.current = next;
    setForm(next);
  }, [salon]);

  const dirty = !!form && !sameForm(form, baseline.current);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const onSave = async () => {
    if (!form || !salonPublicId) return;
    setSubmitted(true);
    const name = form.basic.name.trim();
    const username = form.basic.username.trim();
    if (!name || !username) {
      setToast({ type: "error", message: "نام و آدرس اختصاصی سالن الزامی است." });
      return;
    }
    const contact = {
      instagramHandle: form.contact.instagramHandle.trim(),
      whatsappNumber: form.contact.whatsappNumber.trim(),
      websiteUrl: form.contact.websiteUrl.trim(),
    };
    try {
      await save.mutateAsync({
        publicId: salonPublicId,
        name,
        username,
        description: form.basic.description.trim() || null,
        instagramHandle: contact.instagramHandle || null,
        whatsappNumber: contact.whatsappNumber || null,
        websiteUrl: contact.websiteUrl || null,
      });
      setDraftBasicInfo({ name, username, description: form.basic.description.trim(), ...contact });
      // Keep the panel header in sync with a renamed salon.
      useSalonContextStore.setState({ salonName: name });
      baseline.current = form;
      setSubmitted(false);
      setUsernameServerError("");
      setToast({ type: "success", message: "اطلاعات سالن ذخیره شد." });
    } catch (err) {
      // A username error means nothing was saved; every typed value stays.
      const usernameError = getApiFieldErrorMessage(err, "username");
      if (usernameError) setUsernameServerError(usernameError);
      setToast({
        type: "error",
        message: usernameError
          ? "آدرس اختصاصی را اصلاح کنید؛ هیچ تغییری ذخیره نشد."
          : getApiErrorMessage(err, "ذخیره‌ی اطلاعات سالن ناموفق بود."),
      });
    }
  };

  return (
    <DashboardPage className="gap-5">
      <DashboardPageHeader title="اطلاعات و تماس" backHref={RouteAddress.DASHBOARD.SALON} />

      {!salonPublicId ? (
        <SalonInfoEmptyState
          title="سالن فعالی انتخاب نشده"
          description="ابتدا ثبت سالن را تکمیل کنید."
          showOnboardingCta
        />
      ) : salonQuery.isLoading && !salon ? (
        <SalonInfoSkeleton />
      ) : !salon ? (
        <SalonInfoEmptyState
          title="اطلاعات سالن در دسترس نیست"
          description={getApiErrorMessage(salonQuery.error, "دریافت اطلاعات سالن ناموفق بود.")}
          onRetry={() => void salonQuery.refetch()}
          isRetrying={salonQuery.isFetching}
          showOnboardingCta
        />
      ) : form ? (
        <>
          <SalonStatusBanner
            show={isIncompleteDraft}
            approvalStatus={salon.approvalStatus}
            rejectionReason={salon.rejectionReason}
            salonPublicId={salonPublicId}
            onToast={setToast}
          />
          <section className="flex flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
            <BasicInfoSection
              values={form.basic}
              onChange={(basic) => {
                if (basic.username !== form.basic.username) setUsernameServerError("");
                setForm({ ...form, basic });
              }}
              nameError={submitted && !form.basic.name.trim() ? "نام سالن الزامی است." : undefined}
              salonPublicId={salonPublicId}
              savedUsername={salon.username}
              usernameError={
                usernameServerError ||
                (submitted && !form.basic.username.trim() ? "آدرس اختصاصی سالن الزامی است." : undefined)
              }
              // Backend rule: after approval at most 2 changes; an old address stops working.
              usernameNote="بعد از تأیید سالن فقط 2 بار می‌توانید آدرس را تغییر دهید. با تغییر آدرس، لینک قبلی دیگر کار نمی‌کند."
            />
          </section>
          <section className="flex flex-col gap-3 rounded-[16px] bg-background-secondary p-4">
            <ContactSocialSection values={form.contact} onChange={(contact) => setForm({ ...form, contact })} />
          </section>
          {dirty ? (
            <SaveBar
              isSaving={save.isPending}
              onSave={() => void onSave()}
              onDiscard={() => {
                setForm(baseline.current);
                setSubmitted(false);
                setUsernameServerError("");
              }}
            />
          ) : null}
        </>
      ) : null}

      <DashboardToast toast={toast} onDismiss={() => setToast(null)} />
    </DashboardPage>
  );
}
