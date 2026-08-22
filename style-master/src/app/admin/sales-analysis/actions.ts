
'use server';

import { analyzeSalesData, SalesAnalysisInput, SalesAnalysisReport } from '@/ai/flows/sales-analysis';

// This action now uses the simplified flow, which only returns the strategic recommendation.
export async function analyzeSalesDataAction(input: SalesAnalysisInput): Promise<{ success: true, data: SalesAnalysisReport } | { success: false, error: string }> {
  const serverProjectId = process.env.GCLOUD_PROJECT || 'GCLOUD_PROJECT 환경 변수 없음';
  try {
    const result = await analyzeSalesData(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing sales data:', error);
    let errorMessage = `알 수 없는 오류가 발생했습니다. (서버 프로젝트 ID: ${serverProjectId})`;
    if (error instanceof Error) {
        if (error.message.includes('Could not refresh access token') || error.message.includes('permission denied')) {
            errorMessage = `AI 서비스 접근 권한이 없습니다. Firebase 프로젝트의 서비스 계정 권한을 확인해주세요. (서버 프로젝트 ID: ${serverProjectId})`;
        } else {
            errorMessage = `AI 전략 제안 생성 중 오류가 발생했습니다: ${error.message} (서버 프로젝트 ID: ${serverProjectId})`;
        }
    }
    return { success: false, error: errorMessage };
  }
}
