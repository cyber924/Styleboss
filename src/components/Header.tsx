import React from 'react';
import { 
  Shirt, 
  Search, 
  Sparkles, 
  ShoppingCart, 
  User, 
  LogIn, 
  LogOut, 
  Sliders, 
  Database,
  Flame,
  Bot,
  Layers,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Package
} from 'lucide-react';
import type { UserProfile, ProductCategory } from '../types';
import { isAdminUser } from '../lib/authUtils';

interface HeaderProps {
  user: UserProfile | null;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenCart: () => void;
  cartCount: number;
  firebaseStatus: 'connected' | 'custom' | 'connecting';
  onScrollToStylist: () => void;
  onOpenAdmin: () => void;
  onOpenMyOrders: () => void;
}

export function Header({
  user,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenAuth,
  onLogout,
  onOpenFirebaseConfig,
  onOpenCart,
  cartCount,
  firebaseStatus,
  onScrollToStylist,
  onOpenAdmin,
  onOpenMyOrders,
}: HeaderProps) {
  const isUserAdmin = isAdminUser(user);
  const navItems = [
    { id: 'all', label: '전체' },
    { id: 'latest', label: '최신' },
    { id: 'popular', label: '인기' },
    { id: 'hot', label: '🔥 핫아이템' },
    { id: 'ai', label: '✨ AI 상품' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onSelectCategory('all'); }}
            className="flex items-center gap-2 group cursor-pointer shrink-0"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Shirt className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5 whitespace-nowrap">
                StyleWise <span className="text-amber-600 font-black">AI</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-medium tracking-wide uppercase whitespace-nowrap">Fashion & AI Stylist</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-neutral-200 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectCategory(item.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeCategory === item.id 
                    ? 'bg-neutral-900 text-white shadow-xs' 
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              onClick={onScrollToStylist}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer ml-1 whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI 스타일리스트</span>
            </button>
            {isUserAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-xs ml-1 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>관리자 센터</span>
              </button>
            )}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end min-w-0">
          {/* Admin shortcut button on mobile/tablet */}
          {isUserAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="lg:hidden p-2 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
              title="관리자 센터"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">관리자</span>
            </button>
          )}

          {/* My Orders Button (Customer Order & Delivery Tracking) */}
          {user && (
            <button
              id="header-my-orders-btn"
              type="button"
              onClick={onOpenMyOrders}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="내 주문 & 실시간 배송 조회"
            >
              <Package className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="hidden sm:inline">주문/배송조회</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            id="header-cart-btn"
            type="button"
            onClick={onOpenCart}
            className="relative p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="장바구니"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Auth Section - Clean, perfectly spaced and guaranteed no text wrapping */}
          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex flex-col text-right shrink-0">
                <span className="text-xs font-bold text-neutral-900 truncate max-w-[130px] whitespace-nowrap">
                  {user.displayName || user.email?.split('@')[0] || '사용자'}님
                </span>
                <span className="text-[10px] text-emerald-600 font-medium whitespace-nowrap">로그인됨</span>
              </div>
              <button
                id="header-logout-btn"
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                id="header-login-btn"
                type="button"
                onClick={() => onOpenAuth('login')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="whitespace-nowrap">로그인</span>
              </button>
              <button
                id="header-signup-btn"
                type="button"
                onClick={() => onOpenAuth('signup')}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-neutral-800 hover:text-neutral-950 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-lg transition-all shadow-2xs cursor-pointer shrink-0 whitespace-nowrap"
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                <span className="whitespace-nowrap">회원가입</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Category Scroll Bar */}
      <div className="lg:hidden flex items-center space-x-2 px-4 py-2 border-t border-neutral-100 overflow-x-auto scrollbar-none bg-white">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectCategory(item.id)}
            className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full transition-colors shrink-0 ${
              activeCategory === item.id 
                ? 'bg-neutral-900 text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={onScrollToStylist}
          className="whitespace-nowrap px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3 h-3 shrink-0" />
          <span>AI 스타일리스트</span>
        </button>
      </div>
    </header>
  );
}
