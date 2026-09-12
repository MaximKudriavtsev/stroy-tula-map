import { ObjectCategory } from "@/data/object-categories";
import type { OsmPoiCategory } from "@/data/osm-pois";

export type ProvisionNorm = {
  /** Радиус обслуживания, м. СП 42.13330.2016, таблица 5 / п. 10.5. */
  serviceRadiusMeters: number;
  /** Сколько человек обслуживает один объект по норме. */
  peoplePerUnit: number;
  /** Норматив в исходных единицах, как он записан в документе. */
  norm: string;
  /**
   * Пересчёт норматива в счётные объекты. У OSM POI нет мощности, поэтому там,
   * где норматив задан в местах или м², приходится допускать мощность типового
   * объекта. Это допущение, а не норматив, — показываем его в интерфейсе.
   */
  capacityAssumption: string | null;
  source: string;
};

/**
 * Ниже этого числа людей в радиусе обслуживания территория считается безлюдной:
 * обеспеченность там не определена, а не «нулевая».
 */
export const PROVISION_DEMAND_FLOOR = 50;

/**
 * Если по норме нужно меньше половины объекта, отсутствие объекта не является
 * дефицитом: норматив такую территорию обслуживать не обязывает.
 */
export const PROVISION_REQUIRED_FLOOR = 0.5;

/**
 * Норматив для образования привязан СП 42.13330.2016 к демографической структуре,
 * а не к общему числу жителей: значения 100 и 180 мест на 1 тыс. чел. из приложения Д
 * даны для населённых пунктов-новостроек при отсутствии данных. Тульская область —
 * одна из самых старых по среднему возрасту, поэтому берём фактическую структуру
 * (Туластат, начало 2024): 240 тыс. детей 0-17 лет при населении 1471,1 тыс., из них
 * 32% дошкольники 0-6 лет; школьников в 2024/25 — 149,8 тыс.
 * Дошкольные: 76,8 / 1471,1 * 1000 * 0,85 охвата = 44 места на 1 тыс. чел.
 * Школы: 149,8 / 1471,1 * 1000 = 102 места на 1 тыс. чел. при обучении в одну смену.
 */
const EDUCATION_PLACES_PER_1000 = 146;

export const provisionNorms: Record<OsmPoiCategory, ProvisionNorm> = {
  [ObjectCategory.Education]: {
    serviceRadiusMeters: 750,
    peoplePerUnit: 1900,
    norm: `${EDUCATION_PLACES_PER_1000} мест на 1 тыс. чел. (44 дошкольных + 102 школьных)`,
    capacityAssumption: "типовой объект — 280 мест (школа около 500, детский сад около 140)",
    source:
      "СП 42.13330.2016, приложение Д (охват 85% дошкольников и 100% школьников); " +
      "возрастная структура — Туластат на начало 2024",
  },
  [ObjectCategory.Healthcare]: {
    serviceRadiusMeters: 1000,
    peoplePerUnit: 6000,
    norm: "1 амбулатория или центр общей врачебной практики на 2-10 тыс. чел.",
    capacityAssumption: null,
    source:
      "Приказ Минздрава России от 27.02.2016 № 132н, приложение " +
      "(поликлиника — 1 на 20-50 тыс. чел., ФАП — в пунктах от 100 чел.)",
  },
  [ObjectCategory.Sport]: {
    serviceRadiusMeters: 1500,
    peoplePerUnit: 5700,
    norm: "60-80 м² площади пола спортивных залов на 1 тыс. чел., принято 70 м²",
    capacityAssumption: "типовой объект — спортивный зал 400 м² площади пола",
    source: "СП 42.13330.2016, приложение Д (физкультурно-спортивные сооружения)",
  },
  [ObjectCategory.Infrastructure]: {
    serviceRadiusMeters: 1000,
    peoplePerUnit: 8000,
    norm: "1 объект на 8 тыс. чел. — среднее между городской и сельской нормой",
    capacityAssumption:
      "норма различается для города и села (библиотека 1 на 20 тыс. чел. городского округа " +
      "и 1 на 1 тыс. чел. сельского поселения); применяем единое значение",
    source:
      "Распоряжение Минкультуры России от 02.08.2017 № Р-965, таблицы 1 и 6 " +
      "(библиотеки и учреждения клубного типа)",
  },
  [ObjectCategory.UtilitiesAndParks]: {
    serviceRadiusMeters: 500,
    peoplePerUnit: 1000,
    norm: "10 м² озеленённых территорий общего пользования на человека",
    capacityAssumption: "типовой объект — парк, сквер или площадка площадью 1 га",
    source: "СП 42.13330.2016, п. 9.8 и таблица 9.2",
  },
};

export const provisionCategories = Object.keys(provisionNorms) as OsmPoiCategory[];

/** Радиус самого «дальнобойного» норматива — по нему берём запас при отборе точек. */
export const maxProvisionRadiusMeters = Math.max(
  ...provisionCategories.map((category) => provisionNorms[category].serviceRadiusMeters),
);

/**
 * В режиме «Все» показываем худшую категорию: цвет отвечает на вопрос
 * «чего здесь не хватает больше всего», а не усредняет дефицит с профицитом.
 */
export const provisionCategoriesFor = (category: ObjectCategory): OsmPoiCategory[] =>
  category === ObjectCategory.All ? provisionCategories : [category];
