'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Eye, EyeOff, Calendar } from 'lucide-react';
import { Product, ShoppingItem, SpendingData } from '@/types/inventory';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { clsx } from 'clsx';

interface HomeViewProps {
  products: Product[];
  shoppingList: ShoppingItem[];
  spendingData: SpendingData;
  onNavigate: (tab: string) => void;
}

export default function HomeView({ products, shoppingList, spendingData, onNavigate }: HomeViewProps) {
  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('mensal');
  const [visibility, setVisibility] = useState({
    real: true,
    medio: true,
    meta: true
  });

  // Group products by name to match InventoryView logic
  const groupedProducts = products.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = [];
    acc[p.name].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const groupedEntries = Object.entries(groupedProducts);

  // Stats based on grouped products
  const totalItemsInStock = groupedEntries.filter(([_, items]) => {
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    return totalQty > 0;
  }).length;

  const lowStockItems = groupedEntries.filter(([_, items]) => {
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const minThreshold = items[0].minQuantity || 0;
    return totalQty <= minThreshold;
  }).length;

  // Forecast value: approximate value of current shopping list
  const forecastValue = shoppingList.reduce((acc, item) => {
    const product = products.find(p => p.id === item.productId);
    return acc + (product ? product.price : 0);
  }, 0);

  const currentSpending = viewMode === 'semanal' ? spendingData.weekly : spendingData.monthly;

  const chartData = [
    { name: 'Gastos', real: currentSpending.real, medio: currentSpending.medio, meta: currentSpending.meta }
  ];

  const stats = [
    {
      id: 'estoque',
      label: 'Itens em Estoque',
      value: totalItemsInStock,
      icon: Package,
      color: 'bg-[#5D3D4C]',
      textColor: 'text-[#5D3D4C]',
      bgLight: 'bg-[#5D3D4C]/10',
      desc: 'Produtos com saldo positivo'
    },
    {
      id: 'estoque-baixo',
      label: 'Estoque Baixo',
      value: lowStockItems,
      icon: AlertTriangle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgLight: 'bg-amber-50',
      desc: 'Itens abaixo do mínimo'
    },
    {
      id: 'compras',
      label: 'Lista de Compras',
      value: shoppingList.length,
      icon: ShoppingCart,
      color: 'bg-[#C5B49E]',
      textColor: 'text-[#C5B49E]',
      bgLight: 'bg-[#C5B49E]/10',
      desc: 'Itens marcados para compra'
    },
    {
      id: 'detalhamento',
      label: 'Previsão',
      value: `R$ ${forecastValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      desc: 'Valor estimado da lista atual'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold text-[#5D3D4C] tracking-tight">Bem-vindo</h2>
          <p className="text-gray-500 mt-1">Aqui está o resumo do seu estoque hoje.</p>
        </div>
        
        {lowStockItems > 0 && (
          <button 
            onClick={() => onNavigate('estoque-baixo')}
            className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 animate-pulse"
          >
            <AlertTriangle className="w-5 h-5" />
            Estoque Baixo ({lowStockItems})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Gastos e Orçamento</h3>
              <p className="text-sm text-gray-500">Acompanhamento financeiro</p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('semanal')}
                className={clsx(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'semanal' ? "bg-white text-[#5D3D4C] shadow-sm" : "text-gray-400"
                )}
              >
                SEMANAL
              </button>
              <button 
                onClick={() => setViewMode('mensal')}
                className={clsx(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'mensal' ? "bg-white text-[#5D3D4C] shadow-sm" : "text-gray-400"
                )}
              >
                MENSAL
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Real Gasto</span>
                <button onClick={() => setVisibility({...visibility, real: !visibility.real})}>
                  {visibility.real ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
              <p className="text-2xl font-black text-[#5D3D4C]">
                {visibility.real ? `R$ ${currentSpending.real.toFixed(2)}` : '••••••'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Média</span>
                <button onClick={() => setVisibility({...visibility, medio: !visibility.medio})}>
                  {visibility.medio ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
              <p className="text-2xl font-black text-[#C5B49E]">
                {visibility.medio ? `R$ ${currentSpending.medio.toFixed(2)}` : '••••••'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meta</span>
                <button onClick={() => setVisibility({...visibility, meta: !visibility.meta})}>
                  {visibility.meta ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
              <p className="text-2xl font-black text-gray-300">
                {visibility.meta ? `R$ ${currentSpending.meta.toFixed(2)}` : '••••••'}
              </p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                {visibility.real && <Bar dataKey="real" fill="#5D3D4C" radius={[8, 8, 0, 0]} barSize={40} />}
                {visibility.medio && <Bar dataKey="medio" fill="#C5B49E" radius={[8, 8, 0, 0]} barSize={40} />}
                {visibility.meta && <Bar dataKey="meta" fill="#e5e7eb" radius={[8, 8, 0, 0]} barSize={40} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {stats.map((stat, index) => (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate(stat.id)}
              className="w-full group bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-6"
            >
              <div className={stat.bgLight + " w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"}>
                <stat.icon className={stat.textColor + " w-7 h-7"} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</h3>
                <p className="text-[10px] text-gray-400 mt-1">{stat.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
