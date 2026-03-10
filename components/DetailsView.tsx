'use client';

import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Product } from '@/types/inventory';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface DetailsViewProps {
  products: Product[];
}

export default function DetailsView({ products }: DetailsViewProps) {
  // Group products by name
  const groupedProducts = products.reduce((acc, p) => {
    if (!acc[p.name]) acc[p.name] = [];
    acc[p.name].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  const groupedEntries = Object.entries(groupedProducts);

  const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.quantity || 0)), 0);
  const totalQuantity = products.reduce((acc, p) => acc + (p.quantity || 0), 0);
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  
  const lowStockCount = groupedEntries.filter(([_, items]) => {
    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const minThreshold = items[0].minQuantity || 0;
    return totalQty <= minThreshold;
  }).length;

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + ((p.price || 0) * (p.quantity || 0));
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: isNaN(value) ? 0 : value }));

  const stockLevelData = groupedEntries.map(([name, items]) => ({
    name: name,
    atual: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    min: items[0].minQuantity || 0
  })).sort((a, b) => {
    const ratioA = a.min === 0 ? (a.atual > 0 ? Infinity : 0) : a.atual / a.min;
    const ratioB = b.min === 0 ? (b.atual > 0 ? Infinity : 0) : b.atual / b.min;
    return ratioA - ratioB;
  }).slice(0, 10);

  const stats = [
    { label: 'Investimento Total', value: `R$ ${totalValue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Volume em Estoque', value: totalQuantity.toFixed(1), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Preço Médio Item', value: `R$ ${avgPrice.toFixed(2)}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Alertas de Estoque', value: lowStockCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Detalhamento e Análise</h2>
        <p className="text-gray-500">Visão aprofundada do seu patrimônio e consumo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className={stat.bg + " w-12 h-12 rounded-2xl flex items-center justify-center mb-4"}>
              <stat.icon className={stat.color + " w-6 h-6"} />
            </div>
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Valor por Categoria (R$)</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 12, 12, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Nível de Estoque vs Mínimo</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevelData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500, fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
                <Bar dataKey="atual" name="Estoque Atual" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="min" name="Estoque Mínimo" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Tabela Detalhada de Itens</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Produto</th>
                <th className="text-left py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Categoria</th>
                <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Qtd. Atual</th>
                <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Qtd. Mínima</th>
                <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Preço Médio</th>
                <th className="text-right py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groupedEntries.map(([name, items]) => {
                const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const minQty = items[0].minQuantity || 0;
                const avgPrice = items.reduce((sum, item) => sum + (item.price || 0), 0) / items.length;
                const totalVal = items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

                return (
                  <tr key={name} className="hover:bg-gray-50 transition-colors group">
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900">{name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{items.length} {items.length === 1 ? 'Marca' : 'Marcas'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{items[0].category}</span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900">{totalQty} {items[0].unit}</td>
                    <td className="py-4 px-4 text-right text-gray-500">{minQty} {items[0].unit}</td>
                    <td className="py-4 px-4 text-right text-gray-900 font-medium">R$ {avgPrice.toFixed(2)}</td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600">R$ {totalVal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
