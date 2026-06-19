"use client";

import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface IProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ open, onClose, children }: IProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-[600px] rounded-t-[24px] bg-surface pb-8"
          >
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-foreground-muted/30" />
            </div>
            <div className="px-safe-area pt-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
