import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusSquare, 
  ClipboardList, 
  Bot, 
  TrendingUp, 
  Store, 
  Shirt, 
  LogOut, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Zap,
  Package,
  Users,
  Tag,
  MessageSquareText,
  Database
} from 'lucide-react';
import type { Product, UserProfile, Order, OrderStatus, Coupon, PromotionBanner, ProductReview, CustomerInquiry } from '../../types';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminProductRegisterTab } from './AdminProductRegisterTab';
import { AdminProductManageTab } from './AdminProductManageTab';
import { AdminAiPlannerTab } from './AdminAiPlannerTab';
import { AdminAiBulkRegisterTab } from './AdminAiBulkRegisterTab';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import { AdminOrderManageTab } from './AdminOrderManageTab';
import { AdminUserManageTab } from './AdminUserManageTab';
import { AdminPromotionTab } from './AdminPromotionTab';
import { AdminReviewCsTab } from './AdminReviewCsTab';

interface AdminCenterProps {
  user: UserProfile | null;
  products: Product[];
  orders: Order[];
  users: UserProfile[];
  coupons: Coupon[];
  banners: PromotionBanner[];
  reviews: ProductReview[];
  inquiries: CustomerInquiry[];
  firebaseStatus?: 'connected' | 'custom' | 'connecting';
  onOpenFirebaseConfig?: () => void;
  onAddProduct: (newProduct: Product) => void;
  onAddBatchProducts: (batch: Product[]) => void;
  onUpdateProduct: (updated: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, trackingNumber?: string, courierCompany?: string) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onAddUser: (newUser: UserProfile) => void;
  onUpdateCoupon: (updatedCoupon: Coupon) => void;
  onAddCoupon: (newCoupon: Coupon) => void;
  onDeleteCoupon: (couponId: string) => void;
  onUpdateBanner: (updatedBanner: PromotionBanner) => void;
  onAddBanner: (newBanner: PromotionBanner) => void;
  onDeleteBanner: (bannerId: string) => void;
  onUpdateReview: (updatedReview: ProductReview) => void;
  onDeleteReview: (reviewId: string) => void;
  onUpdateInquiry: (updatedInquiry: CustomerInquiry) => void;
  onDeleteInquiry: (inquiryId: string) => void;
  onCloseAdmin: () => void;
  onLogout: () => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export function AdminCenter({
  user,
  products,
  orders,
  users,
  coupons,
  banners,
  reviews,
  inquiries,
  firebaseStatus = 'connected',
  onOpenFirebaseConfig,
  onAddProduct,
  onAddBatchProducts,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  onUpdateOrderStatus,
  onUpdateUser,
  onAddUser,
  onUpdateCoupon,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateBanner,
  onAddBanner,
  onDeleteBanner,
  onUpdateReview,
  onDeleteReview,
  onUpdateInquiry,
  onDeleteInquiry,
  onCloseAdmin,
  onLogout,
  onShowToast,
}: AdminCenterProps) {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'orders' | 'users' | 'reviews-cs' | 'promotions' | 'bulk-register' | 'register' | 'manage' | 'ai-planner' | 'analytics'
  >('orders');

  const pendingOrdersCount = orders.filter(o => o.status === 'paid' || o.status === 'preparing').length;
  const waitingInquiriesCount = inquiries.filter(i => i.status === 'waiting').length;

  const navItems = [
    { id: 'dashboard', label: '운영 대시보드', icon: LayoutDashboard, badge: null },
    { id: 'orders', label: '주문 & 배송 관리', icon: Package, badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}건 대기` : null, badgeColor: 'bg-amber-400 text-neutral-950 font-bold' },
    { id: 'reviews-cs', label: '리뷰 & 고객 Q&A', icon: MessageSquareText, badge: waitingInquiriesCount > 0 ? `${waitingInquiriesCount}건 대기` : null, badgeColor: 'bg-rose-500 text-white font-bold' },
    { id: 'users', label: '회원 & 고객 CRM', icon: Users, badge: `${users.length}명` },
    { id: 'promotions', label: 'AI 프로모션 & 배너', icon: Tag, badge: 'CMS' },
    { id: 'bulk-register', label: '대량 상품 등록', icon: Zap, badge: null },
    { id: 'register', label: '신규 상품 개별 등록', icon: PlusSquare, badge: 'AI지원' },
    { id: 'manage', label: '상품 목록 및 수정', icon: ClipboardList, badge: `${products.length}` },
    { id: 'ai-planner', label: 'AI 시즌 테마 기획', icon: Bot, badge: '테마형' },
    { id: 'analytics', label: 'Ai 분석센터', icon: TrendingUp, badge: 'AI진단', badgeColor: 'bg-purple-600 text-white font-bold' },
  ];

  return (
    <div id="admin-center-container" className="min-h-screen bg-neutral-100 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Admin Mode Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black shadow-xs">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                StyleWise <span className="text-amber-400">Admin Studio</span>
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user?.role === 'manager' ? '매니저 전용 포털' : '관리자 전용 포털'} ({user?.email})</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Firebase Status & Quick Config inside Admin Center */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700 text-xs">
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${firebaseStatus === 'connected' || firebaseStatus === 'custom' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${firebaseStatus === 'connected' || firebaseStatus === 'custom' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="text-neutral-300 font-medium">
                DB: {firebaseStatus === 'custom' ? '맞춤설정' : firebaseStatus === 'connected' ? '정상연결' : '연결확인'}
              </span>
              {onOpenFirebaseConfig && (
                <button
                  type="button"
                  onClick={onOpenFirebaseConfig}
                  className="ml-1 text-amber-400 hover:text-amber-300 transition-colors font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  title="파이어베이스 DB/인증 환경설정"
                >
                  <Database className="w-3 h-3" />
                  <span>설정</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onCloseAdmin}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-neutral-700 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>쇼핑몰 홈으로 돌아가기</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs sticky top-22">
            <div className="px-3 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              관리자 통합 센터
            </div>

            <nav className="space-y-1 mt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        item.badgeColor 
                          ? item.badgeColor 
                          : isActive 
                          ? 'bg-amber-400 text-neutral-950' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 pt-4 border-t border-neutral-100 px-3">
              <div className="text-[11px] text-neutral-400">인증 계정</div>
              <div className="text-xs font-bold text-neutral-800 truncate mt-0.5">{user?.email}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                {user?.role === 'manager' ? '운영 매니저 권한 활성화' : '최고 관리자 권한 활성화'}
              </div>
            </div>
          </div>
        </aside>

        {/* Dynamic Tab Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <AdminDashboardTab
              products={products}
              onNavigateTab={(t) => setActiveTab(t as any)}
              onEditProduct={() => setActiveTab('manage')}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrderManageTab
              orders={orders}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onSuccess={(msg) => onShowToast('주문 상태 변경', msg, 'success')}
            />
          )}

          {activeTab === 'reviews-cs' && (
            <AdminReviewCsTab
              reviews={reviews}
              inquiries={inquiries}
              onUpdateReview={onUpdateReview}
              onDeleteReview={onDeleteReview}
              onUpdateInquiry={onUpdateInquiry}
              onDeleteInquiry={onDeleteInquiry}
              onSuccess={(msg) => onShowToast('리뷰/CS 관리 완료', msg, 'success')}
            />
          )}

          {activeTab === 'users' && (
            <AdminUserManageTab
              users={users}
              onUpdateUser={onUpdateUser}
              onAddUser={onAddUser}
              onSuccess={(msg) => onShowToast('회원 관리 완료', msg, 'success')}
            />
          )}

          {activeTab === 'promotions' && (
            <AdminPromotionTab
              coupons={coupons}
              banners={banners}
              onUpdateCoupon={onUpdateCoupon}
              onAddCoupon={onAddCoupon}
              onDeleteCoupon={onDeleteCoupon}
              onUpdateBanner={onUpdateBanner}
              onAddBanner={onAddBanner}
              onDeleteBanner={onDeleteBanner}
              onSuccess={(msg) => onShowToast('마케팅 설정 완료', msg, 'success')}
            />
          )}

          {activeTab === 'bulk-register' && (
            <AdminAiBulkRegisterTab
              onAddBatchProducts={onAddBatchProducts}
              onSuccess={(msg) => onShowToast('AI 대량 등록 완료', msg, 'success')}
            />
          )}

          {activeTab === 'register' && (
            <AdminProductRegisterTab
              onAddProduct={onAddProduct}
              onSuccess={(msg) => onShowToast('상품 등록 성공', msg, 'success')}
            />
          )}

          {activeTab === 'manage' && (
            <AdminProductManageTab
              products={products}
              onUpdateProduct={onUpdateProduct}
              onAddBatchProducts={onAddBatchProducts}
              onDeleteProduct={onDeleteProduct}
              onResetProducts={onResetProducts}
              onNavigateToRegister={() => setActiveTab('register')}
              onSuccess={(msg) => onShowToast('관리 작업 완료', msg, 'success')}
            />
          )}

          {activeTab === 'ai-planner' && (
            <AdminAiPlannerTab
              onAddBatchProducts={onAddBatchProducts}
              onSuccess={(msg) => onShowToast('AI 기획 세트 등록 완료', msg, 'success')}
            />
          )}

          {activeTab === 'analytics' && (
            <AdminAnalyticsTab
              products={products}
              orders={orders}
              users={users}
              reviews={reviews}
            />
          )}
        </main>
      </div>
    </div>
  );
}
