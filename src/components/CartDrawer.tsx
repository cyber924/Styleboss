import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 50000 || items.length === 0 ? 0 : 3000;
  const totalPrice = subtotal + shippingFee;

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg">장바구니 ({items.length})</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-neutral-400">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-300">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-neutral-700">장바구니가 비어 있습니다.</p>
              <p className="text-xs text-neutral-500">원하는 상품을 담아 쇼핑을 계속해 보세요.</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-neutral-900 text-white text-xs font-bold rounded-lg"
              >
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-20 object-cover rounded-xl shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="font-bold text-xs text-neutral-900 truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs font-extrabold text-neutral-900">
                    {(item.product.price * item.quantity).toLocaleString()}원
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center border border-neutral-300 rounded-lg bg-white">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 text-neutral-500 hover:text-neutral-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 text-neutral-500 hover:text-neutral-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.product.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>상품 금액</span>
                <span className="font-medium text-neutral-900">{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span>배송비 (5만원 이상 무료)</span>
                <span className="font-medium text-neutral-900">
                  {shippingFee === 0 ? '무료' : `${shippingFee.toLocaleString()}원`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>총 결제금액</span>
                <span className="text-base font-extrabold text-amber-700">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>

            <button
              id="checkout-btn"
              type="button"
              onClick={onCheckout}
              className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>주문하기 ({items.length}개)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
