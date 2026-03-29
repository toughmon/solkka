import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  author_nickname?: string;
  author_avatar_url?: string;
  is_liked: boolean;
}

interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  author_nickname?: string;
  author_avatar_url?: string;
  created_at: string;
  like_count: number;
  is_liked: boolean;
  is_deleted: boolean;
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
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

  useEffect(() => {
    if (id) {
      fetchPostDetail();
      fetchComments();
    }
  }, [id]);

  const fetchPostDetail = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userIdParam = user ? `?user_id=${user.id}` : '';

      const res = await authFetch(`/api/posts/${id}${userIdParam}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      } else {
        showAlert('오류', '게시글을 찾을 수 없습니다.', () => navigate('/'));
      }
    } catch (err) {
      console.error('Fetch Post Detail Error:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      const userIdParam = user ? `?user_id=${user.id}` : '';

      const res = await authFetch(`/api/posts/${id}/comments${userIdParam}`);
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

  const handleLikePost = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !token) {
      showAlert('로그인 필요', '좋아요를 누르려면 로그인이 필요합니다.', () => navigate('/login'));
      return;
    }

    try {
      const res = await authFetch(`/api/posts/${id}/like`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setPost(prev => prev ? {
          ...prev,
          is_liked: data.liked,
          like_count: data.liked ? prev.like_count + 1 : prev.like_count - 1
        } : null);
      }
    } catch (err) {
      console.error('Post Like toggle error:', err);
    }
  };

  const handleLikeComment = async (commentId: number) => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !token) {
      showAlert('로그인 필요', '좋아요를 누르려면 로그인이 필요합니다.', () => navigate('/login'));
      return;
    }

    try {
      const res = await authFetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        setComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              is_liked: data.liked,
              like_count: data.liked ? c.like_count + 1 : c.like_count - 1
            };
          }
          return c;
        }));
      }
    } catch (err) {
      console.error('Comment Like toggle error:', err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;

    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !token) {
      showAlert('로그인 필요', '로그인이 필요합니다.');
      return;
    }

    try {
      const res = await authFetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchComments();
      } else {
        const data = await res.json();
        showAlert('오류', data.message || '삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Delete Comment Error:', err);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;


    if (!localStorage.getItem('accessToken')) {
      showAlert('로그인 필요', '댓글을 남기려면 로그인이 필요합니다.', () => navigate('/login'));
      return;
    }

    try {
      const res = await authFetch(`/api/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: newComment,
          parent_comment_id: replyTo ? replyTo.id : null
        })
      });

      if (res.ok) {
        setNewComment('');
        setReplyTo(null);
        fetchComments();
      } else {
        showAlert('오류', '댓글 등록에 실패했습니다.');
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

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={`p-6 rounded-xl shadow-sm space-y-3 transition-all hover:translate-y-[-1px] ${depth > 0
        ? `bg-surface-container-low border-l-4 border-secondary-fixed-dim`
        : 'bg-white border border-gray-100'
        }`}
      style={{ marginLeft: depth > 0 ? `${Math.min(depth * 1.5, 4)}rem` : '0' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden opacity-80">
          <img
            alt="Contributor Avatar"
            className={`w-full h-full object-cover ${comment.is_deleted ? 'grayscale brightness-150' : ''}`}
            src={comment.is_deleted ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' : (comment.author_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_nickname}`)}
          />
        </div>
        {!comment.is_deleted && (
          <span className="font-bold text-sm text-on-surface">{comment.author_nickname || '익명의 리스너'}</span>
        )}
        <span className="text-[10px] text-on-surface-variant font-label ml-auto">{getTimeAgo(comment.created_at)}</span>
      </div>
      <p className={`text-sm leading-relaxed ${comment.is_deleted ? 'text-outline-variant italic' : 'text-on-surface-variant'}`}>
        {comment.is_deleted ? '삭제된 댓글입니다.' : comment.content}
      </p>
      {!comment.is_deleted && (
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => handleLikeComment(comment.id)}
            className={`flex items-center gap-1.5 transition-colors group ${comment.is_liked ? 'text-error' : 'text-on-surface-variant hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: comment.is_liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            <span className="text-[10px] font-bold">{comment.like_count}</span>
          </button>
          <button
            onClick={() => setReplyTo(comment)}
            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">reply</span>
            답글 달기
          </button>
          {(() => {
            const userData = localStorage.getItem('user');
            const user = userData ? JSON.parse(userData) : null;
            return user && comment.author_nickname === user.nickname && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-[10px] font-bold text-error/60 hover:text-error hover:underline ml-auto"
              >
                삭제
              </button>
            );
          })()}
        </div>
      )}
    </div>
  );

  const renderCommentTree = (parentId: number | null, depth = 0) => {
    return comments
      .filter(c => c.parent_comment_id === parentId)
      .map(comment => (
        <div key={`group-${comment.id}`} className="space-y-4">
          {renderComment(comment, depth)}
          {renderCommentTree(comment.id, depth + 1)}
        </div>
      ));
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
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-[#fbf9f8]/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] transition-colors duration-300">
            <span className="material-symbols-outlined text-[#4c6272]">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold tracking-tight text-[#4c6272]">Haven Echo</h1>
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec] transition-colors duration-300">
          <span className="material-symbols-outlined text-[#4c6272]">share</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-8">
        <article className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary-container flex-shrink-0">
              <img alt="Avatar" className="w-full h-full object-cover" src={post.author_avatar_url || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b1b2b1"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-primary tracking-tight">{post.author_nickname || '익명의 여행자'}</span>
              <span className="text-xs text-on-surface-variant font-label">{getTimeAgo(post.created_at)}</span>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold uppercase tracking-wider rounded-full">{post.category_name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-headline font-extrabold text-on-surface leading-tight tracking-tight">{post.title}</h2>
            <div className="w-12 h-1 bg-secondary-fixed rounded-full"></div>
          </div>
          <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg whitespace-pre-wrap">{post.content}</div>
          <div className="flex items-center gap-6 pt-4">
            <button onClick={handleLikePost} className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${post.is_liked ? 'bg-error-container border-error text-on-error-container' : 'bg-surface-container-low border-outline-variant/10 text-on-surface'}`}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: post.is_liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              <span className="font-bold text-sm tracking-tight">{post.like_count}</span>
            </button>
            <div className="flex items-center gap-2 px-5 py-3 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary">chat_bubble</span>
              <span className="font-bold text-sm text-on-surface">{comments.length} Comments</span>
            </div>
          </div>
        </article>

        <div className="h-4 border-b border-gray-100"></div>

        <section className="space-y-6 pb-20">
          <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">Echoes of Support <span className="w-2 h-2 rounded-full bg-secondary"></span></h3>
          <div className="space-y-6">
            {comments.length > 0 ? renderCommentTree(null) : <div className="text-center py-10 text-on-surface-variant/60 italic">아직 도착한 위로가 없습니다. 첫마디를 건네보세요.</div>}
          </div>
        </section>

        <div className="fixed bottom-24 left-6 right-6 z-40 max-w-2xl mx-auto">
          {replyTo && (
            <div className="bg-primary/5 border-l-4 border-primary px-4 py-2 mb-2 rounded-r-lg flex justify-between items-center animate-fade-in backdrop-blur-sm">
              <p className="text-xs text-primary font-bold"><span className="font-normal opacity-70">Replying to:</span> {replyTo.author_nickname || '익명'} 💬</p>
              <button onClick={() => setReplyTo(null)} className="text-xs text-outline-variant hover:text-error">Cancel</button>
            </div>
          )}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 flex items-center gap-3 shadow-xl border border-white/40">
            <input value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendComment()} className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-3 text-on-surface font-body" placeholder={replyTo ? `${replyTo.author_nickname}님에게 답글 남기기...` : "따뜻한 한마디를 남겨주세요..."} type="text" />
            <button onClick={handleSendComment} className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dim rounded-xl flex items-center justify-center text-white shadow-md active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </main>
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
