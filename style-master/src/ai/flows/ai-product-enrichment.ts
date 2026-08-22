
'use server';

/**
 * @fileOverview An AI flow for enriching a basic product with detailed information.
 * - enrichProduct - A function that takes a product name and price, and generates rich details.
 * - ProductEnrichmentInput - The input type for the enrichProduct function.
 * - ProductEnrichmentOutput - The return type for the enrichProduct function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { serverTimestamp } from 'firebase/firestore';

const ProductEnrichmentInputSchema = z.object({
  name: z.string().describe('The name of the product to enrich.'),
  price: z.number().describe('The price of the product.'),
});
export type ProductEnrichmentInput = z.infer<typeof ProductEnrichmentInputSchema>;


const ProductEnrichmentOutputSchema = z.object({
  shippingInfo: z.string().describe(' plausible shipping information. e.g., "무료배송 | CJ대한통운"'),
  options: z.array(z.object({
    name: z.string().describe('The name of the option, e.g., "색상" or "사이즈".'),
    values: z.array(z.string()).describe('A list of possible values for the option, e.g., ["블랙", "화이트"] or ["S", "M", "L"].'),
  })).describe('A list of product options.'),
  summaryBanner: z.object({
    imageUrl: z.string().describe('A placeholder URL for the summary banner image. Use exactly "https://placehold.co/800x400.png".'),
    keyPoints: z.array(z.string()).length(3).describe('A list of three catchy key points or hashtags for the product.'),
  }).describe('Content for a summary banner section.'),
  detailImageUrls: z.array(z.string()).length(2).describe('A list of two placeholder URLs for detail images. Use exactly "https://placehold.co/800x1200.png".'),
  specifications: z.array(z.object({
    key: z.string().describe('The name of the specification, e.g., "소재" or "제조국".'),
    value: z.string().describe('The value of the specification, e.g., "면 100%" or "대한민국".'),
  })).min(2).describe('A list of at least two key-value specifications for the product.'),
  usagePrecautions: z.string().describe('A plausible warning or precaution for using the product. e.g., "첫 세탁은 드라이클리닝을 권장합니다."'),
  reviews: z.array(z.object({
    author: z.string().describe('A plausible author for the review (e.g., "김**").'),
    rating: z.number().min(4).max(5).describe('A plausible rating between 4 and 5.'),
    text: z.string().describe('A plausible, positive review text.'),
    createdAt: z.string().describe('The current date in "YYYY.MM.DD" format.'),
  })).length(1).describe('A single plausible customer review.'),
  exchangeReturnInfo: z.string().describe('Plausible exchange and return information. e.g., "상품 수령 후 7일 이내에 교환/반품이 가능합니다."'),
});

export type ProductEnrichmentOutput = z.infer<typeof ProductEnrichmentOutputSchema>;


export async function enrichProduct(input: ProductEnrichmentInput): Promise<ProductEnrichmentOutput> {
  return productEnrichmentFlow(input);
}


const enrichmentPrompt = ai.definePrompt({
    name: 'productEnrichmentPrompt',
    input: { schema: ProductEnrichmentInputSchema },
    output: { schema: ProductEnrichmentOutputSchema },
    prompt: `당신은 대한민국 여성 의류 쇼핑몰의 전문 MD입니다.
주어진 상품명과 가격을 바탕으로, 해당 상품에 가장 잘 어울릴 상세 정보를 생성해야 합니다.
모든 텍스트는 한국어로 작성해주세요.
리뷰 작성일자는 오늘 날짜를 YYYY.MM.DD 형식으로 입력해주세요.
이미지 URL은 제공된 플레이스홀더 URL을 사용해야 합니다.

상품명: "{{name}}"
가격: {{price}}원

위 상품에 대한 상세 정보를 아래 JSON 스키마에 맞춰 생성해주세요. 모든 필드는 논리적으로 그럴듯하고 매력적이어야 합니다.
`
});


const productEnrichmentFlow = ai.defineFlow(
  {
    name: 'productEnrichmentFlow',
    inputSchema: ProductEnrichmentInputSchema,
    outputSchema: ProductEnrichmentOutputSchema,
  },
  async (input) => {
    const { output } = await enrichmentPrompt(input);
    if (!output) {
      throw new Error('AI가 상품 상세 정보를 생성하는 데 실패했습니다.');
    }
    // To ensure the date is always correct, we overwrite it here.
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    output.reviews[0].createdAt = `${yyyy}.${mm}.${dd}`;

    return output;
  }
);
