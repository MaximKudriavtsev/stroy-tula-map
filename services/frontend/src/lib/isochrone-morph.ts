/** Morph helpers for animating isochrone polygon radius changes. */

type LngLatPoint = [number, number];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Resample a closed ring to a fixed number of evenly spaced points. */
export function resampleRing(
  coords: number[][],
  count: number,
): LngLatPoint[] {
  if (coords.length === 0 || count < 3) {
    return [];
  }

  const ring: LngLatPoint[] = coords.map((point) => [point[0], point[1]]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  const lengths: number[] = [0];
  for (let i = 1; i < ring.length; i += 1) {
    const dx = ring[i][0] - ring[i - 1][0];
    const dy = ring[i][1] - ring[i - 1][1];
    lengths.push(lengths[i - 1] + Math.hypot(dx, dy));
  }

  const total = lengths[lengths.length - 1] || 1;
  const result: LngLatPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const target = (i / count) * total;
    let j = 1;
    while (j < lengths.length && lengths[j] < target) {
      j += 1;
    }

    const t0 = lengths[j - 1];
    const t1 = lengths[j] ?? t0;
    const segT = t1 === t0 ? 0 : (target - t0) / (t1 - t0);
    const a = ring[j - 1];
    const b = ring[Math.min(j, ring.length - 1)];
    result.push([lerp(a[0], b[0], segT), lerp(a[1], b[1], segT)]);
  }

  result.push(result[0]);
  return result;
}

export function morphRings(
  from: number[][],
  to: number[][],
  t: number,
  samples = 72,
): LngLatPoint[] {
  const a = resampleRing(from, samples);
  const b = resampleRing(to, samples);
  return a.map((point, index) => [
    lerp(point[0], b[index][0], t),
    lerp(point[1], b[index][1], t),
  ]);
}

export function isochroneFill(opacity: number) {
  return `rgba(184, 74, 57, ${opacity})`;
}

export function isochroneStroke(opacity: number) {
  return [{ width: 3, color: "#B84A39", opacity }];
}
