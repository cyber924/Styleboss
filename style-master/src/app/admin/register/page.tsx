
"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Wand2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Label } from "@/components/ui/label";

const productSchema = z.object({
  name: z.string().min(2, "상품명은 2자 이상이어야 합니다."),
  price: z.coerce.number().positive("가격은 0보다 커야 합니다."),
  description: z.string().min(10, "상품 설명은 10자 이상이어야 합니다."),
  category: z.enum(["latest", "popular", "all"], {
    required_error: "카테고리를 선택해주세요.",
  }),
  imageUrl: z.string().url("유효한 이미지 URL을 입력해주세요."),
});

// A dummy AI function for demonstration. In a real scenario, this would call a Genkit flow.
const generateProductDetailsFromAI = async (keyword: string): Promise<{name: string, description: string}> => {
    // This is a placeholder simulation of an AI call.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (keyword.includes('에러')) {
        throw new Error("AI 생성 중 서버 오류 발생");
    }

    return {
        name: `[AI 추천] ${keyword}`,
        description: `이 상품은 '${keyword}' 컨셉을 바탕으로 AI가 특별히 디자인한 아이템입니다. 트렌디한 디자인과 편안한 착용감을 동시에 만족시키며, 당신의 일상을 더욱 특별하게 만들어줄 것입니다. 최고급 소재를 사용하여 품질을 보장하며, 어떤 스타일에도 자연스럽게 어울립니다. 지금 바로 만나보세요!`
    };
};


export default function ProductRegisterPage() {
  const { toast } = useToast();
  const [isRegistering, startRegisterTransition] = useTransition();
  const [isGenerating, startGeneratingTransition] = useTransition();
  const [aiKeyword, setAiKeyword] = useState("");

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      description: "",
      imageUrl: "",
    },
  });

  const handleAiGenerate = () => {
    if (!aiKeyword) return;

    startGeneratingTransition(async () => {
      try {
        const { name, description } = await generateProductDetailsFromAI(aiKeyword);
        form.setValue("name", name);
        form.setValue("description", description);
        toast({
          title: "AI 생성 완료!",
          description: "AI가 생성한 상품명과 설명이 입력되었습니다.",
        });
      } catch (error) {
        toast({
          title: "AI 생성 오류",
          description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    });
  };

  function onSubmit(values: z.infer<typeof productSchema>) {
    startRegisterTransition(async () => {
      try {
        const dataAiHint = values.name.split(' ').slice(0, 2).join(' ');
        
        await addDoc(collection(db, "products"), {
          ...values,
          dataAiHint,
          createdAt: serverTimestamp(),
        });
        
        toast({
          title: "성공!",
          description: "상품이 성공적으로 등록되었습니다.",
        });
        form.reset();
        setAiKeyword("");
      } catch (error) {
        console.error("Error adding product:", error);
        toast({
          title: "오류",
          description: "상품 등록에 실패했습니다. Firestore 보안 규칙을 확인해주세요.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="container py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>상품 등록</CardTitle>
          <CardDescription>새로운 상품 정보를 입력하여 등록합니다. AI의 도움을 받을 수도 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <Card className="bg-muted/30">
             <CardContent className="p-6 space-y-4">
                <Label htmlFor="ai-keyword">AI로 상품명/설명 생성</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input 
                        id="ai-keyword"
                        placeholder="키워드를 입력하세요 (예: 여름 바캉스 원피스)" 
                        value={aiKeyword}
                        onChange={(e) => setAiKeyword(e.target.value)}
                        disabled={isGenerating}
                    />
                    <Button 
                        type="button" 
                        onClick={handleAiGenerate} 
                        disabled={isGenerating || !aiKeyword}
                        className="w-full sm:w-auto"
                    >
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        생성하기
                    </Button>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                    원하는 상품의 컨셉 키워드를 입력하면, AI가 상품명과 설명을 자동으로 채워줍니다.
                </p>
             </CardContent>
           </Card>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상품명</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 에센셜 오버핏 셔츠" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>가격</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="예: 42000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>상품 설명</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="상품에 대한 자세한 설명을 입력해주세요."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>카테고리</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="latest">최신</SelectItem>
                        <SelectItem value="popular">인기</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이미지 URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      상품 이미지의 전체 URL을 입력해주세요.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={isRegistering || isGenerating}>
                {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {isRegistering ? "등록 중..." : "상품 등록하기"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
