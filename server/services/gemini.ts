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

const CATEGORY_IMAGES: Record<string, string[]> = {
  '상의': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'
  ],
  '하의': [
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=800&q=80'
  ],
  '아우터': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80'
  ],
  '잡화': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80'
  ],
  '액세서리': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
  ]
};

export async function generateFashionCampaign(params: {
  concept: string;
  weather: string;
  tpo: string;
  targetGender: string;
  targetAge: string;
  budget: string;
  customPrompt?: string;
}): Promise<{
  campaignTitle: string;
  campaignSubtitle: string;
  campaignDescription: string;
  tag: string;
  products: Array<{
    name: string;
    price: number;
    originalPrice: number;
    categoryLabel: string;
    imageUrl: string;
    description: string;
    aiStylingSuggestion: string;
    tags: string[];
  }>;
}> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const systemInstruction = `당신은 대한민국 최고급 패션 브랜드의 대표 디렉터이자 패션 전문 수석 MD(Merchandiser)입니다.
사용자의 타겟 정보 및 기획 콘셉트 조건들을 분석하여 완벽한 비주얼과 소구력을 갖춘 기획전 캡슐 컬렉션을 기획하세요.

전달받는 조건:
- 기획 메인 콘셉트: ${params.concept}
- 날씨/시즌: ${params.weather}
- TPO: ${params.tpo}
- 대상 성별: ${params.targetGender}
- 타겟 연령대: ${params.targetAge}
- 예산 대역: ${params.budget}
- 추가 요청사항: ${params.customPrompt || '없음'}

반드시 3개의 기획전 맞춤 상품을 생성하되, 카테고리는 각각 '상의', '하의', '아우터' 또는 '잡화' 또는 '액세서리'로 골고루 배치해 주세요.
예산 대역에 따라 가격대를 현실적으로 설정하세요 (Budget-Friendly는 3~7만원대, Moderate는 5~15만원대, Premium Luxury는 15~80만원대 등).
originalPrice는 항상 price보다 약 15~25% 높게 책정하여 기획전 할인 효과를 풍부하게 연출하세요.

반드시 아래의 정밀한 JSON 구조로만 응답해야 합니다 (Markdown 코드블록 없이 순수 JSON):
{
  "campaignTitle": "트렌디하고 주목도 높은 기획전 한글 제목 (예: [성수 팝업 프리패스] 스트릿 유틸리티 룩)",
  "campaignSubtitle": "멋스러운 영문 믹스 브랜드 서브타이틀 (예: Urban Utility & Retro Gorpcore Combo)",
  "campaignDescription": "이 기획전의 패션 트렌드, 코디 특징, 제안 이유 등을 매력적으로 설명하는 2문장 내외의 한글 소개글",
  "tag": "핵심 셀링 태그 1개 (예: Z세대 급상승, 실시간 트렌드 1위, MD 강추)",
  "products": [
    {
      "name": "[AI 큐레이션] 상품 한글 명칭 (예: 피그먼트 다잉 워싱 레이어 후드)",
      "price": 가격 숫자 (예: 84000),
      "originalPrice": 정상가 숫자 (예: 110000),
      "categoryLabel": "'상의' | '하의' | '아우터' | '잡화' | '액세서리' 중 정확히 하나",
      "description": "상품 원단, 핏, 장점이 돋보이는 1~2문장의 전문적인 상품 한글 설명",
      "aiStylingSuggestion": "이 상품을 중심으로 매칭하기 좋은 다른 제품군이나 구체적인 스타일 연출 조언",
      "tags": ["패션태그1", "패션태그2", "패션태그3"]
    }
  ]
}`;

  const promptText = `기획 조건:
- 콘셉트: \${params.concept}
- 시즌/날씨: \${params.weather}
- 상황(TPO): \${params.tpo}
- 성별: \${params.targetGender}
- 연령대: \${params.targetAge}
- 예산: \${params.budget}
- 추가 기획 아이디어: \${params.customPrompt || '없음'}

조건에 매칭되는 감도 높은 기획전 캠페인 정보를 JSON으로 즉시 제안하세요.`;

  try {
    const response = await client.models.generateContent({
      model,
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const rawText = (response.text || '{}').trim();
    const parsed = JSON.parse(rawText);

    // Dynamic Unsplash image mapping based on category and randomizing index
    const productsWithImages = (parsed.products || []).map((prod: any, idx: number) => {
      const cat = prod.categoryLabel || '상의';
      const imagesForCat = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['상의'];
      // Deterministically pick or randomize image from list
      const imgUrl = imagesForCat[(idx + Math.floor(Math.random() * 3)) % imagesForCat.length];
      return {
        name: prod.name || '[AI 큐레이션] 패션 아이템',
        price: typeof prod.price === 'number' ? prod.price : 75000,
        originalPrice: typeof prod.originalPrice === 'number' ? prod.originalPrice : 95000,
        categoryLabel: cat,
        imageUrl: imgUrl,
        description: prod.description || '시즌 베스트 트렌드 아이템입니다.',
        aiStylingSuggestion: prod.aiStylingSuggestion || '다양한 하의 및 아우터와 편안하고 멋스럽게 레이어드할 수 있습니다.',
        tags: Array.isArray(prod.tags) && prod.tags.length > 0 ? prod.tags : ['신상', '트렌디룩', 'AI추천']
      };
    });

    return {
      campaignTitle: parsed.campaignTitle || 'AI 스마트 맞춤 기획전',
      campaignSubtitle: parsed.campaignSubtitle || 'Custom AI Curation Selection',
      campaignDescription: parsed.campaignDescription || 'StyleWise AI가 선정한 트렌디 패션 캡슐 컬렉션입니다.',
      tag: parsed.tag || '실시간 최신 트렌드',
      products: productsWithImages.length > 0 ? productsWithImages : [
        {
          name: '[AI 큐레이션] 캐시미어 블렌드 니트',
          price: 89000,
          originalPrice: 110000,
          categoryLabel: '상의',
          imageUrl: CATEGORY_IMAGES['상의'][0],
          description: '부드러운 캐시미어와 엑스트라 파인 메리노 울 블렌드로 최상의 터치감을 선사합니다.',
          aiStylingSuggestion: '포멀한 크림 슬랙스나 미니멀 와이드 세미 드레이프 팬츠와 매치하면 극강의 세련미를 뽐냅니다.',
          tags: ['캐시미어', '데일리웨어', '미니멀시크']
        }
      ]
    };
  } catch (err) {
    console.error('Failed to generate or parse AI Fashion Campaign, using structured fallback:', err);
    // Fallback based on parameters
    const fallbackTitle = `[${params.concept}] ${params.weather} 포커스 기획 컬렉션`;
    return {
      campaignTitle: fallbackTitle,
      campaignSubtitle: 'Exclusive Seasonal Editorial curated by StyleWise AI',
      campaignDescription: `${params.targetAge}를 타겟으로 하는 ${params.concept} 스타일의 스페셜 큐레이션입니다. ${params.weather} 및 ${params.tpo} 상황에 맞는 에센셜 아이템을 제안합니다.`,
      tag: 'MD 추천 컬렉션',
      products: [
        {
          name: `[AI 큐레이션] ${params.concept} 에센셜 탑`,
          price: params.budget === 'Premium Luxury' ? 198000 : 64000,
          originalPrice: params.budget === 'Premium Luxury' ? 245000 : 80000,
          categoryLabel: '상의',
          imageUrl: CATEGORY_IMAGES['상의'][2 % CATEGORY_IMAGES['상의'].length],
          description: '실용성과 패셔너블한 실루엣을 겸비하여 데일리룩의 포인트가 되어주는 세련된 탑.',
          aiStylingSuggestion: '와이드 핏 데님이나 미니멀 슬랙스에 캐주얼하게 매칭하여 밸런스 있는 어반 시크룩을 만들어 보세요.',
          tags: [params.concept, '트렌디룩', '인기폭발']
        },
        {
          name: `[AI 큐레이션] ${params.concept} 릴랙스드 팬츠`,
          price: params.budget === 'Premium Luxury' ? 220000 : 72000,
          originalPrice: params.budget === 'Premium Luxury' ? 280000 : 90000,
          categoryLabel: '하의',
          imageUrl: CATEGORY_IMAGES['하의'][3 % CATEGORY_IMAGES['하의'].length],
          description: '체형을 보정해주는 유려한 드레이프성과 허리 밴딩 처리로 종일 입어도 편안한 트렌디 슬랙스 팬츠.',
          aiStylingSuggestion: '오버사이즈 가디건이나 깔끔한 옥스포드 셔츠와 조화롭게 매칭하기 좋습니다.',
          tags: ['데일리팬츠', '편안한실루엣', '베스트셀러']
        },
        {
          name: `[AI 큐레이션] ${params.concept} 프리미엄 아우터`,
          price: params.budget === 'Premium Luxury' ? 420000 : 145000,
          originalPrice: params.budget === 'Premium Luxury' ? 530000 : 180000,
          categoryLabel: '아우터',
          imageUrl: CATEGORY_IMAGES['아우터'][0 % CATEGORY_IMAGES['아우터'].length],
          description: '프리미엄 봉제 마감과 높은 보온성/활동성 구조의 감각적인 아우터.',
          aiStylingSuggestion: '베이직한 티셔츠 위에 매칭하여 전체 기획전의 완성도를 높이는 키(Key) 아이템.',
          tags: ['포인트자켓', '간절기필수', '시그니처']
        }
      ]
    };
  }
}
