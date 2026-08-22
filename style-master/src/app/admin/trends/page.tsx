
"use client";

import { useState, useTransition } from "react";
import { recommendTrends, TrendRecommendationOutput } from "@/ai/flows/trend-recommendation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2, Bot } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";

type Recommendation = TrendRecommendationOutput["recommendations"][0];

export default function TrendRecommendationPage() {
  const { toast } = useToast();
  const [isGenerating, startGeneratingTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!query) return;
    startGeneratingTransition(async () => {
      setError(null);
      setRecommendations([]);
      setSelectedIndices([]);
      try {
        const result = await recommendTrends({ query });
        setRecommendations(result.recommendations);
      } catch (e) {
        console.error(e);
        setError("추천 상품 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        toast({
          title: "오류",
          description: "추천 상품 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
    });
  };
  
  const handleSave = () => {
    if (selectedIndices.length === 0) {
        toast({
            title: "오류",
            description: "저장할 상품을 하나 이상 선택해주세요.",
            variant: "destructive",
        });
        return;
    }
    
    startSavingTransition(async () => {
        const selectedProducts = selectedIndices.map(index => recommendations[index]);
        toast({ title: '상품 저장 시작', description: `선택된 ${selectedProducts.length}개 상품을 DB에 저장합니다.` });
        
        try {
            const batch = writeBatch(db);
            const productsCollection = collection(db, 'ai_products');

            selectedProducts.forEach((product) => {
                const docRef = doc(productsCollection);
                const productData = {
                  name: product.name,
                  price: product.price,
                  source: 'AI-Generated',
                  mainImageUrl: 'https://placehold.co/1000x1000.png',
                  thumbnailImageUrls: ['https://placehold.co/500x500.png'],
                  shippingInfo: '배송 정보 입력 필요',
                  options: [{ name: '기본', values: ['단일 옵션'] }],
                  summaryBanner: {
                    imageUrl: 'https://placehold.co/800x400.png',
                    keyPoints: ['#AI추천'],
                  },
                  detailImageUrls: ['https://placehold.co/800x1200.png'],
                  specifications: [{ key: '소재', value: '상세 정보 필요' }],
                  usagePrecautions: '상세 정보 필요',
                  reviews: [],
                  exchangeReturnInfo: '상세 정보 필요',
                  createdAt: serverTimestamp(),
                };
                batch.set(docRef, productData);
            });
            
            await batch.commit();
            
            toast({
                title: "AI 상품 등록 성공!",
                description: `${selectedProducts.length}개의 AI 상품이 기본 정보와 함께 성공적으로 등록되었습니다.`,
            });

            // Reset after saving
            setRecommendations([]);
            setSelectedIndices([]);
            setQuery("");

        } catch (error) {
            console.error("Error saving trend products:", error);
            const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
            toast({
                title: "오류",
                description: `상품 등록에 실패했습니다: ${message}`,
                variant: "destructive",
            });
        }
    });
  };

  const handleSelect = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedIndices([...selectedIndices, index]);
    } else {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    }
  };

  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI 트렌드 상품 추천
          </CardTitle>
          <CardDescription>
            원하는 트렌드나 컨셉을 입력하면 AI가 10개의 상품 아이디어를 제안합니다. 마음에 드는 상품을 선택하여 상세 정보와 함께 바로 DB에 저장할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Textarea
              placeholder="예: Y2K 감성의 여름 바캉스룩, 미니멀한 오피스룩"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
            <Button onClick={handleGenerate} disabled={isGenerating || !query} className="w-full font-bold">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              AI로 추천받기
            </Button>
            {error && <p className="text-sm text-center text-destructive">{error}</p>}
          </div>

          {isGenerating && (
            <div className="text-center text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                <p>AI가 최신 트렌드를 분석하여 상품을 구상하고 있습니다...</p>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="space-y-4">
              <CardTitle>AI 추천 리스트</CardTitle>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px] text-center"><Checkbox 
                        checked={selectedIndices.length === recommendations.length && recommendations.length > 0}
                        onCheckedChange={(checked) => {
                            if (checked) {
                                setSelectedIndices(recommendations.map((_, i) => i));
                            } else {
                                setSelectedIndices([]);
                            }
                        }}
                      /></TableHead>
                      <TableHead>상품명</TableHead>
                      <TableHead>상품설명</TableHead>
                      <TableHead className="text-right">가격</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recommendations.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIndices.includes(index)}
                            onCheckedChange={(checked) => handleSelect(index, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.price.toLocaleString()}원</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={handleSave} disabled={isSaving || isGenerating || selectedIndices.length === 0} className="w-full font-bold">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                선택 상품 DB에 저장 ({selectedIndices.length}개)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
