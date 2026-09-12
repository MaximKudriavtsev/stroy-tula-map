import type { Point } from 'geojson';
import { ObjectCategory } from '../enums/object-category.enum';

export class CreateObjectDto {
  /** ГРБС */
  grbs: string;

  /** Наименование ОКС */
  oksName: string;

  /** Категория (по умолчанию all) */
  category?: ObjectCategory = ObjectCategory.ALL;

  /** Этап строительства */
  constructionStage?: string;

  /** Адрес */
  address?: string;

  /** Координаты (PostGIS Point, GeoJSON: [lon, lat]) */
  coordinates?: Point;

  /** Отрасль */
  industry?: string;

  /** Статус */
  status?: string;

  /** Собственность */
  ownership?: string;

  /** АМО */
  amo?: string;

  /** Заказчик */
  customer?: string;

  /** Наименование НП/ГП */
  npGpName?: string;

  /** Наименование ФП */
  fpName?: string;

  /** Код проекта */
  projectCode?: string;

  /** ОБЩАЯ пл., м2 */
  totalArea?: number;

  /** Мощность (кол-во мест) */
  capacity?: number;

  /** ЭКСПЕРТИЗА(Ы) */
  expertise?: string;

  /** Год начала */
  startYear?: number;

  /** Год окончания */
  endYear?: number;

  /** Сроки строительства */
  constructionPeriod?: string;

  /** Дата передачи земельного участка заказчику */
  landTransferDate?: string;

  /** Дата получения разрешения на строительство (реконструкцию) */
  constructionPermitDate?: string;

  /** Дата заключения контракта */
  contractConclusionDate?: string;

  /** Сроки контракта */
  contractPeriod?: string;

  /** Подрядчик */
  contractor?: string;

  /** Строительная готовность */
  constructionReadiness?: number;

  /** Дата установки технологического оборудования */
  equipmentInstallationDate?: string;

  /** Дата акта гидравлических испытаний */
  hydraulicTestActDate?: string;

  /** ЗОС — дата */
  zosDate?: string;

  /** ЗОС — номер */
  zosNumber?: string;

  /** АКТ ВВОДА — дата */
  commissioningActDate?: string;

  /** АКТ ВВОДА — номер */
  commissioningActNumber?: string;

  /** Год ввода в эксплуатацию */
  commissioningYear?: number;

  /** Фото */
  photo?: string;
}
