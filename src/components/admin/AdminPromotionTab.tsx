import React, { useState } from 'react';
import { 
  Gift, 
  Tag, 
  Plus, 
  Calendar, 
  Percent, 
  Sparkles, 
  Check, 
  Trash2, 
  Image as ImageIcon, 
  Eye, 
  ExternalLink, 
  Wand2, 
  Sliders,
  Copy,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';
import type { Coupon, PromotionBanner } from '../../types';

interface AdminPromotionTabProps {
  coupons: Coupon[];
  banners: PromotionBanner[];
  onUpdateCoupon: (updated: Coupon) => void;
  onAddCoupon: (newCoupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onUpdateBanner: (updated: PromotionBanner) => void;
  onAddBanner: (newBanner: PromotionBanner) => void;
  onDeleteBanner: (bannerId: string) => void;
  onSuccess: (msg: string) => void;
}

export function AdminPromotionTab({
  coupons,
  banners,
  onUpdateCoupon,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateBanner,
  onAddBanner,
  onDeleteBanner,
  onSuccess,
}: AdminPromotionTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'coupons' | 'banners'>('coupons');

  // Coupon Creation Form State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(50000);
  const [maxDiscount, setMaxDiscount] = useState<number>(30000);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Banner Creation Form State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('2026 시즌 신상 특가');
  const [bannerImageUrl, setBannerImageUrl] = useState('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80');
  const [bannerLinkUrl, setBannerLinkUrl] = useState('#products');

  // AI Coupon Code Generator
  const handleGenerateAiCouponCode = () => {
    const prefixes = ['STYLE', 'FASHION', 'VIP', 'FALL', 'SUMMER', 'EVENT', 'BOOST'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const code = `${randomPrefix}${randomNum}`;
    setCouponCode(code);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || !couponTitle.trim()) return;
    const newCoupon: Coupon = {
      id: `cpn-${Date.now()}`,
      code: couponCode.toUpperCase().trim(),
      title: couponTitle,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscount: discountType === 'percentage' ? maxDiscount : undefined,
      expiryDate,
      isActive: true,
      usedCount: 0,
    };
    onAddCoupon(newCoupon);
    setIsCouponModalOpen(false);
    setCouponCode('');
    setCouponTitle('');
    onSuccess(`새 쿠폰 [${newCoupon.code}] 이(가) 발행되었습니다.`);
  };

  const handleToggleCouponActive = (coupon: Coupon) => {
    const updated = { ...coupon, isActive: !coupon.isActive };
    onUpdateCoupon(updated);
    onSuccess(`쿠폰 [${coupon.code}] 상태가 [${updated.isActive ? '발급 활성' : '발급 중단'}](으)로 변경되었습니다.`);
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;
    const newBanner: PromotionBanner = {
      id: `bnr-${Date.now()}`,
      title: bannerTitle,
      subtitle: bannerSubtitle,
      badge: bannerBadge,
      imageUrl: bannerImageUrl,
      linkUrl: bannerLinkUrl,
      isActive: true,
      order: banners.length + 1,
    };
    onAddBanner(newBanner);
    setIsBannerModalOpen(false);
    setBannerTitle('');
    setBannerSubtitle('');
    onSuccess(`새 히어로 메인 배너가 등록되었습니다.`);
  };

  const handleToggleBannerActive = (banner: PromotionBanner) => {
    const updated = { ...banner, isActive: !banner.isActive };
    onUpdateBanner(updated);
    onSuccess(`배너 [${banner.title}] 상태가 [${updated.isActive ? '노출 ON' : '노출 OFF'}](으)로 변경되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">AI 프로모션 & 배너/쿠폰 마케팅 센터</h2>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                마케팅 & CMS
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              할인 쿠폰 발행, 시즌 타임특가 기획전, 그리고 쇼핑몰 메인 비주얼 배너를 실시간 제어합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'coupons' ? (
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>새 할인 쿠폰 발행</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
                <span>새 메인 배너 등록</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('coupons')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'coupons'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>할인 쿠폰 관리 ({coupons.length}개)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('banners')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'banners'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>메인 히어로 배너 CMS ({banners.length}개)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. COUPONS SUB-TAB */}
      {/* ======================================================== */}
      {activeSubTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div 
              key={coupon.id}
              className={`p-5 rounded-2xl border transition-all bg-white relative flex flex-col justify-between ${
                coupon.isActive ? 'border-neutral-300 shadow-xs' : 'border-neutral-200 opacity-60 bg-neutral-50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 font-mono rounded-lg border border-amber-300">
                    {coupon.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {coupon.isActive ? '발급 활성화' : '발급 중단'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-neutral-900 mt-3">{coupon.title}</h4>

                <div className="mt-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>할인 혜택:</span>
                    <span className="font-extrabold text-amber-600">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% 할인` : `${coupon.discountValue.toLocaleString()}원 즉시할인`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>최소 주문액:</span>
                    <span className="font-semibold text-neutral-900">₩ {coupon.minOrderAmount.toLocaleString()}</span>
                  </div>
                  {coupon.maxDiscount && (
                    <div className="flex justify-between">
                      <span>최대 할인한도:</span>
                      <span className="font-semibold text-neutral-900">₩ {coupon.maxDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>만료일:</span>
                    <span className="font-mono text-neutral-500">{coupon.expiryDate}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">
                  누적 사용 <b>{coupon.usedCount}</b>회
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleCouponActive(coupon)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg cursor-pointer ${
                      coupon.isActive
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    }`}
                  >
                    {coupon.isActive ? '중단' : '활성화'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCoupon(coupon.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="쿠폰 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. BANNERS SUB-TAB */}
      {/* ======================================================== */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                  banner.isActive ? 'border-neutral-300 shadow-xs' : 'border-neutral-200 opacity-60'
                }`}
              >
                <div>
                  <div className="relative aspect-[16/9] w-full bg-neutral-900 overflow-hidden">
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title} 
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-400 text-neutral-950 rounded shadow-xs">
                        {banner.badge}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-black/60 text-white rounded font-mono">
                        순서 #{banner.order || index + 1}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h4 className="text-sm font-bold leading-snug line-clamp-1">{banner.title}</h4>
                      <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5">{banner.subtitle}</p>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span>연결 링크:</span>
                      <span className="font-mono text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">{banner.linkUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${banner.isActive ? 'text-emerald-600' : 'text-neutral-400'}`}>
                    {banner.isActive ? '● 메인 홈 노출중' : '○ 미노출'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleBannerActive(banner)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        banner.isActive
                          ? 'bg-neutral-200 hover:bg-neutral-300 text-neutral-800'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {banner.isActive ? '비활성화' : '메인노출'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteBanner(banner.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">신규 프로모션 할인 쿠폰 발행</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="mt-4 space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-neutral-700">쿠폰 코드</label>
                  <button
                    type="button"
                    onClick={handleGenerateAiCouponCode}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>AI 랜덤코드 생성</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="예: SUMMER2026"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">쿠폰명 (고객 표시용)</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 시즌 오픈 특별 15% 할인"
                  value={couponTitle}
                  onChange={(e) => setCouponTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">할인 방식</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  >
                    <option value="percentage">정률 할인 (%)</option>
                    <option value="fixed">정액 할인 (원)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {discountType === 'percentage' ? '할인율 (%)' : '할인액 (원)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">최소 주문금액</label>
                  <input
                    type="number"
                    step={10000}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">쿠폰 만료일</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl shadow-xs"
                >
                  쿠폰 발행하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-neutral-900">신규 메인 히어로 배너 등록</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">메인 타이틀 문구</label>
                <input
                  type="text"
                  required
                  placeholder="예: 2026 어텀 어반 럭셔리 컬렉션"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">서브 설명 문구</label>
                <input
                  type="text"
                  placeholder="예: 캐시미어 코트와 블레이저로 완성하는 깊이 있는 무드"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">상단 뱃지 텍스트</label>
                <input
                  type="text"
                  placeholder="예: NEW ARRIVALS"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">배경 고화질 화보 이미지 URL</label>
                <input
                  type="url"
                  required
                  value={bannerImageUrl}
                  onChange={(e) => setBannerImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl shadow-xs"
                >
                  배너 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
