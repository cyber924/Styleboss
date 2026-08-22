
'use server';

/**
 * @fileOverview An AI flow for optimizing an AI Product Page by generating a new storyline and summarizing reviews.
 * - optimizeProductPage - A function that generates a new content structure and summarizes reviews.
 */

import { ai } from '@/ai/genkit';
import { 
    ProductPageOptimizerInputSchema,
    ProductPageOptimizerOutputSchema,
    OptimizedStorylineSchema,
    ReviewSummarySchema,
    type ProductPageOptimizerInput,
    type ProductPageOptimizerOutput
} from './ai-product-page-optimizer-types';


export async function optimizeProductPage(input: ProductPageOptimizerInput): Promise<ProductPageOptimizerOutput> {
  return productPageOptimizerFlow(input);
}


const productPageOptimizerFlow = ai.defineFlow(
  {
    name: 'productPageOptimizerFlow',
    inputSchema: ProductPageOptimizerInputSchema,
    outputSchema: ProductPageOptimizerOutputSchema,
  },
  async (input) => {

    const storylinePrompt = ai.definePrompt({
      name: 'storylinePrompt',
      input: { schema: ProductPageOptimizerInputSchema },
      output: { schema: OptimizedStorylineSchema },
      prompt: `당신은 최고의 이커머스 콘텐츠 전략가입니다. 주어진 상품 정보를 바탕으로, 고객의 구매를 유도할 수 있는 매력적이고 논리적인 상세페이지 스토리라인을 새로 구성해주세요.
- 스토리라인은 텍스트 블록과 이미지 생성 프롬프트 블록으로 구성됩니다.
- 이미지 프롬프트는 해당 위치에 어떤 이미지가 들어가야 할지 아주 상세하고 구체적으로 작성해야 합니다. (예: '따사로운 햇살이 들어오는 창가에서 세련된 20대 여성이 아이보리색 린넨 팬츠를 입고 편안하게 책을 읽는 모습')
- 모든 텍스트는 한국어로 작성해주세요.

상품명: {{productName}}
가격: {{productPrice}}원
핵심 포인트: {{#each keyPoints}}- {{this}} {{/each}}
상품 스펙: {{#each specifications}}- {{key}}: {{value}} {{/each}}

위 정보를 바탕으로 최적의 스토리라인을 제안해주세요.`,
    });

    const reviewSummaryPrompt = ai.definePrompt({
        name: 'reviewSummaryPrompt',
        input: { schema: ProductPageOptimizerInputSchema },
        output: { schema: ReviewSummarySchema },
        prompt: `당신은 고객 경험(CX) 데이터 분석 전문가입니다. 주어진 고객 리뷰들을 분석하여, 다음 세 가지 항목을 추출해주세요.
- 리뷰 요약 (reviewSummary): 전체 리뷰의 긍정적, 부정적 측면을 모두 포함하는 한 문단의 객관적인 요약.
- 긍정 키워드 (positiveKeywords): 고객들이 공통적으로 칭찬하는 핵심 키워드 3-5개.
- 부정 키워드 (negativeKeywords): 고객들이 공통적으로 아쉬워하거나 개선을 요구하는 핵심 키워드 1-3개. (만약 부정 리뷰가 없다면 빈 배열로 반환)
- 모든 텍스트는 한국어로 작성해주세요.

상품명: {{productName}}
리뷰 목록:
{{#each existingReviews}}
- 작성자: {{author}}, 평점: {{rating}}/5, 내용: {{text}}
{{/each}}

위 리뷰들을 분석하여 결과를 JSON 형식으로 반환해주세요.`,
    });

    // Run both prompts in parallel
    const [storylineResult, summaryResult] = await Promise.all([
      storylinePrompt(input),
      reviewSummaryPrompt(input),
    ]);

    if (!storylineResult.output || !summaryResult.output) {
      throw new Error('Failed to generate one or more AI optimization results.');
    }
    
    return {
      storyline: storylineResult.output,
      summary: summaryResult.output,
    };
  }
);
