export const objectCategories = {
  all: "all",
  healthcare: "healthcare",
  education: "education",
  sport: "sport",
  infrastructure: "infrastructure",
  utilities_and_parks: "utilities_and_parks",
} as const;

export type ObjectCategory =
  (typeof objectCategories)[keyof typeof objectCategories];

export const objectCategoryLabels: Record<ObjectCategory, string> = {
  all: "Все",
  healthcare: "Здравоохранение",
  education: "Образование",
  sport: "Спорт",
  infrastructure: "Инфраструктура",
  utilities_and_parks: "ЖКХ и парки",
};

export const objectCategoryValues = Object.values(
  objectCategories,
) as ObjectCategory[];

export type GeoPoint = {
  type: "Point";
  coordinates: [number, number];
};

export type CreateObjectInput = {
  grbs: string;
  oksName: string;
  category?: ObjectCategory;
  constructionStage?: string;
  address?: string;
  coordinates?: GeoPoint;
  industry?: string;
  status?: string;
  ownership?: string;
  amo?: string;
  customer?: string;
  npGpName?: string;
  fpName?: string;
  projectCode?: string;
  totalArea?: number;
  capacity?: number;
  expertise?: string;
  startYear?: number;
  endYear?: number;
  constructionPeriod?: string;
  landTransferDate?: string;
  constructionPermitDate?: string;
  contractConclusionDate?: string;
  contractPeriod?: string;
  contractor?: string;
  constructionReadiness?: number;
  equipmentInstallationDate?: string;
  hydraulicTestActDate?: string;
  zosDate?: string;
  zosNumber?: string;
  commissioningActDate?: string;
  commissioningActNumber?: string;
  commissioningYear?: number;
  photo?: string;
};

export type CreateObjectFieldErrors = Partial<
  Record<keyof CreateObjectInput | "longitude" | "latitude", string>
>;

const INT_FIELDS = new Set<keyof CreateObjectInput>([
  "startYear",
  "endYear",
  "commissioningYear",
]);

const NUMBER_FIELDS = new Set<keyof CreateObjectInput>([
  "totalArea",
  "capacity",
  "constructionReadiness",
  "startYear",
  "endYear",
  "commissioningYear",
]);

export function isObjectCategory(value: string): value is ObjectCategory {
  return objectCategoryValues.includes(value as ObjectCategory);
}

export function validateCreateObject(
  input: CreateObjectInput,
  coordinateDraft?: { longitude: string; latitude: string },
): CreateObjectFieldErrors {
  const errors: CreateObjectFieldErrors = {};

  if (!input.grbs.trim()) {
    errors.grbs = "Обязательное поле";
  }

  if (!input.oksName.trim()) {
    errors.oksName = "Обязательное поле";
  }

  if (input.category !== undefined && !isObjectCategory(input.category)) {
    errors.category = "Недопустимая категория";
  }

  for (const field of NUMBER_FIELDS) {
    const value = input[field];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
      errors[field] = "Укажите число";
      continue;
    }
    if (INT_FIELDS.has(field) && !Number.isInteger(value)) {
      errors[field] = "Укажите целое число";
    }
  }

  if (coordinateDraft) {
    const { longitude, latitude } = coordinateDraft;
    const hasLon = longitude.trim().length > 0;
    const hasLat = latitude.trim().length > 0;

    if (hasLon !== hasLat) {
      if (!hasLon) {
        errors.longitude = "Укажите долготу";
      }
      if (!hasLat) {
        errors.latitude = "Укажите широту";
      }
    } else if (hasLon && hasLat) {
      const lon = Number(longitude);
      const lat = Number(latitude);
      if (Number.isNaN(lon)) {
        errors.longitude = "Укажите число";
      }
      if (Number.isNaN(lat)) {
        errors.latitude = "Укажите число";
      }
    }
  }

  return errors;
}

export function emptyCreateObjectInput(): CreateObjectInput {
  return {
    grbs: "",
    oksName: "",
    category: objectCategories.all,
  };
}
