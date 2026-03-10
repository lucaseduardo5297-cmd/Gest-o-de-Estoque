'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Sidebar from '@/components/Sidebar';
import HomeView from '@/components/HomeView';
import InventoryView from '@/components/InventoryView';
import ShoppingView from '@/components/ShoppingView';
import DetailsView from '@/components/DetailsView';
import LowStockView from '@/components/LowStockView';
import { useInventory } from '@/hooks/use-inventory';
import { Loader2 } from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('principal');
  const { 
    products, 
    shoppingList, 
    suppliers,
    addProduct, 
    updateProduct,
    deleteProduct, 
    toggleShoppingItem, 
    setCheckedShoppingItem,
    addSupplier,
    finalizePurchase,
    spendingData,
    isLoaded 
  } = useInventory();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFBF9]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-[#5D3D4C]" />
        </motion.div>
        <p className="mt-4 text-[#C5B49E] font-medium animate-pulse">Carregando seu estoque...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'principal':
        return <HomeView products={products} shoppingList={shoppingList} spendingData={spendingData} onNavigate={setActiveTab} />;
      case 'estoque':
        return (
          <InventoryView 
            products={products} 
            suppliers={suppliers}
            addProduct={addProduct} 
            updateProduct={updateProduct}
            deleteProduct={deleteProduct} 
            toggleShoppingItem={toggleShoppingItem}
            shoppingList={shoppingList}
            addSupplier={addSupplier}
          />
        );
      case 'estoque-baixo':
        return (
          <LowStockView 
            products={products} 
            shoppingList={shoppingList} 
            suppliers={suppliers}
            toggleShoppingItem={toggleShoppingItem}
            onNavigate={setActiveTab}
            updateProduct={updateProduct}
          />
        );
      case 'compras':
        return (
          <ShoppingView 
            products={products} 
            shoppingList={shoppingList} 
            suppliers={suppliers}
            toggleShoppingItem={toggleShoppingItem}
            setCheckedShoppingItem={setCheckedShoppingItem}
            updateProduct={updateProduct}
            addProduct={addProduct}
            onNavigate={setActiveTab}
            finalizePurchase={finalizePurchase}
          />
        );
      case 'detalhamento':
        return <DetailsView products={products} />;
      default:
        return <HomeView products={products} shoppingList={shoppingList} spendingData={spendingData} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-[#5D3D4C]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-[#C5B49E]/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
