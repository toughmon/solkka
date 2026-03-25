import { Link } from 'react-router';

export default function LoginPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#fbf9f8] via-[#f3dedd]/30 to-[#e7fff3]/30">

      {/* App Identity Section */}
      <div className="mb-10 text-center relative z-10 w-full max-w-sm">
        <h1 className="font-headline font-extrabold text-4xl tracking-tight text-primary">
          Solkka
        </h1>
        <p className="text-gray-600 mt-2 font-medium">당신의 안식처로 돌아오세요.</p>
      </div>

      {/* Login Card - using clear borders and clean background */}
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10">
        <form className="space-y-6">
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
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block text-sm font-label font-bold text-gray-700" htmlFor="password">비밀번호</label>
              <a className="text-xs font-bold text-primary hover:opacity-80 transition-opacity" href="#">비밀번호 찾기</a>
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
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            className="w-full py-4 px-6 bg-primary text-white font-headline font-bold rounded-xl shadow-md hover:bg-[#3d4f5c] active:scale-[0.98] transition-all duration-300"
            type="button"
          >
            로그인
          </button>
        </form>

        {/* Social/Alternative Entry */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="relative flex items-center justify-center mb-6">
            <span className="absolute px-4 bg-white text-[10px] uppercase tracking-widest font-bold text-gray-400">또는 다음으로 로그인</span>
            <div className="w-full h-[1px] bg-gray-100"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <img
                alt="Google"
                className="w-4 h-4 grayscale opacity-70"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD63O8M-naAdy3UOvD8020IpA10z451D98XNSUBR51TK3yoRs5NoM8LdQHqva3XhReaJs6KlN-NROSgH7DBjo2FQKuFcjHsBzBMMdhR4zVT2DL5zkE4b04jGJ4ZITBpjtJJyySXFtsIv-VO3vEWjZxW5bI9CNsO6m1S370x1SE81KoevpMXcVmyxqhYmAkWY6KSu34UlmCTqwgS2PhUAUDHKkYIFVInyOZj0GsIFfvNbdppDYaAKPLGKf6Lotkf6mqgAvD5242zWis"
              />
              <span className="text-xs font-bold text-gray-600">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-lg text-gray-500">fingerprint</span>
              <span className="text-xs font-bold text-gray-600">패스키</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="mt-10 text-center relative z-10">
        <p className="text-gray-600 text-sm font-medium">
          아직 계정이 없으신가요?
          <Link className="text-primary font-bold ml-1 hover:underline underline-offset-4 decoration-2" to="/signup">회원가입</Link>
        </p>

        {/* Atmospheric Element */}
        <div className="mt-14 flex items-center justify-center gap-2 text-gray-400">
          <span className="material-symbols-outlined text-sm">shield_moon</span>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">암호화됨 & 익명성 보장</span>
        </div>
      </footer>

      {/* Decorative Background Elements (pushed deep behind and low opacity) */}
      <div className="fixed top-[10%] left-[5%] w-64 h-64 bg-red-100/40 rounded-full blur-[100px] -z-50 pointer-events-none"></div>
      <div className="fixed bottom-[10%] right-[5%] w-80 h-80 bg-green-100/40 rounded-full blur-[120px] -z-50 pointer-events-none"></div>
    </div>
  );
}
