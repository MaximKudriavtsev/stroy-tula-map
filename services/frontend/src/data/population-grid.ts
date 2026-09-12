import populationGridSnapshot from "@/data/population-grid.json";

/** Гекс H3 res 8 (~400 м): [долгота центра, широта центра, население]. */
export type PopulationHex = [longitude: number, latitude: number, population: number];

export type PopulationGridSnapshot = {
  attribution: string;
  fetchedAt: string;
  source: string;
  resolution: number;
  count: number;
  total: number;
  hexes: PopulationHex[];
};

export const populationGridData = populationGridSnapshot as PopulationGridSnapshot;

export const populationHexes: PopulationHex[] = populationGridData.hexes;

export const populationTotal = populationGridData.total;
