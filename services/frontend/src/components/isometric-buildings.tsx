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
    <ellipse
      cx="100"
      cy="172"
      fill="var(--color-surface-container-high)"
      rx="54"
      ry="8"
    />
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

/** Спорт: стадион с полем и воротами. */
export function IsometricSport({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      viewBox="0 0 200 200"
    >
      <Ground />

      {/* Трибуны — полный бокс */}
      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-secondary-fixed-dim)"
        top="var(--color-surface-container)"
        x0={0.2}
        x1={6.4}
        y0={0.2}
        y1={4.6}
        z0={0}
        z1={1.2}
      />

      {/* Поле */}
      <path
        d={path([
          [1.1, 1.0, 1.21],
          [5.5, 1.0, 1.21],
          [5.5, 3.8, 1.21],
          [1.1, 3.8, 1.21],
        ])}
        fill="var(--color-success-container)"
      />
      <path
        d={`M ${iso([3.3, 1.0, 1.22])} L ${iso([3.3, 3.8, 1.22])}`}
        stroke="var(--color-surface-container-lowest)"
        strokeWidth="1.5"
      />
      <ellipse
        cx={pt(iso([3.3, 2.4, 1.23])).x}
        cy={pt(iso([3.3, 2.4, 1.23])).y}
        fill="none"
        rx="9"
        ry="4.5"
        stroke="var(--color-surface-container-lowest)"
        strokeWidth="1.5"
      />

      {/* Ворота */}
      <path
        d={`M ${iso([1.3, 1.7, 1.21])} L ${iso([1.3, 1.7, 2.0])} L ${iso([1.3, 3.1, 2.0])} L ${iso([1.3, 3.1, 1.21])}`}
        fill="none"
        stroke="var(--color-on-surface)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d={`M ${iso([5.3, 1.7, 1.21])} L ${iso([5.3, 1.7, 2.0])} L ${iso([5.3, 3.1, 2.0])} L ${iso([5.3, 3.1, 1.21])}`}
        fill="none"
        stroke="var(--color-on-surface)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Инфраструктура: котельная с трубой. */
export function IsometricInfrastructure({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
      viewBox="0 0 200 200"
    >
      <Ground />

      <Box
        left="var(--color-tertiary-container)"
        right="var(--color-secondary-fixed-dim)"
        top="var(--color-outline-variant)"
        x0={0.4}
        x1={5.2}
        y0={0.5}
        y1={3.8}
        z0={0}
        z1={2.2}
      />

      {/* Ворота цеха */}
      <path
        d={path([
          [5.2, 1.0, 0.15],
          [5.2, 2.1, 0.15],
          [5.2, 2.1, 1.7],
          [5.2, 1.0, 1.7],
        ])}
        fill="var(--color-tertiary)"
      />
      <path
        d={path([
          [5.2, 2.4, 0.15],
          [5.2, 3.4, 0.15],
          [5.2, 3.4, 1.7],
          [5.2, 2.4, 1.7],
        ])}
        fill="var(--color-tertiary)"
      />

      {/* Труба — полный бокс */}
      <Box
        left="var(--color-primary-container)"
        right="var(--color-primary)"
        top="var(--color-on-surface-variant)"
        x0={1.2}
        x1={2.4}
        y0={1.8}
        y1={2.9}
        z0={2.2}
        z1={5.6}
      />

      {/* Дым */}
      <circle
        cx={pt(iso([1.8, 2.35, 6.1])).x}
        cy={pt(iso([1.8, 2.35, 6.1])).y}
        fill="var(--color-surface-dim)"
        opacity="0.7"
        r="4.5"
      />
      <circle
        cx={pt(iso([2.1, 2.2, 6.7])).x}
        cy={pt(iso([2.1, 2.2, 6.7])).y}
        fill="var(--color-surface-dim)"
        opacity="0.5"
        r="5.5"
      />
      <circle
        cx={pt(iso([2.4, 2.0, 7.2])).x}
        cy={pt(iso([2.4, 2.0, 7.2])).y}
        fill="var(--color-surface-dim)"
        opacity="0.35"
        r="6.5"
      />
    </svg>
  );
}

/** Запасной кубик для категорий без своей иконки (ЖКХ и парки). */
export function IsometricCube({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      overflow="visible"
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
  [ObjectCategory.UtilitiesAndParks]: IsometricCube,
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
