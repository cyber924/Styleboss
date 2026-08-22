
"use client";

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Images, Loader2, UploadCloud, Wand2, Save, AlertCircle, RefreshCw, ArchiveRestore } from 'lucide-react';
import { generateSimilarImages, type SimilarImagesOutput } from '@/ai/flows/generate-similar-images';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

type GeneratedImageType = keyof SimilarImagesOutput;

const imageTypes: { key: GeneratedImageType; label: string }[] = [
    { key: 'productShot', label: '제품컷' },
    { key: 'lifestyleShot', label: '모델컷' },
    { key: 'flatLayShot', label: '감성 연출컷 (Flat Lay)' },
    { key: 'detailShot', label: '디테일컷' },
];

const SESSION_STORAGE_KEY = 'similar-images-cache';

function GeneratedImageCard({ title, src, alt, isChecked, onCheckedChange }: { title: string, src: string, alt: string, isChecked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <Checkbox checked={isChecked} onCheckedChange={onCheckedChange} id={title} />
            </CardHeader>
            <CardContent>
                <div className="aspect-[4/5] relative w-full rounded-md overflow-hidden bg-muted">
                    <Image src={src} alt={alt} fill className="object-cover" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function SimilarImageGenerationPage() {
    const { toast } = useToast();
    const [isGenerating, startGeneratingTransition] = useTransition();
    const [isSaving, startSavingTransition] = useTransition();

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<SimilarImagesOutput | null>(null);
    const [selectedImages, setSelectedImages] = useState<Record<GeneratedImageType, boolean>>({ productShot: false, lifestyleShot: false, flatLayShot: false, detailShot: false });
    const [isLoadedFromCache, setIsLoadedFromCache] = useState(false);

    useEffect(() => {
        try {
            const cachedData = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (cachedData) {
                const { uploadedImage, uploadedFileName, generatedImages: cachedGeneratedImages } = JSON.parse(cachedData);
                if (uploadedImage && uploadedFileName && cachedGeneratedImages) {
                    setUploadedImage(uploadedImage);
                    setUploadedFileName(uploadedFileName);
                    setGeneratedImages(cachedGeneratedImages);
                    setSelectedImages({ productShot: true, lifestyleShot: true, flatLayShot: true, detailShot: true });
                    setIsLoadedFromCache(true);
                    toast({
                        title: "임시 저장된 작업 복원",
                        description: "이전에 생성했던 이미지 데이터를 불러왔습니다.",
                    });
                }
            }
        } catch (e) {
            console.error("Failed to parse cached data from sessionStorage", e);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, [toast]);

    const handleClearCache = (showToast = true) => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setUploadedImage(null);
        setUploadedFileName(null);
        setGeneratedImages(null);
        setSelectedImages({ productShot: false, lifestyleShot: false, flatLayShot: false, detailShot: false });
        setIsLoadedFromCache(false);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
        if (showToast) {
            toast({
                title: "작업 초기화 완료",
                description: "모든 이미지와 임시 데이터가 삭제되었습니다."
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleClearCache(false);
            const name = file.name.split('.').slice(0, -1).join('.');
            setUploadedFileName(name);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = () => {
        if (!uploadedImage || !uploadedFileName) return;

        startGeneratingTransition(async () => {
            setGeneratedImages(null);
            setIsLoadedFromCache(false);
            try {
                const result = await generateSimilarImages({ imageDataUri: uploadedImage, productName: uploadedFileName });
                setGeneratedImages(result);
                setSelectedImages({ productShot: true, lifestyleShot: true, flatLayShot: true, detailShot: true });
                
                const cachePayload = { uploadedImage, uploadedFileName, generatedImages: result };
                
                try {
                    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cachePayload));
                    toast({
                        title: "성공! 임시 저장 완료",
                        description: "AI 유사 이미지가 성공적으로 생성되어 브라우저에 임시 저장되었습니다.",
                    });
                } catch (e) {
                    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
                        toast({
                            title: "경고: 임시 저장 실패",
                            description: "브라우저 저장 공간이 부족합니다. 새로고침하면 작업 내용이 사라지니, 결과를 바로 클라우드에 저장해주세요.",
                            variant: "destructive",
                            duration: 10000,
                        });
                    } else {
                        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                        toast({
                            title: "경고: 임시 저장 실패",
                            description: `알 수 없는 오류로 임시 저장에 실패했습니다: ${errorMessage}`,
                            variant: "destructive",
                        });
                    }
                }

            } catch (error) {
                console.error("Error generating similar images: ", error);
                const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                toast({
                    title: "오류",
                    description: `이미지 생성 중 오류 발생: ${errorMessage}`,
                    variant: "destructive",
                });
            }
        });
    };

    const handleSave = () => {
        if (!generatedImages || !uploadedFileName) return;

        const imagesToSave: { key: GeneratedImageType, dataUri: string }[] = [];
        (Object.keys(selectedImages) as Array<keyof typeof selectedImages>).forEach(key => {
            if (selectedImages[key] && generatedImages[key]) {
                imagesToSave.push({ key, dataUri: generatedImages[key] });
            }
        });

        if (imagesToSave.length === 0) {
            toast({ title: "저장할 이미지를 선택해주세요.", variant: "destructive" });
            return;
        }

        startSavingTransition(async () => {
            const uploadPromises = imagesToSave.map(async (image) => {
                const sanitizedProductName = uploadedFileName.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
                const filePath = `uploads/similar-${sanitizedProductName}-${image.key}-${Date.now()}.png`;
                const storageRef = ref(storage, filePath);
                
                await uploadString(storageRef, image.dataUri, 'data_url');
                return getDownloadURL(storageRef);
            });

            try {
                const urls = await Promise.all(uploadPromises);
                toast({
                    title: '저장 성공!',
                    description: `스토리지에 ${urls.length}개의 이미지가 성공적으로 저장되었습니다.`,
                });
            } catch (error) {
                console.error("Error saving images to storage from client: ", error);
                const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
                toast({
                    title: '저장 실패',
                    description: `클라이언트 측 저장 오류: ${errorMessage}. Firestore 보안 규칙을 확인해주세요.`,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleCheckboxChange = (key: GeneratedImageType, checked: boolean) => {
        setSelectedImages(prev => ({ ...prev, [key]: checked }));
    };

    return (
        <div className="container py-12">
            <Card className="max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Images className="h-6 w-6 text-primary" />
                        AI 유사 이미지 생성
                    </CardTitle>
                    <CardDescription>
                        참고 이미지를 업로드하면, AI가 제품컷, 모델컷 등 다양한 스타일의 새로운 이미지를 생성합니다. 생성된 결과는 브라우저를 닫기 전까지 임시 저장됩니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="bg-muted/30 p-6">
                        <div className="grid gap-4 md:grid-cols-2">
                             <div>
                                <label htmlFor="image-upload" className="block text-sm font-medium text-foreground mb-2">1. 이미지 업로드</label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
                                        </div>
                                        <Input id="image-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-foreground mb-2">업로드된 이미지</label>
                                <div className="w-full h-40 rounded-lg bg-background flex items-center justify-center overflow-hidden">
                                    {uploadedImage ? (
                                        <Image src={uploadedImage} alt={uploadedFileName || 'Uploaded preview'} width={150} height={150} className="max-h-full w-auto object-contain" />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">이미지 미리보기</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                            <Button onClick={handleGenerate} disabled={isGenerating || !uploadedImage} className="w-full font-bold">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                2. AI로 생성하기
                            </Button>
                            <Button onClick={() => handleClearCache(true)} variant="outline" className="w-full sm:w-auto">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                새로 시작
                            </Button>
                        </div>
                    </Card>

                    {isLoadedFromCache && (
                         <Alert>
                            <ArchiveRestore className="h-4 w-4" />
                            <AlertTitle>작업 복원 완료</AlertTitle>
                            <AlertDescription>
                              이전에 생성했던 이미지를 불러왔습니다. 다시 생성하거나, 결과를 확인하고 저장할 수 있습니다.
                            </AlertDescription>
                        </Alert>
                    )}

                    {isGenerating && (
                        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">AI가 다양한 스타일의 이미지를 생성하고 있습니다...</p>
                            <p className="text-sm">최대 2분 정도 소요될 수 있습니다. 잠시만 기다려주세요.</p>
                        </div>
                    )}

                    {generatedImages && !isGenerating && (
                        <div className="space-y-6">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>3. 결과 확인 및 저장</AlertTitle>
                                <AlertDescription>
                                  생성된 이미지 중 원하는 결과물을 선택하여 클라우드 스토리지에 영구 저장하세요.
                                </AlertDescription>
                            </Alert>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {imageTypes.map(({ key, label }) => (
                                     <GeneratedImageCard 
                                        key={key}
                                        title={label}
                                        src={generatedImages[key]}
                                        alt={`${label} for ${uploadedFileName || 'uploaded product'}`}
                                        isChecked={selectedImages[key]}
                                        onCheckedChange={(checked) => handleCheckboxChange(key, Boolean(checked))}
                                     />
                                ))}
                            </div>
                             <Button onClick={handleSave} disabled={isSaving || Object.values(selectedImages).every(v => !v)} size="lg" className="w-full">
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                선택한 이미지 스토리지에 저장 ({Object.values(selectedImages).filter(v => v).length}개)
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
