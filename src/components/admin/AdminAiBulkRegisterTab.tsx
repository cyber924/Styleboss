import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShoppingBag, 
  Flame, 
  RotateCcw, 
  ArrowRight, 
  Copy, 
  Check, 
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Eye,
  ShieldCheck,
  Tag
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { MOOD_CONCEPTS, generateTenFemaleProducts, MoodConcept } from '../../lib/aiBulkGenerator';

interface AdminAiBulkRegisterTabProps {
  onAddBatchProducts: (batch: Product[]) => void;
  onSuccess: (message: string) => void;
}

export function AdminAiBulkRegisterTab({
  onAddBatchProducts,
  onSuccess,
}: AdminAiBulkRegisterTabProps) {
  const [selectedMood, setSelectedMood] = useState<string>(MOOD_CONCEPTS[0].id);
  const [generatedProducts, setGeneratedProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [filterCat, setFilterCat] = useState<string>('all');

  // Trigger AI generation of 10 curated female apparel products
  const handleGenerateTenProducts = async () => {
    setIsGenerating(true);
    // Simulate smart AI fashion algorithm processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const products = generateTenFemaleProducts(selectedMood);
    setGeneratedProducts(products);
    // Select all 10 by default
    setSelectedProductIds(new Set(products.map(p => p.id)));
    setIsGenerating(false);
    onSuccess(`여성의류 상의/하의/아우터/원피스 10개 상품이 AI로 기획 및 생성되었습니다.`);
  };

  // Toggle individual item selection
  const handleToggleSelect = (id: string) => {
    setSelectedProductIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    if (selectedProductIds.size === generatedProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(generatedProducts.map(p => p.id)));
    }
  };

  // Modify price of a generated item
  const handlePriceChange = (id: string, newPrice: number) => {
    setGeneratedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, price: newPrice };
      }
      return p;
    }));
  };

  // Toggle hot deal for a generated item
  const handleToggleHot = (id: string) => {
    setGeneratedProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isHot: !p.isHot };
      }
      return p;
    }));
  };

  // Final register batch to shopping mall
  const handleBatchRegister = async () => {
    const toRegister = generatedProducts.filter(p => selectedProductIds.has(p.id));
    if (toRegister.length === 0) {
      alert('등록할 상품을 1개 이상 선택해주세요.');
      return;
    }

    setIsRegistering(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    onAddBatchProducts(toRegister);
    setIsRegistering(false);
    onSuccess(`선택하신 ${toRegister.length}개의 AI 여성의류 상품이 쇼핑몰에 최종 등록되었습니다!`);
    
    // Clear generation preview or keep it
  };

  // Generate Instagram & SNS Promotion Caption
  const currentMoodObj = MOOD_CONCEPTS.find(m => m.id === selectedMood) || MOOD_CONCEPTS[0];
  const snsCaptionText = `✨ [StyleWise 신상 룩북] ${currentMoodObj.name}\n\n` +
    `AI 스타일리스트가 선별한 2026 시즌 여성 에센셜 캡슐 컬렉션 10종이 출시되었습니다!\n\n` +
    `👗 주요 카테고리 라인업:\n` +
    `• 상의: 캐시미어 니트, 실크 셔츠, 슬림핏 탑\n` +
    `• 하의: 핀턱 슬랙스, 맥시 스커트, 프리미엄 팬츠\n` +
    `• 아우터: 테일러드 린넨 자켓, 클래식 트렌치\n` +
    `• 원피스: 벨티드 플리츠 드레스, 슬림 니트 원피스\n\n` +
    `🎁 지금 공식 쇼핑몰에서 최대 25% AI 론칭 특가 혜택을 만나보세요.\n\n` +
    `#StyleWise #여성의류 #2026패션트렌드 #AI스타일링 #OOTD #데일리룩 #출근룩 #데이트룩`;

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(snsCaptionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
    onSuccess('SNS 홍보 문구가 클립보드에 복사되었습니다.');
  };

  const displayedProducts = generatedProducts.filter(p => {
    if (filterCat === 'all') return true;
    return p.categoryLabel === filterCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-neutral-900 via-purple-950 to-neutral-900 text-white p-6 rounded-2xl border border-purple-800/40 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  대량 상품 등록 엔진
                </h2>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-neutral-950 font-black rounded-full uppercase">
                  Bulk Register
                </span>
              </div>
              <p className="text-xs text-neutral-300 mt-1">
                여성의류 4대 핵심 카테고리(상의, 하의, 아우터, 원피스)의 상품명, 디테일 설명, AI 코디팁, 룩북 사진을 한번에 기획 및 생성하고 검수 후 즉시 등록합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateTenProducts}
            disabled={isGenerating}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI 여성의류 10종 기획 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI 상품 10개 자동 생성 실행</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 1: Mood & Concept Selector */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-neutral-900">
              1단계: 기획할 여성의류 시즌 & 무드 컨셉 선택
            </h3>
          </div>
          <span className="text-xs text-neutral-400 font-medium">원하는 컨셉에 맞춰 10종이 자동 설계됩니다</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MOOD_CONCEPTS.map((concept) => {
            const isSelected = selectedMood === concept.id;
            return (
              <button
                key={concept.id}
                type="button"
                onClick={() => setSelectedMood(concept.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {concept.badge}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <h4 className="text-xs font-bold text-neutral-900">{concept.name}</h4>
                <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">{concept.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Generation Results & Inspection Table */}
      {generatedProducts.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-neutral-900">
                  2단계: 생성된 10개 상품 검수 및 승인 ({selectedProductIds.size}/10개 선택됨)
                </h3>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                상의 3종, 하의 3종, 아우터 2종, 원피스 2종으로 균형 있게 구성되었습니다. 체크 후 하단 등록 버튼을 누르세요.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors cursor-pointer"
              >
                {selectedProductIds.size === generatedProducts.length ? '전체 해제' : '전체 선택'}
              </button>

              <button
                type="button"
                onClick={handleBatchRegister}
                disabled={isRegistering || selectedProductIds.size === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isRegistering ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>쇼핑몰 등록 중...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>선택한 {selectedProductIds.size}개 상품 최종 쇼핑몰 등록</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: '전체 (10)' },
              { id: '상의', label: '상의 (3)' },
              { id: '하의', label: '하의 (3)' },
              { id: '아우터', label: '아우터 (2)' },
              { id: '원피스', label: '원피스 (2)' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCat(tab.id)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  filterCat === tab.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Grid Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedProducts.map((product, idx) => {
              const isSelected = selectedProductIds.has(product.id);
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-xl border transition-all flex gap-3.5 relative ${
                    isSelected
                      ? 'border-neutral-900 bg-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/50 opacity-60'
                  }`}
                >
                  {/* Select Checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(product.id)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Thumbnail */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-24 object-cover rounded-lg bg-neutral-200 shrink-0 border border-neutral-200"
                  />

                  {/* Content & Inline Price Edit */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded">
                        {product.categoryLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleHot(product.id)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                          product.isHot
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>{product.isHot ? 'HOT 특가 ON' : '특가 OFF'}</span>
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-neutral-900 mt-1 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-neutral-400">판매가:</span>
                        <input
                          type="number"
                          step="1000"
                          value={product.price}
                          onChange={(e) => handlePriceChange(product.id, Number(e.target.value))}
                          className="w-24 px-1.5 py-0.5 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded text-neutral-900 focus:bg-white"
                        />
                        <span className="text-[11px] text-neutral-500 font-medium">원</span>
                      </div>

                      <span className="text-[10px] text-neutral-400 line-through">
                        ₩ {product.originalPrice?.toLocaleString()}
                      </span>
                    </div>

                    {/* AI Styling Tip */}
                    <div className="mt-2 text-[10px] text-amber-900 bg-amber-50 p-1.5 rounded">
                      💡 <b>코디 가이드:</b> {product.aiStylingSuggestion}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 3: Marketing & SNS Post Generator */}
          <div className="bg-neutral-900 text-neutral-200 p-5 rounded-xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">
                  3단계: AI 인스타그램 & SNS 마케팅 홍보 문구 자동 연동
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-bold rounded-lg border border-neutral-700 transition-colors cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? '복사 완료!' : 'SNS 문구 복사'}</span>
              </button>
            </div>

            <pre className="text-xs text-neutral-300 font-mono bg-neutral-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed border border-neutral-800/80">
              {snsCaptionText}
            </pre>
          </div>
        </div>
      )}

      {/* Initial Empty State Guide */}
      {generatedProducts.length === 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">여성의류 10종 AI 자동 패키지 등록</h3>
          <p className="text-xs text-neutral-500 max-w-md mx-auto mt-1">
            상단의 무드 컨셉을 선택한 후 <b>[AI 상품 10개 자동 생성 실행]</b> 버튼을 누르면 상의(3), 하의(3), 아우터(2), 원피스(2) 상품이 즉시 설계됩니다.
          </p>
          <button
            type="button"
            onClick={handleGenerateTenProducts}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>지금 10개 상품 기획 시작하기</span>
          </button>
        </div>
      )}
    </div>
  );
}
