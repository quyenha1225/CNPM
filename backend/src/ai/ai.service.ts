import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner } from 'typeorm';
import { AiSearchDto } from './dto/ai-search.dto';
import { GoogleGenAI } from '@google/genai';
export type SearchIntent =
  | 'product_search'
  | 'non_product'
  | 'unclear';

export interface ParsedRequirements {
  intent: SearchIntent;
  confidence: number;
  rejectReason: string | null;
  productType: string | null;
  categorySlug: string | null;
  brand: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  purposes: string[];
  targetUsers: string[];
  requiredAttributes: Record<
    string,
    string | number | boolean
  >;
  recommendedTabCount: number | null;
  keywords: string[];
}

export interface ProductAttributeRow {
  attributeCode: string;
  attributeName: string;
  attributeValue: string;
  numericValue: number | string | null;
  normalizedValue: string | null;
}

export interface CandidateProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  brandId: number | null;
  brand: string | null;
  imageUrl: string | null;
  rating: number | string | null;
  reviewCount: number | string | null;
  stockQuantity: number | string;
  attributes?: ProductAttributeRow[];
  tags?: string[];
}

export interface ScoredProduct {
  productId: number;
  productName: string;
  productSlug: string;
  description: string | null;
  price: number;
  category: string;
  categorySlug: string;
  brand: string | null;
  imageUrl: string | null;
  rating: number;
  reviewCount: number;
  stockQuantity: number;
  matchScore: number;
  matchReasons: string[];
  matchedAttributes: Record<string, unknown>;
  tags: string[];
}

export interface SearchResponse {
  success: boolean;
  searchLogId: number;
  query: string;
  ai: {
    provider: string;
    model: string;
    processingTimeMs: number;
  };
  parsedRequirements: ParsedRequirements;
  exactBudgetMatch: boolean;
  message: string;
  total: number;
  products: ScoredProduct[];
}

@Injectable()
export class AiService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async search(dto: AiSearchDto): Promise<SearchResponse> {
    const startedAt = Date.now();
    const query = dto.query?.trim();

    if (!query) {
      throw new BadRequestException(
        'Bạn cần nhập nội dung tìm kiếm.',
      );
    }

    if (query.length > 1000) {
      throw new BadRequestException(
        'Nội dung tìm kiếm không được vượt quá 1000 ký tự.',
      );
    }

    const limit = this.normalizeLimit(dto.limit);

    let parsedRequirements: ParsedRequirements;
    let aiProvider = 'LOCAL_FALLBACK';
    let aiModel = 'RULE_BASED';

    try {
  console.log('Đang gọi Gemini...');

  const aiResult =
    await this.parseQueryWithExternalAi(query);

  if (aiResult) {
    console.log('Gemini gọi thành công:', {
      provider: aiResult.provider,
      model: aiResult.model,
      requirements: aiResult.requirements,
    });

    parsedRequirements = aiResult.requirements;
    aiProvider = aiResult.provider;
    aiModel = aiResult.model;
  } else {
    console.warn(
      'Không có GEMINI_API_KEY, chuyển sang LOCAL_FALLBACK.',
    );

    parsedRequirements = this.parseQueryLocally(query);
  }
} catch (error: unknown) {
  const errorMessage =
    error instanceof Error
      ? error.message
      : String(error);

  console.error('========== GEMINI FAILED ==========');
  console.error('Message:', errorMessage);
  console.error('Full error:', error);
  console.error('Chuyển sang LOCAL_FALLBACK');
  console.error('===================================');

  parsedRequirements = this.parseQueryLocally(query);
}

    /*
     * Chỉ truy vấn MySQL khi câu nhập thực sự là
     * yêu cầu tìm kiếm hoặc tư vấn sản phẩm.
     */
    this.assertValidProductSearch(
      parsedRequirements,
    );

    const customerId = await this.resolveCustomerId(
      dto.customerId,
    );

    try {
      let candidates = await this.findCandidateProducts(
        parsedRequirements,
        false,
      );

      let usedRelaxedBudget = false;

      if (candidates.length === 0) {
        candidates = await this.findCandidateProducts(
          parsedRequirements,
          true,
        );

        usedRelaxedBudget = true;
      }

      const hydratedCandidates =
        await this.attachAttributesAndTags(candidates);

      const scoredProducts = hydratedCandidates
        .map((product) =>
          this.scoreProduct(
            product,
            parsedRequirements,
            usedRelaxedBudget,
          ),
        )
        .filter((product) => product.stockQuantity > 0)
        .sort((firstProduct, secondProduct) => {
          if (
            secondProduct.matchScore !==
            firstProduct.matchScore
          ) {
            return (
              secondProduct.matchScore -
              firstProduct.matchScore
            );
          }

          return firstProduct.price - secondProduct.price;
        })
        .slice(0, limit);

      const processingTimeMs = Date.now() - startedAt;

      const logId = await this.saveSearchLogAndResults({
        customerId,
        query,
        parsedRequirements,
        aiProvider,
        aiModel,
        processingTimeMs,
        results: scoredProducts,
      });

      return {
        success: true,
        searchLogId: logId,
        query,
        ai: {
          provider: aiProvider,
          model: aiModel,
          processingTimeMs,
        },
        parsedRequirements,
        exactBudgetMatch: !usedRelaxedBudget,
        message: this.buildResponseMessage(
          scoredProducts,
          parsedRequirements,
          usedRelaxedBudget,
        ),
        total: scoredProducts.length,
        products: scoredProducts,
      };
    } catch (error: unknown) {
      const processingTimeMs = Date.now() - startedAt;

      const errorMessage =
        error instanceof Error
          ? error.message
          : String(error);

      console.error('AI SEARCH ERROR FULL:', error);
      console.error(
        'AI SEARCH ERROR MESSAGE:',
        errorMessage,
      );

      await this.saveFailedSearchLog({
        customerId,
        query,
        parsedRequirements,
        aiProvider,
        aiModel,
        processingTimeMs,
        error,
      });

      throw new InternalServerErrorException({
        message: 'Không thể thực hiện tìm kiếm AI.',
        detail: errorMessage,
      });
    }
  }

  async getSearchHistory(
    customerId?: number,
    requestedLimit = 20,
  ) {
    const limit = Math.min(
      Math.max(Number(requestedLimit) || 20, 1),
      100,
    );

    const parameters: unknown[] = [];
    let customerCondition = '';

    if (
      customerId !== undefined &&
      Number.isInteger(customerId) &&
      customerId > 0
    ) {
      customerCondition = 'WHERE asl.customer_id = ?';
      parameters.push(customerId);
    }

    parameters.push(limit);

    const rows = await this.dataSource.query(
      `
      SELECT
        asl.ai_search_log_id AS searchLogId,
        asl.customer_id AS customerId,
        asl.query_text AS query,
        asl.detected_intent AS detectedIntent,
        asl.detected_product_type AS detectedProductType,
        asl.detected_min_price AS detectedMinPrice,
        asl.detected_max_price AS detectedMaxPrice,
        asl.detected_purpose AS detectedPurpose,
        asl.parsed_requirements AS parsedRequirements,
        asl.ai_provider AS aiProvider,
        asl.ai_model AS aiModel,
        asl.processing_time_ms AS processingTimeMs,
        asl.search_status AS searchStatus,
        asl.error_message AS errorMessage,
        asl.searched_at AS searchedAt,
        COUNT(aisr.product_id) AS resultCount
      FROM ai_search_logs asl
      LEFT JOIN ai_search_results aisr
        ON aisr.ai_search_log_id =
           asl.ai_search_log_id
      ${customerCondition}
      GROUP BY
        asl.ai_search_log_id,
        asl.customer_id,
        asl.query_text,
        asl.detected_intent,
        asl.detected_product_type,
        asl.detected_min_price,
        asl.detected_max_price,
        asl.detected_purpose,
        asl.parsed_requirements,
        asl.ai_provider,
        asl.ai_model,
        asl.processing_time_ms,
        asl.search_status,
        asl.error_message,
        asl.searched_at
      ORDER BY asl.searched_at DESC
      LIMIT ?
      `,
      parameters,
    );

    return {
      success: true,
      total: rows.length,
      history: rows.map((row: any) => ({
        ...row,
        detectedMinPrice:
          row.detectedMinPrice !== null
            ? Number(row.detectedMinPrice)
            : null,
        detectedMaxPrice:
          row.detectedMaxPrice !== null
            ? Number(row.detectedMaxPrice)
            : null,
        resultCount: Number(row.resultCount ?? 0),
        parsedRequirements: this.safeJsonParse(
          row.parsedRequirements,
        ),
      })),
    };
  }

  async getSearchDetail(logId: number) {
    if (!Number.isInteger(logId) || logId <= 0) {
      throw new BadRequestException(
        'searchLogId không hợp lệ.',
      );
    }

    const logRows = await this.dataSource.query(
      `
      SELECT
        asl.ai_search_log_id AS searchLogId,
        asl.customer_id AS customerId,
        asl.query_text AS query,
        asl.detected_intent AS detectedIntent,
        asl.detected_product_type AS detectedProductType,
        asl.detected_brand_id AS detectedBrandId,
        asl.detected_min_price AS detectedMinPrice,
        asl.detected_max_price AS detectedMaxPrice,
        asl.detected_purpose AS detectedPurpose,
        asl.parsed_requirements AS parsedRequirements,
        asl.ai_provider AS aiProvider,
        asl.ai_model AS aiModel,
        asl.processing_time_ms AS processingTimeMs,
        asl.search_status AS searchStatus,
        asl.error_message AS errorMessage,
        asl.searched_at AS searchedAt
      FROM ai_search_logs asl
      WHERE asl.ai_search_log_id = ?
      LIMIT 1
      `,
      [logId],
    );

    const log = logRows[0];

    if (!log) {
      throw new NotFoundException(
        'Không tìm thấy lịch sử tìm kiếm AI.',
      );
    }

    const resultRows = await this.dataSource.query(
      `
      SELECT
        aisr.result_rank AS resultRank,
        aisr.match_score AS matchScore,
        aisr.match_reasons AS matchReasons,
        aisr.matched_attributes AS matchedAttributes,
        aisr.created_at AS createdAt,

        p.product_id AS productId,
        p.product_name AS productName,
        p.product_slug AS productSlug,
        p.product_description AS description,
        p.base_price AS price,
        p.average_rating AS rating,
        p.review_count AS reviewCount,

        c.category_name AS category,
        c.category_slug AS categorySlug,
        b.brand_name AS brand,

        (
  SELECT pi_sub.image_url
  FROM product_images pi_sub
  WHERE pi_sub.product_id = p.product_id
    AND pi_sub.is_thumbnail = TRUE
  LIMIT 1
) AS imageUrl,

        COALESCE(vps.current_stock, 0)
          AS stockQuantity

      FROM ai_search_results aisr

      JOIN products p
        ON p.product_id = aisr.product_id

      LEFT JOIN categories c
        ON c.category_id = p.category_id

      LEFT JOIN brands b
        ON b.brand_id = p.brand_id

      LEFT JOIN vw_product_stock vps
        ON vps.product_id = p.product_id

      WHERE aisr.ai_search_log_id = ?
      ORDER BY aisr.result_rank ASC
      `,
      [logId],
    );

    return {
      success: true,
      search: {
        ...log,
        detectedMinPrice:
          log.detectedMinPrice !== null
            ? Number(log.detectedMinPrice)
            : null,
        detectedMaxPrice:
          log.detectedMaxPrice !== null
            ? Number(log.detectedMaxPrice)
            : null,
        parsedRequirements: this.safeJsonParse(
          log.parsedRequirements,
        ),
      },
      total: resultRows.length,
      products: resultRows.map((row: any) => ({
        ...row,
        resultRank: Number(row.resultRank),
        matchScore: Number(row.matchScore ?? 0),
        price: Number(row.price ?? 0),
        rating: Number(row.rating ?? 0),
        reviewCount: Number(row.reviewCount ?? 0),
        stockQuantity: Number(row.stockQuantity ?? 0),
        matchReasons:
          this.safeJsonParse(row.matchReasons) ?? [],
        matchedAttributes:
          this.safeJsonParse(row.matchedAttributes) ?? {},
      })),
    };
  }

  private async parseQueryWithExternalAi(
    query: string,
  ): Promise<{
    requirements: ParsedRequirements;
    provider: string;
    model: string;
  } | null> {
    const apiKey =
      this.configService.get<string>(
        'GEMINI_API_KEY',
      );

    if (!apiKey) {
      console.warn(
        'GEMINI_API_KEY chưa được cấu hình, dùng LOCAL_FALLBACK.',
      );

      return null;
    }

    const model =
      this.configService.get<string>(
        'GEMINI_MODEL',
      ) || 'gemini-3-flash-preview';

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
Bạn là bộ phân loại và phân tích nhu cầu tìm kiếm
cho cửa hàng thiết bị công nghệ ElectroShop.

Nhiệm vụ đầu tiên:
Xác định câu người dùng có liên quan đến việc tìm kiếm,
tư vấn, so sánh hoặc mua sản phẩm công nghệ hay không.

Website chỉ kinh doanh các nhóm:
- Laptop
- Điện thoại
- Màn hình
- Phụ kiện
- Linh kiện PC như RAM, SSD, CPU, GPU

Chỉ trả về một JSON object hợp lệ.
Không dùng markdown.
Không giải thích bên ngoài JSON.

Cấu trúc bắt buộc:
{
  "intent": "product_search | non_product | unclear",
  "confidence": 0.0,
  "rejectReason": string | null,
  "productType": string | null,
  "categorySlug": string | null,
  "brand": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "purposes": string[],
  "targetUsers": string[],
  "requiredAttributes": {},
  "recommendedTabCount": number | null,
  "keywords": string[]
}

Quy tắc phân loại:

1. Dùng intent = "product_search" khi người dùng:
- Tìm một sản phẩm công nghệ.
- Cần tư vấn sản phẩm.
- Muốn mua hoặc so sánh sản phẩm.
- Đưa ra ngân sách, cấu hình hoặc mục đích sử dụng.

2. Dùng intent = "non_product" khi câu hỏi thuộc:
- Địa lý.
- Lịch sử.
- Thời tiết.
- Chính trị.
- Y tế.
- Nấu ăn.
- Kiến thức chung.
- Chủ đề không liên quan đến sản phẩm công nghệ.

3. Dùng intent = "unclear" khi:
- Người dùng có vẻ muốn mua sản phẩm nhưng không nói rõ.
- Không xác định được sản phẩm, nhu cầu hoặc tiêu chí.

Ví dụ 1:
Câu: "Tỉnh thành nào ở Hà Nội?"
Kết quả:
{
  "intent": "non_product",
  "confidence": 0.99,
  "rejectReason": "Câu hỏi địa lý không liên quan đến tìm kiếm sản phẩm.",
  "productType": null,
  "categorySlug": null,
  "brand": null,
  "minPrice": null,
  "maxPrice": null,
  "purposes": [],
  "targetUsers": [],
  "requiredAttributes": {},
  "recommendedTabCount": null,
  "keywords": []
}

Ví dụ 2:
Câu: "Tôi cần một cái tốt"
Kết quả:
{
  "intent": "unclear",
  "confidence": 0.8,
  "rejectReason": "Chưa xác định được loại sản phẩm cần tìm.",
  "productType": null,
  "categorySlug": null,
  "brand": null,
  "minPrice": null,
  "maxPrice": null,
  "purposes": [],
  "targetUsers": [],
  "requiredAttributes": {},
  "recommendedTabCount": null,
  "keywords": []
}

Ví dụ 3:
Câu: "Laptop cho sinh viên lập trình dưới 20 triệu"
Kết quả:
{
  "intent": "product_search",
  "confidence": 0.98,
  "rejectReason": null,
  "productType": "laptop",
  "categorySlug": "laptop",
  "brand": null,
  "minPrice": null,
  "maxPrice": 20000000,
  "purposes": ["học tập", "lập trình"],
  "targetUsers": ["sinh viên"],
  "requiredAttributes": {},
  "recommendedTabCount": null,
  "keywords": ["laptop", "sinh viên", "lập trình"]
}

Quy tắc dữ liệu:
- Giá phải chuyển thành số VND.
- "2 triệu" = 2000000.
- "500 nghìn" = 500000.
- confidence phải nằm trong khoảng 0 đến 1.
- productType có thể là:
  laptop, điện thoại, ram, ssd, cpu, gpu,
  màn hình, chuột, bàn phím, tai nghe, phụ kiện.
- categorySlug chỉ được là:
  laptop,
  dien-thoai,
  linh-kien-pc,
  man-hinh,
  phu-kien.
- Không tự tạo sản phẩm.
- Không tự tạo giá.
- Không tự thêm yêu cầu người dùng không nói.
- Với non_product hoặc unclear, các trường sản phẩm
  không xác định phải để null hoặc mảng rỗng.

Câu người dùng:
${JSON.stringify(query)}
    `.trim();

    try {
      const response =
        await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0,
            responseMimeType:
              'application/json',
          },
        });

      const outputText =
        response.text?.trim();

      if (!outputText) {
        throw new Error(
          'Gemini không trả về nội dung.',
        );
      }

      const jsonText =
        this.extractJsonObject(outputText);

      const parsed = JSON.parse(jsonText);

      return {
        requirements:
          this.normalizeParsedRequirements(
            parsed,
            query,
          ),
        provider: 'GEMINI',
        model,
      };
    } catch (error) {
      console.error(
        'Gemini API parse failed:',
        error,
      );

      throw error;
    }
  }

  private extractOpenAiOutputText(
    responseData: any,
  ): string {
    if (
      typeof responseData?.output_text === 'string'
    ) {
      return responseData.output_text.trim();
    }

    if (!Array.isArray(responseData?.output)) {
      return '';
    }

    const texts: string[] = [];

    for (const outputItem of responseData.output) {
      if (!Array.isArray(outputItem?.content)) {
        continue;
      }

      for (const contentItem of outputItem.content) {
        if (
          typeof contentItem?.text === 'string' &&
          (contentItem.type === 'output_text' ||
            contentItem.type === 'text')
        ) {
          texts.push(contentItem.text);
        }
      }
    }

    return texts.join('\n').trim();
  }

  private extractJsonObject(text: string): string {
    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const startIndex = cleanedText.indexOf('{');
    const endIndex = cleanedText.lastIndexOf('}');

    if (
      startIndex === -1 ||
      endIndex === -1 ||
      endIndex < startIndex
    ) {
      throw new Error(
        'Không tìm thấy JSON trong phản hồi AI.',
      );
    }

    return cleanedText.slice(
      startIndex,
      endIndex + 1,
    );
  }

  private normalizeParsedRequirements(
    parsed: any,
    originalQuery: string,
  ): ParsedRequirements {
    const allowedIntents:
      SearchIntent[] = [
        'product_search',
        'non_product',
        'unclear',
      ];

    const rawIntent =
      typeof parsed?.intent === 'string'
        ? parsed.intent
            .trim()
            .toLowerCase()
        : 'unclear';

    const intent: SearchIntent =
      allowedIntents.includes(
        rawIntent as SearchIntent,
      )
        ? (rawIntent as SearchIntent)
        : 'unclear';

    const rawConfidence =
      Number(parsed?.confidence);

    const defaultConfidence =
      intent === 'product_search'
        ? 0.7
        : intent === 'non_product'
          ? 0.9
          : 0.5;

    const confidence =
      Number.isFinite(rawConfidence)
        ? Math.min(
            Math.max(
              rawConfidence,
              0,
            ),
            1,
          )
        : defaultConfidence;

    const normalizedKeywords =
      this.normalizeStringArray(
        parsed?.keywords,
      );

    return {
      intent,

      confidence,

      rejectReason:
        this.normalizeOptionalString(
          parsed?.rejectReason,
        ),

      productType:
        this.normalizeOptionalString(
          parsed?.productType,
        ),

      categorySlug:
        this.normalizeOptionalString(
          parsed?.categorySlug,
        ),

      brand:
        this.normalizeOptionalString(
          parsed?.brand,
        ),

      minPrice:
        this.normalizeNullableNumber(
          parsed?.minPrice,
        ),

      maxPrice:
        this.normalizeNullableNumber(
          parsed?.maxPrice,
        ),

      purposes:
        this.normalizeStringArray(
          parsed?.purposes,
        ),

      targetUsers:
        this.normalizeStringArray(
          parsed?.targetUsers,
        ),

      requiredAttributes:
        parsed?.requiredAttributes &&
        typeof parsed.requiredAttributes ===
          'object' &&
        !Array.isArray(
          parsed.requiredAttributes,
        )
          ? parsed.requiredAttributes
          : {},

      recommendedTabCount:
        this.normalizeNullableNumber(
          parsed?.recommendedTabCount,
        ),

      keywords:
        intent === 'product_search'
          ? normalizedKeywords.length > 0
            ? normalizedKeywords
            : this.extractKeywords(
                originalQuery,
              )
          : [],
    };
  }

  private parseQueryLocally(
    query: string,
  ): ParsedRequirements {
    const normalizedQuery =
      this.normalizeText(query);

    const productTypeMap: Array<{
      type: string;
      categorySlug: string;
      patterns: string[];
    }> = [
      {
        type: 'ram',
        categorySlug: 'linh-kien-pc',
        patterns: ['ram', 'bo nho ram'],
      },
      {
        type: 'ssd',
        categorySlug: 'linh-kien-pc',
        patterns: ['ssd', 'o cung'],
      },
      {
        type: 'cpu',
        categorySlug: 'linh-kien-pc',
        patterns: ['cpu', 'bo vi xu ly'],
      },
      {
        type: 'gpu',
        categorySlug: 'linh-kien-pc',
        patterns: [
          'gpu',
          'card man hinh',
          'card do hoa',
          'vga',
        ],
      },
      {
        type: 'laptop',
        categorySlug: 'laptop',
        patterns: [
          'laptop',
          'may tinh xach tay',
          'may tinh',
        ],
      },
      {
        type: 'điện thoại',
        categorySlug: 'dien-thoai',
        patterns: [
          'dien thoai',
          'smartphone',
          'iphone',
          'samsung galaxy',
        ],
      },
      {
        type: 'màn hình',
        categorySlug: 'man-hinh',
        patterns: [
          'man hinh',
          'monitor',
        ],
      },
      {
        type: 'phụ kiện',
        categorySlug: 'phu-kien',
        patterns: [
          'phu kien',
          'chuot',
          'ban phim',
          'tai nghe',
          'webcam',
          'loa',
          'cap sac',
          'sac',
        ],
      },
    ];

    let productType:
      string | null = null;

    let categorySlug:
      string | null = null;

    for (const item of productTypeMap) {
      const matched =
        item.patterns.some((pattern) =>
          normalizedQuery.includes(
            pattern,
          ),
        );

      if (matched) {
        productType = item.type;
        categorySlug =
          item.categorySlug;
        break;
      }
    }

    const purposes: string[] = [];

    const purposePatterns: Record<
      string,
      string[]
    > = {
      'học tập': [
        'hoc tap',
        'hoc online',
        'sinh vien',
        'hoc sinh',
      ],
      'lập trình': [
        'lap trinh',
        'code',
        'developer',
      ],
      'văn phòng': [
        'van phong',
        'office',
        'word',
        'excel',
      ],
      'đa nhiệm': [
        'da nhiem',
        'nhieu tab',
        'mo nhieu tab',
      ],
      gaming: [
        'gaming',
        'choi game',
        'game',
      ],
      'đồ họa': [
        'do hoa',
        'photoshop',
        'illustrator',
      ],
      render: [
        'render',
        'dung phim',
        'video',
      ],
      'chụp ảnh': [
        'chup anh',
        'camera',
      ],
    };

    for (const [
      purpose,
      patterns,
    ] of Object.entries(
      purposePatterns,
    )) {
      const matched =
        patterns.some((pattern) =>
          normalizedQuery.includes(
            pattern,
          ),
        );

      if (matched) {
        purposes.push(purpose);
      }
    }

    const targetUsers: string[] = [];

    const targetUserPatterns: Record<
      string,
      string[]
    > = {
      'sinh viên': ['sinh vien'],
      'học sinh': ['hoc sinh'],
      'nhân viên văn phòng': [
        'nhan vien van phong',
        'dan van phong',
      ],
      'lập trình viên': [
        'lap trinh vien',
        'developer',
      ],
      'game thủ': [
        'game thu',
        'gamer',
      ],
    };

    for (const [
      targetUser,
      patterns,
    ] of Object.entries(
      targetUserPatterns,
    )) {
      const matched =
        patterns.some((pattern) =>
          normalizedQuery.includes(
            pattern,
          ),
        );

      if (matched) {
        targetUsers.push(
          targetUser,
        );
      }
    }

    const priceRange =
      this.extractPriceRange(
        normalizedQuery,
      );

    const recommendedTabCount =
      this.extractRecommendedTabCount(
        normalizedQuery,
      );

    const brandCandidates = [
      'apple',
      'samsung',
      'xiaomi',
      'oppo',
      'asus',
      'acer',
      'lenovo',
      'hp',
      'dell',
      'msi',
      'corsair',
      'kingston',
      'intel',
      'amd',
      'nvidia',
      'gigabyte',
    ];

    const brand =
      brandCandidates.find((item) =>
        normalizedQuery.includes(item),
      ) ?? null;

    const shoppingPatterns = [
      'mua',
      'tu van',
      'goi y',
      'nen chon',
      'so sanh',
      'tim san pham',
      'gia bao nhieu',
      'con hang',
      'ngan sach',
      'bao nhieu tien',
    ];

    const hasShoppingIntent =
      shoppingPatterns.some((pattern) =>
        normalizedQuery.includes(
          pattern,
        ),
      ) ||
      priceRange.minPrice !== null ||
      priceRange.maxPrice !== null ||
      purposes.length > 0 ||
      targetUsers.length > 0;

    const hasProductSignal = Boolean(
      productType ||
      categorySlug ||
      brand ||
      recommendedTabCount !== null,
    );

    let intent: SearchIntent;
    let confidence: number;
    let rejectReason: string | null;

    if (hasProductSignal) {
      intent = 'product_search';
      confidence = 0.85;
      rejectReason = null;
    } else if (hasShoppingIntent) {
      intent = 'unclear';
      confidence = 0.7;
      rejectReason =
        'Chưa xác định được loại sản phẩm cần tìm.';
    } else {
      intent = 'non_product';
      confidence = 0.95;
      rejectReason =
        'Nội dung không liên quan đến tìm kiếm sản phẩm công nghệ.';
    }

    return {
      intent,
      confidence,
      rejectReason,
      productType,
      categorySlug,
      brand,
      minPrice: priceRange.minPrice,
      maxPrice: priceRange.maxPrice,
      purposes,
      targetUsers,
      requiredAttributes: {},
      recommendedTabCount,
      keywords:
        intent === 'product_search'
          ? this.extractKeywords(query)
          : [],
    };
  }

  private assertValidProductSearch(
    requirements: ParsedRequirements,
  ): void {
    if (
      requirements.intent ===
      'non_product'
    ) {
      throw new BadRequestException(
        requirements.rejectReason ||
          'Nội dung không liên quan đến tìm kiếm sản phẩm công nghệ.',
      );
    }

    if (
      requirements.intent ===
      'unclear'
    ) {
      throw new BadRequestException(
        requirements.rejectReason ||
          'Yêu cầu chưa đủ rõ ràng. Hãy nhập loại sản phẩm, mục đích sử dụng hoặc ngân sách.',
      );
    }

    if (requirements.confidence < 0.55) {
      throw new BadRequestException(
        'Hệ thống chưa xác định rõ nhu cầu sản phẩm. Ví dụ: Laptop học lập trình dưới 20 triệu.',
      );
    }

    const hasRequirement = Boolean(
      requirements.productType ||
      requirements.categorySlug ||
      requirements.brand ||
      requirements.minPrice !== null ||
      requirements.maxPrice !== null ||
      requirements.purposes.length > 0 ||
      requirements.targetUsers.length > 0 ||
      requirements.recommendedTabCount !==
        null ||
      Object.keys(
        requirements.requiredAttributes,
      ).length > 0,
    );

    if (!hasRequirement) {
      throw new BadRequestException(
        'Không tìm thấy tiêu chí sản phẩm trong nội dung. Hãy mô tả rõ sản phẩm cần tìm.',
      );
    }
  }

  private extractPriceRange(
    normalizedQuery: string,
  ): {
    minPrice: number | null;
    maxPrice: number | null;
  } {
    let minPrice: number | null = null;
    let maxPrice: number | null = null;

    const rangeMillionMatch =
      normalizedQuery.match(
        /(?:tu|khoang)\s+(\d+(?:[.,]\d+)?)\s*(?:den|-)\s*(\d+(?:[.,]\d+)?)\s*trieu/,
      );

    if (rangeMillionMatch) {
      minPrice =
        this.parseVietnameseNumber(
          rangeMillionMatch[1],
        ) * 1_000_000;

      maxPrice =
        this.parseVietnameseNumber(
          rangeMillionMatch[2],
        ) * 1_000_000;

      return {
        minPrice: Math.round(minPrice),
        maxPrice: Math.round(maxPrice),
      };
    }

    const maxMillionMatch =
      normalizedQuery.match(
        /(?:duoi|khong qua|toi da|tam)\s+(\d+(?:[.,]\d+)?)\s*trieu/,
      );

    if (maxMillionMatch) {
      maxPrice =
        this.parseVietnameseNumber(
          maxMillionMatch[1],
        ) * 1_000_000;
    }

    const minMillionMatch =
      normalizedQuery.match(
        /(?:tren|toi thieu|tu)\s+(\d+(?:[.,]\d+)?)\s*trieu/,
      );

    if (minMillionMatch) {
      minPrice =
        this.parseVietnameseNumber(
          minMillionMatch[1],
        ) * 1_000_000;
    }

    const maxThousandMatch =
      normalizedQuery.match(
        /(?:duoi|khong qua|toi da|tam)\s+(\d+(?:[.,]\d+)?)\s*(?:k|nghin|ngan)/,
      );

    if (maxThousandMatch) {
      maxPrice =
        this.parseVietnameseNumber(
          maxThousandMatch[1],
        ) * 1_000;
    }

    const rawNumberMatch =
      normalizedQuery.match(
        /(?:duoi|khong qua|toi da)\s+(\d{6,})/,
      );

    if (
      rawNumberMatch &&
      maxPrice === null
    ) {
      maxPrice = Number(rawNumberMatch[1]);
    }

    return {
      minPrice:
        minPrice !== null
          ? Math.round(minPrice)
          : null,

      maxPrice:
        maxPrice !== null
          ? Math.round(maxPrice)
          : null,
    };
  }

  private extractRecommendedTabCount(
    normalizedQuery: string,
  ): number | null {
    const rangeMatch = normalizedQuery.match(
      /(\d+)\s*(?:den|-)\s*(\d+)\s*tab/,
    );

    if (rangeMatch) {
      return Number(rangeMatch[2]);
    }

    const singleMatch = normalizedQuery.match(
      /(\d+)\s*tab/,
    );

    if (singleMatch) {
      return Number(singleMatch[1]);
    }

    return null;
  }

  private async findCandidateProducts(
    requirements: ParsedRequirements,
    ignoreBudget: boolean,
  ): Promise<CandidateProduct[]> {
    if (
      requirements.intent !==
      'product_search'
    ) {
      throw new BadRequestException(
        'Không được truy vấn sản phẩm cho nội dung không liên quan.',
      );
    }

    const whereConditions: string[] = [
      `p.product_status = 'ACTIVE'`,
    ];

    const parameters: unknown[] = [];

    if (
      requirements.categorySlug &&
      requirements.categorySlug !==
        'linh-kien-pc'
    ) {
      whereConditions.push(
        'c.category_slug = ?',
      );

      parameters.push(
        requirements.categorySlug,
      );
    }

    if (requirements.brand) {
      whereConditions.push(
        `LOWER(COALESCE(b.brand_name, '')) LIKE ?`,
      );

      parameters.push(
        `%${this.normalizeText(
          requirements.brand,
        )}%`,
      );
    }

    if (
      !ignoreBudget &&
      requirements.minPrice !== null
    ) {
      whereConditions.push(
        'p.base_price >= ?',
      );

      parameters.push(
        requirements.minPrice,
      );
    }

    if (
      !ignoreBudget &&
      requirements.maxPrice !== null
    ) {
      whereConditions.push(
        'p.base_price <= ?',
      );

      parameters.push(
        requirements.maxPrice,
      );
    }

    if (requirements.productType) {
      const productTypeKeyword =
        this.normalizeText(
          requirements.productType,
        );

      whereConditions.push(`
        (
          LOWER(p.product_name) LIKE ?

          OR LOWER(c.category_name) LIKE ?

          OR EXISTS (
            SELECT 1
            FROM product_attribute_values pav_filter

            JOIN product_attributes pa_filter
              ON pa_filter.attribute_id =
                 pav_filter.attribute_id

            WHERE pav_filter.product_id =
                  p.product_id

              AND (
                LOWER(
                  COALESCE(
                    pav_filter.normalized_value,
                    ''
                  )
                ) LIKE ?

                OR LOWER(
                  pav_filter.attribute_value
                ) LIKE ?
              )
          )

          OR EXISTS (
            SELECT 1
            FROM product_tag_mapping ptm_filter

            JOIN product_tags pt_filter
              ON pt_filter.tag_id =
                 ptm_filter.tag_id

            WHERE ptm_filter.product_id =
                  p.product_id

              AND LOWER(
                pt_filter.tag_name
              ) LIKE ?
          )
        )
      `);

      const keywordLike =
        `%${productTypeKeyword}%`;

      parameters.push(
        keywordLike,
        keywordLike,
        keywordLike,
        keywordLike,
        keywordLike,
      );
    } else if (requirements.categorySlug) {
      whereConditions.push(
        'c.category_slug = ?',
      );

      parameters.push(
        requirements.categorySlug,
      );
    }

    const rows = await this.dataSource.query(
      `
      SELECT
        p.product_id AS id,
        p.product_name AS name,
        p.product_slug AS slug,
        p.product_description AS description,
        p.base_price AS price,
        p.category_id AS categoryId,

        c.category_name AS categoryName,
        c.category_slug AS categorySlug,

        p.brand_id AS brandId,
        b.brand_name AS brand,

        (
  SELECT pi_sub.image_url
  FROM product_images pi_sub
  WHERE pi_sub.product_id = p.product_id
    AND pi_sub.is_thumbnail = TRUE
  LIMIT 1
) AS imageUrl,

        p.average_rating AS rating,
        p.review_count AS reviewCount,

        COALESCE(
          vps.current_stock,
          0
        ) AS stockQuantity

      FROM products p

      JOIN categories c
        ON c.category_id =
           p.category_id

      LEFT JOIN brands b
        ON b.brand_id =
           p.brand_id

      LEFT JOIN vw_product_stock vps
        ON vps.product_id =
           p.product_id

      WHERE ${whereConditions.join(' AND ')}

      ORDER BY
        CASE
          WHEN COALESCE(
            vps.current_stock,
            0
          ) > 0
            THEN 0
          ELSE 1
        END ASC,

        p.average_rating DESC,
        p.base_price ASC

      LIMIT 100
      `,
      parameters,
    );

    return rows;
  }

  private async attachAttributesAndTags(
    products: CandidateProduct[],
  ): Promise<CandidateProduct[]> {
    if (products.length === 0) {
      return [];
    }

    const productIds = products.map((product) =>
      Number(product.id),
    );

    const placeholders = productIds
      .map(() => '?')
      .join(',');

    const attributeRows =
      await this.dataSource.query(
        `
        SELECT
          pav.product_id AS productId,
          pa.attribute_code AS attributeCode,
          pa.attribute_name AS attributeName,
          pav.attribute_value AS attributeValue,
          pav.numeric_value AS numericValue,
          pav.normalized_value AS normalizedValue

        FROM product_attribute_values pav

        JOIN product_attributes pa
          ON pa.attribute_id =
             pav.attribute_id

        WHERE pav.product_id IN (
          ${placeholders}
        )
        `,
        productIds,
      );

    const tagRows =
      await this.dataSource.query(
        `
        SELECT
          ptm.product_id AS productId,
          pt.tag_name AS tagName

        FROM product_tag_mapping ptm

        JOIN product_tags pt
          ON pt.tag_id =
             ptm.tag_id

        WHERE ptm.product_id IN (
          ${placeholders}
        )
        `,
        productIds,
      );

    const attributesByProduct =
      new Map<number, ProductAttributeRow[]>();

    for (const row of attributeRows) {
      const productId = Number(row.productId);

      const currentAttributes =
        attributesByProduct.get(productId) ?? [];

      currentAttributes.push({
        attributeCode: row.attributeCode,
        attributeName: row.attributeName,
        attributeValue: row.attributeValue,
        numericValue: row.numericValue,
        normalizedValue: row.normalizedValue,
      });

      attributesByProduct.set(
        productId,
        currentAttributes,
      );
    }

    const tagsByProduct =
      new Map<number, string[]>();

    for (const row of tagRows) {
      const productId = Number(row.productId);

      const currentTags =
        tagsByProduct.get(productId) ?? [];

      currentTags.push(row.tagName);

      tagsByProduct.set(
        productId,
        currentTags,
      );
    }

    return products.map((product) => ({
      ...product,

      attributes:
        attributesByProduct.get(
          Number(product.id),
        ) ?? [],

      tags:
        tagsByProduct.get(
          Number(product.id),
        ) ?? [],
    }));
  }

  private scoreProduct(
    product: CandidateProduct,
    requirements: ParsedRequirements,
    usedRelaxedBudget: boolean,
  ): ScoredProduct {
    let score = 10;

    const reasons: string[] = [];

    const matchedAttributes:
      Record<string, unknown> = {};

    const price = Number(product.price ?? 0);

    const stockQuantity = Number(
      product.stockQuantity ?? 0,
    );

    const attributes =
      product.attributes ?? [];

    const tags =
      product.tags ?? [];

    const searchableText =
      this.normalizeText(
        [
          product.name,
          product.description,
          product.categoryName,
          product.categorySlug,
          product.brand,
          ...tags,
          ...attributes.flatMap(
            (attribute) => [
              attribute.attributeCode,
              attribute.attributeName,
              attribute.attributeValue,
              attribute.normalizedValue,
            ],
          ),
        ]
          .filter(Boolean)
          .join(' '),
      );

    if (stockQuantity > 0) {
      score += 10;

      reasons.push(
        `Còn ${stockQuantity} sản phẩm trong kho`,
      );
    } else {
      score -= 100;

      reasons.push(
        'Sản phẩm hiện đã hết hàng',
      );
    }

    if (requirements.productType) {
      const normalizedProductType =
        this.normalizeText(
          requirements.productType,
        );

      if (
        searchableText.includes(
          normalizedProductType,
        )
      ) {
        score += 20;

        reasons.push(
          `Đúng loại sản phẩm ${requirements.productType}`,
        );

        matchedAttributes.productType =
          requirements.productType;
      }
    }

    if (
      requirements.brand &&
      product.brand
    ) {
      const normalizedBrand =
        this.normalizeText(
          requirements.brand,
        );

      const normalizedProductBrand =
        this.normalizeText(
          product.brand,
        );

      if (
        normalizedProductBrand.includes(
          normalizedBrand,
        )
      ) {
        score += 10;

        reasons.push(
          `Đúng thương hiệu ${product.brand}`,
        );

        matchedAttributes.brand =
          product.brand;
      }
    }

    const isAboveMinimumPrice =
      requirements.minPrice === null ||
      price >= requirements.minPrice;

    const isBelowMaximumPrice =
      requirements.maxPrice === null ||
      price <= requirements.maxPrice;

    if (
      isAboveMinimumPrice &&
      isBelowMaximumPrice
    ) {
      score += 25;

      if (
        requirements.maxPrice !== null
      ) {
        reasons.push(
          `Giá ${this.formatVnd(
            price,
          )} nằm trong ngân sách`,
        );
      }

      matchedAttributes.price = price;
    } else if (
      usedRelaxedBudget &&
      requirements.maxPrice !== null &&
      price > requirements.maxPrice
    ) {
      const difference =
        price - requirements.maxPrice;

      const differencePercent =
        difference /
        requirements.maxPrice;

      if (differencePercent <= 0.25) {
        score += 8;
      } else if (
        differencePercent <= 0.5
      ) {
        score += 3;
      }

      reasons.push(
        `Vượt ngân sách khoảng ${this.formatVnd(
          difference,
        )}`,
      );
    }

    let purposeScore = 0;

    for (
      const purpose of requirements.purposes
    ) {
      if (
        searchableText.includes(
          this.normalizeText(purpose),
        )
      ) {
        purposeScore += 8;

        reasons.push(
          `Phù hợp nhu cầu ${purpose}`,
        );
      }
    }

    score += Math.min(
      purposeScore,
      24,
    );

    let targetUserScore = 0;

    for (
      const targetUser of
      requirements.targetUsers
    ) {
      if (
        searchableText.includes(
          this.normalizeText(
            targetUser,
          ),
        )
      ) {
        targetUserScore += 8;

        reasons.push(
          `Phù hợp với ${targetUser}`,
        );
      }
    }

    score += Math.min(
      targetUserScore,
      16,
    );

    if (
      requirements.recommendedTabCount !==
      null
    ) {
      const tabAttribute =
        attributes.find(
          (attribute) =>
            attribute.attributeCode ===
            'RAM_RECOMMENDED_TAB_COUNT',
        );

      if (tabAttribute) {
        const supportedTabCount = Number(
          tabAttribute.numericValue ??
            tabAttribute.attributeValue,
        );

        if (
          Number.isFinite(
            supportedTabCount,
          ) &&
          supportedTabCount >=
            requirements.recommendedTabCount
        ) {
          score += 15;

          reasons.push(
            `Phù hợp mở khoảng ${requirements.recommendedTabCount} tab`,
          );

          matchedAttributes
            .recommendedTabCount =
            supportedTabCount;
        } else if (
          Number.isFinite(
            supportedTabCount,
          )
        ) {
          score -= 5;
        }
      }
    }

    for (
      const keyword of
      requirements.keywords.slice(0, 8)
    ) {
      const normalizedKeyword =
        this.normalizeText(keyword);

      if (
        normalizedKeyword.length >= 3 &&
        searchableText.includes(
          normalizedKeyword,
        )
      ) {
        score += 2;
      }
    }

    const rating =
      Number(product.rating ?? 0);

    if (rating >= 4.5) {
      score += 5;

      reasons.push(
        'Sản phẩm có đánh giá cao',
      );
    } else if (rating >= 4) {
      score += 3;
    }

    const normalizedScore = Math.max(
      0,
      Math.min(
        100,
        Number(score.toFixed(2)),
      ),
    );

    return {
      productId: Number(product.id),
      productName: product.name,
      productSlug: product.slug,
      description: product.description,
      price,
      category: product.categoryName,
      categorySlug: product.categorySlug,
      brand: product.brand,
      imageUrl: product.imageUrl,
      rating,
      reviewCount: Number(
        product.reviewCount ?? 0,
      ),
      stockQuantity,
      matchScore: normalizedScore,
      matchReasons: [...new Set(reasons)],
      matchedAttributes,
      tags,
    };
  }

  private async saveSearchLogAndResults(
    input: {
      customerId: number | null;
      query: string;
      parsedRequirements:
        ParsedRequirements;
      aiProvider: string;
      aiModel: string;
      processingTimeMs: number;
      results: ScoredProduct[];
    },
  ): Promise<number> {
    const queryRunner =
      this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const brandId =
        await this.findBrandId(
          input.parsedRequirements.brand,
          queryRunner,
        );

      const categoryId =
        await this.findCategoryId(
          input.parsedRequirements
            .categorySlug,
          queryRunner,
        );

      const logInsertResult =
        await queryRunner.query(
          `
          INSERT INTO ai_search_logs (
            customer_id,
            query_text,
            detected_intent,
            detected_category_id,
            detected_product_type,
            detected_brand_id,
            detected_min_price,
            detected_max_price,
            detected_purpose,
            parsed_requirements,
            ai_provider,
            ai_model,
            processing_time_ms,
            search_status,
            error_message
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, 'SUCCESS', NULL
          )
          `,
          [
            input.customerId,
            input.query,
            input.parsedRequirements.intent,
            categoryId,
            input.parsedRequirements
              .productType,
            brandId,
            input.parsedRequirements
              .minPrice,
            input.parsedRequirements
              .maxPrice,
            input.parsedRequirements
              .purposes.join(', '),
            JSON.stringify(
              input.parsedRequirements,
            ),
            input.aiProvider,
            input.aiModel,
            input.processingTimeMs,
          ],
        );

      const searchLogId =
        Number(logInsertResult.insertId);

      for (
        let index = 0;
        index < input.results.length;
        index += 1
      ) {
        const result =
          input.results[index];

        await queryRunner.query(
          `
          INSERT INTO ai_search_results (
            ai_search_log_id,
            product_id,
            result_rank,
            match_score,
            match_reasons,
            matched_attributes
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            searchLogId,
            result.productId,
            index + 1,
            result.matchScore,
            JSON.stringify(
              result.matchReasons,
            ),
            JSON.stringify(
              result.matchedAttributes,
            ),
          ],
        );
      }

      await queryRunner.commitTransaction();

      return searchLogId;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async saveFailedSearchLog(
    input: {
      customerId: number | null;
      query: string;
      parsedRequirements:
        ParsedRequirements;
      aiProvider: string;
      aiModel: string;
      processingTimeMs: number;
      error: unknown;
    },
  ): Promise<void> {
    try {
      let errorMessage = 'Unknown error';

      if (input.error instanceof Error) {
        errorMessage =
          input.error.message.slice(0, 500);
      } else if (
        typeof input.error === 'string'
      ) {
        errorMessage =
          input.error.slice(0, 500);
      }

      await this.dataSource.query(
        `
        INSERT INTO ai_search_logs (
          customer_id,
          query_text,
          detected_intent,
          detected_product_type,
          detected_min_price,
          detected_max_price,
          detected_purpose,
          parsed_requirements,
          ai_provider,
          ai_model,
          processing_time_ms,
          search_status,
          error_message
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          'FAILED', ?
        )
        `,
        [
          input.customerId,
          input.query,
          input.parsedRequirements.intent,
          input.parsedRequirements
            .productType,
          input.parsedRequirements.minPrice,
          input.parsedRequirements.maxPrice,
          input.parsedRequirements
            .purposes.join(', '),
          JSON.stringify(
            input.parsedRequirements,
          ),
          input.aiProvider,
          input.aiModel,
          input.processingTimeMs,
          errorMessage,
        ],
      );
    } catch (loggingError) {
      console.error(
        'Không thể lưu failed AI search log:',
        loggingError,
      );
    }
  }

  private async resolveCustomerId(
    customerId?: number,
  ): Promise<number | null> {
    if (
      customerId === undefined ||
      customerId === null ||
      !Number.isInteger(Number(customerId)) ||
      Number(customerId) <= 0
    ) {
      return null;
    }

    const rows = await this.dataSource.query(
      `
      SELECT user_id
      FROM users
      WHERE user_id = ?
      LIMIT 1
      `,
      [Number(customerId)],
    );

    return rows.length > 0
      ? Number(customerId)
      : null;
  }

  private async findBrandId(
    brand: string | null,
    queryRunner: QueryRunner,
  ): Promise<number | null> {
    if (!brand) {
      return null;
    }

    const rows = await queryRunner.query(
      `
      SELECT brand_id
      FROM brands
      WHERE LOWER(brand_name) LIKE ?
      LIMIT 1
      `,
      [
        `%${this.normalizeText(brand)}%`,
      ],
    );

    return rows[0]
      ? Number(rows[0].brand_id)
      : null;
  }

  private async findCategoryId(
    categorySlug: string | null,
    queryRunner: QueryRunner,
  ): Promise<number | null> {
    if (!categorySlug) {
      return null;
    }

    const rows = await queryRunner.query(
      `
      SELECT category_id
      FROM categories
      WHERE category_slug = ?
      LIMIT 1
      `,
      [categorySlug],
    );

    return rows[0]
      ? Number(rows[0].category_id)
      : null;
  }

  private buildResponseMessage(
    products: ScoredProduct[],
    requirements: ParsedRequirements,
    usedRelaxedBudget: boolean,
  ): string {
    if (products.length === 0) {
      return (
        'Không tìm thấy sản phẩm còn hàng ' +
        'phù hợp với yêu cầu.'
      );
    }

    if (
      usedRelaxedBudget &&
      requirements.maxPrice !== null
    ) {
      return (
        `Không có sản phẩm đúng hoàn toàn ` +
        `ngân sách ${this.formatVnd(
          requirements.maxPrice,
        )}. Hệ thống đang hiển thị ` +
        `các lựa chọn gần nhất.`
      );
    }

    return (
      `Tìm thấy ${products.length} ` +
      `sản phẩm phù hợp.`
    );
  }

  private normalizeLimit(
    limit?: number,
  ): number {
    const parsedLimit =
      Number(limit ?? 10);

    if (!Number.isFinite(parsedLimit)) {
      return 10;
    }

    return Math.min(
      Math.max(
        Math.floor(parsedLimit),
        1,
      ),
      20,
    );
  }

  private normalizeText(
    value: unknown,
  ): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}\s.-]/gu,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeOptionalString(
    value: unknown,
  ): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmedValue =
      value.trim();

    return trimmedValue.length > 0
      ? trimmedValue
      : null;
  }

  private normalizeNullableNumber(
    value: unknown,
  ): number | null {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const parsedValue = Number(value);

    return (
      Number.isFinite(parsedValue) &&
      parsedValue >= 0
    )
      ? parsedValue
      : null;
  }

  private normalizeStringArray(
    value: unknown,
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value
          .filter(
            (item): item is string =>
              typeof item === 'string',
          )
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    ];
  }

  private parseVietnameseNumber(
    value: string,
  ): number {
    return Number(
      value.replace(',', '.'),
    );
  }

  private extractKeywords(
    query: string,
  ): string[] {
    const stopWords = new Set([
      'toi',
      'can',
      'tim',
      'mua',
      'mot',
      'cho',
      'voi',
      'va',
      'gia',
      'duoi',
      'tren',
      'khoang',
      'tam',
      'san',
      'pham',
      'phu',
      'hop',
      'muon',
    ]);

    return [
      ...new Set(
        this.normalizeText(query)
          .split(' ')
          .map((word) => word.trim())
          .filter(
            (word) =>
              word.length >= 2 &&
              !stopWords.has(word),
          ),
      ),
    ];
  }

  private formatVnd(
    value: number,
  ): string {
    return (
      `${Math.round(value).toLocaleString(
        'vi-VN',
      )}đ`
    );
  }

  private safeJsonParse(
    value: unknown,
  ): unknown {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    if (typeof value === 'object') {
      return value;
    }

    try {
      return JSON.parse(String(value));
    } catch {
      return value;
    }
  }
}