"use client";

import { UserIcon } from "@phosphor-icons/react/ssr";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const PROGRESS = 0.75;
const OFFSET = CIRCUMFERENCE * (1 - PROGRESS);

export default function ProfileAvatar() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="104" height="104" className="-rotate-90">
          <circle
            cx="52"
            cy="52"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-background-tertiary"
          />
          <circle
            cx="52"
            cy="52"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={OFFSET}
            className="text-primary"
          />
        </svg>

        <div className="absolute flex h-[80px] w-[80px] items-center justify-center rounded-full bg-gradient-to-br from-border-strong to-background-elevated">
          <span className="text-[28px] font-bold text-foreground">
            <UserIcon size={32} />
          </span>
        </div>

        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
          75%
        </span>
      </div>

      <h2 className="mt-2 text-[20px] font-bold text-foreground">
        بنیامین موسوی
      </h2>
      <p className="text-[13px] text-foreground-muted">
        BenyaminMoosavi@gmail.com
      </p>
    </div>
  );
}
