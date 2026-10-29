import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MarqueeLabel from "./MarqueeLabel";

// jsdom has no layout: give the two measured boxes sizes. The box is 56px wide; the text is 8px per character.
const FRAME_WIDTH = 56;
const CHAR_WIDTH = 8;
const original = {
  scrollWidth: Object.getOwnPropertyDescriptor(Element.prototype, "scrollWidth"),
  clientWidth: Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth"),
};

function mockMedia(reduced: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduced && query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  document.documentElement.dir = "rtl";
  Object.defineProperty(Element.prototype, "scrollWidth", {
    configurable: true,
    get(this: Element) {
      return this.hasAttribute("data-marquee-content") ? (this.textContent?.length ?? 0) * CHAR_WIDTH : 0;
    },
  });
  Object.defineProperty(Element.prototype, "clientWidth", {
    configurable: true,
    get(this: Element) {
      return this.hasAttribute("data-marquee-frame") ? FRAME_WIDTH : 0;
    },
  });
  mockMedia(false);
});

afterEach(() => {
  if (original.scrollWidth) Object.defineProperty(Element.prototype, "scrollWidth", original.scrollWidth);
  if (original.clientWidth) Object.defineProperty(Element.prototype, "clientWidth", original.clientWidth);
  document.documentElement.dir = "";
});

const content = (text: string) => screen.getByText(text);
const frame = (text: string) => content(text).closest("[data-marquee-frame]") as HTMLElement;

describe("MarqueeLabel", () => {
  it("a title that fits stays still: no animation class, no tooltip, whole text", () => {
    render(<MarqueeLabel text="ناخن" className="w-14" />); // 4 chars = 32px < 56px

    expect(frame("ناخن").dataset.marquee).toBe("false");
    expect(content("ناخن").className).not.toContain("label-marquee");
    expect(frame("ناخن").getAttribute("title")).toBeNull();
    expect(content("ناخن").style.getPropertyValue("--marquee-shift")).toBe("");
  });

  it("a title exactly as wide as the box does not animate", () => {
    render(<MarqueeLabel text="1234567" className="w-14" />); // 7 × 8 = 56px

    expect(frame("1234567").dataset.marquee).toBe("false");
  });

  it("only a title that really overflows animates, along the RTL reading direction, with its full text as tooltip", () => {
    render(<MarqueeLabel text="خدمات ویژه عروس و داماد" className="w-14" />); // 23 chars = 184px

    const text = "خدمات ویژه عروس و داماد";
    expect(frame(text).dataset.marquee).toBe("true");
    expect(content(text).className).toContain("label-marquee");
    expect(content(text).style.getPropertyValue("--marquee-shift")).toBe("130px"); // 184 − 56 = 128, +2; positive = RTL
    expect(parseFloat(content(text).style.getPropertyValue("--marquee-duration"))).toBeGreaterThanOrEqual(7);
    expect(frame(text).getAttribute("title")).toBe(text);
  });

  it("moves the other way for left-to-right text", () => {
    document.documentElement.dir = "ltr";
    render(<MarqueeLabel text="a very long english category" className="w-14" />);

    expect(content("a very long english category").style.getPropertyValue("--marquee-shift").startsWith("-")).toBe(true);
  });

  it("a longer title gets a longer cycle (same slow speed)", () => {
    render(
      <>
        <MarqueeLabel text="عنوان نسبتاً بلند" />
        <MarqueeLabel text="عنوان خیلی خیلی خیلی خیلی خیلی خیلی بلند" />
      </>
    );

    const medium = parseFloat(content("عنوان نسبتاً بلند").style.getPropertyValue("--marquee-duration"));
    const long = parseFloat(content("عنوان خیلی خیلی خیلی خیلی خیلی خیلی بلند").style.getPropertyValue("--marquee-duration"));
    expect(long).toBeGreaterThan(medium);
  });

  it("re-measures when the text changes: short → long starts, long → short stops", () => {
    const { rerender } = render(<MarqueeLabel text="گریم" />);
    expect(frame("گریم").dataset.marquee).toBe("false");

    rerender(<MarqueeLabel text="مراقبت تخصصی پوست و مو" />);
    expect(frame("مراقبت تخصصی پوست و مو").dataset.marquee).toBe("true");

    rerender(<MarqueeLabel text="ماساژ" />);
    expect(frame("ماساژ").dataset.marquee).toBe("false");
    expect(content("ماساژ").className).not.toContain("label-marquee");
  });

  it("keeps one line: the box never wraps (nowrap + hidden overflow)", () => {
    render(<MarqueeLabel text="خدمات ویژه عروس و داماد" className="w-14" />);

    const box = frame("خدمات ویژه عروس و داماد");
    expect(box.className).toContain("whitespace-nowrap");
    expect(box.className).toContain("overflow-hidden");
    expect(box.className).toContain("w-14");
  });

  it("with prefers-reduced-motion nothing animates: the title is truncated with an ellipsis and the full text is the tooltip", () => {
    mockMedia(true);
    render(<MarqueeLabel text="خدمات ویژه عروس و داماد" className="w-14" />);

    const el = screen.getByText("خدمات ویژه عروس و داماد");
    expect(el.className).toContain("truncate");
    expect(el.getAttribute("title")).toBe("خدمات ویژه عروس و داماد");
    expect(document.querySelector("[data-marquee-content]")).toBeNull();
    expect(document.querySelector(".label-marquee")).toBeNull();
  });
});
