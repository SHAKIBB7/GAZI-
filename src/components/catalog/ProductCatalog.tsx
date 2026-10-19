import React, { useState, useMemo } from 'react';
import { Product } from '../../types/cricket';
import { PRODUCTS } from '../../data/cricketData';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

interface ProductCatalogProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onQuickView: (product: Product) => void;
  searchQuery: string;
  onClearSearch: () => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  onQuickView,
  searchQuery,
  onClearSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'trending' | 'sale'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [onlySale, setOnlySale] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleResetFilters = () => {
    onSelectCategory('All');
    onSelectBrand('All');
    setMaxPrice(100000);
    setOnlySale(false);
    onClearSearch();
    setActiveTab('all');
  };

  const filteredProducts = useMemo(() => {
    let result = [...PRODUCTS];

    // Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.color.toLowerCase().includes(q) ||
          (p.franchise && p.franchise.toLowerCase().includes(q))
      );
    }

    // Category filter with flexible matching
    if (selectedCategory !== 'All' && selectedCategory !== 'Sale') {
      const qCat = selectedCategory.toLowerCase().trim();
      result = result.filter((p) => {
        const cat = p.category.toLowerCase();
        const dept = (p.department || '').toLowerCase();
        return (
          cat === qCat ||
          dept === qCat ||
          cat.includes(qCat) ||
          qCat.includes(cat) ||
          (qCat.includes('bat') && (cat.includes('bat') || dept.includes('bat'))) ||
          (qCat.includes('shoe') && (cat.includes('footwear') || cat.includes('shoe'))) ||
          (qCat.includes('footwear') && (cat.includes('footwear') || cat.includes('shoe'))) ||
          (qCat.includes('pad') && (cat.includes('batting') || dept.includes('pad') || p.title.toLowerCase().includes('pad'))) ||
          (qCat.includes('helmet') && (cat.includes('helmet') || cat.includes('protect'))) ||
          (qCat.includes('protect') && (cat.includes('protect') || cat.includes('helmet') || cat.includes('batting'))) ||
          (qCat.includes('cloth') && cat.includes('cloth')) ||
          (qCat.includes('bag') && (cat.includes('bag') || cat.includes('luggage'))) ||
          (qCat.includes('luggage') && (cat.includes('bag') || cat.includes('luggage')))
        );
      });
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.vendor === selectedBrand);
    }

    // Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sale filter
    if (onlySale || activeTab === 'sale' || selectedCategory === 'Sale') {
      result = result.filter((p) => Boolean(p.oldPrice));
    }

    // Tab filter
    if (activeTab === 'new') {
      result = result.filter((p) => Boolean(p.isNew));
    } else if (activeTab === 'trending') {
      result = result.filter((p) => p.rating >= 4.8);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        // Featured default keep
        break;
    }

    return result;
  }, [selectedCategory, selectedBrand, maxPrice, onlySale, activeTab, sortBy, searchQuery]);

  return (
    <section id="catalog" className="py-12 px-4 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto">
        {/* Catalog Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase text-neutral-500 tracking-wider mb-1">
              <span>GAZI SPORTS BANGLADESH</span>
              <span>/</span>
              <span>CRICKET CATALOG</span>
              {selectedCategory !== 'All' && (
                <>
                  <span>/</span>
                  <span className="text-black font-extrabold">{selectedCategory}</span>
                </>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-neutral-900 font-mono">
              {selectedCategory === 'All'
                ? 'CRICKET EQUIPMENT & APPAREL'
                : `${selectedCategory.toUpperCase()}`}
            </h2>
          </div>

          {/* Quick Tabs */}
          <div className="flex items-center space-x-1.5 mt-4 md:mt-0 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-black text-[#ccff00]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              All Items ({PRODUCTS.length})
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-black text-[#ccff00]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              Trending Now
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-black text-[#ccff00]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
              }`}
            >
              New 2026 Season
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                activeTab === 'sale'
                  ? 'bg-red-600 text-white font-extrabold'
                  : 'bg-white text-red-600 hover:bg-neutral-200 border border-red-200'
              }`}
            >
              Sale Picks
            </button>
          </div>
        </div>

        {/* Search Active Notification Pill */}
        {searchQuery && (
          <div className="bg-neutral-900 text-white p-3 rounded-lg flex items-center justify-between mb-6">
            <span className="text-xs">
              Showing search results for: <strong className="text-[#ccff00]">"{searchQuery}"</strong> ({filteredProducts.length} results)
            </span>
            <button
              onClick={onClearSearch}
              className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1"
            >
              <X size={14} />
              <span>Clear search</span>
            </button>
          </div>
        )}

        {/* Action Bar (Mobile filter toggle + Sort dropdown) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center space-x-1.5 bg-white border border-neutral-300 px-3 py-2 rounded-lg text-xs font-bold text-neutral-800 shadow-sm"
            >
              <SlidersHorizontal size={14} />
              <span>Filters ({filteredProducts.length})</span>
            </button>

            <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">
              Showing {filteredProducts.length} of {PRODUCTS.length} cricket products
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-neutral-500 font-bold hidden sm:inline">SORT BY:</span>
            <div className="relative flex items-center bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 shadow-sm">
              <ArrowUpDown size={13} className="text-neutral-500 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent font-bold text-neutral-800 focus:outline-none cursor-pointer"
                aria-label="Sort products"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-4">
                  <h3 className="font-extrabold text-sm uppercase">Filter Products</h3>
                  <button onClick={() => setMobileFilterOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  onSelectCategory={(c) => {
                    onSelectCategory(c);
                    setMobileFilterOpen(false);
                  }}
                  selectedBrand={selectedBrand}
                  onSelectBrand={(b) => {
                    onSelectBrand(b);
                    setMobileFilterOpen(false);
                  }}
                  maxPrice={maxPrice}
                  onMaxPriceChange={setMaxPrice}
                  onlySale={onlySale}
                  onToggleSale={setOnlySale}
                  onResetFilters={handleResetFilters}
                  totalFiltered={filteredProducts.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Body: Desktop Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block shrink-0 sticky top-28">
            <FilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              selectedBrand={selectedBrand}
              onSelectBrand={onSelectBrand}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              onlySale={onlySale}
              onToggleSale={setOnlySale}
              onResetFilters={handleResetFilters}
              totalFiltered={filteredProducts.length}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1 w-full">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-400">
                  <SlidersHorizontal size={28} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                  No products match your current filters
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                  Try adjusting the price slider, changing the department, or resetting filters to see the full collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-black text-[#ccff00] hover:bg-neutral-800 text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
