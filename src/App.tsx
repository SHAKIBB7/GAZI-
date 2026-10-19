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
import { Product } from './types/cricket';
import { AdminDashboard } from './admin/AdminDashboard';

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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-neutral-900 selection:bg-[#ccff00] selection:text-black">
      {/* 1. Global Navigation Tiers */}
      <TopSportsBar onSelectCategory={handleSelectCategory} />
      <UtilityBar onOpenAdmin={onOpenAdmin} />
      <PromoTicker />
      <Navbar
        onOpenSearch={() => setSearchModalOpen(true)}
        onSelectCategory={handleSelectCategory}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* 2. Hero Carousel */}
      <main className="flex-1">
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
      <Footer onSelectBrand={handleSelectBrand} />

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
        onClose={() => setQuickViewProduct(null)}
      />

      <CartDrawer />
      <WishlistDrawer />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onSelectCategory={handleSelectCategory}
      />
      <Toast />
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
    return <AdminDashboard onReturnToStore={handleReturnToStore} />;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <MainApp onOpenAdmin={handleOpenAdmin} />
      </WishlistProvider>
    </CartProvider>
  );
}
