
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AiProduct, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShoppingCart, Truck, Star, MessageSquare, ShieldCheck, ArrowLeft, Terminal } from 'lucide-react';


function DetailPageSkeleton() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <div>
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <div className="flex gap-2 mt-2">
                        <Skeleton className="w-16 h-16 rounded"/>
                        <Skeleton className="w-16 h-16 rounded"/>
                        <Skeleton className="w-16 h-16 rounded"/>
                    </div>
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
            <div className="mt-16">
                 <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

export default function AiProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const productId = params.id as string;
    
    const [product, setProduct] = useState<AiProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    useEffect(() => {
        if (!productId) {
            setError("상품 ID가 없습니다.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const productRef = doc(db, 'ai_products', productId);
                const docSnap = await getDoc(productRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() } as AiProduct
                    setProduct(productData);
                    // Dynamically update document title
                    document.title = `${productData.name} | StyleWise AI`;
                } else {
                    setError("상품을 찾을 수 없습니다.");
                }
            } catch (err) {
                console.error("Firebase getDoc error:", err);
                setError("상품 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);
    
    const allImages = product ? [product.mainImageUrl, ...(product.thumbnailImageUrls || [])] : [];

    const handleAddToCart = () => {
        if (!product) return;
    
        try {
          const cartItems: (Product & { quantity: number })[] = JSON.parse(localStorage.getItem('cart') || '[]');
          
          const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
    
          if (existingItemIndex > -1) {
            cartItems[existingItemIndex].quantity += 1;
          } else {
            const productToAdd = {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.mainImageUrl,
              category: 'all' as const, 
              description: product.specifications.map(s => `${s.key}: ${s.value}`).join(', '),
              quantity: 1,
            };
            cartItems.push(productToAdd);
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

    if (loading) return <DetailPageSkeleton />;

    if (error) {
        return (
            <div className="container py-20">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>오류가 발생했습니다</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!product) return null;

    return (
        <main className="bg-muted/30">
            <div className="container mx-auto max-w-5xl px-4 py-8">
                 <Button asChild variant="ghost" className="mb-4 -ml-4">
                    <button onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        목록으로 돌아가기
                    </button>
                </Button>
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start bg-background p-8 rounded-lg shadow-sm">
                    {/* Image Section */}
                    <div>
                        <Carousel setApi={setApi} className="w-full">
                            <CarouselContent>
                                {allImages.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <Card className="overflow-hidden border-none">
                                            <CardContent className="p-0 flex aspect-square items-center justify-center">
                                                <Image src={url} alt={`${product.name} image ${index + 1}`} width={1000} height={1000} className="object-cover w-full h-full" />
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                             {allImages.length > 1 && <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>}
                        </Carousel>
                        <div className="py-2 text-center text-sm text-muted-foreground">
                            {current} / {count}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold p-1 rounded-md self-start ${product.source === 'Coupang' ? 'bg-blue-100 text-blue-800' : (product.source === 'Naver Shopping' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800')}`}>{product.source} 추천</span>
                        <h1 className="text-2xl lg:text-3xl font-bold mt-2">{product.name}</h1>
                        <p className="text-3xl lg:text-4xl font-extrabold text-primary mt-4">{product.price.toLocaleString()}원</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Truck className="h-4 w-4"/>
                            <span>{product.shippingInfo}</span>
                        </div>

                        <div className="mt-6 space-y-4">
                            {product.options && product.options.map(option => (
                                <Select key={option.name}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={option.name} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {option.values.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            ))}
                        </div>

                        <Button size="lg" className="w-full font-bold text-lg h-14 mt-6" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-3 h-6 w-6" /> 장바구니에 담기
                        </Button>
                    </div>
                </div>
                
                {/* Content Section */}
                <div className="mt-12 space-y-10">
                    {/* Summary Banner */}
                    {product.summaryBanner && (
                        <div className="relative rounded-lg overflow-hidden text-white flex items-center justify-center p-8 min-h-[200px] bg-gradient-to-r from-primary to-accent">
                            <Image src={product.summaryBanner.imageUrl} alt="요약 배너" fill className="object-cover opacity-20"/>
                            <div className="relative z-10 text-center space-y-4">
                               <h2 className="text-3xl font-bold">이 상품의 핵심!</h2>
                               <div className="flex justify-center gap-2">
                                 {product.summaryBanner.keyPoints.map(point => (
                                    <span key={point} className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm">{point}</span>
                                 ))}
                               </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Detail Images */}
                    <div>
                        {product.detailImageUrls && product.detailImageUrls.map((url, index) => (
                             <Image key={index} src={url} alt={`Detail image ${index + 1}`} width={800} height={1200} className="w-full h-auto mt-4 rounded-md shadow-sm"/>
                        ))}
                    </div>

                    <Accordion type="single" collapsible className="w-full bg-background p-4 rounded-lg shadow-sm" defaultValue='item-1'>
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="text-lg font-bold">상품 스펙</AccordionTrigger>
                            <AccordionContent>
                                <Table>
                                    <TableBody>
                                        {product.specifications && product.specifications.map(spec => (
                                            <TableRow key={spec.key}>
                                                <TableHead className="w-1/3">{spec.key}</TableHead>
                                                <TableCell>{spec.value}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger className="text-lg font-bold">사용법 및 주의사항</AccordionTrigger>
                            <AccordionContent className="whitespace-pre-wrap">
                                {product.usagePrecautions}
                            </AccordionContent>
                        </AccordionItem>
                        {product.reviews && product.reviews.length > 0 && (
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-bold">리뷰 미리보기</AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                     {product.reviews.map((review, index) => (
                                        <Card key={index} className="bg-muted/50">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold">{review.author}</span>
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}/>)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-foreground/80">{review.text}</p>
                                                <p className="text-xs text-muted-foreground mt-2">{review.createdAt}</p>
                                            </CardContent>
                                        </Card>
                                     ))}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        <AccordionItem value="item-4">
                            <AccordionTrigger className="text-lg font-bold">교환/반품 안내</AccordionTrigger>
                            <AccordionContent className="whitespace-pre-wrap">
                                {product.exchangeReturnInfo}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </main>
    );
}
