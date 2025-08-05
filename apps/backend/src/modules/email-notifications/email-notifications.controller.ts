import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailNotificationsService } from './email-notifications.service';
import {
  CreateEmailNotificationDto,
  UpdateEmailNotificationDto,
} from './email-notifications.dto';
import { EmailNotificationsEntity } from './email-notifications.entity';

@ApiTags('email-notifications')
@Controller({ version: '1', path: 'email-notifications' })
export class EmailNotificationsController {
  constructor(private emailNotificationsService: EmailNotificationsService) {}

  @Get('ping')
  ping() {
    return {
      data: {
        message: 'Email notifications service is running',
      },
    };
  }

  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      return await this.emailNotificationsService.findAll({ page, limit });
    } catch (error) {
      throw new HttpException(
        'Failed to fetch email notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:status')
  async getByStatus(@Param('status') status: 'Active' | 'Inactive') {
    try {
      const notifications =
        await this.emailNotificationsService.findByStatus(status);
      return {
        data: notifications,
        message: `Found ${notifications.length} ${status.toLowerCase()} email notifications`,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch email notifications by status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: number) {
    try {
      const notification = await this.emailNotificationsService.findOne(id);
      if (!notification) {
        throw new HttpException(
          'Email notification not found',
          HttpStatus.NOT_FOUND,
        );
      }
      return {
        data: notification,
        message: 'Email notification found',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch email notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(@Body() createEmailNotificationDto: CreateEmailNotificationDto) {
    try {
      // Check if email already exists
      const existingEmail =
        await this.emailNotificationsService.findByEmailAddress(
          createEmailNotificationDto.email_address,
        );

      if (existingEmail) {
        throw new HttpException(
          'Email address already exists',
          HttpStatus.CONFLICT,
        );
      }

      const newNotification = await this.emailNotificationsService.create(
        createEmailNotificationDto,
      );
      return {
        data: newNotification,
        message: 'Email notification created successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to create email notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateEmailNotificationDto: UpdateEmailNotificationDto,
  ) {
    try {
      const updatedNotification = await this.emailNotificationsService.update(
        id,
        updateEmailNotificationDto,
      );
      return {
        data: updatedNotification,
        message: 'Email notification updated successfully',
      };
    } catch (error) {
      if (error.message === 'Email notification not found') {
        throw new HttpException(
          'Email notification not found',
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to update email notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.emailNotificationsService.remove(id);
      return {
        message: 'Email notification deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete email notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
