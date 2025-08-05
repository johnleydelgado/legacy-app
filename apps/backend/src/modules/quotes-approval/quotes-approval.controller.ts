import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { QuotesApprovalService } from './quotes-approval.service';
import {
  CreateQuoteApprovalDto,
  UpdateQuoteApprovalDto,
} from './quotes-approval.dto';

@Controller({ version: '1', path: 'quotes-approval' })
export class QuotesApprovalController {
  constructor(private readonly quotesApprovalService: QuotesApprovalService) {}

  @Post()
  create(@Body() createQuoteApprovalDto: CreateQuoteApprovalDto) {
    return this.quotesApprovalService.create(createQuoteApprovalDto);
  }

  @Get()
  findAll() {
    return this.quotesApprovalService.findAll();
  }

  @Get('quote/:quoteId')
  findByQuoteId(
    @Param('quoteId') quoteId: string,
    @Query('latest') latest?: string,
  ) {
    return this.quotesApprovalService.findByQuoteId(
      +quoteId,
      latest === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesApprovalService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuoteApprovalDto: UpdateQuoteApprovalDto,
  ) {
    return this.quotesApprovalService.update(+id, updateQuoteApprovalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesApprovalService.remove(+id);
  }

  @Get('token/:tokenHash')
  findByToken(@Param('tokenHash') tokenHash: string) {
    return this.quotesApprovalService.findByToken(tokenHash);
  }
}
