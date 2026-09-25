import type { Metadata } from "next";
import SalonsDetailView from "../../salons/[id]/SalonsDetailView";
import { API_ADDRESS } from "@/services/common/apiAddress";
import type { ISalon } from "@/services/domains/salons/types/salon.type";
import { salonImageSrc } from "@/shared/utils/salonDisplay";

type Props = { params: Promise<{ username: string }> };

function decodeUsername(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Link previews (Telegram/WhatsApp/Instagram) come from these server-rendered tags — the page
 * itself is client-rendered. Any failure (404, API down) falls back to the root metadata.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeUsername((await params).username);
  const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
  if (!apiDomain) return {};

  try {
    const res = await fetch(`${apiDomain}${API_ADDRESS.SALON.BY_USERNAME(username)}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return {};
    const salon = ((await res.json()) as { data?: ISalon }).data;
    if (!salon?.name) return {};

    const title = `${salon.name} | Saffa`;
    const description =
      salon.description?.trim().slice(0, 160) ||
      `رزرو آنلاین نوبت در ${salon.name}، بدون صف و بدون تماس تلفنی.`;
    const image = salonImageSrc(salon.coverImageUrl || salon.imageUrl, "");

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        ...(image ? { images: [image] } : {}),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return {};
  }
}

/** Public share link of a salon. Every API call on the page still uses the salon's Guid. */
export default async function SalonByUsernamePage({ params }: Props) {
  const username = decodeUsername((await params).username);
  return <SalonsDetailView source={{ username }} />;
}
