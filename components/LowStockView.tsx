'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Package, Search, Filter, ArrowRight, ShoppingCart, ChevronDown, SortAsc, SortDesc, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { Product, ShoppingItem, Supplier } from '@/types/inventory';
import { clsx } from 'clsx';

interface LowStockViewProps {
  products: Product[];
  shoppingList: ShoppingItem[];
  suppliers: Supplier[];
  toggleShoppingItem: (productId: string) => void;
  onNavigate: (tab: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
}

type SortOption = 'az' | 'za' | 'price-asc' | 'price-desc';

export default function LowStockView({ products, shoppingList, suppliers, toggleShoppingItem, onNavigate, updateProduct }: LowStockViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('az');

  // Group products by name
  const groupedProducts = products.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = [];
    acc[p.name].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  // Filter low stock groups
  const lowStockGroups = Object.entries(groupedProducts).filter(([name, items]) => {
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const minThreshold = items[0].minQuantity || 0;
    return totalQty <= minThreshold;
  }).filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectBrand = (productId: string) => {
    toggleShoppingItem(productId);
    setSelectedProduct(null);
  };

  const getSortedBrands = (brands: Product[]) => {
    const sorted = [...brands];
    switch (sortOption) {
      case 'az':
        return sorted.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
      case 'za':
        return sorted.sort((a, b) => (b.brand || '').localeCompare(a.brand || ''));
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            Estoque Baixo
          </h2>
          <p className="text-gray-500">Itens que precisam de reposição imediata.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">{shoppingList.length} itens na lista</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar item para repor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {lowStockGroups.map(([name, items]) => {
            const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const unit = items[0].unit;
            const category = items[0].category;

            return (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setSelectedProduct(name)}
                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Estoque crítico: <span className="font-bold text-amber-600">{totalQty} {unit}</span>
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase">{items.length} marcas registradas</span>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {lowStockGroups.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Tudo em ordem!</h3>
            <p className="text-gray-500">Não há itens com estoque baixo no momento.</p>
          </div>
        )}
      </div>

      {/* Brand Selection Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedProduct}</h3>
                    <p className="text-sm text-gray-500">Escolha uma marca para adicionar à lista</p>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 hover:bg-white rounded-2xl transition-colors shadow-sm"
                  >
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  <button 
                    onClick={() => setSortOption('az')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      sortOption === 'az' ? "bg-amber-500 text-white" : "bg-white text-gray-500 border border-gray-200"
                    )}
                  >
                    <SortAsc className="w-4 h-4" /> A-Z
                  </button>
                  <button 
                    onClick={() => setSortOption('za')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      sortOption === 'za' ? "bg-amber-500 text-white" : "bg-white text-gray-500 border border-gray-200"
                    )}
                  >
                    <SortDesc className="w-4 h-4" /> Z-A
                  </button>
                  <button 
                    onClick={() => setSortOption('price-asc')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      sortOption === 'price-asc' ? "bg-amber-500 text-white" : "bg-white text-gray-500 border border-gray-200"
                    )}
                  >
                    <TrendingDown className="w-4 h-4" /> Menor Preço
                  </button>
                  <button 
                    onClick={() => setSortOption('price-desc')}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                      sortOption === 'price-desc' ? "bg-amber-500 text-white" : "bg-white text-gray-500 border border-gray-200"
                    )}
                  >
                    <TrendingUp className="w-4 h-4" /> Maior Preço
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {getSortedBrands(groupedProducts[selectedProduct] || []).map((product) => {
                  const isInList = shoppingList.some(s => s.productId === product.id);
                  
                  return (
                    <button
                      key={product.id}
                      disabled={isInList}
                      onClick={() => handleSelectBrand(product.id)}
                      className={clsx(
                        "w-full flex items-center justify-between p-5 rounded-3xl border transition-all text-left group",
                        isInList 
                          ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed" 
                          : "bg-white border-gray-100 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          isInList ? "bg-gray-100 text-gray-400" : "bg-gray-50 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600"
                        )}>
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{product.brand || 'Sem Marca'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">Último preço: R$ {product.price.toFixed(2)}</span>
                            {suppliers.find(s => s.id === product.fornecedor_id) && (
                              <span className="text-[10px] font-bold text-[#C5B49E] bg-[#C5B49E]/10 px-2 py-0.5 rounded-full">
                                {suppliers.find(s => s.id === product.fornecedor_id)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Estoque</span>
                          <span className="font-bold text-gray-900">{product.quantity} {product.unit}</span>
                        </div>
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          isInList ? "bg-emerald-500 text-white" : "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                        )}>
                          {isInList ? <ShoppingCart className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
