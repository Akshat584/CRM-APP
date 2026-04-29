import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl'
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" />
      
      <div 
        className={`
          relative w-full ${sizes[size]} bg-white rounded-3xl overflow-hidden shadow-2xl animate-slideIn
          flex flex-col max-h-[90vh]
        `}
      >
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-60 block mb-2">Overlay Context</span>
            <h3 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        <div className="p-8 pt-4 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="p-8 pt-0 bg-slate-50 flex justify-end gap-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
