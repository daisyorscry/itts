export const COL_X = [110, 310, 510]
export const ROW_Y = [80, 190, 300]
export const SVG_W = 620
export const SVG_H = 380

export function circuitPath(ax: number, ay: number, bx: number, by: number): string {
  if (ay === by) return `M${ax},${ay} L${bx},${by}`
  if (ax === bx) return `M${ax},${ay} L${bx},${by}`
  const mx = ax + (bx - ax) / 2
  return `M${ax},${ay} L${mx},${ay} L${mx},${by} L${bx},${by}`
}
