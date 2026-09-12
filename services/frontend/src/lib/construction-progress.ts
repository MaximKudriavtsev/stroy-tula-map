import { DEFAULT_MAP_DATE } from "@/data/map-date";
import type { ConstructionObject } from "@/data/objects";
import { progressForObject } from "@/lib/object-chip";

const MONTH_SHORT = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
] as const;

const MONTH_FULL = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

export type ConstructionStage = {
  to: number;
  title: string;
  summary: string;
  photoSrc: string;
};

export const constructionStages: ConstructionStage[] = [
  {
    to: 20,
    title: "Подготовка площадки и земляные работы",
    summary:
      "Расчистка территории, вынос сетей, разработка котлована и устройство основания",
    photoSrc: "/construction-stages/stage-01.png",
  },
  {
    to: 40,
    title: "Фундамент и монолитный каркас",
    summary:
      "Устройство фундамента, возведение несущих конструкций, колонн и перекрытий",
    photoSrc: "/construction-stages/stage-02.png",
  },
  {
    to: 60,
    title: "Стены, кровля и тепловой контур",
    summary:
      "Кладка стен, монтаж кровли, заполнение проёмов и закрытие теплового контура",
    photoSrc: "/construction-stages/stage-03.png",
  },
  {
    to: 80,
    title: "Инженерные сети и внутренние работы",
    summary:
      "Прокладка коммуникаций, монтаж оборудования и черновая отделка помещений",
    photoSrc: "/construction-stages/stage-04.jpg",
  },
  {
    to: 100,
    title: "Финишная отделка и благоустройство",
    summary:
      "Чистовая отделка, монтаж оборудования, пусконаладка и благоустройство территории",
    photoSrc: "/construction-stages/stage-05.png",
  },
];

export type ConstructionTimelinePoint = {
  key: string;
  year: number;
  month: number;
  progress: number;
  shortLabel: string;
  fullLabel: string;
};

export function constructionTimelineForObject(
  object: ConstructionObject,
  now: Date = DEFAULT_MAP_DATE,
): ConstructionTimelinePoint[] {
  const seed = Number.parseInt(object.id, 10) || 1;
  const current = startOfMonth(now);
  const { start, end, finalProgress } = timelineRange(object, current, seed);
  const months = monthsInclusive(start, end);
  const count = months.length;

  return months.map((date, index) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const progress =
      count <= 1
        ? finalProgress
        : Math.round(((index + 1) / count) * finalProgress);

    return {
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      year,
      month,
      progress,
      shortLabel: `${MONTH_SHORT[month]} ${String(year).slice(2)}`,
      fullLabel: `${MONTH_FULL[month]} ${year}`,
    };
  });
}

export function stageForProgress(progress: number) {
  return (
    constructionStages.find((stage) => progress <= stage.to) ??
    constructionStages[constructionStages.length - 1]
  );
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameMonth(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
  );
}

export function timelineKeyForDate(date: Date) {
  const normalized = startOfMonth(date);
  return `${normalized.getFullYear()}-${String(normalized.getMonth() + 1).padStart(2, "0")}`;
}

export function constructionStartForObject(
  object: ConstructionObject,
  now: Date = DEFAULT_MAP_DATE,
) {
  const first = constructionTimelineForObject(object, now)[0];
  return new Date(first.year, first.month, 1);
}

export function earliestConstructionStart(
  objects: ConstructionObject[],
  now: Date = DEFAULT_MAP_DATE,
) {
  let earliest = startOfMonth(now);

  for (const object of objects) {
    const start = constructionStartForObject(object, now);
    if (start.getTime() < earliest.getTime()) {
      earliest = start;
    }
  }

  return earliest;
}

export function yearsInclusive(start: Date, end: Date) {
  const years: number[] = [];
  const from = start.getFullYear();
  const to = end.getFullYear();

  for (let year = from; year <= to; year += 1) {
    years.push(year);
  }

  return years.length > 0 ? years : [to];
}

/** Pick timeline point for a map date; clamp to the object's available range. */
export function resolveTimelineKey(
  points: ConstructionTimelinePoint[],
  date: Date | null,
) {
  if (points.length === 0) {
    return "";
  }

  if (!date) {
    return points.at(-1)?.key ?? "";
  }

  const key = timelineKeyForDate(date);
  if (points.some((point) => point.key === key)) {
    return key;
  }

  const target = startOfMonth(date).getTime();
  let best = points[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const point of points) {
    const time = new Date(point.year, point.month, 1).getTime();
    const distance = Math.abs(time - target);
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }

  return best.key;
}

export function progressAtDate(
  object: ConstructionObject,
  date: Date,
  now: Date = DEFAULT_MAP_DATE,
) {
  const points = constructionTimelineForObject(object, now);
  const key = resolveTimelineKey(points, date);
  const point = points.find((item) => item.key === key) ?? points.at(-1);
  return point?.progress ?? progressForObject(object);
}

export function isConstructionCompleteAt(
  object: ConstructionObject,
  date: Date,
  now: Date = DEFAULT_MAP_DATE,
) {
  return progressAtDate(object, date, now) >= 100;
}

export function hasConstructionStartedAt(
  object: ConstructionObject,
  date: Date,
  now: Date = DEFAULT_MAP_DATE,
) {
  const start = constructionStartForObject(object, now);
  return startOfMonth(date).getTime() >= start.getTime();
}

function timelineRange(
  object: ConstructionObject,
  now: Date,
  seed: number,
) {
  const duration = 10 + ((seed * 5) % 23);

  if (object.status === "completed") {
    const endedAgo = (seed * 2) % 6;
    const end = addMonths(now, -endedAgo);
    return {
      start: addMonths(end, -(duration - 1)),
      end,
      finalProgress: 100,
    };
  }

  if (object.status === "planned") {
    const months = 1 + (seed % 3);
    return {
      start: addMonths(now, -(months - 1)),
      end: now,
      finalProgress: progressForObject(object),
    };
  }

  return {
    start: addMonths(now, -(duration - 1)),
    end: now,
    finalProgress: progressForObject(object),
  };
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function monthsInclusive(start: Date, end: Date) {
  const months: Date[] = [];
  let cursor = startOfMonth(start);
  const last = startOfMonth(end);

  while (cursor.getTime() <= last.getTime()) {
    months.push(cursor);
    cursor = addMonths(cursor, 1);
  }

  return months.length > 0 ? months : [last];
}
