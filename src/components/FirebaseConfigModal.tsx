import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  Key, 
  Server, 
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { 
  getStoredFirebaseConfig, 
  saveFirebaseConfig, 
  resetFirebaseConfig, 
  DEFAULT_FIREBASE_CONFIG,
  initFirebase 
} from '../lib/firebase';
import type { FirebaseConfig } from '../types';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export function FirebaseConfigModal({
  isOpen,
  onClose,
  onConfigSaved,
}: FirebaseConfigModalProps) {
  const current = getStoredFirebaseConfig();
  const [config, setConfig] = useState<FirebaseConfig>(current);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof FirebaseConfig, val: string) => {
    setConfig(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    initFirebase(config);
    setSavedSuccess(true);
    setTestResult("Firebase 환경설정이 안전하게 저장되었으며 새로운 연결이 초기화되었습니다.");
    setTimeout(() => {
      onConfigSaved();
      setSavedSuccess(false);
    }, 1200);
  };

  const handleResetDefault = () => {
    resetFirebaseConfig();
    setConfig(DEFAULT_FIREBASE_CONFIG);
    initFirebase(DEFAULT_FIREBASE_CONFIG);
    setTestResult("기본 제공된 프로젝트 설정으로 초기화되었습니다.");
    setTimeout(() => {
      onConfigSaved();
    }, 800);
  };

  return (
    <div id="firebase-config-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-neutral-950 font-bold">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Environment Configuration</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            파이어베이스(Firebase) 환경설정
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            새로운 Firebase 프로젝트의 API 키 및 접속 정보를 입력하여 쇼핑몰 DB 및 Auth 인증을 연동하세요.
          </p>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Status message */}
          {testResult && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              savedSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Firebase 프로젝트 키 안내</span>
            </div>
            <p className="leading-relaxed">
              Firebase 콘솔(console.firebase.google.com)의 <strong>프로젝트 설정 &gt; 내 앱 &gt; 웹 앱 설정</strong>에서 발급받은 구성 객체(firebaseConfig)의 값을 복사하여 아래에 등록할 수 있습니다.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 flex items-center justify-between">
                <span>API Key (apiKey)</span>
                <span className="text-[11px] text-neutral-400 font-normal">필수</span>
              </label>
              <input
                type="text"
                required
                value={config.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Project ID (projectId)</label>
                <input
                  type="text"
                  required
                  value={config.projectId}
                  onChange={(e) => handleChange('projectId', e.target.value)}
                  placeholder="my-firebase-app"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Auth Domain (authDomain)</label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => handleChange('authDomain', e.target.value)}
                  placeholder="my-firebase-app.firebaseapp.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Storage Bucket (storageBucket)</label>
                <input
                  type="text"
                  value={config.storageBucket}
                  onChange={(e) => handleChange('storageBucket', e.target.value)}
                  placeholder="my-firebase-app.appspot.com"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700">Messaging Sender ID</label>
                <input
                  type="text"
                  value={config.messagingSenderId}
                  onChange={(e) => handleChange('messagingSenderId', e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700">App ID (appId)</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => handleChange('appId', e.target.value)}
                placeholder="1:1234567890:web:abcdef"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
              />
            </div>

            {/* Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleResetDefault}
                className="w-full sm:w-auto px-4 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>기본값으로 복원</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-4 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl text-xs font-semibold"
                >
                  닫기
                </button>
                <button
                  id="save-firebase-config-btn"
                  type="submit"
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>설정 저장 및 연결</span>
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
