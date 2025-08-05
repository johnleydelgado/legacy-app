import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  ValidationPipe,
  HttpStatus,
  BadRequestException, Req, Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiProperty,
} from '@nestjs/swagger';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

import { ImageGalleryService } from './image-gallery.service';
import {
  CreateImageGalleryDto,
  UpdateImageGalleryDto,
  DeleteResponseDto,
  ImageGalleryResponseDto,
  PaginationQueryDto,
  FilterImageGalleryDto,
  CreateImageGalleryUrlDto
} from './image-gallery.dto';
import { ImageGalleryEntity } from './image-gallery.entity';
import { Request, Response } from 'express';
import { FKItemType } from './image-gallery.enum';


@ApiTags('image-gallery')
@Controller({ version: '1', path: 'image-gallery' })
export class ImageGalleryController {
  constructor(private readonly imageGalleryService: ImageGalleryService) {}

  @Get('ping')
  ping(@Req() request: Request, @Res() response: Response) {
    return response.status(HttpStatus.OK).json(
      {
        data: {
          message: "This action returns all image gallery"
        }
      });
  }

  @Get()
  @ApiOperation({ summary: 'Get all images with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved images',
    type: [ImageGalleryResponseDto],
  })
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    const options: IPaginationOptions = {
      page: paginationQuery.page || 1,
      limit: paginationQuery.limit || 10,
    };

    return await this.imageGalleryService.findAll(options);
  }

  @Get('by-item')
  @ApiOperation({ summary: 'Get images filtered by item ID and type' })
  @ApiQuery({ name: 'fkItemID', required: true, type: String, description: 'Item ID to filter by' })
  @ApiQuery({ name: 'fkItemType', required: true, enum: FKItemType, description: 'Item type to filter by' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved filtered images',
    type: [ImageGalleryResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid filter parameters',
  })
  async findByItem(@Query() filterDto: FilterImageGalleryDto) {
    const options: IPaginationOptions = {
      page: filterDto.page || 1,
      limit: filterDto.limit || 10,
    };

    return await this.imageGalleryService.findByItem(
      filterDto.fkItemID,
      filterDto.fkItemType,
      options
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single image by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Image ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved image',
    type: ImageGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ImageGalleryEntity | null> {
    const image = await this.imageGalleryService.findOne(id);

    if (!image) {
      throw new BadRequestException(`Image with id ${id} not found`);
    }

    return image;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new image gallery entry' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file and metadata',
    type: CreateImageGalleryDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created image gallery entry',
    type: ImageGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or file upload failed',
  })
  @UseInterceptors(FileInterceptor('imageFile'))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) createImageGalleryDto: CreateImageGalleryDto,
  ): Promise<ImageGalleryEntity> {
    return await this.imageGalleryService.create(file, createImageGalleryDto);
  }

  @Post('url')
  @ApiOperation({ summary: 'Create a new image gallery entry from URL' })
  @ApiBody({
    description: 'Image URL and metadata',
    type: CreateImageGalleryUrlDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created image gallery entry from URL',
    type: ImageGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or URL validation failed',
  })
  async createFromUrl(
    @Body(ValidationPipe) createImageGalleryUrlDto: CreateImageGalleryUrlDto,
  ): Promise<ImageGalleryEntity> {
    return await this.imageGalleryService.createFromUrl(createImageGalleryUrlDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing image gallery entry' })
  @ApiParam({ name: 'id', type: Number, description: 'Image ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Updated image data and optional new file',
    type: UpdateImageGalleryDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated image gallery entry',
    type: ImageGalleryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or update failed',
  })
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateImageGalleryDto: UpdateImageGalleryDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ImageGalleryEntity> {
    return await this.imageGalleryService.update(id, updateImageGalleryDto, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an image gallery entry' })
  @ApiParam({ name: 'id', type: Number, description: 'Image ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully deleted image gallery entry',
    type: DeleteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Image not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Delete operation failed',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.imageGalleryService.remove(id);

    return {
      affected: result?.affected || 0,
      message: (result?.affected || 0) > 0 ? 'Image successfully deleted' : 'No image found to delete',
    };
  }
}
