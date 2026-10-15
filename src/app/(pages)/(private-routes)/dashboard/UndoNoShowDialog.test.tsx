import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UndoNoShowDialog from "./UndoNoShowDialog";

const setup = (props: Partial<React.ComponentProps<typeof UndoNoShowDialog>> = {}) => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();
  render(<UndoNoShowDialog open isPending={false} onClose={onClose} onConfirm={onConfirm} {...props} />);
  return { onConfirm, onClose };
};

const submitButton = () => screen.getByRole("button", { name: /اصلاح و بازکردن نوبت/ });
const textarea = () => screen.getByRole("textbox");

describe("UndoNoShowDialog", () => {
  it("does not submit without a reason", () => {
    const { onConfirm } = setup();
    fireEvent.click(submitButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("submits the trimmed reason", () => {
    const { onConfirm } = setup();
    fireEvent.change(textarea(), { target: { value: "  مشتری آمده بود  " } });
    fireEvent.click(submitButton());
    expect(onConfirm).toHaveBeenCalledWith("مشتری آمده بود");
  });

  it("blocks a reason over 482 characters and shows the counter", () => {
    const { onConfirm } = setup();
    fireEvent.change(textarea(), { target: { value: "ا".repeat(483) } });
    expect(screen.getByText("483 / 482")).toBeTruthy();
    fireEvent.click(submitButton());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("accepts exactly 482 characters", () => {
    const { onConfirm } = setup();
    fireEvent.change(textarea(), { target: { value: "ا".repeat(482) } });
    fireEvent.click(submitButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not submit twice before the first request settles", () => {
    const { onConfirm } = setup();
    fireEvent.change(textarea(), { target: { value: "دلیل" } });
    fireEvent.click(submitButton());
    fireEvent.click(submitButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not submit while pending", () => {
    const { onConfirm } = setup({ isPending: true });
    fireEvent.change(textarea(), { target: { value: "دلیل" } });
    // While loading the button shows a spinner instead of its label, and is disabled.
    const buttons = screen.getAllByRole("button") as HTMLButtonElement[];
    const submit = buttons[buttons.length - 1];
    expect(submit.disabled).toBe(true);
    fireEvent.click(submit);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows the server error", () => {
    setup({ error: "مهلت اصلاح گذشته است." });
    expect(screen.getByRole("alert").textContent).toContain("مهلت اصلاح گذشته است.");
  });
});
