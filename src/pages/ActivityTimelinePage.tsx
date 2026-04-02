import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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

export default function ActivityTimelinePage() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await authFetch('/api/users/me/activities?limit=50');
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (error) {
        console.error('Failed to fetch all activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-[#fbf9f8] text-[#313332] min-h-screen pb-12 font-body" style={{ minHeight: 'max(884px, 100dvh)' }}>
      {/* TopAppBar */}
      <header className="bg-[#fbf9f8]/80 dark:bg-[#1a1c1e]/80 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm border-b border-surface-container/30">
        <div className="flex items-center px-6 h-16 w-full gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-[#4c6272] dark:text-[#a5c8df] hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined shrink-0 text-xl">arrow_back</span>
          </button>
          <h1 className="font-headline font-semibold text-lg tracking-tight text-[#4c6272] dark:text-[#a5c8df]">전체 활동 내역</h1>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-on-surface-variant py-12 text-sm mt-12 bg-surface-container-lowest rounded-3xl shadow-sm border border-surface-container/50">
            <span className="material-symbols-outlined text-4xl mb-3 text-outline-variant">history</span>
            <p>아직 활동 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-surface-container-high ml-4 space-y-8 pb-8">
            {activities.map((act, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-surface-container-lowest border-4 border-primary"></div>
                
                {act.type === 'post' ? (
                  <div className="group bg-surface-container-lowest rounded-[1.5rem] p-5 md:p-6 transition-all duration-300 hover:shadow-md cursor-pointer border border-surface-container/50 hover:border-primary/30" onClick={() => navigate(`/post/${act.id}`)}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider">
                        작성한 게시글
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant/80">
                        {act.categoryName} • {getTimeAgo(act.created_at)}
                      </span>
                    </div>
                    <h4 className="font-headline font-semibold text-lg text-on-surface mb-2">{act.title}</h4>
                    <p className="font-body text-sm text-on-surface-variant/90 leading-relaxed mb-4 line-clamp-2">
                      {act.content}
                    </p>
                    <div className="flex items-center gap-5 pt-3 border-t border-surface-container/70">
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
                  <div className="bg-surface-container-lowest rounded-[1.5rem] p-5 md:p-6 transition-all duration-300 hover:shadow-md border-l-[6px] border-secondary-fixed border-y border-r border-surface-container/50 cursor-pointer hover:border-r-secondary-fixed/30 hover:border-y-secondary-fixed/30" onClick={() => navigate(`/chat/${act.id}`)}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider">
                        진행중인 채팅
                      </span>
                      <span className="text-xs font-semibold text-on-surface-variant/80">
                        {getTimeAgo(act.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="w-12 h-12 rounded-2xl bg-surface-container-high overflow-hidden shrink-0 shadow-sm border border-surface-container/50">
                        <img alt="Chat Partner" src={act.partnerAvatarUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <span className="font-headline font-bold text-on-surface text-base block mb-0.5">
                          {act.partnerNickname}님과의 대화
                        </span>
                        <p className="font-body text-sm text-on-surface-variant line-clamp-1 italic">
                          "{act.lastMessage || '연결되었습니다. 인사를 나누어보세요.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
