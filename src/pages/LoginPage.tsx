import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertModal from '../components/AlertModal';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMSG, setErrorMSG] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMSG('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('token'); // Clean up old token if exists
        setShowModal(true);
      } else {
        setErrorMSG(data.message || '로그인에 실패했습니다.');
      }
    } catch {
      setErrorMSG('서버와 연결을 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-[100dvh] relative overflow-auto flex flex-col items-center px-6 pt-12 pb-6 bg-gradient-to-br from-[#fbf9f8] via-[#f3dedd]/30 to-[#e7fff3]/30">

      {/* App Identity Section */}
      <div className="mb-8 text-center relative z-10 w-full max-w-sm">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight text-primary">
          Solkka
        </h1>
        <p className="text-gray-600 mt-2 font-medium">당신의 안식처로 돌아오세요.</p>
      </div>

      {/* Login Card - using clear borders and clean background */}
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10">
        <form className="space-y-6" onSubmit={handleLogin}>

          {errorMSG && (
            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined mr-2 text-base">error</span>
              {errorMSG}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-label font-bold text-gray-700 ml-1" htmlFor="email">이메일 주소</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">mail</span>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-gray-900 transition-all duration-300 placeholder:text-gray-400 outline-none"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block text-sm font-label font-bold text-gray-700" htmlFor="password">비밀번호</label>
              <Link className="text-xs font-bold text-primary hover:opacity-80 transition-opacity" to="/reset-password">비밀번호 찾기</Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">lock</span>
              <input
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white text-gray-900 transition-all duration-300 placeholder:text-gray-400 outline-none"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            className="w-full py-4 px-6 bg-primary text-white font-headline font-bold rounded-xl shadow-md hover:bg-[#3d4f5c] disabled:opacity-50 active:scale-[0.98] transition-all duration-300"
            type="submit"
            disabled={loading}
          >
            {loading ? '인증 중...' : '로그인'}
          </button>
        </form>

      </div>

      {/* Footer Section */}
      <footer className="mt-8 text-center relative z-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <p className="text-gray-600 text-sm font-medium">
          아직 계정이 없으신가요?
          <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-2" to="/signup">회원가입</Link>
        </p>

        {/* Atmospheric Element */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <span className="material-symbols-outlined text-sm">shield_moon</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">암호화됨 & 익명성 보장</span>
        </div>
      </footer>

      {/* Decorative Background Elements (pushed deep behind and low opacity) */}
      <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-red-100/40 rounded-full blur-[100px] -z-50 pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[5%] w-80 h-80 bg-green-100/40 rounded-full blur-[120px] -z-50 pointer-events-none"></div>

      <AlertModal
        isOpen={showModal}
        title="환영합니다"
        message="성공적으로 로그인되었습니다."
        onConfirm={() => navigate('/', { replace: true })}
        confirmText="홈으로 이동"
      />
    </div>
  );
}
