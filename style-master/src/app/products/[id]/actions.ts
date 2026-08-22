

'use server';

import { 
  enhanceProductDetail, 
  ProductDetailEnhancementInput,
  ProductDetailEnhancementOutput
} from '@/ai/flows/product-detail-enhancement';

export type { ProductDetailEnhancementOutput };

/**
 * Calls the Genkit flow to get AI-generated styling tips and similar products.
 * This can be called by any user, so it remains a server action.
 */
export async function enhanceProductDetailAction(
  input: ProductDetailEnhancementInput
): Promise<{ success: true; data: ProductDetailEnhancementOutput } | { success: false; error: string }> {
  const serverProjectId = process.env.GCLOUD_PROJECT || 'GCLOUD_PROJECT 환경 변수 없음';
  try {
    const result = await enhanceProductDetail(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error enhancing product detail:', error);
    let errorMessage = `AI 추천 정보를 가져오는 데 실패했습니다. (서버 프로젝트 ID: ${serverProjectId})`;
    if (error instanceof Error) {
        if (error.message.includes('Could not refresh access token') || error.message.includes('permission denied')) {
            errorMessage = `AI 서비스 접근 권한이 없습니다. Firebase 프로젝트의 서비스 계정 권한을 확인해주세요. (서버 프로젝트 ID: ${serverProjectId})`;
        } else {
            errorMessage = `${errorMessage}: ${error.message}`;
        }
    }
    return { success: false, error: errorMessage };
  }
}

    