import type { Product, ProductCategory } from '../types';

export interface MoodConcept {
  id: string;
  name: string;
  badge: string;
  description: string;
  colorTheme: string;
}

export const MOOD_CONCEPTS: MoodConcept[] = [
  {
    id: 'minimal-chic',
    name: '2026 S/S 프렌치 미니멀 & 어반 시크',
    badge: '모던 & 럭셔리',
    description: '절제된 실루엣과 차분한 뉴트럴 톤의 프리미엄 여성 데일리 룩',
    colorTheme: 'from-amber-600 to-stone-700',
  },
  {
    id: 'resort-vacance',
    name: '써머 바캉스 & 리조트 웨이브',
    badge: '휴양지 & 페미닌',
    description: '시원한 리넨/실크 소재와 청량한 무드의 썸머 컬렉션',
    colorTheme: 'from-sky-600 to-emerald-700',
  },
  {
    id: 'y2k-street',
    name: 'Y2K 레트로 & 유틸리티 스트릿',
    badge: '트렌드 & 힙스터',
    description: '입체적인 포켓과 빈티지 워싱의 트렌디 고프코어 룩',
    colorTheme: 'from-purple-600 to-pink-700',
  },
  {
    id: 'lovely-daily',
    name: '러블리 데이트 & 로맨틱 클래식',
    badge: '사랑스러운 데이트룩',
    description: '우아한 드레이프와 화사한 파스텔 톤의 로맨틱 패션',
    colorTheme: 'from-rose-500 to-amber-600',
  }
];

// Curated high quality fashion lookbook images per category
const CATEGORY_IMAGE_POOL: Partial<Record<ProductCategory, string[]>> = {
  '상의': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', // knit
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', // silk blouse
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', // hoodie
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80', // graphic tee
    'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=800&q=80', // summer top
  ],
  '하의': [
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80', // slacks
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', // cargo
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80', // jeans
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80', // skirt
    'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80', // wide pants
  ],
  '아우터': [
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', // trench
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', // linen jacket
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', // denim jacket
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', // leather
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80', // wool coat
  ],
  '원피스': [
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', // floral
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80', // summer dress
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80', // knit dress
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80', // romantic
    'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?auto=format&fit=crop&w=800&q=80', // shirt dress
  ],
  '액세서리': [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  ]
};

// 10 Fashion Items Generator across 4 core female categories (3 Tops, 3 Bottoms, 2 Outer, 2 Dress)
export function generateTenFemaleProducts(moodId: string): Product[] {
  const timestamp = Date.now();

  const templatesByMood: Record<string, Array<{
    cat: ProductCategory;
    name: string;
    price: number;
    originalPrice: number;
    desc: string;
    styling: string;
    tags: string[];
    isHot?: boolean;
  }>> = {
    'minimal-chic': [
      {
        cat: '상의',
        name: '[AI 미니멀] 캐시미어 블렌드 하프 슬리브 니트',
        price: 89000,
        originalPrice: 115000,
        desc: '최고급 호주산 파인 메리노울과 캐시미어를 혼방하여 구름처럼 가볍고 부드러운 하프 슬리브 니트웨어입니다.',
        styling: '스트레이트 크림 슬랙스에 가볍게 턱인하여 지적인 오피스 & 데일리 무드를 연출하세요.',
        tags: ['캐시미어', '하프니트', '미니멀룩', '오피스에센셜'],
        isHot: true
      },
      {
        cat: '상의',
        name: '[AI 미니멀] 프렌치 릴랙스드 실크 터치 셔츠',
        price: 78000,
        originalPrice: 98000,
        desc: '은은한 광택과 흐르는 듯한 드레이프성이 돋보이는 모던 카라 블라우스 셔츠.',
        styling: '슬랙스나 H라인 스커트와 함께 매치하여 단정하면서도 세련된 실루엣을 완성하세요.',
        tags: ['실크셔츠', '프렌치시크', '드레이프'],
      },
      {
        cat: '상의',
        name: '[AI 미니멀] 파인 보트넥 텐셀 슬림핏 탑',
        price: 46000,
        originalPrice: 58000,
        desc: '쇄골 라인을 슬림하고 우아하게 돋보이게 해주는 텐셀 보트넥 롱슬리브.',
        styling: '와이드 데님이나 자켓 이너웨어로 제격인 시즌리스 머스트해브 아이템입니다.',
        tags: ['보트넥', '텐셀탑', '이너웨어'],
      },
      {
        cat: '하의',
        name: '[AI 미니멀] 더블 핀턱 와이드 스트레이트 슬랙스',
        price: 86000,
        originalPrice: 108000,
        desc: '허리 라인은 안정감 있게 감싸주고 레그 라인은 길어 보이는 완벽한 비율의 핀턱 팬츠.',
        styling: '슬림한 니트나 크롭 자켓과 함께 매치하여 매니시하면서도 페미닌한 룩을 완성하세요.',
        tags: ['핀턱슬랙스', '와이드팬츠', '체형커버'],
        isHot: true
      },
      {
        cat: '하의',
        name: '[AI 미니멀] 링클프리 프리미엄 크림 베이지 슬랙스',
        price: 79000,
        originalPrice: 95000,
        desc: '하루 종일 구김 없이 쾌적한 핏을 유지해주는 고밀도 기능성 프리미엄 원단.',
        styling: '뉴트럴 톤의 로퍼 및 레더 벨트와 레이어드하여 고급스러운 톤온톤 룩을 완성하세요.',
        tags: ['크림슬랙스', '링클프리', '출근룩'],
      },
      {
        cat: '하의',
        name: '[AI 미니멀] 로우 슬릿 미니멀 H라인 롱스커트',
        price: 74000,
        originalPrice: 89000,
        desc: '뒷트임 슬릿 디테일로 활동성이 우수하며 걸을 때마다 매력적인 실루엣을 선사합니다.',
        styling: '오버핏 자켓과 플랫 슈즈를 믹스매치하여 절제된 프렌치 감성을 표현하세요.',
        tags: ['H라인스커트', '롱스커트', '모던클래식'],
      },
      {
        cat: '아우터',
        name: '[AI 미니멀] 싱글 브레스티드 테일러드 린넨 울 블레이저',
        price: 178000,
        originalPrice: 230000,
        desc: '입체 테일러링 기법으로 어깨 라인을 각 잡히게 살려주며 어떤 체형에도 멋스럽게 어우러집니다.',
        styling: '세트 슬랙스와 수트로 입거나, 캐주얼 데님 팬츠 위에 툭 걸쳐도 멋스럽습니다.',
        tags: ['테일러드자켓', '블레이저', 'AI추천'],
        isHot: true
      },
      {
        cat: '아우터',
        name: '[AI 미니멀] 클래식 더블 카라 프리미엄 트렌치 코트',
        price: 215000,
        originalPrice: 279000,
        desc: '발수 가공된 고밀도 개버딘 코튼 원단으로 유행을 타지 않는 타임리스 시그니처 코트.',
        styling: '허리 스트랩을 질끈 묶어 드레시하게 연출하거나 자연스럽게 오픈하여 착용하세요.',
        tags: ['트렌치코트', '간절기아우터', '시그니처'],
      },
      {
        cat: '원피스',
        name: '[AI 미니멀] 모던 셔츠 카라 벨티드 플리츠 롱원피스',
        price: 138000,
        originalPrice: 175000,
        desc: '셔츠 칼라의 단정함과 스커트 플리츠의 우아함이 어우러져 격식 있는 자리에서도 빛나는 룩.',
        styling: '슬림 레더 벨트로 허리를 강조하고 펌프스 힐과 함께 연출하면 완성도 높은 포멀룩이 됩니다.',
        tags: ['셔츠원피스', '벨티드원피스', '하객룩'],
        isHot: true
      },
      {
        cat: '원피스',
        name: '[AI 미니멀] 스퀘어넥 슬리브리스 슬림핏 니트 드레스',
        price: 112000,
        originalPrice: 145000,
        desc: '바디라인을 부드럽게 감싸는 신축성 있는 골지 니트 텍스처로 군더더기 없는 슬림 실루엣.',
        styling: '단독 착용은 물론 린넨 자켓이나 숏 가디건을 레이어드하기에 최적입니다.',
        tags: ['스퀘어넥', '니트원피스', '슬림핏'],
      }
    ],
    'resort-vacance': [
      {
        cat: '상의',
        name: '[AI 리조트] 내추럴 프렌치 린넨 오픈 카라 셔츠',
        price: 69000,
        originalPrice: 85000,
        desc: '시원한 바람이 통하는 프리미엄 100% 린넨 소재로 휴양지와 도심 어디서나 쾌적합니다.',
        styling: '쇼츠나 린넨 팬츠 위에 버튼을 풀고 이너탑과 함께 레이어드하세요.',
        tags: ['린넨셔츠', '바캉스룩', '휴양지'],
        isHot: true
      },
      {
        cat: '상의',
        name: '[AI 리조트] 크로셰 핸드메이드 무드 니트 슬리브리스',
        price: 49000,
        originalPrice: 62000,
        desc: '섬세한 뜨개 조직감과 보헤미안 감성이 느껴지는 써머 크로셰 탑.',
        styling: '와이드 데님 또는 맥시 스커트와 함께 에스닉한 바캉스 룩을 완성하세요.',
        tags: ['크로셰', '슬리브리스', '썸머탑'],
      },
      {
        cat: '상의',
        name: '[AI 리조트] 드로스트링 셔링 크롭 오프숄더 블라우스',
        price: 54000,
        originalPrice: 68000,
        desc: '어깨 라인을 시원하게 드러내주는 셔링 주름으로 볼륨감 있는 실루엣을 연출합니다.',
        styling: '하이웨이스트 린넨 스커트와 라피아 햇을 매치하면 인생샷 룩 완성.',
        tags: ['오프숄더', '셔링블라우스', '크롭탑'],
      },
      {
        cat: '하의',
        name: '[AI 리조트] 와이드 릴랙스드 린넨 밴딩 이지 팬츠',
        price: 62000,
        originalPrice: 78000,
        desc: '허리 전체 밴딩과 넉넉한 와이드 핏으로 극강의 편안함과 쿨링감을 선사합니다.',
        styling: '슬리퍼, 뮬과 함께 무심한 듯 감각적인 원마일 & 리조트룩을 연출하세요.',
        tags: ['린넨팬츠', '밴딩바지', '쿨링팬츠'],
        isHot: true
      },
      {
        cat: '하의',
        name: '[AI 리조트] 하이웨이스트 플리츠 린넨 버뮤다 쇼츠',
        price: 52000,
        originalPrice: 65000,
        desc: '단정하면서도 트렌디한 무릎 위 기장감의 써머 버뮤다 하프 팬츠.',
        styling: '셔츠와 벨트를 함께 코디하여 클래식한 썸머 시티룩을 완성해보세요.',
        tags: ['버뮤다팬츠', '린넨쇼츠', '반바지'],
      },
      {
        cat: '하의',
        name: '[AI 리조트] 티어드 플리츠 썸머 코튼 맥시 스커트',
        price: 68000,
        originalPrice: 84000,
        desc: '걸을 때마다 풍성하게 살랑이는 캉캉 티어드 실루엣의 롱스커트.',
        styling: '심플한 슬리브리스 탑과 쪼리 샌들만으로도 화사한 분위기를 냅니다.',
        tags: ['티어드스커트', '맥시스커트', '여름치마'],
      },
      {
        cat: '아우터',
        name: '[AI 리조트] 시스루 에어리 썸머 숏 니트 가디건',
        price: 58000,
        originalPrice: 72000,
        desc: '에어컨 바람이나 아침저녁 쌀쌀한 바닷바람을 막아주는 초경량 시스루 가디건.',
        styling: '원피스나 수영복 위에 가볍게 걸쳐 스타일과 체온을 모두 챙기세요.',
        tags: ['여름가디건', '시스루니트', '에어리'],
        isHot: true
      },
      {
        cat: '아우터',
        name: '[AI 리조트] 오버핏 썸머 워싱 데님 반팔 자켓',
        price: 89000,
        originalPrice: 110000,
        desc: '시원한 연청 워싱 컬러감과 빈티지한 버튼 디테일의 하프 슬리브 데님 아우터.',
        styling: '원피스 위에 레이어드하거나 화이트 팬츠와 매치하여 청량감을 극대화하세요.',
        tags: ['데님자켓', '반팔자켓', '연청아우터'],
      },
      {
        cat: '원피스',
        name: '[AI 리조트] 플로럴 보태니컬 백리스 맥시 드레스',
        price: 125000,
        originalPrice: 158000,
        desc: '화사한 휴양지 플라워 패턴과 반전 뒤태 백리스 리본 디테일이 매력적인 드레스.',
        styling: '라피아 토트백과 샌들을 더해 눈부신 바캉스 리조트 룩을 완성하세요.',
        tags: ['플로럴원피스', '맥시드레스', '백리스'],
        isHot: true
      },
      {
        cat: '원피스',
        name: '[AI 리조트] 코튼 아일렛 펀칭 티어드 미니 드레스',
        price: 98000,
        originalPrice: 120000,
        desc: '사랑스러운 펀칭 자수 디테일과 가볍고 쾌적한 100% 순면 소재의 썸머 원피스.',
        styling: '플랫 샌들이나 스니커즈와 매치하여 발랄하고 싱그러운 데일리 무드를 연출하세요.',
        tags: ['펀칭원피스', '미니드레스', '아일렛'],
      }
    ],
    'y2k-street': [
      {
        cat: '상의',
        name: '[AI Y2K] 피그먼트 워싱 헤비웨이트 크롭 후디',
        price: 68000,
        originalPrice: 85000,
        desc: '자연스러운 빈티지 오일 워싱 가공으로 힙하고 트렌디한 스트릿 무드를 자아냅니다.',
        styling: '로우라이즈 카고 팬츠와 매치하여 2000년대 감성의 스트릿 룩을 연출하세요.',
        tags: ['피그먼트', '크롭후드', '스트릿패션'],
        isHot: true
      },
      {
        cat: '상의',
        name: '[AI Y2K] 사이버틱 그래픽 베이비 티셔츠',
        price: 38000,
        originalPrice: 48000,
        desc: '체형에 슬림하게 핏되는 베이비 티 디자인과 레트로 메탈릭 실버 프린트.',
        styling: '와이드 카고 조거와 볼캡을 함께 매치해 젠지 스타일을 뽐내보세요.',
        tags: ['베이비티', '크롭티', 'Y2K'],
      },
      {
        cat: '상의',
        name: '[AI Y2K] 스포티 배색 윈드브레이커 하프 아노락',
        price: 74000,
        originalPrice: 92000,
        desc: '방풍 나일론 소재와 감각적인 배색 라인으로 고프코어 감성을 담아냈습니다.',
        styling: '나일론 파라슈트 팬츠와 함께 스포티 고프코어 셋업을 연출하세요.',
        tags: ['아노락', '윈드브레이커', '고프코어'],
      },
      {
        cat: '하의',
        name: '[AI Y2K] 3D 멀티 유틸리티 포켓 와이드 카고 팬츠',
        price: 89000,
        originalPrice: 112000,
        desc: '입체적인 사이드 카고 포켓과 밑단 스트링으로 조거 또는 와이드 2-Way 연출 가능.',
        styling: '크롭 탑이나 슬림핏 이너와 대비를 주어 스타일리시한 실루엣을 완성하세요.',
        tags: ['카고팬츠', '스트릿', '유틸리티'],
        isHot: true
      },
      {
        cat: '하의',
        name: '[AI Y2K] 빈티지 딥 페이딩 로우라이즈 와이드 데님',
        price: 84000,
        originalPrice: 105000,
        desc: '자연스러운 캣워싱과 롱 기장으로 신발 위로 자연스럽게 곱창지는 핏.',
        styling: '플랫폼 스니커즈와 숏 자켓을 조합해 힙한 스트릿 감성을 연출하세요.',
        tags: ['와이드데님', '로우라이즈', '빈티지청바지'],
      },
      {
        cat: '하의',
        name: '[AI Y2K] 벨티드 플리츠 로우웨이스트 카고 미니스커트',
        price: 58000,
        originalPrice: 72000,
        desc: '포켓 디테일과 볼드한 아일렛 벨트가 세트로 구성된 레트로 미니스커트.',
        styling: '레그워머나 롱부츠와 함께 매치하여 완벽한 Y2K 룩을 표현하세요.',
        tags: ['카고스커트', '미니스커트', '벨트스커트'],
      },
      {
        cat: '아우터',
        name: '[AI Y2K] 오버사이즈 레더 레이싱 모터사이클 자켓',
        price: 198000,
        originalPrice: 250000,
        desc: '고급 에코 레더 원단에 빈티지 배색 패치워크로 하이엔드 스트릿 무드를 구현.',
        styling: '심플한 이너에 이 자켓 하나만 걸쳐도 강력한 존재감을 드러냅니다.',
        tags: ['바이커자켓', '레더자켓', '레이싱자켓'],
        isHot: true
      },
      {
        cat: '아우터',
        name: '[AI Y2K] 글로시 메탈릭 크롭 경량 윈드 패딩',
        price: 145000,
        originalPrice: 180000,
        desc: '은은한 펄감의 메탈릭 나일론과 숏한 기장감으로 트렌디한 실루엣.',
        styling: '와이드 팬츠와 비니 모자를 매치하여 힙스터 무드를 완성하세요.',
        tags: ['크롭패딩', '메탈릭자켓', '숏패딩'],
      },
      {
        cat: '원피스',
        name: '[AI Y2K] 카고 스트링 지퍼 슬림 미니 드레스',
        price: 86000,
        originalPrice: 108000,
        desc: '전면 지퍼와 사이드 포켓으로 스포티하면서도 바디라인을 살려주는 유니크 드레스.',
        styling: '어글리 슈즈나 첼시 부츠와 함께 감각적인 스트릿 믹스매치를 즐겨보세요.',
        tags: ['지퍼원피스', '카고드레스', '스포티룩'],
        isHot: true
      },
      {
        cat: '원피스',
        name: '[AI Y2K] 타이다이 프린트 언발란스 롱 슬릿 드레스',
        price: 94000,
        originalPrice: 118000,
        desc: '신비로운 옴브레 타이다이 패턴과 한쪽 깊은 트임으로 엣지를 더한 롱 드레스.',
        styling: '레더 자켓을 어깨에 걸치고 볼드한 액세서리를 레이어드하세요.',
        tags: ['타이다이', '롱드레스', '슬릿원피스'],
      }
    ],
    'lovely-daily': [
      {
        cat: '상의',
        name: '[AI 러블리] 파스텔 케이블 꽈배기 크롭 가디건',
        price: 64000,
        originalPrice: 79000,
        desc: '사랑스러운 소프트 파스텔 핑크 컬러와 오밀조밀한 하트 케이블 짜임.',
        styling: '플리츠 스커트나 연청 데님과 매치하여 데이트룩의 정석을 보여주세요.',
        tags: ['꽈배기가디건', '파스텔니트', '데이트룩'],
        isHot: true
      },
      {
        cat: '상의',
        name: '[AI 러블리] 빅 세일러 레이스 카라 블라우스',
        price: 58000,
        originalPrice: 72000,
        desc: '얼굴이 작아 보이는 로맨틱 세일러 카라와 자수 레이스 마감.',
        styling: '뷔스티에 원피스나 니트 베스트 안에 이너로 매치하면 사랑스러움 2배.',
        tags: ['세일러블라우스', '레이스', '소녀감성'],
      },
      {
        cat: '상의',
        name: '[AI 러블리] 셔링 핀턱 퍼프 소매 코튼 블라우스',
        price: 52000,
        originalPrice: 65000,
        desc: '어깨 라인을 볼륨감 있게 살려주는 퍼프 소매와 쇄골 라인이 돋보이는 넥라인.',
        styling: '슬림 슬랙스나 미니스커트와 함께 러블리 오피스 룩으로도 제격입니다.',
        tags: ['퍼프블라우스', '셔링탑', '러블리'],
      },
      {
        cat: '하의',
        name: '[AI 러블리] A라인 하이웨이스트 테니스 플리츠 스커트',
        price: 49000,
        originalPrice: 62000,
        desc: '속바지 안감이 내장되어 편안하고 다리가 슬림하고 길어 보이는 정석 A라인.',
        styling: '크롭 니트와 로퍼, 니삭스를 함께 매치해 프레피 데이트 룩을 연출하세요.',
        tags: ['테니스스커트', '플리츠', 'A라인치마'],
        isHot: true
      },
      {
        cat: '하의',
        name: '[AI 러블리] 슬림 부츠컷 사이드 슬릿 연청 데님',
        price: 76000,
        originalPrice: 94000,
        desc: '허벅지는 슬림하게 잡아주고 무릎 아래로 완만하게 퍼지는 여성스러운 부츠컷.',
        styling: '블라우스와 플랫 슈즈를 곁들여 청순하고 페미닌한 룩을 완성하세요.',
        tags: ['부츠컷데님', '연청바지', '체형보정'],
      },
      {
        cat: '하의',
        name: '[AI 러블리] 샤 튤 소재 롱 플레어 스커트',
        price: 68000,
        originalPrice: 85000,
        desc: '구름처럼 풍성한 레이어드 튤망으로 걸을 때마다 로맨틱한 실루엣을 자아냅니다.',
        styling: '맨투맨이나 심플한 니트와 믹스매치하여 러블리 캐주얼을 즐겨보세요.',
        tags: ['샤스커트', '플레어스커트', '롱치마'],
      },
      {
        cat: '아우터',
        name: '[AI 러블리] 골드 버튼 트위드 크롭 자켓',
        price: 158000,
        originalPrice: 198000,
        desc: '고급스러운 글리터 사가 은은하게 반짝이는 클래식 트위드 자켓.',
        styling: '청바지와 매치하면 세련된 캐주얼, 스커트와 매치하면 하객룩으로 손색없습니다.',
        tags: ['트위드자켓', '크롭자켓', '하객룩아우터'],
        isHot: true
      },
      {
        cat: '아우터',
        name: '[AI 러블리] 포근한 앙고라 믹스 루즈핏 가디건 코트',
        price: 135000,
        originalPrice: 168000,
        desc: '부드러운 터치감과 롱한 기장감으로 포근하게 감싸주는 니트 아우터.',
        styling: '원피스 위에 코트 대용으로 포근하게 둘러 연출해보세요.',
        tags: ['롱가디건', '니트코트', '앙고라'],
      },
      {
        cat: '원피스',
        name: '[AI 러블리] 엠파이어 웨이스트 시폰 플라워 롱 드레스',
        price: 128000,
        originalPrice: 160000,
        desc: '살랑이는 쉬폰 소재에 잔잔한 수채화 플라워 프린트가 녹아든 로맨틱 원피스.',
        styling: '가디건이나 트렌치 코트 이너로 매치하면 봄바람 같은 무드가 완성됩니다.',
        tags: ['쉬폰원피스', '플라워원피스', '데이트드레스'],
        isHot: true
      },
      {
        cat: '원피스',
        name: '[AI 러블리] 리본 타이 머메이드 실루엣 원피스',
        price: 118000,
        originalPrice: 148000,
        desc: '넥라인의 리본 타이와 골반을 따라 부드럽게 퍼지는 머메이드 라인의 정석.',
        styling: '데이트, 모임, 특별한 날 우아함을 배가시켜주는 베스트셀러 아이템.',
        tags: ['머메이드원피스', '리본원피스', '격식룩'],
      }
    ]
  };

  const selectedTemplate = templatesByMood[moodId] || templatesByMood['minimal-chic'];

  return selectedTemplate.map((item, index) => {
    // Pick matching high quality image from pool
    const imgList = CATEGORY_IMAGE_POOL[item.cat] || CATEGORY_IMAGE_POOL['상의'];
    const assignedImage = imgList[index % imgList.length];

    return {
      id: `prod-ai-bulk-${timestamp}-${index + 1}`,
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: assignedImage,
      category: 'ai',
      categoryLabel: item.cat,
      description: item.desc,
      dataAiHint: item.name.split(' ').slice(0, 2).join(' '),
      tags: [...item.tags, 'AI대량생성', '2026트렌드'],
      aiStylingSuggestion: item.styling,
      isHot: !!item.isHot,
      rating: 5.0,
      reviewsCount: Math.floor(Math.random() * 30) + 10,
    };
  });
}
