import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper to get GoogleGenAI client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StyleWise AI Mall API',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/generate
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '유효한 prompt 문자열을 입력해주세요.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const ai = getGeminiClient();
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: prompt.trim(),
    });

    return res.json({
      success: true,
      text: response.text || '',
    });
  } catch (error) {
    console.error('[AI Error in /api/generate]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gemini API 호출 중 서버 오류가 발생했습니다.',
    });
  }
});

/**
 * POST /api/ai/styling
 */
app.post('/api/ai/styling', async (req, res) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '유효한 스타일 요청 문장을 입력해주세요.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const ai = getGeminiClient();
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

    const response = await ai.models.generateContent({
      model,
      contents: prompt.trim(),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const rawText = (response.text || '{}').trim();
    try {
      const parsed = JSON.parse(rawText);
      return res.json({
        success: true,
        data: {
          concept: parsed.concept || 'AI 맞춤 패션 스타일',
          description: parsed.description || '요청하신 분위기에 맞춘 트렌디한 스타일링입니다.',
          suggestedItems: Array.isArray(parsed.suggestedItems) && parsed.suggestedItems.length > 0 
            ? parsed.suggestedItems 
            : ['맞춤 추천 탑', '테일러드 팬츠', '시즌 에센셜 아우터'],
          palette: Array.isArray(parsed.palette) && parsed.palette.length > 0 
            ? parsed.palette 
            : ['#1C1D21', '#E0DDCF', '#8D99AE', '#2B2D42'],
          stylingTip: parsed.stylingTip || '기본 아이템과 포인트 아이템의 밸런스를 맞춰보세요.',
        }
      });
    } catch (err) {
      console.warn('Failed to parse JSON response from Gemini:', err);
      return res.json({
        success: true,
        data: {
          concept: 'AI 스마트 퍼스널 룩',
          description: rawText.slice(0, 150) || '고객 맞춤형 스타일링 제안입니다.',
          suggestedItems: ['클래식 테일러드 자켓', '스트레이트 핏 슬랙스', '실크 블렌드 이너'],
          palette: ['#2F3E46', '#D4A373', '#F5EBE6', '#1C1D21'],
          stylingTip: '실루엣의 강약을 조절하여 세련된 분위기를 연출하세요.',
        }
      });
    }
  } catch (error) {
    console.error('[AI Error in /api/ai/styling]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '스타일링 생성 중 서버 오류가 발생했습니다.',
    });
  }
});

/**
 * POST /api/ai/planner
 */
app.post('/api/ai/planner', async (req, res) => {
  try {
    const { concept, weather, tpo, targetGender, targetAge, budget, customPrompt } = req.body || {};
    if (!concept || !weather || !tpo) {
      return res.status(400).json({
        success: false,
        error: '기획을 위해 필수 파라미터(concept, weather, tpo)가 필요합니다.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const ai = getGeminiClient();
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const systemInstruction = `당신은 대한민국 최고급 패션 브랜드의 대표 디렉터이자 패션 전문 수석 MD입니다.
사용자의 타겟 정보 및 기획 콘셉트 조건들을 분석하여 완벽한 비주얼과 소구력을 갖춘 기획전 캡슐 컬렉션을 기획하세요.
반드시 3개의 기획전 맞춤 상품을 생성하되 상의, 하의, 아우터 카테고리로 골고루 배치해 주세요.
반드시 아래 JSON 구조로만 응답하세요:
{
  "campaignTitle": "기획전 한글 제목",
  "campaignSubtitle": "영문 서브타이틀",
  "campaignDescription": "기획전 설명 2문장 내외",
  "tag": "핵심 태그",
  "products": [
    {
      "name": "상품명",
      "price": 84000,
      "originalPrice": 110000,
      "categoryLabel": "상의",
      "description": "상품 설명",
      "aiStylingSuggestion": "스타일 연출 조언",
      "tags": ["태그1", "태그2"]
    }
  ]
}`;

    const promptText = `기획 조건: 콘셉트: ${concept}, 시즌: ${weather}, TPO: ${tpo}, 성별: ${targetGender || '유니섹스'}, 연령대: ${targetAge || '20-30대'}, 예산: ${budget || 'Moderate'}, 추가: ${customPrompt || '없음'}`;

    const response = await ai.models.generateContent({
      model,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    return res.json({
      success: true,
      campaign: parsed,
    });
  } catch (error) {
    console.error('[AI Error in /api/ai/planner]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI 패션 기획전 생성 중 서버 오류가 발생했습니다.',
    });
  }
});

// Standalone execution for Cloud Run and Local Dev (Skipped on Vercel)
if (process.env.VERCEL !== '1') {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  // For SPA router
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const distIndexPath = path.join(distPath, 'index.html');
    const rootIndexPath = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(distIndexPath)) {
      res.sendFile(distIndexPath);
    } else if (fs.existsSync(rootIndexPath)) {
      res.sendFile(rootIndexPath);
    } else {
      res.status(200).send('<!doctype html><html><body><div id="root"></div></body></html>');
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StyleWise AI backend listening on port ${PORT}`);
  });
}

export default app;
