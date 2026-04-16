import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);
  const isResetMode = resetToken.length > 0;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setFeedback('');

    if (isResetMode) {
      if (password.length < 8) {
        setErrorMessage('비밀번호는 8자 이상이어야 합니다.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = isResetMode ? '/api/auth/reset-password' : '/api/auth/request-password-reset';
      const body = isResetMode
        ? { token: resetToken, password }
        : { email };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || '요청 처리 중 문제가 발생했습니다.');
        return;
      }

      setCompleted(true);
      setFeedback(data.message || (isResetMode
        ? '비밀번호가 성공적으로 변경되었습니다.'
        : '가입된 이메일이라면 비밀번호 재설정 링크를 보내드렸습니다.'));

      if (isResetMode) {
        setPassword('');
        setConfirmPassword('');
      } else {
        setEmail('');
      }
    } catch {
      setErrorMessage('서버와 연결하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen relative overflow-hidden">
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] dark:hover:bg-[#2d2f31] transition-colors duration-300 active:scale-95 text-[#4c6272] dark:text-[#a5c9e0]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline text-lg font-semibold tracking-tight text-[#4c6272] dark:text-[#a5c9e0]">
              비밀번호 재설정
            </h1>
          </div>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-12 px-6 max-w-md mx-auto flex flex-col items-center">
        <div className="w-full mb-10 flex justify-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gradient-to-tr from-secondary-container to-surface-container shadow-sm">
            <div
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop')" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-4xl">lock_reset</span>
              </div>
            </div>
          </div>
        </div>

        <section className="text-center mb-10">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-4">
            {isResetMode ? '새 비밀번호를 설정하세요' : '비밀번호를 잊으셨나요?'}
          </h2>
          <p className="text-on-surface-variant leading-relaxed px-2">
            {isResetMode
              ? '새 비밀번호를 입력하면 기존 비밀번호가 즉시 교체됩니다.'
              : '가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.'}
          </p>
        </section>

        <form className="w-full space-y-6 flex flex-col items-center" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="w-full p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 text-center">
              {errorMessage}
            </div>
          )}

          {feedback && (
            <div className="w-full p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 text-center">
              {feedback}
            </div>
          )}

          {!isResetMode && (
            <div className="space-y-2 w-full">
              <label className="font-label text-sm font-semibold text-on-surface-variant block text-center w-full mb-1" htmlFor="email">
                이메일 주소
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input
                  className="block w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/60 text-on-surface outline-none"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {isResetMode && (
            <>
              <div className="space-y-2 w-full">
                <label className="font-label text-sm font-semibold text-on-surface-variant block text-center w-full mb-1" htmlFor="password">
                  새 비밀번호
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input
                    className="block w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/60 text-on-surface outline-none"
                    id="password"
                    placeholder="8자 이상 입력"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 w-full">
                <label className="font-label text-sm font-semibold text-on-surface-variant block text-center w-full mb-1" htmlFor="confirm-password">
                  새 비밀번호 확인
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-xl">verified_user</span>
                  </div>
                  <input
                    className="block w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/60 text-on-surface outline-none"
                    id="confirm-password"
                    placeholder="비밀번호를 다시 입력"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button
            className="w-full h-14 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-base rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 ease-in-out flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit"
            disabled={loading || completed}
          >
            {loading ? '처리 중...' : isResetMode ? '새 비밀번호 저장' : '재설정 링크 전송'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          {completed && isResetMode && (
            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full h-12 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container transition-colors"
            >
              로그인으로 이동
            </button>
          )}
        </form>

        <footer className="mt-auto pt-12 pb-6 w-full text-center">
          <Link
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-medium transition-colors duration-300 group"
            to="/login"
          >
            <span className="text-sm">앗, 다시 생각났어요!</span>
            <span className="text-sm font-bold text-primary underline underline-offset-4 decoration-primary/30 group-hover:decoration-primary/100">
              로그인으로 돌아가기
            </span>
          </Link>
        </footer>
      </main>

      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-secondary-container/30 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[30%] bg-tertiary-container/30 blur-[80px] rounded-full"></div>
      </div>
    </div>
  );
}
