
"use client";

import { useState, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { generateSnsContentAction } from './actions';
import type { SnsContentOutput } from '@/ai/flows/sns-content-generation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, MessageSquareQuote, Wand2, FileText, Instagram, Youtube, Download } from 'lucide-react';

export default function SnsGenerationPage() {
    const { toast } = useToast();
    const [isGenerating, startGeneratingTransition] = useTransition();

    const [products, setProducts] = useState<Product[]>([]);
    const [isProductListLoading, setIsProductListLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [results, setResults] = useState<SnsContentOutput | null>(null);
    
    useEffect(() => {
        const fetchProducts = async () => {
            setIsProductListLoading(true);
            try {
                const productsCollection = collection(db, 'products');
                const q = query(productsCollection, orderBy('name'));
                const snapshot = await getDocs(q);
                const productsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Product[];
                setProducts(productsList);
            } catch (error) {
                console.error("Error fetching products:", error);
                toast({
                    title: "오류",
                    description: "상품 목록을 불러오는 데 실패했습니다.",
                    variant: "destructive",
                });
            } finally {
                setIsProductListLoading(false);
            }
        };
        fetchProducts();
    }, [toast]);

    const handleGenerate = () => {
        if (!selectedProductId) return;

        const selectedProduct = products.find(p => p.id === selectedProductId);
        if (!selectedProduct) return;

        startGeneratingTransition(async () => {
            setResults(null);
            const result = await generateSnsContentAction({ 
                productName: selectedProduct.name,
                productDescription: selectedProduct.description 
            });
            
            if (result.success && result.data) {
                setResults(result.data);
                toast({
                    title: "성공!",
                    description: "AI SNS 콘텐츠가 성공적으로 생성되었습니다.",
                });
            } else {
                toast({
                    title: "오류",
                    description: result.error,
                    variant: "destructive",
                });
            }
        });
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);

    const handleDownloadHtml = () => {
        if (!results || !selectedProduct) return;
        const htmlContent = `
          <html>
            <head>
              <meta charset="UTF-8">
              <title>SNS Content for ${selectedProduct.name}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333; }
                h1, h2, h3 { color: #000; }
                div, pre { margin-bottom: 20px; }
                pre { background-color: #f4f4f4; padding: 15px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 14px; }
                hr { border: 0; border-top: 1px solid #eee; margin: 40px 0; }
                .container { max-width: 800px; margin: auto; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>SNS Content for: ${selectedProduct.name}</h1>
                
                <h2>Blog Post</h2>
                <h3>${results.blog.title}</h3>
                <div>${results.blog.contentHtml}</div>
                <hr/>
                
                <h2>Instagram</h2>
                <h3>Caption</h3>
                <pre>${results.instagram.caption}</pre>
                <hr/>

                <h2>YouTube Shorts</h2>
                <h3>Title</h3>
                <p>${results.youtubeShorts.title}</p>
                <h3>Scenario</h3>
                <pre>${results.youtubeShorts.scenario}</pre>
                <h3>Hashtags</h3>
                <p>${results.youtubeShorts.hashtags}</p>
              </div>
            </body>
          </html>
        `;
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sns-content-${selectedProduct.name}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      const handleDownloadImage = () => {
        if (!results || !selectedProduct) return;
        const a = document.createElement('a');
        a.href = results.instagram.imageUrl;
        a.download = `instagram-image-${selectedProduct.name}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };

    return (
        <div className="container py-12">
            <Card className="max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquareQuote className="h-6 w-6 text-primary" />
                        AI SNS 콘텐츠 생성
                    </CardTitle>
                    <CardDescription>
                        상품을 선택하면 AI가 블로그, 인스타그램, 유튜브 쇼츠용 마케팅 콘텐츠를 자동으로 생성합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                        {isProductListLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                             <Select onValueChange={setSelectedProductId} disabled={isGenerating}>
                                <SelectTrigger>
                                    <SelectValue placeholder="홍보할 상품을 선택하세요..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product.id} value={product.id}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        <Button onClick={handleGenerate} disabled={isGenerating || !selectedProductId} className="font-bold w-full md:w-auto">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isGenerating ? "콘텐츠 생성 중..." : "AI로 생성하기"}
                        </Button>
                    </div>

                     {selectedProduct && !results && !isGenerating && (
                        <Card className="bg-muted/50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">선택된 상품</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} width={64} height={64} className="rounded-md object-cover" />
                                <div>
                                    <p className="font-semibold">{selectedProduct.name}</p>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.description.substring(0, 100)}...</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}


                    {isGenerating && (
                        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">AI가 마케팅 콘텐츠를 생성하고 있습니다...</p>
                            <p className="text-sm">이미지 생성 포함 시 최대 1분 정도 소요될 수 있습니다.</p>
                        </div>
                    )}

                    {results && (
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Button onClick={handleDownloadHtml}>
                                <Download className="mr-2" />
                                HTML로 전체 소스 다운로드
                                </Button>
                                <Button onClick={handleDownloadImage} variant="secondary">
                                <Download className="mr-2" />
                                이미지 저장
                                </Button>
                            </div>
                            <Tabs defaultValue="instagram" className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="instagram"><Instagram className="mr-2" />인스타그램</TabsTrigger>
                                    <TabsTrigger value="blog"><FileText className="mr-2" />블로그</TabsTrigger>
                                    <TabsTrigger value="shorts"><Youtube className="mr-2" />YouTube 쇼츠</TabsTrigger>
                                </TabsList>
                                <TabsContent value="instagram" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>인스타그램 콘텐츠</CardTitle>
                                            <CardDescription>AI가 생성한 이미지와 감성적인 캡션입니다.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center gap-6">
                                            <div className="relative aspect-square w-full max-w-md rounded-lg overflow-hidden shadow-md">
                                                <Image src={results.instagram.imageUrl} alt="AI generated Instagram post" fill className="object-cover" />
                                            </div>
                                            <div className="w-full max-w-md space-y-2">
                                                <h4 className="font-semibold text-center">추천 캡션</h4>
                                                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-4">{results.instagram.caption}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="blog" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>블로그 포스트</CardTitle>
                                        </CardHeader>
                                        <CardContent className="prose prose-sm max-w-none [&_h3]:text-xl [&_h3]:font-bold [&_p]:text-base [&_ul]:list-disc [&_ul]:pl-5 space-y-2">
                                            <h3 className="text-2xl font-bold border-b pb-2">{results.blog.title}</h3>
                                            <div dangerouslySetInnerHTML={{ __html: results.blog.contentHtml }} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="shorts" className="mt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>YouTube 쇼츠 아이디어</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold text-lg">제목</h4>
                                                <p className="rounded-md bg-muted p-3 mt-1">{results.youtubeShorts.title}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">시나리오</h4>
                                                <p className="text-sm whitespace-pre-wrap rounded-md bg-muted p-3 mt-1">{results.youtubeShorts.scenario}</p>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">추천 해시태그</h4>
                                                <p className="text-sm rounded-md bg-muted p-3 mt-1">{results.youtubeShorts.hashtags}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
