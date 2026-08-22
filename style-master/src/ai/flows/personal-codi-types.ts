/**
 * @fileOverview This file contains the Zod schemas and TypeScript types 
 * for the personal-codi-flow. These are separated to allow the main flow 
 * file to be a "use server" module while these types can be imported 
 * into client components without issue.
 */

import { z } from 'zod';

// Input Schema: Takes a data URI of the user's photo
export const PersonalCodiInputSchema = z.object({
  userImage: z
    .string()
    .describe(
      "A full-body photo of the user, as a data URI that must include a MIME type and use Base64 encoding. The AI will analyze this image to suggest outfits."
    ),
});
export type PersonalCodiInput = z.infer<typeof PersonalCodiInputSchema>;


// Output Schema: Defines the structure of the AI's suggestions
const ClothingItemSchema = z.object({
    name: z.string().describe("의상 아이템의 이름 (예: '루즈핏 코튼 티셔츠'). 모든 텍스트는 한국어로 작성되어야 합니다."),
    description: z.string().describe("아이템에 대한 간략한 스타일링 설명. 모든 텍스트는 한국어로 작성되어야 합니다."),
    priceTier: z.string().describe("제안된 아이템의 가격대. '상', '중', '하' 등급과 함께 예상 시장 가격 범위를 원화(KRW)로 명시해야 합니다 (예: '중 (4만원 ~ 6만원)'). 모든 텍스트는 한국어로 작성되어야 합니다."),
    imageUrl: z.string().describe("AI가 생성한 의상 아이템의 이미지 데이터 URI."),
});

const StyleSuggestionSchema = z.object({
  conceptTitle: z.string().describe("제안된 전체 스타일의 컨셉 이름 (예: '캐주얼 데일리룩'). 모든 텍스트는 한국어로 작성되어야 합니다."),
  top: ClothingItemSchema.describe("추천 상의 아이템 정보."),
  bottom: ClothingItemSchema.describe("추천 하의 아이템 정보."),
});

export const PersonalCodiOutputSchema = z.object({
  suggestions: z
    .array(StyleSuggestionSchema)
    .min(2)
    .max(3)
    .describe('사용자에게 제안할 2-3가지 스타일링 조합 리스트.'),
});
export type PersonalCodiOutput = z.infer<typeof PersonalCodiOutputSchema>;


// Internal schema for the multi-modal prompt's text-based output
export const OutfitIdeasSchema = z.object({
    ideas: z.array(z.object({
        conceptTitle: z.string(),
        top: z.object({ 
            name: z.string(), 
            description: z.string(), 
            priceTier: z.string() 
        }),
        bottom: z.object({ 
            name: z.string(), 
            description: z.string(), 
            priceTier: z.string() 
        }),
    })).describe("An array of 2-3 outfit ideas, each with a concept title, top, and bottom clothing item description.")
});
