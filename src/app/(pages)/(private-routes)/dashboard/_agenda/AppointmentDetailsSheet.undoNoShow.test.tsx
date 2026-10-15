import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppointmentStatus } from "@/services/common/enums/domain-enums";
import { AppointmentDetailsSheet } from "./AppointmentDetailsSheet";

let details: Record<string, unknown> | null = null;

vi.mock("@/shared/components/primitives/drawer/Drawer", () => ({
  Drawer: ({ open, children }: { open: boolean; children: React.ReactNode }) => (open ? <div>{children}</div> : null),
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DrawerDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));
vi.mock("@/shared/hooks", () => ({ useMediaQuery: () => true }));
vi.mock("@/services/domains/auth/hooks/useQueryCapabilities", () => ({
  useQueryCapabilities: () => ({ capabilities: { canSeeCustomerPhone: true, canCollectPayment: false, canViewFinance: false } }),
}));
vi.mock("@/services/domains/appointments/hooks", () => {
  const idle = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };
  return {
    useQuerySalonAppointmentDetails: () => ({ data: details ? { data: details } : undefined, refetch: vi.fn() }),
    useQueryAppointmentDeposit: () => ({ data: undefined }),
    useMutateSalonAppointment: () => ({
      checkIn: idle,
      complete: idle,
      noShow: idle,
      undoNoShow: idle,
      cancel: idle,
      reschedule: idle,
      undo: idle,
      checkout: idle,
      recordDeposit: idle,
      internalNote: idle,
    }),
  };
});

const item = {
  numericId: 1,
  publicId: "3f2a1b4c-1111-4222-8333-444455556666",
  startTime: "2026-10-01T10:00:00Z",
  endTime: "2026-10-01T11:00:00Z",
  status: AppointmentStatus.NoShow,
  customerName: "علی",
  services: [],
  staffNames: null,
  branchName: null,
  totalPrice: 0,
};

const renderSheet = (allowedActions: string[], status: number = AppointmentStatus.NoShow) => {
  details = {
    status,
    allowedActions,
    services: [],
    customer: { name: "علی" },
    history: [],
    money: null,
  };
  render(
    <AppointmentDetailsSheet
      item={{ ...item, status }}
      showBranch={false}
      onClose={() => undefined}
      onToast={() => undefined}
    />
  );
};

const undoButton = () => screen.queryByRole("button", { name: /اصلاح «مراجعه نکرد»/ });

describe("AppointmentDetailsSheet — undoNoShow follows allowedActions", () => {
  beforeEach(() => {
    details = null;
  });

  it("renders the button when the server lists undoNoShow (salon owner inside the window)", () => {
    renderSheet(["undoNoShow"]);
    expect(undoButton()).not.toBeNull();
  });

  it("does not render it when the server omits it (staff, admin outside the owner role, window closed, legacy row)", () => {
    renderSheet(["reschedule"]);
    expect(undoButton()).toBeNull();
  });

  it("does not render it for an empty list", () => {
    renderSheet([]);
    expect(undoButton()).toBeNull();
  });

  it("is not inferred from the status alone: a no-show without the action has no button", () => {
    renderSheet([], AppointmentStatus.NoShow);
    expect(undoButton()).toBeNull();
  });
});
