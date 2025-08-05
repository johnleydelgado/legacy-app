import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { stringToBlob } from '../../utils/string_tools';
import { ActivityTypeEntity } from './activity-type.entity';


@Injectable()
export class ActivityTypeService {
  constructor(
    @Inject('ACTIVITY_TYPE_REPOSITORY')
    private activityTypeRepository: Repository<ActivityTypeEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.activityTypeRepository, options);
  }

  findOne(id: number): Promise<ActivityTypeEntity | null> {
    return this.activityTypeRepository.findOne({ where: { id } });
  }

  findByTypeName(type_name: string): Promise<ActivityTypeEntity | null> {
    return this.activityTypeRepository.findOne({ where: { type_name: `${type_name}` } });
  }

  // async create(
  //   createActivityHistoryDTO: CreateActivityHistoryDTO,
  // ): Promise<ActivityHistoryEntity> {
  //   const newActivityHistory = new ActivityHistoryEntity();
  //   newActivityHistory.fk_customer_id = createActivityHistoryDTO.customerID;
  //   newActivityHistory.status = createActivityHistoryDTO.status;
  //   newActivityHistory.tags = stringToBlob(createActivityHistoryDTO.tags);
  //   newActivityHistory.activity = createActivityHistoryDTO.activity;
  //   newActivityHistory.activity_type = createActivityHistoryDTO.activityType;
  //   newActivityHistory.document_id = createActivityHistoryDTO.documentID;
  //   newActivityHistory.document_type = createActivityHistoryDTO.documentType;
  //
  //   newActivityHistory.created_at = new Date();
  //   newActivityHistory.updated_at = new Date();
  //
  //   return await this.activityTypeRepository.save(newActivityHistory);
  // }

  // async remove(pk_activity_id: number) {
  //   return await this.activityTypeRepository.delete(pk_activity_id);
  // }

  // async update(id: number, updateActivityHistoryDto: UpdateActivityHistoryDto) {
  //   const toUpdate = await this.activityTypeRepository.findOne({
  //     where: { pk_activity_id: id },
  //   });
  //   const updated = Object.assign(
  //     {
  //       pk_activity_id: toUpdate?.pk_activity_id,
  //       fk_customer_id: toUpdate?.fk_customer_id,
  //       status: toUpdate?.status,
  //       tags: toUpdate?.tags,
  //       activity: toUpdate?.activity,
  //       activity_type: toUpdate?.activity_type,
  //       document_id: toUpdate?.document_id,
  //       document_type: toUpdate?.document_type,
  //       created_at: toUpdate?.created_at,
  //       updated_at: toUpdate?.updated_at
  //     },
  //     {
  //       status: updateActivityHistoryDto.status,
  //       tags: stringToBlob(updateActivityHistoryDto.tags || ""),
  //       activity: updateActivityHistoryDto.activity,
  //       activityType: updateActivityHistoryDto.activityType,
  //       documentID: updateActivityHistoryDto.documentID,
  //       documentType: updateActivityHistoryDto.documentType,
  //       updated_at: new Date(),
  //     },
  //   );
  //   return await this.activityTypeRepository.save(updated);
  // }
}
