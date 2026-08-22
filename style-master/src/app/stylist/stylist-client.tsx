
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateClothingImages } from '@/ai/flows/ai-image-generation';
import { predictTrends } from '@/ai/flows/predictive-trends';
import { Loader2, Sparkles, Wand2, Search } from 'lucide-react';

export function StylistClient() {
  const searchParams = useSearchParams();
  const initialDescription = searchParams.get('description') || '';
  
  // State for Image Generation
  const [description, setDescription] = useState(initialDescription);
  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // State for Trend Prediction
  const [pastPurchases, setPastPurchases] = useState('');
  const [preferences, setPreferences] = useState('');
  const [trends, setTrends] = useState<{ trendingProducts: string; reasoning: string } | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const handleImageGeneration = async () => {
    if (!description) return;
    setIsGenerating(true);
    setImages([]);
    setGenerationError(null);
    try {
      const result = await generateClothingImages({ clothingDescription: description, numberOfImages: 4 });
      setImages(result.images);
    } catch (error) {
      console.error(error);
      setGenerationError('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTrendPrediction = async () => {
    if (!pastPurchases || !preferences) return;
    setIsPredicting(true);
    setTrends(null);
    setPredictionError(null);
    try {
      const result = await predictTrends({ pastPurchases, preferences });
      setTrends(result);
    } catch (error) {
      console.error(error);
      setPredictionError('트렌드 예측에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="container py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-headline tracking-tight flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-accent" />
          AI 스타일리스트
          <Sparkles className="h-8 w-8 text-accent" />
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">AI의 힘으로 당신만의 스타일을 창조하고 미래 트렌드를 예측하세요.</p>
      </div>
      
      <Tabs defaultValue="generator" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">AI 의류 생성</TabsTrigger>
          <TabsTrigger value="trends">트렌드 예측</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>상상 속의 옷을 만들어보세요</CardTitle>
              <CardDescription>원하는 옷에 대해 자세히 설명할수록 AI가 더 정확하게 그려줍니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="예: 90년대 스타일의 크롭탑, 벨벳 소재, 연보라색, 소매에 작은 별 자수"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
              <Button onClick={handleImageGeneration} disabled={isGenerating || !description} className="w-full font-bold">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                AI로 생성하기
              </Button>
              {generationError && <p className="text-sm text-destructive">{generationError}</p>}
              {isGenerating && <p className="text-sm text-center text-muted-foreground">AI가 열심히 그림을 그리고 있습니다...</p>}
              {images.length > 0 && (
                <div className="mt-6 space-y-6">
                  <h3 className="text-lg font-semibold mb-2 text-center">생성된 이미지</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {images.map((src, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                        <Image src={src} alt={`Generated image ${index + 1}`} width={300} height={300} className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                  <div className="text-center">
                    <Button asChild size="lg" variant="secondary" className="font-bold">
                      <Link href={`/search?q=${encodeURIComponent(description)}`}>
                        <Search className="mr-2 h-5 w-5" />
                        이 스타일과 비슷한 상품 찾아보기
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>나를 위한 다음 시즌 트렌드</CardTitle>
              <CardDescription>당신의 쇼핑 기록과 취향을 바탕으로 AI가 다음 유행을 예측해 드립니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="purchases" className="font-medium">과거 구매 상품</label>
                <Input id="purchases" placeholder="예: 오버핏 셔츠, 데님 팬츠, 롱 원피스" value={pastPurchases} onChange={e => setPastPurchases(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="prefs" className="font-medium">선호하는 스타일</label>
                <Textarea id="prefs" placeholder="예: 편안한 캐주얼 스타일, 파스텔 톤 색상, 미니멀한 디자인 선호" value={preferences} onChange={e => setPreferences(e.target.value)} rows={3}/>
              </div>
              <Button onClick={handleTrendPrediction} disabled={isPredicting || !pastPurchases || !preferences} className="w-full font-bold">
                {isPredicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                트렌드 예측하기
              </Button>
              {predictionError && <p className="text-sm text-destructive">{predictionError}</p>}
              {isPredicting && <p className="text-sm text-center text-muted-foreground">AI가 트렌드를 분석하고 있습니다...</p>}
              {trends && (
                <Card className="mt-6 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">AI 트렌드 분석 결과</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">추천 트렌드 상품</h4>
                      <p className="text-muted-foreground">{trends.trendingProducts}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">이렇게 예측했어요</h4>
                      <p className="text-muted-foreground">{trends.reasoning}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
