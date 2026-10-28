import { Router } from 'express';
import { generateContentWithGemini, generateFashionStyling, generateFashionCampaign } from '../services/gemini.js';

export const aiRouter = Router();

/**
 * POST /api/generate
 * Standard Gemini text generation endpoint.
 * Request: { prompt: string }
 * Response: { success: true, text: string }
 */
aiRouter.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '유효한 prompt 문자열을 입력해주세요.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const text = await generateContentWithGemini(prompt.trim());
    return res.json({
      success: true,
      text,
    });
  } catch (error: any) {
    console.error('[AI Error in /api/generate]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gemini API 호출 중 서버 오류가 발생했습니다.',
    });
  }
});

/**
 * POST /api/ai/styling (or /api/style-recommendation)
 * Structured fashion consultation powered by Gemini.
 * Request: { prompt: string }
 * Response: { success: true, data: { concept, description, suggestedItems, palette, stylingTip } }
 */
aiRouter.post('/ai/styling', async (req, res) => {
  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: '유효한 스타일 요청 문장을 입력해주세요.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const data = await generateFashionStyling(prompt.trim());
    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[AI Error in /api/ai/styling]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '스타일링 생성 중 서버 오류가 발생했습니다.',
    });
  }
});

/**
 * POST /api/ai/planner
 * Advanced AI MD Fashion Planning Campaign Generator.
 * Request: { concept, weather, tpo, targetGender, targetAge, budget, customPrompt }
 * Response: { success: true, campaign }
 */
aiRouter.post('/ai/planner', async (req, res) => {
  try {
    const { concept, weather, tpo, targetGender, targetAge, budget, customPrompt } = req.body || {};

    if (!concept || !weather || !tpo) {
      return res.status(400).json({
        success: false,
        error: '기획을 위해 필수 파라미터(concept, weather, tpo)가 필요합니다.',
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: '서버에 GEMINI_API_KEY 환경변수가 설정되지 않았습니다.',
      });
    }

    const campaign = await generateFashionCampaign({
      concept,
      weather,
      tpo,
      targetGender: targetGender || 'Unisex',
      targetAge: targetAge || '20s-30s',
      budget: budget || 'Moderate',
      customPrompt
    });

    return res.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    console.error('[AI Error in /api/ai/planner]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI 패션 기획전 생성 중 서버 오류가 발생했습니다.',
    });
  }
});

