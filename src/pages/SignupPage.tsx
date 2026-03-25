import { useState } from 'react';
import { useNavigate, Link } from 'react-router';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!email || !password || !confirmPassword) {
      return setError('모든 항목을 입력해주세요.');
    }
    if (password.length < 8) {
      return setError('비밀번호는 최소 8자 이상이어야 합니다.');
    }
    if (password !== confirmPassword) {
      return setError('비밀번호가 일치하지 않습니다.');
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        navigate('/verify', { state: { email } });
      } else {
        setError(data.message || '인증 코드 전송에 실패했습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인하세요.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Atmospheric Images - fixed z-index to stay behind everything */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-surface">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] opacity-[0.03] rotate-12">
          <img 
            className="w-full h-full object-cover rounded-full blur-2xl" 
            alt="abstract" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXnkgHe20rwFoW99EwMSqNMVaOzyKqx5T4ZfLMURCJ9MKnhwI26ccUD7EpBj1l9ADy12pAJRaq5pRZK60QdzPq1Q9h82vC-x1lmpzYlnbqMamKDmWZcDf6tuUk1COlf3ZC242NXtXE_aqM6r8xT-7y_Rk8U_gCc1Duv4xnjZ-qHJnM0fuPLP_wWc1gGItb6Jd3mjO0-WCTNGyURYTjOvvI8AHC8I389cto2zSIVNG-wzO4M1ANfmoPGt_ZmTeBxLcha0GeT1wPR7U" 
          />
        </div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] opacity-[0.02] -rotate-12">
          <img 
            className="w-full h-full object-cover rounded-full blur-3xl" 
            alt="texture" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2fLWcjDcJnPE6Qje8rGkvQX_SJNhjoinbTLKI__Inud0i9yOa_HRAKu1lNSrDNpXOTGBh3iFsRuQEFlW5A0eHRwJSMX74fEqG8xihji05FLkJF7p4yldgtDmX-RUc-yhwc7YzVz24eaQyC8axRiVHYH8WnbyKKR9yKkPC5oCZHZQB4Q1ziU5wk-SnA832qOSR8MJWvBfjmbfX4tHFf2c1q3H2X1gPqEdZhGvbYRG1XK7yjiqhM_bhrJ0t4blCtMvsHY9mZToJY_Q" 
          />
        </div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-surface-container-low flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-headline font-semibold tracking-tight text-primary">Solkka</span>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center px-6 pt-32 pb-12 relative z-10 w-full">
        <div className="w-full max-w-[420px] space-y-10">
          <section className="text-center space-y-3">
            <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-2">
              익명으로 시작하기
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
              여정 시작하기
            </h1>
            <p className="text-on-surface-variant text-base max-w-[300px] mx-auto leading-relaxed">
              안전하게 생각을 나눌 수 있는 조용한 공간에 참여하세요.
            </p>
          </section>

          <div className="bg-white rounded-2xl p-8 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {error && (
                <div className="p-3 bg-error-container/20 text-error rounded-xl text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 px-1 font-label">이메일 주소</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none" 
                    placeholder="hello@solkka.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 px-1 font-label">비밀번호</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 px-1 pt-1">최소 8자 이상</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 px-1 font-label">비밀번호 확인</label>
                <div className="relative group">
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none" 
                    placeholder="••••••••" 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl text-white font-headline font-bold text-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${isLoading ? 'bg-primary-dim opacity-70 cursor-not-allowed' : 'bg-primary hover:bg-[#3d4f5c] active:scale-[0.98]'}`}
                >
                  {isLoading ? '발송 중...' : '인증 코드 보내기'}
                  {!isLoading && <span className="material-symbols-outlined text-xl">chevron_right</span>}
                </button>
              </div>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                이미 계정이 있으신가요? 
                <Link className="text-primary font-bold hover:underline ml-1" to="/login">로그인</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center px-6 relative z-10 w-full mt-auto">
        <p className="text-xs text-gray-400 font-label tracking-widest uppercase">
          암호화됨 • 프라이버시 • 따뜻함
        </p>
      </footer>
    </div>
  );
}
