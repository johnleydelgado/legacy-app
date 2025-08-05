import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { EmailNotificationsEntity } from './email-notifications.entity';
import {
  CreateEmailNotificationDto,
  UpdateEmailNotificationDto,
} from './email-notifications.dto';

@Injectable()
export class EmailNotificationsService {
  constructor(
    @Inject('EMAIL_NOTIFICATIONS_REPOSITORY')
    private emailNotificationsRepository: Repository<EmailNotificationsEntity>,
  ) {}

  async findAll(options: IPaginationOptions) {
    return paginate(this.emailNotificationsRepository, options, {
      order: {
        created_at: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<EmailNotificationsEntity | null> {
    return this.emailNotificationsRepository.findOne({
      where: { pk_email_notification_id: id },
    });
  }

  async create(
    createEmailNotificationDto: CreateEmailNotificationDto,
  ): Promise<EmailNotificationsEntity> {
    const newEmailNotification = new EmailNotificationsEntity();

    newEmailNotification.email_address =
      createEmailNotificationDto.email_address;
    newEmailNotification.status = createEmailNotificationDto.status || 'Active';
    newEmailNotification.description =
      createEmailNotificationDto.description || null;

    return await this.emailNotificationsRepository.save(newEmailNotification);
  }

  async update(
    id: number,
    updateEmailNotificationDto: UpdateEmailNotificationDto,
  ): Promise<EmailNotificationsEntity> {
    const toUpdate = await this.emailNotificationsRepository.findOne({
      where: { pk_email_notification_id: id },
    });

    if (!toUpdate) {
      throw new Error('Email notification not found');
    }

    const updated = Object.assign(toUpdate, updateEmailNotificationDto);
    return await this.emailNotificationsRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    await this.emailNotificationsRepository.delete(id);
  }

  async findByStatus(
    status: 'Active' | 'Inactive',
  ): Promise<EmailNotificationsEntity[]> {
    return await this.emailNotificationsRepository.find({
      where: { status },
      order: {
        created_at: 'DESC',
      },
    });
  }

  async findByEmailAddress(
    emailAddress: string,
  ): Promise<EmailNotificationsEntity | null> {
    return await this.emailNotificationsRepository.findOne({
      where: { email_address: emailAddress },
    });
  }
}
