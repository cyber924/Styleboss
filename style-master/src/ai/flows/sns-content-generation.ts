
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating social media content for a product.
 * - generateSnsContent - A function that generates content for a blog, Instagram, and YouTube Shorts.
 * - SnsContentInput - The input type for the generateSnsContent function.
 * - SnsContentOutput - The return type for the generateSnsContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SnsContentInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product.'),
});
export type SnsContentInput = z.infer<typeof SnsContentInputSchema>;

const SnsContentOutputSchema = z.object({
  blog: z.object({
    title: z.string().describe('An engaging title for a blog post.'),
    contentHtml: z.string().describe('The full blog post content in HTML format, using h3, p, and ul tags.'),
  }),
  instagram: z.object({
    imageUrl: z.string().describe('A data URI for a newly generated lifestyle image of the product.'),
    caption: z.string().describe('An Instagram caption with relevant hashtags.'),
  }),
  youtubeShorts: z.object({
    title: z.string().describe('A catchy title for a YouTube Shorts video.'),
    scenario: z.string().describe('A brief scenario or script for the video.'),
    hashtags: z.string().describe('A string of relevant hashtags, for example: #shorts #fashion.'),
  }),
});
export type SnsContentOutput = z.infer<typeof SnsContentOutputSchema>;


export async function generateSnsContent(input: SnsContentInput): Promise<SnsContentOutput> {
  return snsContentGenerationFlow(input);
}

const snsContentGenerationFlow = ai.defineFlow(
  {
    name: 'snsContentGenerationFlow',
    inputSchema: SnsContentInputSchema,
    outputSchema: SnsContentOutputSchema,
  },
  async ({ productName, productDescription }) => {
    
    // Task 1: Generate Blog Content
    const blogPrompt = `
      You are a fashion blogger creating content for a blog post about a new product.
      Product Name: "${productName}"
      Description: "${productDescription}"
      
      Generate an engaging blog post. It must include:
      1. A catchy title.
      2. The body of the post in HTML format. Use <h3> for subheadings and <p> for paragraphs. Use <ul> and <li> for lists if applicable. Make it detailed and appealing.
      
      Respond in the requested JSON format.`;

    const blogTask = ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: blogPrompt,
        output: {
            schema: z.object({
                title: z.string(),
                contentHtml: z.string(),
            })
        }
    });

    // Task 2: Generate Instagram Image
    const instagramImagePrompt = `A high-fashion, professional lifestyle photograph featuring the clothing item: "${productName}". The model should be in a visually interesting, aesthetic setting that matches the product's style (e.g., chic urban cafe, sun-drenched beach, minimalist studio). The lighting should be flattering and the mood should be aspirational and trendy for Instagram.`;

    const instagramImageTask = ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: instagramImagePrompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    // Task 3: Generate Instagram Caption
    const instagramCaptionPrompt = `
      You are a social media manager for a fashion brand.
      Product Name: "${productName}"
      Description: "${productDescription}"
      
      Write a captivating Instagram caption in Korean.
      The caption must be engaging and include a call-to-action.
      After the caption, provide 5-7 relevant and trendy hashtags in Korean, each starting with #.
      
      IMPORTANT: Respond with ONLY the Korean caption and hashtags. Do not include any English text, explanations, titles, options, or translations.`;
      
    const instagramCaptionTask = ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: instagramCaptionPrompt,
    });


    // Task 4: Generate YouTube Shorts Content
    const shortsPrompt = `
      You are a content creator planning a YouTube Shorts video for a fashion item.
      Product Name: "${productName}"
      Description: "${productDescription}"

      Generate the following for the video:
      1. A short, catchy title (max 60 characters).
      2. A simple scenario or script. Describe 3-4 quick scenes.
      3. A list of relevant hashtags for the description (e.g., #shorts #패션 #데일리룩).
      
      Respond in the requested JSON format.`;

    const shortsTask = ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: shortsPrompt,
        output: {
            schema: z.object({
                title: z.string(),
                scenario: z.string(),
                hashtags: z.string(),
            })
        }
    });

    const [blogResult, instagramImageResult, instagramCaptionResult, shortsResult] = await Promise.all([
      blogTask,
      instagramImageTask,
      instagramCaptionTask,
      shortsTask,
    ]);

    const blogContent = blogResult.output;
    const instagramImageUrl = instagramImageResult.media?.url;
    const instagramCaption = instagramCaptionResult.text;
    const shortsContent = shortsResult.output;


    if (!blogContent || !instagramImageUrl || !instagramCaption || !shortsContent) {
      throw new Error('Failed to generate all required SNS content.');
    }

    return {
      blog: blogContent,
      instagram: {
        imageUrl: instagramImageUrl,
        caption: instagramCaption,
      },
      youtubeShorts: shortsContent,
    };
  }
);
