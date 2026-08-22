'use server';

/**
 * @fileOverview A Genkit flow that generates multiple variations of a product image based on an uploaded reference image.
 * - generateSimilarImages - A function that takes a reference image and generates four new images in different styles.
 * - GenerateSimilarImagesInput - The input type for the generateSimilarImages function.
 * - SimilarImagesOutput - The return type for the generateSimilarImages function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSimilarImagesInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A reference photo of a clothing item, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  productName: z.string().describe("The name of the product, used for file naming.").optional(),
});
export type GenerateSimilarImagesInput = z.infer<typeof GenerateSimilarImagesInputSchema>;

const SimilarImagesOutputSchema = z.object({
  productShot: z.string().describe('A data URI for the product-only image.'),
  lifestyleShot: z.string().describe('A data URI for the model-wearing-product image.'),
  flatLayShot: z.string().describe('A data URI for the flat lay image.'),
  detailShot: z.string().describe('A data URI for the fabric detail close-up image.'),
});
export type SimilarImagesOutput = z.infer<typeof SimilarImagesOutputSchema>;

export async function generateSimilarImages(input: GenerateSimilarImagesInput): Promise<SimilarImagesOutput> {
  return generateSimilarImagesFlow(input);
}

const generateSimilarImagesFlow = ai.defineFlow(
  {
    name: 'generateSimilarImagesFlow',
    inputSchema: GenerateSimilarImagesInputSchema,
    outputSchema: SimilarImagesOutputSchema,
  },
  async ({ imageDataUri }) => {
    
    const generateImage = (promptText: string) => {
        return ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: [
                { media: { url: imageDataUri } },
                { text: promptText }
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
    };

    const productPrompt = `Based on the provided reference image, create a professional e-commerce product shot. The item should be perfectly centered on a pure white background (#FFFFFF) with soft, even studio lighting. The image must be high-resolution, clean, and clearly showcase the full clothing item.`;
    const lifestylePrompt = `Using the reference image, generate a fashion lifestyle photograph. A model should be wearing the clothing item in a chic, naturally lit urban setting, like a stylish cafe in Seoul. The style should feel candid and elegant, highlighting how the garment fits and moves.`;
    const flatLayPrompt = `Create an artistic flat lay photograph featuring the clothing item from the reference image. The item should be neatly folded or styled on a neutral, textured background (like light wood or linen). Arrange complementary accessories like a small purse, sunglasses, and a magazine artfully around it to create a visually appealing composition.`;
    const detailPrompt = `Generate a detailed macro close-up shot focusing on the fabric and texture of the clothing item in the reference image. Use angled lighting to emphasize the material's weave, pattern, and specific details like buttons, seams, or embroidery. The background should be softly blurred to keep the focus on the texture.`;

    const prompts = [
        { type: 'productShot', prompt: productPrompt },
        { type: 'lifestyleShot', prompt: lifestylePrompt },
        { type: 'flatLayShot', prompt: flatLayPrompt },
        { type: 'detailShot', prompt: detailPrompt }
    ];

    const imageGenerationPromises = prompts.map(p => generateImage(p.prompt));

    const results = await Promise.allSettled(imageGenerationPromises);

    const generatedUrls: Partial<SimilarImagesOutput> = {};
    const placeholderUrl = 'https://placehold.co/400x533.png';

    results.forEach((result, index) => {
        const type = prompts[index].type as keyof SimilarImagesOutput;
        if (result.status === 'fulfilled' && result.value?.media?.url) {
            generatedUrls[type] = result.value.media.url;
        } else {
            console.error(`AI-generated image for "${type}" failed. Using placeholder. Reason:`, result.status === 'rejected' ? result.reason : 'No media URL found');
            generatedUrls[type] = placeholderUrl;
        }
    });

    const finalOutput: SimilarImagesOutput = {
        productShot: generatedUrls.productShot || placeholderUrl,
        lifestyleShot: generatedUrls.lifestyleShot || placeholderUrl,
        flatLayShot: generatedUrls.flatLayShot || placeholderUrl,
        detailShot: generatedUrls.detailShot || placeholderUrl,
    };

    return finalOutput;
  }
);
