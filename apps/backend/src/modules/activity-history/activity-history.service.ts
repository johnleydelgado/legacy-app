import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { ActivityHistoryEntity } from './activity-history.entity';
import { CreateActivityHistoryDTO, UpdateActivityHistoryDto } from './activity-history.dto';
import { stringToBlob } from '../../utils/string_tools';
import { ActivityTypeService } from '../activity-type/activity-type.service';
import { ActivityTypeEntity } from '../activity-type/activity-type.entity';


@Injectable()
export class ActivityHistoryService {
  constructor(
    @Inject('ACTIVITY_HISTORY_REPOSITORY')
    private activityHistoryRepository: Repository<ActivityHistoryEntity>,
    private activityTypeService: ActivityTypeService,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.activityHistoryRepository, options);
  }

  async findByCustomerId(customerId: number, options: IPaginationOptions) {
    const queryBuilder = this.activityHistoryRepository
      .createQueryBuilder('activity')
      .where('activity.fk_customer_id = :customerId', { customerId })
      .orderBy('activity.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }

  async findByDocumentId(
    documentID: number, 
    documentType: string, 
    activityTypeNames: string[] | undefined,
    options: IPaginationOptions
  ) {
    const queryBuilder = this.activityHistoryRepository
      .createQueryBuilder('activity')
      .where('activity.document_id = :documentID AND activity.document_type = :documentType', { documentID, documentType });

    if (activityTypeNames && activityTypeNames.length > 0) {
      queryBuilder.andWhere('activity.activity_type IN (:...activityTypeNames)', { activityTypeNames });
    }

    queryBuilder.orderBy('activity.created_at', 'DESC');

    return paginate(queryBuilder, options);
  }

  findOne(pk_activity_id: number): Promise<ActivityHistoryEntity | null> {
    return this.activityHistoryRepository.findOne({ where: { pk_activity_id } });
  }

  async create(
    createActivityHistoryDTO: CreateActivityHistoryDTO,
  ): Promise<ActivityHistoryEntity> {
    const newActivityHistory = new ActivityHistoryEntity();
    newActivityHistory.fk_customer_id = createActivityHistoryDTO.customerID;
    newActivityHistory.status = createActivityHistoryDTO.status;
    newActivityHistory.tags = stringToBlob(createActivityHistoryDTO.tags);
    newActivityHistory.activity = createActivityHistoryDTO.activity;
    newActivityHistory.activity_type = createActivityHistoryDTO.activityType;
    newActivityHistory.document_id = createActivityHistoryDTO.documentID;
    newActivityHistory.document_type = createActivityHistoryDTO.documentType;
    newActivityHistory.user_owner = createActivityHistoryDTO.userOwner;

    newActivityHistory.created_at = new Date();
    newActivityHistory.updated_at = new Date();

    return await this.activityHistoryRepository.save(newActivityHistory);
  }

  async remove(pk_activity_id: number) {
    return await this.activityHistoryRepository.delete(pk_activity_id);
  }

  async update(id: number, updateActivityHistoryDto: UpdateActivityHistoryDto) {
    const toUpdate = await this.activityHistoryRepository.findOne({
      where: { pk_activity_id: id },
    });
    const updated = Object.assign(
      {
        pk_activity_id: toUpdate?.pk_activity_id,
        fk_customer_id: toUpdate?.fk_customer_id,
        status: toUpdate?.status,
        tags: toUpdate?.tags,
        activity: toUpdate?.activity,
        activity_type: toUpdate?.activity_type,
        document_id: toUpdate?.document_id,
        document_type: toUpdate?.document_type,
        user_owner: toUpdate?.user_owner,
        created_at: toUpdate?.created_at,
        updated_at: toUpdate?.updated_at
      },
      {
        status: updateActivityHistoryDto.status,
        tags: stringToBlob(updateActivityHistoryDto.tags || ""),
        activity: updateActivityHistoryDto.activity,
        activityType: updateActivityHistoryDto.activityType,
        documentID: updateActivityHistoryDto.documentID,
        documentType: updateActivityHistoryDto.documentType,
        userOwner: updateActivityHistoryDto.userOwner,
        updated_at: new Date(),
      },
    );
    return await this.activityHistoryRepository.save(updated);
  }
}
