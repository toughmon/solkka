import React from 'react';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface pb-32">
      <TopAppBar />
      
      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-8">
        {/* Welcome Section */}
        <section className="space-y-2">
          <h2 className="text-3xl font-headline font-semibold text-primary tracking-tight">잔잔한 속삭임</h2>
          <p className="text-on-surface-variant text-sm max-w-[85%] leading-relaxed">
            생각을 위한 조용한 공간입니다. 익명으로 안전하게 당신의 마음을 나누어보세요.
          </p>
        </section>

        {/* Filter Chips */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-5 px-5">
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-primary text-on-primary font-medium text-sm transition-all shadow-sm">
            전체
          </button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all">
            인간관계
          </button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all">
            커리어
          </button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all">
            일상
          </button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all">
            자기계발
          </button>
        </div>

        {/* Post List */}
        <div className="space-y-6">
          {/* Post Card 1 */}
          <article className="bg-surface-container-lowest p-6 rounded-xl space-y-4 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-widest uppercase">커리어</span>
              <span className="text-xs text-outline font-medium">2시간 전</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-semibold text-on-surface leading-snug">지금 직장에서 투명인간이 된 것 같아요...</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                이 회사에 다닌 지 벌써 3년이 되었고 제 KPI를 모두 달성했는데도 제 기여도가 인정받지 못하는 것 같아요. 저처럼 '유령 직원'이 된 것 같은 기분을 느껴보신 분 계신가요?
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors group">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  <span className="text-xs font-medium">12</span>
                </button>
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  <span className="text-xs font-medium">4</span>
                </button>
              </div>
              <button className="p-2 text-outline-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">bookmark</span>
              </button>
            </div>
          </article>

          {/* Post Card 2 */}
          <article className="bg-surface-container-lowest rounded-xl overflow-hidden transition-all hover:translate-y-[-2px]">
            <div className="h-40 w-full relative">
              <img className="w-full h-full object-cover opacity-80 brightness-95" alt="Soft ethereal morning light filtering through a sheer white curtain onto a wooden floor with gentle shadows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW4BNFHFEWWF_yhz_059NovLWYPxYfxh7rW8-7z3QqnnPJVb9HFPIbQNxOC4bFavED1Fj46aHTuclwxeWE7wc9ahqFnHBoH5hWuxCtc4TpMpLaohENJsCETcS_tgvKIWPeYP2AxbhHz3FPSrdCEv-yXHVjeG9SciS29helyQlkMJrHbr_Vn_Ld6i6If-c1Fxkk1BOTiJQPmnRIl1i45pRXrOfLnD61GdvPVOAEukZpmcGBkbblOkOa_-SBnXjbBZP2IAg4VaYLA30" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
            </div>
            <div className="p-6 -mt-8 relative space-y-4 bg-surface-container-lowest rounded-t-2xl">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase">일상</span>
                <span className="text-xs text-outline font-medium">5시간 전</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-headline font-semibold text-on-surface leading-snug">조용한 일요일 아침의 아름다움.</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                  알람이 울리기 전에 일어나 커피와 함께 가만히 앉아 있었어요. 핸드폰도, 뉴스도 없이 그저 새소리만 들었죠. 몇 주 만에 처음으로 평온함을 느꼈네요.
                </p>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  <span className="text-xs font-medium">45</span>
                </button>
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  <span className="text-xs font-medium">8</span>
                </button>
              </div>
            </div>
          </article>

          {/* Post Card 3 */}
          <article className="bg-surface-container-lowest p-6 rounded-xl space-y-4 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold tracking-widest uppercase">인간관계</span>
              <span className="text-xs text-outline font-medium">10시간 전</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-semibold text-on-surface leading-snug">부모님과의 경계선 문제로 힘들어요...</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                부모님께 상처 주지 않고 제 공간이 필요하다고 어떻게 말씀드려야 할까요? 부모님을 사랑하지만, 저만의 삶을 꾸려가려다 보니 매일 이어지는 확인 연락이 점점 버거워지네요.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  <span className="text-xs font-medium">29</span>
                </button>
                <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  <span className="text-xs font-medium">15</span>
                </button>
              </div>
              <button className="p-2 text-outline-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">bookmark</span>
              </button>
            </div>
          </article>

          {/* Support Affirmation */}
          <div className="relative overflow-hidden bg-secondary-fixed text-on-secondary-fixed p-6 rounded-2xl flex items-center gap-4">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary-fixed-dim/30 rounded-full blur-3xl"></div>
            <div className="relative z-10 p-3 bg-white/20 rounded-full backdrop-blur-md">
              <span className="material-symbols-outlined text-secondary">volunteer_activism</span>
            </div>
            <div className="relative z-10">
              <p className="font-headline font-semibold text-sm">당신은 혼자가 아닙니다.</p>
              <p className="text-xs opacity-80 mt-1">지금 1,240명의 사람들이 서로의 여정을 나누고 있습니다.</p>
            </div>
          </div>

          {/* Post Card 4 */}
          <article className="bg-surface-container-lowest p-6 rounded-xl space-y-4 transition-all hover:translate-y-[-2px]">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-bold tracking-widest uppercase">외로움</span>
              <span className="text-xs text-outline font-medium">어제</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-headline font-semibold text-on-surface leading-snug">주말의 우울함이 너무 크게 다가와요.</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                직장 때문에 새로운 도시로 이사 왔어요. 두 달이 지났지만 여전히 '내 사람들'을 찾지 못했네요. 오늘은 공원에 앉아 몇 시간 동안 다른 사람들이 대화하는 것만 지켜봤어요.
              </p>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">favorite</span>
                <span className="text-xs font-medium">84</span>
              </button>
              <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-lg">chat_bubble</span>
                <span className="text-xs font-medium">32</span>
              </button>
            </div>
          </article>
        </div>
      </main>
      
      <BottomNavBar />
    </div>
  );
}
