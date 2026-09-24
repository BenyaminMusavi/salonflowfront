import { create } from "zustand";

/**
 * Hand-off between the forgot-password steps (phone → OTP → new password).
 * Deliberately in-memory only (not persisted, never in the URL — backend contract):
 * a page refresh drops the phone / reset token and the user restarts from the phone step.
 */
interface IResetPasswordState {
  phone: string | null;
  resetToken: string | null;
  expiresAt: string | null;
  setPhone: (phone: string) => void;
  setResetToken: (resetToken: string, expiresAt: string) => void;
  clear: () => void;
}

export const useResetPasswordStore = create<IResetPasswordState>()((set) => ({
  phone: null,
  resetToken: null,
  expiresAt: null,
  setPhone: (phone) => set({ phone, resetToken: null, expiresAt: null }),
  setResetToken: (resetToken, expiresAt) => set({ resetToken, expiresAt }),
  clear: () => set({ phone: null, resetToken: null, expiresAt: null }),
}));
