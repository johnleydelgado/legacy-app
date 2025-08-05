import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { QuotesApprovalController } from './quotes-approval.controller';
import { QuotesApprovalService } from './quotes-approval.service';
import { QuotesApprovalProvider } from './quotes-approval.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [QuotesApprovalController],
  providers: [...QuotesApprovalProvider, QuotesApprovalService],
  exports: [QuotesApprovalService],
})
export class QuotesApprovalModule {}
