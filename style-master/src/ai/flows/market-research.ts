'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an in-depth market research report.
 * - analyzeMarket - A function that analyzes market trends for a given query and provides strategic recommendations.
 * - MarketAnalysisInput - The input type for the analyzeMarket function.
 * - MarketAnalysisOutput - The return type for the analyzeMarket function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketAnalysisInputSchema = z.object({
  query: z.string().describe('The product or trend to research.'),
});
export type MarketAnalysisInput = z.infer<typeof MarketAnalysisInputSchema>;

const MarketAnalysisOutputSchema = z.object({
  reportTitle: z.string().describe('분석 주제를 포함한 보고서의 전체 제목. 예: "AI 시장 분석 보고서: Y2K 패션"'),
  executiveSummary: z.string().describe('시장 동향, 핵심 고객, 주요 전략을 3~4 문장으로 요약한 보고서의 핵심 요약.'),
  
  trendAnalysis: z.object({
    lifecycle: z.string().describe('해당 트렌드의 현재 위치(도입기, 성장기, 성숙기, 쇠퇴기)에 대한 분석.'),
    customerProfile: z.string().describe('이 트렌드에 반응하는 핵심 고객층의 특징(연령, 스타일 등)에 대한 설명.'),
    competitiveLandscape: z.string().describe('주요 경쟁 플랫폼(네이버, 쿠팡 등)과 경쟁사들의 동향에 대한 간략한 분석.'),
  }),
  
  keySuccessFactors: z.object({
      design: z.string().describe("현재 시장에서 성공하고 있는 상품들의 핵심 디자인 요소(핏, 실루엣, 컬러 등) 분석."),
      pricing: z.string().describe("성공적인 상품들의 가격대 형성 및 가격 전략 분석."),
      marketing: z.string().describe("고객을 유인하는 효과적인 마케팅 키워드, 채널, 소구점 분석."),
  }),

  actionableStrategy: z.object({
    productRecommendation: z.string().describe('분석을 바탕으로 우리가 취해야 할 구체적인 상품화 전략. (예: "OO 상품 강화", "XX 신상품 기획 제안")'),
    pricingStrategy: z.string().describe('경쟁력을 확보하기 위한 구체적인 가격 책정 전략. (예: "45,000원으로 책정하여 가성비 강조")'),
    marketingStrategy: z.string().describe('실행 가능한 구체적인 마케팅 활동 제안. (예: "인스타그램에 #OOTD #Y2K패션 해시태그 활용")'),
  }),
  
  risksAndOpportunities: z.object({
    potentialRisks: z.string().describe('이 트렌드를 따를 때 발생할 수 있는 잠재적 위험 요인 분석.'),
    newOpportunities: z.string().describe('이 트렌드를 활용하여 창출할 수 있는 새로운 사업 기회나 틈새 시장 제안.'),
  }),

  topTrendingProducts: z.array(z.object({
    source: z.string().describe('쇼핑 플랫폼 이름 (예: "네이버쇼핑", "쿠팡").'),
    productName: z.string().describe('인기 상품의 이름.'),
    estimatedPrice: z.string().describe('상품의 예상 판매 가격 (문자열, 예: "약 89,000원").'),
  })).min(3).max(5).describe('빠른 참고를 위한 3-5개의 최상위 인기 상품 리스트.'),
});
export type MarketAnalysisOutput = z.infer<typeof MarketAnalysisOutputSchema>;

export async function analyzeMarket(input: MarketAnalysisInput): Promise<MarketAnalysisOutput> {
  return marketAnalysisFlow(input);
}

const marketAnalysisPrompt = ai.definePrompt({
  name: 'marketAnalysisPrompt',
  input: { schema: MarketAnalysisInputSchema },
  output: { schema: MarketAnalysisOutputSchema },
  prompt: `당신은 대한민국 패션 대기업의 최고 전략 책임자(Chief Strategy Officer)입니다.
당신의 임무는 주어진 주제에 대해 단순한 데이터 나열을 넘어, 실행 가능한 구체적인 전략을 담은 심층 분석 보고서를 작성하는 것입니다.
각 항목은 서로 다른 내용을 담아야 하며, 논리정연하고 전문적인 인사이트를 제공해야 합니다. 모든 응답은 한글로 작성되어야 합니다.

분석 주제: "{{query}}"

아래의 JSON 스키마 구조에 맞춰, 각 항목을 상세하고 전문적으로 채워주세요.
최종 결과물은 반드시 지정된 JSON 형식으로만 제공해야 합니다.`,
});

const marketAnalysisFlow = ai.defineFlow(
  {
    name: 'marketAnalysisFlow',
    inputSchema: MarketAnalysisInputSchema,
    outputSchema: MarketAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await marketAnalysisPrompt(input);
    return output!;
  }
);
