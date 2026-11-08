// Event bus global kecil (CustomEvent di window) untuk UI yang tidak saling kenal.
export const PALETTE_EVENT = "fx:palette";
export const BOOT_EVENT = "fx:boot";

export const togglePalette = open => window.dispatchEvent(new CustomEvent(PALETTE_EVENT, { detail: open }));
