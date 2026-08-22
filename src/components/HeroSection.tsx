import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShoppingBag, ShieldCheck, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PromotionBanner } from '../types';

interface HeroSectionProps {
  banners?: PromotionBanner[];
  onExploreClick: () => void;
  onStylistClick: () => void;
}

export function HeroSection({ banners, onExploreClick, onStylistClick }: HeroSectionProps) {
  const activeBanners = (banners && banners.filter(b => b.isActive).length > 0) 
    ? banners.filter(b => b.isActive)
    : [
        {
          id: 'default',
          title: 'AI가 찾아주는, 나만의 완벽한 스타일',
          subtitle: '최신 패션 트렌드부터 체형과 취향에 맞춘 퍼스널 코디까지 실시간 완성',
          badge: 'StyleWise AI 2026 패션 컬렉션',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
          linkUrl: '#products',
          isActive: true,
          order: 1
        }
      ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banner every 6s
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <section id="hero-banner" className="relative overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-xl my-6 group">
      {/* Background Image with Smooth Fade Transition */}
      <div 
        key={currentBanner.id}
        className="absolute inset-0 opacity-40 bg-cover bg-center transition-all duration-700 ease-out"
        style={{
          backgroundImage: `url('${currentBanner.imageUrl}')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-3xl px-6 py-12 sm:px-10 sm:py-16 flex flex-col gap-4 sm:gap-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold w-fit">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{currentBanner.badge || 'StyleWise AI 2026 패션 컬렉션'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight sm:leading-snug break-keep max-w-2xl">
          {currentBanner.title}
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-xl break-keep">
          {currentBanner.subtitle || '최신 패션 트렌드부터 체형과 취향에 맞춘 퍼스널 코디까지 실시간 맞춤 큐레이션으로 완성해 드립니다.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            id="hero-shop-now-btn"
            type="button"
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>쇼핑 시작하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            id="hero-ai-stylist-btn"
            type="button"
            onClick={onStylistClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-white border border-neutral-700 font-semibold text-xs sm:text-sm transition-all backdrop-blur-xs cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI 스타일리스트 체험</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neutral-800/80 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">실시간 AI 스타일 분석</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">당일 안심 출고 배송</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate">맞춤 큐레이션 추천</span>
          </div>
        </div>
      </div>

      {/* Multiple Banners Navigation Dots and Arrows */}
      {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
