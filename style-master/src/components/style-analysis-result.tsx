
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StyleAnalysisOutput } from "@/ai/flows/style-analysis";
import { Wand2, Palette, Shirt, Sparkles } from "lucide-react";

type Props = {
  result: StyleAnalysisOutput;
};

function InfoPill({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
            <div className="text-primary">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-primary">{label}</p>
                <p className="text-base font-medium">{value}</p>
            </div>
        </div>
    )
}

export function StyleAnalysisResult({ result }: Props) {
  return (
    <Card className="bg-primary/5 border-primary border-dashed animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Wand2 />
          AI 스타일 분석 결과
        </CardTitle>
        <CardDescription>고객님의 장바구니 상품을 기반으로 AI가 분석한 쇼핑 스타일입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold leading-relaxed p-4 bg-background rounded-md shadow-inner">
          "{result.analysisSummary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoPill icon={<Sparkles />} label="핵심 스타일" value={result.coreStyle} />
            <InfoPill icon={<Shirt />} label="선호 아이템" value={result.preferredItems} />
            <InfoPill icon={<Palette />} label="선호 색상" value={result.preferredColors} />
        </div>

        <div>
            <h4 className="font-semibold mb-2">스타일 키워드</h4>
            <div className="flex flex-wrap gap-2">
            {result.styleKeywords.map((keyword, index) => (
                <span
                key={index}
                className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground rounded-full shadow-md"
                >
                {keyword.startsWith('#') ? keyword : `#${keyword}`}
                </span>
            ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
