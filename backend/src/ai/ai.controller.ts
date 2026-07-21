import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSearchDto } from './dto/ai-search.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/ai/search
   */
  @Post('search')
  search(@Body() body: AiSearchDto) {
    return this.aiService.search(body);
  }

  /**
   * GET /api/ai/search/history
   * GET /api/ai/search/history?customerId=1&limit=20
   */
  @Get('search/history')
  getSearchHistory(
    @Query('customerId') customerId?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedCustomerId =
      customerId !== undefined
        ? Number(customerId)
        : undefined;

    const parsedLimit =
      limit !== undefined
        ? Number(limit)
        : 20;

    return this.aiService.getSearchHistory(
      parsedCustomerId,
      parsedLimit,
    );
  }

  /**
   * GET /api/ai/search/:logId
   */
  @Get('search/:logId')
  getSearchDetail(
    @Param('logId', ParseIntPipe) logId: number,
  ) {
    return this.aiService.getSearchDetail(logId);
  }
}