import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import AlertModal from '../components/AlertModal';
import { authFetch } from '../utils/api';

interface Post {
  id: number;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  is_counseling_requested: boolean;
  created_at: string;
  category_name: string;
  is_liked: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userIdParam = user ? `?user_id=${user.id}` : '';

      const res = await authFetch(`/api/posts${userIdParam}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation(); // Prevent navigating to detail page

    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !token) {
      setShowLoginAlert(true);
      return;
    }

    try {
      const res = await authFetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state for immediate feedback
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: data.liked,
              like_count: data.liked ? p.like_count + 1 : p.like_count - 1
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return '방금 전';
    if (diffInMins < 60) return `${diffInMins}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  const renderSupportCard = () => (
    <div key="support-card" className="relative overflow-hidden bg-secondary-fixed text-on-secondary-fixed p-6 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md">
      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-secondary-fixed-dim/30 rounded-full blur-3xl"></div>
      <div className="relative z-10 p-3 bg-white/20 rounded-full backdrop-blur-md">
        <span className="material-symbols-outlined text-secondary">volunteer_activism</span>
      </div>
      <div className="relative z-10">
        <p className="font-headline font-semibold text-sm">당신은 혼자가 아닙니다.</p>
        <p className="text-xs opacity-80 mt-1">지금 1,240명의 사람들이 서로의 여정을 나누고 있습니다.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface pb-32">
      <TopAppBar />

      <main className="pt-24 px-5 max-w-2xl mx-auto space-y-8">
        <section className="space-y-2">
          <h2 className="text-3xl font-headline font-semibold text-primary tracking-tight">Solkka</h2>
          <p className="text-on-surface-variant text-sm max-w-[85%] leading-relaxed">
            생각을 위한 조용한 공간입니다. 익명으로 안전하게 당신의 마음을 나누어보세요.
          </p>
        </section>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide no-scrollbar -mx-5 px-5">
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-primary text-on-primary font-medium text-sm transition-all shadow-sm">
            전체
          </button>
          {['인간관계', '이별', '짝사랑', '진로', '직장', '일상'].map(cat => (
            <button key={cat} className="flex-shrink-0 px-6 py-2.5 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm hover:bg-surface-container-high transition-all">
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-xl animate-pulse space-y-4">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              {(() => {
                const supportIndex = Math.floor(Math.random() * (posts.length)) || (posts.length > 0 ? 0 : -1);

                return posts.map((post, index) => {
                  const postElement = (
                    <article
                      key={post.id}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="bg-surface-container-lowest p-6 rounded-xl space-y-4 transition-all hover:translate-y-[-2px] hover:shadow-md border border-outline-variant/5 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container text-[10px] font-bold tracking-widest uppercase">
                          {post.category_name}
                        </span>
                        <div className="flex items-center gap-2">
                          {post.is_counseling_requested && (
                            <span className="material-symbols-outlined text-primary text-sm" title="상담 요청됨">psychology</span>
                          )}
                          <span className="text-xs text-outline font-medium">{getTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-headline font-semibold text-on-surface leading-snug">{post.title}</h3>
                        <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={(e) => handleLikePost(e, post.id)}
                            className={`flex items-center gap-1.5 transition-colors group ${post.is_liked ? 'text-error' : 'text-on-surface-variant hover:text-primary'}`}
                          >
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: post.is_liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                            <span className="text-xs font-medium">{post.like_count}</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-on-surface-variant">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                            <span className="text-xs font-medium">{post.view_count}</span>
                          </div>
                        </div>
                        <button className="p-2 text-outline-variant hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">bookmark</span>
                        </button>
                      </div>
                    </article>
                  );

                  return (
                    <div key={`post-wrapper-${post.id}`} className="space-y-6">
                      {index === supportIndex && renderSupportCard()}
                      {postElement}
                      {index === posts.length - 1 && supportIndex === posts.length && renderSupportCard()}
                    </div>
                  );
                });
              })()}
            </>
          ) : (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">draw</span>
              <p className="text-on-surface-variant font-medium">아직 게시글이 없습니다. 첫 번째 이야기를 들려주세요.</p>
              <button
                onClick={() => navigate('/create')}
                className="mt-6 px-6 py-2 bg-primary text-white rounded-full font-bold text-sm shadow-md"
              >
                글 쓰러 가기
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNavBar />

      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 md:hidden"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <button
        onClick={() => navigate('/create')}
        className="fixed bottom-10 right-10 hidden md:flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full shadow-xl hover:bg-primary-dim transition-all z-40 group"
      >
        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">add</span>
        <span className="font-headline font-bold">새 글 작성</span>
      </button>

      <AlertModal
        isOpen={showLoginAlert}
        title="로그인 필요"
        message="좋아요를 누르려면 로그인이 필요합니다."
        onConfirm={() => navigate('/login')}
        confirmText="로그인하러 가기"
      />
    </div>
  );
}
