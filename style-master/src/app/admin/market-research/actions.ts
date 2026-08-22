
'use server';

import { analyzeMarket, MarketAnalysisInput, MarketAnalysisOutput } from '@/ai/flows/market-research';

export async function analyzeMarketAction(input: MarketAnalysisInput): Promise<{ success: true, data: MarketAnalysisOutput } | { success: false, error: string }> {
  const serverProjectId = process.env.GCLOUD_PROJECT || 'GCLOUD_PROJECT 환경 변수 없음';
  try {
    const result = await analyzeMarket(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing market:', error);
    let errorMessage = `알 수 없는 오류가 발생했습니다. (서버 프로젝트 ID: ${serverProjectId})`;
    if (error instanceof Error) {
        if (error.message.includes('Could not refresh access token') || error.message.includes('permission denied')) {
            errorMessage = `데이터베이스 또는 AI 서비스 접근 권한이 없습니다. Firebase 프로젝트의 서비스 계정 권한을 확인해주세요. (서버 프로젝트 ID: ${serverProjectId})`;
        } else {
            errorMessage = `시장 분석 중 오류가 발생했습니다: ${error.message} (서버 프로젝트 ID: ${serverProjectId})`;
        }
    }
    return { success: false, error: errorMessage };
  }
}
