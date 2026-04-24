"use client";

import * as React from "react";
import { cn } from "@/shared/utils/className";

interface Step {
  id: number;
  label: string;
  complete?: boolean;
}

export const Stepper = ({
  steps,
  activeStep,
  onStepClick,
  stepContainerClassname,
}: {
  steps: Step[];
  activeStep: number;
  onStepClick: (id: number) => void;
  stepContainerClassname?: string;
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const activeElement = scrollRef.current?.querySelector(
      `[data-id="${activeStep}"]`,
    );

    if (activeElement) {
      const index = steps.findIndex((s) => s.id === activeStep);
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      // 1. First Step: Snap to Start (Right in RTL)
      // 2. Last Step: Snap to End (Left in RTL)
      // 3. Middle Steps: Snap to Center (Centered in screen)
      const align = isFirst ? "start" : isLast ? "end" : "center";

      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: align,
      });
    }
  }, [activeStep, steps]);

  return (
    <div className="w-full py-6" dir="rtl">
      <div ref={scrollRef} className="flex w-full ">
        {/* INNER CONTAINER: Needs 'relative' so the line positions against the full scroll width */}
        <div className="relative flex w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden no-scrollbar ">
          {steps.map((step, index) => {
            const isActive = step.id === activeStep;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.id}
                data-id={step.id}
                onClick={() => onStepClick(step.id)}
                className={cn(
                  "relative z-10 flex flex-col gap-3 cursor-pointer transition-opacity duration-500 min-w-[44%]",
                  !isFirst && !isLast && "min-w-[calc(44%+48px)]",
                  // --- ALIGNMENT & SNAP LOGIC ---

                  // First Item: Align Right (Start), Snap Right
                  isFirst && "items-start snap-start ps-safe-area",

                  // Last Item: Align Left (End), Snap Left
                  isLast && "items-end snap-end pe-safe-area",

                  // Middle Items: Align Center, Snap Center
                  !isFirst && !isLast && "items-center snap-center",
                  stepContainerClassname
                )}
              >
                {/* Circle Container */}
                <div className={"flex w-full items-center"}>
                  {!isFirst && (
                    <div
                      className="flex h-[1px] bg-border-primary z-0 w-full"
                      style={{
                        right: "12px",
                        left: "12px",
                      }}
                    />
                  )}
                  <div className="flex">
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border border-surface-quaternary transition-all duration-300 bg-surface-quaternary",
                        isActive
                          ? "border-content-bold inset-ring-[1px] ring-surface-quaternary"
                          : "",
                      )}
                    >
                      {step.complete && !isActive ? (
                        <svg
                          className="h-3 w-3 text-content-bold"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <div
                          className={cn(
                            "h-[10px] w-[10px] rounded-full bg-content-bold transition-transform",
                          )}
                        />
                      )}
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className="flex h-[1px] bg-border-primary z-0 w-full"
                      style={{
                        right: "12px",
                        left: "12px",
                      }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    isActive
                      ? "text-content-primary font-semibold"
                      : "text-content-secondary font-medium",
                    isFirst
                      ? "text-right"
                      : isLast
                        ? "text-left"
                        : "text-center",
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
