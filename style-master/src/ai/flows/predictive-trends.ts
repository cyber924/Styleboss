// src/ai/flows/predictive-trends.ts
'use server';

/**
 * @fileOverview A flow for predicting product trends based on user preferences.
 *
 * - predictTrends - A function that predicts product trends.
 * - PredictTrendsInput - The input type for the predictTrends function.
 * - PredictTrendsOutput - The return type for the predictTrends function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictTrendsInputSchema = z.object({
  pastPurchases: z
    .string()
    .describe('A comma-separated list of past purchases.'),
  preferences: z.string().describe('A description of user preferences.'),
});
export type PredictTrendsInput = z.infer<typeof PredictTrendsInputSchema>;

const PredictTrendsOutputSchema = z.object({
  trendingProducts: z
    .string()
    .describe('A comma-separated list of trending products.'),
  reasoning: z.string().describe('The reasoning behind the predicted trends.'),
});
export type PredictTrendsOutput = z.infer<typeof PredictTrendsOutputSchema>;

export async function predictTrends(input: PredictTrendsInput): Promise<PredictTrendsOutput> {
  return predictTrendsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictTrendsPrompt',
  input: {schema: PredictTrendsInputSchema},
  output: {schema: PredictTrendsOutputSchema},
  prompt: `You are an AI fashion trend forecaster. Based on the user's past purchases and preferences, you will predict trending products.

Past Purchases: {{{pastPurchases}}}
Preferences: {{{preferences}}}

Trending Products (comma-separated list):`,
});

const predictTrendsFlow = ai.defineFlow(
  {
    name: 'predictTrendsFlow',
    inputSchema: PredictTrendsInputSchema,
    outputSchema: PredictTrendsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
