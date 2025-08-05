import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { QuotesApprovalEntity } from './quotes-approval.entity';
import {
  CreateQuoteApprovalDto,
  UpdateQuoteApprovalDto,
} from './quotes-approval.dto';

@Injectable()
export class QuotesApprovalService {
  constructor(
    @Inject('QUOTES_APPROVAL_REPOSITORY')
    private quotesApprovalRepository: Repository<QuotesApprovalEntity>,
  ) {}

  async create(
    createQuoteApprovalDto: CreateQuoteApprovalDto,
  ): Promise<QuotesApprovalEntity> {
    const quoteApproval = this.quotesApprovalRepository.create(
      createQuoteApprovalDto,
    );
    return await this.quotesApprovalRepository.save(quoteApproval);
  }

  async findAll(): Promise<QuotesApprovalEntity[]> {
    return await this.quotesApprovalRepository.find();
  }

  async findOne(id: number): Promise<QuotesApprovalEntity> {
    const quoteApproval = await this.quotesApprovalRepository.findOne({
      where: { id },
    });
    if (!quoteApproval) {
      throw new NotFoundException(`Quote approval with ID ${id} not found`);
    }
    return quoteApproval;
  }

  async update(
    id: number,
    updateQuoteApprovalDto: UpdateQuoteApprovalDto,
  ): Promise<QuotesApprovalEntity> {
    const quoteApproval = await this.findOne(id);
    Object.assign(quoteApproval, updateQuoteApprovalDto);
    return await this.quotesApprovalRepository.save(quoteApproval);
  }

  async remove(id: number): Promise<void> {
    const result = await this.quotesApprovalRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Quote approval with ID ${id} not found`);
    }
  }

  async findByQuoteId(
    quoteId: number,
    latest: boolean = false,
  ): Promise<QuotesApprovalEntity | null> {
    const queryBuilder = this.quotesApprovalRepository
      .createQueryBuilder('quoteApproval')
      .where('quoteApproval.quoteId = :quoteId', { quoteId });

    if (latest) {
      queryBuilder.orderBy('quoteApproval.id', 'DESC');
    }

    const quoteApproval = await queryBuilder.getOne();
    return quoteApproval;
  }

  async findByToken(tokenHash: string): Promise<QuotesApprovalEntity> {
    const quoteApproval = await this.quotesApprovalRepository.findOne({
      where: { tokenHash },
    });
    if (!quoteApproval) {
      throw new NotFoundException(`Quote approval with token not found`);
    }
    return quoteApproval;
  }
}
