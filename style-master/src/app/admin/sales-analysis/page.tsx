
"use client";

import { useState, useTransition, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Loader2, UploadCloud, Download, FileText, AlertCircle, Wand2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { analyzeSalesDataAction } from './actions';
import { sampleSalesData } from '@/lib/seed-sales-data';

interface SalesRow {
  주문일자: string;
  상품명: string;
  수량: number | string;
  판매가: number | string;
  원가: number | string;
}

interface CalculatedReport {
  reportTitle: string;
  analysisPeriod: {
    startDate: string;
    endDate: string;
  };
  overallSummary: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMarginPercent: number;
  };
  topSellingProducts: {
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }[];
}

function ReportSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

export default function SalesAnalysisPage() {
    const { toast } = useToast();
    const [isCalculating, startCalculatingTransition] = useTransition();
    const [isAiAnalyzing, startAiAnalyzingTransition] = useTransition();

    const [csvContent, setCsvContent] = useState<string>('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [calculatedReport, setCalculatedReport] = useState<CalculatedReport | null>(null);
    const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setCalculatedReport(null);
            setAiRecommendation(null);
            setError(null);
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setCsvContent(content);
            };
            reader.readAsText(file, 'UTF-8');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false,
    });

    const handleCalculateReport = () => {
        if (!csvContent) return;

        startCalculatingTransition(() => {
            setCalculatedReport(null);
            setAiRecommendation(null);
            setError(null);
            Papa.parse(csvContent, {
                header: true,
                bom: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        const errorMsg = `CSV 파싱 오류: ${results.errors.map(e => e.message).join(', ')}`;
                        setError(errorMsg);
                        toast({ title: '오류', description: errorMsg, variant: 'destructive' });
                        return;
                    }
                    try {
                        const data = results.data as SalesRow[];
                        const report = calculateReport(data);
                        setCalculatedReport(report);
                        toast({ title: '리포트 생성 완료', description: '데이터 계산이 완료되었습니다. AI 전략 제안을 받아보세요.' });
                    } catch (e) {
                         const errorMsg = e instanceof Error ? e.message : "알 수 없는 오류 발생";
                         setError(`리포트 계산 오류: ${errorMsg}`);
                         toast({ title: '오류', description: `리포트 계산 오류: ${errorMsg}`, variant: 'destructive' });
                    }
                },
                error: (err) => {
                    const errorMsg = `파일 읽기 오류: ${err.message}`;
                    setError(errorMsg);
                    toast({ title: '오류', description: errorMsg, variant: 'destructive' });
                }
            });
        });
    };
    
    const calculateReport = (data: SalesRow[]): CalculatedReport => {
        if (!data || data.length === 0) throw new Error("분석할 데이터가 없습니다.");
        
        const validData = data.filter(row => row && row.주문일자 && row.판매가 != null && row.원가 != null && row.수량 != null);
        if(validData.length === 0) throw new Error("유효한 데이터 행이 없습니다. CSV 헤더(주문일자,상품명,수량,판매가,원가)를 확인해주세요.");

        const dates = validData.map(row => new Date(row.주문일자)).filter(d => !isNaN(d.getTime()));
        if(dates.length === 0) throw new Error("유효한 날짜 데이터가 없습니다. 날짜 형식을(YYYY-MM-DD) 확인해주세요.");
        
        let totalRevenue = 0;
        let totalCost = 0;
        const productSales: { [name: string]: { quantity: number; revenue: number } } = {};

        validData.forEach(row => {
            const price = Number(String(row.판매가).replace(/,/g, ''));
            const cost = Number(String(row.원가).replace(/,/g, ''));
            const quantity = Number(String(row.수량).replace(/,/g, ''));

            if (isNaN(price) || isNaN(cost) || isNaN(quantity) || !row.상품명) return;

            const revenue = price * quantity;
            const itemTotalCost = cost * quantity;

            totalRevenue += revenue;
            totalCost += itemTotalCost;

            if (!productSales[row.상품명]) {
                productSales[row.상품명] = { quantity: 0, revenue: 0 };
            }
            productSales[row.상품명].quantity += quantity;
            productSales[row.상품명].revenue += revenue;
        });
        
        const topSellingProducts = Object.entries(productSales)
            .map(([productName, data]) => ({ productName, totalQuantity: data.quantity, totalRevenue: data.revenue }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 5);

        const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
        const grossProfit = totalRevenue - totalCost;
        const profitMarginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

        return {
            reportTitle: `${startDate.getFullYear()}년 매출 분석 보고서`,
            analysisPeriod: {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
            },
            overallSummary: { totalRevenue, totalCost, grossProfit, profitMarginPercent },
            topSellingProducts
        };
    };

    const handleTriggerAiAnalysis = () => {
        if (!calculatedReport) return;
        startAiAnalyzingTransition(async () => {
            setAiRecommendation(null);
            const summary = `
                총 매출: ${calculatedReport.overallSummary.totalRevenue.toLocaleString()}원,
                총 이익: ${calculatedReport.overallSummary.grossProfit.toLocaleString()}원,
                이익률: ${calculatedReport.overallSummary.profitMarginPercent.toFixed(2)}%,
                인기 상품 Top 3: ${calculatedReport.topSellingProducts.slice(0, 3).map(p => p.productName).join(', ')}
            `;
            
            const result = await analyzeSalesDataAction({ reportSummary: summary });

            if (result.success && result.data) {
                setAiRecommendation(result.data.strategicRecommendation);
            } else {
                 toast({
                    title: "AI 전략 제안 실패",
                    description: result.error,
                    variant: "destructive",
                });
            }
        });
    };

    const handleDownloadSample = () => {
        const blob = new Blob(["\uFEFF" + sampleSalesData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'sample_sales_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container py-12">
            <Card className="max-w-6xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        AI 매출 분석 보고서
                    </CardTitle>
                    <CardDescription>
                        CSV 형식의 매출 데이터를 업로드하면 시스템이 정확한 통계를 계산하고, AI가 비즈니스 전략을 제안합니다.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card className="bg-muted/30">
                        <CardContent className="p-6 space-y-4">
                            <div
                                {...getRootProps()}
                                className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                    isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <UploadCloud className="w-12 h-12 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-lg text-foreground">
                                    이곳에 CSV 파일을 드래그하거나 클릭하여 업로드하세요.
                                </p>
                                <p className="text-sm text-muted-foreground">파일 형식: .csv (UTF-8)</p>
                            </div>
                             {fileName && (
                                <Alert variant="default">
                                    <FileText className="h-4 w-4" />
                                    <AlertTitle>선택된 파일</AlertTitle>
                                    <AlertDescription>{fileName}</AlertDescription>
                                </Alert>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Button onClick={handleCalculateReport} disabled={isCalculating || !csvContent} className="w-full font-bold">
                                    {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                                    {isCalculating ? "계산 중..." : "리포트 생성"}
                                </Button>
                                <Button onClick={handleDownloadSample} variant="secondary" className="w-full sm:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    샘플 데이터 다운로드
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {error && (
                        <Alert variant="destructive">
                           <AlertCircle className="h-4 w-4" />
                           <AlertTitle>오류 발생</AlertTitle>
                           <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {isCalculating && (
                        <div className="text-center text-muted-foreground flex flex-col items-center justify-center py-10">
                            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-lg">매출 데이터를 계산하고 있습니다...</p>
                        </div>
                    )}
                    
                    {calculatedReport && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-center">{calculatedReport.reportTitle}</h2>
                            <ReportSection title="분석 기간">
                                <p>{calculatedReport.analysisPeriod.startDate} ~ {calculatedReport.analysisPeriod.endDate}</p>
                            </ReportSection>
                            <ReportSection title="핵심 요약">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-muted-foreground">총 매출</p>
                                        <p className="text-2xl font-bold">₩{calculatedReport.overallSummary.totalRevenue.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">총 비용</p>
                                        <p className="text-2xl font-bold">₩{calculatedReport.overallSummary.totalCost.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">매출 총이익</p>
                                        <p className="text-2xl font-bold text-green-600">₩{calculatedReport.overallSummary.grossProfit.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">이익률</p>
                                        <p className="text-2xl font-bold text-green-600">{calculatedReport.overallSummary.profitMarginPercent.toFixed(2)}%</p>
                                    </div>
                                </div>
                            </ReportSection>
                            <ReportSection title="주요 인기 상품 Top 5">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>순위</TableHead>
                                            <TableHead>상품명</TableHead>
                                            <TableHead className="text-right">판매 수량</TableHead>
                                            <TableHead className="text-right">매출액</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {calculatedReport.topSellingProducts.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="font-medium">{item.productName}</TableCell>
                                                <TableCell className="text-right">{item.totalQuantity.toLocaleString()}개</TableCell>
                                                <TableCell className="text-right">₩{item.totalRevenue.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ReportSection>
                            
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI 전략 제안</CardTitle>
                                    <CardDescription>계산된 데이터를 바탕으로 AI가 실행 가능한 비즈니스 전략을 제안합니다.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!aiRecommendation && !isAiAnalyzing && (
                                        <Button onClick={handleTriggerAiAnalysis} disabled={isAiAnalyzing}>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            AI 전략 제안 받기
                                        </Button>
                                    )}
                                    {isAiAnalyzing && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>AI가 데이터를 기반으로 전략을 수립하고 있습니다...</span>
                                        </div>
                                    )}
                                    {aiRecommendation && (
                                        <Alert>
                                            <Wand2 className="h-4 w-4" />
                                            <AlertTitle>Actionable Insight</AlertTitle>
                                            <AlertDescription className="whitespace-pre-wrap">{aiRecommendation}</AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
