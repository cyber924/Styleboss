
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI images of clothing items.
 *
 * - generateClothingImages - A function that generates multiple AI images of a clothing item based on a description.
 * - GenerateClothingImagesInput - The input type for the generateClothingImages function.
 * - GenerateClothingImagesOutput - The return type for the generateClothingImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateClothingImagesInputSchema = z.object({
  clothingDescription: z
    .string()
    .describe('A detailed description of the clothing item to generate images for.'),
  numberOfImages: z
    .number()
    .min(1)
    .max(5)
    .default(3)
    .describe('The number of images to generate (between 1 and 5).'),
});
export type GenerateClothingImagesInput = z.infer<typeof GenerateClothingImagesInputSchema>;

const GenerateClothingImagesOutputSchema = z.object({
  images: z.array(
    z.string().describe('A data URI containing a base64 encoded image (PNG format).')
  ).describe('An array of generated image data URIs.'),
});
export type GenerateClothingImagesOutput = z.infer<typeof GenerateClothingImagesOutputSchema>;

export async function generateClothingImages(
  input: GenerateClothingImagesInput
): Promise<GenerateClothingImagesOutput> {
  return generateClothingImagesFlow(input);
}

const generateClothingImagesFlow = ai.defineFlow(
  {
    name: 'generateClothingImagesFlow',
    inputSchema: GenerateClothingImagesInputSchema,
    outputSchema: GenerateClothingImagesOutputSchema,
  },
  async input => {
    const {clothingDescription, numberOfImages} = input;
    const images: string[] = [];

    const imagePrompt = `A professional, high-resolution e-commerce style photograph of a single clothing item. 
Item description: "${clothingDescription}".
The item should be the main focus, well-lit, and presented attractively.
IMPORTANT: The generated image must not contain any text, words, letters, or watermarks. Focus only on the visual representation of the clothing.`;

    for (let i = 0; i < numberOfImages; i++) {
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });
      if (media?.url) {
        images.push(media.url);
      }
    }

    return {images};
  }
);
