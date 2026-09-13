import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectEntity } from '../../object/entities/object.entity';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  /** Идентификатор пользователя MAX (без FK на AdminUser) */
  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'uuid' })
  objectId: string;

  @Column({ type: 'boolean', default: false })
  isReplied: boolean;

  @ManyToOne(() => ObjectEntity, (object) => object.reports, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'objectId' })
  object: ObjectEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
