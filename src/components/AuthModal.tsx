import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import type { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onAuthSuccess: (user: UserProfile) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase Auth 인스턴스가 초기화되지 않았습니다. Firebase 환경설정을 확인해 주세요.");
      }

      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && userCredential.user) {
          await updateProfile(userCredential.user, { displayName });
        }
        const profile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName || userCredential.user.displayName || '회원',
          isAnonymous: false,
        };
        setSuccessMsg("회원가입이 완료되었습니다! 환영합니다.");
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 1000);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile: UserProfile = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || '회원',
          isAnonymous: false,
        };
        setSuccessMsg("로그인 성공! 환영합니다.");
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "인증 중 오류가 발생했습니다.";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = "이메일 또는 비밀번호가 올바르지 않습니다.";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "이미 등록된 이메일 주소입니다. 로그인을 시도해 주세요.";
      } else if (err.code === 'auth/weak-password') {
        message = "비밀번호는 최소 6자 이상이어야 합니다.";
      } else if (err.code === 'auth/invalid-email') {
        message = "올바른 이메일 형식을 입력해 주세요.";
      } else if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        message = "Firebase API 키가 유효하지 않거나 만료되었습니다. 상단 [파이어베이스 환경설정]에서 본인의 Firebase 프로젝트 키를 입력하시거나, 아래 [체험 계정 로그인]을 이용해 주세요.";
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!auth) throw new Error("Firebase Auth가 연결되지 않았습니다.");
      const result = await signInWithPopup(auth, googleProvider);
      const profile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || '구글 사용자',
        photoURL: result.user.photoURL,
        isAnonymous: false,
      };
      setSuccessMsg("구글 계정으로 로그인되었습니다.");
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 800);
    } catch (err: any) {
      console.warn("Google popup login fallback:", err);
      setError("구글 로그인 팝업이 차단되었거나 Firebase 인증 설정이 필요합니다. 아래 데모 계정으로 즉시 테스트 가능합니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      let profile: UserProfile;
      if (auth) {
        try {
          const res = await signInAnonymously(auth);
          profile = {
            uid: res.user.uid,
            email: "demo-guest@stylewise.ai",
            displayName: "쇼핑몰 체험회원",
            isAnonymous: true,
          };
        } catch (e) {
          profile = {
            uid: "demo-user-" + Date.now(),
            email: "demo-shopper@stylewise.ai",
            displayName: "StyleWise 고객님",
            isAnonymous: true,
          };
        }
      } else {
        profile = {
          uid: "demo-user-" + Date.now(),
          email: "demo-shopper@stylewise.ai",
          displayName: "StyleWise 고객님",
          isAnonymous: true,
        };
      }
      
      setSuccessMsg("체험용 테스트 계정으로 로그인되었습니다!");
      setTimeout(() => {
        onAuthSuccess(profile);
        onClose();
      }, 600);
    } catch (err: any) {
      setError("데모 로그인 중 오류: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-neutral-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'StyleWise AI 로그인' : 'StyleWise AI 회원가입'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login' 
              ? '계정에 로그인하여 AI 스타일링과 장바구니를 관리하세요.' 
              : '새 계정을 생성하여 맞춤 패션 서비스를 시작하세요.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Alerts */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700">이름 / 닉네임</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">이메일 주소</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="최소 6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-neutral-900"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {loading ? (
                <span>처리 중...</span>
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>로그인</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>회원가입 완료</span>
                </>
              )}
            </button>
          </form>

          {/* Social / Demo Actions */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-400 font-medium">또는 간편 로그인</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="py-2.5 px-3 border border-neutral-200 hover:bg-neutral-50 rounded-xl text-xs font-semibold text-neutral-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google 로그인</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold text-amber-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>체험 계정 로그인</span>
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <div className="pt-2 text-center text-xs text-neutral-500">
            {mode === 'login' ? (
              <p>
                아직 회원이 아니신가요?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); }}
                  className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  회원가입하기
                </button>
              </p>
            ) : (
              <p>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="font-bold text-amber-600 hover:text-amber-700 underline cursor-pointer"
                >
                  로그인하기
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
