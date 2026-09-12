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
