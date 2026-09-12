import nearestStopsData from "@/data/nearest-stops.json";

export type NearestStopInfo = {
  objectNumber: number;
  stopName: string | null;
  distanceM: number | null;
};

const nearestStopsByObjectNumber = new Map(
  nearestStopsData.items.map((item) => [item.objectNumber, item]),
);

export function nearestStopForObjectId(objectId: string): NearestStopInfo | null {
  const objectNumber = Number.parseInt(objectId, 10);

  if (!Number.isFinite(objectNumber)) {
    return null;
  }

  const item = nearestStopsByObjectNumber.get(objectNumber);

  if (!item) {
    return null;
  }

  return {
    objectNumber: item.objectNumber,
    stopName: item.stopName,
    distanceM: item.distanceM,
  };
}

export function formatStopDistance(distanceM: number) {
  if (distanceM < 1000) {
    return `${Math.round(distanceM)} м`;
  }

  return `${(distanceM / 1000).toFixed(1).replace(".", ",")} км`;
}

/** Средняя скорость пешехода: 5 км/ч ≈ 83 м/мин. */
const WALKING_SPEED_M_PER_MIN = 5000 / 60;

export function walkingMinutesForDistance(distanceM: number) {
  return Math.max(1, Math.round(distanceM / WALKING_SPEED_M_PER_MIN));
}

export function formatWalkingTime(distanceM: number) {
  const minutes = walkingMinutesForDistance(distanceM);
  return `${minutes} мин пешком`;
}
