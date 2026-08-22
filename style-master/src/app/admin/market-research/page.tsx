"use client";

import { useState, useTransition, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, Loader2, Search, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { analyzeMarketAction } from './actions';
import type { MarketAnalysisOutput } from '@/ai/flows/market-research';

function ReportSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-base space-y-4 text-foreground/90">
                {children}
            </CardContent>
        </Card>
    );
}

function SectionItem({ title, content }: { title: string, content: string }) {
    return (
        <div>
            <h3 className="font-bold text-base text-primary">{title}</h3>
            <p className="mt-1 whitespace-pre-wrap">{content}</p>
        </div>
    );
}

export default function MarketResearchPage() {
    const { toast } = useToast();
    const [isAnalyzing, startAnalyzingTransition] = useTransition();
    const [isDownloading, setIsDownloading] = useState(false);

    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MarketAnalysisOutput | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    const handleAnalyze = () => {
        if (!query) return;

        startAnalyzingTransition(async () => {
            setResults(null);
            const result = await analyzeMarketAction({ query });
            
            if (result.success && result.data) {
                setResults(result.data);
                toast({
                    title: "분석 완료!",
                    description: "AI가 시장 전략 보고서 생성을 완료했습니다.",
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

    const handleDownloadPdf = async () => {
        const reportContainer = reportRef.current;
        if (!reportContainer) return;

        setIsDownloading(true);
        toast({ title: 'PDF 생성 시작', description: '보고서를 PDF로 변환하고 있습니다. 잠시만 기다려주세요.' });
        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;

            const sections = Array.from(reportContainer.querySelectorAll('[data-html2canvas-section]')) as HTMLElement[];

            for (const section of sections) {
                const canvas = await html2canvas(section, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: 'white',
                    windowWidth: section.scrollWidth,
                    windowHeight: section.scrollHeight,
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pdfWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                if (yPosition + imgHeight > pdfHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                
                pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 5;
            }

            pdf.save(`AI_시장_분석_보고서_${query.replace(/\s+/g, '_')}.pdf`);
            toast({ title: '다운로드 완료', description: 'PDF 보고서가 성공적으로 다운로드되었습니다.' });

        } catch (error) {
            console.error("PDF 생성 중 오류 발생:", error);
            toast({
                title: "PDF 생성 오류",
                description: "리포트를 PDF로 변환하는 중 문제가 발생했습니다.",
                variant: "destructive",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container py-12">
            <Card className="max-w-7xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-6 w-6 text-primary" />
                        AI 시장 전략 보고서
                    </CardTitle>
                    <CardDescription>
                        분석하고 싶은 상품이나 트렌드를 입력하면, AI가 단순 데이터 분석을 넘어 실행 가능한 비즈니스 전략까지 제안합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="예: Y2K 패션, 여성 여름 샌들"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            disabled={isAnalyzing || isDownloading}
                            className="flex-grow"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAnalyze();
                            }}
                        />
                        <Button onClick={handleAnalyze} disabled={isAnalyzing || isDownloading || !query} className="font-bold">
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            {isAnalyzing ? "분석 중..." : "AI로 보고서 생성"}
                        </Button>
                    </div>

                    {isAnalyzing && (
                        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">AI가 시장 데이터를 분석하고 전략을 수립하고 있습니다...</p>
                            <p className="text-sm">결과가 복잡하여 최대 2~3분 정도 소요될 수 있습니다.</p>
                        </div>
                    )}

                    {results && (
                        <div className="space-y-6">
                            <div className="bg-background rounded-lg p-6 lg:p-8 space-y-8" ref={reportRef}>
                                <div data-html2canvas-section className='mb-8 text-center'>
                                    <h2 className="text-2xl lg:text-3xl font-extrabold text-primary">{results.reportTitle}</h2>
                                    <p className="text-sm text-muted-foreground mt-2">생성일: {new Date().toLocaleDateString()}</p>
                                </div>
                               
                               <div data-html2canvas-section>
                                <ReportSection title="Executive Summary (핵심 요약)">
                                    <p className="text-lg leading-relaxed">{results.executiveSummary}</p>
                                </ReportSection>
                               </div>
                                
                                <div data-html2canvas-section className="grid md:grid-cols-2 gap-6">
                                    <ReportSection title="시장 트렌드 분석">
                                        <SectionItem title="트렌드 라이프사이클" content={results.trendAnalysis.lifecycle} />
                                        <SectionItem title="핵심 고객층" content={results.trendAnalysis.customerProfile} />
                                        <SectionItem title="경쟁 환경" content={results.trendAnalysis.competitiveLandscape} />
                                    </ReportSection>
                                    <ReportSection title="주요 성공 요인">
                                        <SectionItem title="디자인 포인트" content={results.keySuccessFactors.design} />
                                        <SectionItem title="가격 전략" content={results.keySuccessFactors.pricing} />
                                        <SectionItem title="마케팅 키워드" content={results.keySuccessFactors.marketing} />
                                    </ReportSection>
                                </div>
                                
                                <div data-html2canvas-section>
                                    <ReportSection title="실행 전략 제안 (Actionable Strategy)">
                                        <SectionItem title="상품화 전략" content={results.actionableStrategy.productRecommendation} />
                                        <SectionItem title="가격 책정 전략" content={results.actionableStrategy.pricingStrategy} />
                                        <SectionItem title="마케팅 실행 방안" content={results.actionableStrategy.marketingStrategy} />
                                    </ReportSection>
                                </div>
                                
                                <div data-html2canvas-section className="grid md:grid-cols-2 gap-6">
                                    <ReportSection title="잠재 리스크">
                                       <p>{results.risksAndOpportunities.potentialRisks}</p>
                                    </ReportSection>
                                     <ReportSection title="새로운 기회">
                                       <p>{results.risksAndOpportunities.newOpportunities}</p>
                                    </ReportSection>
                                </div>

                                <div data-html2canvas-section>
                                    <h3 className="text-xl font-bold mb-4">참고: 최상위 인기 상품</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>쇼핑몰</TableHead>
                                                    <TableHead>상품명</TableHead>
                                                    <TableHead className="text-right">예상 가격</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {results.topTrendingProducts.map((item, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{item.source}</TableCell>
                                                        <TableCell className="font-medium">{item.productName}</TableCell>
                                                        <TableCell className="text-right">{item.estimatedPrice}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                            <Button onClick={handleDownloadPdf} disabled={isDownloading || isAnalyzing} className="w-full font-bold">
                                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                                {isDownloading ? "PDF 생성 중..." : "보고서 PDF로 다운로드"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
