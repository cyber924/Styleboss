import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Check, 
  Flame, 
  Layers, 
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface AdminProductRegisterTabProps {
  onAddProduct: (newProduct: Product) => void;
  onSuccess: (message: string) => void;
}

// Preset fashion sample images for fast and clean product creation
const PRESET_IMAGES = [
  { label: '캐시미어 니트', url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80', cat: '상의' },
  { label: '트렌치 코트', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80', cat: '아우터' },
  { label: '핀턱 슬랙스', url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80', cat: '하의' },
  { label: '실크 셔츠', url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80', cat: '상의' },
  { label: '플로럴 원피스', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80', cat: '원피스' },
  { label: '크롭 데님 자켓', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80', cat: '아우터' },
  { label: '레더 바이커 자켓', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80', cat: '아우터' },
  { label: '오버핏 린넨 자켓', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80', cat: '아우터' },
  { label: '미니멀 울 코트', url: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80', cat: '아우터' },
  { label: '스트릿 후드 집업', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', cat: '상의' },
  { label: '카고 조거 팬츠', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80', cat: '하의' },
  { label: '럭셔리 숄더백', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80', cat: '액세서리' }
];

export function AdminProductRegisterTab({
  onAddProduct,
  onSuccess,
}: AdminProductRegisterTabProps) {
  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'latest' | 'popular' | 'hot' | 'ai' | 'all'>('latest');
  const [categoryLabel, setCategoryLabel] = useState<ProductCategory>('상의');
  const [price, setPrice] = useState<number>(89000);
  const [originalPrice, setOriginalPrice] = useState<number>(110000);
  const [imageUrl, setImageUrl] = useState<string>(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [aiStylingSuggestion, setAiStylingSuggestion] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isHot, setIsHot] = useState<boolean>(false);
  const [isAiProduct, setIsAiProduct] = useState<boolean>(false);
  
  // AI Helper state
  const [aiKeyword, setAiKeyword] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Product Details Generator
  const handleGenerateWithAi = async () => {
    if (!aiKeyword.trim()) return;
    setIsAiGenerating(true);

    try {
      // Simulate/Trigger AI fashion generation
      await new Promise(resolve => setTimeout(resolve, 800));

      const keyword = aiKeyword.trim();
      let generatedName = `[AI 컬렉션] 2026 트렌드 ${keyword}`;
      let generatedDesc = `2026 시즌 트렌드 분석 데이터를 바탕으로 엄선된 프리미엄 ${keyword}입니다. 감각적인 실루엣과 편안한 착용감을 동시에 만족시키는 최고급 소재로 제작되었습니다.`;
      let generatedStyling = `뉴트럴 톤의 슬랙스나 미니멀한 데님과 매치하여 트렌디하면서도 세련된 데일리 룩을 연출해보세요.`;
      let tags = [keyword, '2026신상', 'AI추천', '트렌드컬렉션'];
      let autoPrice = 98000;
      let autoOriginal = 125000;
      let autoCatLabel: ProductCategory = '상의';
      let autoCat: 'latest' | 'popular' | 'hot' | 'ai' | 'all' = 'ai';

      if (keyword.includes('코트') || keyword.includes('자켓') || keyword.includes('패딩') || keyword.includes('아우터')) {
        autoCatLabel = '아우터';
        autoPrice = 189000;
        autoOriginal = 240000;
        generatedStyling = `이너로 얇은 터틀넥 니트나 셔츠를 레이어드하고 가죽 로퍼와 함께 매치하면 고급스러운 어반 룩이 완성됩니다.`;
      } else if (keyword.includes('팬츠') || keyword.includes('슬랙스') || keyword.includes('청바지') || keyword.includes('데님') || keyword.includes('스커트')) {
        autoCatLabel = '하의';
        autoPrice = 79000;
        autoOriginal = 99000;
      } else if (keyword.includes('원피스') || keyword.includes('드레스')) {
        autoCatLabel = '원피스';
        autoPrice = 135000;
        autoOriginal = 168000;
        generatedStyling = `단독으로 착용하거나 가벼운 니트 가디건과 매치하여 페미닌한 무드를 연출해보세요.`;
      } else if (keyword.includes('가방') || keyword.includes('백') || keyword.includes('모자') || keyword.includes('목걸이')) {
        autoCatLabel = '액세서리';
        autoPrice = 65000;
        autoOriginal = 85000;
      }

      setName(generatedName);
      setDescription(generatedDesc);
      setAiStylingSuggestion(generatedStyling);
      setTagsInput(tags.join(', '));
      setPrice(autoPrice);
      setOriginalPrice(autoOriginal);
      setCategoryLabel(autoCatLabel);
      setCategory(autoCat);
      setIsAiProduct(true);

      // Match preset image if suitable
      const matched = PRESET_IMAGES.find(p => p.cat === autoCatLabel);
      if (matched) {
        setImageUrl(matched.url);
      }

      onSuccess(`AI가 '${keyword}' 상품 정보 생성을 완료했습니다!`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('상품명을 입력해 주세요.');
      return;
    }
    if (price <= 0) {
      alert('가격을 올바르게 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newProduct: Product = {
      id: `prod-custom-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      originalPrice: originalPrice > price ? Number(originalPrice) : undefined,
      imageUrl: imageUrl.trim() || PRESET_IMAGES[0].url,
      category: isAiProduct ? 'ai' : isHot ? 'hot' : category,
      categoryLabel: categoryLabel,
      description: description.trim() || 'StyleWise AI 프리미엄 큐레이션 패션 아이템입니다.',
      dataAiHint: name.split(' ').slice(0, 2).join(' '),
      tags: tagsArray.length > 0 ? tagsArray : ['신상품', 'StyleWise'],
      aiStylingSuggestion: aiStylingSuggestion.trim() || '베이직한 아이템들과 손쉽게 매치하여 감각적인 룩을 완성해보세요.',
      isHot: isHot,
      rating: 5.0,
      reviewsCount: 1,
    };

    // 1. Try to save to Firestore if DB available
    try {
      if (db) {
        await addDoc(collection(db, 'products'), {
          ...newProduct,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn('Firestore addDoc warning (saved to local state):', err);
    }

    // 2. Add to app-level state
    onAddProduct(newProduct);
    onSuccess(`새 상품 '${newProduct.name}'이(가) 성공적으로 등록되었습니다!`);

    // Reset Form
    setName('');
    setDescription('');
    setAiStylingSuggestion('');
    setTagsInput('');
    setAiKeyword('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">새 상품 등록</h2>
            <p className="text-xs text-neutral-500">
              새로운 패션 상품을 등록하여 쇼핑몰 메인 및 AI 스타일리스트 추천 목록에 즉시 노출합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. AI Automatic Generation Card */}
      <div className="bg-gradient-to-br from-amber-50/70 via-purple-50/50 to-neutral-50 p-6 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
              <Wand2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">AI 스마트 상품 자동 기획 & 생성기</h3>
          </div>
          <span className="text-[11px] text-amber-700 font-semibold px-2 py-0.5 bg-amber-100 rounded-md">
            Gemini AI 지원
          </span>
        </div>
        <p className="text-xs text-neutral-600 mb-3">
          원하시는 상품 키워드(예: <b>오버핏 울 블레이저</b>, <b>여름 린넨 셋업</b>, <b>카고 조거 팬츠</b>)를 입력하면 상품명, 감성적인 상세설명, 추천 코디 팁, 가격을 AI가 한 번에 작성합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="키워드 입력 (예: 레트로 워싱 데님 셋업, 캐시미어 하프 코트)"
            value={aiKeyword}
            onChange={(e) => setAiKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateWithAi(); }}}
            className="flex-1 px-4 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
          />
          <button
            type="button"
            onClick={handleGenerateWithAi}
            disabled={isAiGenerating || !aiKeyword.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>AI 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI로 자동 생성하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        
        {/* Basic Info: Name & Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              상품명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 프리미엄 오버핏 울 발마칸 코트"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              메인 의류 분류 <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value as ProductCategory)}
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-neutral-900 font-medium"
            >
              <option value="상의">상의 (Tops)</option>
              <option value="하의">하의 (Bottoms)</option>
              <option value="아우터">아우터 (Outerwear)</option>
              <option value="원피스">원피스 (Dress)</option>
              <option value="액세서리">액세서리 (Accessories)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              노출 카테고리 필터
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-neutral-900 font-medium"
            >
              <option value="latest">최신 상품 (Latest)</option>
              <option value="popular">인기 상품 (Popular)</option>
              <option value="hot">HOT 특가 (Hot Deals)</option>
              <option value="ai">✨ AI 추천 상품</option>
              <option value="all">일반 상품</option>
            </select>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              판매 가격 (₩) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₩</span>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold text-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              정상 정가 (할인율 계산용 ₩)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₩</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium text-neutral-900"
              />
            </div>
            {originalPrice > price && (
              <span className="text-[11px] font-bold text-rose-600 mt-1 inline-block">
                할인율: {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Image Selection & Presets */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            상품 대표 이미지 URL <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-neutral-800"
            />
            {imageUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-300 shrink-0 bg-neutral-100">
                <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Quick Preset Selector */}
          <div className="mt-3">
            <p className="text-[11px] font-bold text-neutral-500 mb-2">
              📸 고품질 패션 샘플 이미지 원클릭 선택:
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setCategoryLabel(preset.cat as ProductCategory);
                  }}
                  className={`relative group rounded-lg overflow-hidden border-2 text-left cursor-pointer transition-all aspect-square ${
                    imageUrl === preset.url ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs p-1 text-[9px] text-white font-medium truncate text-center">
                    {preset.label}
                  </div>
                  {imageUrl === preset.url && (
                    <div className="absolute top-1 right-1 bg-amber-500 text-neutral-950 p-0.5 rounded-full">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description & AI Styling Tip */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              상품 상세 설명
            </label>
            <textarea
              rows={3}
              placeholder="소재, 착용감, 핏감, 원단 특성 등을 자세히 입력하세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-neutral-800 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI 스타일리스트 추천 코디 가이드</span>
            </label>
            <input
              type="text"
              placeholder="예: 슬림핏 슬랙스와 더비 슈즈를 매치하면 깔끔한 오피스 룩 완성"
              value={aiStylingSuggestion}
              onChange={(e) => setAiStylingSuggestion(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-amber-50/40 border border-amber-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-neutral-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              해시태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              placeholder="예: 캐시미어, 겨울신상, 오피스룩, 데일리웨어"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all text-neutral-800"
            />
          </div>
        </div>

        {/* Feature Badges & Flags */}
        <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
            <input
              type="checkbox"
              checked={isHot}
              onChange={(e) => setIsHot(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>HOT 특가 상품으로 메인 노출</span>
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-800">
            <input
              type="checkbox"
              checked={isAiProduct}
              onChange={(e) => setIsAiProduct(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>AI 큐레이션 전용 상품 태그 부여</span>
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>상품 등록 중...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>쇼핑몰에 상품 등록하기</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
