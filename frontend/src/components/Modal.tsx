import { X } from 'lucide-react';
import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    // 外側の背景：fixed inset-0 で画面全体を覆い、z-index を最大にする
    // items-end (スマホで下寄せ) / sm:items-center (PCで中央寄せ)
    <div 
      className="fixed inset-0 z-[999] flex justify-center items-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" 
      onClick={onClose}
    >
      {/* モーダル本体：w-full かつ max-w-md で幅を制限 */}
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom sm:zoom-in duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex justify-between items-center p-5 border-b bg-white">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* コンテンツエリア：PCでも見やすいよう高さを調整 */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>
      </div>
    </div>
  );
};