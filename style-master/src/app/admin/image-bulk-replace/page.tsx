
"use client";

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, writeBatch, doc } from 'firebase/firestore';
import type { AiProduct, Product, HotProduct } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Replace, Frown, Loader2, Save, Bot } from 'lucide-react';

type CollectionType = 'ai_products' | 'products' | 'hot_products';
// A unified type to handle data from all collections
type DisplayProduct = {
    id: string;
    name: string;
    originalImageUrl: string;
    newImageUrl?: string;
};

export default function ImageBulkReplacePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startSavingTransition] = useTransition();
    
    const [products, setProducts] = useState<DisplayProduct[]>([]);
    const [collectionType, setCollectionType] = useState<CollectionType>('ai_products');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProducts() {
            setIsLoading(true);
            setError(null);
            setProducts([]);
            try {
                const productsRef = collection(db, collectionType);
                const q = query(productsRef);
                const querySnapshot = await getDocs(q);
                
                const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const placeholderProducts = allProducts.map(p => {
                    let imageUrl: string;
                    if (collectionType === 'ai_products') {
                        imageUrl = (p as AiProduct).mainImageUrl;
                    } else if (collectionType === 'products') {
                        imageUrl = (p as Product).imageUrl;
                    } else { // hot_products
                        imageUrl = (p as HotProduct).imageUrl;
                    }
                    
                    return {
                        id: p.id,
                        name: p.name,
                        originalImageUrl: imageUrl,
                    }
                }).filter(p => p.originalImageUrl && p.originalImageUrl.startsWith('https://placehold.co'));

                setProducts(placeholderProducts);

            } catch (err) {
                console.error(`Error fetching from ${collectionType}:`, err);
                const message = err instanceof Error ? err.message : "알 수 없는 오류 발생";
                setError(`상품 목록 로딩 실패: ${message}`);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProducts();
    }, [collectionType]);

    const handleUrlChange = (productId: string, newUrl: string) => {
        setProducts(prevProducts => 
            prevProducts.map(p => 
                p.id === productId ? { ...p, newImageUrl: newUrl } : p
            )
        );
    };

    const handleSaveAll = () => {
        const productsToUpdate = products.filter(p => p.newImageUrl && p.newImageUrl.trim() !== '' && p.newImageUrl !== p.originalImageUrl);
        
        if (productsToUpdate.length === 0) {
            toast({ title: "변경 사항 없음", description: "교체할 새로운 URL이 입력되지 않았습니다."});
            return;
        }

        startSavingTransition(async () => {
            try {
                const batch = writeBatch(db);
                
                let imageUrlField: string;
                if (collectionType === 'ai_products') {
                    imageUrlField = 'mainImageUrl';
                } else { // 'products' and 'hot_products' use 'imageUrl'
                    imageUrlField = 'imageUrl';
                }

                productsToUpdate.forEach(product => {
                    const productRef = doc(db, collectionType, product.id);
                    batch.update(productRef, { [imageUrlField]: product.newImageUrl });
                });

                await batch.commit();
                toast({ title: "저장 완료!", description: `${productsToUpdate.length}개의 상품 이미지가 성공적으로 교체되었습니다.`});
                
                setProducts(prev => prev.filter(p => !productsToUpdate.find(updated => updated.id === p.id)));

            } catch (err) {
                 console.error("Error saving products:", err);
                const message = err instanceof Error ? err.message : "알 수 없는 오류 발생";
                toast({ title: "오류", description: `저장에 실패했습니다: ${message}`, variant: "destructive" });
            }
        });
    };
    
    const productsWithChanges = products.filter(p => p.newImageUrl && p.newImageUrl.trim() !== '' && p.newImageUrl !== p.originalImageUrl).length;

    return (
        <div className="container py-12">
            <Card className="max-w-7xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Replace className="h-6 w-6 text-primary" />
                         이미지 일괄 교체
                    </CardTitle>
                    <CardDescription>
                        임시 이미지(placehold.co)를 사용하는 상품 목록입니다. 상품 종류를 선택하고 새 이미지 URL을 입력하여 교체하세요.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs value={collectionType} onValueChange={(value) => setCollectionType(value as CollectionType)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:w-[450px]">
                            <TabsTrigger value="ai_products">AI 상품</TabsTrigger>
                            <TabsTrigger value="products">일반 상품</TabsTrigger>
                             <TabsTrigger value="hot_products">핫딜 상품</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {isLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                         </div>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>오류</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-muted rounded-lg">
                           <Frown className="mx-auto h-12 w-12 text-muted-foreground" />
                           <p className="mt-4 text-lg text-muted-foreground">임시 이미지를 사용하는 상품이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map(product => (
                                <Card key={product.id}>
                                    <CardContent className="p-4">
                                        <div className="aspect-square relative w-full bg-muted rounded-md overflow-hidden">
                                            <Image 
                                                src={product.newImageUrl || product.originalImageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = product.originalImageUrl;
                                                    e.currentTarget.onerror = null;
                                                }}
                                            />
                                        </div>
                                        <p className="font-semibold text-sm mt-3 truncate" title={product.name}>{product.name}</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Input 
                                            placeholder="새 이미지 URL 붙여넣기"
                                            value={product.newImageUrl || ''}
                                            onChange={(e) => handleUrlChange(product.id, e.target.value)}
                                        />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {!isLoading && products.length > 0 && (
                <div className="sticky bottom-6 mt-6">
                    <Card className="max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 slide-in-from-bottom-5">
                        <CardContent className="p-4 flex items-center justify-between">
                            <p className="font-medium">{productsWithChanges}개 항목 변경됨</p>
                            <Button onClick={handleSaveAll} disabled={isSaving || productsWithChanges === 0}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                전체 저장
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
