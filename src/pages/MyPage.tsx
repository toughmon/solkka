import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNavBar from '../components/BottomNavBar';

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert('로그아웃 되었습니다.');
    navigate('/login');
  };

  return (
    <div className="bg-[#fbf9f8] text-[#313332] min-h-screen pb-32 font-body" style={{ minHeight: 'max(884px, 100dvh)' }}>
      {/* TopAppBar */}
      <header className="bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="flex items-center justify-between px-6 h-16 w-full">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="text-[#4c6272] dark:text-[#a5c8df] hover:opacity-80 transition-opacity"
            >
              <span className="material-symbols-outlined shrink-0" style={{ display: 'inline-block', lineHeight: 1 }}>arrow_back</span>
            </button>
            <h1 className="font-headline font-semibold text-lg tracking-tight text-[#4c6272] dark:text-[#a5c8df]">마이페이지</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="text-red-500 font-medium text-sm hover:opacity-80 transition-opacity"
            >
              로그아웃
            </button>
            <button className="text-[#4c6272] dark:text-[#a5c8df] hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined shrink-0" style={{ display: 'inline-block', lineHeight: 1 }}>settings</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* User Profile Summary */}
        <section className="relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-[#cbe3f7] to-[#f3dedd]">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-white/40 backdrop-blur-md p-1 mb-4 shadow-sm">
              <img 
                alt="Avatar" 
                className="w-full h-full rounded-full bg-surface-container-lowest object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6vYHgOvNmsq8Y9aTWBdm0W1pWXw-hz8MKLiNL6Z0BiOxp86LaQtiT0hCnOPk-nzF-wLDa8PA6eXFfIV53quZeI_9hc-RVk5U5qBvNOyMROCyJUpjAOEtBeOzM48RzmoGJYfzhimSImzJ3OcjRHaeLjDfebTYeZe4XXYHxBOXMn5WI4LMXPskbWPpse3KZ-aSlDT16CLfS25FAr86X6FdKYugwOvWwIBg-ZFfp0k7WXY7o2yO4iHbkwQBcFC9dkHAS-uD-ICYXQhc" 
              />
            </div>
            <h2 className="font-headline font-bold text-2xl text-on-primary-container tracking-tight">
              {user ? user.nickname : '익명의 여행자'}
            </h2>
            <p className="font-body text-sm text-on-primary-container/70 mt-1">
              {user ? user.email : '로그인이 필요합니다'}
            </p>
            <div className="mt-6 flex gap-3">
              <span className="px-4 py-1.5 bg-tertiary-container text-on-tertiary-container text-xs font-semibold rounded-full">
                레벨 4 리스너
              </span>
              <span className="px-4 py-1.5 bg-primary-container text-on-primary-container text-xs font-semibold rounded-full">
                따뜻한 마음
              </span>
            </div>
          </div>
          {/* Decorative blur shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
        </section>

        {/* Activity Stats: Asymmetric Bento Style */}
        <section className="grid grid-cols-2 grid-rows-2 gap-4 h-48">
          <div className="col-span-1 row-span-2 bg-surface-container-lowest rounded-3xl p-6 flex flex-col justify-between items-start transition-transform hover:scale-[1.02] duration-300">
            <div className="w-10 h-10 rounded-2xl bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined shrink-0">chat_bubble</span>
            </div>
            <div>
              <span className="block text-3xl font-bold font-headline text-on-surface">12</span>
              <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">작성한 글</span>
            </div>
          </div>
          <div className="col-span-1 row-span-1 bg-surface-container-lowest rounded-3xl p-5 flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined shrink-0">forum</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-headline text-on-surface">48</span>
              <span className="text-[10px] font-medium text-on-surface-variant uppercase">남긴 댓글</span>
            </div>
          </div>
          <div className="col-span-1 row-span-1 bg-surface-container-lowest rounded-3xl p-5 flex items-center gap-4 transition-transform hover:scale-[1.02] duration-300">
            <div className="w-10 h-10 rounded-2xl bg-tertiary-container flex items-center justify-center text-on-tertiary-container">
              <span className="material-symbols-outlined shrink-0">bolt</span>
            </div>
            <div>
              <span className="block text-xl font-bold font-headline text-on-surface">3</span>
              <span className="text-[10px] font-medium text-on-surface-variant uppercase">진행 중인 채팅</span>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="flex gap-2 p-1 bg-surface-container-low rounded-2xl">
          <button className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-surface-container-lowest text-primary shadow-sm transition-all">내가 쓴 글</button>
          <button className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all">남긴 댓글</button>
          <button className="flex-1 py-3 px-4 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all">저장한 글</button>
        </nav>

        {/* Recent Activity Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline font-bold text-lg text-on-surface">최근 활동</h3>
            <button className="text-sm font-semibold text-primary">전체보기</button>
          </div>

          {/* Card 1: Recent Post */}
          <div className="group bg-surface-container-lowest rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-dim"></span>
                <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">게시글 • 2시간 전</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant cursor-pointer hover:text-primary transition-colors shrink-0">more_horiz</span>
            </div>
            <h4 className="font-headline font-semibold text-lg text-on-surface mb-2">태풍 속에서 빛을 찾다...</h4>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
              가끔은 나 혼자만 이런 생각으로 힘들어하는 것 같았지만, 이 공간이 있다는 걸 떠올렸어요. 오늘은 특히 더 힘든 하루였네요...
            </p>
            <div className="flex items-center gap-6 pt-4 border-t border-surface-container">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm shrink-0">favorite</span>
                <span className="text-xs font-bold">24</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-sm shrink-0">comment</span>
                <span className="text-xs font-bold">8</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Chat */}
          <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-4 border-secondary-fixed">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-high overflow-hidden">
                  <img alt="Chat Partner" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOdHnkpyKJUckJXOYGrODao9Sm4RMwNr1ob-vh2cHc4jFqekfxJ86Uogg6bYDgWPoU0-KpHKFcmDpMReJqfouCcecJh5yjPojyrpx_Vi3wY3PmgrYiiCC_ujupmMcOFVADQQE9huX5lKQ75qk6f__ayMi06UfDN-OXJSPBdVzV07hFmyr8Q_N-ISyuAv8Ikf8WZnQjbPEcsFhU_66aOlip1H-QRGcoOvPIZ8S8H1Rb1PJ5mdx7VjdV7Vo3jpkk_kwDrrrxDViz8Sk" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-headline font-bold text-on-surface">따뜻한 영혼</span>
                  <span className="text-[10px] font-medium text-on-surface-variant">현재 접속 중</span>
                </div>
                <p className="font-body text-sm text-on-surface-variant line-clamp-1 italic">"아까 제 이야기를 들어주셔서 감사합니다..."</p>
              </div>
            </div>
          </div>

          {/* Card 3: Recent Post */}
          <div className="group bg-surface-container-lowest rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">생각 • 1일 전</span>
              </div>
            </div>
            <h4 className="font-headline font-semibold text-lg text-on-surface mb-2">작은 성공도 중요해요.</h4>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed line-clamp-2">
              오늘은 나가서 10분 동안 신선한 공기를 마셨어요. 큰일은 아니지만, 그래도 발전이네요.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="px-3 py-1 bg-surface-container text-[10px] font-bold rounded-lg text-on-surface-variant">치유</span>
              <span className="px-3 py-1 bg-surface-container text-[10px] font-bold rounded-lg text-on-surface-variant">성장</span>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="p-6 rounded-[2rem] bg-secondary-container/50 border border-secondary-container flex items-center justify-between">
          <div className="max-w-[70%]">
            <h5 className="font-headline font-bold text-on-secondary-container mb-1">지금 당장 도움이 필요하신가요?</h5>
            <p className="font-body text-xs text-on-secondary-container/80 leading-relaxed">검증된 상담원이 24시간 언제나 진심 어린 대화를 위해 대기하고 있습니다.</p>
          </div>
          <button className="w-12 h-12 rounded-2xl bg-on-secondary-container text-surface flex items-center justify-center shadow-lg transition-transform active:scale-95">
            <span className="material-symbols-outlined shrink-0">arrow_forward</span>
          </button>
        </section>
      </main>

      {/* BottomNavBar Component */}
      <BottomNavBar />
    </div>
  );
}
