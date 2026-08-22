'use server';

/**
 * @fileOverview An AI flow for generating product recommendations based on a trend query.
 *
 * - recommendTrends - A function that generates product ideas for a given trend.
 * - TrendRecommendationInput - The input type for the recommendTrends function.
 * - TrendRecommendationOutput - The return type for the recommendTrends function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TrendRecommendationInputSchema = z.object({
  query: z.string().describe('A description of the fashion trend or concept.'),
});
export type TrendRecommendationInput = z.infer<typeof TrendRecommendationInputSchema>;

const TrendRecommendationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      name: z.string().describe('The name of the product.'),
      description: z.string().describe('A short, appealing description of the product.'),
      price: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                // Extracts numbers from the string
                return val.replace(/[^0-9]/g, '');
            }
            return val;
        },
        z.coerce.number().describe('A plausible price for the product in Korean Won. This must be a number like 48000.')
      ),
    })
  ).length(10).describe('A list of 10 recommended product ideas.'),
});
export type TrendRecommendationOutput = z.infer<typeof TrendRecommendationOutputSchema>;


export async function recommendTrends(input: TrendRecommendationInput): Promise<TrendRecommendationOutput> {
  return trendRecommendationFlow(input);
}

const trendPrompt = ai.definePrompt({
  name: 'trendRecommendationPrompt',
  input: { schema: TrendRecommendationInputSchema },
  output: { schema: TrendRecommendationOutputSchema },
  prompt: `당신은 대한민국 인기 여성 의류 쇼핑몰의 전문 패션 MD입니다.
주어진 컨셉이나 트렌드를 기반으로 창의적이고 트렌디한 상품 아이디어 10개를 제안하는 것이 당신의 임무입니다.
상품은 20대에서 30대 여성에게 매력적이어야 합니다.

다음 트렌드를 기반으로 상품 아이디어 10개를 생성해주세요:
"{{{query}}}"

각 상품에 대해, 매력적인 한글 이름, 짧은 한글 설명, 그리고 현실적인 원화(KRW) 가격을 제공해주세요.
가격은 반드시 숫자여야 합니다 (예: 48000).
이름과 설명은 비어 있으면 안 됩니다.
오직 JSON 객체로만 응답해주세요.`,
});

const trendRecommendationFlow = ai.defineFlow(
  {
    name: 'trendRecommendationFlow',
    inputSchema: TrendRecommendationInputSchema,
    outputSchema: TrendRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await trendPrompt(input);
    return output!;
  }
);
