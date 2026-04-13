import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { connectSocket } from '../utils/socket';
import { authFetch } from '../utils/api';
import AlertModal from '../components/AlertModal';

interface Message {
  id: number;
  chat_room_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_nickname?: string;
  sender_avatar_url?: string;
}

interface RoomInfo {
  partner_nickname: string;
  partner_avatar_url: string;
  partner_id: number;
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    onConfirm: () => {},
    onCancel: undefined as (() => void) | undefined
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getCurrentUser = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);

  const currentUser = getCurrentUser();

  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((title: string, message: string, onConfirm?: () => void, confirmText = '확인') => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: '취소',
      onConfirm: () => {
        closeAlert();
        onConfirm?.();
      },
      onCancel: undefined
    });
  }, [closeAlert]);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, confirmText = '확인', cancelText = '취소') => {
    setAlertConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm: () => {
        closeAlert();
        onConfirm();
      },
      onCancel: closeAlert
    });
  }, [closeAlert]);


  useEffect(() => {
    if (!roomId) {
      navigate('/chat');
      return;
    }

    if (!currentUser.id) {
      navigate('/login');
      return;
    }

    fetchMessages();
    fetchRoomInfo();

    const socket = connectSocket();
    const roomNum = parseInt(roomId);

    const onConnect = () => {
      console.log('Socket Connected! Joining room:', roomNum);
      socket.emit('join_room', roomNum);
      socket.emit('message_read', roomNum);
    };

    const onNewMessage = (message: Message) => {
      console.log('New message received:', message);
      if (message.chat_room_id === roomNum) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        socket.emit('message_read', roomNum);
      }
    };

    const onMessagesRead = ({ roomId: readRoomId }: { roomId: number, readBy: number }) => {
      if (readRoomId === roomNum) {
        setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      }
    };

    const onChatClosed = ({ roomId: closedRoomId }: { roomId: number }) => {
      if (closedRoomId === roomNum && !isClosed) {
        setIsClosed(true);
        showAlert('대화 종료', '대화가 종료되었습니다.', () => navigate('/chat', { replace: true }));
      }
    };

    // 항상 초기화하고 다시 등록
    socket.off('connect');
    socket.off('disconnect');
    socket.off('new_message');
    socket.off('messages_read');
    socket.off('chat_closed');

    socket.on('connect', onConnect);
    socket.on('new_message', onNewMessage);
    socket.on('messages_read', onMessagesRead);
    socket.on('chat_closed', onChatClosed);
    
    socket.on('connect_error', (err) => {
      console.error('Socket Connect Error:', err.message);
      if (err.message === '유효하지 않은 토큰입니다.' || err.message === '인증 토큰이 필요합니다.') {
        // 토큰이 localStorage에서 갱신되었을 수 있으므로 다시 읽어와 재설정
        const currentToken = localStorage.getItem('accessToken');
        socket.auth = { token: currentToken };
        setTimeout(() => socket.connect(), 1000); // 1초 뒤 재연결 시도
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket Disconnected:', reason);
    });

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('new_message', onNewMessage);
      socket.off('messages_read', onMessagesRead);
      socket.off('chat_closed', onChatClosed);
      socket.emit('leave_room', roomNum);
    };
  }, [roomId, currentUser.id, navigate, isClosed, showAlert]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRoomInfo = async () => {
    try {
      const res = await authFetch('/api/chat-rooms');
      if (res.ok) {
        const rooms = await res.json();
        const room = rooms.find((r: any) => r.id === parseInt(roomId!));
        if (room) {
          setRoomInfo({
            partner_nickname: room.partner_nickname,
            partner_avatar_url: room.partner_avatar_url,
            partner_id: room.partner_id,
          });
        }
      }
    } catch (err) {
      console.error('Fetch Room Info Error:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await authFetch(`/api/chat-rooms/${roomId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      } else {
        console.error('Fetch Messages failed:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Fetch Messages Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !roomId) return;

    const content = newMessage.trim();
    setNewMessage(''); // 즉시 입력창 초기화

    try {
      const res = await authFetch(`/api/chat-rooms/${roomId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          // 내가 보낸 메시지 즉시 화면에 반영
          setMessages(prev => {
            if (prev.some(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
        }
      } else {
        setNewMessage(content); // 실패 시 복구
        showAlert('전송 실패', '메시지 전송에 실패했습니다.');
      }
    } catch (err) {
      setNewMessage(content);
      console.error('Send message error:', err);
      showAlert('전송 실패', '네트워크 오류로 메시지를 전송하지 못했습니다.');
    }
  };

  const handleCloseChat = async () => {
    if (!roomId || closing || isClosed) return;

    showConfirm(
      '대화 종료',
      '이 상담 대화를 종료하시겠습니까? 종료 후에는 채팅방 목록에서 사라집니다.',
      async () => {
        setClosing(true);
        try {
          const res = await authFetch(`/api/chat-rooms/${roomId}/close`, {
            method: 'PATCH'
          });

          if (res.ok) {
            setIsClosed(true);
            showAlert('대화 종료', '대화를 종료했습니다.', () => navigate('/chat', { replace: true }));
            return;
          }

          const data = await res.json().catch(() => null);
          showAlert('대화 종료 실패', data?.message || '대화 종료에 실패했습니다.');
        } catch (err) {
          console.error('Close chat error:', err);
          showAlert('대화 종료 실패', '네트워크 오류로 대화를 종료하지 못했습니다.');
        } finally {
          setClosing(false);
        }
      },
      '종료하기'
    );
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  };

  const shouldShowDateSeparator = (current: Message, prev?: Message) => {
    if (!prev) return true;
    const d1 = new Date(current.created_at).toDateString();
    const d2 = new Date(prev.created_at).toDateString();
    return d1 !== d2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-primary font-headline font-bold text-lg">대화를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased h-[100dvh] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#fbf9f8]/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </button>
          {roomInfo && (
            <>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-container ring-2 ring-primary/10">
                  <img
                    alt={roomInfo.partner_nickname}
                    src={roomInfo.partner_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${roomInfo.partner_nickname}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="font-headline font-bold text-base tracking-tight text-primary">{roomInfo.partner_nickname}</h1>
                <p className="text-[10px] font-label uppercase tracking-widest font-bold text-on-surface-variant/50">1:1 상담</p>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handleCloseChat}
          disabled={closing}
          className="px-3 py-2 text-xs font-bold text-red-500 hover:opacity-80 disabled:opacity-40 transition-opacity"
        >
          {closing ? '종료 중...' : '대화 종료'}
        </button>
      </header>

      {/* Messages */}
      <main className="min-h-0 flex-1 pt-20 px-4 max-w-2xl mx-auto w-full overflow-y-auto">
        {/* Secure Banner */}
        <div className="flex justify-center mb-6 mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200">
            <span className="material-symbols-outlined text-[14px] text-gray-400">lock</span>
            <span className="text-[11px] font-label text-gray-500 font-bold uppercase tracking-wider">안전한 1:1 대화방</span>
          </div>
        </div>

        <div className="space-y-1">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">waving_hand</span>
              <p className="text-on-surface-variant/60 text-sm">첫 메시지를 보내보세요</p>
            </div>
          )}
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser.id;
            const prevMsg = idx > 0 ? messages[idx - 1] : undefined;
            const showDate = shouldShowDateSeparator(msg, prevMsg);
            const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id || showDate);

            return (
              <div key={msg.id}>
                {showDate && (
                  <div className="flex justify-center my-5">
                    <span className="text-[10px] font-label text-on-surface-variant/50 bg-surface-container-low px-4 py-1 rounded-full">
                      {formatDateSeparator(msg.created_at)}
                    </span>
                  </div>
                )}
                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && showAvatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container flex-shrink-0 mb-5">
                        <img
                          alt=""
                          src={msg.sender_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_nickname}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : !isMe ? (
                      <div className="w-8 flex-shrink-0" />
                    ) : null}

                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && showAvatar && (
                        <span className="text-[10px] font-bold text-on-surface-variant/70 mb-1 ml-1">{msg.sender_nickname}</span>
                      )}
                      <div
                        className={`px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'bg-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl shadow-md'
                            : 'bg-white border border-gray-100 text-on-surface rounded-tr-2xl rounded-br-2xl rounded-bl-2xl shadow-[0_1px_6px_rgb(0,0,0,0.03)]'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        <span className="text-[9px] text-on-surface-variant/40 font-label">{formatTime(msg.created_at)}</span>
                        {isMe && (
                          <span className="material-symbols-outlined text-[12px]" style={{
                            color: msg.is_read ? '#5b8fa8' : '#b1b2b1',
                            fontVariationSettings: "'FILL' 1"
                          }}>
                            done_all
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div
        className="shrink-0 w-full bg-[#fbf9f8]/90 backdrop-blur-xl border-t border-gray-100 px-4 pt-2"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-1.5 placeholder:text-gray-400 outline-none text-on-surface"
              placeholder="메시지를 입력하세요..."
            />
          </div>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onPointerDown={(e) => e.preventDefault()}
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-11 h-11 shrink-0 rounded-xl bg-primary hover:bg-[#3d4f5c] disabled:opacity-40 disabled:hover:bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>

      <AlertModal
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
    </div>
  );
}
