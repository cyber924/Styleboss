
'use server';

/**
 * @fileOverview An AI flow for generating a business strategy recommendation from summarized sales data.
 * - analyzeSalesData - Analyzes a summary of sales data.
 * - SalesAnalysisInput - The input type for the flow.
 * - SalesAnalysisReport - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the simplified input schema for the flow
const SalesAnalysisInputSchema = z.object({
  reportSummary: z.string().describe('A string containing the summary of a sales report, including total revenue, profit, top products, etc.'),
});
export type SalesAnalysisInput = z.infer<typeof SalesAnalysisInputSchema>;


// Define the simplified output schema for the structured report
const SalesAnalysisReportSchema = z.object({
  strategicRecommendation: z.string().describe('A concrete and actionable strategic recommendation based on the provided sales data summary. (e.g., "Product A has a high profit margin, so we should strengthen its promotion, while Product B needs inventory management.")'),
});
export type SalesAnalysisReport = z.infer<typeof SalesAnalysisReportSchema>;


// Export the main function that wraps the flow
export async function analyzeSalesData(input: SalesAnalysisInput): Promise<SalesAnalysisReport> {
  return salesAnalysisFlow(input);
}


// Define the AI prompt, now focused only on strategy
const salesAnalysisPrompt = ai.definePrompt({
  name: 'salesAnalysisStrategyPrompt',
  input: { schema: SalesAnalysisInputSchema },
  output: { schema: SalesAnalysisReportSchema },
  prompt: `당신은 최고 수준의 데이터 분석가이자 경영 컨설턴트입니다.
당신의 임무는 주어진 요약된 매출 데이터를 보고, 비즈니스 성장을 위한 구체적이고 실행 가능한 전략을 1~2 문장으로 제안하는 것입니다.

**분석 요약 데이터:**
{{{reportSummary}}}

위 요약 데이터를 기반으로, 가장 중요한 전략적 제안을 해주세요.
`,
});

// Define the Genkit flow
const salesAnalysisFlow = ai.defineFlow(
  {
    name: 'salesAnalysisFlow',
    inputSchema: SalesAnalysisInputSchema,
    outputSchema: SalesAnalysisReportSchema,
  },
  async (input) => {
    const { output } = await salesAnalysisPrompt(input);
    if (!output) {
      throw new Error('AI가 분석 보고서를 생성하는 데 실패했습니다.');
    }
    return output;
  }
);
