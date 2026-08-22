import React, { useState, useRef } from 'react';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Flame, 
  Sparkles, 
  Layers, 
  Check, 
  X, 
  RotateCcw, 
  ExternalLink,
  Plus,
  AlertTriangle,
  Wand2,
  Image as ImageIcon,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import type { Product, ProductCategory } from '../../types';
import { INITIAL_PRODUCTS } from '../../lib/productsData';
import { AdminAiImageGenModal } from './AdminAiImageGenModal';
import { exportProductsToCsv, parseProductsFromCsv } from '../../lib/csvUtils';

interface AdminProductManageTabProps {
  products: Product[];
  onUpdateProduct: (updated: Product) => void;
  onAddBatchProducts?: (batch: Product[]) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts: () => void;
  onNavigateToRegister: () => void;
  onSuccess: (message: string) => void;
}

export function AdminProductManageTab({
  products,
  onUpdateProduct,
  onAddBatchProducts,
  onDeleteProduct,
  onResetProducts,
  onNavigateToRegister,
  onSuccess,
}: AdminProductManageTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [aiGenProduct, setAiGenProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.tags && p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'hot') return matchesSearch && (p.isHot || p.category === 'hot');
    if (selectedCategory === 'ai') return matchesSearch && (p.category === 'ai');
    return matchesSearch && (p.categoryLabel === selectedCategory || p.category === selectedCategory);
  });

  // Export to CSV
  const handleExportCsv = () => {
    exportProductsToCsv(products);
    onSuccess(`전체 상품 ${products.length}개의 엑셀(CSV) 다운로드가 시작되었습니다.`);
  };

  // Trigger CSV Upload
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle CSV File Selection
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        alert('파일을 읽는 중 문제가 발생했습니다.');
        return;
      }

      const { products: importedProducts, errorCount } = parseProductsFromCsv(text);
      if (importedProducts.length === 0) {
        alert('유효한 상품 데이터를 찾지 못했습니다. CSV 형식(상품명, 가격 등)을 확인해주세요.');
        return;
      }

      if (onAddBatchProducts) {
        onAddBatchProducts(importedProducts);
        onSuccess(`엑셀(CSV) 업로드 완료: ${importedProducts.length}개 상품이 등록되었습니다.${errorCount > 0 ? ` (${errorCount}건 오류 스킵)` : ''}`);
      } else {
        // Fallback: update individually
        importedProducts.forEach(p => onUpdateProduct(p));
        onSuccess(`엑셀(CSV) ${importedProducts.length}개 상품이 성공적으로 적용되었습니다.`);
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Toggle Hot Status
  const handleToggleHot = (product: Product) => {
    const updated: Product = {
      ...product,
      isHot: !product.isHot,
      category: !product.isHot ? 'hot' : product.category === 'hot' ? 'latest' : product.category
    };
    onUpdateProduct(updated);
    onSuccess(`[${product.name}] HOT 특가 상태가 ${!product.isHot ? '설정' : '해제'}되었습니다.`);
  };

  // Toggle AI Recommendation
  const handleToggleAi = (product: Product) => {
    const updated: Product = {
      ...product,
      category: product.category === 'ai' ? 'latest' : 'ai'
    };
    onUpdateProduct(updated);
    onSuccess(`[${product.name}] AI 상품 지정이 ${updated.category === 'ai' ? '설정' : '해제'}되었습니다.`);
  };

  // Save Product Edit Form
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
    onSuccess(`상품 [${editingProduct.name}]의 정보가 수정되었습니다.`);
  };

  // Apply AI Image Replacement
  const handleApplyAiImage = (productId: string, newImageUrl: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const updated: Product = {
      ...target,
      imageUrl: newImageUrl,
    };
    onUpdateProduct(updated);

    // If currently editing this product in modal, update that state too
    if (editingProduct && editingProduct.id === productId) {
      setEditingProduct(prev => prev ? { ...prev, imageUrl: newImageUrl } : null);
    }

    onSuccess(`[${target.name}] 상품의 대표 이미지가 AI 맞춤 룩북으로 교체되었습니다!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-700" />
            상품 통합 관리 및 수정
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            등록된 상품 정보를 실시간으로 수정하거나 삭제하고, 핫딜 및 AI 태그를 관리합니다. (총 {products.length}개)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Hidden File Input for CSV Upload */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleCsvFileChange} 
            accept=".csv,text/csv" 
            className="hidden" 
          />

          {/* CSV Export Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="현재 등록된 상품 목록을 엑셀(CSV) 파일로 다운로드합니다."
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>상품 다운로드(CSV)</span>
          </button>

          {/* CSV Upload Button */}
          <button
            type="button"
            onClick={handleTriggerUpload}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl shadow-2xs transition-colors cursor-pointer"
            title="CSV 파일을 선택하여 상품을 대량으로 업로드/등록합니다."
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>상품 업로드(CSV)</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToRegister}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>상품 등록</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (confirm('기본 샘플 데이터로 복원하시겠습니까?')) {
                onResetProducts();
                onSuccess('기본 상품 목록으로 복원되었습니다.');
              }
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            title="초기 샘플 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">초기화</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="search"
            placeholder="상품명, 설명, 태그로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: '전체' },
            { id: '상의', label: '상의' },
            { id: '하의', label: '하의' },
            { id: '아우터', label: '아우터' },
            { id: '원피스', label: '원피스' },
            { id: '액세서리', label: '액세서리' },
            { id: 'hot', label: '🔥 HOT 특가' },
            { id: 'ai', label: '✨ AI 상품' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-600">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4">상품 정보</th>
                <th className="py-3 px-4">의류 분류</th>
                <th className="py-3 px-4">판매가</th>
                <th className="py-3 px-4 text-center">HOT 특가</th>
                <th className="py-3 px-4 text-center">AI 추천</th>
                <th className="py-3 px-4 text-right">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-sm">
                    검색 조건에 일치하는 상품이 없습니다.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="max-w-[240px]">
                          <p className="font-bold text-neutral-900 text-xs truncate">{product.name}</p>
                          <p className="text-[11px] text-neutral-400 truncate mt-0.5">{product.description}</p>
                          {product.tags && product.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              {product.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 font-semibold text-neutral-800">
                      <span className="px-2.5 py-1 bg-neutral-100 rounded-lg text-xs font-medium">
                        {product.categoryLabel || product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-neutral-900 text-xs">
                        ₩ {product.price.toLocaleString()}
                      </div>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <div className="text-[10px] text-neutral-400 line-through">
                          ₩ {product.originalPrice.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Hot Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleHot(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          product.isHot || product.category === 'hot'
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${product.isHot ? 'text-rose-600' : ''}`} />
                        <span>{product.isHot ? 'ON' : 'OFF'}</span>
                      </button>
                    </td>

                    {/* AI Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAi(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          product.category === 'ai'
                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                            : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${product.category === 'ai' ? 'text-purple-600' : ''}`} />
                        <span>{product.category === 'ai' ? 'AI' : '일반'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setAiGenProduct(product)}
                          className="inline-flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-purple-50 to-amber-50 hover:from-purple-100 hover:to-amber-100 text-purple-900 border border-purple-200/80 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                          title="AI 맞춤 패션 이미지 생성 및 교체"
                        >
                          <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                          <span className="hidden sm:inline">AI 이미지</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...product })}
                          className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors cursor-pointer"
                          title="상품 수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProductId(product.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="상품 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                상품 정보 수정
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">상품명</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">분류</label>
                  <select
                    value={editingProduct.categoryLabel || '상의'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryLabel: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="상의">상의</option>
                    <option value="하의">하의</option>
                    <option value="아우터">아우터</option>
                    <option value="원피스">원피스</option>
                    <option value="액세서리">액세서리</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">판매 가격 (₩)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-700">이미지 URL</label>
                  <button
                    type="button"
                    onClick={() => setAiGenProduct(editingProduct)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>AI로 이미지 생성/추천</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={editingProduct.imageUrl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl font-mono"
                  />
                  {editingProduct.imageUrl && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-neutral-300 shrink-0 bg-neutral-100">
                      <img src={editingProduct.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">상세 설명</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">AI 코디 추천 팁</label>
                <input
                  type="text"
                  value={editingProduct.aiStylingSuggestion || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, aiStylingSuggestion: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-amber-50/50 border border-amber-200 rounded-xl"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Image Generator Modal */}
      {aiGenProduct && (
        <AdminAiImageGenModal
          product={aiGenProduct}
          isOpen={Boolean(aiGenProduct)}
          onClose={() => setAiGenProduct(null)}
          onApplyImage={handleApplyAiImage}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">상품을 삭제하시겠습니까?</h3>
            <p className="text-xs text-neutral-500 mt-1">
              삭제된 상품은 쇼핑몰 및 장바구니에서 즉시 제거됩니다.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(deletingProductId);
                  setDeletingProductId(null);
                  onSuccess('상품이 삭제되었습니다.');
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
