
'use server';

import { generateSnsContent, SnsContentInput, SnsContentOutput } from '@/ai/flows/sns-content-generation';

export async function generateSnsContentAction(input: SnsContentInput): Promise<{ success: true, data: SnsContentOutput } | { success: false, error: string }> {
  const serverProjectId = process.env.GCLOUD_PROJECT || 'GCLOUD_PROJECT 환경 변수 없음';
  try {
    const result = await generateSnsContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error generating SNS content:', error);
    let errorMessage = `알 수 없는 오류가 발생했습니다. (서버 프로젝트 ID: ${serverProjectId})`;
    if (error instanceof Error) {
        if (error.message.includes('Could not refresh access token') || error.message.includes('permission denied')) {
            errorMessage = `데이터베이스 또는 AI 서비스 접근 권한이 없습니다. Firebase 프로젝트의 서비스 계정 권한을 확인해주세요. (서버 프로젝트 ID: ${serverProjectId})`;
        } else {
            errorMessage = `콘텐츠 생성 중 오류가 발생했습니다: ${error.message} (서버 프로젝트 ID: ${serverProjectId})`;
        }
    }
    return { success: false, error: errorMessage };
  }
}
