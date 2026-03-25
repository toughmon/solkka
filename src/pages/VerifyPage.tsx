import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AlertModal from '../components/AlertModal';

export default function VerifyPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMSG, setErrorMSG] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [generatedNickname, setGeneratedNickname] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // 이전 회원가입 폼에서 넘어온 데이터
  const state = location.state as { email?: string; password?: string } | null;
  const email = state?.email;
  const password = state?.password;

  const handleVerify = async () => {
    if (!email || !password) {
      setErrorMSG('회원가입 정보가 유실되었습니다. 뒤로가기를 눌러 다시 시도하세요.');
      return;
    }
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setErrorMSG('6자리 인증 코드를 모두 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMSG('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, password }),
      });
      const data = await res.json();

      if (res.ok) {
        // 백엔드에서 생성해준 정보를 저장하고 모달 띄우기
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('token');
        setGeneratedNickname(data.user.nickname);
        setShowModal(true);
      } else {
        setErrorMSG(data.message || '인증에 실패했습니다.');
      }
    } catch (err) {
      setErrorMSG('서버와 통신할 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setErrorMSG('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('가입하신 이메일로 코드를 새롭게 재전송했습니다.');
      } else {
        setErrorMSG(data.message || '재전송 실패');
      }
    } catch (err) {
      setErrorMSG('재전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const processInput = (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const value = e.target.value;
    if (/[^0-9a-zA-Z]/.test(value)) return; // Allow numbers and letters for verification code if needed, or strictly numbers

    const newCode = [...code];
    newCode[slot] = value;
    setCode(newCode);

    if (slot !== 5 && value !== '') {
      inputs.current[slot + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, slot: number) => {
    if (e.key === 'Backspace') {
      if (code[slot] === '' && slot !== 0) {
        inputs.current[slot - 1]?.focus();
        const newCode = [...code];
        newCode[slot - 1] = '';
        setCode(newCode);
      } else {
        const newCode = [...code];
        newCode[slot] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9a-zA-Z]/g, '');
    if (pasteData) {
      const newCode = [...code];
      for (let i = 0; i < pasteData.length; i++) {
        newCode[i] = pasteData[i];
      }
      setCode(newCode);
      const focusIndex = pasteData.length < 6 ? pasteData.length : 5;
      inputs.current[focusIndex]?.focus();
    }
    e.preventDefault();
  };
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decorative Image - safely pushed back */}
      <div className="fixed inset-0 -z-50 opacity-[0.03] pointer-events-none bg-surface">
        <img
          className="w-full h-full object-cover"
          alt="texture"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7HrXRQrZP83OjXdQKMKM7knxmjwYDkXjbP0DvBc8uqwI5MnWQ4Tr4XjLMbZzlPxUCcfc_KIeD6pKQCaOG_l_F70YzCsn3P3DlKH5293wq1-SxTveqapOFN80V9ta4DPnd5C0r5-EJsUd_Og9BQdlBgqBSzD0UrlDkBscJwKzVtlu6bmvnUtGCgLkcrcejJJme9XzSZOObDFHEU916TaRHoV8fmq6S9gW-EnjP8AwH8pGCj6t1SQRsd3t68Oq34jNck2N_rs1CSCA"
        />
      </div>

      {/* Header (TopAppBar) */}
      <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-surface-container-low fixed top-0 w-full z-50">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center p-2 rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline font-semibold tracking-tight text-primary">Solkka</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 pt-32 pb-12 max-w-md mx-auto w-full relative z-10">

        {/* Supportive Backdrop Texture (Asymmetric) */}
        <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[80px] -z-20 pointer-events-none"></div>
        <div className="fixed -top-20 -right-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-[100px] -z-20 pointer-events-none"></div>

        {/* Illustration/Mood Image */}
        <div className="mb-10 relative">
          <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm border border-gray-100">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-10 space-y-3">
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-gray-900">이메일 인증</h2>
          <p className="font-body text-gray-600 text-base leading-relaxed">
            작성하신 이메일로 6자리 인증 코드를 발송했습니다. 가입을 완료하려면 아래에 코드를 입력해 주세요.
          </p>
        </div>

        {/* Code Input Section - Wrapped in a clean white card for contrast */}
        <div className="w-full space-y-8 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between gap-2 md:gap-4" onPaste={handlePaste}>
            {code.map((num, idx) => (
              <input
                key={idx}
                ref={(el) => { inputs.current[idx] = el; }}
                value={num}
                onChange={(e) => processInput(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-full h-14 md:h-16 text-center text-2xl font-bold rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 outline-none"
                maxLength={1}
                placeholder="·"
                type="text"
              />
            ))}
          </div>

          {errorMSG && (
            <div className="bg-red-50 text-red-600 text-sm font-medium p-3 rounded-xl border border-red-100 flex items-center justify-center -mt-4">
              <span className="material-symbols-outlined mr-2 text-base">error</span>
              {errorMSG}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-primary hover:bg-[#3d4f5c] disabled:opacity-50 disabled:cursor-not-allowed w-full py-4 rounded-xl text-white font-headline font-bold text-lg shadow-md active:scale-[0.98] transition-all duration-300"
          >
            {loading ? '처리 중...' : '인증하기'}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              코드를 받지 못하셨나요?
              <button onClick={handleResend} disabled={loading} className="text-primary font-bold hover:underline underline-offset-4 ml-1 disabled:opacity-50">코드 재전송</button>
            </p>
          </div>
        </div>
      </main>

      {/* Contextual Empathy Pulse */}
      {(email) && (
        <div className="fixed bottom-8 left-8 hidden md:flex items-center gap-3 z-10">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
            <div className="relative w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <span className="text-xs font-label text-gray-500 font-bold uppercase tracking-widest">{email} 인증 대기 중</span>
        </div>
      )}

      {/* 회원가입 성공 모달 */}
      <AlertModal
        isOpen={showModal}
        title="Welcome to Solkka"
        message={`회원가입이 완료되었습니다.\n익명 닉네임: ${generatedNickname}`}
        onConfirm={() => navigate('/', { replace: true })}
      />
    </div>
  );
}
