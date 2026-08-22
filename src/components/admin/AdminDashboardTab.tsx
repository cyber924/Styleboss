import React from 'react';
import { 
  Package, 
  Flame, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  ShoppingBag, 
  Users, 
  Eye, 
  ArrowUpRight, 
  Layers,
  ArrowRight
} from 'lucide-react';
import type { Product } from '../../types';

interface AdminDashboardTabProps {
  products: Product[];
  onNavigateTab: (tab: string) => void;
  onEditProduct: (product: Product) => void;
}

export function AdminDashboardTab({
  products,
  onNavigateTab,
  onEditProduct,
}: AdminDashboardTabProps) {
  const totalProducts = products.length;
  const hotProducts = products.filter(p => p.isHot || p.category === 'hot').length;
  const aiProducts = products.filter(p => p.category === 'ai' || p.tags?.includes('AI생성')).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.price, 0);
  const averagePrice = totalProducts > 0 ? Math.round(totalInventoryValue / totalProducts) : 0;

  // Category breakdown
  const categoryStats: Record<string, number> = {};
  products.forEach(p => {
    const cat = p.categoryLabel || p.category;
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const recentProducts = [...products].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-6 shadow-md border border-neutral-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>StyleWise AI 관리자 시스템</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">쇼핑몰 운영 대시보드</h2>
          <p className="text-sm text-neutral-300 mt-1">
            실시간 상품 현황과 AI 상품 등록 및 카테고리 관리를 한눈에 모니터링하세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onNavigateTab('bulk-register')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 font-black rounded-xl shadow-md transition-all cursor-pointer text-xs sm:text-sm animate-pulse"
          >
            <Sparkles className="w-4 h-4" />
            <span>⚡ AI 10개 상품 대량 등록</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('register')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-700 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>개별 등록</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">총 등록 상품</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{totalProducts}개</h3>
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> 실시간 쇼핑몰 반영 중
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-800">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Hot Deal Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">HOT 특가 상품</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{hotProducts}개</h3>
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
              <Flame className="w-3 h-3 text-amber-500" /> 메인 핫딜 노출
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* AI Generated Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">AI 추천/생성 상품</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">{aiProducts}개</h3>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> 스마트 코디 태그
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">평균 상품 단가</p>
            <h3 className="text-2xl font-extrabold text-neutral-900 mt-1">₩ {averagePrice.toLocaleString()}</h3>
            <p className="text-xs text-neutral-500 font-medium mt-1">
              총 재고가: ₩ {totalInventoryValue.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Category Distribution & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              카테고리별 등록 현황
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">쇼핑몰 내 등록된 상품군 분포</p>
            
            <div className="space-y-3 mt-4">
              {Object.entries(categoryStats).map(([cat, count]) => {
                const percentage = Math.round((count / totalProducts) * 100) || 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-neutral-700">
                      <span>{cat}</span>
                      <span>{count}개 ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-neutral-800 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('manage')}
            className="mt-6 w-full py-2.5 px-3 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>전체 상품 관리하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Products List */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-neutral-700" />
                최근 등록 상품 목록
              </h3>
              <p className="text-xs text-neutral-500">가장 최근에 추가되거나 업데이트된 상품</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('manage')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>전체보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">상품 정보</th>
                  <th className="py-2.5 px-3">카테고리</th>
                  <th className="py-2.5 px-3">판매가</th>
                  <th className="py-2.5 px-3">상태</th>
                  <th className="py-2.5 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imageUrl} 
                          alt={p.name} 
                          className="w-10 h-10 object-cover rounded-lg bg-neutral-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="truncate max-w-[180px]">
                          <p className="font-semibold text-neutral-900 truncate">{p.name}</p>
                          <p className="text-[10px] text-neutral-400 truncate">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-neutral-700">
                      <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 rounded-md font-medium">
                        {p.categoryLabel || p.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-neutral-900">
                      ₩ {p.price.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {p.isHot && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">HOT</span>
                        )}
                        {p.category === 'ai' && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] font-bold">AI</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onEditProduct(p)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-md transition-colors cursor-pointer text-[11px]"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
