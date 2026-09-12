type WorldCoordinates = { x: number; y: number };

type Feature = {
  id: string;
  type: string;
  geometry: { type: string; coordinates: [number, number] };
  properties?: Record<string, unknown>;
};

type ClustererObject = {
  world: WorldCoordinates;
  lnglat: [number, number];
  clusterId: string;
  features: Feature[];
};

type RenderProps = {
  map: {
    zoom: number;
    size: { x: number; y: number };
    center: [number, number];
    projection: {
      toWorldCoordinates: (coords: [number, number]) => WorldCoordinates;
      fromWorldCoordinates: (world: WorldCoordinates) => [number, number];
    };
    bounds: [[number, number], [number, number]];
  };
  features: Feature[];
};

type RectGridOptions = {
  /** Ширина ячейки в пикселях экрана (для широких чипов — больше). */
  gridWidth: number;
  /** Высота ячейки в пикселях экрана (для невысоких маркеров — меньше). */
  gridHeight: number;
};

const convertPixelSizeToWorldSize = (
  pixels: { x: number; y: number },
  zoom: number,
) => {
  const halfWorld = (2 ** zoom / 2) * 256;
  return {
    x: pixels.x / halfWorld,
    y: pixels.y / -halfWorld,
  };
};

/**
 * Кластеризация по прямоугольной сетке.
 * Широкие маркеры требуют большей ячейки по X и меньшей по Y.
 */
export function clusterByRectGrid({
  gridWidth,
  gridHeight,
}: RectGridOptions) {
  let nextFeatureIndex = 0;
  const featureIdCharCache: Record<string, string> = {};

  const cellSizeWorld = (zoom: number) => {
    const size = convertPixelSizeToWorldSize(
      { x: gridWidth, y: gridHeight },
      zoom,
    );
    return {
      width: size.x,
      // y в world-координатах инвертирован, берём модуль высоты ячейки
      height: Math.abs(size.y),
    };
  };

  const generateClusterId = (features: Feature[]) => {
    const parts = ["cluster-"];
    for (const { id } of features) {
      if (!featureIdCharCache[id]) {
        featureIdCharCache[id] = String.fromCharCode(nextFeatureIndex);
        nextFeatureIndex += 1;
      }
      parts.push(featureIdCharCache[id]);
    }
    return parts.join("");
  };

  return {
    render({ map, features }: RenderProps): ClustererObject[] {
      const zoom = Math.round(map.zoom);
      const { width, height } = cellSizeWorld(zoom);
      const buckets = new Map<
        string,
        {
          sumX: number;
          sumY: number;
          objects: ClustererObject[];
          features: Feature[];
        }
      >();

      for (const feature of features) {
        const world = map.projection.toWorldCoordinates(
          feature.geometry.coordinates,
        );
        const object: ClustererObject = {
          world,
          lnglat: feature.geometry.coordinates,
          clusterId: "",
          features: [feature],
        };
        const key = `${Math.floor(world.x / width)}-${Math.floor(world.y / height)}`;
        let bucket = buckets.get(key);
        if (!bucket) {
          bucket = { sumX: 0, sumY: 0, objects: [], features: [] };
          buckets.set(key, bucket);
        }
        bucket.sumX += world.x;
        bucket.sumY += world.y;
        bucket.objects.push(object);
        bucket.features.push(feature);
      }

      const result: ClustererObject[] = [];
      for (const bucket of buckets.values()) {
        const count = bucket.objects.length;
        if (count === 1) {
          result.push({
            ...bucket.objects[0],
            clusterId: bucket.features[0].id,
          });
          continue;
        }

        const world = {
          x: bucket.sumX / count,
          y: bucket.sumY / count,
        };
        result.push({
          world,
          lnglat: map.projection.fromWorldCoordinates(world),
          clusterId: generateClusterId(bucket.features),
          features: bucket.features,
        });
      }

      return result;
    },
  };
}
