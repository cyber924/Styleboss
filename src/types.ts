export type ProductCategory = '전체' | '최신' | '인기' | '핫' | 'AI 상품' | '아우터' | '상의' | '하의' | '원피스' | '액세서리';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: 'latest' | 'popular' | 'hot' | 'ai' | 'all';
  categoryLabel?: ProductCategory;
  description: string;
  dataAiHint?: string;
  tags?: string[];
  aiStylingSuggestion?: string;
  isHot?: boolean;
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
  role?: 'user' | 'admin' | 'manager';
  grade?: 'VIP' | '골드' | '실버' | '일반';
  points?: number;
  totalSpent?: number;
  orderCount?: number;
  createdAt?: string;
  status?: 'active' | 'suspended';
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  shippingAddress: string;
  shippingMemo?: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'kakao_pay' | 'naver_pay';
  status: OrderStatus;
  trackingNumber?: string;
  courierCompany?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
  usedCount: number;
}

export interface PromotionBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  order: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1 to 5
  content: string;
  imageUrl?: string;
  sizeFeedback?: '작음' | '적당함' | '큼';
  colorFeedback?: '화면과 동일' | '조금 밝음' | '조금 어두움';
  likes: number;
  createdAt: string;
  isBest?: boolean;
  status: 'published' | 'hidden';
  reply?: {
    id: string;
    author: string;
    content: string;
    createdAt: string;
  };
}

export interface CustomerInquiry {
  id: string;
  type: 'product' | 'shipping' | 'refund' | 'size' | 'other';
  productId?: string;
  productName?: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  content: string;
  isSecret: boolean;
  status: 'waiting' | 'answered';
  answer?: {
    answeredBy: string;
    content: string;
    answeredAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

