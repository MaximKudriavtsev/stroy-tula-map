import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateObjectDto } from './dto/create-object.dto';
import { UpdateObjectDto } from './dto/update-object.dto';
import { ObjectEntity } from './entities/object.entity';

@Injectable()
export class ObjectService {
  constructor(
    @InjectRepository(ObjectEntity)
    private readonly objectRepository: Repository<ObjectEntity>,
  ) {}

  create(createObjectDto: CreateObjectDto): Promise<ObjectEntity> {
    const entity = this.objectRepository.create(createObjectDto);
    return this.objectRepository.save(entity);
  }

  createMany(createObjectDtos: CreateObjectDto[]): Promise<ObjectEntity[]> {
    const entities = this.objectRepository.create(createObjectDtos);
    return this.objectRepository.save(entities);
  }

  findAll(): Promise<ObjectEntity[]> {
    return this.objectRepository.find();
  }

  async findOne(id: string): Promise<ObjectEntity> {
    const entity = await this.objectRepository.findOneBy({ id });
    if (!entity) {
      throw new NotFoundException(`Object with id "${id}" not found`);
    }
    return entity;
  }

  async update(
    id: string,
    updateObjectDto: UpdateObjectDto,
  ): Promise<ObjectEntity> {
    const entity = await this.findOne(id);
    Object.assign(entity, updateObjectDto);
    return this.objectRepository.save(entity);
  }

  async remove(id: string): Promise<ObjectEntity> {
    const entity = await this.findOne(id);
    return this.objectRepository.remove(entity);
  }
}
