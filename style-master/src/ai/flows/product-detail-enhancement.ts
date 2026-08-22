
'use server';
/**
 * @fileOverview An AI flow for enhancing the product detail page with styling suggestions and similar product recommendations.
 *
 * - enhanceProductDetail - A function that generates styling tips and similar products.
 * - ProductDetailEnhancementInput - The input type for the enhanceProductDetail function.
 * - ProductDetailEnhancementOutput - The return type for the enhanceProductDetail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProductDetailEnhancementInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});
export type ProductDetailEnhancementInput = z.infer<typeof ProductDetailEnhancementInputSchema>;

const GeneratedProductSchema = z.object({
  name: z.string().describe('The name of the generated product.'),
  description: z.string().describe('A short, appealing description of the generated product.'),
  imageUrl: z.string().describe('A data URI for the generated product image.'),
});

const ProductDetailEnhancementOutputSchema = z.object({
  stylingSuggestion: z.string().describe('A paragraph of styling advice for the product.'),
  similarProducts: z.array(GeneratedProductSchema).length(3).describe('A list of 3 visually similar, AI-generated product recommendations.'),
});
export type ProductDetailEnhancementOutput = z.infer<typeof ProductDetailEnhancementOutputSchema>;

export async function enhanceProductDetail(input: ProductDetailEnhancementInput): Promise<ProductDetailEnhancementOutput> {
  return productDetailEnhancementFlow(input);
}

const similarProductIdeasSchema = z.object({
    products: z.array(z.object({
        name: z.string().describe("The name of the new product idea."),
        description: z.string().describe("A short, appealing description for the new product idea."),
    })).length(3).describe("A list of 3 new product ideas.")
});

const productDetailEnhancementFlow = ai.defineFlow(
  {
    name: 'productDetailEnhancementFlow',
    inputSchema: ProductDetailEnhancementInputSchema,
    outputSchema: ProductDetailEnhancementOutputSchema,
  },
  async ({ productName, productDescription }) => {

    // Task 1: Generate Styling Suggestion
    const stylePrompt = `You are a professional fashion stylist. Based on the product named "${productName}" (Description: "${productDescription}"), provide a concise and helpful styling suggestion in Korean. Recommend what items to pair it with for different occasions (e.g., casual, formal). Keep it to a single paragraph.`;
    
    const stylingTask = ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: stylePrompt,
    });

    // Task 2: Generate 3 new product ideas (name & description)
    const ideasPrompt = `Based on the fashion item "${productName}" (Description: "${productDescription}"), come up with 3 new, creative, and visually similar product ideas. They should be different but in the same style category. For each idea, provide a catchy Korean name and a short, appealing Korean description.`;

    const ideasTask = ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: ideasPrompt,
        output: { schema: similarProductIdeasSchema }
    });

    const [stylingResult, ideasResult] = await Promise.all([stylingTask, ideasTask]);

    const stylingSuggestion = stylingResult.text;
    const productIdeas = ideasResult.output?.products;
    
    if (!stylingSuggestion || !productIdeas) {
        throw new Error('Failed to generate initial text content.');
    }

    // Task 3: Generate images for each new product idea
    const imageGenerationPromises = productIdeas.map(idea => {
        const imagePrompt = `A professional, high-resolution e-commerce product shot of a fashion item. The item is a "${idea.name}". Description: "${idea.description}". The image should be on a clean, light-colored, minimal background with soft studio lighting. Focus on making the product look appealing and clear.`;
        return ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: imagePrompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
    });

    const imageResults = await Promise.allSettled(imageGenerationPromises);
    
    const similarProducts = productIdeas.map((idea, index) => {
        const result = imageResults[index];
        let imageUrl = 'https://placehold.co/400x533.png'; // Default placeholder

        if (result.status === 'fulfilled' && result.value?.media?.url) {
            imageUrl = result.value.media.url;
        } else if (result.status === 'rejected') {
            console.error(`AI-generated image for "${idea.name}" failed. Using placeholder. Reason:`, result.reason);
        }

        return {
            ...idea,
            imageUrl,
        };
    });

    return {
        stylingSuggestion,
        similarProducts,
    };
  }
);
