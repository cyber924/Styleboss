import { GoogleGenAI } from '@google/genai';

let genAiClient: GoogleGenAI | null = null;

/**
 * Returns a singleton instance of the GoogleGenAI client initialized with the server-side GEMINI_API_KEY.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    genAiClient = new GoogleGenAI({ apiKey });
  }
  return genAiClient;
}

/**
 * Generates raw text using the official @google/genai SDK.
 */
export async function generateContentWithGemini(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  const response = await client.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || '';
}

/**
 * Generates structured fashion styling recommendations for the AI Stylist.
 */
export async function generateFashionStyling(prompt: string): Promise<{
  concept: string;
  description: string;
  suggestedItems: string[];
  palette: string[];
  stylingTip: string;
}> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  
  const systemInstruction = `당신은 대한민국 정상급 패션 디렉터이자 StyleWise AI 패션 스타일리스트입니다. 
사용자의 상황, 날씨, 장소, 스타일링 요청에 맞추어 매우 세련되고 트렌디한 패션 코디네이션을 제안하세요.
반드시 아래 JSON 형식으로만 정확하게 응답하세요 (Markdown 코드블록 없이 순수 JSON):
{
  "concept": "스타일 콘셉트명 (예: 모던 어반 프렌치 시크 룩)",
  "description": "전체적인 무드와 스타일 설명 1~2문장",
  "suggestedItems": ["아이템1", "아이템2", "아이템3"],
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "stylingTip": "구체적인 착용 팁 및 포인트 조언"
}`;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    }
  });

  const rawText = (response.text || '{}').trim();
  try {
    const parsed = JSON.parse(rawText);
    return {
      concept: parsed.concept || 'AI 맞춤 패션 스타일',
      description: parsed.description || '요청하신 분위기에 맞춘 트렌디한 스타일링입니다.',
      suggestedItems: Array.isArray(parsed.suggestedItems) && parsed.suggestedItems.length > 0 
        ? parsed.suggestedItems 
        : ['맞춤 추천 탑', '테일러드 팬츠', '시즌 에센셜 아우터'],
      palette: Array.isArray(parsed.palette) && parsed.palette.length > 0 
        ? parsed.palette 
        : ['#1C1D21', '#E0DDCF', '#8D99AE', '#2B2D42'],
      stylingTip: parsed.stylingTip || '기본 아이템과 포인트 아이템의 밸런스를 맞춰보세요.',
    };
  } catch (err) {
    console.warn('Failed to parse Gemini JSON, providing formatted fallback:', err);
    return {
      concept: 'AI 스마트 퍼스널 룩',
      description: rawText.slice(0, 150) || '고객 맞춤형 스타일링 제안입니다.',
      suggestedItems: ['클래식 테일러드 자켓', '스트레이트 핏 슬랙스', '실크 블렌드 이너'],
      palette: ['#2F3E46', '#D4A373', '#F5EBE6', '#1C1D21'],
      stylingTip: '실루엣의 강약을 조절하여 세련된 분위기를 연출하세요.',
    };
  }
}
