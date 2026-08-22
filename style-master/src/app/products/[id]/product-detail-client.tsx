
"use client";

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/lib/types';
import { enhanceProductDetailAction, ProductDetailEnhancementOutput } from './actions';
import { ProductDetailSkeleton } from './product-detail-skeleton';

import { Button } from '@/components/ui/button';
import { Sparkles, ShoppingCart, Terminal, Loader2, Frown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';


type GeneratedProduct = ProductDetailEnhancementOutput['similarProducts'][0];

function GeneratedProductCard({ product }: { product: GeneratedProduct }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
      <div className="aspect-[3/4] overflow-hidden relative">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-headline text-lg font-medium">{product.name}</h3>
          <p className="text-sm mt-1 text-muted-foreground">{product.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductDetailClient({ productId }: { productId: string }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [isGenerating, startGeneratingTransition] = useTransition();
    const router = useRouter();
    
    const [displayEnhancements, setDisplayEnhancements] = useState<ProductDetailEnhancementOutput | null>(null);

    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const sessionStorageKey = `enhancements_${productId}`;

    useEffect(() => {
        if (!productId) {
            setError("상품 ID가 유효하지 않습니다.");
            setLoading(false);
            return;
        }
        setLoading(true);
        const productRef = doc(db, 'products', productId);
        const unsubscribe = onSnapshot(productRef, 
            (docSnap) => {
                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() } as Product;
                    setProduct(productData);

                    // Dynamically update document title
                    document.title = `${productData.name} | StyleWise AI`;

                    // 페이지 로드 시 세션 스토리지에서 데이터 복원 시도
                    try {
                        const cachedData = sessionStorage.getItem(sessionStorageKey);
                        if (cachedData) {
                            setDisplayEnhancements(JSON.parse(cachedData));
                        }
                    } catch (e) {
                         console.error("Failed to parse cached enhancement data:", e);
                         sessionStorage.removeItem(sessionStorageKey);
                    }
                    setError(null);
                } else {
                    setError("해당 상품을 찾을 수 없습니다.");
                    setProduct(null);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Firebase onSnapshot error:", err);
                setError("상품 정보를 실시간으로 가져오는 데 실패했습니다.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, [productId, sessionStorageKey]);
    
    const handleGenerateEnhancements = () => {
        if (!product) return;

        startGeneratingTransition(async () => {
            setError(null);
            setDisplayEnhancements(null); // 기존 데이터 초기화
            sessionStorage.removeItem(sessionStorageKey); // 기존 캐시 삭제

            const enhancementResult = await enhanceProductDetailAction({
                productName: product.name,
                productDescription: product.description,
            });

            if (enhancementResult.success) {
                setDisplayEnhancements(enhancementResult.data);
                try {
                    sessionStorage.setItem(sessionStorageKey, JSON.stringify(enhancementResult.data));
                } catch (e) {
                     toast({
                        title: "캐시 저장 실패",
                        description: "브라우저 저장 공간이 부족하여 추천 정보가 새로고침 시 사라질 수 있습니다.",
                        variant: "destructive",
                        duration: 8000
                    });
                }
                toast({
                    title: "AI 추천 생성 완료!",
                    description: "결과가 현재 세션 동안 브라우저에 임시 저장됩니다."
                });
            } else {
                setError(`AI 추천 생성 실패: ${enhancementResult.error}`);
                toast({
                    title: "AI 추천 생성 실패",
                    description: enhancementResult.error,
                    variant: "destructive"
                });
            }
        });
    };

    const handleAddToCart = () => {
        if (!product) return;
    
        try {
          const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
          
          const existingItemIndex = cartItems.findIndex((item: Product) => item.id === product.id);
    
          if (existingItemIndex > -1) {
            // If item already exists, increase quantity
            cartItems[existingItemIndex].quantity = (cartItems[existingItemIndex].quantity || 1) + 1;
          } else {
            // Otherwise, add new item with quantity 1
            cartItems.push({ ...product, quantity: 1 });
          }
    
          localStorage.setItem('cart', JSON.stringify(cartItems));
          toast({
            title: "장바구니 추가!",
            description: `${product.name} 상품이 장바구니에 추가되었습니다.`,
          });
          router.push('/my-products');
        } catch (error) {
          console.error("장바구니 추가 실패:", error);
          toast({
            title: "오류",
            description: "상품을 장바구니에 추가하는 데 실패했습니다.",
            variant: "destructive",
          });
        }
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (error && !product) { 
        return (
            <div className="container py-20 text-center">
                <Frown className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold">오류가 발생했습니다</h2>
                <p className="mt-2 text-muted-foreground">{error}</p>
                <Button asChild className="mt-6">
                    <Link href="/products">상품 목록으로 돌아가기</Link>
                </Button>
            </div>
        );
    }

    if (!product) {
        return null;
    }
    
  return (
    <main>
        <div className="container py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={533}
                    className="w-full h-full object-cover"
                    data-ai-hint={product.dataAiHint}
                />
                </div>
                <div className="flex flex-col h-full">
                <h1 className="text-3xl lg:text-4xl font-extrabold font-headline tracking-tight">{product.name}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{product.description}</p>
                <div className="mt-8">
                    <span className="text-4xl font-bold text-primary">{product.price.toLocaleString()}원</span>
                </div>
                
                <div className="mt-auto pt-8 space-y-4">
                    <Button size="lg" className="w-full font-bold text-lg h-14" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-3 h-6 w-6" /> 장바구니에 담기
                    </Button>
                    <Button asChild size="lg" variant="outline" className="w-full font-bold text-lg h-14 border-accent text-accent hover:bg-accent/10 hover:text-accent">
                    <Link href={`/stylist?description=${encodeURIComponent(product.name)}`}>
                        <Sparkles className="mr-3 h-6 w-6" /> AI로 다른 스타일 보기
                    </Link>
                    </Button>
                </div>
                </div>
            </div>
        </div>

        <section className="bg-muted/50 mt-12">
            <div className="container py-16 md:py-24">
                <div className="flex items-center gap-3 mb-8 text-center flex-col">
                    <Sparkles className="h-8 w-8 text-accent" />
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">StyleWise AI 추천</h2>
                    <p className="text-muted-foreground max-w-2xl">이 상품을 바탕으로 AI가 제안하는 스타일링 팁과 새로운 상품들을 확인해보세요.</p>
                </div>
                 {error && (
                    <Alert variant="destructive" className="mb-6">
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>오류 발생</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {!displayEnhancements && !isGenerating && (
                    <div className="text-center">
                        <Button onClick={handleGenerateEnhancements} size="lg" disabled={isGenerating}>
                            <Sparkles className="mr-2" /> AI 추천 생성하기
                        </Button>
                    </div>
                )}

                {isGenerating && (
                    <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-lg">AI가 추천 정보를 생성하고 있습니다...</p>
                        <p className="text-sm">최대 1~2분 정도 소요될 수 있습니다. 잠시만 기다려주세요.</p>
                    </div>
                )}
                
                {displayEnhancements && !isGenerating && (
                    <div className="space-y-12">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI 코디 제안</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base text-foreground/90">{displayEnhancements.stylingSuggestion}</p>
                            </CardContent>
                        </Card>

                        <div>
                            <h3 className="text-2xl font-bold mb-6">AI 추천 유사 상품</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayEnhancements.similarProducts.map((p, index) => (
                                    <GeneratedProductCard key={index} product={p} />
                                ))}
                            </div>
                        </div>

                        <div className="text-center">
                            <Button onClick={handleGenerateEnhancements} size="lg" variant="secondary" disabled={isGenerating}>
                                <Sparkles className="mr-2" /> AI 추천 다시 생성하기
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    </main>
  );
}
