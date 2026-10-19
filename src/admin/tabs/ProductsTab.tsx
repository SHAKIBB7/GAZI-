import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/adminApi';
import { ProductAdmin } from '../types';
import { formatBDT } from '../../utils/bangladesh';
import {
  Search,
  Plus,
  Download,
  Upload,
  Edit2,
  Archive,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CRICKET_CATEGORIES = [
  'Cricket Bats',
  'Cricket Footwear',
  'Batting Equipment',
  'Cricket Protection',
  'Cricket Clothing',
  'Cricket Luggage',
  'Cricket Balls & Accessories',
];

const WILLOW_GRADES = [
  'Limited Edition Unbleached Grade 1+ English Willow',
  'Selected Grade 1 English Willow',
  'Superior Seasoned Grade 2 English Willow',
  'Premium Grade 3 English Willow',
  'Seasoned Grade 4 English Willow',
  'Kashmir Willow Premium',
];

export const ProductsTab: React.FC = () => {
  const [products, setProducts] = useState<ProductAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'specs' | 'images'>('general');
  const [formData, setFormData] = useState<Partial<ProductAdmin>>({
    title: '',
    sku: '',
    category: 'Cricket Bats',
    department: 'Cricket Bats',
    vendor: 'Gunn & Moore',
    price: 15000,
    costPrice: 10000,
    oldPrice: null,
    stock: 10,
    lowStockThreshold: 4,
    status: 'active',
    sizes: ['Short Handle'],
    color: 'White/Black',
    images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
    description: '',
    specs: {
      'Willow Grade': 'Selected Grade 1 English Willow',
      'Weight': '2lb 8oz - 2lb 10oz',
      'Profile': 'Full Convex Profile',
      'Sweet Spot': 'Mid to Low (Suited for Asian subcontinental pitches)',
    },
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // CSV Import modal state
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [csvResult, setCsvResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    const res = await adminApi.getProducts({
      page,
      limit: 12,
      search,
      category: selectedCategory,
      vendor: selectedVendor,
      stockFilter: selectedStockFilter,
      status: selectedStatus,
    });
    if (res.data) {
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, selectedCategory, selectedVendor, selectedStockFilter, selectedStatus]);

  const handleOpenAdd = () => {
    setModalMode('create');
    setFormData({
      title: '',
      sku: `CRK-${Date.now().toString().slice(-6)}`,
      category: 'Cricket Bats',
      department: 'Cricket Bats',
      vendor: 'Gunn & Moore',
      price: 18000,
      costPrice: 12000,
      oldPrice: null,
      stock: 10,
      lowStockThreshold: 4,
      status: 'active',
      sizes: ['Short Handle (Med)'],
      color: 'White/Blue',
      images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
      description: 'Handcrafted English Willow cricket equipment engineered for optimal balance and ping.',
      specs: {
        'Willow Grade': 'Selected Grade 1 English Willow',
        'Weight': '2lb 9oz',
        'Handle': 'Multi-piece Cane Handle',
      },
    });
    setActiveTab('general');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductAdmin) => {
    setModalMode('edit');
    setFormData({ ...p });
    setActiveTab('general');
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSaving(true);

    if (!formData.title || !formData.title.trim()) {
      setFormError('Title is required');
      setIsSaving(false);
      return;
    }
    if (!formData.category || !CRICKET_CATEGORIES.includes(formData.category)) {
      setFormError(`Only cricket equipment categories are allowed: ${CRICKET_CATEGORIES.join(', ')}`);
      setIsSaving(false);
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('Selling price must be a positive number in BDT');
      setIsSaving(false);
      return;
    }

    try {
      let res;
      if (modalMode === 'create') {
        res = await adminApi.createProduct(formData);
      } else {
        res = await adminApi.updateProduct(formData.id!, formData);
      }

      if (res.error) {
        setFormError(res.error);
      } else {
        setFormSuccess(`Product "${formData.title}" saved successfully!`);
        setTimeout(() => {
          setIsModalOpen(false);
          fetchProducts();
        }, 1200);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error saving product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchiveToggle = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'archived' ? 'restore' : 'archive';
    if (!window.confirm(`Are you sure you want to ${action} this equipment item?`)) return;

    const res = await adminApi.archiveProduct(id);
    if (res.data) {
      fetchProducts();
    } else {
      alert(res.error || 'Operation failed');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const res = await adminApi.uploadImages(e.target.files);
    setIsUploadingImage(false);

    if (res.data?.urls) {
      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...res.data!.urls],
      }));
    } else {
      alert(res.error || 'Image upload failed');
    }
  };

  const handleImportCsv = async () => {
    if (!csvInput.trim()) return;
    setIsImporting(true);
    const res = await adminApi.importCsv(csvInput);
    setIsImporting(false);
    if (res.data) {
      setCsvResult(res.data.results);
      fetchProducts();
    } else {
      alert(res.error || 'CSV import failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Controls Bar */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, product name, or brand..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ccff00]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/products/export/csv"
            download
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </a>

          <button
            onClick={() => {
              setIsCsvModalOpen(true);
              setCsvResult(null);
            }}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-[#ccff00] hover:bg-[#b5e600] text-black text-xs font-black px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer uppercase tracking-wider"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Facets Bar */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-400">
        <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-neutral-500 mr-2">
          <Filter size={13} />
          <span>Filters:</span>
        </div>

        {/* Category */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
        >
          <option value="All">All Cricket Categories</option>
          {CRICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Stock Filter */}
        <select
          value={selectedStockFilter}
          onChange={(e) => {
            setSelectedStockFilter(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
        >
          <option value="all">All Stock Statuses</option>
          <option value="in_stock">In Stock (&gt; 5)</option>
          <option value="low_stock">Low Stock Alert (1 - 5)</option>
          <option value="out_of_stock">Out of Stock (0)</option>
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setPage(1);
          }}
          className="bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none"
        >
          <option value="all">All Catalog Statuses</option>
          <option value="active">Active (Published)</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>

        <span className="ml-auto font-mono text-[11px] text-neutral-500">
          Showing {products.length} of {total} products
        </span>
      </div>

      {/* 3. Products Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-mono text-[10px] uppercase tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4">Purchase Cost (BDT)</th>
                <th className="py-3 px-4">Retail Price (BDT)</th>
                <th className="py-3 px-4">Est. Gross Margin</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    Loading cricket equipment catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-neutral-500">
                    No products found matching filter criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const marginBdt = p.price - (p.costPrice || 0);
                  const marginPct = p.price > 0 ? Math.round((marginBdt / p.price) * 100) : 0;
                  const isLow = (p.stock || 0) > 0 && (p.stock || 0) <= (p.lowStockThreshold || 5);
                  const isOut = (p.stock || 0) <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=100&q=80'}
                            alt={p.title}
                            className="w-11 h-11 object-contain bg-neutral-950 rounded-lg p-1 border border-neutral-800 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-white truncate max-w-xs">{p.title}</h4>
                            <span className="font-mono text-[10px] text-neutral-400 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{p.category}</div>
                        <div className="text-[10px] text-neutral-400 font-bold uppercase">{p.vendor}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-neutral-300">
                        {formatBDT(p.costPrice || 0)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{formatBDT(p.price)}</div>
                        {p.oldPrice && (
                          <div className="font-mono text-[10px] text-neutral-500 line-through">
                            {formatBDT(p.oldPrice)}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-emerald-400 font-bold">
                          +{formatBDT(marginBdt)}
                        </span>
                        <span className="text-[10px] text-neutral-400 ml-1">({marginPct}%)</span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            isOut
                              ? 'bg-red-950/80 text-red-400 border border-red-800'
                              : isLow
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-400'
                          }`}
                        >
                          <span>{p.stock || 0} in stock</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'archived'
                              ? 'bg-neutral-800 text-neutral-400'
                              : p.status === 'draft'
                              ? 'bg-amber-950 text-amber-400'
                              : 'bg-emerald-950 text-emerald-400'
                          }`}
                        >
                          {p.status || 'active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            onClick={() => handleArchiveToggle(p.id, p.status || 'active')}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title={p.status === 'archived' ? 'Restore Product' : 'Archive Product'}
                          >
                            {p.status === 'archived' ? <RotateCcw size={13} /> : <Archive size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black">
              <div>
                <h3 className="text-base font-black uppercase font-mono text-white">
                  {modalMode === 'create' ? 'Add New Cricket Product' : `Edit Product: ${formData.sku}`}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Configure cricket equipment specifications, pricing, and stock controls
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-neutral-900"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'general' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                1. General Info
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'pricing' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                2. Pricing & Stock
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'specs' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                3. Cricket Specs
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'images' ? 'border-[#ccff00] text-[#ccff00]' : 'border-transparent text-neutral-400 hover:text-white'
                }`}
              >
                4. Images & Assets
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-5 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center space-x-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle size={15} />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* TAB 1: GENERAL INFO */}
              {activeTab === 'general' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Gunn & Moore Diamond Ben Stokes 55 Cricket Bat"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">Cricket Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value, department: e.target.value })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                      >
                        {CRICKET_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">Brand / Vendor *</label>
                      <input
                        type="text"
                        required
                        value={formData.vendor || ''}
                        onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        placeholder="e.g. Gunn & Moore, adidas, DSC, Kookaburra, Puma, Castore"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#ccff00]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Technical overview, willow profile, match readiness..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#ccff00]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">Status</label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                      >
                        <option value="active">Active (Visible)</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">Collection / Franchise</label>
                      <input
                        type="text"
                        value={formData.franchise || ''}
                        onChange={(e) => setFormData({ ...formData, franchise: e.target.value })}
                        placeholder="Ben Stokes Collection"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-4 pt-6">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isNew)}
                          onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                          className="rounded bg-neutral-950 border-neutral-800 text-[#ccff00]"
                        />
                        <span className="text-white font-semibold">New 2026</span>
                      </label>
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isExclusive)}
                          onChange={(e) => setFormData({ ...formData, isExclusive: e.target.checked })}
                          className="rounded bg-neutral-950 border-neutral-800 text-[#ccff00]"
                        />
                        <span className="text-white font-semibold">Exclusive</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & STOCK */}
              {activeTab === 'pricing' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Unique SKU (Stock Keeping Unit) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sku || ''}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                        placeholder="e.g. CRK-BAT-GM-55"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                      />
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        Prevented duplicates checked atomically against database
                      </span>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Unit Purchase / Cost Price (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.costPrice || 0}
                        onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                      />
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        Used for COGS and gross profit calculations
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Selling Price (BDT ৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.price || 0}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono font-bold focus:outline-none focus:border-[#ccff00]"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Compare-at / Regular Price (BDT ৳, Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.oldPrice || ''}
                        onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value ? parseFloat(e.target.value) : null })}
                        placeholder="Leave blank if no sale discount"
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Initial Stock Quantity in Warehouse
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock || 0}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                      />
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">
                        Recorded directly in Stock Movement Ledger
                      </span>
                    </div>

                    <div>
                      <label className="block text-neutral-400 font-bold uppercase mb-1">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.lowStockThreshold || 5}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 5 })}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CRICKET SPECIFICATIONS */}
              {activeTab === 'specs' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">
                      Size Variants (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={(formData.sizes || []).join(', ')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sizes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="Short Handle (Light), Short Handle (Med), Harrow, Size 6"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">Color / Finish</label>
                    <input
                      type="text"
                      value={formData.color || ''}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="White/Aurora Blue/Core Black"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-neutral-400 font-bold uppercase">
                      Cricket Equipment Specifications (Key-Value Pairs)
                    </label>
                    <div className="space-y-2">
                      {['Willow Grade', 'Weight', 'Profile', 'Handle', 'Spike Configuration', 'Cushioning'].map((specKey) => (
                        <div key={specKey} className="grid grid-cols-3 gap-2">
                          <span className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 font-bold">
                            {specKey}
                          </span>
                          <input
                            type="text"
                            value={formData.specs?.[specKey] || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specs: { ...(formData.specs || {}), [specKey]: e.target.value },
                              })
                            }
                            placeholder={specKey === 'Willow Grade' ? 'Grade 1+ English Willow' : 'e.g. 2lb 9oz'}
                            className="col-span-2 bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: IMAGES & UPLOAD */}
              {activeTab === 'images' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">
                      Upload Equipment Images (Persistent Storage)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-neutral-700 hover:border-[#ccff00] rounded-xl flex flex-col items-center justify-center space-y-2 transition-colors cursor-pointer bg-neutral-950"
                    >
                      <ImageIcon size={24} className="text-[#ccff00]" />
                      <span className="font-bold text-neutral-300">
                        {isUploadingImage ? 'Uploading to persistent disk...' : 'Click to Upload Images from Device (JPG, PNG, WebP)'}
                      </span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-neutral-400 font-bold uppercase mb-1">
                      Image URLs (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={(formData.images || []).join('\n')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          images: e.target.value.split('\n').map((url) => url.trim()).filter(Boolean),
                        })
                      }
                      placeholder="https://..."
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none"
                    />
                  </div>

                  {/* Thumbnail Previews */}
                  {formData.images && formData.images.length > 0 && (
                    <div>
                      <span className="block text-neutral-400 font-bold uppercase mb-2">Image Previews</span>
                      <div className="flex flex-wrap gap-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-lg p-1 group">
                            <img src={img} alt="preview" className="w-full h-full object-contain" />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  images: formData.images?.filter((_, idx) => idx !== i),
                                })
                              }
                              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#ccff00]/10 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving Product...' : modalMode === 'create' ? 'Create Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Bulk CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-black uppercase font-mono text-white">
                Bulk CSV Product Import
              </h3>
              <button onClick={() => setIsCsvModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 flex-1 overflow-y-auto text-xs">
              <p className="text-neutral-400">
                Paste your CSV content below. Required columns: <strong className="text-white">Title</strong>, <strong className="text-white">Category</strong>, <strong className="text-white">Selling Price (BDT)</strong>, <strong className="text-white">SKU</strong>, <strong className="text-white">Brand</strong>.
              </p>

              <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-400">
                SKU,Title,Brand,Category,Cost Price (BDT),Selling Price (BDT),Stock<br />
                CRK-BAT-TEST,New English Bat,Gunn & Moore,Cricket Bats,10000,16000,12
              </div>

              <textarea
                rows={8}
                value={csvInput}
                onChange={(e) => setCsvInput(e.target.value)}
                placeholder="Paste CSV text here..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-[#ccff00]"
              />

              {csvResult && (
                <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-1">
                  <div className="font-bold text-white">Import Results:</div>
                  <div className="text-emerald-400">✓ {csvResult.imported} products created</div>
                  <div className="text-blue-400">✓ {csvResult.updated} products updated</div>
                  {csvResult.errors && csvResult.errors.length > 0 && (
                    <div className="text-red-400">
                      ✕ {csvResult.errors.length} error(s):
                      <ul className="list-disc pl-4 mt-1 text-[11px] text-red-300">
                        {csvResult.errors.map((err: any, idx: number) => (
                          <li key={idx}>Row {err.row}: {err.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-800 flex justify-end space-x-2">
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                disabled={isImporting || !csvInput.trim()}
                onClick={handleImportCsv}
                className="px-5 py-2 bg-[#ccff00] hover:bg-[#b5e600] text-black font-black uppercase rounded-xl cursor-pointer disabled:opacity-40"
              >
                {isImporting ? 'Processing Import...' : 'Import Products'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
