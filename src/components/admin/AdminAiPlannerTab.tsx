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
  Flame
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types';

interface AdminAiPlannerTabProps {
  onAddBatchProducts: (newProducts: Product[]) => void;
  onSuccess: (message: string) => void;
}

interface AiThemePreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  icon: string;
  description: string;
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

const AI_THEME_PRESETS: AiThemePreset[] = [
  {
    id: 'theme-minimal-french',
    title: '2026 프렌치 미니멀 에센셜 룩',
    subtitle: 'French Chic & Modern Minimalist',
    tag: 'S/S 트렌드 1위',
    icon: '✨',
    description: '절제된 미학과 고급스러운 내추럴 톤온톤 배색을 중심으로 AI가 선별한 데일리 럭셔리 컬렉션입니다.',
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
    title: '어반 스트릿 & Y2K 고프코어 룩',
    subtitle: 'Urban Utility & Retro Streetwear',
    tag: 'Z세대 급상승',
    icon: '⚡',
    description: '기능성 유틸리티 디테일과 레트로한 무드가 결합된 힙한 스트릿 패션 캡슐 컬렉션.',
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

export function AdminAiPlannerTab({
  onAddBatchProducts,
  onSuccess,
}: AdminAiPlannerTabProps) {
  const [selectedTheme, setSelectedTheme] = useState<string>(AI_THEME_PRESETS[0].id);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const currentPreset = AI_THEME_PRESETS.find(t => t.id === selectedTheme) || AI_THEME_PRESETS[0];

  const handleApplyThemeProducts = async () => {
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 600));

    const newBatch: Product[] = currentPreset.products.map((p, idx) => ({
      id: `prod-ai-batch-${Date.now()}-${idx}`,
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
      reviewsCount: 12,
    }));

    onAddBatchProducts(newBatch);
    setIsDeploying(false);
    onSuccess(`AI 테마 [${currentPreset.title}]의 ${newBatch.length}개 상품이 쇼핑몰에 일괄 등록되었습니다!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-neutral-900 to-neutral-900 text-white p-6 rounded-2xl border border-purple-800/40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>AI 스마트 패션 기획 센터</span>
              <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full font-normal">
                Gemini 3.7 Flash Engine
              </span>
            </h2>
            <p className="text-xs text-neutral-300 mt-0.5">
              실시간 패션 트렌드 데이터베이스를 분석하여 시즌별 베스트 룩북을 자동 생성하고 쇼핑몰에 바로 등록합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AI_THEME_PRESETS.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
              selectedTheme === theme.id
                ? 'border-purple-600 ring-2 ring-purple-400/20 shadow-md'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{theme.icon}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                {theme.tag}
              </span>
            </div>
            <h3 className="font-bold text-neutral-900 text-base mt-2">{theme.title}</h3>
            <p className="text-xs text-neutral-500 font-medium">{theme.subtitle}</p>
            <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{theme.description}</p>
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500 font-medium">포함 상품 수: {theme.products.length}개</span>
              <span className="font-bold text-purple-700">선택됨</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Theme Details & Batch Deploy */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>기획된 상품 세트 상세 미리보기 ({currentPreset.products.length}개)</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              아래 상품들이 원클릭으로 쇼핑몰 메인 및 AI 큐레이션 영역에 즉시 등록됩니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleApplyThemeProducts}
            disabled={isDeploying}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>쇼핑몰 등록 중...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-purple-400" />
                <span>쇼핑몰에 이 세트 일괄 등록하기</span>
              </>
            )}
          </button>
        </div>

        {/* Product Cards Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPreset.products.map((p, idx) => (
            <div key={idx} className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 flex flex-col justify-between">
              <div>
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-36 object-cover rounded-lg bg-neutral-200 mb-3"
                />
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-neutral-200 rounded text-neutral-700">
                    {p.categoryLabel}
                  </span>
                  <span className="text-xs font-extrabold text-neutral-900">
                    ₩ {p.price.toLocaleString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{p.name}</h4>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{p.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-200/60 text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded-md">
                💡 <b>AI 코디:</b> {p.aiStylingSuggestion}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
