export default function ChatPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col relative w-full overflow-hidden">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-surface-container-low flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-surface-container transition-all duration-300 active:scale-95 text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          
          <div className="relative">
            <img 
              alt="사라 (상담사)" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/10" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBykrLzHyyKfGKPCzsGj8NZ-5DlAeY00ZPAclJ6DfrulAeUe66TdkmyTXncQ35MVxMDYe8h217Spy-RodSC-LIt58MS18cwWI4VN8IeJ8KjQtKKjHc5hM94dcwHETWxAED6RrLTSLT1TO9T7DwxLHRXFlXwfDvflYh_TnPTmRzcVweNoxK3CJ8CiS0Eqy246LVRKHnnByj_s36wiLF4LlqH0hrJEwY7lJsWMJkyh87sWgoZ6jfDVHrhtsdj7s5zZ01s4UvO8kbRZIA" 
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary border-2 border-surface rounded-full"></span>
          </div>
          
          <div>
            <h1 className="font-headline font-bold text-lg tracking-tight text-primary">사라 (상담사)</h1>
            <p className="text-[10px] font-label uppercase tracking-widest font-bold text-gray-500">현재 접속 중</p>
          </div>
        </div>
        
        <button className="p-2 -mr-2 rounded-full hover:bg-surface-container transition-colors duration-300">
          <span className="material-symbols-outlined text-primary">more_vert</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="pt-24 pb-[130px] px-4 max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        
        {/* Secure Banner */}
        <div className="flex justify-center mb-8 shrink-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full border border-gray-200">
            <span className="material-symbols-outlined text-[14px] text-gray-400">lock</span>
            <span className="text-[11px] font-label text-gray-500 font-bold uppercase tracking-wider">종단간 암호화가 적용된 대화방</span>
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 flex flex-col pb-4">
          
          {/* Counselor Message */}
          <div className="flex flex-col items-start max-w-[85%] animate-fade-in">
            <div className="bg-white border border-gray-100 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <p className="text-sm leading-relaxed">
                안녕하세요. 어제 정적 속에서 벅참을 느꼈다고 말씀하신 부분을 계속 생각하고 있었어요. 그런 감정과 마주 앉는 데는 큰 용기가 필요하죠. 지금 이 순간, 마음 상태는 어떠신가요?
              </p>
            </div>
            <span className="mt-2 ml-2 text-[10px] font-label text-gray-400 uppercase tracking-tighter font-bold">오전 10:14</span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end max-w-[85%] self-end">
            <div className="bg-primary text-white rounded-tl-2xl rounded-bl-2xl rounded-br-2xl px-5 py-4 shadow-md">
              <p className="text-sm leading-relaxed">
                오늘은 조금 편안해졌어요. 저희가 이야기했던 호흡법을 해봤거든요. 불안감이 완전히 사라진 건 아니지만, 폭풍 속에서 작은 닻을 내린 기분이었어요.
              </p>
            </div>
            <span className="mt-2 mr-2 text-[10px] font-label text-gray-400 uppercase tracking-tighter font-bold">오전 10:16</span>
          </div>

          {/* Counselor Message */}
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="bg-white border border-gray-100 text-gray-800 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl px-5 py-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <p className="text-sm leading-relaxed">
                그 작은 닻이 바로 우리의 시작점이 될 거예요. 모든 걸 '고치려고' 재촉할 필요는 없습니다. 그저 함께 물결을 헤쳐 나가는 법을 배우고 있는 거니까요. 닻을 내린 듯한 그 느낌에 대해 좀 더 이야기해볼까요, 아니면 오늘 특별히 마음을 무겁게 하는 다른 일이 있나요?
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 ml-2">
              <span className="text-[10px] font-label text-gray-400 uppercase tracking-tighter font-bold">오전 10:18</span>
              <div className="w-1.5 h-1.5 bg-[#4c6272] opacity-40 rounded-full animate-pulse"></div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Message Input Area */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/90 backdrop-blur-xl border-t border-gray-200 px-4 pb-8 pt-3 z-50">
        <div className="max-w-2xl mx-auto flex items-end gap-2 md:gap-3">
          
          {/* Utility Actions */}
          <div className="flex items-center gap-1 mb-1">
            <button className="p-2 text-primary hover:bg-gray-100 rounded-full transition-all">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <button className="p-2 text-primary hover:bg-gray-100 rounded-full transition-all">
              <span className="material-symbols-outlined">mic</span>
            </button>
          </div>
          
          {/* Input Field */}
          <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-2xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-2 placeholder:text-gray-400 resize-none outline-none text-gray-800 h-[24px] overflow-hidden" 
              placeholder="당신의 생각을 적어보세요..." 
              rows={1}
            ></textarea>
          </div>
          
          {/* Send Button */}
          <button className="mb-0.5 w-[50px] h-[50px] shrink-0 rounded-2xl bg-primary hover:bg-[#3d4f5c] text-white flex items-center justify-center shadow-md active:scale-95 transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
