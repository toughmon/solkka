import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';

interface Post {
  id: number;
  title: string;
  content: string;
  view_count: number;
  like_count: number;
  is_counseling_requested: boolean;
  created_at: string;
  category_name: string;
  author_nickname?: string;
}

interface Comment {
  id: number;
  content: string;
  author_nickname?: string;
  created_at: string;
  like_count: number;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      fetchPostDetail();
      fetchComments();
    }
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      } else {
        alert('게시글을 찾을 수 없습니다.');
        navigate('/');
      }
    } catch (err) {
      console.error('Fetch Post Detail Error:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${id}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Fetch Comments Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;

    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    try {
      const res = await fetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_account_id: user?.id,
          content: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments(); // 댓글 목록 새로고침
      } else {
        alert('댓글 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('Send Comment Error:', err);
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

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary font-headline font-bold text-xl text-center">
          마음을 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen pb-40">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#fbf9f8]/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] transition-colors duration-300"
          >
            <span className="material-symbols-outlined text-[#4c6272]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#4c6272]">Haven Echo</h1>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] transition-colors duration-300">
          <span className="material-symbols-outlined text-[#4c6272]">share</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        {/* Post Content Section */}
        <article className="space-y-6">
          {/* Author Meta */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container flex-shrink-0">
              <img 
                alt="Anonymous Avatar" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkl1v2Dxqu2pTqIIBk0o1HMlydFilfM3d_D3Jea0QExxaVA2NobFFlpSOV2L3aWo9g25FBXP_T3hIu55JhSc4cvHYpzoXInjN3dHgWA4yL6Jb5LiDhEPfL1-UgO8H1IXrWUXzZG2zQN7XfV3BQN75x7ZaJkwzJFze4Shp0GYuxiRLRU6hVEwhS6kD9pojzVxbFSJIpR1ODXg25LeOgbhsa2V4sKp-id8VMVy6cxtTCfPv8OW-M4StUZK0VFDD8LAesY6f5oGcFMlg"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-primary tracking-tight">{post.author_nickname || '익명의 여행자'}</span>
              <span className="text-xs text-on-surface-variant font-label">{getTimeAgo(post.created_at)}</span>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider rounded-full">
                {post.category_name}
              </span>
            </div>
          </div>
          
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface leading-tight tracking-tight">
              {post.title}
            </h2>
            <div className="w-12 h-1 bg-secondary-fixed rounded-full"></div>
          </div>

          {/* Body */}
          <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Interactions */}
          <div className="flex items-center gap-6 pt-4">
            <button className="flex items-center gap-2 px-5 py-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-all group border border-outline-variant/10">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <span className="font-bold text-sm text-on-surface">{post.like_count}</span>
            </button>
            <div className="flex items-center gap-2 px-5 py-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              <span className="font-bold text-sm text-on-surface">{comments.length} Comments</span>
            </div>
          </div>
        </article>

        {/* Divider with spacing */}
        <div className="h-4 border-b border-gray-100"></div>

        {/* Comments Section */}
        <section className="space-y-6">
          <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
            Echoes of Support
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
          </h3>
          
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={`p-6 rounded-xl shadow-sm space-y-3 transition-all hover:translate-y-[-1px] ${
                    index % 2 === 1 ? 'bg-surface-container-low ml-4 border-l-4 border-secondary-fixed-dim' : 'bg-white border border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                      <img 
                        alt="Contributor Avatar" 
                        className="w-full h-full object-cover" 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_nickname}`}
                      />
                    </div>
                    <span className="font-bold text-sm text-on-surface">{comment.author_nickname || '익명의 리스너'}</span>
                    <span className="text-[10px] text-on-surface-variant font-label ml-auto">{getTimeAgo(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-on-surface-variant/60 italic">
                아직 도착한 위로가 없습니다. 첫마디를 건네보세요.
              </div>
            )}
          </div>
        </section>

        {/* New Comment Input (Glassy floating bar) */}
        <div className="fixed bottom-24 left-6 right-6 z-40 max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 flex items-center gap-3 shadow-xl border border-white/40">
            <input 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-on-surface font-body" 
              placeholder="따뜻한 한마디를 남겨주세요..." 
              type="text"
            />
            <button 
              onClick={handleSendComment}
              className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dim rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
