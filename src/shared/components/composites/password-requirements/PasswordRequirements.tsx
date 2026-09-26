"use client";

import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react";
import { cn } from "@/shared/utils/className";
import { PASSWORD_RULES } from "@/shared/utils/passwordRules";

/** Live checklist under a new-password field: each rule ticks as soon as it's satisfied. */
export function PasswordRequirements({ value }: { value: string | undefined }) {
  const password = value ?? "";
  return (
    <ul className="flex w-full flex-col gap-1 px-2" aria-label="شرایط رمز عبور">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              ok ? "text-success" : "text-foreground-muted"
            )}
          >
            {ok ? (
              <CheckCircleIcon size={14} weight="fill" className="shrink-0" />
            ) : (
              <CircleIcon size={14} className="shrink-0" />
            )}
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
