import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  X, 
  Check, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  Zap, 
  Sliders, 
  Palette, 
  Maximize2, 
  Cpu, 
  Flame, 
  CheckCircle2,
  Sparkle,
  Camera,
  RotateCw,
  Image as ImageIcon
} from 'lucide-react';
import type { Product } from '../../types';
import { 
  buildFashionPrompt, 
  generateMatchingImages, 
  renderCustomFashionAiImage,
  buildCustomRenderPrompt,
  MOOD_STYLE_PRESETS,
  MODEL_FORMAT_PRESETS,
  COLOR_TONE_PRESETS,
  CustomRenderConfig,
  GeneratedImageCandidate 
} from '../../lib/fashionImageAi';

interface AdminAiImageGenModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onApplyImage: (productId: string, newImageUrl: string) => void;
}

export function AdminAiImageGenModal({
  product,
  isOpen,
  onClose,
  onApplyImage,
}: AdminAiImageGenModalProps) {
  // Mode selection: 'curated' (Fast match) vs 'custom_render' (Direct AI render)
  const [activeMode, setActiveMode] = useState<'curated' | 'custom_render'>('curated');

  // Mode 1: Curated match states
  const [prompt, setPrompt] = useState('');
  const [candidates, setCandidates] = useState<GeneratedImageCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<GeneratedImageCandidate | null>(null);
  const [isGeneratingCurated, setIsGeneratingCurated] = useState(false);

  // Mode 2: Custom direct AI render states
  const [customConfig, setCustomConfig] = useState<CustomRenderConfig>({
    moodStyle: 'studio_minimal',
    modelFormat: 'korean_model',
    colorTone: 'natural_warm',
    aspectRatio: '3:4',
    customUserPrompt: '',
  });
  const [customRenderHistory, setCustomRenderHistory] = useState<GeneratedImageCandidate[]>([]);
  const [isRenderingCustom, setIsRenderingCustom] = useState(false);
  const [customRenderPromptPreview, setCustomRenderPromptPreview] = useState('');

  // Update prompt preview whenever custom config changes
  useEffect(() => {
    if (product) {
      setCustomRenderPromptPreview(buildCustomRenderPrompt(product, customConfig));
    }
  }, [product, customConfig]);

  // Initial load
  useEffect(() => {
    if (isOpen && product) {
      const generatedPrompt = buildFashionPrompt(product);
      setPrompt(generatedPrompt);
      handleGenerateCurated(generatedPrompt);
    }
  }, [isOpen, product]);

  const handleGenerateCurated = async (customPromptText?: string) => {
    setIsGeneratingCurated(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const results = generateMatchingImages(product);
    setCandidates(results);
    setSelectedCandidate(results[0] || null);
    setIsGeneratingCurated(false);
  };

  const handleRenderCustom = async () => {
    setIsRenderingCustom(true);
    try {
      const rendered = await renderCustomFashionAiImage(product, customConfig);
      setCustomRenderHistory(prev => [rendered, ...prev.slice(0, 5)]);
      setSelectedCandidate(rendered);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRenderingCustom(false);
    }
  };

  const handleApply = () => {
    if (!selectedCandidate) return;
    onApplyImage(product.id, selectedCandidate.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-neutral-200 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950 text-white rounded-t-2xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 flex items-center justify-center font-black shadow-md shrink-0">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">
                  상품 맞춤형 AI 이미지 스튜디오
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-neutral-950 font-black rounded-full uppercase tracking-wider">
                  Fashion Studio AI
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                초고속 룩북 추천 또는 100% 실시간 커스텀 AI 직접 렌더링을 지원합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Mode Switcher Banner */}
        <div className="bg-neutral-900 px-4 sm:px-6 pt-3 pb-3 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center p-1 bg-neutral-800 rounded-xl border border-neutral-700/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveMode('curated')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'curated'
                  ? 'bg-amber-400 text-neutral-950 shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>모드 1 : ⚡ 초고속 추천 룩북</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('custom_render')}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'custom_render'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-700/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>모드 2 : 🎨 실시간 AI 직접 렌더링</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-purple-900/80 text-purple-200 rounded border border-purple-400/40">
                100% 커스텀
              </span>
            </button>
          </div>

          <div className="text-right hidden md:block">
            <span className="text-[11px] text-neutral-400">
              {activeMode === 'curated' 
                ? '⚡ 0.5초 즉각 추천 (고화질 보증)' 
                : '🎨 조명, 배경, 모델, 화보 무드 100% 자유 조절'}
            </span>
          </div>
        </div>

        {/* Target Product Summary Strip */}
        <div className="bg-neutral-100/70 px-4 sm:px-6 py-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-14 object-cover rounded-lg bg-neutral-200 shrink-0 border border-neutral-300 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold px-2 py-0.5 bg-white text-neutral-800 rounded border border-neutral-300">
                  {product.categoryLabel || product.category}
                </span>
                <span className="text-xs font-bold text-neutral-900">
                  ₩ {product.price.toLocaleString()}
                </span>
              </div>
              <h4 className="text-xs font-bold text-neutral-900 line-clamp-1">{product.name}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-500 hidden sm:inline">현재 등록된 원본 썸네일</span>
            <span className="text-[10px] font-mono bg-white px-2 py-1 rounded border border-neutral-200 text-neutral-600">
              ID: {product.id}
            </span>
          </div>
        </div>

        {/* Modal Body: Mode 1 vs Mode 2 */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* ======================================================== */}
          {/* MODE 1: 초고속 추천 룩북 (Fast Curated Match) */}
          {/* ======================================================== */}
          {activeMode === 'curated' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Prompt bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>상품 자동 분석 프롬프트 (수정 가능)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleGenerateCurated(prompt)}
                    disabled={isGeneratingCurated}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingCurated ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-700 font-mono leading-relaxed"
                />
              </div>

              {/* Curated Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-neutral-700" />
                    <span>추천된 맞춤 룩북 ({candidates.length}개)</span>
                  </h4>
                  <span className="text-[11px] text-neutral-500">원하는 화보를 클릭하여 선택하세요</span>
                </div>

                {isGeneratingCurated ? (
                  <div className="py-16 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-neutral-800">
                      고화질 패션 룩북 데이터베이스 매칭 중...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {candidates.map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => setSelectedCandidate(cand)}
                          className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer flex flex-col bg-white ${
                            isSelected
                              ? 'border-neutral-900 ring-2 ring-amber-400 shadow-md scale-[1.02]'
                              : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                          }`}
                        >
                          <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                            <img
                              src={cand.url}
                              alt={cand.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-black/70 text-white rounded">
                                {cand.styleTag}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-amber-400 text-neutral-950 p-1 rounded-full shadow-md animate-in zoom-in">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h5 className="text-[11px] font-bold text-neutral-900 truncate">
                                {cand.title}
                              </h5>
                              <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                                {cand.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-amber-600 mt-1.5 inline-block">
                                ✓ 선택 완료
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODE 2: 실시간 AI 직접 렌더링 (Custom Direct AI Generation) */}
          {/* ======================================================== */}
          {activeMode === 'custom_render' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Parameter Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-purple-50/40 p-4 sm:p-5 rounded-2xl border border-purple-100">
                
                {/* 1. 화보 무드 & 스타일 프리셋 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      1. 화보 무드 & 배경 스타일
                    </span>
                    <span className="text-[10px] text-purple-600 font-semibold">6가지 전용 프리셋</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOOD_STYLE_PRESETS.map((mood) => {
                      const isSelected = customConfig.moodStyle === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setCustomConfig({ ...customConfig, moodStyle: mood.id })}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white border-purple-500 ring-2 ring-purple-400 shadow-xs'
                              : 'bg-white/80 border-neutral-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{mood.icon}</span>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-purple-600 text-white' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {mood.badge}
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <span className="text-xs font-bold text-neutral-900 block truncate">
                              {mood.label}
                            </span>
                            <span className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">
                              {mood.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. 모델 및 연출 포맷 & 톤 */}
                <div className="space-y-4">
                  
                  {/* Presentation Format */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      2. 모델 연출 포맷
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {MODEL_FORMAT_PRESETS.map((fmt) => {
                        const isSelected = customConfig.modelFormat === fmt.id;
                        return (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => setCustomConfig({ ...customConfig, modelFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white border-purple-500 ring-2 ring-purple-400'
                                : 'bg-white/80 border-neutral-200 hover:border-purple-200'
                            }`}
                          >
                            <span className="text-xs font-bold text-neutral-900 block truncate">
                              {fmt.label}
                            </span>
                            <span className="text-[9px] text-neutral-500 line-clamp-1 mt-0.5">
                              {fmt.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color tone & Aspect ratio */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Color Tone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                        <Palette className="w-3 h-3 text-purple-600" />
                        3. 컬러 & 조명 톤
                      </label>
                      <select
                        value={customConfig.colorTone}
                        onChange={(e) => setCustomConfig({ ...customConfig, colorTone: e.target.value as any })}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-purple-400 font-semibold"
                      >
                        {COLOR_TONE_PRESETS.map((tone) => (
                          <option key={tone.id} value={tone.id}>
                            {tone.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3 text-purple-600" />
                        4. 룩북 종횡비 비율
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: '3:4', label: '3:4 룩북' },
                          { id: '1:1', label: '1:1 정사각' },
                          { id: '4:5', label: '4:5 상세' },
                        ].map((ratio) => (
                          <button
                            key={ratio.id}
                            type="button"
                            onClick={() => setCustomConfig({ ...customConfig, aspectRatio: ratio.id as any })}
                            className={`py-1.5 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              customConfig.aspectRatio === ratio.id
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            {ratio.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* 5. 자유 문장 프롬프트 입력 (한국어/영어 모두 지원) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Sparkle className="w-3.5 h-3.5 text-purple-600" />
                    <span>사용자 직접 요청 사항 (한국어 자유 입력)</span>
                  </label>
                  <span className="text-[11px] text-neutral-400">예: "비오는 파리 카페 테라스", "린넨 주름 텍스처 강조"</span>
                </div>
                <input
                  type="text"
                  placeholder="예: 어깨 라인이 여유롭고 자연광이 들어오는 창가에서 커피를 든 모델 연출..."
                  value={customConfig.customUserPrompt}
                  onChange={(e) => setCustomConfig({ ...customConfig, customUserPrompt: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-neutral-800 placeholder:text-neutral-400"
                />
              </div>

              {/* Render Launch Action Bar */}
              <div className="bg-gradient-to-r from-purple-950 via-neutral-900 to-neutral-900 p-4 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-purple-900/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <h5 className="text-xs font-bold text-white">
                      AI 패션 생성 엔진 대기 중
                    </h5>
                  </div>
                  <p className="text-[11px] text-neutral-300 line-clamp-1 max-w-lg">
                    {customRenderPromptPreview}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRenderCustom}
                  disabled={isRenderingCustom}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isRenderingCustom ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-neutral-950" />
                      <span>AI 실시간 렌더링 중...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-neutral-950" />
                      <span>🎨 100% 맞춤 AI 화보 즉시 생성</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render History Gallery */}
              {customRenderHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span>방금 생성된 AI 커스텀 화보 목록 ({customRenderHistory.length}개)</span>
                    </h4>
                    <span className="text-[11px] text-neutral-500">클릭하여 최종 교체 대상으로 지정</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {customRenderHistory.map((cand) => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => setSelectedCandidate(cand)}
                          className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer flex flex-col bg-white ${
                            isSelected
                              ? 'border-purple-600 ring-2 ring-purple-400 shadow-md scale-[1.02]'
                              : 'border-neutral-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden">
                            <img
                              src={cand.url}
                              alt={cand.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2">
                              <span className="text-[9px] font-extrabold px-2 py-0.5 bg-purple-900/90 text-white rounded">
                                {cand.styleTag}
                              </span>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full shadow-md animate-in zoom-in">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>

                          <div className="p-2.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h5 className="text-[11px] font-bold text-neutral-900 truncate">
                                {cand.title}
                              </h5>
                              <p className="text-[10px] text-neutral-500 line-clamp-2 mt-0.5">
                                {cand.description}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[9px] font-bold text-purple-600 mt-1.5 inline-block">
                                ✓ 최종 적용 대상으로 선택됨
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ======================================================== */}
          {/* Before & After Comparison Preview Box */}
          {/* ======================================================== */}
          {selectedCandidate && (
            <div className="bg-gradient-to-r from-amber-50 to-purple-50 p-4 rounded-xl border border-neutral-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-neutral-400 block mb-1">기존 이미지</span>
                  <img
                    src={product.imageUrl}
                    alt="current"
                    className="w-14 h-18 object-cover rounded-lg border border-neutral-300 opacity-60"
                  />
                </div>

                <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 hidden sm:block" />

                <div className="text-center">
                  <span className="text-[10px] font-bold text-purple-700 block mb-1">새 AI 이미지</span>
                  <img
                    src={selectedCandidate.url}
                    alt="new preview"
                    className="w-14 h-18 object-cover rounded-lg border-2 border-purple-600 shadow-sm"
                  />
                </div>

                <div className="text-left max-w-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-purple-200 text-purple-900 rounded">
                      {selectedCandidate.source === 'ai_rendered' ? '🎨 100% AI 직접 렌더링' : '⚡ 큐레이션 추천'}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500">교체 준비 완료</span>
                  </div>
                  <h5 className="text-xs font-bold text-neutral-900 mt-1 truncate">{selectedCandidate.title}</h5>
                  <p className="text-[11px] text-neutral-600 line-clamp-1 mt-0.5">
                    적용 버튼을 누르면 이 상품의 대표 이미지가 즉시 업데이트됩니다.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApply}
                disabled={!selectedCandidate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <Check className="w-4 h-4 text-amber-400" />
                <span>이 이미지로 상품 즉시 교체</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between rounded-b-2xl">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>선택한 이미지는 쇼핑몰 전체 상품 목록 및 상세 페이지에 즉시 연동됩니다.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!selectedCandidate}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>적용 및 저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
