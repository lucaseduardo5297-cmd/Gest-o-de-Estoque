'use client';

import { Home, Package, ShoppingCart, BarChart2, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import Logo from './Logo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const menuItems = [
  { id: 'principal', label: 'Principal', icon: Home },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'estoque-baixo', label: 'Estoque Baixo', icon: AlertTriangle },
  { id: 'compras', label: 'Compras', icon: ShoppingCart },
  { id: 'detalhamento', label: 'Detalhamento', icon: BarChart2 },
];

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center fixed top-0 left-0 z-50 px-6 md:px-12">
      <div className="flex items-center gap-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12">
            <Logo className="w-full h-full" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-black tracking-tight text-[#5D3D4C]">REDE SÊNIOR</h1>
            <p className="text-[8px] font-bold tracking-[0.2em] text-[#C5B49E] uppercase">Gestão de Estoque</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 ml-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "text-[#5D3D4C] font-bold" 
                    : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-[#5D3D4C]" : "text-gray-400 group-hover:text-gray-600")} />
                <span className="hidden md:block text-sm">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="active-nav-indicator"
                    className="absolute -bottom-6 left-0 right-0 h-1 bg-[#5D3D4C] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
