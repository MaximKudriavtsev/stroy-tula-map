import { ObjectBuildStatus } from "@/data/object-build-status";
import { ObjectCategory } from "@/data/object-categories";
import type { ConstructionObject } from "@/data/objects";

export type ObjectChipCategory = Exclude<ObjectCategory, ObjectCategory.All>;

export function inferObjectCategory(name: string): ObjectChipCategory {
  const text = name.toLowerCase();

  if (
    /школ|детск|сада|образован|лицей|гимназ|ясел|ясли/.test(text)
  ) {
    return ObjectCategory.Education;
  }

  if (/больниц|поликлин|здрав|онко|мед|клиник/.test(text)) {
    return ObjectCategory.Healthcare;
  }

  if (/спорт|стадион|ледов|арена|бассейн|физкульт/.test(text)) {
    return ObjectCategory.Sport;
  }

  if (
    /парк|сквер|благоустр|жкх|очистн|водоснаб|канализ|теплосет|освещен/.test(
      text,
    )
  ) {
    return ObjectCategory.UtilitiesAndParks;
  }

  return ObjectCategory.Infrastructure;
}

export function progressForObject(object: ConstructionObject) {
  if (object.status === "completed") {
    return 100;
  }

  if (object.status === "planned") {
    return 8;
  }

  const seed = Number.parseInt(object.id, 10) || 1;
  return 28 + ((seed * 17) % 67);
}

export function buildStatusForProgress(progress: number) {
  if (progress >= 100) {
    return ObjectBuildStatus.Completed;
  }

  if (progress <= 10) {
    return ObjectBuildStatus.Planned;
  }

  if (progress >= 85) {
    return ObjectBuildStatus.OpeningSoon;
  }

  return ObjectBuildStatus.InProgress;
}

export function buildStatusForObject(
  _object: ConstructionObject,
  progress: number,
) {
  return buildStatusForProgress(progress);
}

export function countObjectsByCategory(
  objects: ConstructionObject[],
): Record<ObjectCategory, number> {
  const counts: Record<ObjectCategory, number> = {
    [ObjectCategory.All]: objects.length,
    [ObjectCategory.Healthcare]: 0,
    [ObjectCategory.Education]: 0,
    [ObjectCategory.Sport]: 0,
    [ObjectCategory.Infrastructure]: 0,
    [ObjectCategory.UtilitiesAndParks]: 0,
  };

  for (const object of objects) {
    counts[inferObjectCategory(object.name)] += 1;
  }

  return counts;
}
