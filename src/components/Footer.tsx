import React from 'react';
import { Shirt, Sparkles, Flame, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer id="main-footer" className="mt-20 border-t border-neutral-200 bg-neutral-950 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-neutral-800">
          
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-neutral-950 font-bold">
                <Shirt className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">StyleWise AI</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Firebase 클라우드 인프라와 최신 Gemini AI 패션 큐레이션 엔진이 결합된 스마트 라이프스타일 쇼핑 플랫폼.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">쇼핑 카테고리</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">최신 신상품</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">베스트 인기 컬렉션</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">AI 핫 딜 & 특가</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">스마트 셋업 코디</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">AI 서비스</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">AI 퍼스널 컬러 진단</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">TPO 맞춤 코디네이터</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">체형 분석 블레이저</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">실시간 가상 스타일링</a></li>
            </ul>
          </div>

          {/* System & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">시스템 & 보안</h4>
            <ul className="space-y-1.5 text-neutral-400">
              <li className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Firebase Auth & Firestore</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Gemini 2.5 AI Engine</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>안전한 결제 및 데이터 보호</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <p>© 2026 StyleWise AI 쇼핑몰. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-neutral-400 transition-colors">이용약관</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">개인정보처리방침</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">고객센터</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
