
'use server';

/**
 * @fileOverview An AI flow for creating a full product plan from a single concept keyword.
 * - createAiProduct - A function that takes a concept and generates a rich product details.
 * - AiProductCreationInput - The input type for the createAiProduct function.
 * - AiProductCreationOutput - The return type for the createAiProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AiProductCreationInputSchema = z.object({
  concept: z.string().describe('The core concept or keyword for the product to be created. e.g., "A velvet training set in Y2K style"'),
});
export type AiProductCreationInput = z.infer<typeof AiProductCreationInputSchema>;


const AiProductCreationOutputSchema = z.object({
  name: z.string().describe('An attractive, SEO-optimized product name in Korean. Should include keywords that users are likely to search for.'),
  price: z.number().describe('A plausible and competitive market price in KRW. Should be a number like 49900.'),
  shippingInfo: z.string().describe('Plausible shipping information in Korean. e.g., "무료배송 | CJ대한통운"'),
  options: z.array(z.object({
    name: z.string().describe('The name of the option, e.g., "색상" or "사이즈".'),
    values: z.array(z.string()).describe('A list of possible values for the option, e.g., ["블랙", "화이트"] or ["S", "M", "L"].'),
  })).describe('A list of plausible product options.'),
  summaryBanner: z.object({
    keyPoints: z.array(z.string()).length(3).describe('A list of three catchy key points or hashtags for the product in Korean.'),
  }).describe('Content for a summary banner section.'),
  specifications: z.array(z.object({
    key: z.string().describe('The name of the specification in Korean, e.g., "소재" or "제조국".'),
    value: z.string().describe('The value of the specification in Korean, e.g., "면 100%" or "대한민국".'),
  })).min(2).describe('A list of at least two key-value specifications for the product.'),
  usagePrecautions: z.string().describe('A plausible warning or precaution for using the product in Korean. e.g., "첫 세탁은 드라이클리닝을 권장합니다."'),
  exchangeReturnInfo: z.string().describe('Plausible exchange and return information in Korean. e.g., "상품 수령 후 7일 이내에 교환/반품이 가능합니다."'),
});

export type AiProductCreationOutput = z.infer<typeof AiProductCreationOutputSchema>;


export async function createAiProduct(input: AiProductCreationInput): Promise<AiProductCreationOutput> {
  return productCreationFlow(input);
}


const creationPrompt = ai.definePrompt({
    name: 'productCreationPrompt',
    input: { schema: AiProductCreationInputSchema },
    output: { schema: AiProductCreationOutputSchema },
    prompt: `당신은 대한민국 최고의 여성 의류 쇼핑몰 MD이자, 카피라이터, 가격 전략가입니다.
주어진 상품 컨셉을 바탕으로, 고객들이 바로 구매하고 싶어할 만큼 완벽한 상품 기획안을 작성해야 합니다.
모든 텍스트는 한국어로 작성해주세요.

상품 컨셉: "{{concept}}"

위 컨셉을 바탕으로, 아래 JSON 스키마에 맞춰 모든 필드를 논리적으로 그럴듯하고, SEO에 유리하며, 매우 매력적으로 채워주세요.
특히, 상품명은 검색에 잘 걸릴 수 있도록 매력적인 키워드를 조합하여 만들고, 가격은 현실적인 시장 데이터를 분석한 것처럼 경쟁력있게 책정해주세요.
`
});


const productCreationFlow = ai.defineFlow(
  {
    name: 'productCreationFlow',
    inputSchema: AiProductCreationInputSchema,
    outputSchema: AiProductCreationOutputSchema,
  },
  async (input) => {
    const { output } = await creationPrompt(input);
    if (!output) {
      throw new Error('AI가 상품 기획안을 생성하는 데 실패했습니다.');
    }
    return output;
  }
);
