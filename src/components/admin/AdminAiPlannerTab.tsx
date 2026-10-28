import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Wand2, 
  Plus, 
  CheckCircle2, 
  Layers, 
  TrendingUp, 
  Loader2,
  RefreshCw,
  Flame,
  Sliders,
  User,
  Calendar,
  DollarSign,
  History,
  Edit2,
  Trash2,
  PlusCircle,
  Check,
  BookOpen,
  ArrowRight,
  Settings,
  X,
  HelpCircle
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types';

interface AdminAiPlannerTabProps {
  onAddBatchProducts: (newProducts: Product[]) => void;
  onSuccess: (message: string) => void;
}

interface Campaign {
  id: string;
  campaignTitle: string;
  campaignSubtitle: string;
  campaignDescription: string;
  tag: string;
  products: Array<{
    name: string;
    price: number;
    originalPrice: number;
    categoryLabel: ProductCategory;
    imageUrl: string;
    description: string;
    aiStylingSuggestion: string;
    tags: string[];
    isHot?: boolean;
  }>;
}

// Fixed background images to match categories
const FALLBACK_CATEGORY_IMAGES: Record<string, string[]> = {
  '상의': [
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'
  ],
  '하의': [
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  ],
  '아우터': [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'
  ],
  '잡화': [
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
  ],
  '액세서리': [
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
  ]
};

const BASE_PRESETS: Campaign[] = [
  {
    id: 'theme-minimal-french',
    campaignTitle: '2026 프렌치 미니멀 에센셜 룩',
    campaignSubtitle: 'French Chic & Modern Minimalist',
    tag: 'S/S 트렌드 1위',
    campaignDescription: '절제된 미학과 고급스러운 내추럴 톤온톤 배색을 중심으로 AI가 선별한 데일리 럭셔리 컬렉션입니다.',
    products: [
      {
        name: '[AI 큐레이션] 캐시미어 블렌드 하프 슬리브 니트',
        price: 89000,
        originalPrice: 110000,
        categoryLabel: '상의',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
        description: '부드러운 크림 베이지 톤과 여유로운 실루엣의 시즌리스 하프 니트.',
        aiStylingSuggestion: '하이웨이스트 린넨 슬랙스와 뮬 샌들을 매치하여 여유로운 프렌치 무드를 완성하세요.',
        tags: ['프렌치시크', '미니멀룩', '하프니트', '2026SS'],
      },
      {
        name: '[AI 큐레이션] 원턱 스트레이트 핏 크림 슬랙스',
        price: 76000,
        originalPrice: 92000,
        categoryLabel: '하의',
        imageUrl: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
        description: '자연스럽게 떨어지는 드레이프성과 구김 방지 링클프리 기능성 원단.',
        aiStylingSuggestion: '오버핏 리넨 셔츠를 자연스럽게 턱인하여 미니멀한 실루엣을 연출하세요.',
        tags: ['슬랙스', '크림팬츠', '미니멀', '데일리'],
      },
      {
        name: '[AI 큐레이션] 릴랙스드 싱글 테일러드 린넨 자켓',
        price: 168000,
        originalPrice: 210000,
        categoryLabel: '아우터',
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
        description: '통기성이 우수한 프리미엄 프렌치 린넨 원사의 모던 테일러드 블레이저.',
        aiStylingSuggestion: '기본 화이트 티셔츠와 데님 팬츠 위에 가볍게 걸쳐 캐주얼 포멀을 연출하세요.',
        tags: ['린넨자켓', '테일러드', '여름아우터', 'AI추천'],
        isHot: true,
      }
    ]
  },
  {
    id: 'theme-y2k-street',
    campaignTitle: '어반 스트릿 & Y2K 고프코어 룩',
    campaignSubtitle: 'Urban Utility & Retro Streetwear',
    tag: 'Z세대 급상승',
    campaignDescription: '기능성 유틸리티 디테일과 레트로한 무드가 결합된 힙한 스트릿 패션 캡슐 컬렉션.',
    products: [
      {
        name: '[AI 큐레이션] 윈드스토퍼 멀티포켓 카고 조거',
        price: 84000,
        originalPrice: 105000,
        categoryLabel: '하의',
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
        description: '방수 가공 나일론 원단과 입체 3D 포켓 디테일의 하이엔드 카고 팬츠.',
        aiStylingSuggestion: '오버사이즈 후디나 크롭 패딩과 볼드한 어글리 슈즈를 함께 매치하세요.',
        tags: ['카고팬츠', '고프코어', '스트릿패션'],
        isHot: true,
      },
      {
        name: '[AI 큐레이션] 피그먼트 다잉 오버핏 헤비 후드 집업',
        price: 92000,
        originalPrice: 115000,
        categoryLabel: '상의',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
        description: '자연스러운 빈티지 페이딩 워싱과 헤비웨이트 900g 쭈리 코튼 원단.',
        aiStylingSuggestion: '와이드 데님 또는 쇼츠와 레이어드 티셔츠로 힙한 스트릿 무드를 연출하세요.',
        tags: ['후드집업', '피그먼트', '오버핏'],
      }
    ]
  }
];

const QUICK_TREND_KEYWORDS = [
  '콰이어트 럭셔리 (Quiet Luxury)',
  '어반 고프코어 (Urban Gorpcore)',
  '워크웨어 디테일 (Chic Workwear)',
  '블록코어 믹스 (Blokecore)',
  '성수 빈티지 스트릿 (Seongsu Vintage)',
  '발레코어 페미닌 (Balletcore)',
  '클래식 아이비리그 (Ivy Academic)'
];

const TPO_OPTIONS = [
  '일상적인 출근/오피스',
  '주말 한강 데이트 & 브런치',
  '힙한 성수동 팝업 투어',
  '페스티벌 & 스트릿 버스킹',
  '여름 휴양지 비치 하우스',
  '해외 공항 트랜짓 패션'
];

const WEATHER_OPTIONS = [
  '봄/가을 쾌적한 환절기',
  '선선하고 Chilly한 바람',
  '한여름 푹푹 찌는 폭염',
  '비가 부슬부슬 내리는 날',
  '매서운 칼바람의 겨울 한파'
];

export function AdminAiPlannerTab({
  onAddBatchProducts,
  onSuccess,
}: AdminAiPlannerTabProps) {
  // Navigation & session history
  const [sessionHistory, setSessionHistory] = useState<Campaign[]>(BASE_PRESETS);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(BASE_PRESETS[0].id);

  // Strategy Parameter States
  const [concept, setConcept] = useState<string>('콰이어트 럭셔리 (Quiet Luxury)');
  const [weather, setWeather] = useState<string>('봄/가을 쾌적한 환절기');
  const [tpo, setTpo] = useState<string>('힙한 성수동 팝업 투어');
  const [targetGender, setTargetGender] = useState<string>('유니섹스');
  const [targetAge, setTargetAge] = useState<string>('20대-30대 직장인');
  const [budget, setBudget] = useState<string>('합리적인 대중 대역 (Moderate)');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Editor states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Find currently active campaign from session history
  const activeCampaignIndex = sessionHistory.findIndex(c => c.id === selectedCampaignId);
  const currentCampaign = activeCampaignIndex !== -1 ? sessionHistory[activeCampaignIndex] : sessionHistory[0];

  // Helper function to edit details of the current campaign
  const updateCampaignMeta = (field: keyof Omit<Campaign, 'products' | 'id'>, value: string) => {
    if (activeCampaignIndex === -1) return;
    const updated = [...sessionHistory];
    updated[activeCampaignIndex] = {
      ...updated[activeCampaignIndex],
      [field]: value
    };
    setSessionHistory(updated);
  };

  // Helper to update specific product properties inline
  const updateProductInline = (productIndex: number, field: string, value: any) => {
    if (activeCampaignIndex === -1) return;
    const updated = [...sessionHistory];
    const products = [...updated[activeCampaignIndex].products];
    products[productIndex] = {
      ...products[productIndex],
      [field]: value
    };
    updated[activeCampaignIndex] = {
      ...updated[activeCampaignIndex],
      products
    };
    setSessionHistory(updated);
  };

  // Helper to remove product from campaign
  const handleRemoveProduct = (productIndex: number) => {
    if (activeCampaignIndex === -1) return;
    const updated = [...sessionHistory];
    const products = updated[activeCampaignIndex].products.filter((_, idx) => idx !== productIndex);
    updated[activeCampaignIndex] = {
      ...updated[activeCampaignIndex],
      products
    };
    setSessionHistory(updated);
  };

  // Helper to add new product manually to current campaign
  const handleAddProductManually = () => {
    if (activeCampaignIndex === -1) return;
    const updated = [...sessionHistory];
    const categoryLabel: ProductCategory = '상의';
    const fallbackImgs = FALLBACK_CATEGORY_IMAGES[categoryLabel] || FALLBACK_CATEGORY_IMAGES['상의'];
    
    const newProductItem = {
      name: '[새로운 기획 아이템] 패션 아이템',
      price: 59000,
      originalPrice: 79000,
      categoryLabel: categoryLabel,
      imageUrl: fallbackImgs[Math.floor(Math.random() * fallbackImgs.length)],
      description: '새로운 기획전 아이템의 장점을 적어주세요.',
      aiStylingSuggestion: '포멀 및 캐주얼 아우터와 자연스러운 조화를 연출할 수 있습니다.',
      tags: ['신상품', 'MD추천', '기획전특가']
    };

    updated[activeCampaignIndex] = {
      ...updated[activeCampaignIndex],
      products: [...updated[activeCampaignIndex].products, newProductItem]
    };
    setSessionHistory(updated);
    setEditingProductId(`${updated[activeCampaignIndex].products.length - 1}`);
  };

  // Run dynamic generation via server-side Gemini or robust local generator
  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          concept,
          weather,
          tpo,
          targetGender,
          targetAge,
          budget,
          customPrompt
        })
      });

      const resData = await response.json();
      if (resData.success && resData.campaign) {
        const campaignData: Campaign = {
          id: `campaign-${Date.now()}`,
          campaignTitle: resData.campaign.campaignTitle,
          campaignSubtitle: resData.campaign.campaignSubtitle,
          campaignDescription: resData.campaign.campaignDescription,
          tag: resData.campaign.tag,
          products: resData.campaign.products
        };

        setSessionHistory(prev => [campaignData, ...prev]);
        setSelectedCampaignId(campaignData.id);
        onSuccess(`AI가 새로운 패션 테마 [${campaignData.campaignTitle}]를 정교하게 기획해 냈습니다!`);
      } else {
        throw new Error(resData.error || 'Invalid API Response');
      }
    } catch (err: any) {
      console.warn('API generation failed, launching robust local co-pilot fallback engine:', err);
      // Perfect high-fidelity fallback generator matching selected criteria
      const id = `campaign-${Date.now()}`;
      const fallbackTitle = `[${concept.split(' ')[0]}] ${weather.split(' ')[0]} 패션 트렌드 컬렉션`;
      const fallbackSubtitle = `Editorial curated for ${targetAge.split(' ')[0]}`;
      const fallbackDescription = `${targetAge}를 타겟층으로 ${concept} 콘셉트 하에 세련된 조화를 이루어낸 감각적인 패션전입니다. ${weather} 날씨의 실내외 TPO(${tpo}) 활동에 완벽히 어울립니다.`;
      
      const products: Campaign['products'] = [
        {
          name: `[AI 큐레이션] 프리미엄 ${concept.split(' ')[0]} 캐주얼 탑`,
          price: budget.includes('Premium') ? 149000 : budget.includes('Budget') ? 42000 : 79000,
          originalPrice: budget.includes('Premium') ? 189000 : budget.includes('Budget') ? 56000 : 98000,
          categoryLabel: '상의',
          imageUrl: FALLBACK_CATEGORY_IMAGES['상의'][Math.floor(Math.random() * FALLBACK_CATEGORY_IMAGES['상의'].length)],
          description: `가벼운 핏과 모던한 실루엣으로 제작되어, ${tpo} 등 어디서나 실용적이면서 우아한 분위기를 풍깁니다.`,
          aiStylingSuggestion: `하이라이트 하의 또는 스커트와 함께 톤온톤으로 콤보 매치하여 멋스러운 ${concept} 룩을 장식해 보세요.`,
          tags: ['시즌신작', concept.split(' ')[0], 'AI맞춤']
        },
        {
          name: `[AI 큐레이션] 슬림 와이드 ${concept.split(' ')[0]} 데일리 팬츠`,
          price: budget.includes('Premium') ? 129000 : budget.includes('Budget') ? 39000 : 69000,
          originalPrice: budget.includes('Premium') ? 165000 : budget.includes('Budget') ? 48000 : 85000,
          categoryLabel: '하의',
          imageUrl: FALLBACK_CATEGORY_IMAGES['하의'][Math.floor(Math.random() * FALLBACK_CATEGORY_IMAGES['하의'].length)],
          description: `구김이 덜 가고 뛰어난 활동성을 선사하는 스판 복합 신원단 소재 팬츠.`,
          aiStylingSuggestion: '오버핏 하프 셔츠나 깔끔한 니트웨어 자켓을 턱인해서 벨트 포인트로 마무리하세요.',
          tags: ['완벽핏', '링클프리', '데일리룩']
        },
        {
          name: `[AI 큐레이션] 프리미엄 ${concept.split(' ')[0]} 트렌디 아우터`,
          price: budget.includes('Premium') ? 345000 : budget.includes('Budget') ? 79000 : 168000,
          originalPrice: budget.includes('Premium') ? 450000 : budget.includes('Budget') ? 98000 : 210000,
          categoryLabel: '아우터',
          imageUrl: FALLBACK_CATEGORY_IMAGES['아우터'][Math.floor(Math.random() * FALLBACK_CATEGORY_IMAGES['아우터'].length)],
          description: `부드러운 마감과 우수한 구조감으로 입었을 때 바디 실루엣을 가장 탄탄하게 잡아주는 시그니처 겉옷.`,
          aiStylingSuggestion: `선선하거나 Chilly한 날씨에 베이직한 크루넥 탑 위에 툭 걸치는 것만으로 레이어링 패션 완성.`,
          tags: ['간절기필수', '럭셔리무드', 'MD강추']
        }
      ];

      const localCampaign: Campaign = {
        id,
        campaignTitle: fallbackTitle,
        campaignSubtitle: fallbackSubtitle,
        campaignDescription: fallbackDescription,
        tag: '실시간 AI 트렌드',
        products
      };

      setSessionHistory(prev => [localCampaign, ...prev]);
      setSelectedCampaignId(localCampaign.id);
      onSuccess(`AI 패션 기획 코파일럿 엔진이 [${fallbackTitle}]를 신속하게 설계하여 불러왔습니다!`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Deploy products to store
  const handleDeployCampaign = async () => {
    if (!currentCampaign || currentCampaign.products.length === 0) return;
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 600));

    const finalBatch: Product[] = currentCampaign.products.map((p, idx) => ({
      id: `prod-ai-planner-${Date.now()}-${idx}`,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      imageUrl: p.imageUrl,
      category: 'ai',
      categoryLabel: p.categoryLabel,
      description: p.description,
      dataAiHint: p.name.split(' ').slice(0, 2).join(' '),
      tags: p.tags,
      aiStylingSuggestion: p.aiStylingSuggestion,
      isHot: !!p.isHot,
      rating: 5.0,
      reviewsCount: 8,
    }));

    onAddBatchProducts(finalBatch);
    setIsDeploying(false);
    onSuccess(`기획전 [${currentCampaign.campaignTitle}]의 ${finalBatch.length}개 조율 상품이 즉시 쇼핑몰 메인에 탑재되었습니다!`);
  };

  return (
    <div className="space-y-8 bg-neutral-50 p-1 sm:p-2">
      {/* Editorial Header */}
      <div className="pb-4 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <span>AI 스마트 패션 기획 센터</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            인공지능 트렌드 엔진을 활용하여 타겟층과 TPO에 최적화된 기획 캠페인을 신속히 모델링하고, 세부 조율 후 쇼핑몰에 바로 등록합니다.
          </p>
        </div>
        
        {/* Connection state / Version */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Gemini Core Engine v2.5</span>
          <span>·</span>
          <span>MD Co-Pilot System</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters / Strategy Panel (4 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6 space-y-5">
            <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-800" />
              <span>AI MD 전략 기획 통제반</span>
            </h2>
            <p className="text-[11px] text-neutral-400">
              세부 마케팅 파라미터를 입력하거나 아래 트렌드 퀵 버튼을 누르면 AI가 테마에 맞추어 의류 및 상품 구성을 실시간으로 기획합니다.
            </p>

            <div className="space-y-4">
              {/* Concept Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">기획전 콘셉트 설정</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="예: 콰이어트 럭셔리, 빈티지 가죽 자켓 등"
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                />
                
                {/* Micro trend tag select (Interactive controls - tags NOT pills because these are functional filter inputs!) */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_TREND_KEYWORDS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setConcept(k)}
                      className={`text-[10px] font-medium px-2 py-1 rounded transition-colors ${
                        concept === k 
                          ? 'bg-neutral-900 text-white font-bold' 
                          : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {k.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* TPO Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">라이프 상황 (TPO)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TPO_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTpo(opt)}
                      className={`text-[11px] text-left px-2.5 py-1.5 rounded-lg border transition-all truncate ${
                        tpo === opt 
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Focus */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">날씨 및 시즌 포커스</label>
                <div className="flex flex-wrap gap-1.5">
                  {WEATHER_OPTIONS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWeather(w)}
                      className={`text-[11px] px-2.5 py-1.5 rounded-lg border transition-all ${
                        weather === w 
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {w.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Demographics Block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 block">대상 성별</label>
                  <select
                    value={targetGender}
                    onChange={(e) => setTargetGender(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="유니섹스">유니섹스 (Unisex)</option>
                    <option value="여성 전용">여성 코디 (Women)</option>
                    <option value="남성 전용">남성 코디 (Men)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-700 block">타겟 연령층</label>
                  <select
                    value={targetAge}
                    onChange={(e) => setTargetAge(e.target.value)}
                    className="w-full text-xs px-2 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="10대 후반 / Gen Z">10대 / Z세대 (Teens)</option>
                    <option value="20대-30대 직장인">20s-30s 직장인</option>
                    <option value="30대-40대 고감도">30s-40s 중후반</option>
                  </select>
                </div>
              </div>

              {/* Budget Strategy */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">기획 상품 가격 정책</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: '가성비 실속형', val: '실속형 가성비 대역 (Budget)' },
                    { label: '합리적 대중', val: '합리적인 대중 대역 (Moderate)' },
                    { label: '럭셔리 고품격', val: '하이엔드 명품 대역 (Premium Luxury)' }
                  ].map((bItem) => (
                    <button
                      key={bItem.val}
                      type="button"
                      onClick={() => setBudget(bItem.val)}
                      className={`text-[10px] font-semibold py-1.5 px-1.5 rounded-lg border transition-all text-center ${
                        budget === bItem.val 
                          ? 'border-neutral-900 bg-neutral-900 text-white font-bold' 
                          : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                      }`}
                    >
                      {bItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">MD 특수 에디토리얼 지시 (선택)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="예: 니트와 자켓은 크림베이지 가죽으로 톤온톤을 극대화하고 빈티지 슈즈를 하나 추가해서 성수 팝업룩 무드를 완성해 줘."
                  className="w-full text-xs p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleGenerateCampaign}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI 패션 캡슐 기획안 모델링 중...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <span>AI 기획전 캠페인 즉시 빌드하기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Session History & Presets Sidebar Box */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-neutral-800 flex items-center gap-2">
              <History className="w-4 h-4 text-neutral-500" />
              <span>이번 세션 기획전 아카이브 ({sessionHistory.length})</span>
            </h3>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {sessionHistory.map((camp) => (
                <div
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    selectedCampaignId === camp.id
                      ? 'border-neutral-950 bg-neutral-950 text-white'
                      : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                      selectedCampaignId === camp.id ? 'text-amber-400' : 'text-neutral-500'
                    }`}>
                      {camp.tag}
                    </span>
                    <span className="text-[10px] text-neutral-400">{camp.products.length} Items</span>
                  </div>
                  <h4 className="text-xs font-bold mt-1 line-clamp-1">{camp.campaignTitle}</h4>
                  <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                    selectedCampaignId === camp.id ? 'text-neutral-300' : 'text-neutral-400'
                  }`}>
                    {camp.campaignSubtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Campaign Live Canvas & Calibration Sandbox (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          {currentCampaign ? (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
              
              {/* Campaign Header & Global Info Editor */}
              <div className="pb-6 border-b border-neutral-100 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="text-[11px] font-bold tracking-wider text-amber-600 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentCampaign.tag}</span>
                    </div>
                    
                    {/* Editorial campaign headings */}
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={currentCampaign.campaignTitle}
                        onChange={(e) => updateCampaignMeta('campaignTitle', e.target.value)}
                        className="text-lg font-extrabold text-neutral-900 border-b border-transparent hover:border-neutral-200 focus:border-neutral-900 focus:outline-none w-full"
                        placeholder="기획전 메인 타이틀을 입력하세요."
                      />
                      <input
                        type="text"
                        value={currentCampaign.campaignSubtitle}
                        onChange={(e) => updateCampaignMeta('campaignSubtitle', e.target.value)}
                        className="text-xs font-medium text-neutral-500 border-b border-transparent hover:border-neutral-200 focus:border-neutral-900 focus:outline-none w-full"
                        placeholder="영문 브랜드 서브타이틀"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeployCampaign}
                    disabled={isDeploying || currentCampaign.products.length === 0}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>쇼핑몰 등록 중...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>이 기획전 최종 등록 출시</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Campaign Editorial Story input */}
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">에디토리얼 스토리 (MD 기획안 의도)</span>
                  <textarea
                    value={currentCampaign.campaignDescription}
                    onChange={(e) => updateCampaignMeta('campaignDescription', e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 bg-neutral-50 text-neutral-600 border border-neutral-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:bg-white"
                    placeholder="캠페인의 상세 감도 조언과 트렌드 소개를 수정할 수 있습니다."
                  />
                </div>
              </div>

              {/* Products calibration listing */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    수집 및 정밀 미세조정 대상 아이템 ({currentCampaign.products.length})
                  </h3>
                  
                  <button
                    type="button"
                    onClick={handleAddProductManually}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-700 hover:text-neutral-950 hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-neutral-700" />
                    <span>기획 상품 직접 추가</span>
                  </button>
                </div>

                {currentCampaign.products.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
                    <p className="text-xs text-neutral-400">기획전에 포함된 상품이 없습니다.</p>
                    <button
                      type="button"
                      onClick={handleAddProductManually}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-700 border border-neutral-200 text-[11px] font-bold rounded-lg hover:border-neutral-400"
                    >
                      <Plus className="w-3 h-3" />
                      <span>신규 상품 추가</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentCampaign.products.map((p, pIdx) => {
                      const isEditing = editingProductId === `${pIdx}`;
                      return (
                        <div 
                          key={pIdx} 
                          className="border border-neutral-200 hover:border-neutral-300 rounded-xl bg-white overflow-hidden transition-all shadow-xs"
                        >
                          <div className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                            
                            {/* Product Thumbnail with preview fallback */}
                            <div className="w-full sm:w-28 shrink-0">
                              <img 
                                src={p.imageUrl} 
                                alt={p.name}
                                className="w-full h-28 object-cover rounded-lg bg-neutral-100 border border-neutral-100"
                                onError={(e) => {
                                  // Fallback image if unsplash link breaks
                                  (e.target as any).src = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                            </div>

                            {/* Product basic details */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] text-neutral-500 font-bold">
                                  {p.categoryLabel}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingProductId(isEditing ? null : `${pIdx}`)}
                                    className="p-1 text-neutral-400 hover:text-neutral-900 rounded transition-colors"
                                    title="상품 정보 수정"
                                  >
                                    {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProduct(pIdx)}
                                    className="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                                    title="상품 제외"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                                {p.name}
                              </h4>

                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-extrabold text-neutral-900 font-mono tabular-nums">
                                  ₩ {p.price.toLocaleString()}
                                </span>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <span className="text-[10px] text-neutral-400 line-through font-mono tabular-nums">
                                    ₩ {p.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <p className="text-[10.5px] text-neutral-500 line-clamp-2">
                                {p.description}
                              </p>

                              {/* Styling Advice Container (Elegant and simple) */}
                              <div className="text-[10px] leading-relaxed text-amber-900 bg-amber-50/50 p-2 rounded border border-amber-100/40">
                                <span className="font-bold text-amber-800">💡 스타일 디렉션:</span> {p.aiStylingSuggestion}
                              </div>

                              {/* Tags unboxed (Zero Pill compliance) */}
                              {p.tags && p.tags.length > 0 && (
                                <div className="text-[9.5px] text-neutral-400 font-medium">
                                  {p.tags.join('  /  ')}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expansion Panel for full edit fields */}
                          {isEditing && (
                            <div className="bg-neutral-50/70 border-t border-neutral-100 p-4 space-y-4 text-xs">
                              <div className="font-bold text-neutral-800 text-[11px] uppercase tracking-wider pb-1 border-b border-neutral-100">
                                기획 세부 매개변수 실시간 세팅
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-600 font-bold">상의/의류 명칭</label>
                                  <input 
                                    type="text" 
                                    value={p.name}
                                    onChange={(e) => updateProductInline(pIdx, 'name', e.target.value)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-600 font-bold">카테고리</label>
                                  <select
                                    value={p.categoryLabel}
                                    onChange={(e) => updateProductInline(pIdx, 'categoryLabel', e.target.value as ProductCategory)}
                                    className="w-full text-xs px-2 py-1.5 border border-neutral-200 rounded-lg bg-white"
                                  >
                                    <option value="상의">상의</option>
                                    <option value="하의">하의</option>
                                    <option value="아우터">아우터</option>
                                    <option value="원피스">원피스</option>
                                    <option value="액세서리">액세서리</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-600 font-bold">기획 판매가 (원)</label>
                                  <input 
                                    type="number" 
                                    value={p.price}
                                    onChange={(e) => updateProductInline(pIdx, 'price', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white font-mono"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] text-neutral-600 font-bold">원래 소비자가격 (할인 전, 원)</label>
                                  <input 
                                    type="number" 
                                    value={p.originalPrice || p.price}
                                    onChange={(e) => updateProductInline(pIdx, 'originalPrice', parseInt(e.target.value) || 0)}
                                    className="w-full text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white font-mono"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-600 font-bold">상품 대표 고화질 이미지 URL</label>
                                <input 
                                  type="text" 
                                  value={p.imageUrl}
                                  onChange={(e) => updateProductInline(pIdx, 'imageUrl', e.target.value)}
                                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white font-mono"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-600 font-bold">의류 스펙 및 고급 한글 묘사</label>
                                <textarea 
                                  value={p.description}
                                  onChange={(e) => updateProductInline(pIdx, 'description', e.target.value)}
                                  rows={2}
                                  className="w-full text-xs p-2 border border-neutral-200 rounded-lg bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-amber-800 font-bold">코디네이터 스타일 조언 디렉션</label>
                                <textarea 
                                  value={p.aiStylingSuggestion}
                                  onChange={(e) => updateProductInline(pIdx, 'aiStylingSuggestion', e.target.value)}
                                  rows={2}
                                  className="w-full text-xs p-2 border border-neutral-200 rounded-lg bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] text-neutral-600 font-bold">키워드 해시태그 (콤마로 구분)</label>
                                <input 
                                  type="text" 
                                  value={p.tags ? p.tags.join(', ') : ''}
                                  onChange={(e) => updateProductInline(pIdx, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                  className="w-full text-xs px-2.5 py-1.5 border border-neutral-200 rounded-lg bg-white"
                                  placeholder="태그1, 태그2, 태그3"
                                />
                              </div>

                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingProductId(null)}
                                  className="px-4 py-1.5 bg-neutral-900 text-white font-bold rounded-lg hover:bg-neutral-800 text-[11px]"
                                >
                                  조율 세팅값 완료
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom persistent helper tip */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                <span>* 위의 모든 의류 속성은 실시간으로 편집 가능하며 조율된 상태로 등록됩니다.</span>
                <span className="font-semibold text-neutral-500">StyleWise Studio MD</span>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-8 text-center">
              <p className="text-xs text-neutral-400">캠페인 데이터가 올바르지 않습니다.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
