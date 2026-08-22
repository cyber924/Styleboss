'use server';

/**
 * @fileOverview An AI agent that allows users to search for clothing items using natural language.
 *
 * - productSearch - A function that handles the product search process.
 * - ProductSearchInput - The input type for the productSearch function.
 * - ProductSearchOutput - The return type for the productSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSearchInputSchema = z.object({
  query: z.string().describe('The natural language query to search for clothing items.'),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductSearchOutputSchema = z.object({
  results: z
    .array(
      z.object({
        productId: z.string().describe('The unique identifier for the product.'),
        name: z.string().describe('The name of the product.'),
        description: z.string().describe('A description of the product.'),
        imageUrl: z.string().describe('URL of the product image. This should be a placeholder.'),
        price: z.number().min(10000).describe('The price of the product in KRW. It must be a realistic number greater than or equal to 10000.'),
      })
    )
    .describe('A list of products that match the search query.'),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export async function productSearch(input: ProductSearchInput): Promise<ProductSearchOutput> {
  return productSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productSearchPrompt',
  input: {schema: ProductSearchInputSchema},
  output: {schema: ProductSearchOutputSchema},
  prompt: `You are an AI shopping assistant specializing in finding clothing items for a Korean women's fashion mall.
Based on the user's query, find or create relevant products.
Return the results in the specified JSON format.
IMPORTANT: All text (name, description) must be in Korean. The price must be a realistic Korean Won (KRW) number, greater than or equal to 10000.

Query: {{{query}}}
  `,
});

const productSearchFlow = ai.defineFlow(
  {
    name: 'productSearchFlow',
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
