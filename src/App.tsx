import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { INITIAL_PRODUCTS } from './lib/productsData';
import { INITIAL_ORDERS, INITIAL_USERS, INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_REVIEWS, INITIAL_INQUIRIES } from './lib/adminData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturedProducts } from './components/FeaturedProducts';
import { AiStylistSection } from './components/AiStylistSection';
import { AuthModal } from './components/AuthModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { Footer } from './components/Footer';
import { AdminCenter } from './components/admin/AdminCenter';
import { isAdminUser } from './lib/authUtils';
import type { Product, CartItem, UserProfile, Order, OrderStatus, Coupon, PromotionBanner, ProductReview, CustomerInquiry } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = 'stylewise_products_cache_v3';
const ORDERS_STORAGE_KEY = 'stylewise_orders_cache_v3';
const USERS_STORAGE_KEY = 'stylewise_users_cache_v3';
const COUPONS_STORAGE_KEY = 'stylewise_coupons_cache_v3';
const BANNERS_STORAGE_KEY = 'stylewise_banners_cache_v3';
const REVIEWS_STORAGE_KEY = 'stylewise_reviews_cache_v3';
const INQUIRIES_STORAGE_KEY = 'stylewise_inquiries_cache_v3';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // 1. Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached products", e);
    }
    return INITIAL_PRODUCTS;
  });

  // 2. Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached orders", e);
    }
    return INITIAL_ORDERS;
  });

  // 3. Users CRM State
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached users", e);
    }
    return INITIAL_USERS;
  });

  // 4. Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached coupons", e);
    }
    return INITIAL_COUPONS;
  });

  // 5. Banners State
  const [banners, setBanners] = useState<PromotionBanner[]>(() => {
    try {
      const saved = localStorage.getItem(BANNERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached banners", e);
    }
    return INITIAL_BANNERS;
  });

  // 6. Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached reviews", e);
    }
    return INITIAL_REVIEWS;
  });

  // 7. Inquiries Q&A State
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(INQUIRIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Error loading cached inquiries", e);
    }
    return INITIAL_INQUIRIES;
  });

  const [currentView, setCurrentView] = useState<'mall' | 'admin'>('mall');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'custom' | 'connecting'>('connected');

  // Modals & Drawers state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [firebaseConfigModalOpen, setFirebaseConfigModalOpen] = useState<boolean>(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState<boolean>(false);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' } | null>(null);

  const stylistRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync caches
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(allUsers));
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
      localStorage.setItem(BANNERS_STORAGE_KEY, JSON.stringify(banners));
      localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
      localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.warn("Storage sync warning", e);
    }
  }, [products, orders, allUsers, coupons, banners, reviews, inquiries]);

  // Auth State Change
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
        if (currentUser) {
          const email = currentUser.email || '';
          const isCyberAdmin = email.toLowerCase().includes('cyber924') || email.toLowerCase().startsWith('admin');
          const loggedUser: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || '회원',
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous,
            role: isCyberAdmin ? 'admin' : 'user',
            grade: isCyberAdmin ? 'VIP' : '일반',
            points: 5000,
            totalSpent: 0,
            orderCount: 0,
            status: 'active'
          };
          setUser(loggedUser);
          setFirebaseStatus('connected');

          // Ensure user is in allUsers list
          setAllUsers(prev => {
            if (!prev.some(u => u.email === loggedUser.email || u.uid === loggedUser.uid)) {
              return [loggedUser, ...prev];
            }
            return prev;
          });
        } else {
          setUser(null);
          const customKey = localStorage.getItem("stylewise_firebase_config");
          setFirebaseStatus(customKey ? 'custom' : 'connected');
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Auth state change error:", e);
    }
  }, []);

  // Products Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleAddBatchProducts = (batch: Product[]) => {
    setProducts((prev) => [...batch, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (db && !updated.id.startsWith('prod-')) {
      try {
        updateDoc(doc(db, 'products', updated.id), { ...updated }).catch(() => {});
      } catch (e) {}
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (db && !productId.startsWith('prod-')) {
      try {
        deleteDoc(doc(db, 'products', productId)).catch(() => {});
      } catch (e) {}
    }
  };

  const handleResetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  };

  // Orders Handlers
  const handleUpdateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    trackingNumber?: string, 
    courierCompany?: string
  ) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
          courierCompany: courierCompany !== undefined ? courierCompany : o.courierCompany,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return o;
    }));
  };

  // Users Handlers
  const handleUpdateUser = (updated: UserProfile) => {
    setAllUsers(prev => prev.map(u => u.uid === updated.uid ? updated : u));
    if (user && user.uid === updated.uid) {
      setUser(updated);
    }
  };

  const handleAddUser = (newUser: UserProfile) => {
    setAllUsers(prev => [newUser, ...prev]);
  };

  // Coupons Handlers
  const handleUpdateCoupon = (updated: Coupon) => {
    setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // Banners Handlers
  const handleUpdateBanner = (updated: PromotionBanner) => {
    setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
  };

  const handleAddBanner = (newBanner: PromotionBanner) => {
    setBanners(prev => [...prev, newBanner]);
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  // Review & Inquiry Handlers
  const handleUpdateReview = (updatedReview: ProductReview) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    showToast('리뷰 관리 업데이트', `[${updatedReview.productName}] 리뷰 설정이 저장되었습니다.`);
  };

  const handleDeleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    showToast('리뷰 삭제 완료', '해당 리뷰가 삭제되었습니다.', 'info');
  };

  const handleAddReview = (newReview: ProductReview) => {
    setReviews(prev => [newReview, ...prev]);
    showToast('리뷰가 등록되었습니다', '소중한 구매 후기를 남겨주셔서 감사합니다!');
  };

  const handleUpdateInquiry = (updatedInquiry: CustomerInquiry) => {
    setInquiries(prev => prev.map(i => i.id === updatedInquiry.id ? updatedInquiry : i));
    showToast('Q&A 문의 처리 완료', `[${updatedInquiry.title}] 답변 및 상태가 저장되었습니다.`);
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    setInquiries(prev => prev.filter(i => i.id !== inquiryId));
    showToast('문의 내역 삭제 완료', '해당 고객 문의가 삭제되었습니다.', 'info');
  };

  const handleAddInquiry = (newInquiry: CustomerInquiry) => {
    setInquiries(prev => [newInquiry, ...prev]);
    showToast('문의가 접수되었습니다', '담당자가 확인 후 신속하게 답변해 드리겠습니다!');
  };

  // Cart & Checkout Actions
  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`장바구니에 담겼습니다`, product.name);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast(`상품이 삭제되었습니다`, undefined, 'info');
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      showToast('로그인이 필요합니다', '주문을 완료하려면 먼저 로그인해 주세요.', 'info');
      return;
    }

    // Create a real Order in the system
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal > 50000 ? 0 : 3000;
    const finalAmount = subtotal + shippingFee;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `SW${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100 + Math.random() * 900)}`,
      userId: user.uid,
      userEmail: user.email || 'guest@example.com',
      userName: user.displayName || '고객',
      userPhone: '010-0000-0000',
      shippingAddress: '서울특별시 강남구 테헤란로 152 (기본 배송지)',
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        size: item.selectedSize || 'Free',
        color: item.selectedColor || 'Standard'
      })),
      totalAmount: subtotal,
      discountAmount: 0,
      finalAmount: finalAmount,
      paymentMethod: 'kakao_pay',
      status: 'paid',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setCartDrawerOpen(false);
    showToast('주문 및 결제가 완료되었습니다!', `주문번호 [${newOrder.orderNumber}] 접수 완료`);
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("SignOut error:", e);
      }
    }
    setUser(null);
    setCurrentView('mall');
    showToast('로그아웃되었습니다', '안전하게 로그아웃되었습니다.', 'info');
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: UserProfile) => {
    setUser(loggedUser);
    showToast('로그인 성공', `${loggedUser.displayName || '회원'}님 환영합니다!`);
  };

  const handleConfigSaved = () => {
    setFirebaseStatus('custom');
    setFirebaseConfigModalOpen(false);
    showToast('Firebase 환경설정 저장 완료', '새로운 Firebase 구성이 적용되었습니다.');
  };

  const handleScrollToStylist = () => {
    if (currentView !== 'mall') setCurrentView('mall');
    setTimeout(() => {
      stylistRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleScrollToProducts = () => {
    if (currentView !== 'mall') setCurrentView('mall');
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleGetAiStyling = (product: Product) => {
    handleScrollToStylist();
    showToast('AI 스타일리스트 추천', `[${product.name}]의 추천 코디 팁을 확인하세요.`);
  };

  const handleOpenAdminWithGuard = () => {
    if (!isAdminUser(user)) {
      showToast('접근 권한이 없습니다', '관리자(Admin) 또는 매니저(Manager) 권한을 가진 계정만 접근 가능합니다.', 'info');
      return;
    }
    setCurrentView('admin');
  };

  const handleOpenMyOrdersModal = () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      showToast('로그인이 필요합니다', '주문 및 배송 조회를 위해 먼저 로그인해 주세요.', 'info');
      return;
    }
    setMyOrdersModalOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If in Admin View but not authorized, automatically bounce back to mall
  if (currentView === 'admin' && !isAdminUser(user)) {
    setCurrentView('mall');
    showToast('접근 차단', '관리자 권한이 없어 쇼핑몰 홈으로 이동되었습니다.', 'info');
  }

  // If in Admin View and User is an Admin/Manager
  if (currentView === 'admin' && isAdminUser(user)) {
    return (
      <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-neutral-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-800 flex items-center gap-3">
              {toastMessage.type === 'info' ? (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold">{toastMessage.title}</p>
                {toastMessage.desc && <p className="text-[11px] text-neutral-400">{toastMessage.desc}</p>}
              </div>
            </div>
          </div>
        )}

        <AdminCenter
          user={user}
          products={products}
          orders={orders}
          users={allUsers}
          coupons={coupons}
          banners={banners}
          reviews={reviews}
          inquiries={inquiries}
          firebaseStatus={firebaseStatus}
          onOpenFirebaseConfig={() => setFirebaseConfigModalOpen(true)}
          onAddProduct={handleAddProduct}
          onAddBatchProducts={handleAddBatchProducts}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetProducts={handleResetProducts}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateUser={handleUpdateUser}
          onAddUser={handleAddUser}
          onUpdateCoupon={handleUpdateCoupon}
          onAddCoupon={handleAddCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onUpdateBanner={handleUpdateBanner}
          onAddBanner={handleAddBanner}
          onDeleteBanner={handleDeleteBanner}
          onUpdateReview={handleUpdateReview}
          onDeleteReview={handleDeleteReview}
          onUpdateInquiry={handleUpdateInquiry}
          onDeleteInquiry={handleDeleteInquiry}
          onCloseAdmin={() => setCurrentView('mall')}
          onLogout={handleLogout}
          onShowToast={showToast}
        />
      </div>
    );
  }

  // Shopping Mall Main View
  return (
    <div id="stylewise-mall-root" className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-neutral-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-800 flex items-center gap-3">
            {toastMessage.type === 'info' ? (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <div>
              <p className="text-xs font-bold">{toastMessage.title}</p>
              {toastMessage.desc && <p className="text-[11px] text-neutral-400">{toastMessage.desc}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <Header
        user={user}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          handleScrollToProducts();
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenFirebaseConfig={() => setFirebaseConfigModalOpen(true)}
        onOpenCart={() => setCartDrawerOpen(true)}
        cartCount={totalCartCount}
        firebaseStatus={firebaseStatus}
        onScrollToStylist={handleScrollToStylist}
        onOpenAdmin={handleOpenAdminWithGuard}
        onOpenMyOrders={handleOpenMyOrdersModal}
      />

      {/* Main Container */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* Hero Section with Dynamic Banners */}
        <HeroSection
          banners={banners}
          onExploreClick={handleScrollToProducts}
          onStylistClick={handleScrollToStylist}
        />

        {/* Featured Products Grid */}
        <div ref={productsRef}>
          <FeaturedProducts
            products={products}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            onAddToCart={handleAddToCart}
            onQuickView={(p) => setQuickViewProduct(p)}
            onGetAiStyling={handleGetAiStyling}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* AI Stylist Interactive Section */}
        <div ref={stylistRef}>
          <AiStylistSection
            products={products}
            onAddToCart={handleAddToCart}
          />
        </div>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        onAuthSuccess={handleAuthSuccess}
      />

      <FirebaseConfigModal
        isOpen={firebaseConfigModalOpen}
        onClose={() => setFirebaseConfigModalOpen(false)}
        onConfigSaved={handleConfigSaved}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        reviews={reviews}
        inquiries={inquiries}
        user={user}
        onAddReview={handleAddReview}
        onAddInquiry={handleAddInquiry}
        onRequireLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
          showToast('로그인이 필요합니다', '리뷰 및 문의 작성을 위해 먼저 로그인해 주세요.', 'info');
        }}
      />

      <MyOrdersModal
        isOpen={myOrdersModalOpen}
        onClose={() => setMyOrdersModalOpen(false)}
        orders={orders}
        userEmail={user?.email || ''}
        onExploreShopping={handleScrollToProducts}
      />

    </div>
  );
}
