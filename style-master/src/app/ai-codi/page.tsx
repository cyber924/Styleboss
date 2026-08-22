
"use client";

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { generatePersonalCodi } from '@/ai/flows/personal-codi-flow';
import type { PersonalCodiOutput } from '@/ai/flows/personal-codi-types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UploadCloud, Wand2, Camera, RefreshCw, Download } from 'lucide-react';

type StyleSuggestion = PersonalCodiOutput['suggestions'][0];

function StyleSuggestionCard({ suggestion }: { suggestion: StyleSuggestion }) {
    
    const handleDownload = (item: StyleSuggestion['top'] | StyleSuggestion['bottom']) => {
        const link = document.createElement('a');
        link.href = item.imageUrl;
        // Sanitize name for filename
        const fileName = `${item.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Card className="bg-background/50 w-full">
            <CardHeader>
                <CardTitle className="text-xl text-primary">{suggestion.conceptTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">상의</h3>
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-md">
                        <Image src={suggestion.top.imageUrl} alt={suggestion.top.name} fill className="object-cover" />
                    </div>
                    <p className="font-bold">{suggestion.top.name}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.top.description}</p>
                    <p className="text-sm">예상 가격: <span className="font-semibold">{suggestion.top.priceTier}</span></p>
                    <Button 
                        className="w-full" 
                        onClick={() => handleDownload(suggestion.top)}
                        variant="secondary"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        이미지 다운로드
                    </Button>
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">하의</h3>
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden shadow-md">
                        <Image src={suggestion.bottom.imageUrl} alt={suggestion.bottom.name} fill className="object-cover" />
                    </div>
                    <p className="font-bold">{suggestion.bottom.name}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.bottom.description}</p>
                    <p className="text-sm">예상 가격: <span className="font-semibold">{suggestion.bottom.priceTier}</span></p>
                     <Button 
                        className="w-full" 
                        onClick={() => handleDownload(suggestion.bottom)}
                        variant="secondary"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        이미지 다운로드
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AiCodiPage() {
    const { toast } = useToast();
    const [isGenerating, startGeneratingTransition] = useTransition();

    const [userImage, setUserImage] = useState<string | null>(null);
    const [results, setResults] = useState<PersonalCodiOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserImage(reader.result as string);
                setResults(null);
                setError(null);
                setShowCamera(false);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

    const handleGenerate = () => {
        if (!userImage) return;

        startGeneratingTransition(async () => {
            setResults(null);
            setError(null);
            try {
                const result = await generatePersonalCodi({ userImage });
                setResults(result);
                 toast({
                    title: "AI 코디 제안 도착!",
                    description: "당신만을 위한 스타일링을 확인해보세요.",
                });
            } catch (err) {
                console.error(err);
                const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
                setError(`AI 코디 생성에 실패했습니다: ${errorMessage}`);
                toast({
                    title: "오류 발생",
                    description: "AI 코디 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
                    variant: "destructive"
                });
            }
        });
    };
    
    const handleCameraToggle = async () => {
        if (!showCamera) {
            setShowCamera(true); // Show camera UI immediately
        } else {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
            setShowCamera(false);
            setHasCameraPermission(false);
        }
    };

    useEffect(() => {
        if (!showCamera) return;

        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            setShowCamera(false);
            toast({
              variant: 'destructive',
              title: '카메라 접근이 거부되었습니다',
              description: '브라우저 설정에서 카메라 권한을 허용해주세요.',
            });
          }
        };
    
        getCameraPermission();
      }, [showCamera, toast]);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            setUserImage(canvas.toDataURL('image/png'));
            handleCameraToggle(); // Turn off camera after capture
        }
    };

    const handleReset = () => {
        setUserImage(null);
        setResults(null);
        setError(null);
        if (showCamera) {
            handleCameraToggle();
        }
    }

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold font-headline tracking-tight">AI 퍼스널 코디네이터</h1>
                <p className="mt-2 text-lg text-muted-foreground">당신의 사진 한 장으로, AI가 숨겨진 스타일을 찾아드립니다.</p>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>1. 사진 업로드 또는 촬영</CardTitle>
                    <CardDescription>가장 잘 나온 전신 사진을 올려주시거나, 카메라로 바로 촬영해주세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {!userImage && !showCamera && (
                         <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                            <input {...getInputProps()} />
                            <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground" />
                            <p className="mb-2 text-lg text-foreground">이곳에 파일을 드래그하거나 클릭하여 업로드</p>
                            <p className="text-sm text-muted-foreground">또는</p>
                             <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleCameraToggle(); }} className="mt-2">
                                <Camera className="mr-2" /> 카메라로 촬영하기
                            </Button>
                        </div>
                    )}
                    
                    {showCamera && (
                        <div className="space-y-4">
                             <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                             { !hasCameraPermission && (
                                <Alert variant="destructive">
                                    <AlertTitle>카메라 접근 권한 필요</AlertTitle>
                                    <AlertDescription>
                                        이 기능을 사용하려면 카메라 접근을 허용해야 합니다.
                                    </AlertDescription>
                                </Alert>
                             )}
                             <div className="flex gap-2">
                                <Button onClick={handleCapture} className="w-full" disabled={!hasCameraPermission}><Camera className="mr-2"/>촬영하기</Button>
                                <Button onClick={handleCameraToggle} variant="outline" className="w-full">취소</Button>
                             </div>
                        </div>
                    )}

                    {userImage && (
                        <div className="space-y-4 text-center">
                            <Image src={userImage} alt="Uploaded by user" width={300} height={400} className="rounded-lg mx-auto shadow-md" />
                            <Button onClick={handleGenerate} disabled={isGenerating} size="lg" className="w-full max-w-sm font-bold">
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                {isGenerating ? 'AI 분석 중...' : '2. AI 코디 제안받기'}
                            </Button>
                            <Button onClick={handleReset} variant="ghost" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" /> 다시 시작하기
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isGenerating && (
                <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg">AI 스타일리스트가 당신의 사진을 분석하고 있습니다...</p>
                    <p className="text-sm">여러 이미지를 생성하므로 최대 2~3분까지 소요될 수 있습니다.</p>
                </div>
            )}

            {error && (
                 <Alert variant="destructive" className="mt-8 max-w-4xl mx-auto">
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle>오류 발생</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {results && (
                <div className="mt-12 space-y-8 flex flex-col items-center">
                    <h2 className="text-3xl font-bold text-center">AI 스타일 제안</h2>
                    {results.suggestions.map((suggestion, index) => (
                        <StyleSuggestionCard key={index} suggestion={suggestion} />
                    ))}
                </div>
            )}
        </div>
    );
}
