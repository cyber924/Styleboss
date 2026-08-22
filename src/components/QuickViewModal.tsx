import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Sparkles, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  HelpCircle, 
  Info, 
  ThumbsUp, 
  CornerDownRight, 
  Plus, 
  Lock, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import type { Product, ProductReview, CustomerInquiry, UserProfile } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  reviews?: ProductReview[];
  inquiries?: CustomerInquiry[];
  user?: UserProfile | null;
  onAddReview?: (newReview: ProductReview) => void;
  onAddInquiry?: (newInquiry: CustomerInquiry) => void;
  onRequireLogin?: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  reviews = [],
  inquiries = [],
  user = null,
  onAddReview,
  onAddInquiry,
  onRequireLogin,
}: QuickViewModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'qna'>('info');
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');

  // Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSizeFeedback, setReviewSizeFeedback] = useState<'작음' | '적당함' | '큼'>('적당함');
  const [reviewColorFeedback, setReviewColorFeedback] = useState<'화면과 동일' | '조금 밝음' | '조금 어두움'>('화면과 동일');
  const [reviewImageUrl, setReviewImageUrl] = useState('');

  // Q&A Form State
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryType, setInquiryType] = useState<'size' | 'shipping' | 'refund' | 'product' | 'other'>('size');
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquiryIsSecret, setInquiryIsSecret] = useState(false);

  if (!isOpen || !product) return null;

  const productReviews = reviews.filter(
    r => r.productId === product.id && r.status !== 'hidden'
  );

  const productInquiries = inquiries.filter(
    i => i.productId === product.id || (!i.productId && i.productName === product.name)
  );

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (!reviewContent.trim()) return;

    if (onAddReview) {
      const newReview: ProductReview = {
        id: `rev-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productImageUrl: product.imageUrl,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '고객',
        userEmail: user.email || 'customer@stylewise.kr',
        rating: reviewRating,
        content: reviewContent.trim(),
        imageUrl: reviewImageUrl.trim() || undefined,
        sizeFeedback: reviewSizeFeedback,
        colorFeedback: reviewColorFeedback,
        likes: 0,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isBest: false,
        status: 'published'
      };
      onAddReview(newReview);
    }

    setReviewContent('');
    setReviewImageUrl('');
    setShowReviewForm(false);
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      if (onRequireLogin) onRequireLogin();
      return;
    }
    if (!inquiryTitle.trim() || !inquiryContent.trim()) return;

    if (onAddInquiry) {
      const newInquiry: CustomerInquiry = {
        id: `inq-${Date.now()}`,
        type: inquiryType,
        productId: product.id,
        productName: product.name,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || '고객',
        userEmail: user.email || 'customer@stylewise.kr',
        title: inquiryTitle.trim(),
        content: inquiryContent.trim(),
        isSecret: inquiryIsSecret,
        status: 'waiting',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      onAddInquiry(newInquiry);
    }

    setInquiryTitle('');
    setInquiryContent('');
    setShowInquiryForm(false);
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : null;

  return (
    <div id="quick-view-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image & Badges */}
        <div className="md:w-5/12 bg-neutral-100 relative min-h-[260px] md:min-h-full flex flex-col justify-between p-4">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="relative z-10 flex flex-col gap-1.5 items-start">
            {discountPercent && (
              <span className="px-2.5 py-1 bg-neutral-950 text-amber-400 text-xs font-black rounded-lg shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            <span className="px-2.5 py-0.5 bg-white/90 text-neutral-900 text-[11px] font-bold rounded-md shadow-xs backdrop-blur-xs">
              {product.categoryLabel || '시즌 신상'}
            </span>
          </div>

          <div className="relative z-10 bg-neutral-950/80 backdrop-blur-xs text-white p-3 rounded-2xl space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>만족도 평점</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{product.rating ? product.rating.toFixed(1) : '5.0'} / 5.0</span>
              </div>
            </div>
            <p className="text-[10px] text-neutral-300">
              구매 고객 리뷰 {productReviews.length}개 · 1:1 Q&A 문의 {productInquiries.length}건
            </p>
          </div>
        </div>

        {/* Right Tabbed Detail Container */}
        <div className="md:w-7/12 flex flex-col justify-between max-h-[620px] bg-white">
          
          {/* Header Navigation Tabs */}
          <div className="px-6 pt-5 pb-3 border-b border-neutral-100 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'info'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>상품 정보</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>구매 리뷰 ({productReviews.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qna')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'qna'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Q&A 문의 ({productInquiries.length})</span>
              </button>
            </div>
          </div>

          {/* Tab Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            
            {/* 1. PRODUCT INFO TAB */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 leading-snug">
                    {product.name}
                  </h2>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-2xl font-black text-neutral-950">
                      {product.price.toLocaleString()}원
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        {product.originalPrice.toLocaleString()}원
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {product.description}
                </p>

                {/* AI Styling Insight */}
                {product.aiStylingSuggestion && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-neutral-700 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>StyleWise AI 코디 제안</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-neutral-600">
                      {product.aiStylingSuggestion}
                    </p>
                  </div>
                )}

                {/* Size Selector */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-neutral-700">옵션 사이즈 선택</label>
                  <div className="flex items-center gap-2">
                    {['S', 'M', 'L', 'FREE'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          selectedSize === sz
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                            : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 2. REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div>
                    <span className="text-xs font-extrabold text-neutral-900">
                      구매 고객 생생 리뷰 ({productReviews.length}개)
                    </span>
                    <p className="text-[11px] text-neutral-400">실제 구매 고객이 등록한 만족도 평가입니다.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user && onRequireLogin) {
                        onRequireLogin();
                        return;
                      }
                      setShowReviewForm(!showReviewForm);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>후기 작성</span>
                  </button>
                </div>

                {/* Write Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">구매 후기 작성</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-0.5 cursor-pointer text-amber-400"
                          >
                            <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400' : 'text-neutral-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[11px] text-neutral-500 font-semibold">사이즈 피드백</label>
                        <select
                          value={reviewSizeFeedback}
                          onChange={(e) => setReviewSizeFeedback(e.target.value as any)}
                          className="w-full mt-1 p-2 bg-white border border-neutral-200 rounded-xl text-xs"
                        >
                          <option value="작음">작음 (타이트함)</option>
                          <option value="적당함">적당함 (정사이즈)</option>
                          <option value="큼">큼 (여유있음)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-neutral-500 font-semibold">색상 피드백</label>
                        <select
                          value={reviewColorFeedback}
                          onChange={(e) => setReviewColorFeedback(e.target.value as any)}
                          className="w-full mt-1 p-2 bg-white border border-neutral-200 rounded-xl text-xs"
                        >
                          <option value="화면과 동일">화면과 동일함</option>
                          <option value="조금 밝음">조금 밝은 편</option>
                          <option value="조금 어두움">조금 어두운 편</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      required
                      rows={3}
                      placeholder="원단 감촉, 착용감, 핏 등 솔직한 후기를 남겨주세요."
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      className="w-full p-3 bg-white border border-neutral-200 rounded-xl text-xs"
                    />

                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="url"
                        placeholder="착용 사진 이미지 URL (선택사항)"
                        value={reviewImageUrl}
                        onChange={(e) => setReviewImageUrl(e.target.value)}
                        className="flex-1 p-2 bg-white border border-neutral-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                      >
                        리뷰 등록하기
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      아직 등록된 구매 후기가 없습니다. 첫 번째 리뷰어가 되어보세요!
                    </div>
                  ) : (
                    productReviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-neutral-200'}`}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-neutral-900 text-[11px]">{rev.userName}</span>
                            {rev.isBest && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 bg-amber-400 text-neutral-950 rounded">
                                BEST
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400">{rev.createdAt}</span>
                        </div>

                        {(rev.sizeFeedback || rev.colorFeedback) && (
                          <div className="flex gap-2 text-[10px] text-neutral-500">
                            {rev.sizeFeedback && <span>사이즈: <b>{rev.sizeFeedback}</b></span>}
                            {rev.colorFeedback && <span>색상: <b>{rev.colorFeedback}</b></span>}
                          </div>
                        )}

                        <p className="text-neutral-700 leading-relaxed">{rev.content}</p>

                        {rev.imageUrl && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                            <img src={rev.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {rev.reply && (
                          <div className="mt-2 p-2.5 bg-white rounded-xl border border-neutral-200 text-[11px] space-y-1">
                            <div className="font-bold text-amber-900 flex items-center gap-1">
                              <CornerDownRight className="w-3 h-3 text-amber-600" />
                              <span>{rev.reply.author} 답변</span>
                            </div>
                            <p className="text-neutral-600 pl-4">{rev.reply.content}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Q&A TAB */}
            {activeTab === 'qna' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div>
                    <span className="text-xs font-extrabold text-neutral-900">
                      상품 Q&A 1:1 고객 문의 ({productInquiries.length}건)
                    </span>
                    <p className="text-[11px] text-neutral-400">사이즈, 배송, 재입고 등에 대한 질문을 남겨주세요.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!user && onRequireLogin) {
                        onRequireLogin();
                        return;
                      }
                      setShowInquiryForm(!showInquiryForm);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>문의하기</span>
                  </button>
                </div>

                {/* Write Inquiry Form */}
                {showInquiryForm && (
                  <form onSubmit={handleSubmitInquiry} className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-950">1:1 상품 문의 작성</span>
                      <select
                        value={inquiryType}
                        onChange={(e) => setInquiryType(e.target.value as any)}
                        className="p-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700"
                      >
                        <option value="size">사이즈/실측 문의</option>
                        <option value="shipping">배송/출고 문의</option>
                        <option value="refund">교환/반품 문의</option>
                        <option value="product">상품/재입고 문의</option>
                        <option value="other">기타 문의</option>
                      </select>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="문의 제목을 입력하세요 (예: 55사이즈 실측 문의)"
                      value={inquiryTitle}
                      onChange={(e) => setInquiryTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-bold"
                    />

                    <textarea
                      required
                      rows={3}
                      placeholder="궁금하신 내용을 구체적으로 작성해 주시면 담당자가 신속히 답변해 드립니다."
                      value={inquiryContent}
                      onChange={(e) => setInquiryContent(e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inquiryIsSecret}
                          onChange={(e) => setInquiryIsSecret(e.target.checked)}
                          className="rounded border-neutral-300 text-purple-600"
                        />
                        <span>비밀글로 작성하기</span>
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowInquiryForm(false)}
                          className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          문의 등록
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Inquiries List */}
                <div className="space-y-3">
                  {productInquiries.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-400">
                      등록된 문의사항이 없습니다. 궁금한 점이 있으시면 문의를 남겨주세요!
                    </div>
                  ) : (
                    productInquiries.map((inq) => (
                      <div key={inq.id} className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              inq.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {inq.status === 'answered' ? '답변완료' : '답변대기'}
                            </span>
                            <span className="font-bold text-neutral-900">{inq.title}</span>
                            {inq.isSecret && <Lock className="w-3 h-3 text-neutral-400" />}
                          </div>
                          <span className="text-[10px] text-neutral-400">{inq.userName} · {inq.createdAt}</span>
                        </div>

                        <p className="text-neutral-700 leading-relaxed whitespace-pre-line pl-1">{inq.content}</p>

                        {inq.answer && (
                          <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] space-y-1">
                            <div className="font-bold text-emerald-900 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{inq.answer.answeredBy} 공식 답변</span>
                            </div>
                            <p className="text-neutral-700 pl-4 whitespace-pre-line">{inq.answer.content}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Fixed Bottom Action Panel */}
          <div className="p-4 sm:p-6 border-t border-neutral-100 space-y-2 bg-neutral-50/50 shrink-0">
            <button
              id="quick-add-cart-btn"
              type="button"
              onClick={handleAdd}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                added 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>장바구니에 담겼습니다!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-amber-400" />
                  <span>장바구니 담기 (₩{product.price.toLocaleString()})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-around text-[11px] text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <Truck className="w-3 h-3 text-neutral-500" /> 무료배송 (5만원 이상)
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-neutral-500" /> 100% 정품 보장
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
