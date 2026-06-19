"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface IProps {
  activeTab: "new" | "recommended";
  onTabChange: (tab: "new" | "recommended") => void;
}

const tabs = [
  { id: "new", label: "جدید در سالن فلو" },
  { id: "recommended", label: "پیشنهادی" },
] as const;

export default function SearchSegmentedToggle({
                                                activeTab,
                                                onTabChange,
                                              }: IProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
  });

  useEffect(() => {
    const updateIndicator = () => {
      const container = containerRef.current;
      const activeIndex = tabs.findIndex((t) => t.id === activeTab);
      const button = buttonRefs.current[activeIndex];

      if (!container || !button) return;

      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      setIndicator({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    };

    updateIndicator();

    const observer = new ResizeObserver(updateIndicator);

    if (containerRef.current) observer.observe(containerRef.current);

    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="mx-safe-area relative flex rounded-full bg-background-secondary p-1"
    >
      <motion.div
        className="absolute top-1 bottom-1 rounded-full bg-primary"
        animate={{
          left: indicator.left,
          width: indicator.width,
        }}
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 36,
        }}
      />

      {tabs.map((tab, index) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            onClick={() => onTabChange(tab.id)}
            className="relative z-10 flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-colors"
          >
            <motion.span
              animate={{
                color: active
                  ? "var(--color-primary-foreground)"
                  : "var(--color-foreground)",
              }}
              transition={{ duration: 0.2 }}
            >
              {tab.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}