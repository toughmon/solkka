import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { authFetch } from '../utils/api';

export default function BottomNavBar() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const res = await authFetch('/api/chat-rooms/unread-count');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setUnreadCount(data.unreadCount || 0);
        }
      } catch (err) {
        // ignore err
      }
    };

    // 초기 로딩
    fetchUnreadCount();

    // 15초마다 자동 검사
    const interval = setInterval(fetchUnreadCount, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const baseClass = "flex flex-col items-center justify-center px-5 py-2 transition-all duration-300 relative";
  const inactiveClass = `${baseClass} text-[#5e5f5f] dark:text-[#909191] hover:text-[#4c6272] dark:hover:text-[#a5c8df] scale-95 active:scale-90`;
  const activeClass = `${baseClass} bg-[#4c6272] text-white dark:bg-[#a5c8df] dark:text-[#1a1c1e] rounded-[1.5rem]`;

  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl rounded-t-[1.5rem] z-50 shadow-[0_-4px_40px_rgba(49,51,50,0.06)]">
      {/* Home / Feed */}
      <Link className={isActive('/') ? activeClass : inactiveClass} to="/">
        <span className="material-symbols-outlined mb-1 shrink-0">home</span>
        <span className="font-['Manrope'] text-[11px] font-medium tracking-wide">홈</span>
      </Link>
      
      {/* 상담 */}
      <Link className={isActive('/chat') ? activeClass : inactiveClass} to="/chat">
        <div className="relative mb-1">
          <span className="material-symbols-outlined shrink-0">chat_bubble</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <span className="font-['Manrope'] text-[11px] font-medium tracking-wide">상담</span>
      </Link>

      {/* Create Post */}
      <Link className={isActive('/create') ? activeClass : inactiveClass} to="/create">
        <span className="material-symbols-outlined mb-1 shrink-0">add_circle</span>
        <span className="font-['Manrope'] text-[11px] font-medium tracking-wide">글쓰기</span>
      </Link>

      {/* Profile */}
      <Link className={isActive('/mypage') ? activeClass : inactiveClass} to="/mypage">
        <span className="material-symbols-outlined mb-1 shrink-0">person</span>
        <span className="font-['Manrope'] text-[11px] font-medium tracking-wide">프로필</span>
      </Link>
    </nav>
  );
}
