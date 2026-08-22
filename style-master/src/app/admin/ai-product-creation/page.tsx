
"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Wand2, Bot } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createAiProduct } from "@/ai/flows/ai-product-creation";
import type { AiProductCreationOutput } from "@/ai/flows/ai-product-creation";
import { Label } from "@/components/ui/label";

// Zod schema for the form, mapping the AI output
const FormSchema = z.object({
  name: z.string().min(1, "상품명은 필수입니다."),
  price: z.coerce.number().positive("가격은 0보다 커야 합니다."),
  shippingInfo: z.string().min(1, "배송정보는 필수입니다."),
  options: z.array(z.object({
    name: z.string(),
    values: z.string(), // For UI, we use a single string
  })),
  specifications: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  usagePrecautions: z.string(),
  exchangeReturnInfo: z.string(),
  summaryBanner: z.object({
    keyPoints: z.string(), // For UI, we use a single string
  }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function AiProductCreationPage() {
  const { toast } = useToast();
  const [isGenerating, startGeneratingTransition] = useTransition();
  const [isSaving, startSavingTransition] = useTransition();

  const [concept, setConcept] = useState("");
  const [generatedProduct, setGeneratedProduct] = useState<AiProductCreationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const handleAiGenerate = () => {
    if (!concept) return;
    startGeneratingTransition(async () => {
      setError(null);
      setGeneratedProduct(null);
      form.reset({});
      
      try {
        const result = await createAiProduct({ concept });
        setGeneratedProduct(result);
        
        // Populate form with AI generated data
        form.reset({
          name: result.name,
          price: result.price,
          shippingInfo: result.shippingInfo,
          options: result.options.map(o => ({ ...o, values: o.values.join(', ') })),
          specifications: result.specifications,
          usagePrecautions: result.usagePrecautions,
          exchangeReturnInfo: result.exchangeReturnInfo,
          summaryBanner: {
            keyPoints: result.summaryBanner.keyPoints.join(', '),
          },
        });

        toast({
          title: "AI 상품 기획 완료!",
          description: "AI가 생성한 상품 기획안을 확인하고 등록하세요.",
        });
      } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "알 수 없는 오류가 발생했습니다.";
        setError(`AI 기획안 생성에 실패했습니다: ${errorMessage}`);
        toast({
          title: "오류",
          description: `AI 기획안 생성에 실패했습니다.`,
          variant: "destructive",
        });
      }
    });
  };

  const onSubmit = (values: FormValues) => {
    startSavingTransition(async () => {
      try {
        const productData = {
          ...values,
          source: 'AI-Generated',
          mainImageUrl: 'https://placehold.co/1000x1000.png',
          thumbnailImageUrls: ['https://placehold.co/500x500.png'],
          detailImageUrls: ['https://placehold.co/800x1200.png'],
          reviews: [],
          options: values.options.map(o => ({ ...o, values: o.values.split(',').map(s => s.trim()) })),
          summaryBanner: {
            imageUrl: 'https://placehold.co/800x400.png',
            keyPoints: values.summaryBanner.keyPoints.split(',').map(s => s.trim()),
          },
          createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'ai_products'), productData);

        toast({
          title: "AI 상품 등록 성공!",
          description: "새로운 AI 상품이 성공적으로 등록되었습니다.",
        });

        // Reset everything after successful save
        form.reset({});
        setGeneratedProduct(null);
        setConcept("");
        setError(null);

      } catch (err) {
        console.error("Error saving AI product:", err);
        const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        toast({
          title: "오류",
          description: `상품 등록에 실패했습니다: ${message}`,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            [AI] 상품 기획
          </CardTitle>
          <CardDescription>
            상품 컨셉 키워드 하나만 입력하세요. AI가 상품명, 가격, 상세정보까지 포함된 완벽한 상품 기획안을 생성해드립니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-muted/30 p-6">
            <div className="space-y-2">
              <Label htmlFor="ai-concept" className="text-base font-semibold">상품 컨셉</Label>
              <Textarea
                id="ai-concept"
                placeholder="예: Y2K 감성의 핑크색 벨벳 트레이닝 세트, 출근용으로도 손색없는 미니멀한 디자인의 여름용 쿨링 슬랙스"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                rows={3}
                disabled={isGenerating}
              />
            </div>
            <Button onClick={handleAiGenerate} disabled={isGenerating || !concept} className="w-full font-bold mt-4">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              AI로 상품 기획안 생성하기
            </Button>
            {error && <p className="text-sm text-center text-destructive mt-2">{error}</p>}
          </Card>
          
          {isGenerating && (
            <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg">AI가 시장 조사를 바탕으로 상품을 기획하고 있습니다...</p>
                <p className="text-sm">최대 1~2분 정도 소요될 수 있습니다.</p>
            </div>
          )}

          {generatedProduct && (
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <Alert>
                 <Sparkles className="h-4 w-4" />
                 <AlertTitle>AI 기획안 생성 완료!</AlertTitle>
                 <AlertDescription>
                   아래는 AI가 생성한 상품 기획안입니다. 내용을 자유롭게 수정하고, 임시 이미지를 교체한 후 최종 등록하세요.
                 </AlertDescription>
               </Alert>
               
               <Card>
                 <CardHeader>
                   <CardTitle>기본 정보</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <div>
                                <Label>상품명 (SEO 최적화)</Label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <Controller
                            name="price"
                            control={form.control}
                            render={({ field }) => (
                                <div>
                                    <Label>시장 분석 기반 추천 가격</Label>
                                    <Input type="number" {...field} />
                                </div>
                            )}
                        />
                         <Controller
                            name="shippingInfo"
                            control={form.control}
                            render={({ field }) => (
                                <div>
                                    <Label>배송 정보</Label>
                                    <Input {...field} />
                                </div>
                            )}
                        />
                     </div>
                 </CardContent>
               </Card>
               
               <Card>
                 <CardHeader>
                   <CardTitle>상세 정보</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <Controller
                        name="summaryBanner.keyPoints"
                        control={form.control}
                        render={({ field }) => (
                            <div>
                                <Label>요약 배너 키포인트 (쉼표로 구분)</Label>
                                <Input {...field} />
                            </div>
                        )}
                    />
                    <div>
                      <Label>상품 옵션</Label>
                      {form.watch('options')?.map((option, index) => (
                        <div key={index} className="flex gap-2 mt-1">
                          <Input value={option.name} disabled className="w-1/3" />
                          <Input value={option.values} disabled />
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>상품 스펙</Label>
                      {form.watch('specifications')?.map((spec, index) => (
                        <div key={index} className="flex gap-2 mt-1">
                          <Input value={spec.key} disabled className="w-1/3"/>
                          <Input value={spec.value} disabled />
                        </div>
                      ))}
                    </div>
                    <Controller
                      name="usagePrecautions"
                      control={form.control}
                      render={({ field }) => (
                          <div>
                              <Label>사용법/주의사항</Label>
                              <Textarea {...field} rows={3} />
                          </div>
                      )}
                    />
                     <Controller
                      name="exchangeReturnInfo"
                      control={form.control}
                      render={({ field }) => (
                          <div>
                              <Label>교환/반품 안내</Label>
                              <Textarea {...field} rows={3} />
                          </div>
                      )}
                    />
                 </CardContent>
                 <CardFooter>
                    <Button type="submit" disabled={isSaving || isGenerating} className="w-full font-bold">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                        이 내용으로 AI 상품 등록하기
                    </Button>
                 </CardFooter>
               </Card>
             </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
