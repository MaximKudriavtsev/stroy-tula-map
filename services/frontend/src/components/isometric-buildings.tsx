import type { ComponentType } from "react";
import { ObjectCategory } from "@/data/object-categories";

type Point = [number, number, number];

/** Проекция: x → вправо-вниз, y → влево-вниз, z → вверх. */
const iso = ([x, y, z]: Point, ox = 100, oy = 148) => {
  const sx = ox + (x - y) * 12;
  const sy = oy + (x + y) * 6 - z * 14;
  return `${sx.toFixed(1)} ${sy.toFixed(1)}`;
};

const path = (points: Point[]) =>
  `${points.map((point, index) => `${index === 0 ? "M" : "L"} ${iso(point)}`).join(" ")} Z`;

const pt = (coords: string) => {
  const [x, y] = coords.split(" ").map(Number);
  return { x, y };
};

/**
 * Полный видимый параллелепипед:
 * — левая стена (y = y1, ближняя к камере слева)
 * — правая стена (x = x1)
 * — крыша (z = z1)
 */
function Box({
  x0,
  y0,
  z0,
  x1,
  y1,
  z1,
  left,
  right,
  top,
}: {
  x0: number;
  y0: number;
  z0: number;
  x1: number;
  y1: number;
  z1: number;
  left: string;
  right: string;
  top: string;
}) {
  return (
    <>
      <path
        d={path([
          [x0, y1, z0],
          [x1, y1, z0],
          [x1, y1, z1],
          [x0, y1, z1],
        ])}
        fill={left}
      />
      <path
        d={path([
          [x1, y0, z0],
          [x1, y1, z0],
          [x1, y1, z1],
          [x1, y0, z1],
        ])}
        fill={right}
      />
      <path
        d={path([
          [x0, y0, z1],
          [x1, y0, z1],
          [x1, y1, z1],
          [x0, y1, z1],
        ])}
        fill={top}
      />
    </>
  );
}

function Ground() {
  return (
    <>
      <ellipse
        cx="100"
        cy="174"
        fill="var(--color-on-surface)"
        opacity="0.04"
        rx="56"
        ry="9"
      />
      <ellipse
        cx="100"
        cy="172"
        fill="var(--color-surface-container-high)"
        rx="50"
        ry="7"
      />
    </>
  );
}

/** Школа: длинный корпус + часовая башня. */
export function IsometricSchool({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />

      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-secondary-container)"
        top="var(--color-primary-container)"
        x0={0}
        x1={6.2}
        y0={0.4}
        y1={3.2}
        z0={0}
        z1={2.4}
      />

      {/* Окна на левой стене */}
      {[0.4, 1.5, 2.6, 3.7, 4.8].map((x) => (
        <path
          d={path([
            [x, 3.2, 0.7],
            [x + 0.7, 3.2, 0.7],
            [x + 0.7, 3.2, 1.7],
            [x, 3.2, 1.7],
          ])}
          fill="var(--color-on-primary-container)"
          key={`school-win-${x}`}
        />
      ))}

      {/* Дверь на правом торце */}
      <path
        d={path([
          [6.2, 1.2, 0],
          [6.2, 2.2, 0],
          [6.2, 2.2, 1.4],
          [6.2, 1.2, 1.4],
        ])}
        fill="var(--color-primary)"
      />

      {/* Часовая башня */}
      <Box
        left="var(--color-tertiary)"
        right="var(--color-secondary-fixed-dim)"
        top="var(--color-primary)"
        x0={2.2}
        x1={4}
        y0={1.1}
        y1={2.4}
        z0={2.4}
        z1={4.6}
      />
      <circle
        cx={pt(iso([4, 1.75, 3.5])).x}
        cy={pt(iso([4, 1.75, 3.5])).y}
        fill="var(--color-on-primary-container)"
        r="4.5"
      />
    </svg>
  );
}

/** Больница: высокий корпус + крест. */
export function IsometricHospital({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />

      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-surface-container-lowest)"
        top="var(--color-on-primary-container)"
        x0={1}
        x1={4.8}
        y0={0.3}
        y1={3.4}
        z0={0}
        z1={4.8}
      />

      {/* Окна */}
      {[0.6, 1.7, 2.8].flatMap((z) =>
        [0.6, 1.5, 2.4].map((y) => (
          <path
            d={path([
              [4.8, y, z],
              [4.8, y + 0.65, z],
              [4.8, y + 0.65, z + 0.65],
              [4.8, y, z + 0.65],
            ])}
            fill="var(--color-primary-fixed)"
            key={`hosp-win-${y}-${z}`}
          />
        )),
      )}

      {/* Крест */}
      <path
        d={path([
          [4.8, 1.35, 3.75],
          [4.8, 2.35, 3.75],
          [4.8, 2.35, 4.2],
          [4.8, 1.35, 4.2],
        ])}
        fill="var(--color-primary-container)"
      />
      <path
        d={path([
          [4.8, 1.7, 3.35],
          [4.8, 2.0, 3.35],
          [4.8, 2.0, 4.6],
          [4.8, 1.7, 4.6],
        ])}
        fill="var(--color-primary-container)"
      />

      {/* Вход */}
      <path
        d={path([
          [4.8, 1.2, 0],
          [4.8, 2.4, 0],
          [4.8, 2.4, 1.15],
          [4.8, 1.2, 1.15],
        ])}
        fill="var(--color-primary)"
      />
    </svg>
  );
}

/** Эллипс в плоскости XY → точки для изометрии. */
function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  z: number,
  segments = 40,
): Point[] {
  return Array.from({ length: segments }, (_, i) => {
    const t = (i / segments) * Math.PI * 2;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, z] as Point;
  });
}

/** Дуга эллипса [a0..a1] включительно. */
function ellipseArc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  z: number,
  a0: number,
  a1: number,
  steps = 24,
): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / steps;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, z] as Point;
  });
}

/** Кольцо / усечённый конус (внешний и внутренний контуры на разных z). */
function annulusPath(outer: Point[], inner: Point[]) {
  const out = outer
    .map((p, i) => `${i === 0 ? "M" : "L"} ${iso(p)}`)
    .join(" ");
  const inn = [...inner]
    .reverse()
    .map((p, i) => `${i === 0 ? "M" : "L"} ${iso(p)}`)
    .join(" ");
  return `${out} Z ${inn} Z`;
}

/** Наклонная стенка: дуга снизу → дуга сверху (разный радиус). */
function slantWall(
  cx: number,
  cy: number,
  rx0: number,
  ry0: number,
  z0: number,
  rx1: number,
  ry1: number,
  z1: number,
  a0: number,
  a1: number,
  steps = 28,
) {
  const bottom = ellipseArc(cx, cy, rx0, ry0, z0, a0, a1, steps);
  const top = ellipseArc(cx, cy, rx1, ry1, z1, a0, a1, steps);
  return path([...bottom, ...[...top].reverse()]);
}

/** Спорт: футбольное поле с воротами. */
export function IsometricSport({ className }: { className?: string }) {
  const x0 = 0.55;
  const x1 = 5.85;
  const y0 = 0.85;
  const y1 = 3.75;
  const z = 0.22;
  const markZ = z + 0.03;
  const midX = (x0 + x1) / 2;
  const midY = (y0 + y1) / 2;
  const goalHalf = 0.55;
  const boxDepth = 0.85;
  const boxHalf = 1.05;
  const goalH = 1.05;
  const line = "var(--color-surface-container-lowest)";

  const stripes = Array.from({ length: 6 }, (_, i) => {
    const t0 = i / 6;
    const t1 = (i + 1) / 6;
    return {
      xa: x0 + (x1 - x0) * t0,
      xb: x0 + (x1 - x0) * t1,
      fill:
        i % 2 === 0
          ? "var(--color-category-utilities)"
          : "var(--color-category-utilities-soft)",
    };
  });

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />

      {/* Периметр / бордюр */}
      <Box
        left="var(--color-category-sport-deep)"
        right="var(--color-category-sport)"
        top="var(--color-category-sport-soft)"
        x0={x0 - 0.28}
        x1={x1 + 0.28}
        y0={y0 - 0.28}
        y1={y1 + 0.28}
        z0={0}
        z1={z}
      />

      {/* Газон с полосами */}
      {stripes.map((stripe) => (
        <path
          d={path([
            [stripe.xa, y0, markZ],
            [stripe.xb, y0, markZ],
            [stripe.xb, y1, markZ],
            [stripe.xa, y1, markZ],
          ])}
          fill={stripe.fill}
          key={`stripe-${stripe.xa}`}
        />
      ))}

      {/* Контур поля */}
      <path
        d={path([
          [x0, y0, markZ],
          [x1, y0, markZ],
          [x1, y1, markZ],
          [x0, y1, markZ],
        ])}
        fill="none"
        stroke={line}
        strokeWidth="1.8"
      />

      {/* Центральная линия */}
      <path
        d={`M ${iso([midX, y0, markZ])} L ${iso([midX, y1, markZ])}`}
        stroke={line}
        strokeWidth="1.5"
      />

      {/* Центральный круг */}
      <path
        d={path(ellipsePoints(midX, midY, 0.55, 0.55, markZ, 28))}
        fill="none"
        stroke={line}
        strokeWidth="1.4"
      />
      <path
        d={path(ellipsePoints(midX, midY, 0.1, 0.1, markZ, 12))}
        fill={line}
      />

      {/* Штрафные */}
      <path
        d={path([
          [x0, midY - boxHalf, markZ],
          [x0 + boxDepth, midY - boxHalf, markZ],
          [x0 + boxDepth, midY + boxHalf, markZ],
          [x0, midY + boxHalf, markZ],
        ])}
        fill="none"
        stroke={line}
        strokeWidth="1.35"
      />
      <path
        d={path([
          [x1 - boxDepth, midY - boxHalf, markZ],
          [x1, midY - boxHalf, markZ],
          [x1, midY + boxHalf, markZ],
          [x1 - boxDepth, midY + boxHalf, markZ],
        ])}
        fill="none"
        stroke={line}
        strokeWidth="1.35"
      />

      {/* Вратарские */}
      <path
        d={path([
          [x0, midY - 0.42, markZ],
          [x0 + 0.35, midY - 0.42, markZ],
          [x0 + 0.35, midY + 0.42, markZ],
          [x0, midY + 0.42, markZ],
        ])}
        fill="none"
        stroke={line}
        strokeWidth="1.15"
      />
      <path
        d={path([
          [x1 - 0.35, midY - 0.42, markZ],
          [x1, midY - 0.42, markZ],
          [x1, midY + 0.42, markZ],
          [x1 - 0.35, midY + 0.42, markZ],
        ])}
        fill="none"
        stroke={line}
        strokeWidth="1.15"
      />

      {/* Левые ворота */}
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-surface-container-lowest)"
        x0={x0 - 0.12}
        x1={x0}
        y0={midY - goalHalf}
        y1={midY - goalHalf + 0.12}
        z0={z}
        z1={z + goalH}
      />
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-surface-container-lowest)"
        x0={x0 - 0.12}
        x1={x0}
        y0={midY + goalHalf - 0.12}
        y1={midY + goalHalf}
        z0={z}
        z1={z + goalH}
      />
      <Box
        left="var(--color-outline-variant)"
        right="var(--color-outline)"
        top="var(--color-surface-container-lowest)"
        x0={x0 - 0.12}
        x1={x0}
        y0={midY - goalHalf}
        y1={midY + goalHalf}
        z0={z + goalH - 0.12}
        z1={z + goalH}
      />
      {/* Сетка левых ворот */}
      <path
        d={path([
          [x0 - 0.12, midY - goalHalf + 0.08, z + 0.08],
          [x0 - 0.55, midY - goalHalf + 0.08, z + 0.08],
          [x0 - 0.55, midY + goalHalf - 0.08, z + 0.08],
          [x0 - 0.12, midY + goalHalf - 0.08, z + 0.08],
        ])}
        fill="var(--color-surface-container-lowest)"
        opacity="0.35"
      />
      <path
        d={path([
          [x0 - 0.55, midY - goalHalf + 0.08, z + 0.08],
          [x0 - 0.12, midY - goalHalf + 0.08, z + goalH - 0.08],
          [x0 - 0.12, midY + goalHalf - 0.08, z + goalH - 0.08],
          [x0 - 0.55, midY + goalHalf - 0.08, z + 0.08],
        ])}
        fill="var(--color-outline-variant)"
        opacity="0.45"
      />

      {/* Правые ворота */}
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-surface-container-lowest)"
        x0={x1}
        x1={x1 + 0.12}
        y0={midY - goalHalf}
        y1={midY - goalHalf + 0.12}
        z0={z}
        z1={z + goalH}
      />
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-surface-container-lowest)"
        x0={x1}
        x1={x1 + 0.12}
        y0={midY + goalHalf - 0.12}
        y1={midY + goalHalf}
        z0={z}
        z1={z + goalH}
      />
      <Box
        left="var(--color-outline-variant)"
        right="var(--color-outline)"
        top="var(--color-surface-container-lowest)"
        x0={x1}
        x1={x1 + 0.12}
        y0={midY - goalHalf}
        y1={midY + goalHalf}
        z0={z + goalH - 0.12}
        z1={z + goalH}
      />
      {/* Сетка правых ворот */}
      <path
        d={path([
          [x1 + 0.12, midY - goalHalf + 0.08, z + 0.08],
          [x1 + 0.55, midY - goalHalf + 0.08, z + 0.08],
          [x1 + 0.55, midY + goalHalf - 0.08, z + 0.08],
          [x1 + 0.12, midY + goalHalf - 0.08, z + 0.08],
        ])}
        fill="var(--color-surface-container-lowest)"
        opacity="0.35"
      />
      <path
        d={path([
          [x1 + 0.12, midY - goalHalf + 0.08, z + goalH - 0.08],
          [x1 + 0.55, midY - goalHalf + 0.08, z + 0.08],
          [x1 + 0.55, midY + goalHalf - 0.08, z + 0.08],
          [x1 + 0.12, midY + goalHalf - 0.08, z + goalH - 0.08],
        ])}
        fill="var(--color-outline-variant)"
        opacity="0.45"
      />

      {/* Угловые флажки */}
      {(
        [
          [x0, y0],
          [x1, y0],
          [x0, y1],
          [x1, y1],
        ] as [number, number][]
      ).map(([fx, fy]) => (
        <g key={`flag-${fx}-${fy}`}>
          <path
            d={`M ${iso([fx, fy, z])} L ${iso([fx, fy, z + 0.85])}`}
            stroke="var(--color-on-surface-variant)"
            strokeLinecap="round"
            strokeWidth="1.4"
          />
          <path
            d={path([
              [fx, fy, z + 0.85],
              [fx + (fx === x0 ? 0.35 : -0.35), fy, z + 0.7],
              [fx, fy, z + 0.55],
            ])}
            fill="var(--color-category-sport)"
          />
        </g>
      ))}
    </svg>
  );
}

/** Инфраструктура: здание котельной с дымовой трубой. */
export function IsometricInfrastructure({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />

      {/* Корпус */}
      <Box
        left="var(--color-category-infrastructure)"
        right="var(--color-category-infrastructure-deep)"
        top="var(--color-category-infrastructure-soft)"
        x0={1.1}
        x1={5.1}
        y0={1.0}
        y1={3.4}
        z0={0}
        z1={2.6}
      />

      {/* Крыша */}
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-outline-variant)"
        x0={0.95}
        x1={5.25}
        y0={0.85}
        y1={3.55}
        z0={2.6}
        z1={2.9}
      />

      {/* Окна */}
      {[1.4, 2.35, 3.3, 4.25].map((x) => (
        <path
          d={path([
            [x, 3.4, 1.0],
            [x + 0.55, 3.4, 1.0],
            [x + 0.55, 3.4, 1.85],
            [x, 3.4, 1.85],
          ])}
          fill="var(--color-on-primary-container)"
          key={`boiler-win-${x}`}
        />
      ))}

      {/* Дверь */}
      <path
        d={path([
          [5.1, 1.85, 0],
          [5.1, 2.55, 0],
          [5.1, 2.55, 1.6],
          [5.1, 1.85, 1.6],
        ])}
        fill="var(--color-primary)"
      />

      {/* Кирпичная дымовая труба */}
      <Box
        left="var(--color-primary)"
        right="var(--color-primary-container)"
        top="var(--color-on-primary-fixed-variant)"
        x0={1.55}
        x1={2.95}
        y0={0.95}
        y1={2.15}
        z0={2.9}
        z1={6.35}
      />
      {/* Оголовок */}
      <Box
        left="var(--color-primary-container)"
        right="var(--color-primary)"
        top="var(--color-on-surface-variant)"
        x0={1.4}
        x1={3.1}
        y0={0.8}
        y1={2.3}
        z0={6.35}
        z1={6.65}
      />
      {/* Тёмное отверстие сверху */}
      <path
        d={path([
          [1.75, 1.15, 6.66],
          [2.75, 1.15, 6.66],
          [2.75, 1.95, 6.66],
          [1.75, 1.95, 6.66],
        ])}
        fill="var(--color-on-surface)"
        opacity="0.65"
      />

      {/* Кладка на ближней (левой) стене */}
      {[3.2, 3.7, 4.2, 4.7, 5.2, 5.7].map((z, row) =>
        [1.65, 2.05, 2.45].map((x) => {
          const offset = row % 2 === 0 ? 0 : 0.2;
          const bx = x + offset;
          if (bx + 0.32 > 2.95) return null;
          return (
            <path
              d={path([
                [bx, 2.15, z],
                [bx + 0.32, 2.15, z],
                [bx + 0.32, 2.15, z + 0.38],
                [bx, 2.15, z + 0.38],
              ])}
              fill="var(--color-on-primary-fixed-variant)"
              key={`brick-l-${z}-${x}`}
              opacity="0.35"
            />
          );
        }),
      )}

      {/* Кладка на правой стене */}
      {[3.2, 3.7, 4.2, 4.7, 5.2, 5.7].map((z, row) =>
        [1.05, 1.45, 1.85].map((y) => {
          const offset = row % 2 === 0 ? 0 : 0.18;
          const by = y + offset;
          if (by + 0.3 > 2.15) return null;
          return (
            <path
              d={path([
                [2.95, by, z],
                [2.95, by + 0.3, z],
                [2.95, by + 0.3, z + 0.38],
                [2.95, by, z + 0.38],
              ])}
              fill="var(--color-primary)"
              key={`brick-r-${z}-${y}`}
              opacity="0.28"
            />
          );
        }),
      )}

      {/* Швы кладки */}
      {[3.15, 3.65, 4.15, 4.65, 5.15, 5.65, 6.15].map((z) => (
        <g key={`mortar-${z}`}>
          <path
            d={`M ${iso([1.55, 2.15, z])} L ${iso([2.95, 2.15, z])}`}
            stroke="var(--color-primary-fixed)"
            strokeWidth="0.9"
            opacity="0.55"
          />
          <path
            d={`M ${iso([2.95, 0.95, z])} L ${iso([2.95, 2.15, z])}`}
            stroke="var(--color-primary-fixed)"
            strokeWidth="0.9"
            opacity="0.45"
          />
        </g>
      ))}

      {/* Пар из трубы */}
      {(
        [
          [2.25, 1.55, 6.95, 0.5, 0.72],
          [2.5, 1.3, 7.5, 0.72, 0.52],
          [2.0, 1.75, 8.05, 0.95, 0.38],
          [2.6, 1.15, 8.55, 1.15, 0.26],
          [2.1, 1.85, 9.0, 1.35, 0.15],
        ] as [number, number, number, number, number][]
      ).map(([sx, sy, sz, r, opacity]) => (
        <path
          d={path(ellipsePoints(sx, sy, r, r * 0.72, sz, 20))}
          fill="var(--color-surface-container-lowest)"
          key={`steam-${sz}`}
          opacity={opacity}
        />
      ))}
    </svg>
  );
}

/** ЖКХ и парки: парк с деревьями. */
function Tree({
  cx,
  cy,
  scale = 1,
}: {
  cx: number;
  cy: number;
  scale?: number;
}) {
  const trunkW = 0.2 * scale;
  const trunkH = 1.25 * scale;
  const baseZ = 0.12;
  const crownZ = baseZ + trunkH;

  return (
    <g>
      <Box
        left="var(--color-tertiary)"
        right="var(--color-tertiary-container)"
        top="var(--color-on-tertiary-fixed-variant)"
        x0={cx - trunkW}
        x1={cx + trunkW}
        y0={cy - trunkW}
        y1={cy + trunkW}
        z0={baseZ}
        z1={crownZ}
      />
      <path
        d={path(ellipsePoints(cx, cy, 0.95 * scale, 0.85 * scale, crownZ, 24))}
        fill="var(--color-category-utilities-deep)"
      />
      <path
        d={path(ellipsePoints(cx, cy, 0.8 * scale, 0.72 * scale, crownZ + 0.55 * scale, 22))}
        fill="var(--color-category-utilities)"
      />
      <path
        d={path(ellipsePoints(cx, cy, 0.58 * scale, 0.52 * scale, crownZ + 1.05 * scale, 20))}
        fill="var(--color-category-utilities-soft)"
      />
      <path
        d={path(ellipsePoints(cx, cy, 0.32 * scale, 0.28 * scale, crownZ + 1.45 * scale, 14))}
        fill="var(--color-success-container)"
      />
    </g>
  );
}

export function IsometricPark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />

      {/* Газон */}
      <path
        d={path([
          [0.6, 0.7, 0.1],
          [5.8, 0.7, 0.1],
          [5.8, 3.7, 0.1],
          [0.6, 3.7, 0.1],
        ])}
        fill="var(--color-category-utilities-soft)"
      />
      <path
        d={path([
          [0.9, 1.0, 0.12],
          [5.5, 1.0, 0.12],
          [5.5, 3.4, 0.12],
          [0.9, 3.4, 0.12],
        ])}
        fill="var(--color-success-container)"
      />

      {/* Дорожка */}
      <path
        d={path([
          [2.85, 0.85, 0.14],
          [3.55, 0.85, 0.14],
          [3.55, 3.55, 0.14],
          [2.85, 3.55, 0.14],
        ])}
        fill="var(--color-secondary-fixed-dim)"
      />
      <path
        d={path([
          [0.85, 1.95, 0.15],
          [5.55, 1.95, 0.15],
          [5.55, 2.45, 0.15],
          [0.85, 2.45, 0.15],
        ])}
        fill="var(--color-secondary-fixed)"
      />

      {/* Скамейка */}
      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-tertiary)"
        top="var(--color-on-tertiary-container)"
        x0={3.85}
        x1={5.15}
        y0={2.7}
        y1={3.05}
        z0={0.15}
        z1={0.55}
      />
      <Box
        left="var(--color-outline)"
        right="var(--color-on-surface-variant)"
        top="var(--color-outline-variant)"
        x0={3.85}
        x1={5.15}
        y0={2.95}
        y1={3.1}
        z0={0.55}
        z1={1.05}
      />

      {/* Деревья: дальние → ближние */}
      <Tree cx={1.55} cy={1.25} scale={0.85} />
      <Tree cx={4.85} cy={1.2} scale={0.95} />
      <Tree cx={1.35} cy={2.95} scale={1.05} />
      <Tree cx={4.55} cy={3.05} scale={0.9} />
      <Tree cx={2.05} cy={2.15} scale={0.7} />
    </svg>
  );
}

/** Запасной кубик для категорий без своей иконки. */
export function IsometricCube({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      preserveAspectRatio="xMidYMax meet"
      viewBox="0 0 200 200"
    >
      <Ground />
      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-secondary-container)"
        top="var(--color-primary-container)"
        x0={1.6}
        x1={4.6}
        y0={1.0}
        y1={3.6}
        z0={0}
        z1={3.0}
      />
    </svg>
  );
}

type ChipCategory = Exclude<ObjectCategory, ObjectCategory.All>;

const buildingByCategory: Record<
  ChipCategory,
  ComponentType<{ className?: string }>
> = {
  [ObjectCategory.Education]: IsometricSchool,
  [ObjectCategory.Healthcare]: IsometricHospital,
  [ObjectCategory.Sport]: IsometricSport,
  [ObjectCategory.Infrastructure]: IsometricInfrastructure,
  [ObjectCategory.UtilitiesAndParks]: IsometricPark,
};

export function CategoryIsometricBuilding({
  category,
  className,
}: {
  category: ChipCategory;
  className?: string;
}) {
  const Image = buildingByCategory[category] ?? IsometricCube;
  return <Image className={className} />;
}
