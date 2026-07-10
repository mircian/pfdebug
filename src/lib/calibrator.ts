/**
 * "No tape measure?" calibrator for the knee-to-wall step (BUILD.md §5).
 *
 * The user picks a reference object and counts lengths; we convert to
 * canonical cm. The direct-number input is always the primary path — this
 * is the fallback.
 *
 * Lengths are the official spec-sheet heights of each handset.
 */

export interface ReferenceObject {
  id: string;
  label: string;
  length_cm: number;
}

/** ISO/IEC 7810 ID-1 — every credit/bank card on earth. */
export const CARD_LENGTH_CM = 8.56;

export const REFERENCE_OBJECTS: ReferenceObject[] = [
  { id: "card", label: "Credit / bank card (8.56 cm)", length_cm: CARD_LENGTH_CM },
  { id: "iphone-15-pro", label: "iPhone 15 Pro", length_cm: 14.7 },
  { id: "iphone-15", label: "iPhone 15", length_cm: 14.8 },
  { id: "iphone-15-pro-max", label: "iPhone 15 Pro Max", length_cm: 16.0 },
  { id: "iphone-14", label: "iPhone 14", length_cm: 14.7 },
  { id: "iphone-13-mini", label: "iPhone 13 mini", length_cm: 13.2 },
  { id: "iphone-se", label: "iPhone SE (2020/2022)", length_cm: 13.8 },
  { id: "galaxy-s24", label: "Samsung Galaxy S24", length_cm: 14.7 },
  { id: "galaxy-s24-ultra", label: "Samsung Galaxy S24 Ultra", length_cm: 16.2 },
  { id: "galaxy-s23", label: "Samsung Galaxy S23", length_cm: 14.6 },
  { id: "pixel-8", label: "Google Pixel 8", length_cm: 15.1 },
  { id: "pixel-8-pro", label: "Google Pixel 8 Pro", length_cm: 16.3 },
  { id: "pixel-7a", label: "Google Pixel 7a", length_cm: 15.2 },
];

export function lengthsToCm(referenceId: string, count: number): number | null {
  const ref = REFERENCE_OBJECTS.find((r) => r.id === referenceId);
  if (!ref || !Number.isFinite(count) || count < 0) return null;
  return Math.round(ref.length_cm * count * 10) / 10;
}
