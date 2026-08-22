import React, { useState, useRef } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ExternalLink,
  Filter,
  FileText,
  User,
  MapPin,
  CreditCard,
  Send,
  XCircle,
  RefreshCw,
  Eye,
  Check,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { exportOrdersToCsv, parseTrackingCsv } from '../../lib/csvUtils';

interface AdminOrderManageTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string, courierCompany?: string) => void;
  onSuccess: (msg: string) => void;
}

const STATUS_MAP: Record<OrderStatus, { label: string; bg: string; text: string; icon: any }> = {
  pending: { label: '입금 대기', bg: 'bg-neutral-100', text: 'text-neutral-700', icon: Clock },
  paid: { label: '결제 완료', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: CheckCircle2 },
  preparing: { label: '배송 준비중', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: Package },
  shipping: { label: '배송중', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Truck },
  delivered: { label: '배송 완료', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Check },
  cancelled: { label: '주문 취소', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', icon: XCircle },
  refunded: { label: '환불 완료', bg: 'bg-neutral-100', text: 'text-neutral-600', icon: AlertCircle },
};

const COURIER_OPTIONS = ['CJ대한통운', '우체국택배', '한진택배', '로젠택배', '롯데택배'];

export function AdminOrderManageTab({
  orders,
  onUpdateOrderStatus,
  onSuccess,
}: AdminOrderManageTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const trackingFileInputRef = useRef<HTMLInputElement>(null);
  
  // Tracking modal / input
  const [shippingModalOrder, setShippingModalOrder] = useState<Order | null>(null);
  const [courier, setCourier] = useState('CJ대한통운');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Export orders to CSV (발주서 / 배송 리스트 다운로드)
  const handleExportOrdersCsv = () => {
    exportOrdersToCsv(orders);
    onSuccess(`주문/배송 내역 전체(${orders.length}건) 엑셀(CSV) 다운로드가 시작되었습니다.`);
  };

  // Trigger Bulk Tracking Upload
  const handleTriggerTrackingUpload = () => {
    if (trackingFileInputRef.current) {
      trackingFileInputRef.current.value = '';
      trackingFileInputRef.current.click();
    }
  };

  // Parse & Apply Bulk Tracking CSV
  const handleTrackingCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        alert('파일을 읽는 중 문제가 발생했습니다.');
        return;
      }

      const { updates, errorCount } = parseTrackingCsv(text);
      if (updates.length === 0) {
        alert('유효한 송장 데이터를 찾지 못했습니다. CSV 형식(주문번호, 택배사, 운송장번호)을 확인해주세요.');
        return;
      }

      let successCount = 0;
      updates.forEach(u => {
        const matched = orders.find(o => o.orderNumber === u.orderNumber || o.id === u.orderNumber);
        if (matched) {
          onUpdateOrderStatus(matched.id, 'shipping', u.trackingNumber, u.courierCompany);
          successCount++;
        }
      });

      if (successCount > 0) {
        onSuccess(`송장 대량 등록 완료: ${successCount}건의 주문이 [배송중]으로 자동 변경되었습니다.${errorCount > 0 ? ` (${errorCount}건 스킵)` : ''}`);
      } else {
        alert(`일치하는 주문번호를 찾지 못했습니다. (업로드 시도: ${updates.length}건)`);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleOpenShippingModal = (order: Order) => {
    setShippingModalOrder(order);
    setCourier(order.courierCompany || 'CJ대한통운');
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingModalOrder) return;
    if (!trackingNumber.trim()) {
      alert('운송장 번호를 입력해주세요.');
      return;
    }
    onUpdateOrderStatus(shippingModalOrder.id, 'shipping', trackingNumber, courier);
    setShippingModalOrder(null);
    onSuccess(`주문번호 [${shippingModalOrder.orderNumber}]의 송장 정보가 등록되고 [배송중] 처리되었습니다.`);
  };

  const handleQuickStatusChange = (orderId: string, status: OrderStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    onUpdateOrderStatus(orderId, status);
    onSuccess(`[${target.orderNumber}] 주문 상태가 [${STATUS_MAP[status].label}](으)로 변경되었습니다.`);
  };

  // Stats calculation
  const totalRevenue = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((acc, o) => acc + o.finalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'paid' || o.status === 'preparing').length;
  const shippingCount = orders.filter(o => o.status === 'shipping').length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">주문 & 결제 / 배송 관리 센터</h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                실시간 {orders.length}건
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              고객 주문 상태 변경, 운송장 번호 등록 및 배송 현황을 실시간으로 관리합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden File Input for Bulk Tracking CSV */}
            <input
              type="file"
              ref={trackingFileInputRef}
              onChange={handleTrackingCsvChange}
              accept=".csv,text/csv"
              className="hidden"
            />

            {/* Export Orders CSV */}
            <button
              type="button"
              onClick={handleExportOrdersCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="발주서 및 전체 주문 내역을 엑셀(CSV) 파일로 다운로드합니다."
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>주문서 다운로드(CSV)</span>
            </button>

            {/* Import Tracking CSV */}
            <button
              type="button"
              onClick={handleTriggerTrackingUpload}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="택배사에서 받은 운송장 번호 CSV를 업로드하여 배송중 상태로 일괄 변경합니다."
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>송장 일괄 등록(CSV)</span>
            </button>
          </div>
        </div>

        {/* 4-KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[11px] font-bold text-neutral-500 uppercase">누적 총 결제액</span>
            <div className="text-lg font-black text-neutral-900 mt-1">₩ {totalRevenue.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-700 uppercase">배송 처리 대기</span>
            <div className="text-lg font-black text-amber-950 mt-1">{pendingCount} 건</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80">
            <span className="text-[11px] font-bold text-purple-700 uppercase">현재 배송 진행중</span>
            <div className="text-lg font-black text-purple-950 mt-1">{shippingCount} 건</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">배송 완료</span>
            <div className="text-lg font-black text-emerald-950 mt-1">{deliveredCount} 건</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: '전체 보기' },
            { id: 'paid', label: '결제완료' },
            { id: 'preparing', label: '배송준비' },
            { id: 'shipping', label: '배송중' },
            { id: 'delivered', label: '배송완료' },
            { id: 'cancelled', label: '취소/환불' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="주문번호, 고객명, 상품명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/80 border-b border-neutral-200 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">주문번호 / 일시</th>
                <th className="py-3.5 px-4">주문자 정보</th>
                <th className="py-3.5 px-4">주문 상품</th>
                <th className="py-3.5 px-4 text-right">총 결제금액</th>
                <th className="py-3.5 px-4 text-center">진행 상태</th>
                <th className="py-3.5 px-4 text-right">배송 & 상태 처리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    일치하는 주문 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusConf = STATUS_MAP[order.status] || STATUS_MAP.pending;
                  const StatusIcon = statusConf.icon;
                  const firstItem = order.items[0];
                  const otherCount = order.items.length - 1;

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                      {/* Order Number & Date */}
                      <td className="py-4 px-4 align-top">
                        <span className="font-mono font-bold text-neutral-900 block">{order.orderNumber}</span>
                        <span className="text-[11px] text-neutral-400 mt-0.5 block">{order.createdAt}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="mt-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>주문상세 보기</span>
                        </button>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-neutral-900">{order.userName}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{order.userEmail}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{order.userPhone}</div>
                      </td>

                      {/* Item Summary */}
                      <td className="py-4 px-4 align-top">
                        {firstItem && (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={firstItem.imageUrl}
                              alt={firstItem.productName}
                              className="w-10 h-12 object-cover rounded-lg border border-neutral-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-neutral-800 line-clamp-1">
                                {firstItem.productName}
                                {otherCount > 0 && <span className="text-amber-600 font-semibold ml-1">외 {otherCount}건</span>}
                              </div>
                              <div className="text-[11px] text-neutral-500 mt-0.5">
                                {firstItem.size && <span>사이즈: {firstItem.size} / </span>}
                                {firstItem.quantity}개
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="font-black text-neutral-900">
                          ₩ {order.finalAmount.toLocaleString()}
                        </div>
                        {order.discountAmount && order.discountAmount > 0 ? (
                          <span className="text-[10px] text-rose-500 block">
                            (-{order.discountAmount.toLocaleString()}원 할인)
                          </span>
                        ) : null}
                        <span className="text-[10px] text-neutral-400 block mt-0.5 uppercase">
                          {order.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 align-top text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConf.bg} ${statusConf.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConf.label}</span>
                        </span>
                        {order.trackingNumber && (
                          <div className="text-[10px] text-neutral-500 font-mono mt-1">
                            {order.courierCompany} {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {order.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.id, 'preparing')}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              배송 준비로 변경
                            </button>
                          )}

                          {(order.status === 'preparing' || order.status === 'paid') && (
                            <button
                              type="button"
                              onClick={() => handleOpenShippingModal(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Truck className="w-3 h-3" />
                              <span>송장 등록</span>
                            </button>
                          )}

                          {order.status === 'shipping' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatusChange(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              배송완료 처리
                            </button>
                          )}

                          <select
                            value={order.status}
                            onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                            className="px-2 py-1 text-[11px] bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700 font-semibold cursor-pointer"
                          >
                            <option value="pending">입금대기</option>
                            <option value="paid">결제완료</option>
                            <option value="preparing">배송준비</option>
                            <option value="shipping">배송중</option>
                            <option value="delivered">배송완료</option>
                            <option value="cancelled">주문취소</option>
                            <option value="refunded">환불완료</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipping / Tracking Number Register Modal */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">운송장 등록 및 배송 시작</h3>
                  <p className="text-[11px] text-neutral-500">주문번호: {shippingModalOrder.orderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModalOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShipping} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">택배사 선택</label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-semibold"
                >
                  {COURIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">운송장 번호 입력</label>
                <input
                  type="text"
                  required
                  placeholder="예: 682910394851 (숫자만 입력)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 border border-purple-200">
                💡 운송장을 저장하면 고객에게 실시간 배송 추적 정보가 업데이트되며 주문 상태가 <b>[배송중]</b>으로 자동 변경됩니다.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShippingModalOrder(null)}
                  className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  배송 시작 처리
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">주문 상세 내역</h3>
                  <span className="font-mono text-xs font-bold text-amber-600">{selectedOrder.orderNumber}</span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">주문 일시: {selectedOrder.createdAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              {/* Receiver Info */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>배송지 및 수령자 정보</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1 text-neutral-700">
                  <div><span className="text-neutral-400">수령인:</span> {selectedOrder.userName} ({selectedOrder.userPhone})</div>
                  <div><span className="text-neutral-400">이메일:</span> {selectedOrder.userEmail}</div>
                  <div className="col-span-2"><span className="text-neutral-400">배송 주소:</span> {selectedOrder.shippingAddress}</div>
                  {selectedOrder.shippingMemo && (
                    <div className="col-span-2"><span className="text-neutral-400">배송 메모:</span> {selectedOrder.shippingMemo}</div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-neutral-900 mb-2">주문 품목 목록 ({selectedOrder.items.length}개)</h4>
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.productName} className="w-12 h-14 object-cover rounded-lg border border-neutral-200" />
                        <div>
                          <div className="font-bold text-neutral-900">{item.productName}</div>
                          <div className="text-neutral-500 text-[11px] mt-0.5">
                            {item.color && <span>색상: {item.color} | </span>}
                            {item.size && <span>사이즈: {item.size} | </span>}
                            수량: {item.quantity}개
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-neutral-900">
                        ₩ {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-neutral-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block">결제 수단: {selectedOrder.paymentMethod}</span>
                  <span className="text-xs font-bold text-amber-400">최종 결제 금액</span>
                </div>
                <div className="text-xl font-black">
                  ₩ {selectedOrder.finalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
