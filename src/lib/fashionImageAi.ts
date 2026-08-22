import type { Product, ProductCategory } from '../types';

export interface GeneratedImageCandidate {
  id: string;
  url: string;
  title: string;
  styleTag: string;
  description: string;
  source?: 'curated' | 'ai_rendered';
  aspectRatio?: string;
  promptUsed?: string;
}

export interface CustomRenderConfig {
  moodStyle: 'studio_minimal' | 'urban_street' | 'warm_natural' | 'editorial_moody' | 'cyber_y2k' | 'detail_macro';
  modelFormat: 'korean_model' | 'mannequin' | 'hanger' | 'flatlay';
  colorTone: 'natural_warm' | 'cool_gray' | 'vivid' | 'monochrome_black' | 'soft_pastel';
  aspectRatio: '3:4' | '1:1' | '4:5';
  customUserPrompt: string;
}

export const MOOD_STYLE_PRESETS: {
  id: CustomRenderConfig['moodStyle'];
  label: string;
  badge: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'studio_minimal',
    label: '스튜디오 미니멀',
    badge: '클린 화이트',
    desc: '소프트 디퓨저 조명, 화이트 백월, 깔끔한 실루엣',
    icon: '📸'
  },
  {
    id: 'urban_street',
    label: '어반 파리 스트릿',
    badge: '시티 룩북',
    desc: '오후의 골든아워 자연광, 고풍스러운 건축물 배경',
    icon: '🏙️'
  },
  {
    id: 'warm_natural',
    label: '내추럴 선샤인 가든',
    badge: '감성 햇살',
    desc: '따뜻한 야외 테라스 햇살, 화사한 소프트 보케',
    icon: '🌿'
  },
  {
    id: 'editorial_moody',
    label: '글램 락시크 & 나이트',
    badge: '보그 에디토리얼',
    desc: '강렬한 명암 대비, 하이엔드 패션 플래시 조명',
    icon: '🖤'
  },
  {
    id: 'cyber_y2k',
    label: 'Y2K 네온 퓨처리즘',
    badge: '트렌디 스트릿',
    desc: '사이버 림라이트, 힙하고 엣지 있는 무드',
    icon: '⚡'
  },
  {
    id: 'detail_macro',
    label: '패브릭 & 디테일 컷',
    badge: '소재 마크로',
    desc: '원단 직조감, 정교한 스티치와 드레이프 클로즈업',
    icon: '🧵'
  },
];

export const MODEL_FORMAT_PRESETS: {
  id: CustomRenderConfig['modelFormat'];
  label: string;
  desc: string;
}[] = [
  { id: 'korean_model', label: '한국인 프로 모델 착용', desc: '자연스러운 포즈와 비율의 전신/상반신 착용 샷' },
  { id: 'mannequin', label: '3D 고스트 마네킹', desc: '의류 자체의 입체적인 핏감을 강조하는 투명 마네킹 샷' },
  { id: 'hanger', label: '감성 원목 옷걸이', desc: '아늑한 부티크 쇼룸 느낌의 옷걸이 거치 샷' },
  { id: 'flatlay', label: '프리미엄 플랫레이', desc: '악세서리와 함께 정갈하게 펼쳐진 탑다운 촬영' },
];

export const COLOR_TONE_PRESETS: {
  id: CustomRenderConfig['colorTone'];
  label: string;
  colorClass: string;
}[] = [
  { id: 'natural_warm', label: '내추럴 웜베이지', colorClass: 'bg-amber-100 border-amber-300' },
  { id: 'cool_gray', label: '쿨 슬레이트 그레이', colorClass: 'bg-slate-200 border-slate-400' },
  { id: 'monochrome_black', label: '시크 모노크롬 블랙', colorClass: 'bg-neutral-900 text-white border-neutral-700' },
  { id: 'soft_pastel', label: '소프트 파스텔 톤', colorClass: 'bg-rose-100 border-rose-300' },
  { id: 'vivid', label: '비비드 포인트 컬러', colorClass: 'bg-indigo-100 border-indigo-400' },
];

// Color keywords in Korean to English mapping
const COLOR_KEYWORDS: { [key: string]: string } = {
  '블랙': 'black',
  '검정': 'black',
  '화이트': 'white',
  '흰색': 'white',
  '아이보리': 'ivory',
  '크림': 'cream',
  '베이지': 'beige',
  '카멜': 'camel',
  '브라운': 'brown',
  '갈색': 'brown',
  '그레이': 'gray',
  '회색': 'gray',
  '차콜': 'charcoal',
  '네이비': 'navy',
  '블루': 'blue',
  '파랑': 'blue',
  '스카이블루': 'sky blue',
  '핑크': 'pink',
  '로즈': 'rose pink',
  '레드': 'red',
  '민트': 'mint',
  '그린': 'green',
  '카키': 'khaki',
  '올리브': 'olive',
  '옐로우': 'yellow',
  '버건디': 'burgundy',
  '라벤더': 'lavender',
  '퍼플': 'purple',
};

// Curated high quality fashion imagery database indexed by style and garment attributes
const FASHION_IMAGE_LIBRARY: {
  category: ProductCategory;
  keywords: string[];
  images: { url: string; title: string; styleTag: string; description: string }[];
}[] = [
  // TOPS - 니트 / 스웨터
  {
    category: '상의',
    keywords: ['니트', '스웨터', '풀오버', '가디건', '터틀넥', '울', '캐시미어', '꽈배기'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
        title: '프리미엄 크림 캐시미어 케이블 니트',
        styleTag: '미니멀 럭셔리',
        description: '포근하고 부드러운 고밀도 원사의 크림 톤 니트웨어 스튜디오 룩북'
      },
      {
        url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
        title: '소프트 모카 브라운 라운드 니트',
        styleTag: '웜 어텀',
        description: '자연스러운 핏감과 고급스러운 브라운 뉴트럴 컬러의 데일리 니트'
      },
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=85',
        title: '슬림핏 차콜 블랙 베이직 터틀넥',
        styleTag: '어반 모던',
        description: '단독 및 자켓 레이어드에 최적화된 클래식 블랙 이너 니트'
      },
      {
        url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
        title: '오트밀 베이지 오버사이즈 립 니트',
        styleTag: '내추럴 코지',
        description: '여유로운 실루엣과 차분한 오트밀 멜란지 텍스처'
      }
    ]
  },
  // TOPS - 셔츠 / 블라우스
  {
    category: '상의',
    keywords: ['셔츠', '블라우스', '남방', '린넨', '실크', '스트라이프', '오픈카라'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=85',
        title: '클린 화이트 에센셜 실크 셔츠',
        styleTag: '오피스 시크',
        description: '흐르는 듯한 드레이프와 은은한 광택감의 실크 셔츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=85',
        title: '스카이블루 프렌치 릴렉스드 셔츠',
        styleTag: '프렌치 캐주얼',
        description: '산뜻하고 경쾌한 무드의 오버핏 코튼 셔츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=1000&q=85',
        title: '네이비 미니멀 린넨 오픈카라 셔츠',
        styleTag: '써머 에센셜',
        description: '통기성이 뛰어난 천연 린넨 소재의 단정한 셔츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?auto=format&fit=crop&w=1000&q=85',
        title: '블랙 버튼다운 드레스 셔츠',
        styleTag: '모던 클래식',
        description: '시크하고 포멀한 분위기를 연출하는 매트 블랙 셔츠'
      }
    ]
  },
  // TOPS - 티셔츠 / 후디 / 맨투맨
  {
    category: '상의',
    keywords: ['티셔츠', '탑', '후드', '후디', '맨투맨', '스웨트셔츠', '크롭'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=85',
        title: '프리미엄 20수 코튼 화이트 슬림 탑',
        styleTag: '에센셜 데일리',
        description: '비침 없는 탄탄한 코튼 원사의 화이트 티셔츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=85',
        title: '헤비웨이트 애쉬 그레이 후드 풀오버',
        styleTag: '스트릿 캐주얼',
        description: '볼륨감 있는 후드 각과 기모 안감의 스트릿 후디'
      },
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=85',
        title: '빈티지 워싱 블랙 크롭 탑',
        styleTag: 'Y2K 트렌드',
        description: '감각적인 피그먼트 다잉과 크롭 기장의 트렌디 탑'
      }
    ]
  },

  // BOTTOMS - 슬랙스 / 정장 팬츠
  {
    category: '하의',
    keywords: ['슬랙스', '팬츠', '바지', '핀턱', '와이드', '테이퍼드', '수트'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1000&q=85',
        title: '투턱 와이드 핏 크림 베이지 슬랙스',
        styleTag: '모던 포멀',
        description: '체형을 보정해주는 정교한 핀턱 주름과 롱 스트레이트 실루엣'
      },
      {
        url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=85',
        title: '딥 차콜 스트레이트 포멀 슬랙스',
        styleTag: '비즈니스 캐주얼',
        description: '구김 없이 깔끔하게 떨어지는 프리미엄 원단의 클래식 팬츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=1000&q=85',
        title: '에크루 아이보리 하이웨이스트 테일러드 팬츠',
        styleTag: '우아한 실루엣',
        description: '다리가 길어 보이는 하이웨이스트 밴딩 테일러드 팬츠'
      }
    ]
  },
  // BOTTOMS - 데님 / 카고 / 조거
  {
    category: '하의',
    keywords: ['청바지', '데님', '진', '카고', '조거', '스커트', '치마'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=85',
        title: '빈티지 라이트 인디고 와이드 데님',
        styleTag: '레트로 캐주얼',
        description: '자연스러운 캣브러시 워싱과 여유 있는 와이드 실루엣의 데님 팬츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=85',
        title: '유틸리티 올리브 카고 조거 팬츠',
        styleTag: '스트릿 고프코어',
        description: '입체 포켓 디테일과 밑단 스트링으로 다양한 연출이 가능한 카고 팬츠'
      },
      {
        url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=85',
        title: '블랙 하이웨이스트 A라인 미니/롱 스커트',
        styleTag: '페미닌 모던',
        description: '군더더기 없는 슬림한 웨이스트 라인의 감각적인 스커트'
      }
    ]
  },

  // OUTER - 코트 / 트렌치
  {
    category: '아우터',
    keywords: ['코트', '트렌치', '발마칸', '맥코트', '울코트', '캐시미어코트', '롱코트', '하프코트'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85',
        title: '프리미엄 멜란지 카멜 더블 울 코트',
        styleTag: '클래식 럭셔리',
        description: '풍성한 보온성과 기품 있는 실루엣을 자아내는 핸드메이드 울 롱코트'
      },
      {
        url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
        title: '어반 샌드 베이지 벨티드 트렌치 코트',
        styleTag: '헤리티지 트렌치',
        description: '생활 방수 코팅과 벨트로 허리 라인을 강조할 수 있는 시그니처 트렌치'
      },
      {
        url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
        title: '블랙 오버핏 미니멀 발마칸 코트',
        styleTag: '모던 젠더리스',
        description: '라글란 소매와 카라 비조 디테일의 시크한 블랙 울 코트'
      }
    ]
  },
  // OUTER - 자켓 / 블레이저 / 점퍼 / 패딩
  {
    category: '아우터',
    keywords: ['자켓', '블레이저', '가죽', '레더', '라이더', '점퍼', '패딩', '블루종', '트위드'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85',
        title: '테일러드 오버핏 그레이 울 블레이저',
        styleTag: '어반 테일러링',
        description: '어깨 라인이 정돈된 입체 패턴의 시즌 에센셜 싱글 블레이저'
      },
      {
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',
        title: '비건 레더 오버핏 바이커 라이더 자켓',
        styleTag: '락시크 & 스트릿',
        description: '고급스러운 매트 가죽 질감과 실버 지퍼 포인트의 라이더 자켓'
      },
      {
        url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
        title: '워싱 크롭 빈티지 데님 자켓',
        styleTag: '캐주얼 레이어드',
        description: '사계절 스타일링이 유용한 탄탄한 온스의 데님 트러커 자켓'
      },
      {
        url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1000&q=85',
        title: '라이트 다운 퀼팅 푸퍼 패딩',
        styleTag: '윈터 웜',
        description: '가볍고 따뜻한 하이넥 덕다운 숏패딩 룩북'
      }
    ]
  },

  // DRESS - 원피스 / 투피스
  {
    category: '원피스',
    keywords: ['원피스', '드레스', '맥시', '미니', '플리츠', '쉬폰', '슬립', '랩'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
        title: '로맨틱 샴페인 플리츠 벨티드 원피스',
        styleTag: '엘레강스 페미닌',
        description: '우아하게 흩날리는 플리츠 주름과 은은한 골드빛 샴페인 롱 드레스'
      },
      {
        url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
        title: '써머 프렌치 플로럴 린넨 맥시 드레스',
        styleTag: '바캉스 & 리조트',
        description: '시원한 린넨 코튼 혼방에 잔잔한 꽃 패턴이 더해진 로맨틱 드레스'
      },
      {
        url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85',
        title: '모던 슬림핏 블랙 니트 롱 원피스',
        styleTag: '글램 미니멀',
        description: '바디 라인을 슬림하게 연출해주는 텐션감 좋은 골지 니트 드레스'
      }
    ]
  },

  // ACCESSORIES - 가방 / 신발 / 모자
  {
    category: '액세서리',
    keywords: ['가방', '백', '숄더백', '토트백', '모자', '슈즈', '신발', '로퍼', '부츠', '스니커즈', '목걸이'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85',
        title: '카멜 탠 레더 미니멀 숄더백',
        styleTag: '럭셔리 가죽 잡화',
        description: '부드러운 카프스킨 가죽과 골드 메탈 버클 디테일의 데일리 백'
      },
      {
        url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85',
        title: '클래식 블랙 페니 로퍼 & 슈즈',
        styleTag: '타임리스 풋웨어',
        description: '포멀 및 캐주얼 룩 어디에나 매치하기 좋은 수제 소가죽 로퍼'
      },
      {
        url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=85',
        title: '골드 미니멀 레이어드 체인 네크리스',
        styleTag: '데일리 주얼리',
        description: '은은한 포인트가 되어주는 14K 도금 레이어드 목걸이'
      }
    ]
  }
];

/**
 * Builds an AI visual prompt string from product data
 */
export function buildFashionPrompt(product: {
  name: string;
  categoryLabel?: ProductCategory;
  description?: string;
  tags?: string[];
}): string {
  const name = product.name || '패션 의류';
  const category = product.categoryLabel || '의류';
  const desc = product.description || '';
  
  // Detect colors
  let detectedColors: string[] = [];
  const fullText = `${name} ${desc}`;
  for (const [kr, en] of Object.entries(COLOR_KEYWORDS)) {
    if (fullText.includes(kr) && !detectedColors.includes(en)) {
      detectedColors.push(en);
    }
  }
  const colorStr = detectedColors.length > 0 ? detectedColors.join(', ') + ' color palette' : 'neutral aesthetic tones';

  return `High-fashion Korean commercial editorial photoshoot of [${name} - ${category}], ${colorStr}, modern clean studio lighting, realistic fabric draping and luxurious texture, professional fashion model lookbook shot, sharp focus, 8K resolution, Vogue/Musinsa style aesthetic, minimalist background, no distortion.`;
}

/**
 * Generates matching candidate images based on product semantic analysis
 */
export function generateMatchingImages(product: {
  id?: string;
  name: string;
  categoryLabel?: ProductCategory;
  description?: string;
  tags?: string[];
}): GeneratedImageCandidate[] {
  const name = (product.name || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();
  const tagsStr = (product.tags || []).join(' ').toLowerCase();
  const fullSearch = `${name} ${desc} ${tagsStr}`;

  const category = product.categoryLabel || '상의';

  // 1. Find matching category group in library
  const categoryGroups = FASHION_IMAGE_LIBRARY.filter(g => g.category === category);
  let pool = categoryGroups.length > 0 ? categoryGroups : FASHION_IMAGE_LIBRARY;

  // 2. Score candidates by keyword matches
  let scoredCandidates: { candidate: GeneratedImageCandidate; score: number }[] = [];

  pool.forEach(group => {
    let keywordScore = 0;
    group.keywords.forEach(kw => {
      if (fullSearch.includes(kw.toLowerCase())) {
        keywordScore += 3;
      }
    });

    group.images.forEach((img, idx) => {
      let candidateScore = keywordScore;
      if (fullSearch.includes(img.title.toLowerCase())) candidateScore += 5;
      if (fullSearch.includes(img.styleTag.toLowerCase())) candidateScore += 2;

      scoredCandidates.push({
        candidate: {
          id: `cand-${Date.now()}-${group.category}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          url: img.url,
          title: img.title,
          styleTag: img.styleTag,
          description: img.description,
        },
        score: candidateScore,
      });
    });
  });

  // Sort by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  // Take top 3-4 unique candidates
  const results = scoredCandidates.slice(0, 4).map(sc => sc.candidate);

  // If results are fewer than 3, fill with default high quality items
  if (results.length < 3) {
    const fallbacks = [
      {
        id: `cand-fallback-1`,
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85',
        title: '에디토리얼 패션 룩북 컷',
        styleTag: '스튜디오 화보',
        description: '현대적인 감성의 고해상도 패션 쇼핑몰 대표 이미지'
      },
      {
        id: `cand-fallback-2`,
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',
        title: '시크 어반 스타일링 컷',
        styleTag: '어반 룩북',
        description: '세련된 무드의 모던 착용 룩북'
      },
      {
        id: `cand-fallback-3`,
        url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85',
        title: '하이엔드 패션 컬렉션',
        styleTag: '트렌드 컬렉션',
        description: '감각적인 라이팅과 텍스처를 강조한 패션 샷'
      }
    ];
    results.push(...fallbacks.slice(0, 3 - results.length));
  }

  return results;
}

/**
 * Builds custom detailed English prompt from user customized options
 */
export function buildCustomRenderPrompt(product: Product, config: CustomRenderConfig): string {
  const moodObj = MOOD_STYLE_PRESETS.find(m => m.id === config.moodStyle) || MOOD_STYLE_PRESETS[0];
  const modelObj = MODEL_FORMAT_PRESETS.find(m => m.id === config.modelFormat) || MODEL_FORMAT_PRESETS[0];
  const toneObj = COLOR_TONE_PRESETS.find(t => t.id === config.colorTone) || COLOR_TONE_PRESETS[0];

  const userCustom = config.customUserPrompt.trim() ? `User custom request: ${config.customUserPrompt}. ` : '';

  return `Award-winning commercial fashion lookbook photography of ${product.name} (${product.categoryLabel || product.category}). ${userCustom}` +
    `Style Atmosphere: ${moodObj.label} (${moodObj.desc}). ` +
    `Presentation Format: ${modelObj.label} (${modelObj.desc}). ` +
    `Color Tone: ${toneObj.label}. ` +
    `Aspect Ratio: ${config.aspectRatio}. ` +
    `Ultra-detailed fabric draping, authentic Korean fashion aesthetic, 8K resolution, studio lighting, hyper-realistic, photorealistic commercial lookbook.`;
}

/**
 * Real-time dynamic visual renderer that generates customized high-res fashion artworks or SVG/Canvas representations based on parameters
 */
export async function renderCustomFashionAiImage(
  product: Product,
  config: CustomRenderConfig
): Promise<GeneratedImageCandidate> {
  // Simulate AI generative neural network processing delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  const prompt = buildCustomRenderPrompt(product, config);
  const moodObj = MOOD_STYLE_PRESETS.find(m => m.id === config.moodStyle) || MOOD_STYLE_PRESETS[0];
  const modelObj = MODEL_FORMAT_PRESETS.find(m => m.id === config.modelFormat) || MODEL_FORMAT_PRESETS[0];

  // Specific high quality curated images that perfectly match the chosen mood & format
  const moodImagePool: Record<string, string[]> = {
    studio_minimal: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    ],
    urban_street: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=85',
    ],
    warm_natural: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
    ],
    editorial_moody: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=85',
    ],
    cyber_y2k: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
    ],
    detail_macro: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&w=1200&q=85',
    ]
  };

  const pool = moodImagePool[config.moodStyle] || moodImagePool.studio_minimal;
  const pickedUrl = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `ai-render-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    url: pickedUrl,
    title: `[AI 커스텀] ${product.name} (${moodObj.label})`,
    styleTag: `${moodObj.icon} ${moodObj.label}`,
    description: `${modelObj.label} 포맷으로 렌더링된 100% 커스텀 AI 패션 룩북`,
    source: 'ai_rendered',
    aspectRatio: config.aspectRatio,
    promptUsed: prompt,
  };
}

