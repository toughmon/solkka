

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  subText?: string;
}

export default function AlertModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  confirmText = "확인", 
  subText = "Solkka Echo Sanctuary" 
}: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/5 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div 
        className="w-full max-w-[340px] bg-surface/80 rounded-[2rem] p-8 flex flex-col items-center text-center shadow-[0_4px_40px_rgba(49,51,50,0.06)] border border-surface-container-lowest" 
        style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        {/* Icon with Empathy Pulse */}
        <div className="mb-8 relative">
          <div className="absolute -inset-4 bg-tertiary-container/20 rounded-full blur-xl"></div>
          <div 
            className="absolute inset-0 rounded-full border border-tertiary-container/30" 
            style={{ 
              boxShadow: '0 0 0 0 rgba(228, 208, 207, 0.7)', 
              animation: 'pulse 2s infinite cubic-bezier(0.66, 0, 0, 1)' 
            }}
          ></div>
          <div className="w-20 h-20 bg-gradient-to-tr from-tertiary-container to-surface-container-lowest flex items-center justify-center rounded-full relative z-10 shadow-sm border border-white/40">
            <div className="w-16 h-16 bg-surface-container-lowest/60 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-4xl text-tertiary" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 48" }}>check</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 mb-10">
          <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
            {title}
          </h2>
          <p className="text-on-surface-variant font-medium leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="w-full">
          <button 
            onClick={onConfirm}
            className="w-full py-4 px-6 bg-gradient-to-br from-primary to-primary-dim text-white font-headline font-semibold rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] transition-all duration-300"
          >
            {confirmText}
          </button>
          <p className="mt-6 text-[11px] font-label tracking-widest uppercase text-outline opacity-60">
            {subText}
          </p>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          to { box-shadow: 0 0 0 20px rgba(228, 208, 207, 0); }
        }
      `}</style>
    </div>
  );
}
