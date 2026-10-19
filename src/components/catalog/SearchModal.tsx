import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types/cricket';
import { PRODUCTS } from '../../data/cricketData';
import { useCart } from '../../context/CartContext';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onApplySearchQuery: (query: string) => void;
}

const POPULAR_SEARCHES = [
  'Ben Stokes Bat',
  'adidas 22YDS',
  'DSC Pearla',
  'Batting Pads',
  'Cricket Spikes',
  'England T20 Shirt',
  'Kookaburra Pads',
  'KNYX Helmet',
];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onApplySearchQuery,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatPrice } = useCart();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  if (!isOpen) return null;

  const filtered = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          (p.franchise && p.franchise.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onApplySearchQuery(query.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-neutral-950 text-white rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-neutral-800 flex items-center space-x-3 bg-black">
          <Search size={20} className="text-[#ccff00] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cricket bats, shoes, pads, England kits, brands..."
            className="w-full bg-transparent text-white text-sm sm:text-base focus:outline-none placeholder-neutral-500 font-medium"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-neutral-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-bold text-neutral-400 hover:text-white px-2 py-1 rounded bg-neutral-900 border border-neutral-800"
          >
            ESC
          </button>
        </form>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* If no query, show trending terms */}
          {!query.trim() && (
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-neutral-400 mb-3">
                <TrendingUp size={14} className="text-[#ccff00]" />
                <span>POPULAR CRICKET SEARCHES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                    }}
                    className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center space-x-1"
                  >
                    <span>{term}</span>
                    <ArrowRight size={10} className="text-neutral-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-neutral-400 mb-3">
                <span>FOUND {filtered.length} MATCHING PRODUCTS</span>
                {filtered.length > 0 && (
                  <button
                    onClick={() => {
                      onApplySearchQuery(query);
                      onClose();
                    }}
                    className="text-[#ccff00] hover:underline"
                  >
                    View all in catalog →
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  <p className="text-sm">No cricket products found matching "{query}"</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Try searching for "Bat", "Spikes", "Gunn & Moore", or "adidas"
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-900">
                  {filtered.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose();
                      }}
                      className="py-3 flex items-center space-x-4 hover:bg-neutral-900/60 p-2 rounded-xl transition-colors cursor-pointer group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-14 h-14 object-contain bg-neutral-900 rounded-lg p-1.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-neutral-400">
                          {prod.vendor} • {prod.category}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-[#ccff00] transition-colors truncate">
                          {prod.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-xs font-extrabold text-white">
                            {formatPrice(prod.price)}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-[11px] text-neutral-500 line-through">
                              {formatPrice(prod.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500 group-hover:text-white transition-colors shrink-0">
                        View →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
