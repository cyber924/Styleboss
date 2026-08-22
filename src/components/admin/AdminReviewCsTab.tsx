import React, { useState } from 'react';
import { 
  MessageSquareText, 
  Star, 
  Sparkles, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  Reply, 
  Search, 
  Filter, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  Wand2, 
  HelpCircle, 
  Package, 
  Lock, 
  Unlock,
  CornerDownRight,
  TrendingUp,
  Image as ImageIcon
} from 'lucide-react';
import type { ProductReview, CustomerInquiry } from '../../types';

interface AdminReviewCsTabProps {
  reviews: ProductReview[];
  inquiries: CustomerInquiry[];
  onUpdateReview: (updatedReview: ProductReview) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateInquiry: (updatedInquiry: CustomerInquiry) => void;
  onDeleteInquiry: (inquiryId: string) => void;
  onSuccess: (msg: string) => void;
}

export function AdminReviewCsTab({
  reviews,
  inquiries,
  onUpdateReview,
  onDeleteReview,
  onUpdateInquiry,
  onDeleteInquiry,
  onSuccess,
}: AdminReviewCsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'reviews' | 'inquiries'>('reviews');

  // Reviews Filtering
  const [reviewRatingFilter, setReviewRatingFilter] = useState<'all' | '5' | '4' | 'under3' | 'best' | 'unreplied'>('all');
  const [reviewSearch, setReviewSearch] = useState('');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');

  // Inquiries Filtering
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'all' | 'waiting' | 'answered'>('all');
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<string>('all');
  const [inquirySearch, setInquirySearch] = useState('');
  const [replyingInquiryId, setReplyingInquiryId] = useState<string | null>(null);
  const [inquiryAnswerText, setInquiryAnswerText] = useState('');

  // Review Metrics
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  const photoReviewsCount = reviews.filter(r => !!r.imageUrl).length;
  const bestReviewsCount = reviews.filter(r => r.isBest).length;
  const unrepliedReviewsCount = reviews.filter(r => !r.reply).length;

  // Inquiries Metrics
  const waitingInquiriesCount = inquiries.filter(i => i.status === 'waiting').length;
  const answeredInquiriesCount = inquiries.filter(i => i.status === 'answered').length;

  // Filtered Reviews
  const filteredReviews = reviews.filter(r => {
    if (reviewRatingFilter === '5' && r.rating !== 5) return false;
    if (reviewRatingFilter === '4' && r.rating !== 4) return false;
    if (reviewRatingFilter === 'under3' && r.rating > 3) return false;
    if (reviewRatingFilter === 'best' && !r.isBest) return false;
    if (reviewRatingFilter === 'unreplied' && r.reply) return false;

    if (reviewSearch.trim()) {
      const q = reviewSearch.toLowerCase();
      return (
        r.productName.toLowerCase().includes(q) ||
        r.userName.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Inquiries
  const filteredInquiries = inquiries.filter(inq => {
    if (inquiryStatusFilter === 'waiting' && inq.status !== 'waiting') return false;
    if (inquiryStatusFilter === 'answered' && inq.status !== 'answered') return false;
    if (inquiryTypeFilter !== 'all' && inq.type !== inquiryTypeFilter) return false;

    if (inquirySearch.trim()) {
      const q = inquirySearch.toLowerCase();
      return (
        inq.title.toLowerCase().includes(q) ||
        inq.content.toLowerCase().includes(q) ||
        inq.userName.toLowerCase().includes(q) ||
        (inq.productName && inq.productName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Toggle Best Review
  const handleToggleBestReview = (review: ProductReview) => {
    const updated: ProductReview = { ...review, isBest: !review.isBest };
    onUpdateReview(updated);
    onSuccess(`리뷰가 [${updated.isBest ? '베스트 리뷰로 선정' : '일반 리뷰로 전환'}] 되었습니다.`);
  };

  // Toggle Review Status (Hide / Publish)
  const handleToggleReviewStatus = (review: ProductReview) => {
    const newStatus = review.status === 'published' ? 'hidden' : 'published';
    const updated: ProductReview = { ...review, status: newStatus };
    onUpdateReview(updated);
    onSuccess(`리뷰 상태가 [${newStatus === 'published' ? '쇼핑몰 정상 공개' : '관리자 숨김'}] 처리되었습니다.`);
  };

  // AI Smart Review Reply Generator
  const handleGenerateAiReviewReply = (review: ProductReview) => {
    const positiveTemplates = [
      `안녕하세요 ${review.userName} 고객님! StyleWise 공식 MD입니다. [${review.productName}]의 핏과 실루엣을 마음에 들어해주셔서 진심으로 기쁩니다. 고객님의 감각적인 스타일에 저희 제품이 함께할 수 있어 큰 보람을 느낍니다. 앞으로도 완벽한 핏의 신상품으로 보답하겠습니다. 행복한 하루 보내세요!`,
      `소중한 포토 후기 감사드립니다 ${review.userName} 고객님! [${review.productName}]은 프리미엄 소재와 정교한 패턴으로 제작되어 오래도록 변형 없이 착용하실 수 있습니다. 멋진 스타일링 계속해서 응원하겠습니다 :)`,
      `안녕하세요 고객님! 상세한 사이즈 피드백과 칭찬 리뷰 남겨주셔서 진심으로 감사드립니다. 다른 고객님들의 사이즈 선택에도 큰 도움이 될 것 같습니다. 늘 최고의 퀄리티로 찾아뵙겠습니다!`
    ];
    const normalTemplates = [
      `안녕하세요 ${review.userName} 고객님, StyleWise CS팀입니다. [${review.productName}] 상품에 대한 솔직하고 소중한 의견 감사드립니다. 남겨주신 피드백을 디자이너 및 생산팀과 면밀히 검토하여 더욱 완벽한 핏과 편안한 착용감의 상품을 선보이도록 최선을 다하겠습니다.`
    ];

    const pool = review.rating >= 4 ? positiveTemplates : normalTemplates;
    const randomReply = pool[Math.floor(Math.random() * pool.length)];
    setReviewReplyText(randomReply);
  };

  // Submit Review Reply
  const handleSubmitReviewReply = (review: ProductReview) => {
    if (!reviewReplyText.trim()) return;
    const updated: ProductReview = {
      ...review,
      reply: {
        id: `rep-${Date.now()}`,
        author: 'StyleWise 공식 담당자',
        content: reviewReplyText.trim(),
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    };
    onUpdateReview(updated);
    setReplyingReviewId(null);
    setReviewReplyText('');
    onSuccess('공식 답글이 성공적으로 등록되었습니다.');
  };

  // AI Quick Inquiry Answer Templates
  const handleApplyInquiryAiTemplate = (inquiry: CustomerInquiry, templateType: string) => {
    let text = '';
    const name = inquiry.userName || '고객';
    switch (templateType) {
      case 'size':
        text = `안녕하세요 ${name} 고객님! StyleWise 스타일 컨설턴트입니다. 문의주신 상품은 정사이즈 기준 세미 오버핏 실루엣으로 디자인되었습니다. 넉넉하고 편안한 핏을 선호하시면 한 치수 여유 있게 선택하시고, 슬림한 실루엣을 원하시면 평소 착용하시는 정사이즈를 추천해 드립니다. 추가적인 실측 상담이 필요하시면 언제든 편하게 문의해주세요!`;
        break;
      case 'shipping':
        text = `안녕하세요 ${name} 고객님, 배송 전담팀입니다. 결제 완료된 주문은 서울/수도권 당일 CJ대한통운으로 즉시 안전 출고되며, 출고 후 1~2영업일 이내 수령 가능하십니다. 송장 번호가 등록되는 즉시 [내 주문/배송조회] 메뉴에서 실시간 위치를 확인하실 수 있습니다.`;
        break;
      case 'refund':
        text = `안녕하세요 ${name} 고객님, 교환/반품 담당자입니다. 상품 수령 후 7일 이내에 미착용 및 택(Tag) 미제거 상태인 경우 무료 사이즈 교환 또는 반품 접수가 가능합니다. 마이페이지에서 교환 접수해주시면 지정 택배사 기사님께서 1~2일 내로 방문 수거 예정입니다.`;
        break;
      case 'restock':
        text = `안녕하세요 ${name} 고객님! 제품에 관심 가져주셔서 진심으로 감사드립니다. 문의주신 컬러 및 품절 옵션은 현재 생산 공장에서 추가 리오더 작업 중에 있으며, 다음 주 초 입고 예정입니다. 입고 즉시 알림을 원하시면 입고 알림 신청을 이용해 주시기 바랍니다.`;
        break;
      default:
        text = `안녕하세요 ${name} 고객님, StyleWise 고객만족센터입니다. 문의주신 내용 확인하였으며 신속하게 도움 드리겠습니다.`;
    }
    setInquiryAnswerText(text);
  };

  // Submit Inquiry Answer
  const handleSubmitInquiryAnswer = (inquiry: CustomerInquiry) => {
    if (!inquiryAnswerText.trim()) return;
    const updated: CustomerInquiry = {
      ...inquiry,
      status: 'answered',
      answer: {
        answeredBy: 'StyleWise 공식 CS팀',
        content: inquiryAnswerText.trim(),
        answeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      },
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    onUpdateInquiry(updated);
    setReplyingInquiryId(null);
    setInquiryAnswerText('');
    onSuccess(`[${inquiry.title}] 문의 답변이 등록 완료되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                상품 리뷰 & Q&A 고객 문의 센터
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-full">
                CS & 커뮤니티 관리
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              고객이 남긴 실착 구매 후기, 포토 리뷰와 1:1 Q&A 문의를 실시간 검수하고 AI 스마트 답변을 작성합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>평균 만족도 <b>{avgRating}</b> / 5.0</span>
            </span>
            {waitingInquiriesCount > 0 && (
              <span className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>답변 대기 <b>{waitingInquiriesCount}</b>건</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={() => setActiveSubTab('reviews')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'reviews'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>상품 구매 리뷰 ({reviews.length}개)</span>
            {unrepliedReviewsCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-neutral-950 rounded-full font-bold">
                미답변 {unrepliedReviewsCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'inquiries'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>1:1 고객 Q&A 문의 ({inquiries.length}건)</span>
            {waitingInquiriesCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 bg-rose-500 text-white rounded-full font-bold">
                대기 {waitingInquiriesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. PRODUCT REVIEWS SUB-TAB */}
      {/* ======================================================== */}
      {activeSubTab === 'reviews' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">총 누적 리뷰</div>
              <div className="text-xl font-black text-neutral-900 mt-0.5">{reviews.length}개</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">포토 리뷰 {photoReviewsCount}개 ({reviews.length > 0 ? Math.round((photoReviewsCount/reviews.length)*100) : 0}%)</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">평균 고객 평점</div>
              <div className="text-xl font-black text-amber-500 flex items-center gap-1.5 mt-0.5">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{avgRating}</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-semibold mt-1">5점 만점 기준</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">베스트 리뷰 선정</div>
              <div className="text-xl font-black text-neutral-900 mt-0.5">{bestReviewsCount}개</div>
              <div className="text-[10px] text-amber-600 font-semibold mt-1">메인/상세 상단 노출</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">AI 감성 분석 긍정률</div>
              <div className="text-xl font-black text-emerald-600 flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-4 h-4" />
                <span>96.4%</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-semibold mt-1">#핏좋음 #고급스러움 #부드러움</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewRatingFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewRatingFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                전체 ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setReviewRatingFilter('5')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewRatingFilter === '5' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ⭐ 5점 ({reviews.filter(r => r.rating === 5).length})
              </button>
              <button
                type="button"
                onClick={() => setReviewRatingFilter('best')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewRatingFilter === 'best' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                👑 베스트 ({bestReviewsCount})
              </button>
              <button
                type="button"
                onClick={() => setReviewRatingFilter('unreplied')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reviewRatingFilter === 'unreplied' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                미답변 ({unrepliedReviewsCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="상품명, 고객명, 리뷰내용 검색..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-500 text-xs">
                조건에 맞는 상품 리뷰가 없습니다.
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div 
                  key={review.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-xs space-y-4 ${
                    review.status === 'hidden' ? 'opacity-60 bg-neutral-50 border-neutral-200' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      {review.productImageUrl && (
                        <img 
                          src={review.productImageUrl} 
                          alt="" 
                          className="w-10 h-10 object-cover rounded-xl border border-neutral-200" 
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-neutral-900">{review.productName}</span>
                          {review.isBest && (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-amber-400 text-neutral-950 rounded-md">
                              BEST REVIEW
                            </span>
                          )}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            review.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            {review.status === 'published' ? '쇼핑몰 노출중' : '숨김 처리됨'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-500">
                          <span>작성자: <b>{review.userName}</b> ({review.userEmail})</span>
                          <span>·</span>
                          <span className="text-neutral-400">{review.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stars & Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400' : 'text-neutral-200'}`} 
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleBestReview(review)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                          review.isBest 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                        }`}
                      >
                        {review.isBest ? '★ 베스트 해제' : '☆ 베스트 선정'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleReviewStatus(review)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
                        title={review.status === 'published' ? '리뷰 숨기기' : '리뷰 공개하기'}
                      >
                        {review.status === 'published' ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-rose-500" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteReview(review.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="리뷰 영구 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content & Image */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {review.imageUrl && (
                      <div className="sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-neutral-200 relative group">
                        <img 
                          src={review.imageUrl} 
                          alt="고객 착용샷" 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1.5 py-0.5 bg-black/60 text-white rounded">
                          포토 리뷰
                        </span>
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      {/* Size & Color Feedback Pills */}
                      {(review.sizeFeedback || review.colorFeedback) && (
                        <div className="flex items-center gap-2 text-[11px]">
                          {review.sizeFeedback && (
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-semibold">
                              사이즈감: <b className="text-neutral-900">{review.sizeFeedback}</b>
                            </span>
                          )}
                          {review.colorFeedback && (
                            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md font-semibold">
                              색상: <b className="text-neutral-900">{review.colorFeedback}</b>
                            </span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
                        {review.content}
                      </p>
                    </div>
                  </div>

                  {/* Reply Section */}
                  {review.reply ? (
                    <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-500">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                          <CornerDownRight className="w-3.5 h-3.5 text-amber-500" />
                          <span>{review.reply.author} 공식 답변</span>
                        </div>
                        <span>{review.reply.createdAt}</span>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed pl-5">
                        {review.reply.content}
                      </p>
                      <div className="pl-5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(review.id);
                            setReviewReplyText(review.reply?.content || '');
                          }}
                          className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                        >
                          답변 내용 수정하기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {replyingReviewId === review.id ? (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-950">공식 브랜드 답글 작성</span>
                            <button
                              type="button"
                              onClick={() => handleGenerateAiReviewReply(review)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[11px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                            >
                              <Wand2 className="w-3 h-3" />
                              <span>AI 스마트 답글 추천</span>
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            placeholder="고객님께 전할 정성스러운 감사 및 안내 메시지를 입력하세요..."
                            value={reviewReplyText}
                            onChange={(e) => setReviewReplyText(e.target.value)}
                            className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingReviewId(null)}
                              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitReviewReply(review)}
                              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              답글 등록하기
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(review.id);
                            setReviewReplyText('');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5 text-amber-600" />
                          <span>공식 답글 달기</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CUSTOMER INQUIRIES Q&A SUB-TAB */}
      {/* ======================================================== */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">전체 문의 접수</div>
              <div className="text-xl font-black text-neutral-900 mt-0.5">{inquiries.length}건</div>
              <div className="text-[10px] text-neutral-500 mt-1">최근 30일 기준</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">답변 대기 (처리필요)</div>
              <div className="text-xl font-black text-rose-600 mt-0.5">{waitingInquiriesCount}건</div>
              <div className="text-[10px] text-rose-500 font-semibold mt-1">신속한 답변 필요</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">답변 완료율</div>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                {inquiries.length > 0 ? Math.round((answeredInquiriesCount / inquiries.length) * 100) : 0}%
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">총 {answeredInquiriesCount}건 해결</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="text-[11px] font-bold text-neutral-400">평균 답변 소요시간</div>
              <div className="text-xl font-black text-neutral-900 mt-0.5">1.8시간</div>
              <div className="text-[10px] text-neutral-500 mt-1">AI 도우미 활용 가속화</div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inquiryStatusFilter === 'all' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                전체 ({inquiries.length})
              </button>
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('waiting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inquiryStatusFilter === 'waiting' ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                답변 대기 ({waitingInquiriesCount})
              </button>
              <button
                type="button"
                onClick={() => setInquiryStatusFilter('answered')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  inquiryStatusFilter === 'answered' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                답변 완료 ({answeredInquiriesCount})
              </button>

              <select
                value={inquiryTypeFilter}
                onChange={(e) => setInquiryTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700"
              >
                <option value="all">모든 문의 유형</option>
                <option value="size">사이즈/실측</option>
                <option value="shipping">배송/출고</option>
                <option value="refund">교환/반품</option>
                <option value="product">상품/재입고</option>
                <option value="other">기타 문의</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="제목, 질문내용, 작성자 검색..."
                value={inquirySearch}
                onChange={(e) => setInquirySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Inquiries List */}
          <div className="space-y-4">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-500 text-xs">
                조회된 1:1 고객 문의가 없습니다.
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-white rounded-2xl border border-neutral-200 hover:border-neutral-300 p-5 shadow-xs transition-all space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        inquiry.status === 'waiting'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {inquiry.status === 'waiting' ? '답변 대기' : '답변 완료'}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded-md">
                        {inquiry.type === 'size' && '사이즈/실측'}
                        {inquiry.type === 'shipping' && '배송/출고'}
                        {inquiry.type === 'refund' && '교환/환불'}
                        {inquiry.type === 'product' && '상품/재입고'}
                        {inquiry.type === 'other' && '기타 문의'}
                      </span>

                      {inquiry.isSecret && (
                        <span className="text-[10px] font-semibold text-neutral-500 flex items-center gap-0.5">
                          <Lock className="w-3 h-3 text-neutral-400" /> 비밀글
                        </span>
                      )}

                      {inquiry.productName && (
                        <span className="text-xs font-bold text-neutral-800 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                          관련 상품: {inquiry.productName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <span>작성자: <b>{inquiry.userName}</b> ({inquiry.userEmail})</span>
                      <span>·</span>
                      <span>{inquiry.createdAt}</span>
                      <button
                        type="button"
                        onClick={() => onDeleteInquiry(inquiry.id)}
                        className="p-1 text-neutral-300 hover:text-rose-600 rounded cursor-pointer"
                        title="문의 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-neutral-900">{inquiry.title}</h4>
                    <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                      {inquiry.content}
                    </p>
                  </div>

                  {/* Answer Section */}
                  {inquiry.answer ? (
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-emerald-900">
                        <div className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{inquiry.answer.answeredBy} 답변</span>
                        </div>
                        <span className="text-emerald-700">{inquiry.answer.answeredAt}</span>
                      </div>
                      <p className="text-xs text-neutral-800 leading-relaxed pl-5 whitespace-pre-line">
                        {inquiry.answer.content}
                      </p>
                      <div className="pl-5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingInquiryId(inquiry.id);
                            setInquiryAnswerText(inquiry.answer?.content || '');
                          }}
                          className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                        >
                          답변 수정하기
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {replyingInquiryId === inquiry.id ? (
                        <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-purple-950">
                              고객 문의 1:1 전용 답변 작성
                            </span>

                            {/* Quick AI Template Buttons */}
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-purple-700 font-semibold">AI 템플릿:</span>
                              <button
                                type="button"
                                onClick={() => handleApplyInquiryAiTemplate(inquiry, 'size')}
                                className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-bold cursor-pointer"
                              >
                                사이즈
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyInquiryAiTemplate(inquiry, 'shipping')}
                                className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-bold cursor-pointer"
                              >
                                당일배송
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyInquiryAiTemplate(inquiry, 'refund')}
                                className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-bold cursor-pointer"
                              >
                                교환/환불
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApplyInquiryAiTemplate(inquiry, 'restock')}
                                className="px-2 py-0.5 bg-white hover:bg-purple-100 text-purple-900 border border-purple-200 rounded font-bold cursor-pointer"
                              >
                                재입고
                              </button>
                            </div>
                          </div>

                          <textarea
                            rows={4}
                            placeholder="고객님께 안내해 드릴 답변을 친절하고 명확하게 작성하세요..."
                            value={inquiryAnswerText}
                            onChange={(e) => setInquiryAnswerText(e.target.value)}
                            className="w-full p-3 bg-white border border-neutral-200 rounded-xl text-xs leading-relaxed"
                          />

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setReplyingInquiryId(null)}
                              className="px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitInquiryAnswer(inquiry)}
                              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                            >
                              답변 등록 완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingInquiryId(inquiry.id);
                            setInquiryAnswerText('');
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>답변 작성하기</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
