'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a set of advertisement images and a slogan for a product.
 * - generateAdContent - A function that generates three types of images and a slogan for a given product name.
 * - AdContentInput - The input type for the generateAdContent function.
 * - AdContentOutput - The return type for the generateAdContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AdContentInputSchema = z.object({
  productName: z.string().describe('The name of the product for which to generate ad content.'),
});
export type AdContentInput = z.infer<typeof AdContentInputSchema>;

const AdContentOutputSchema = z.object({
  productImage: z.string().describe('A data URI for the product-only image.'),
  modelImage: z.string().describe('A data URI for the model-wearing-product image.'),
  creativeImage: z.string().describe('A data URI for the creative/artistic product image.'),
  slogan: z.string().describe('A marketing slogan for the product.'),
});
export type AdContentOutput = z.infer<typeof AdContentOutputSchema>;


export async function generateAdContent(input: AdContentInput): Promise<AdContentOutput> {
  return generateAdContentFlow(input);
}

const generateAdContentFlow = ai.defineFlow(
  {
    name: 'generateAdContentFlow',
    inputSchema: AdContentInputSchema,
    outputSchema: AdContentOutputSchema,
  },
  async ({ productName }) => {
    
    const generateImage = async (prompt: string) => {
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt,
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return media?.url || '';
    };

    const generateSlogan = async (prompt: string) => {
        const { text } = await ai.generate({
            model: 'googleai/gemini-2.0-flash',
            prompt,
        });
        return text || '';
    };

    const productPrompt = `E-commerce product photography of "${productName}". The item is centered, on a clean white background with soft studio lighting. High resolution, professional, and clear.`;
    const modelPrompt = `Fashion lifestyle photograph of a model wearing a "${productName}". The setting is a beautiful, naturally lit outdoor location like a chic urban cafe in Seoul or a serene beach at sunset. The style is candid and elegant.`;
    const creativePrompt = `An artistic and visually stunning advertisement photo featuring a "${productName}". Use dramatic lighting, a unique composition, and a touch of surrealism. This image should be eye-catching, memorable, and abstract.`;
    const sloganPrompt = `Create a short, catchy, and appealing marketing slogan (headline) for a product named "${productName}". The slogan must be in Korean. Provide only the slogan text.`;

    const [productImage, modelImage, creativeImage, slogan] = await Promise.all([
        generateImage(productPrompt),
        generateImage(modelPrompt),
        generateImage(creativePrompt),
        generateSlogan(sloganPrompt),
    ]);

    if (!productImage || !modelImage || !creativeImage || !slogan) {
        throw new Error('Failed to generate all required ad content.');
    }

    return {
        productImage,
        modelImage,
        creativeImage,
        slogan,
    };
  }
);
