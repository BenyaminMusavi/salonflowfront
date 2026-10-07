/**
 * Size of the panel's vaul drawers (new appointment, appointment details, service editor).
 *
 * Mobile: a fixed height (88% of the dynamic viewport) instead of "as tall as the content",
 * so the sheet doesn't jump while results, steps or the calendar open and close inside it.
 * The bottom variant is needed: the Drawer primitive's own `data-[…=bottom]:max-h-[80vh]`
 * outranks a plain `max-h-*`. Desktop: a full-height side panel.
 *
 * Keep vaul's default `repositionInputs`: when the keyboard opens it shrinks the sheet to the
 * visible part of the screen (and restores it after), so what is under the keyboard can still be
 * scrolled to. Turning it off left search results hidden behind the keyboard with nothing to scroll.
 */
export function panelSheetClass(isDesktop: boolean, width = 420): string {
  return isDesktop
    ? `h-full w-[${width}px] max-w-[${width}px] sm:max-w-[${width}px]`
    : "data-[vaul-drawer-direction=bottom]:h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh]";
}
