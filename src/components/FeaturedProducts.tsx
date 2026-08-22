import React from 'react';
import { ProductCard } from './ProductCard';
import { Sparkles, Search, X, PackageOpen, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';

interface FeaturedProductsProps {
  products: Product[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onGetAiStyling: (product: Product) => void;
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FeaturedProducts({
  products,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onQuickView,
  onGetAiStyling,
  loading,
  searchQuery,
  onSearchChange,
}: FeaturedProductsProps) {
  const tabs = [
    { id: 'all', label: '전체 상품' },
    { id: 'latest', label: '최신 신상' },
    { id: 'popular', label: '베스트셀러' },
    { id: 'hot', label: '🔥 HOT 특가' },
    { id: 'ai', label: '✨ AI 추천' },
  ];

  // Filter products based on active category & search query
  const filteredProducts = products.filter((item) => {
    const matchesCategory = 
      activeCategory === 'all' || 
      item.category === activeCategory ||
      (activeCategory === 'hot' && item.isHot) ||
      (activeCategory === 'ai' && item.category === 'ai');

    const matchesSearch = 
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="featured-products-section" className="py-6 sm:py-8 space-y-6">
      {/* Search Bar placed directly under Hero Banner */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            id="products-search-input"
            type="search"
            placeholder="찾으시는 상품명 또는 스타일을 검색해보세요 (예: 울 코트, 셔츠, 슬랙스)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-neutral-900 placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 rounded-full cursor-pointer"
              title="검색어 지우기"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Search Tag Suggestions */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs shrink-0">
          <span className="text-neutral-400 font-medium whitespace-nowrap pl-1">인기 검색:</span>
          {['코트', '셔츠', '니트', '슬랙스'].map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => onSearchChange(keyword)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium cursor-pointer whitespace-nowrap"
            >
              #{keyword}
            </button>
          ))}
        </div>
      </div>

      {/* Section Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated For You</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            금주의 추천 스타일 컬렉션
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            {searchQuery ? `"${searchQuery}" 검색 결과 (${filteredProducts.length}개 상품)` : '엄선된 패션 아이템과 AI 스타일링 인사이트를 만나보세요.'}
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCategory(tab.id)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-4 animate-pulse">
              <div className="aspect-3/4 bg-neutral-200 rounded-xl" />
              <div className="h-4 bg-neutral-200 rounded-sm w-3/4" />
              <div className="h-3 bg-neutral-200 rounded-sm w-1/2" />
              <div className="h-6 bg-neutral-200 rounded-sm w-1/3" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        /* Product Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onQuickView={onQuickView}
              onGetAiStyling={onGetAiStyling}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-neutral-50 rounded-2xl border border-neutral-200/80 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mx-auto">
            <PackageOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">일치하는 상품이 없습니다</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            검색어나 선택된 카테고리를 변경하거나 전체 상품 탭을 확인해 보세요.
          </p>
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            전체 상품 보기
          </button>
        </div>
      )}
    </section>
  );
}
