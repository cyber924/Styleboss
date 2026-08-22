
'use server';

/**
 * @fileOverview An AI flow for generating a product image, uploading it to Firebase Storage, and returning the public URL.
 * - generateAndUploadProductImage - Generates an image, uploads it, and returns the URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {
  ProductImageGenerationInputSchema,
  type ProductImageGenerationInput,
  type ProductImageGenerationOutput
} from '@/lib/types';


export async function generateAndUploadProductImage(input: ProductImageGenerationInput): Promise<ProductImageGenerationOutput> {
  return generateAndUploadProductImageFlow(input);
}

const generateAndUploadProductImageFlow = ai.defineFlow(
  {
    name: 'generateAndUploadProductImageFlow',
    inputSchema: ProductImageGenerationInputSchema,
    outputSchema: z.object({
      publicUrl: z.string().describe('The public URL of the generated image in Firebase Storage.'),
    }),
  },
  async ({ productId, productName }) => {
    // 1. Generate Image using AI
    const imagePrompt = `A professional, high-resolution e-commerce style photograph of a single clothing item: "${productName}".
The item should be the main focus, well-lit, and presented attractively on a clean, light gray background.
The image must be photorealistic and ready for a product detail page.
IMPORTANT: The generated image must not contain any text, words, letters, or watermarks. Focus only on the visual representation of the clothing.`;

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('AI image generation failed to return a data URI.');
    }

    // 2. Upload to Firebase Storage
    // The client-side SDK for storage is used here because this is a server action
    // running in the context of the user's browser environment, not a separate backend server.
    const filePath = `products/${productId}/mainImage-${Date.now()}.png`;
    const storageRef = ref(storage, filePath);
    
    // uploadString expects a 'data_url' format which is what Gemini returns (e.g., 'data:image/png;base64,...')
    await uploadString(storageRef, media.url, 'data_url');
    
    // 3. Get Public URL
    const publicUrl = await getDownloadURL(storageRef);

    // 4. Return the public URL
    return { publicUrl };
  }
);
