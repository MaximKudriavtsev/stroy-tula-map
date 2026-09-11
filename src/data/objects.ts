export const constructionStatuses = {
  planned: "planned",
  inProgress: "in_progress",
  completed: "completed",
} as const;

export type ConstructionStatus =
  (typeof constructionStatuses)[keyof typeof constructionStatuses];

export type ConstructionObject = {
  id: string;
  name: string;
  address: string;
  municipality: string;
  status: ConstructionStatus;
  longitude: number;
  latitude: number;
};

export const statusLabels: Record<ConstructionStatus, string> = {
  planned: "Планируется",
  in_progress: "Строится",
  completed: "Построен",
};

/**
 * Локальная заглушка. Позже заменится данными из API / БД.
 * Координаты ориентировочные, объекты вымышленные.
 */
export const constructionObjects: ConstructionObject[] = [
  {
    id: "stub-tula-school",
    name: "Школа № 58",
    address: "ул. Оборонная, Тула",
    municipality: "г. Тула",
    status: "in_progress",
    longitude: 37.6173,
    latitude: 54.1931,
  },
  {
    id: "stub-novomoskovsk-sports",
    name: "ФОК «Новомосковск»",
    address: "ул. Комсомольская, Новомосковск",
    municipality: "г. Новомосковск",
    status: "completed",
    longitude: 38.2846,
    latitude: 54.0109,
  },
  {
    id: "stub-shchekino-kindergarten",
    name: "Детский сад на 220 мест",
    address: "ул. Ленина, Щёкино",
    municipality: "Щёкинский район",
    status: "in_progress",
    longitude: 37.5179,
    latitude: 54.0021,
  },
  {
    id: "stub-aleksin-clinic",
    name: "Поликлиника",
    address: "ул. Тульская, Алексин",
    municipality: "г. Алексин",
    status: "planned",
    longitude: 37.0674,
    latitude: 54.505,
  },
  {
    id: "stub-efremov-housing",
    name: "Жилой комплекс «Южный»",
    address: "ул. Мира, Ефремов",
    municipality: "г. Ефремов",
    status: "in_progress",
    longitude: 38.1053,
    latitude: 53.1464,
  },
];
