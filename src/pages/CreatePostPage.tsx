import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BottomNavBar from '../components/BottomNavBar';
import AlertModal from '../components/AlertModal';
import { authFetch } from '../utils/api';

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCounselingRequested, setIsCounselingRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 1. 카테고리 목록 불러오기
  useEffect(() => {
    authFetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) setSelectedCategoryId(data[0].id);
      })
      .catch(() => alert('카테고리를 불러오는데 실패했습니다.'));
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !selectedCategoryId) {
      alert('제목, 본문 및 카테고리를 모두 선택해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
          category_id: selectedCategoryId,
          title,
          content,
          is_counseling_requested: isCounselingRequested
        })
      });

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        alert(data.message || '저장에 실패했습니다.');
      }
    } catch (err) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen relative overflow-hidden" style={{ minHeight: 'max(884px, 100dvh)' }}>
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center bg-[#fbf9f8]/80 backdrop-blur-xl z-50 transition-colors duration-300 border-b border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#efeeec]/50 transition-all text-[#4c6272]"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="font-headline text-xl font-semibold tracking-tight text-[#4c6272]">마음 나누기</h1>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-5 py-2 rounded-full font-headline font-bold text-sm tracking-wide bg-gradient-to-br from-primary to-primary-dim text-on-primary hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? '게시 중...' : '게시'}
        </button>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto min-h-screen relative z-10">
        <div className="space-y-8">
          {/* Category Selection */}
          <div className="space-y-4">
            <label className="font-headline text-xs font-bold uppercase tracking-widest text-outline">카테고리 선택</label>
            <div className="flex flex-wrap gap-2 md:gap-3 min-h-[40px]">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all border ${selectedCategoryId === cat.id
                      ? 'bg-primary text-white border-transparent shadow-sm'
                      : 'bg-white text-on-surface-variant border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {cat.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-outline-variant animate-pulse italic">카테고리를 불러오는 중...</p>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-none p-0 focus:ring-0 text-2xl font-headline font-bold text-on-surface placeholder:text-outline-variant/40 outline-none"
              placeholder="제목을 입력하세요..."
              type="text"
            />
            <div className="h-[1px] w-full bg-gradient-to-r from-outline-variant/20 via-outline-variant/5 to-transparent"></div>
          </div>

          {/* Content Section */}
          <div className="relative min-h-[300px]">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[350px] bg-transparent border-none p-0 focus:ring-0 text-lg font-body leading-relaxed text-on-surface-variant placeholder:text-outline-variant/40 resize-none outline-none"
              placeholder="여기에 당신의 마음을 자유롭게 남겨주세요. 모든 글은 익명으로 안전하게 보호됩니다."
            ></textarea>
          </div>

          {/* Counseling Option */}
          <div className="bg-surface-container-low/50 p-5 rounded-2xl border border-outline-variant/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  1:1 상담 요청하기
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  누군가의 따뜻한 조언이나 위로가 필요한가요? <br />
                  체크하면 상담사나 숙련된 유저가 말을 걸어올 수 있습니다.
                </p>
              </div>
              <button
                onClick={() => setIsCounselingRequested(!isCounselingRequested)}
                className={`w-12 h-6 flex-shrink-0 rounded-full transition-all relative block ${isCounselingRequested ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${isCounselingRequested ? 'translate-x-6' : 'translate-x-0'} left-1`}></div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <AlertModal
        isOpen={showSuccessModal}
        title="게시 완료"
        message="당신의 소중한 마음이 잘 전달되었습니다."
        onConfirm={() => navigate('/', { replace: true })}
        confirmText="메인으로"
      />

      <BottomNavBar />
    </div>
  );
}
