'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, Trash2, Edit2, AlertCircle, Calendar, Package, TrendingUp, TrendingDown, Printer, UserPlus } from 'lucide-react';
import { Product, Category, Supplier } from '@/types/inventory';
import { clsx } from 'clsx';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InventoryViewProps {
  products: Product[];
  suppliers: Supplier[];
  addProduct: (product: Omit<Product, 'id' | 'addedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleShoppingItem: (id: string) => void;
  shoppingList: { productId: string }[];
  addSupplier: (name: string) => void;
}

const categories: Category[] = ['Alimentos', 'Carnes', 'Hortifruti', 'Limpeza', 'Higiene', 'Bebidas', 'Outros'];
const units = ['un', 'kg', 'g', 'l', 'ml'];

export default function InventoryView({ products, suppliers, addProduct, updateProduct, deleteProduct, toggleShoppingItem, shoppingList, addSupplier }: InventoryViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');
  const [selectedSupplier, setSelectedSupplier] = useState<string | 'Todos'>('Todos');
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Alimentos' as Category,
    fornecedor_id: '',
    price: '' as any,
    quantity: '' as any,
    unit: 'un' as any,
    measureValue: '' as any,
    minQuantity: '' as any,
    consumptionPerDay: '' as any,
    lastPurchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      ...formData,
      price: parseFloat(formData.price) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      measureValue: parseFloat(formData.measureValue) || 1,
      minQuantity: parseFloat(formData.minQuantity) || 1,
      consumptionPerDay: parseFloat(formData.consumptionPerDay) || 0.1,
    });
    setIsAdding(false);
    setFormData({
      name: '',
      brand: '',
      category: 'Alimentos',
      fornecedor_id: '',
      price: '',
      quantity: '',
      unit: 'un',
      measureValue: '',
      minQuantity: '',
      consumptionPerDay: '',
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const groupName = editingProduct.name;
      const { id, addedAt, ...updates } = editingProduct;
      updateProduct(id, updates);
      setEditingProduct(null);
      setSelectedGroup(groupName);
    }
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSupplierName.trim()) {
      addSupplier(newSupplierName.trim());
      setNewSupplierName('');
      setIsAddingSupplier(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.brand?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'Todos' || p.fornecedor_id === selectedSupplier;
    
    return matchesSearch && matchesCategory && matchesSupplier;
  });

  const groupedProducts = filteredProducts.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = [];
    acc[p.name].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [brandSearch, setBrandSearch] = useState('');
  const [brandSupplierFilter, setBrandSupplierFilter] = useState('Todos');
  const [groupSettings, setGroupSettings] = useState({
    unit: 'un' as any,
    measureValue: 1,
    minQuantity: 0,
    consumptionPerDay: 0
  });

  // Update group settings state when group changes
  React.useEffect(() => {
    if (selectedGroup && groupedProducts[selectedGroup]) {
      const base = groupedProducts[selectedGroup][0];
      setGroupSettings({
        unit: base.unit,
        measureValue: base.measureValue || 1,
        minQuantity: base.minQuantity || 0,
        consumptionPerDay: base.consumptionPerDay || 0
      });
    }
  }, [selectedGroup, groupedProducts]);

  const handleUpdateGroupSettings = () => {
    if (!selectedGroup) return;
    const groupItems = groupedProducts[selectedGroup];
    groupItems.forEach(p => {
      updateProduct(p.id, groupSettings);
    });
    alert('Configurações do grupo atualizadas!');
  };

  const [newBrandData, setNewBrandData] = useState({
    brand: '',
    fornecedor_id: '',
    price: '' as any,
    quantity: '' as any,
    unit: 'un' as any,
    measureValue: '' as any,
    minQuantity: '' as any,
    consumptionPerDay: '' as any,
    lastPurchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    
    const baseProduct = groupedProducts[selectedGroup][0];
    addProduct({
      name: selectedGroup,
      category: baseProduct.category,
      brand: newBrandData.brand,
      fornecedor_id: newBrandData.fornecedor_id,
      price: parseFloat(newBrandData.price) || 0,
      quantity: parseFloat(newBrandData.quantity) || 0,
      unit: baseProduct.unit,
      measureValue: baseProduct.measureValue || 1,
      minQuantity: baseProduct.minQuantity,
      consumptionPerDay: baseProduct.consumptionPerDay,
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    });
    
    setIsAddingBrand(false);
    setNewBrandData({
      brand: '',
      fornecedor_id: '',
      price: '',
      quantity: '',
      unit: 'un',
      measureValue: '',
      minQuantity: '',
      consumptionPerDay: '',
      lastPurchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const calculateDaysLeft = (product: Product) => {
    if (product.consumptionPerDay <= 0) return Infinity;
    return Math.floor(product.quantity / product.consumptionPerDay);
  };

  const getStatusColor = (days: number) => {
    if (days > 7) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (days > 3) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#5D3D4C]">Estoque de Itens</h2>
          <p className="text-gray-500">Gerencie seus produtos e acompanhe o consumo.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Imprimir
          </button>
          <button
            onClick={() => setIsAddingSupplier(true)}
            className="bg-white border border-[#C5B49E] text-[#C5B49E] px-4 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-[#C5B49E]/5 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Fornecedor
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-[#5D3D4C] text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 hover:bg-[#5D3D4C]/90 transition-colors shadow-lg shadow-[#5D3D4C]/20"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5D3D4C]/20 focus:border-[#5D3D4C] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => {
              setSelectedCategory('Todos');
              setSelectedSupplier('Todos');
            }}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              (selectedCategory === 'Todos' && selectedSupplier === 'Todos') ? "bg-[#5D3D4C] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#5D3D4C]/20"
            )}
          >
            Todos
          </button>
          
          <div className="w-px h-6 bg-gray-200 self-center mx-1" />
          
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === cat ? "bg-[#5D3D4C] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#5D3D4C]/20"
              )}
            >
              {cat}
            </button>
          ))}
          
          <div className="w-px h-6 bg-gray-200 self-center mx-1" />
          
          {suppliers.map(sup => (
            <button
              key={sup.id}
              onClick={() => setSelectedSupplier(sup.id)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                selectedSupplier === sup.id ? "bg-[#C5B49E] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#C5B49E]/20"
              )}
            >
              {sup.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto / Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Preço / Qtd.</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Quantidade por unidade</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="wait">
                {Object.entries(groupedProducts).map(([name, items]) => {
                  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                  const avgPrice = items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length;
                  const minThreshold = items[0].minQuantity || 0;
                  const isTotalLow = totalQuantity <= minThreshold;

                  return (
                    <motion.tr
                      key={name}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedGroup(name)}
                      className="bg-gray-50/50 cursor-pointer hover:bg-gray-100/50 transition-colors border-l-4 border-[#5D3D4C]"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#5D3D4C]/10 rounded-lg flex items-center justify-center text-[#5D3D4C]">
                            <Package className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{name}</span>
                            <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              {items[0].category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">R$</span>
                            <span className="font-bold text-gray-900">{avgPrice.toFixed(2)}</span>
                          </div>
                          <div className="w-px h-3 bg-gray-200" />
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-900">{totalQuantity}</span>
                            <span className="text-[10px] text-gray-400 uppercase font-bold">un</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="font-bold text-gray-900">{items[0].measureValue || 1}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{items[0].unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-center">
                          {isTotalLow && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                              <AlertCircle className="w-3 h-3" />
                              ALERTA
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button className="text-[#5D3D4C] text-xs font-bold hover:underline">
                          Ver Detalhes
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-400 font-medium">Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>

      {/* Supplier Creation Modal */}
      <AnimatePresence>
        {isAddingSupplier && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingSupplier(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden p-8"
            >
              <h3 className="text-xl font-bold text-[#5D3D4C] mb-6">Novo Fornecedor</h3>
              <form onSubmit={handleAddSupplier} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nome do Fornecedor</label>
                  <input
                    required
                    autoFocus
                    type="text"
                    value={newSupplierName}
                    onChange={e => setNewSupplierName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5D3D4C]/20 outline-none"
                    placeholder="Ex: Mercado Central"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingSupplier(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#5D3D4C] text-white rounded-2xl font-bold hover:bg-[#5D3D4C]/90 transition-all shadow-lg shadow-[#5D3D4C]/20"
                  >
                    CRIAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Detalhes do Grupo */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGroup(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-3xl font-black text-[#5D3D4C] tracking-tight">{selectedGroup}</h3>
                    <p className="text-gray-500">Detalhes do produto e estoque por marca.</p>
                  </div>
                  <button 
                    onClick={() => setSelectedGroup(null)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="lg:col-span-2 space-y-6">
                    {groupedProducts[selectedGroup] && groupedProducts[selectedGroup].length > 0 && (
                      <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configurações de Estoque</h4>
                          <button 
                            onClick={handleUpdateGroupSettings}
                            className="text-[10px] font-bold text-emerald-600 hover:underline bg-emerald-50 px-3 py-1 rounded-full"
                          >
                            SALVAR ALTERAÇÕES
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Medida</p>
                            <select 
                              value={groupSettings.unit}
                              onChange={e => setGroupSettings({...groupSettings, unit: e.target.value as any})}
                              className="w-full bg-transparent font-bold text-[#5D3D4C] uppercase outline-none cursor-pointer"
                            >
                              {units.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Qtd. por Unidade</p>
                            <input 
                              type="number"
                              step="0.01"
                              value={groupSettings.measureValue}
                              onChange={e => setGroupSettings({...groupSettings, measureValue: parseFloat(e.target.value) || 0})}
                              className="w-full bg-transparent font-bold text-[#5D3D4C] outline-none border-b border-transparent focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Mínimo</p>
                            <input 
                              type="number"
                              value={groupSettings.minQuantity}
                              onChange={e => setGroupSettings({...groupSettings, minQuantity: parseFloat(e.target.value) || 0})}
                              className="w-full bg-transparent font-bold text-[#5D3D4C] outline-none border-b border-transparent focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Consumo/Dia</p>
                            <input 
                              type="number"
                              step="0.01"
                              value={groupSettings.consumptionPerDay}
                              onChange={e => setGroupSettings({...groupSettings, consumptionPerDay: parseFloat(e.target.value) || 0})}
                              className="w-full bg-transparent font-bold text-[#5D3D4C] outline-none border-b border-transparent focus:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Total em Unidades</p>
                        <p className="text-3xl font-black text-emerald-700">
                          {groupedProducts[selectedGroup]?.reduce((sum, p) => sum + p.quantity, 0) || 0}
                          <span className="text-sm ml-1 uppercase">un</span>
                        </p>
                      </div>
                      <div className="bg-[#C5B49E]/10 p-6 rounded-[32px] border border-[#C5B49E]/20">
                        <p className="text-[10px] font-bold text-[#C5B49E] uppercase mb-1">Total em Quantidade</p>
                        <p className="text-3xl font-black text-[#5D3D4C]">
                          {((groupedProducts[selectedGroup]?.reduce((sum, p) => sum + p.quantity, 0) || 0) * (groupedProducts[selectedGroup]?.[0]?.measureValue || 1)).toFixed(2)}
                          <span className="text-sm ml-1 uppercase">{groupedProducts[selectedGroup]?.[0]?.unit || 'un'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className={clsx(
                      "w-20 h-20 rounded-[28px] flex items-center justify-center mb-4 border-2",
                      groupedProducts[selectedGroup] ? getStatusColor(calculateDaysLeft(groupedProducts[selectedGroup][0])) : 'text-gray-300 border-gray-200'
                    )}>
                      <Calendar className="w-10 h-10" />
                    </div>
                    <h5 className="text-sm font-bold text-gray-400 uppercase mb-1">Duração Estimada</h5>
                    <p className="text-4xl font-black text-gray-900">
                      {!groupedProducts[selectedGroup] ? '0' : calculateDaysLeft(groupedProducts[selectedGroup][0]) === Infinity ? '∞' : calculateDaysLeft(groupedProducts[selectedGroup][0])}
                      <span className="text-lg ml-1">dias</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Baseado no consumo diário</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marcas Cadastradas</h4>
                    <div className="flex items-center gap-3">
                      <select 
                        value={brandSupplierFilter}
                        onChange={e => setBrandSupplierFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-[#5D3D4C]/10"
                      >
                        <option value="Todos">Todos Fornecedores</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <button 
                        onClick={() => setIsAddingBrand(!isAddingBrand)}
                        className="flex items-center gap-2 text-emerald-600 text-xs font-bold hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        NOVA MARCA
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text"
                      placeholder="Filtrar marcas por nome..."
                      value={brandSearch}
                      onChange={e => setBrandSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5D3D4C]/10"
                    />
                  </div>

                {isAddingBrand && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={handleAddBrand}
                    className="bg-gray-50 p-6 rounded-3xl border border-emerald-100 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Marca / Fornecedor</label>
                        <input 
                          required
                          type="text"
                          value={newBrandData.brand}
                          onChange={e => setNewBrandData({...newBrandData, brand: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          placeholder="Ex: Tio João"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fornecedor</label>
                        <select
                          value={newBrandData.fornecedor_id}
                          onChange={e => setNewBrandData({...newBrandData, fornecedor_id: e.target.value})}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                          <option value="">Selecione um fornecedor</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Preço Atual (R$)</label>
                        <input 
                          required
                          type="number"
                          step="0.01"
                          value={newBrandData.price}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setNewBrandData({...newBrandData, price: isNaN(val) ? 0 : val});
                          }}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Quantidade</label>
                        <input 
                          required
                          type="number"
                          value={newBrandData.quantity}
                          onChange={e => {
                            const val = parseFloat(e.target.value);
                            setNewBrandData({...newBrandData, quantity: isNaN(val) ? 0 : val});
                          }}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsAddingBrand(false)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-white rounded-xl transition-all"
                      >
                        CANCELAR
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                      >
                        SALVAR MARCA
                      </button>
                    </div>
                  </motion.form>
                )}

                <div className="space-y-3">
                  {groupedProducts[selectedGroup]?.filter(p => {
                    const matchesSearch = (p.brand || '').toLowerCase().includes(brandSearch.toLowerCase());
                    const matchesSupplier = brandSupplierFilter === 'Todos' || p.fornecedor_id === brandSupplierFilter;
                    return matchesSearch && matchesSupplier;
                  }).map((product) => {
                    const priceDiff = product.previousPrice ? product.price - product.previousPrice : 0;
                    const percentChange = product.previousPrice ? (priceDiff / product.previousPrice) * 100 : 0;
                    const supplier = suppliers.find(s => s.id === product.fornecedor_id);
                    
                    return (
                      <div 
                        key={product.id}
                        className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group relative overflow-hidden"
                      >
                        <button 
                          onClick={() => {
                            setEditingProduct(product);
                            setSelectedGroup(null);
                          }}
                          className="absolute inset-0 z-10 w-full h-full text-left"
                        />
                        
                        <div className="flex items-center gap-4 relative z-0">
                          <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{product.brand || 'Sem Marca'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">Estoque: {product.quantity} un</span>
                              {supplier && (
                                <span className="text-[10px] font-bold text-[#C5B49E] bg-[#C5B49E]/10 px-2 py-0.5 rounded-full">
                                  {supplier.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-8 relative z-20">
                          <div className="text-right">
                            <span className="block font-bold text-gray-900">R$ {product.price.toFixed(2)}</span>
                            {product.previousPrice ? (
                              <div className={clsx(
                                "flex items-center justify-end gap-1 text-[10px] font-bold",
                                priceDiff > 0 ? "text-red-500" : priceDiff < 0 ? "text-emerald-500" : "text-gray-400"
                              )}>
                                {priceDiff > 0 ? <TrendingUp className="w-3 h-3" /> : priceDiff < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                <span>{Math.abs(percentChange).toFixed(1)}%</span>
                              </div>
                            ) : (
                              <span className="text-[9px] text-gray-300 uppercase font-bold">Sem histórico</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setBrandToDelete(product.id);
                              }}
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Modal Confirmação de Exclusão */}
      <AnimatePresence>
        {brandToDelete && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBrandToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-gray-500 mb-8">Tem certeza que deseja remover esta marca? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBrandToDelete(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => {
                    if (brandToDelete) {
                      deleteProduct(brandToDelete);
                      // If this was the last product in the group, close modal
                      if (selectedGroup && groupedProducts[selectedGroup].length === 1) {
                        setSelectedGroup(null);
                      }
                      setBrandToDelete(null);
                    }
                  }}
                  className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  EXCLUIR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Adicionar */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Novo Produto</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Produto</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Ex: Arroz Integral"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Marca / Fornecedor</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={e => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Ex: Tio João"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoria</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fornecedor</label>
                      <select
                        value={formData.fornecedor_id}
                        onChange={e => setFormData({ ...formData, fornecedor_id: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preço (R$)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, price: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade</label>
                      <input
                        required
                        type="number"
                        value={formData.quantity}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, quantity: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medida</label>
                      <select
                        value={formData.unit}
                        onChange={e => setFormData({ ...formData, unit: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade por unidade</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.measureValue}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, measureValue: isNaN(val) ? 1 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        placeholder="Ex: 5 (para 5kg)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estoque Mínimo</label>
                      <input
                        required
                        type="number"
                        value={formData.minQuantity}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, minQuantity: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Consumo Diário</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.consumptionPerDay}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setFormData({ ...formData, consumptionPerDay: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                      Salvar Produto
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal Editar */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Editar Produto</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Produto</label>
                      <input
                        required
                        type="text"
                        value={editingProduct.name}
                        onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Marca / Fornecedor</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoria</label>
                      <select
                        value={editingProduct.category}
                        onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as Category })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fornecedor</label>
                      <select
                        value={editingProduct.fornecedor_id || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, fornecedor_id: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      >
                        <option value="">Selecione um fornecedor</option>
                        {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Preço (R$)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={editingProduct.price}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setEditingProduct({ ...editingProduct, price: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade</label>
                      <input
                        required
                        type="number"
                        value={editingProduct.quantity}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setEditingProduct({ ...editingProduct, quantity: isNaN(val) ? 0 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medida</label>
                      <select
                        disabled
                        value={editingProduct.unit}
                        className="w-full px-4 py-3 bg-gray-100 border border-gray-100 rounded-2xl outline-none cursor-not-allowed text-gray-500"
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quantidade por unidade</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={editingProduct.measureValue || 1}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setEditingProduct({ ...editingProduct, measureValue: isNaN(val) ? 1 : val });
                        }}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        const groupName = editingProduct.name;
                        setEditingProduct(null);
                        setSelectedGroup(groupName);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
