import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, setToastMessage } = useCart();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, setToastMessage]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-neutral-900 border border-neutral-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs max-w-sm">
        <CheckCircle2 size={18} className="text-[#ccff00] shrink-0" />
        <span className="font-medium">{toastMessage}</span>
        <button
          onClick={() => setToastMessage(null)}
          className="text-neutral-400 hover:text-white ml-2"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
