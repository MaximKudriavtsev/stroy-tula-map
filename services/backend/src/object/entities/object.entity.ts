import type { Point } from 'geojson';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectCategory } from '../enums/object-category.enum';

@Entity('objects')
export class ObjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ГРБС */
  @Column()
  grbs: string;

  /** Наименование ОКС */
  @Column()
  oksName: string;

  /** Категория */
  @Column({
    type: 'enum',
    enum: ObjectCategory,
    default: ObjectCategory.ALL,
  })
  category: ObjectCategory;

  /** Этап строительства */
  @Column({ type: 'varchar', nullable: true })
  constructionStage?: string | null;

  /** Адрес */
  @Column({ type: 'text', nullable: true })
  address?: string | null;

  /** Координаты (PostGIS) */
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  coordinates?: Point | null;

  /** Отрасль */
  @Column({ type: 'varchar', nullable: true })
  industry?: string | null;

  /** Статус */
  @Column({ type: 'varchar', nullable: true })
  status?: string | null;

  /** Собственность */
  @Column({ type: 'varchar', nullable: true })
  ownership?: string | null;

  /** АМО */
  @Column({ type: 'varchar', nullable: true })
  amo?: string | null;

  /** Заказчик */
  @Column({ type: 'varchar', nullable: true })
  customer?: string | null;

  /** Наименование НП/ГП */
  @Column({ type: 'varchar', nullable: true })
  npGpName?: string | null;

  /** Наименование ФП */
  @Column({ type: 'varchar', nullable: true })
  fpName?: string | null;

  /** Код проекта */
  @Column({ type: 'varchar', nullable: true })
  projectCode?: string | null;

  /** ОБЩАЯ пл., м2 */
  @Column({ type: 'float', nullable: true })
  totalArea?: number | null;

  /** Мощность (кол-во мест) */
  @Column({ type: 'float', nullable: true })
  capacity?: number | null;

  /** ЭКСПЕРТИЗА(Ы) */
  @Column({ type: 'varchar', nullable: true })
  expertise?: string | null;

  /** Год начала */
  @Column({ type: 'int', nullable: true })
  startYear?: number | null;

  /** Год окончания */
  @Column({ type: 'int', nullable: true })
  endYear?: number | null;

  /** Сроки строительства */
  @Column({ type: 'varchar', nullable: true })
  constructionPeriod?: string | null;

  /** Дата передачи земельного участка заказчику */
  @Column({ type: 'varchar', nullable: true })
  landTransferDate?: string | null;

  /** Дата получения разрешения на строительство (реконструкцию) */
  @Column({ type: 'varchar', nullable: true })
  constructionPermitDate?: string | null;

  /** Дата заключения контракта */
  @Column({ type: 'varchar', nullable: true })
  contractConclusionDate?: string | null;

  /** Сроки контракта */
  @Column({ type: 'varchar', nullable: true })
  contractPeriod?: string | null;

  /** Подрядчик */
  @Column({ type: 'varchar', nullable: true })
  contractor?: string | null;

  /** Строительная готовность */
  @Column({ type: 'float', nullable: true })
  constructionReadiness?: number | null;

  /** Дата установки технологического оборудования */
  @Column({ type: 'varchar', nullable: true })
  equipmentInstallationDate?: string | null;

  /** Дата акта гидравлических испытаний */
  @Column({ type: 'varchar', nullable: true })
  hydraulicTestActDate?: string | null;

  /** ЗОС — дата */
  @Column({ type: 'varchar', nullable: true })
  zosDate?: string | null;

  /** ЗОС — номер */
  @Column({ type: 'varchar', nullable: true })
  zosNumber?: string | null;

  /** АКТ ВВОДА — дата */
  @Column({ type: 'varchar', nullable: true })
  commissioningActDate?: string | null;

  /** АКТ ВВОДА — номер */
  @Column({ type: 'varchar', nullable: true })
  commissioningActNumber?: string | null;

  /** Год ввода в эксплуатацию */
  @Column({ type: 'int', nullable: true })
  commissioningYear?: number | null;

  /** Фото */
  @Column({ type: 'varchar', nullable: true })
  photo?: string | null;
}
