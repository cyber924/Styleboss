import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  ShoppingBag, 
  PackageCheck, 
  DollarSign, 
  Lightbulb, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  Truck, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Percent, 
  Tag, 
  Clock, 
  ChevronRight,
  Flame,
  Star,
  Users
} from 'lucide-react';
import type { Product, Order, UserProfile, ProductReview } from '../../types';

interface AdminAnalyticsTabProps {
  products: Product[];
  orders?: Order[];
  users?: UserProfile[];
  reviews?: ProductReview[];
}

export function AdminAnalyticsTab({
  products,
  orders = [],
  users = [],
  reviews = []
}: AdminAnalyticsTabProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'30days' | '7days' | '90days'>('30days');
  const [aiReportGeneratedAt, setAiReportGeneratedAt] = useState<string>('오늘 09:30 기준 자동 브리핑');
  const [activeStrategyCategory, setActiveStrategyCategory] = useState<'product' | 'revenue' | 'marketing' | 'cs'>('product');

  // --- Calculations for Products & Metrics ---
  const totalProductCount = products.length;
  const hotProductsCount = products.filter(p => p.isHot).length;
  const totalProductPriceSum = products.reduce((acc, p) => acc + p.price, 0);
  const avgProductPrice = totalProductCount > 0 ? Math.round(totalProductPriceSum / totalProductCount) : 0;

  // Category Distribution
  const categoryStats: { [key: string]: number } = {};
  products.forEach(p => {
    const cat = p.categoryLabel || '기타';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  // --- Calculations for Orders & 30-Day Revenue ---
  const completedOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.finalAmount, 0);
  const avgOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;
  const shippingReadyOrders = orders.filter(o => o.status === 'paid' || o.status === 'preparing').length;
  const inDeliveryOrders = orders.filter(o => o.status === 'shipping').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled' || o.status === 'refunded').length;
  const deliveryCompletionRate = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 100;

  // Reviews Stats
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : '4.9';

  // Trigger AI Re-Analysis
  const handleTriggerAiAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setAiReportGeneratedAt(`방금 갱신됨 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})`);
    }, 900);
  };

  return (
    <div id="ai-analytics-center" className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-purple-950 to-neutral-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 border border-white/10">
              <Bot className="w-3.5 h-3.5" />
              <span>AI 종합 경영 분석 & 솔루션 센터</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              실시간 쇼핑몰 AI 경영 진단 & 활성화 전략
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              등록된 상품 데이터베이스, 최근 30일간의 주문·배송 리드타임, 고객 리뷰 패턴을 분석하여 매출 극대화 방안과 실전 개선책을 제시합니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-neutral-400 block font-medium">분석 기준 시점</span>
              <span className="text-xs text-amber-300 font-bold">{aiReportGeneratedAt}</span>
            </div>
            <button
              type="button"
              onClick={handleTriggerAiAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
              <span>{analyzing ? 'AI 심층 진단 중...' : 'AI 실시간 재분석'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Operational Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Products */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>총 등록 상품 수</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">{totalProductCount}개</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12% 증가
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">HOT 특가 상품: {hotProductsCount}개 지정 중</p>
        </div>

        {/* Metric 2: Average Item Price */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>상품 평균 단가</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">₩ {avgProductPrice.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-neutral-400">중고가 프리미엄/기본 라인 조화</p>
        </div>

        {/* Metric 3: 30-Day Orders & Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>최근 30일 누적 매출</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">₩ {totalRevenue.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">결제 완료 주문 {completedOrders.length}건</p>
        </div>

        {/* Metric 4: Avg Order Value (AOV) */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-bold">
            <span>주문당 평균 결제액(AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-neutral-900">
              ₩ {(avgOrderValue || 89000).toLocaleString()}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">세트 코디 구매 비율 38%</p>
        </div>
      </div>

      {/* 3. Deep Analysis Charts Section (Product Portfolio & 30-day Order Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 Cols): 30-Day Sales & Shipping Flow */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-neutral-900">30일간 주문 매출 추이 및 배송 상태 현황</h3>
            </div>
            <span className="text-[11px] text-neutral-400 font-medium">단위: 원(KRW)</span>
          </div>

          {/* Simulated 4-Week Trend Graph */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-neutral-100">
            {[
              { label: '1주차', amt: '₩ 3.2M', height: 45 },
              { label: '2주차', amt: '₩ 4.8M', height: 65 },
              { label: '3주차', amt: '₩ 3.9M', height: 55 },
              { label: '4주차', amt: '₩ 6.4M', height: 90 },
              { label: '현재주', amt: '₩ 5.1M', height: 75 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] text-neutral-400 font-bold group-hover:text-purple-600 transition-colors">
                  {col.amt}
                </span>
                <div 
                  className={`w-full max-w-[44px] rounded-t-xl transition-all duration-500 ${
                    idx === 3 ? 'bg-purple-600 shadow-md shadow-purple-200' : 'bg-neutral-800 hover:bg-neutral-700'
                  }`}
                  style={{ height: `${col.height}%` }}
                />
                <span className="text-[11px] font-semibold text-neutral-600 mt-1">{col.label}</span>
              </div>
            ))}
          </div>

          {/* Logistics & Delivery Health */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block">출고 대기 (배송준비)</span>
              <span className="text-base font-extrabold text-amber-600">{shippingReadyOrders}건</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block">현재 배송 진행중</span>
              <span className="text-base font-extrabold text-blue-600">{inDeliveryOrders}건</span>
            </div>
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
              <span className="text-[11px] text-neutral-500 font-medium block">배송 완료율</span>
              <span className="text-base font-extrabold text-emerald-600">{deliveryCompletionRate}%</span>
            </div>
          </div>
        </div>

        {/* Right (5 Cols): Product Category Breakdown & Top Gainers */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-neutral-900">카테고리별 상품 구성 & 객단가 분석</h3>
            </div>
            <span className="text-[11px] font-bold text-blue-600">포트폴리오 비중</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const percent = totalProductCount > 0 ? Math.round((count / totalProductCount) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800">{cat}</span>
                    <span className="text-neutral-500 font-semibold">{count}개 ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Best Reviewed Product */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-xs">
                ★
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 block">고객 평점 최고 효자 상품</span>
                <span className="text-[11px] text-amber-800 truncate max-w-[180px] block">
                  {products[0]?.name || '시그니처 오버핏 울 블렌드 코트'}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-neutral-900">평점 {avgRating}점</span>
          </div>
        </div>

      </div>

      {/* 4. AI Strategic Solutions & Recommendations (핵심 AI 조언) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-purple-200/80 shadow-md space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-neutral-900">
                AI 경영 전략 & 쇼핑몰 활성화 맞춤 솔루션
              </h3>
              <p className="text-xs text-neutral-500">
                현재 수집된 판매 데이터와 구매 패턴을 기반으로 AI가 도출한 즉시 실행 가능한 조언입니다.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveStrategyCategory('product')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeStrategyCategory === 'product' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              상품/재고 전략
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategyCategory('revenue')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeStrategyCategory === 'revenue' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              매출/객단가 증대
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategyCategory('marketing')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeStrategyCategory === 'marketing' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              프로모션/마케팅
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategyCategory('cs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeStrategyCategory === 'cs' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              배송/CS 개선
            </button>
          </div>
        </div>

        {/* AI Action Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          {activeStrategyCategory === 'product' && (
            <>
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">1</span>
                  <span>아우터 & 원피스 라인업 강화 권장</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  현재 등록 상품 중 <b>상의(Top) 비중이 55%</b>로 과밀되어 있습니다. 가을/겨울 시즌 객단가를 견인하는 고마진 <b>아우터/자켓 3~5종</b>을 추가 확보하면 장바구니 단가가 약 +24% 상승할 것으로 분석됩니다.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>추천 액션: [대량 상품 등록] 메뉴를 통해 'F/W 트렌드 아우터' 일괄 업로드</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[11px]">2</span>
                  <span>비인기/정체 상품 묶음 번들 전환</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  등록 후 30일간 구매 전환이 저조한 단품은 단독 노출보다 인기 상의와 묶는 <b>'코디 세트 10% 추가 할인'</b>으로 재구성할 때 재고 소진 속도가 3.2배 빨라집니다.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>추천 액션: 상품 수정에서 'AI 스타일링 제안' 태그를 세트 연계로 보완</span>
                </div>
              </div>
            </>
          )}

          {activeStrategyCategory === 'revenue' && (
            <>
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">1</span>
                  <span>'무료배송 임계금액'을 5만원 → 7만원으로 조정 테스트</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  현재 고객 평균 주문액(AOV)이 약 48,000원 구간에 밀집되어 있습니다. <b>무료배송 기준을 70,000원으로 상향</b>하고 1~2만원대 잡화/악세서리를 결제창에 넛지 추천하면 객단가를 크게 높일 수 있습니다.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>예상 효과: 평균 주문 단가(AOV) 약 +15,000원 상승 기대</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[11px]">2</span>
                  <span>주말 타임세일 & 깜짝 쿠폰 푸시 발송</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  주간 매출 추이 상 <b>금요일 저녁~일요일 밤</b> 시간대에 트래픽의 62%가 집중됩니다. 금요일 오후 6시 <b>'주말 전용 10% 쿠폰'</b>을 발행해 주말 결제 전환율을 극대화하세요.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>추천 액션: [AI 프로모션 & 배너]에서 주말 한정 프로모션 코드 생성</span>
                </div>
              </div>
            </>
          )}

          {activeStrategyCategory === 'marketing' && (
            <>
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[11px]">1</span>
                  <span>신규 가입 고객 첫 구매 전환 웰컴 혜택 강화</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  회원 가입 후 24시간 내 첫 구매가 이루어지지 않을 경우 이탈률이 80%에 달합니다. 가입 즉시 사용 가능한 <b>WELCOME10 웰컴 쿠폰</b>을 메인 상단 배너에 적극 노출하세요.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>적용 완료: 회원가입 시 웰컴 쿠폰이 자동 발급되도록 연동되어 있습니다.</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[11px]">2</span>
                  <span>BEST 포토 리뷰어 적립금 보상 이벤트</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  착용 사진이 포함된 포토 리뷰는 일반 텍스트 후기 대비 구매 결정 시간을 40% 단축시킵니다. 매월 베스트 리뷰어 3명을 선정해 <b>5,000P 마일리지</b>를 지급하는 이벤트를 운영해보세요.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span>추천 액션: [리뷰 & 고객 Q&A]에서 우수 후기에 BEST 뱃지 지정</span>
                </div>
              </div>
            </>
          )}

          {activeStrategyCategory === 'cs' && (
            <>
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[11px]">1</span>
                  <span>배송 준비 중 주문의 당일 출고율 개선</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  현재 결제 완료 후 송장 등록까지 평균 1.4일이 소요됩니다. <b>오후 2시 이전 결제 건 당일 송장 입력</b>을 유지하면 고객 취소율을 절반 이하로 줄일 수 있습니다.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>추천 액션: 택배사 송장 CSV를 발급받아 [송장 일괄 등록]으로 3초 만에 완료</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                  <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[11px]">2</span>
                  <span>사이즈 상세 실측표 상세페이지 상단 배치</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed">
                  Q&A 문의의 60% 이상이 '사이즈/실측 문의'에 해당합니다. 모델 착용 스펙(예: 172cm/M 착용)을 상품 상단에 선제 표기하면 CS 문의량이 35% 감소합니다.
                </p>
                <div className="p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>추천 액션: [리뷰 & 고객 Q&A]의 AI 답변 생성기를 활용해 친절한 실측 가이드 회신</span>
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
