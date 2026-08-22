'use server';

/**
 * @fileOverview An AI flow for generating personalized styling suggestions based on a user's photo.
 * - generatePersonalCodi - Analyzes a user's photo and suggests complete outfits.
 */

import { ai } from '@/ai/genkit';
import { 
  PersonalCodiInputSchema,
  PersonalCodiOutputSchema,
  OutfitIdeasSchema,
  type PersonalCodiInput,
  type PersonalCodiOutput
} from './personal-codi-types';


// The main function that will be called from the client
export async function generatePersonalCodi(input: PersonalCodiInput): Promise<PersonalCodiOutput> {
  return personalCodiFlow(input);
}


// The Genkit Flow
const personalCodiFlow = ai.defineFlow(
  {
    name: 'personalCodiFlow',
    inputSchema: PersonalCodiInputSchema,
    outputSchema: PersonalCodiOutputSchema,
  },
  async ({ userImage }) => {
    
    // Step 1: Analyze the user's image and generate text-based outfit ideas (names, descriptions, price tiers).
    const ideasPrompt = `
      You are an expert Korean fashion stylist. Analyze the provided user's full-body photo. 
      Pay attention to their body shape, overall vibe, and potential context (e.g., season).
      Based on your analysis, propose 2-3 distinct and complete styling concepts (e.g., "캐주얼 데일리룩", "주말 데이트룩").
      For each concept, suggest a matching top and bottom item. 
      For each item, provide a creative Korean name, a short description, and a price tier.
      The price tier must include a grade ('상', '중', '하') and an estimated price range in Korean Won (e.g., '하 (2만원 ~ 4만원)').
      IMPORTANT: All text output (titles, names, descriptions, etc.) must be in KOREAN.
      Your output must strictly follow the requested JSON schema.
      
      User Photo: {{media url=userImage}}
    `;
    
    const ideasResult = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: ideasPrompt,
        output: { schema: OutfitIdeasSchema }
    });

    const outfitIdeas = ideasResult.output?.ideas;
    if (!outfitIdeas || outfitIdeas.length === 0) {
        throw new Error("Failed to generate outfit ideas from the user's photo.");
    }
    
    // Step 2: For each generated idea, generate images for the top and bottom items, referencing the original photo.
    const suggestionsWithImages = await Promise.all(
      outfitIdeas.map(async (idea) => {

        const generateImage = async (itemName: string, itemDescription: string, itemType: 'top' | 'bottom') => {
            const imagePrompt = `
              Reference the user's body shape from the provided photo.
              Now, generate a professional, clean e-commerce product shot of just one clothing item: a "${itemName}".
              Description: "${itemDescription}".
              The item should be presented as if it would fit the person in the photo. 
              Place it on a simple, neutral background.
              IMPORTANT: Only generate the single clothing item, not the person.
            `;
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.0-flash-preview-image-generation',
                prompt: [
                    { media: { url: userImage } },
                    { text: imagePrompt }
                ],
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                },
            });
            return media?.url || 'https://placehold.co/400x533.png';
        };

        const [topImageUrl, bottomImageUrl] = await Promise.all([
            generateImage(idea.top.name, idea.top.description, 'top'),
            generateImage(idea.bottom.name, idea.bottom.description, 'bottom')
        ]);
        
        return {
          conceptTitle: idea.conceptTitle,
          top: { ...idea.top, imageUrl: topImageUrl },
          bottom: { ...idea.bottom, imageUrl: bottomImageUrl },
        };
      })
    );

    return { suggestions: suggestionsWithImages };
  }
);
