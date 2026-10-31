import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <aside aria-label="Support and Quick Contact">
      <a
        href="https://wa.me/8801647294474?text=Hello%20Gazi%20Sports%2099%2C%20I%20would%20like%20to%20inquire%20about%20cricket%20equipment."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Gazi Sports 99 on WhatsApp: 01647294474"
        className="fixed bottom-6 right-6 z-40 group flex items-center bg-[#25D366] hover:bg-[#20ba59] text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl hover:shadow-[#25D366]/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex items-center justify-center">
          <MessageCircle size={24} className="fill-white/20" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ccff00]"></span>
          </span>
        </span>
        <span className="hidden sm:inline-block ml-2 text-xs font-black uppercase tracking-wider font-mono">
          WhatsApp 01647294474
        </span>
      </a>
    </aside>
  );
};
