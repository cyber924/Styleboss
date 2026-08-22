
'use server';

/**
 * @fileOverview An AI flow for analyzing a user's fashion style based on items in their shopping cart.
 * - analyzeStyleFromCart - Analyzes a list of product names and returns a style summary.
 * - StyleAnalysisInput - The input type for the analyzeStyleFromCart function.
 * - StyleAnalysisOutput - The return type for the analyzeStyleFromCart function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StyleAnalysisInputSchema = z.object({
  productNames: z.array(z.string()).describe('A list of product names from the user\'s shopping cart.'),
});
export type StyleAnalysisInput = z.infer<typeof StyleAnalysisInputSchema>;

const StyleAnalysisOutputSchema = z.object({
  analysisSummary: z
    .string()
    .describe('A friendly, one-paragraph summary of the user\'s fashion style, written in Korean. For example: "고객님은 심플하면서도 편안한 스타일을 선호하시는군요! 베이직한 아이템을 중심으로 세련된 데일리룩을 연출하는 것을 즐기시는 것 같아요."'),
  styleKeywords: z
    .array(z.string())
    .length(3)
    .describe('A list of 3 representative Korean keywords for the user\'s style (e.g., ["#미니멀", "#데일리룩", "#꾸안꾸"]).'),
  preferredItems: z.string().describe('A comma-separated string of preferred item types (e.g., "원피스, 슬랙스, 블라우스").'),
  preferredColors: z.string().describe('A comma-separated string of preferred colors (e.g., "아이보리, 블랙, 파스텔 톤").'),
  coreStyle: z.string().describe('The core fashion style DNA (e.g., "모던 시크", "러블리 페미닌").'),
});
export type StyleAnalysisOutput = z.infer<typeof StyleAnalysisOutputSchema>;

export async function analyzeStyleFromCart(input: StyleAnalysisInput): Promise<StyleAnalysisOutput> {
  return styleAnalysisFlow(input);
}

const analysisPrompt = ai.definePrompt({
  name: 'styleAnalysisPrompt',
  input: { schema: StyleAnalysisInputSchema },
  output: { schema: StyleAnalysisOutputSchema },
  prompt: `당신은 보그(Vogue)의 수석 에디터 출신인 전문 패션 큐레이터입니다.
주어진 상품명 목록을 보고, 고객의 패션 DNA를 깊이 있게 분석해야 합니다.
단순히 상품명을 나열하는 것이 아니라, 그 안에 숨겨진 소재, 핏, 카테고리, 색상 등의 키워드를 추출하고 조합하여 고객의 취향을 추론해야 합니다.
모든 결과는 친근하고 긍정적인 한국어 톤으로 작성해야 합니다.

상품명 목록:
{{#each productNames}}
- {{this}}
{{/each}}

위 목록을 바탕으로, 아래 JSON 스키마의 모든 항목을 채워주세요.
- analysisSummary: 고객의 쇼핑 성향과 패션 스타일을 1~2 문장으로 부드럽게 요약합니다.
- styleKeywords: 고객의 스타일을 가장 잘 나타내는 해시태그 3개를 생성합니다.
- preferredItems: 고객이 주로 구매하는 아이템 종류를 분석합니다. (예: "와이드 팬츠, 크롭탑, 롱 원피스")
- preferredColors: 고객이 선호하는 색상 계열을 분석합니다. (예: "블랙, 화이트, 베이지 등 뉴트럴 톤")
- coreStyle: 모든 분석을 종합하여, 고객의 핵심 스타일 DNA를 한두 단어로 정의합니다. (예: "모던 캐주얼", "페미닌 시크")
`,
});

const styleAnalysisFlow = ai.defineFlow(
  {
    name: 'styleAnalysisFlow',
    inputSchema: StyleAnalysisInputSchema,
    outputSchema: StyleAnalysisOutputSchema,
  },
  async ({ productNames }) => {
    const { output } = await analysisPrompt({ productNames });
    if (!output) {
      throw new Error('AI가 스타일을 분석하는 데 실패했습니다.');
    }
    return output;
  }
);
