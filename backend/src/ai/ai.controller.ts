import { Controller, Post } from '@nestjs/common';
@Controller('ai')
export class AiController {
  @Post('search-test')
  testSearch() {
    return { message: 'AI Search API is working!' };
  }
}