import React from 'react';

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl rounded-t-[1.5rem] shadow-[0_-4px_40px_rgba(49,51,50,0.06)]">
      {/* Home (Active) */}
      <a className="flex flex-col items-center justify-center text-primary dark:text-[#a5c9e0] bg-[#e4d0cf]/30 dark:bg-[#5d4e4e]/30 rounded-2xl px-5 py-2 transition-all duration-300 scale-95 active:scale-90" href="#">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-manrope text-[10px] font-medium tracking-wide uppercase mt-1">홈</span>
      </a>
      {/* Search */}
      <a className="flex flex-col items-center justify-center text-[#5e5f5f] dark:text-[#c4c7c5] px-5 py-2 hover:opacity-80 transition-opacity active:scale-90" href="#">
        <span className="material-symbols-outlined text-2xl">search</span>
        <span className="font-manrope text-[10px] font-medium tracking-wide uppercase mt-1">검색</span>
      </a>
      {/* Post (FAB Style) */}
      <a className="flex flex-col items-center justify-center text-[#5e5f5f] dark:text-[#c4c7c5] px-5 py-2 hover:opacity-80 transition-opacity active:scale-90" href="#">
        <span className="material-symbols-outlined text-2xl">add_circle</span>
        <span className="font-manrope text-[10px] font-medium tracking-wide uppercase mt-1">글쓰기</span>
      </a>
      {/* Profile */}
      <a className="flex flex-col items-center justify-center text-[#5e5f5f] dark:text-[#c4c7c5] px-5 py-2 hover:opacity-80 transition-opacity active:scale-90" href="#">
        <span className="material-symbols-outlined text-2xl">person</span>
        <span className="font-manrope text-[10px] font-medium tracking-wide uppercase mt-1">프로필</span>
      </a>
    </nav>
  );
}
