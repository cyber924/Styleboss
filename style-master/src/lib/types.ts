

import type { Timestamp } from "firebase/firestore";
import { z } from 'zod';

// Type for AI-generated similar products, used within the Product type
export type GeneratedProduct = {
  name: string;
  description: string;
  imageUrl: string;
};

export type ProductCategory = '아우터' | '상의' | '하의' | '원피스' | '액세서리' | '기타';
export const productCategories: ProductCategory[] = ['아우터', '상의', '하의', '원피스', '액세서리', '기타'];


export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'latest' | 'popular' | 'all';
  description: string;
  dataAiHint?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  // Fields for AI-generated enhancements
  aiStylingSuggestion?: string;
  aiSimilarProducts?: GeneratedProduct[];
  enhancementsUpdatedAt?: Timestamp;
  quantity?: number;
};

// NEW TYPES FOR AI PRODUCTS
export type AiProductOption = {
  name: string; // e.g., "색상"
  values: string[]; // e.g., ["블랙", "화이트", "베이지"]
};

export type AiProductSpecification = {
  key: string;
  value: string;
};

export type AiProductReview = {
  author: string;
  rating: number; // 1-5
  text: string;
  createdAt: string; // e.g., "2024.07.29"
};

// This is now the unified structure for detailed products like AiProduct and HotProduct.
type DetailedProductBase = {
    id: string;
    name: string;
    price: number;
    mainImageUrl: string;
    thumbnailImageUrls: string[];
    shippingInfo: string;
    options: AiProductOption[];
    summaryBanner: {
        imageUrl: string;
        keyPoints: string[];
    };
    detailImageUrls: string[];
    specifications: AiProductSpecification[];
    usagePrecautions: string;
    reviews: AiProductReview[];
    exchangeReturnInfo: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp; 
    dataAiHint?: string;
    category?: ProductCategory;
};

export type AiProduct = DetailedProductBase & {
    source: 'Coupang' | 'Naver Shopping' | 'AI-Generated';
};

export type HotProduct = DetailedProductBase & {
    // HotProduct might have specific fields in the future, but for now it shares the base.
    // For example, a discountRate field could be added here.
};


export const ProductImageGenerationInputSchema = z.object({
  productId: z.string().describe('The ID of the product for which to generate an image.'),
  productName: z.string().describe('The name of the product, used to create a better image prompt.'),
});
export type ProductImageGenerationInput = z.infer<typeof ProductImageGenerationInputSchema>;

export const ProductImageGenerationOutputSchema = z.object({
  publicUrl: z.string().describe('The public URL of the generated image in Firebase Storage.'),
});
export type ProductImageGenerationOutput = z.infer<typeof ProductImageGenerationOutputSchema>;

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  createdAt?: Timestamp;
  lastLoginAt?: Timestamp;
  // New fields for CRM
  grade: 'Basic' | 'Premium' | 'VIP';
  realName?: string;
  phone?: string;
  address?: string;
  preferredCategories?: ProductCategory[];
};
