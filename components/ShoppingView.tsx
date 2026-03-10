'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Printer, Trash2, CheckCircle2, Circle, Plus, ArrowRight } from 'lucide-react';
import { Product, ShoppingItem, Supplier } from '@/types/inventory';
import { clsx } from 'clsx';

interface ShoppingViewProps {
  products: Product[];
  shoppingList: ShoppingItem[];
  suppliers: Supplier[];
  toggleShoppingItem: (id: string) => void;
  setCheckedShoppingItem: (id: string, checked: boolean) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Omit<Product, 'id' | 'addedAt'>) => void;
  onNavigate: (tab: string) => void;
  finalizePurchase: () => void;
}

export default function ShoppingView({ 
  products, 
  shoppingList, 
  suppliers,
  toggleShoppingItem, 
  setCheckedShoppingItem, 
  updateProduct, 
  addProduct, 
  onNavigate,
  finalizePurchase
}: ShoppingViewProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    price: 0,
    quantity: 0,
    brand: '',
  });

  const shoppingProducts = shoppingList.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  // Group by supplier
  const groupedBySupplier = shoppingProducts.reduce((acc, item) => {
    const fornecedor_id = item.product?.fornecedor_id || 'no-supplier';
    if (!acc[fornecedor_id]) acc[fornecedor_id] = [];
    acc[fornecedor_id].push(item);
    return acc;
  }, {} as Record<string, typeof shoppingProducts>);

  const handleCheck = (productId: string, currentChecked: boolean) => {
    if (!currentChecked) {
      // Opening modal to confirm purchase details
      const product = products.find(p => p.id === productId);
      if (product) {
        setSelectedItem(productId);
        setPurchaseData({
          price: product.price,
          quantity: 1,
          brand: product.brand || '',
        });
        setIsAddingNewBrand(false);
      }
    } else {
      setCheckedShoppingItem(productId, false);
    }
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const currentProduct = products.find(p => p.id === selectedItem);
    if (!currentProduct) return;

    if (isAddingNewBrand) {
      // Add as a new product entry for this name
      addProduct({
        name: currentProduct.name,
        category: currentProduct.category,
        brand: purchaseData.brand,
        price: purchaseData.price,
        quantity: purchaseData.quantity,
        unit: currentProduct.unit,
        measureValue: currentProduct.measureValue || 1,
        minQuantity: currentProduct.minQuantity,
        consumptionPerDay: currentProduct.consumptionPerDay,
        lastPurchaseDate: new Date().toISOString().split('T')[0]
      });
    } else {
      // Update existing product
      updateProduct(selectedItem, {
        price: purchaseData.price,
        quantity: (currentProduct.quantity || 0) + purchaseData.quantity,
        lastPurchaseDate: new Date().toISOString().split('T')[0]
      });
    }

    setCheckedShoppingItem(selectedItem, true);
    setSelectedItem(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const checkedCount = shoppingList.filter(s => s.checked).length;
  const totalCount = shoppingList.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lista de Compras</h2>
          <p className="text-gray-500">Selecione os itens que você precisa comprar.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            disabled={totalCount === 0}
            className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5" />
            Imprimir Lista
          </button>
          <button
            onClick={() => onNavigate('estoque')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            <Plus className="w-5 h-5" />
            Adicionar Itens
          </button>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900">Progresso da Compra</h3>
              <p className="text-xs text-gray-400">{checkedCount} de {totalCount} itens selecionados</p>
            </div>
            {checkedCount > 0 && (
              <button
                onClick={finalizePurchase}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                FINALIZAR COMPRA
              </button>
            )}
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
        </div>
      )}

      <div className="space-y-8 print:block">
        <AnimatePresence mode="wait">
          {totalCount > 0 ? (
            Object.entries(groupedBySupplier).map(([fornecedor_id, items]) => {
              const supplier = suppliers.find(s => s.id === fornecedor_id);
              return (
                <div key={fornecedor_id} className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-2">
                    {supplier ? supplier.name : 'Sem Fornecedor'}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={clsx(
                          "bg-white p-5 rounded-3xl border transition-all flex items-center justify-between group print:border-b print:rounded-none print:shadow-none",
                          item.checked ? "border-emerald-100 bg-emerald-50/30" : "border-gray-100 shadow-sm hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleCheck(item.productId, item.checked)}
                            className={clsx(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-all print:hidden",
                              item.checked ? "bg-emerald-500 text-white" : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                            )}
                          >
                            {item.checked ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                          </button>
                          <div>
                            <h4 className={clsx(
                              "font-bold text-lg transition-all",
                              item.checked ? "text-gray-400 line-through" : "text-gray-900"
                            )}>
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {item.product?.category}
                              </span>
                              <span className="text-sm text-gray-500">
                                Marca: <span className="font-bold text-gray-700">{item.product?.brand || 'Sem Marca'}</span>
                              </span>
                              <span className="text-sm text-gray-500">
                                Estoque: <span className="font-bold text-gray-700">{item.product?.quantity} un</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preço Estimado</p>
                            <p className="text-lg font-bold text-gray-900">R$ {item.product?.price.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => toggleShoppingItem(item.productId)}
                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 print:hidden"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sua lista está vazia</h3>
              <p className="text-gray-500 max-w-xs mb-8">
                Adicione produtos que estão com estoque baixo para organizar suas compras.
              </p>
              <button
                onClick={() => onNavigate('estoque-baixo')}
                className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-3 transition-all"
              >
                Ir para Estoque Baixo <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Purchase Confirmation Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Compra</h3>
                <p className="text-gray-500 mb-6">Atualize as informações do produto comprado.</p>

                <form onSubmit={handleConfirmPurchase} className="space-y-6">
                  <div className="flex gap-4 p-2 bg-gray-50 rounded-2xl mb-6">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewBrand(false)}
                      className={clsx(
                        "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                        !isAddingNewBrand ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400"
                      )}
                    >
                      MARCA ATUAL
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewBrand(true)}
                      className={clsx(
                        "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                        isAddingNewBrand ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400"
                      )}
                    >
                      NOVA MARCA
                    </button>
                  </div>

                  {isAddingNewBrand && (
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nova Marca / Fornecedor</label>
                      <input
                        required
                        type="text"
                        value={purchaseData.brand}
                        onChange={e => setPurchaseData({...purchaseData, brand: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="Ex: Tio João"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Preço Pago (R$)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={purchaseData.price}
                        onChange={e => setPurchaseData({...purchaseData, price: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantidade Comprada</label>
                      <input
                        required
                        type="number"
                        value={purchaseData.quantity}
                        onChange={e => setPurchaseData({...purchaseData, quantity: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                    >
                      CONFIRMAR
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:border-b { border-bottom: 1px solid #eee !important; border-top: 0; border-left: 0; border-right: 0; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
