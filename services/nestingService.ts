import { SHEET } from '@/constants/theme';
import { Shape } from './types';

/**
 * MVP Nesting Estimation - Phase 1
 * Formula: ((Total Area + Waste Margin %) / Sheet Area), rounded up.
 * Future Phase 2: integrate true 2D bin-packing.
 */
export function estimateSheets(shapes: Shape[]): number {
  const totalAreaCm2 = shapes.reduce((sum, shape) => {
    return (
      sum +
      shape.dimensions.reduce((dimSum, d) => {
        const w = Number(d.width) || 0;
        const h = Number(d.height) || 0;
        const q = Number(d.quantity) || 0;
        return dimSum + w * h * q;
      }, 0)
    );
  }, 0);

  if (totalAreaCm2 <= 0) return 0;

  const sheetArea = SHEET.WIDTH_CM * SHEET.HEIGHT_CM;
  const adjustedArea = totalAreaCm2 * (1 + SHEET.WASTE_MARGIN);
  return Math.ceil(adjustedArea / sheetArea);
}

export function totalPieces(shapes: Shape[]): number {
  return shapes.reduce(
    (sum, shape) =>
      sum + shape.dimensions.reduce((s, d) => s + (Number(d.quantity) || 0), 0),
    0,
  );
}

export function totalAreaCm2(shapes: Shape[]): number {
  return shapes.reduce(
    (sum, shape) =>
      sum +
      shape.dimensions.reduce(
        (s, d) => s + (Number(d.width) || 0) * (Number(d.height) || 0) * (Number(d.quantity) || 0),
        0,
      ),
    0,
  );
}
