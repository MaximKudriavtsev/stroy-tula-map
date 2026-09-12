export enum ObjectCategory {
  All = "all",
  Healthcare = "healthcare",
  Education = "education",
  Sport = "sport",
  Infrastructure = "infrastructure",
  UtilitiesAndParks = "utilitiesAndParks",
}

export const objectCategoryLabels: Record<ObjectCategory, string> = {
  [ObjectCategory.All]: "Все",
  [ObjectCategory.Healthcare]: "Здравоохранение",
  [ObjectCategory.Education]: "Образование",
  [ObjectCategory.Sport]: "Спорт",
  [ObjectCategory.Infrastructure]: "Инфраструктура",
  [ObjectCategory.UtilitiesAndParks]: "ЖКХ и парки",
};

export const objectCategoryOrder: ObjectCategory[] = [
  ObjectCategory.All,
  ObjectCategory.Healthcare,
  ObjectCategory.Education,
  ObjectCategory.Sport,
  ObjectCategory.Infrastructure,
  ObjectCategory.UtilitiesAndParks,
];

/**
 * В режиме «Обеспеченность» сводный фильтр «Все» нечитаем, а «Инфраструктура»
 * слишком разнородна для одного норматива — оба недоступны.
 */
export const provisionUnavailableCategories: ReadonlySet<ObjectCategory> = new Set([
  ObjectCategory.All,
  ObjectCategory.Infrastructure,
]);

export const nextAvailableCategory = (
  current: ObjectCategory,
  unavailable: ReadonlySet<ObjectCategory>,
) => {
  const start = Math.max(0, objectCategoryOrder.indexOf(current));

  for (let offset = 1; offset <= objectCategoryOrder.length; offset += 1) {
    const candidate =
      objectCategoryOrder[(start + offset) % objectCategoryOrder.length];

    if (!unavailable.has(candidate)) {
      return candidate;
    }
  }

  return current;
};
