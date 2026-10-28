import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Star, Heart, Check, Eye } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onGetAiStyling: (product: Product) => void;
}

export function ProductCard({
  product,
  onAddToCart,
  onQuickView,
  onGetAiStyling,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  return (
    <div 
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-xl hover:border-neutral-300 transition-all duration-300 relative cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      {/* Image Container */}
      <div className="relative aspect-3/4 w-full bg-neutral-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isHot && (
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
              HOT
            </span>
          )}
          {product.category === 'ai' && (
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI 맞춤
            </span>
          )}
          {discountPercent && (
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-amber-400 text-[11px] font-bold shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Heart Wishlist Button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs text-neutral-700 hover:text-red-500 flex items-center justify-center transition-colors shadow-xs z-10"
          aria-label="찜하기"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Hover Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-2 z-10">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="flex-1 py-2 px-3 rounded-lg bg-white/90 hover:bg-white text-neutral-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>상세보기</span>
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
              isAdded ? 'bg-emerald-600 text-white' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>담김</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>담기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{product.categoryLabel || '의류'}</span>
            {product.rating && (
              <div className="flex items-center gap-1 text-amber-600 font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewsCount && (
                  <span className="text-neutral-400">({product.reviewsCount})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="font-bold text-neutral-900 text-sm sm:text-base line-clamp-1 group-hover:text-amber-700 transition-colors">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing & AI Style Hint Trigger */}
        <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-neutral-900">
                {product.price.toLocaleString()}원
              </span>
              {product.originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {product.originalPrice.toLocaleString()}원
                </span>
              )}
            </div>
          </div>

          {/* AI Styling Prompt Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onGetAiStyling(product); }}
            className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-3 py-1.5 rounded-xl transition-all w-full cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>Get AI Styling Tip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
