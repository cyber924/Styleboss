
"use client";

import { useState, useEffect, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AiProduct } from '@/lib/types';
import { optimizeProductPage } from '@/ai/flows/ai-product-page-optimizer';
import type { ProductPageOptimizerOutput } from '@/ai/flows/ai-product-page-optimizer-types';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, PlusCircle, Wand2, Bot, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const reviewSchema = z.object({
    author: z.string().min(1, "작성자는 필수입니다."),
    rating: z.coerce.number().min(1).max(5),
    text: z.string().min(1, "리뷰 내용은 필수입니다."),
    createdAt: z.string().min(1, "작성일은 필수입니다."),
});

const specificationSchema = z.object({
    key: z.string().min(1, "항목명은 필수입니다."),
    value: z.string().min(1, "내용은 필수입니다."),
});

const optionSchema = z.object({
    name: z.string().min(1, "옵션명은 필수입니다."),
    values: z.string().min(1, "옵션값은 쉼표(,)로 구분하여 하나 이상 입력해주세요."),
});

const aiProductSchema = z.object({
    name: z.string().min(2, "상품명은 2자 이상이어야 합니다."),
    price: z.coerce.number().positive("가격은 0보다 커야 합니다."),
    source: z.enum(["Coupang", "Naver Shopping"]),
    shippingInfo: z.string().min(1, "배송정보는 필수입니다."),
    mainImageUrl: z.string().url("유효한 URL을 입력해주세요."),
    thumbnailImageUrls: z.array(z.string().url("유효한 URL을 입력해주세요.")),
    options: z.array(optionSchema),
    summaryBanner: z.object({
        imageUrl: z.string().url("유효한 URL을 입력해주세요."),
        keyPoints: z.string().min(1, "키포인트는 쉼표(,)로 구분하여 하나 이상 입력해주세요."),
    }),
    detailImageUrls: z.array(z.string().url("유효한 URL을 입력해주세요.")),
    specifications: z.array(specificationSchema),
    usagePrecautions: z.string().min(1, "주의사항은 필수입니다."),
    reviews: z.array(reviewSchema),
    exchangeReturnInfo: z.string().min(1, "교환/반품 정보는 필수입니다."),
});

type AiProductFormValues = z.infer<typeof aiProductSchema>;

function SectionCard({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        </Card>
    );
}

export default function AiProductEditPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    
    const [isSaving, startSavingTransition] = useTransition();
    const [isGenerating, startGeneratingTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState<AiProduct | null>(null);

    const form = useForm<AiProductFormValues>({
        resolver: zodResolver(aiProductSchema),
        defaultValues: {
            thumbnailImageUrls: [],
            detailImageUrls: [],
            options: [],
            specifications: [],
            reviews: [],
        },
    });

    useEffect(() => {
        if (!productId) return;
        setIsLoading(true);
        getDoc(doc(db, "ai_products", productId))
            .then(docSnap => {
                if (docSnap.exists()) {
                    const data = docSnap.data() as AiProduct;
                    setProduct(data);
                    form.reset({
                        ...data,
                        options: data.options.map(o => ({ ...o, values: o.values.join(', ') })),
                        summaryBanner: {
                            ...data.summaryBanner,
                            keyPoints: data.summaryBanner.keyPoints.join(', '),
                        },
                    });
                } else {
                    toast({ title: "오류", description: "상품을 찾을 수 없습니다.", variant: "destructive" });
                    router.push("/admin/ai-product-manage");
                }
            })
            .finally(() => setIsLoading(false));
    }, [productId, form, router, toast]);

    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({ control: form.control, name: "options" });
    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({ control: form.control, name: "specifications" });
    const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({ control: form.control, name: "reviews" });
    const { fields: thumbFields, append: appendThumb, remove: removeThumb } = useFieldArray({ control: form.control, name: "thumbnailImageUrls" });
    const { fields: detailImgFields, append: appendDetailImg, remove: removeDetailImg } = useFieldArray({ control: form.control, name: "detailImageUrls" });

    const onSubmit = (values: AiProductFormValues) => {
        startSavingTransition(async () => {
            try {
                const dataToSave = {
                    ...values,
                    options: values.options.map(o => ({ ...o, values: o.values.split(',').map(s => s.trim()) })),
                    summaryBanner: {
                        ...values.summaryBanner,
                        keyPoints: values.summaryBanner.keyPoints.split(',').map(s => s.trim()),
                    },
                    updatedAt: serverTimestamp(),
                };
                await updateDoc(doc(db, "ai_products", productId), dataToSave);
                toast({ title: "성공", description: "상품 정보가 성공적으로 업데이트되었습니다." });
            } catch (e) {
                console.error(e);
                toast({ title: "오류", description: `저장에 실패했습니다: ${e instanceof Error ? e.message : 'Unknown error'}`, variant: "destructive" });
            }
        });
    };
    
    const handleAiOptimize = () => {
        if (!product) return;
        startGeneratingTransition(async () => {
            toast({ title: "AI 분석 시작", description: "AI가 페이지 최적화 작업을 시작합니다. 잠시만 기다려주세요..." });
            try {
                const result = await optimizeProductPage({
                    productName: product.name,
                    productPrice: product.price,
                    keyPoints: product.summaryBanner.keyPoints,
                    specifications: product.specifications,
                    existingReviews: product.reviews
                });

                const { summary, storyline } = result;

                // Handle review summary
                if(summary.reviewSummary) {
                    const updatedReviews = form.getValues('reviews');
                    const newSummary = `[AI 요약: ${summary.reviewSummary}] \n긍정 키워드: #${summary.positiveKeywords.join(' #')} \n부정 키워드: #${summary.negativeKeywords.join(' #')}`;
                    
                    form.setValue('usagePrecautions', `${form.getValues('usagePrecautions')}\n\n${newSummary}`);
                    toast({ title: "AI 리뷰 요약 완료", description: "'사용법/주의사항' 항목에 분석 결과가 추가되었습니다." });
                }

            } catch (e) {
                 toast({ title: "AI 최적화 오류", description: `AI 작업 중 오류가 발생했습니다: ${e instanceof Error ? e.message : 'Unknown error'}`, variant: "destructive" });
            }
        });
    };

    if (isLoading) {
        return <div className="container py-12 flex justify-center"><Loader2 className="h-16 w-16 animate-spin" /></div>;
    }

    return (
        <div className="container py-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">AI 상품 수정</h1>
                            <p className="text-muted-foreground">상품의 모든 정보를 수정하고 AI로 콘텐츠를 강화하세요.</p>
                        </div>
                        <div className="flex gap-2">
                           <Button type="button" variant="outline" onClick={handleAiOptimize} disabled={isGenerating || isSaving}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                                AI로 페이지 최적화
                            </Button>
                            <Button type="submit" disabled={isSaving || isGenerating}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                저장하기
                            </Button>
                        </div>
                    </div>
                    
                    <Separator />
                    
                    {isGenerating && (
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI가 작업 중입니다...</AlertTitle>
                            <AlertDescription>콘텐츠를 분석하고 재구성하고 있습니다. 최대 1~2분 소요될 수 있습니다.</AlertDescription>
                        </Alert>
                    )}


                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                             <SectionCard title="기본 정보" description="상품의 가장 기본적인 정보를 입력합니다.">
                                 <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>상품명</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                 <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="price" render={({ field }) => ( <FormItem><FormLabel>가격</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="source" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>출처</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent><SelectItem value="Naver Shopping">Naver Shopping</SelectItem><SelectItem value="Coupang">Coupang</SelectItem></SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                 </div>
                                <FormField control={form.control} name="shippingInfo" render={({ field }) => ( <FormItem><FormLabel>배송정보</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </SectionCard>
                            
                            <SectionCard title="이미지 URL" description="상품과 관련된 모든 이미지의 URL을 관리합니다.">
                                <FormField control={form.control} name="mainImageUrl" render={({ field }) => ( <FormItem><FormLabel>대표 이미지 (1000x1000)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <Separator/>
                                <DynamicFieldArray title="썸네일 이미지 (500x500)" name="thumbnailImageUrls" fields={thumbFields} remove={removeThumb} append={() => appendThumb({value: ""})} form={form} />
                                <Separator/>
                                <DynamicFieldArray title="상세 이미지" name="detailImageUrls" fields={detailImgFields} remove={removeDetailImg} append={() => appendDetailImg({value: ""})} form={form} />
                            </SectionCard>

                            <SectionCard title="요약 배너" description="상세페이지 상단에 노출될 강조 정보입니다.">
                               <FormField control={form.control} name="summaryBanner.imageUrl" render={({ field }) => ( <FormItem><FormLabel>배너 이미지 URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                               <FormField control={form.control} name="summaryBanner.keyPoints" render={({ field }) => ( <FormItem><FormLabel>키포인트 (쉼표로 구분)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </SectionCard>

                        </div>
                        <div className="space-y-8">
                             <SectionCard title="옵션">
                                {optionFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md space-y-2 relative">
                                        <FormField control={form.control} name={`options.${index}.name`} render={({ field }) => ( <FormItem><FormLabel>옵션명 (예: 색상)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`options.${index}.values`} render={({ field }) => ( <FormItem><FormLabel>옵션값 (쉼표로 구분, 예: 블랙,화이트)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendOption({ name: '', values: '' })}><PlusCircle className="mr-2 h-4 w-4" />옵션 추가</Button>
                             </SectionCard>
                             <SectionCard title="상품 스펙">
                                {specFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md space-y-2 relative">
                                        <FormField control={form.control} name={`specifications.${index}.key`} render={({ field }) => ( <FormItem><FormLabel>항목명 (예: 소재)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`specifications.${index}.value`} render={({ field }) => ( <FormItem><FormLabel>내용 (예: 면 100%)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => removeSpec(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                 <Button type="button" variant="outline" size="sm" onClick={() => appendSpec({ key: '', value: '' })}><PlusCircle className="mr-2 h-4 w-4" />스펙 추가</Button>
                             </SectionCard>
                             <SectionCard title="기타 정보">
                                 <FormField control={form.control} name="usagePrecautions" render={({ field }) => ( <FormItem><FormLabel>사용법/주의사항</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem> )} />
                                 <FormField control={form.control} name="exchangeReturnInfo" render={({ field }) => ( <FormItem><FormLabel>교환/반품 안내</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem> )} />
                             </SectionCard>
                              <SectionCard title="리뷰">
                                {reviewFields.map((field, index) => (
                                    <div key={field.id} className="p-4 border rounded-md space-y-2 relative">
                                        <FormField control={form.control} name={`reviews.${index}.author`} render={({ field }) => ( <FormItem><FormLabel>작성자</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`reviews.${index}.rating`} render={({ field }) => ( <FormItem><FormLabel>평점 (1-5)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`reviews.${index}.text`} render={({ field }) => ( <FormItem><FormLabel>리뷰 내용</FormLabel><FormControl><Textarea {...field} rows={3} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name={`reviews.${index}.createdAt`} render={({ field }) => ( <FormItem><FormLabel>작성일 (예: 2024.07.30)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 text-destructive" onClick={() => removeReview(index)}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => appendReview({ author: '', rating: 5, text: '', createdAt: '' })}><PlusCircle className="mr-2 h-4 w-4" />리뷰 추가</Button>
                             </SectionCard>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

function DynamicFieldArray({ title, name, fields, remove, append, form }: { title: string, name: any, fields: {id: string}[], remove: (index: number) => void, append: () => void, form: any }) {
    return (
        <div className="space-y-2">
            <FormLabel>{title}</FormLabel>
            {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                    <FormField
                        control={form.control}
                        name={`${name}.${index}`}
                        render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={append}><PlusCircle className="mr-2 h-4 w-4" />URL 추가</Button>
        </div>
    );
}
