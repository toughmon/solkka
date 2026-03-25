import { useNavigate } from 'react-router';
import BottomNavBar from '../components/BottomNavBar';

export default function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden" style={{ minHeight: 'max(884px, 100dvh)' }}>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center bg-[#fbf9f8]/80 backdrop-blur-xl z-50 transition-colors duration-300">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec]/50 transition-all text-[#4c6272]"
        >
          <span className="material-symbols-outlined" data-icon="close">close</span>
        </button>
        <h1 className="font-headline text-xl font-semibold tracking-tight text-[#4c6272]">Solkka</h1>
        <button className="px-5 py-2 rounded-full font-headline font-bold text-sm tracking-wide bg-gradient-to-br from-primary to-primary-dim text-on-primary hover:opacity-90 transition-all active:scale-95">
          게시
        </button>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-2xl mx-auto min-h-screen relative overflow-hidden">
        {/* Subtle Background Element */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary-fixed-dim/20 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-40 -left-10 w-48 h-48 bg-tertiary-fixed-dim/20 rounded-full blur-3xl -z-10"></div>

        <div className="space-y-8">
          {/* Title Section */}
          <div className="space-y-2">
            <input
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-2xl font-headline font-bold text-on-surface placeholder:text-outline-variant/60 outline-none"
              placeholder="제목을 입력하세요..."
              type="text"
            />
            <div className="h-[1px] w-full bg-gradient-to-r from-outline-variant/30 via-outline-variant/10 to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="relative min-h-[300px]">
            <textarea
              className="w-full min-h-[400px] bg-transparent border-none p-0 focus:ring-0 text-lg font-body leading-relaxed text-on-surface-variant placeholder:text-outline-variant/60 resize-none hide-scrollbar outline-none"
              placeholder="당신의 마음을 나누어주세요..."
            ></textarea>
          </div>

          {/* Category Selection: Horizontal Bento/Chips */}
          <div className="space-y-4">
            <label className="font-headline text-xs font-bold uppercase tracking-widest text-outline">카테고리 선택</label>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium text-sm hover:bg-secondary-container transition-all border border-outline-variant/10">
                인간관계
              </button>
              <button type="button" className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-medium text-sm shadow-sm transition-all border border-transparent">
                커리어
              </button>
              <button type="button" className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium text-sm hover:bg-secondary-container transition-all border border-outline-variant/10">
                자기계발
              </button>
              <button type="button" className="px-5 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant font-medium text-sm hover:bg-secondary-container transition-all border border-outline-variant/10">
                기타
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* Image for atmospheric detail */}
      <div className="fixed bottom-0 right-0 -z-20 opacity-5 pointer-events-none">
        <img
          alt="Soft textures"
          className="w-screen h-screen object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdjrgn0Ygz9XHKUa0Ax7cur62QzDrdWJAXOGLy5KWcre3IAXjuYTPOYHGEs0CQN4SH8FrecFWNH5H8hle6KLLzainidIVQGGDMRpUr9w67r7MR9j6EU3UKGpbLaI3of2a_cOwXrXg3VB6W70M2VCdVAVItKnEQLSC2FOvpdtzdlV4Ri27Yyk2Ve17miH8CnfGn28hQ_PwJfBc3hAsYCacoj0LXvLLW7hT6AagPi88hj1HQm7OcmWYkh7NNma7Dzxg_5Mo8dTYUVP0"
        />
      </div>
      
      {/* BottomNavBar Component */}
      <BottomNavBar />
    </div>
  );
}
