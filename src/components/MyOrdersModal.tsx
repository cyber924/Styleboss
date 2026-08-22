import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  X, 
  ShoppingBag,
  RotateCcw,
  MapPin,
  Calendar,
  CreditCard,
  Phone,
  FileText
} from 'lucide-react';
import type { Order, OrderStatus } from '../types';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  userEmail: string;
  onCancelOrderRequest?: (orderId: string) => void;
  onExploreShopping: () => void;
}

export function MyOrdersModal({
  isOpen,
  onClose,
  orders,
  userEmail,
  onCancelOrderRequest,
  onExploreShopping,
}: MyOrdersModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'shipping' | 'completed'>('all');

  if (!isOpen) return null;

  // Filter orders for the logged in user
  const userOrders = orders.filter(
    o => o.userEmail?.toLowerCase() === userEmail.toLowerCase()
  );

  const filteredOrders = userOrders.filter(order => {
    if (activeFilter === 'shipping') {
      return order.status === 'paid' || order.status === 'preparing' || order.status === 'shipping';
    }
    if (activeFilter === 'completed') {
      return order.status === 'delivered';
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-bold bg-neutral-100 text-neutral-700 rounded-full">입금 대기</span>;
      case 'paid':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">결제 완료</span>;
      case 'preparing':
        return <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">상품 준비중</span>;
      case 'shipping':
        return <span className="px-2.5 py-1 text-xs font-bold bg-purple-100 text-purple-800 rounded-full animate-pulse flex items-center gap-1">
          <Truck className="w-3 h-3" /> 배송중
        </span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> 배송 완료
        </span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-800 rounded-full">주문 취소</span>;
      case 'refunded':
        return <span className="px-2.5 py-1 text-xs font-bold bg-neutral-200 text-neutral-800 rounded-full">환불 완료</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-neutral-100 text-neutral-600 rounded-full">{status}</span>;
    }
  };

  const getTrackingUrl = (courier?: string, trackingNumber?: string) => {
    if (!trackingNumber) return '#';
    // Provide CJ logistics or universal tracking portal URL
    return `https://tracker.delivery/#/${courier === '우체국택배' ? 'kr.epost' : 'kr.cjlogistics'}/${trackingNumber.replace(/-/g, '')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div 
        id="my-orders-modal"
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden my-auto flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-neutral-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">내 주문 & 실시간 배송 조회</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  {userOrders.length}건
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                로그인 계정({userEmail})으로 결제된 최근 주문 내역과 실시간 배송 현황입니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Navigation */}
        <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            전체 주문 ({userOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('shipping')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'shipping'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            배송 진행중 ({userOrders.filter(o => o.status === 'paid' || o.status === 'preparing' || o.status === 'shipping').length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-200 border border-neutral-200'
            }`}
          >
            배송 완료 ({userOrders.filter(o => o.status === 'delivered').length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-3xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-800">조회된 주문 내역이 없습니다</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  StyleWise의 다양한 2026 시즌 신상 의류와 AI 추천 코디 상품을 쇼핑해보세요.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreShopping();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <span>쇼핑하러 가기</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-all space-y-4"
              >
                {/* Order Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.createdAt}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl border border-neutral-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400 shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{item.productName}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            옵션: <span className="font-semibold text-neutral-700">{item.size || 'Free'}</span> / <span className="font-semibold text-neutral-700">{item.color || 'Standard'}</span> · 수량: <b>{item.quantity}</b>개
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-neutral-900">
                          ₩ {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Tracking Bar (if shipping or delivered) */}
                {(order.status === 'shipping' || order.status === 'delivered') && order.trackingNumber && (
                  <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-950">
                          <span>{order.courierCompany || 'CJ대한통운'}</span>
                          <span className="font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                            {order.trackingNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-700 mt-0.5">
                          {order.status === 'shipping' ? '상품이 안전하게 배송 중입니다.' : '배송이 안전하게 완료되었습니다.'}
                        </p>
                      </div>
                    </div>

                    <a
                      href={getTrackingUrl(order.courierCompany, order.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      <span>실시간 배송조회</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Order Footer & Price Summary */}
                <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-neutral-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate max-w-xs">{order.shippingAddress || '기본 등록 배송지'}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="text-right">
                      <span className="text-neutral-500 text-[11px]">총 결제금액: </span>
                      <span className="text-sm font-black text-amber-600">
                        ₩ {order.finalAmount.toLocaleString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-neutral-500" />
                      <span>주문 상세정보</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0 text-xs text-neutral-500">
          <span>배송 관련 문의사항은 고객센터 1588-0000으로 연락바랍니다.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>

      {/* Individual Order Detail Sub-Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-neutral-900 text-sm">주문 상세 영수증 & 배송 정보</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Order Basic Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">주문번호:</span>
                <span className="font-mono font-bold text-neutral-900">{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">주문일시:</span>
                <span className="text-neutral-900 font-semibold">{selectedOrder.createdAt}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">주문상태:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">받는 분:</span>
                <span className="text-neutral-900 font-bold">{selectedOrder.userName} ({selectedOrder.userPhone || '010-****-****'})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-100">
                <span className="text-neutral-500">배송지 주소:</span>
                <span className="text-neutral-900 font-semibold text-right max-w-xs">{selectedOrder.shippingAddress}</span>
              </div>
            </div>

            {/* Ordered Items */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-neutral-700 mb-2">주문 상품 내역</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <img src={item.imageUrl} alt="" className="w-9 h-9 object-cover rounded-lg" />
                      <div>
                        <p className="font-bold text-neutral-900">{item.productName}</p>
                        <p className="text-[10px] text-neutral-500">{item.size || 'Free'} / {item.color || 'Standard'} · {item.quantity}개</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">₩ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-3 bg-neutral-900 text-white rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>상품 주문금액:</span>
                <span>₩ {selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>할인 금액:</span>
                  <span>- ₩ {selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-300">
                <span>배송비:</span>
                <span>{selectedOrder.totalAmount >= 50000 ? '무료배송' : '₩ 3,000'}</span>
              </div>
              <div className="pt-1.5 border-t border-neutral-700 flex justify-between font-black text-sm text-amber-400">
                <span>최종 결제금액:</span>
                <span>₩ {selectedOrder.finalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                창 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
