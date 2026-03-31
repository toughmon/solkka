import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '../components/BottomNavBar';
import { authFetch } from '../utils/api';

interface ChatRoom {
  id: number;
  partner_id: number;
  partner_nickname: string;
  partner_avatar_url: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  post_content: string | null;
  is_active: boolean;
}


interface CounselingRequest {
  id: number;
  post_id: number;
  post_title: string;
  requester_id: number;
  requester_nickname: string;
  requester_avatar_url: string;
  status: string;
  created_at: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [requests, setRequests] = useState<CounselingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, reqsRes] = await Promise.all([
        authFetch('/api/chat-rooms'),
        authFetch('/api/counseling-requests/received')
      ]);
      if (roomsRes.ok) setChatRooms(await roomsRes.json());
      if (reqsRes.ok) setRequests(await reqsRes.json());
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      const res = await authFetch(`/api/counseling-requests/${requestId}/accept`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const data = await res.json();
        fetchData();
        navigate(`/chat/${data.roomId}`);
      }
    } catch (err) {
      console.error('Accept Error:', err);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!window.confirm('상담 요청을 거절하시겠습니까?')) return;
    try {
      const res = await authFetch(`/api/counseling-requests/${requestId}/reject`, {
        method: 'PATCH'
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error('Reject Error:', err);
    }
  };

  const getTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '';
    const now = new Date();
    const past = new Date(dateStr);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMins < 1) return '방금';
    if (diffInMins < 60) return `${diffInMins}분 전`;
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${diffInDays}일 전`;
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen pb-24">
      {/* Header */}
      <header className="fixed top-0 w-full flex items-center px-6 h-16 bg-[#fbf9f8]/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
          <h1 className="text-lg font-headline font-bold tracking-tight text-primary">대화</h1>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'chats'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            채팅방 {chatRooms.length > 0 && <span className="ml-1 opacity-70">{chatRooms.length}</span>}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === 'requests'
                ? 'bg-primary text-white shadow-md'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            받은 요청
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-primary font-headline font-bold text-lg">불러오는 중...</div>
          </div>
        ) : activeTab === 'chats' ? (
          /* Chat Rooms List */
          <div className="space-y-3">
            {chatRooms.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">forum</span>
                <p className="text-on-surface-variant/60 text-sm">아직 대화가 없습니다</p>
                <p className="text-on-surface-variant/40 text-xs mt-1">게시글에서 상담을 요청해보세요</p>
              </div>
            ) : (
              chatRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => navigate(`/chat/${room.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:translate-y-[-1px] transition-all text-left"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container">
                      <img
                        alt={room.partner_nickname}
                        src={room.partner_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${room.partner_nickname}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                        {room.unread_count > 9 ? '9+' : room.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-on-surface truncate">{room.partner_nickname}</span>
                      <span className="text-[10px] text-on-surface-variant/60 flex-shrink-0 ml-2">{getTimeAgo(room.last_message_at)}</span>
                    </div>
                    {room.post_content && (
                      <p className="text-[10px] text-primary/70 truncate mb-1 bg-primary/5 inline-block px-1.5 py-0.5 rounded max-w-[90%]">
                        {room.post_content}
                      </p>
                    )}
                    <p className={`text-xs truncate ${room.unread_count > 0 ? 'text-on-surface font-semibold' : 'text-on-surface-variant/60'}`}>
                      {room.last_message || '대화를 시작해보세요 👋'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Counseling Requests List */
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">mark_email_unread</span>
                <p className="text-on-surface-variant/60 text-sm">받은 상담 요청이 없습니다</p>
              </div>
            ) : (
              pendingRequests.map(req => (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border border-gray-100 space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container flex-shrink-0">
                      <img
                        alt={req.requester_nickname}
                        src={req.requester_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.requester_nickname}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface">{req.requester_nickname}</p>
                      <p className="text-[10px] text-on-surface-variant/60">{getTimeAgo(req.created_at)}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                  </div>
                  <p className="text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg">
                    <span className="font-bold text-primary">게시글:</span> {req.post_title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-[#5b8fa8] to-[#4c6272] text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                    >
                      수락하기
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex-1 py-2.5 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all"
                    >
                      거절하기
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
