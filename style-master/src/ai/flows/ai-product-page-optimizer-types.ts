/**
 * @fileOverview This file contains the Zod schemas and TypeScript types 
 * for the ai-product-page-optimizer flow. These are separated to allow the main flow 
 * file to be a "use server" module while these types can be imported 
 * into client components without issue.
 */

import { z } from 'zod';

const ContentBlockSchema = z.object({
  type: z.enum(['text', 'image']),
  content: z.string().describe("For 'text', the text content. For 'image', a detailed description for generating a new image."),
});

const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number(),
  text: z.string(),
  createdAt: z.string(),
});

export const ProductPageOptimizerInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productPrice: z.number().describe('The price of the product.'),
  keyPoints: z.array(z.string()).describe('A list of key selling points for the product.'),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).describe('A list of product specifications.'),
  existingReviews: z.array(ReviewSchema).describe('An array of existing customer reviews.')
});
export type ProductPageOptimizerInput = z.infer<typeof ProductPageOptimizerInputSchema>;


export const OptimizedStorylineSchema = z.object({
    newStoryline: z.array(ContentBlockSchema).describe("A new, compelling storyline for the product detail page, including text blocks and image generation prompts."),
});

export const ReviewSummarySchema = z.object({
    reviewSummary: z.string().describe("A one-paragraph summary of the customer reviews, highlighting key positive and negative points."),
    positiveKeywords: z.array(z.string()).describe("A list of frequently mentioned positive keywords from the reviews."),
    negativeKeywords: z.array(z.string()).describe("A list of frequently mentioned negative keywords or points of improvement from the reviews."),
});

export const ProductPageOptimizerOutputSchema = z.object({
  storyline: OptimizedStorylineSchema,
  summary: ReviewSummarySchema,
});
export type ProductPageOptimizerOutput = z.infer<typeof ProductPageOptimizerOutputSchema>;
