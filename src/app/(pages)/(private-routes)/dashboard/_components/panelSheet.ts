/**
 * Size of the panel's vaul drawers (new appointment, appointment details, service editor).
 *
 * Mobile: a fixed height (88% of the dynamic viewport) instead of "as tall as the content",
 * so the sheet doesn't jump while results, steps or the calendar open and close inside it.
 * The bottom variant is needed: the Drawer primitive's own `data-[…=bottom]:max-h-[80vh]`
 * outranks a plain `max-h-*`. Desktop: a full-height side panel.
 *
 * Pair it with `repositionInputs={false}` on the Drawer — vaul otherwise resizes the sheet
 * whenever an input gains focus and the keyboard opens.
 */
export function panelSheetClass(isDesktop: boolean, width = 420): string {
  return isDesktop
    ? `h-full w-[${width}px] max-w-[${width}px] sm:max-w-[${width}px]`
    : "data-[vaul-drawer-direction=bottom]:h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh]";
}
