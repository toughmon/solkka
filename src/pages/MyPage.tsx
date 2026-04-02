import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNavBar from '../components/BottomNavBar';
import AlertModal from '../components/AlertModal';
import { authFetch } from '../utils/api';

const getTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diffMs = new Date().getTime() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60) return `${Math.max(0, diffMins)}분 전`;
  if (diffHrs < 24) return `${diffHrs}시간 전`;
  return `${diffDays}일 전`;
};

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ postCount: 0, commentCount: 0, chatCount: 0 });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await authFetch('/api/users/me/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    const fetchActivities = async () => {
      try {
        const res = await authFetch('/api/users/me/activities?limit=3');
        if (res.ok) {
          const data = await res.json();
          setRecentActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    if (user) {
      fetchStats();
      fetchActivities();
    }
  }, [user]);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      onConfirm: onConfirm || (() => setAlertConfig(prev => ({ ...prev, isOpen: false })))
    });
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await authFetch('/api/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken })
        });
      } catch (err) {
        console.error('Logout API Error:', err);
      }
    }

    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    showAlert('로그아웃', '로그아웃 되었습니다.', () => navigate('/login'));
  };

  const handleRefreshAvatar = async () => {
    if (!user || !user.id) return;

    // Generate a new random seed for DiceBear
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;

    try {
      const res = await authFetch(`/api/users/${user.id}/avatar`, {
        method: 'PATCH',
        body: JSON.stringify({ avatar_url: newAvatarUrl })
      });

      if (res.ok) {
        const updatedUser = { ...user, avatar_url: newAvatarUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        showAlert('오류', '아바타 변경에 실패했습니다.');
      }
    } catch (err) {
      console.error('Refresh Avatar Error:', err);
    }
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
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-white/40 backdrop-blur-md p-1 mb-4 shadow-sm overflow-hidden">
                <img
                  alt="Avatar"
                  className="w-full h-full rounded-full bg-surface-container-lowest object-cover"
                  src={user?.avatar_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b1b2b1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'}
                />
              </div>
              <button
                onClick={handleRefreshAvatar}
                className="absolute bottom-4 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border-2 border-white"
                title="아바타 새로고침"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
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

        {/* Activity Stats: Simple Flat Cards */}
        <section className="flex gap-2 w-full">
          <div className="flex-1 bg-surface-container-lowest rounded-2xl py-4 px-1 flex flex-col items-center justify-center border border-surface-container/60 shadow-sm transition-transform hover:scale-[1.02]">
             <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant mb-1 whitespace-nowrap">작성한 글</span>
             <span className="text-2xl font-bold font-headline text-on-surface">{stats.postCount}</span>
          </div>
          <div className="flex-1 bg-surface-container-lowest rounded-2xl py-4 px-1 flex flex-col items-center justify-center border border-surface-container/60 shadow-sm transition-transform hover:scale-[1.02]">
             <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant mb-1 whitespace-nowrap">남긴 댓글</span>
             <span className="text-2xl font-bold font-headline text-on-surface">{stats.commentCount}</span>
          </div>
          <div className="flex-1 bg-surface-container-lowest rounded-2xl py-4 px-1 flex flex-col items-center justify-center border border-surface-container/60 shadow-sm transition-transform hover:scale-[1.02]">
             <span className="text-[10px] sm:text-[11px] font-medium text-on-surface-variant mb-1 whitespace-nowrap">진행중인 채팅</span>
             <span className="text-2xl font-bold font-headline text-on-surface">{stats.chatCount}</span>
          </div>
        </section>



        {/* Recent Activity Feed */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4 mt-8">
            <h3 className="font-headline font-bold text-lg text-on-surface">최근 활동</h3>
            <button 
              onClick={() => navigate('/my/activities')}
              className="text-sm font-semibold text-primary hover:text-primary-dim transition-colors"
            >
              전체보기
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="text-center text-on-surface-variant py-8 text-sm">최근 활동 내역이 없습니다.</div>
          ) : recentActivities.map((act, idx) => (
            act.type === 'post' ? (
              <div key={idx} className="group bg-surface-container-lowest rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer" onClick={() => navigate(`/post/${act.id}`)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-dim"></span>
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">{act.categoryName} • {getTimeAgo(act.created_at)}</span>
                  </div>
                </div>
                <h4 className="font-headline font-semibold text-lg text-on-surface mb-2">{act.title}</h4>
                <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
                  {act.content}
                </p>
                <div className="flex items-center gap-6 pt-4 border-t border-surface-container">
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm shrink-0">favorite</span>
                    <span className="text-xs font-bold">{act.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm shrink-0">comment</span>
                    <span className="text-xs font-bold">{act.commentCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={idx} className="bg-surface-container-lowest rounded-[1.5rem] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-l-4 border-secondary-fixed cursor-pointer" onClick={() => navigate(`/chat/${act.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-surface-container-high overflow-hidden">
                      <img alt="Chat Partner" src={act.partnerAvatarUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-headline font-bold text-on-surface">{act.partnerNickname}</span>
                      <span className="text-[10px] font-medium text-on-surface-variant">{getTimeAgo(act.created_at)}</span>
                    </div>
                    <p className="font-body text-sm text-on-surface-variant line-clamp-1 italic">"{act.lastMessage}"</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </section>


      </main>

      {/* BottomNavBar Component */}
      <BottomNavBar />

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={() => {
          alertConfig.onConfirm();
          setAlertConfig(prev => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
