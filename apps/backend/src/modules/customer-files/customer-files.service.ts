import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { CustomerFilesEntity } from './customer-files.entity';
import {
  CreateCustomerFilesDto,
  UpdateCustomerFilesDto,
} from './customer-files.dto';
import { ILike, IsNull } from 'typeorm';

@Injectable()
export class CustomerFilesService {
  constructor(
    @Inject('CUSTOMER_FILES_REPOSITORY')
    private customerFilesRepository: Repository<CustomerFilesEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.customerFilesRepository, options, {
      relations: ['customer'],
    });
  }

  async findAllWithFilters(
    options: IPaginationOptions,
    filters: {
      customerId?: number;
      mimeType?: string;
      search?: string;
      showArchived?: boolean;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
  ) {
    const { page, limit } = options;
    const { customerId, mimeType, search, showArchived, sortBy, sortOrder } =
      filters;

    const skip = (Number(page || 1) - 1) * Number(limit || 10);
    const take = Number(limit || 10);

    const queryBuilder = this.customerFilesRepository
      .createQueryBuilder('customerFile')
      .leftJoinAndSelect('customerFile.customer', 'customer');

    // Apply archived filter conditionally
    if (showArchived) {
      queryBuilder.where('customerFile.deleted_at IS NOT NULL');
    } else {
      queryBuilder.where('customerFile.deleted_at IS NULL');
    }

    // Apply filters
    if (customerId) {
      queryBuilder.andWhere('customerFile.fk_customer_id = :customerId', {
        customerId,
      });
    }

    if (mimeType) {
      queryBuilder.andWhere('customerFile.mime_type LIKE :mimeType', {
        mimeType: `${mimeType}%`,
      });
    }

    if (search) {
      queryBuilder.andWhere('customerFile.file_name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    // Apply sorting
    if (sortBy) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`customerFile.${sortBy}`, order);
    } else {
      queryBuilder.orderBy('customerFile.uploaded_at', 'DESC');
    }

    // Apply pagination
    queryBuilder.skip(skip).take(take);

    const [customerFiles, total] = await queryBuilder.getManyAndCount();

    return {
      items: customerFiles,
      totalItems: total,
      meta: {
        totalItems: total,
        itemsPerPage: take,
        totalPages: Math.ceil(total / take),
        currentPage: Number(page || 1),
      },
    };
  }

  findOne(pk_customer_file_id: number): Promise<CustomerFilesEntity | null> {
    return this.customerFilesRepository.findOne({
      where: { pk_customer_file_id },
      relations: ['customer'],
    });
  }

  async findAllByCustomerID(options: IPaginationOptions, customerID: number) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [customerFiles, total] =
      await this.customerFilesRepository.findAndCount({
        where: {
          fk_customer_id: customerID,
          deleted_at: IsNull(),
        },
        relations: ['customer'],
        take,
        skip,
      });

    return { items: customerFiles, totalItems: total };
  }

  async searchByFileName(options: IPaginationOptions, searchTerm: string) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [customerFiles, total] =
      await this.customerFilesRepository.findAndCount({
        where: {
          file_name: searchTerm ? ILike(`%${searchTerm}%`) : undefined,
          deleted_at: IsNull(),
        },
        relations: ['customer'],
        take,
        skip,
      });

    return { items: customerFiles, totalItems: total };
  }

  async findByMimeType(options: IPaginationOptions, mimeType: string) {
    const { page, limit } = options;

    const skip = (Number(page || 0) - 1) * Number(limit || 0);
    const take = Number(limit || 0);

    const [customerFiles, total] =
      await this.customerFilesRepository.findAndCount({
        where: {
          mime_type: mimeType,
          deleted_at: IsNull(),
        },
        relations: ['customer'],
        take,
        skip,
      });

    return { items: customerFiles, totalItems: total };
  }

  async create(
    createCustomerFilesDto: CreateCustomerFilesDto,
  ): Promise<CustomerFilesEntity> {
    const newCustomerFile = new CustomerFilesEntity();

    newCustomerFile.fk_customer_id = createCustomerFilesDto.customerID;
    newCustomerFile.file_name = createCustomerFilesDto.fileName;
    newCustomerFile.public_url = createCustomerFilesDto.publicUrl;
    newCustomerFile.mime_type = createCustomerFilesDto.mimeType;
    newCustomerFile.metadata = createCustomerFilesDto.metadata;
    newCustomerFile.uploaded_at = new Date();

    try {
      return await this.customerFilesRepository.save(newCustomerFile);
    } catch (error) {
      console.error('Error creating customer file:', error);
      throw new Error('Failed to create customer file');
    }
  }

  async remove(pk_customer_file_id: number) {
    return await this.customerFilesRepository.delete(pk_customer_file_id);
  }

  async softDelete(pk_customer_file_id: number) {
    const customerFile = await this.customerFilesRepository.findOne({
      where: { pk_customer_file_id },
    });

    if (customerFile) {
      // For soft delete, we only mark the database record as deleted
      // but keep the file in S3 for potential recovery
      customerFile.deleted_at = new Date();
      return await this.customerFilesRepository.save(customerFile);
    }

    return null;
  }

  /**
   * Permanently delete a soft-deleted file from the database
   * Note: S3 deletion is handled by the frontend API
   */
  async permanentDeleteSoftDeletedFile(pk_customer_file_id: number) {
    const customerFile = await this.customerFilesRepository.findOne({
      where: { pk_customer_file_id },
    });

    if (!customerFile) {
      throw new Error('Customer file not found');
    }

    if (!customerFile.deleted_at) {
      throw new Error('File is not soft-deleted. Use regular delete method.');
    }

    // Permanently delete from database
    // S3 deletion is handled by the frontend API before this method is called
    return await this.customerFilesRepository.delete(pk_customer_file_id);
  }

  async update(id: number, updateCustomerFilesDto: UpdateCustomerFilesDto) {
    const toUpdate = await this.customerFilesRepository.findOne({
      where: { pk_customer_file_id: id },
    });

    if (!toUpdate) {
      throw new Error('Customer file not found');
    }

    const updated = Object.assign(toUpdate, {
      file_name: updateCustomerFilesDto.fileName ?? toUpdate.file_name,
      public_url: updateCustomerFilesDto.publicUrl ?? toUpdate.public_url,
      mime_type: updateCustomerFilesDto.mimeType ?? toUpdate.mime_type,
      metadata: updateCustomerFilesDto.metadata ?? toUpdate.metadata,
    });

    return await this.customerFilesRepository.save(updated);
  }
}
