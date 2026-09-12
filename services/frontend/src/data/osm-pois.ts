import { ObjectCategory } from "@/data/object-categories";
import osmPoisSnapshot from "@/data/osm-pois.json";

export type OsmPoiCategory = Exclude<ObjectCategory, ObjectCategory.All>;

export type OsmPoi = {
  id: string;
  name: string | null;
  category: OsmPoiCategory;
  longitude: number;
  latitude: number;
};

export type OsmPoisSnapshot = {
  attribution: string;
  fetchedAt: string;
  source: string;
  count: number;
  counts: Partial<Record<OsmPoiCategory, number>>;
  pois: OsmPoi[];
};

export const osmPoisData = osmPoisSnapshot as OsmPoisSnapshot;

export const osmPois: OsmPoi[] = osmPoisData.pois;

export const countOsmPoisByCategory = (
  pois: OsmPoi[],
): Record<ObjectCategory, number> => {
  const counts: Record<ObjectCategory, number> = {
    [ObjectCategory.All]: pois.length,
    [ObjectCategory.Healthcare]: 0,
    [ObjectCategory.Education]: 0,
    [ObjectCategory.Sport]: 0,
    [ObjectCategory.Infrastructure]: 0,
    [ObjectCategory.UtilitiesAndParks]: 0,
  };

  for (const poi of pois) {
    counts[poi.category] += 1;
  }

  return counts;
};

export const filterOsmPois = (
  pois: OsmPoi[],
  category: ObjectCategory,
  searchQuery: string,
): OsmPoi[] => {
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("ru");

  return pois.filter((poi) => {
    if (category !== ObjectCategory.All && poi.category !== category) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const name = (poi.name ?? "").toLocaleLowerCase("ru");
    return name.includes(normalizedQuery);
  });
};
