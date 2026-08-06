"use client";

import {
  GlobeIcon,
  InstagramLogoIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";

function instagramHref(handle: string): string {
  const cleaned = handle.trim().replace(/^@/, "");
  return `https://instagram.com/${encodeURIComponent(cleaned)}`;
}

function whatsappHref(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}`;
}

interface SalonsDetailSocialStripProps {
  instagramHandle?: string | null;
  whatsappNumber?: string | null;
  websiteUrl?: string | null;
}

export default function SalonsDetailSocialStrip({
  instagramHandle,
  whatsappNumber,
  websiteUrl,
}: SalonsDetailSocialStripProps) {
  const links = [
    instagramHandle?.trim()
      ? {
          key: "instagram",
          href: instagramHref(instagramHandle),
          label: "اینستاگرام",
          Icon: InstagramLogoIcon,
        }
      : null,
    whatsappNumber?.trim()
      ? {
          key: "whatsapp",
          href: whatsappHref(whatsappNumber),
          label: "واتساپ",
          Icon: WhatsappLogoIcon,
        }
      : null,
    websiteUrl?.trim()
      ? {
          key: "website",
          href: websiteUrl.trim(),
          label: "وبسایت",
          Icon: GlobeIcon,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    Icon: typeof InstagramLogoIcon;
  }>;

  if (links.length === 0) return null;

  return (
    <div className="mt-5 flex items-center gap-3 px-safe-area">
      {links.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground transition-colors hover:bg-surface-hover"
        >
          <Icon size={22} weight="fill" />
        </a>
      ))}
    </div>
  );
}
