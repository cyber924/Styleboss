
"use client";

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ImagePlus, Loader2, Wand2, Download, Save } from 'lucide-react';
import { generateAdContent, type AdContentOutput } from '@/ai/flows/ai-ad-image-generation';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

function ImageResultCard({ title, src, alt }: { title: string, src: string, alt: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="aspect-[4/5] relative w-full rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                    <Image src={src} alt={alt} fill className="object-cover" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function ImageGenerationPage() {
    const { toast } = useToast();
    const [isGenerating, startGeneratingTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();

    const [productName, setProductName] = useState("");
    const [results, setResults] = useState<AdContentOutput | null>(null);

    const handleGenerate = () => {
        if (!productName) return;

        startGeneratingTransition(async () => {
            setResults(null);
            try {
                const result = await generateAdContent({ productName });
                setResults(result);
                toast({
                    title: "성공!",
                    description: "AI 이미지가 성공적으로 생성되었습니다.",
                });
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    title: "오류",
                    description: `이미지 생성 중 오류가 발생했습니다: ${errorMessage}`,
                    variant: "destructive",
                });
            }
        });
    };

    const handleDownload = (dataUri: string, type: string) => {
        if (!productName) return;
        const link = document.createElement('a');
        link.href = dataUri;
        const extension = dataUri.substring(dataUri.indexOf('/') + 1, dataUri.indexOf(';base64'));
        link.download = `${productName.replace(/\s+/g, '_')}-${type}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSaveToStorage = () => {
        if (!results || !productName) return;

        startSavingTransition(async () => {
            const uploadImage = async (dataUri: string, type: string): Promise<string> => {
                const sanitizedProductName = productName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
                const fileName = `uploads/ad-${sanitizedProductName}-${type}-${Date.now()}.png`;
                const storageRef = ref(storage, fileName);

                await uploadString(storageRef, dataUri, 'data_url');
                return getDownloadURL(storageRef);
            };

            try {
                const urls = await Promise.all([
                    uploadImage(results.productImage, 'product'),
                    uploadImage(results.modelImage, 'model'),
                    uploadImage(results.creativeImage, 'creative'),
                ]);

                toast({
                    title: '저장 성공!',
                    description: `스토리지에 ${urls.length}개의 이미지가 성공적으로 저장되었습니다.`,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    title: '저장 실패',
                    description: `클라이언트 저장 오류: ${errorMessage}. 스토리지 보안 규칙을 확인해주세요.`,
                    variant: 'destructive',
                });
            }
        });
    };

    return (
        <div className="container py-12">
            <Card className="max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImagePlus className="h-6 w-6 text-primary" />
                        AI 광고 이미지 생성
                    </CardTitle>
                    <CardDescription>
                        상품명을 입력하면 AI가 제품, 모델, 컨셉에 맞는 3가지 광고 이미지와 마케팅 문구를 생성합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="예: 프리미엄 코튼 롱슬리브 티셔츠"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            disabled={isGenerating || isSaving}
                            className="flex-grow"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleGenerate();
                            }}
                        />
                        <Button onClick={handleGenerate} disabled={isGenerating || isSaving || !productName} className="font-bold">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            {isGenerating ? "생성 중..." : "AI로 생성하기"}
                        </Button>
                    </div>

                    {isGenerating && (
                        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">AI가 이미지를 생성하고 있습니다...</p>
                            <p className="text-sm">최대 1분 정도 소요될 수 있습니다. 잠시만 기다려주세요.</p>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-8">
                            <Card className="bg-primary/5">
                                <CardHeader>
                                    <CardTitle>AI 추천 마케팅 문구</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-semibold text-primary">{results.slogan}</p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ImageResultCard title="제품 이미지" src={results.productImage} alt={`${productName} product image`} />
                                <ImageResultCard title="모델 착용샷" src={results.modelImage} alt={`Model wearing ${productName}`} />
                                <ImageResultCard title="컨셉/광고 이미지" src={results.creativeImage} alt={`Creative ad for ${productName}`} />
                            </div>

                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle>이미지 활용</CardTitle>
                                    <CardDescription>생성된 이미지를 다운로드하거나 클라우드 스토리지에 저장하여 활용하세요.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Button onClick={handleSaveToStorage} disabled={isSaving || isGenerating} size="lg" className="w-full">
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        모든 이미지 스토리지에 저장
                                    </Button>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-2">
                                        <Button onClick={() => handleDownload(results.productImage, 'product')} variant="outline" disabled={isSaving || isGenerating}>
                                            <Download className="mr-2 h-4 w-4" /> 제품
                                        </Button>
                                        <Button onClick={() => handleDownload(results.modelImage, 'model')} variant="outline" disabled={isSaving || isGenerating}>
                                            <Download className="mr-2 h-4 w-4" /> 모델
                                        </Button>
                                        <Button onClick={() => handleDownload(results.creativeImage, 'creative')} variant="outline" disabled={isSaving || isGenerating}>
                                            <Download className="mr-2 h-4 w-4" /> 컨셉
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

    