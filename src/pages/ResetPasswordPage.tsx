import { Link, useNavigate } from 'react-router';

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background font-body text-on-surface min-h-screen relative overflow-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] dark:hover:bg-[#2d2f31] transition-colors duration-300 active:scale-95 text-[#4c6272] dark:text-[#a5c9e0]"
            >
              <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
            </button>
            <h1 className="font-headline text-lg font-semibold tracking-tight text-[#4c6272] dark:text-[#a5c9e0]">
              비밀번호 재설정
            </h1>
          </div>
          <div className="w-10 h-10"></div> {/* Spacer for balance */}
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="min-h-screen pt-24 pb-12 px-6 max-w-md mx-auto flex flex-col items-center">
        {/* Illustration / Visual Anchor */}
        <div className="w-full mb-10 flex justify-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden bg-gradient-to-tr from-secondary-container to-surface-container shadow-sm">
            <div 
              className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop')" }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-surface-container-lowest/80 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-primary text-4xl" data-icon="lock_reset">lock_reset</span>
              </div>
            </div>
          </div>
        </div>

        {/* Headline & Instructions */}
        <section className="text-center mb-10">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-4">비밀번호를 잊으셨나요?</h2>
          <p className="text-on-surface-variant leading-relaxed px-2">
            걱정 마세요. 가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </section>

        {/* Form Section */}
        <form className="w-full space-y-6 flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2 w-full">
            <label className="font-label text-sm font-semibold text-on-surface-variant block text-center w-full mb-1" htmlFor="email">
              이메일 주소
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-xl" data-icon="mail">mail</span>
              </div>
              <input 
                className="block w-full h-14 pl-12 pr-4 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 placeholder:text-outline/60 text-on-surface outline-none" 
                id="email" 
                placeholder="name@example.com" 
                type="email"
                required
              />
            </div>
          </div>

          <button 
            className="w-full h-14 bg-gradient-to-br from-primary to-primary-dim text-on-primary font-headline font-bold text-base rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 ease-in-out flex items-center justify-center gap-2" 
            type="submit"
          >
            재설정 링크 전송
            <span className="material-symbols-outlined text-lg" data-icon="arrow_forward">arrow_forward</span>
          </button>
        </form>

        {/* Footer Navigation */}
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

      {/* Subtle Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-secondary-container/30 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[30%] bg-tertiary-container/30 blur-[80px] rounded-full"></div>
      </div>
    </div>
  );
}
