import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { TopSportsBar } from './components/layout/TopSportsBar';
import { UtilityBar } from './components/layout/UtilityBar';
import { PromoTicker } from './components/layout/PromoTicker';
import { Navbar } from './components/layout/Navbar';
import { MobileMenu } from './components/layout/MobileMenu';
import { Footer } from './components/layout/Footer';
import { HeroCarousel } from './components/home/HeroCarousel';
import { BenStokesFeature } from './components/home/BenStokesFeature';
import { DepartmentGrid } from './components/home/DepartmentGrid';
import { CricketEssentials } from './components/home/CricketEssentials';
import { BrandShowcase } from './components/home/BrandShowcase';
import { ProductCatalog } from './components/catalog/ProductCatalog';
import { SearchModal } from './components/catalog/SearchModal';
import { QuickViewModal } from './components/modals/QuickViewModal';
import { CartDrawer } from './components/modals/CartDrawer';
import { WishlistDrawer } from './components/modals/WishlistDrawer';
import { Toast } from './components/ui/Toast';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { Product } from './types/cricket';
import { PRODUCTS } from './data/cricketData';

// Code-split Admin Command Center to reduce initial storefront bundle size
const AdminDashboard = React.lazy(() =>
  import('./admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

interface MainAppProps {
  onOpenAdmin: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ onOpenAdmin }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (category === 'All') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      window.history.pushState(null, '', url.toString());
    }
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Initial Category Sync from URL (?category=Bats)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) {
        setSelectedCategory(cat);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // 2. Direct Product Deep-Linking (#product=1055203 or ?product=1055203)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncProductFromUrl = () => {
      const hash = window.location.hash;
      let pid: string | null = null;
      if (hash.startsWith('#product=')) {
        pid = hash.replace('#product=', '').split('&')[0];
      } else {
        const params = new URLSearchParams(window.location.search);
        pid = params.get('product');
      }

      if (pid) {
        let matched: Product | undefined = PRODUCTS.find((p) => p.id === pid || p.handle === pid);
        if (!matched) {
          try {
            const local = localStorage.getItem('gazi_local_products');
            if (local) {
              const list = JSON.parse(local);
              matched = list.find((p: any) => p.id === pid || p.handle === pid);
            }
          } catch {}
        }
        if (matched) {
          setQuickViewProduct(matched);
        }
      }
    };

    syncProductFromUrl();
    window.addEventListener('hashchange', syncProductFromUrl);
    window.addEventListener('popstate', syncProductFromUrl);
    return () => {
      window.removeEventListener('hashchange', syncProductFromUrl);
      window.removeEventListener('popstate', syncProductFromUrl);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [searchModalOpen]);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900 selection:bg-[#ccff00] selection:text-black overflow-x-clip">
      {/* 1. Global Navigation Tiers */}
      <TopSportsBar onSelectCategory={handleSelectCategory} />
      <UtilityBar onOpenAdmin={onOpenAdmin} />
      <PromoTicker />
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onSelectCategory={handleSelectCategory}
        onSelectBrand={handleSelectBrand}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* 2. Hero Carousel */}
      <main className="flex-1 overflow-x-clip">
        <HeroCarousel onSelectCategory={handleSelectCategory} />

        {/* 3. Official Brands Quick Bar */}
        <BrandShowcase
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
        />

        {/* 4. Curated Content Tiles: Cricket Essentials & Shoes */}
        <CricketEssentials onSelectCategory={handleSelectCategory} />

        {/* 5. Editorial Highlight: Ben Stokes Collection */}
        <BenStokesFeature
          onSelectProduct={(p) => setQuickViewProduct(p)}
          onFilterBrand={handleSelectBrand}
        />

        {/* 5. Shop by Department Grid */}
        <DepartmentGrid onSelectCategory={handleSelectCategory} />

        {/* 6. Main Interactive Product Catalog */}
        <ProductCatalog
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          onQuickView={(p) => setQuickViewProduct(p)}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />
      </main>

      {/* 7. Comprehensive E-Commerce Footer */}
      <Footer onSelectBrand={handleSelectBrand} onOpenAdmin={onOpenAdmin} />

      {/* 8. Modals, Drawers & Overlays */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={(p) => setQuickViewProduct(p)}
        onApplySearchQuery={(q) => {
          setSearchQuery(q);
          const catalogEl = document.getElementById('catalog');
          if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => {
          setQuickViewProduct(null);
          if (typeof window !== 'undefined' && window.location.hash.startsWith('#product=')) {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
          }
        }}
      />

      <CartDrawer />
      <WishlistDrawer />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={onOpenAdmin}
      />
      <Toast />
      <WhatsAppButton />
    </div>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')
        ? 'admin'
        : 'store';
    }
    return 'store';
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#store') {
        setCurrentView('store');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenAdmin = () => {
    window.location.hash = '#admin';
    setCurrentView('admin');
  };

  const handleReturnToStore = () => {
    window.location.hash = '';
    setCurrentView('store');
  };

  if (currentView === 'admin') {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center font-sans">
            <div className="w-12 h-12 rounded-2xl bg-[#ccff00] text-black font-black font-mono flex items-center justify-center text-xl animate-pulse mb-4">
              GZ
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              Loading Administrative Portal...
            </div>
          </div>
        }
      >
        <AdminDashboard onReturnToStore={handleReturnToStore} />
      </React.Suspense>
    );
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <MainApp onOpenAdmin={handleOpenAdmin} />
      </WishlistProvider>
    </CartProvider>
  );
}
