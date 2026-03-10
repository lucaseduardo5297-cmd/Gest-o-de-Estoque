'use client';

import { useState, useEffect } from 'react';
import { Product, ShoppingItem, Supplier } from '@/types/inventory';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [spendingData, setSpendingData] = useState({
    weekly: { real: 0, medio: 0, meta: 1000 },
    monthly: { real: 0, medio: 0, meta: 4000 }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedProducts = localStorage.getItem('mercado_products');
      const savedShopping = localStorage.getItem('mercado_shopping');
      const savedSuppliers = localStorage.getItem('mercado_suppliers');
      const savedSpending = localStorage.getItem('mercado_spending');
      
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (e) {
          console.error('Failed to parse products', e);
        }
      }
      
      if (savedShopping) {
        try {
          setShoppingList(JSON.parse(savedShopping));
        } catch (e) {
          console.error('Failed to parse shopping list', e);
        }
      }

      if (savedSuppliers) {
        try {
          setSuppliers(JSON.parse(savedSuppliers));
        } catch (e) {
          console.error('Failed to parse suppliers', e);
        }
      }

      if (savedSpending) {
        try {
          setSpendingData(JSON.parse(savedSpending));
        } catch (e) {
          console.error('Failed to parse spending data', e);
        }
      }
      
      setIsLoaded(true);
    };

    loadData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('mercado_products', JSON.stringify(products));
      localStorage.setItem('mercado_shopping', JSON.stringify(shoppingList));
      localStorage.setItem('mercado_suppliers', JSON.stringify(suppliers));
      localStorage.setItem('mercado_spending', JSON.stringify(spendingData));
    }
  }, [products, shoppingList, suppliers, spendingData, isLoaded]);

  const addProduct = (product: Omit<Product, 'id' | 'addedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      purchaseHistory: [{
        id: crypto.randomUUID(),
        productId: '', // will be set below
        price: product.price,
        date: new Date().toISOString()
      }]
    };
    newProduct.purchaseHistory![0].productId = newProduct.id;
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const newPreviousPrice = updates.price !== undefined && updates.price !== p.price ? p.price : p.previousPrice;
        let newHistory = p.purchaseHistory || [];
        if (updates.price !== undefined && updates.price !== p.price) {
          newHistory = [...newHistory, {
            id: crypto.randomUUID(),
            productId: id,
            price: updates.price,
            date: new Date().toISOString()
          }].slice(-10); // keep last 10
        }
        return { ...p, ...updates, previousPrice: newPreviousPrice, purchaseHistory: newHistory };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    setShoppingList(shoppingList.filter(s => s.productId !== id));
  };

  const toggleShoppingItem = (productId: string) => {
    const existing = shoppingList.find(s => s.productId === productId);
    if (existing) {
      setShoppingList(shoppingList.filter(s => s.productId !== productId));
    } else {
      setShoppingList([...shoppingList, { productId, checked: false }]);
    }
  };

  const setCheckedShoppingItem = (productId: string, checked: boolean) => {
    setShoppingList(shoppingList.map(s => s.productId === productId ? { ...s, checked } : s));
  };

  const addSupplier = (name: string) => {
    const newSupplier: Supplier = {
      id: crypto.randomUUID(),
      name
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const finalizePurchase = () => {
    const checkedItems = shoppingList.filter(s => s.checked);
    const updatedProducts = products.map(p => {
      const shoppingItem = checkedItems.find(s => s.productId === p.id);
      if (shoppingItem) {
        // In a real app, we'd have the actual purchase data here.
        // For now, we'll assume the quantity was updated via the modal before finalizing.
        return p;
      }
      return p;
    });
    setProducts(updatedProducts);
    setShoppingList(shoppingList.filter(s => !s.checked));
  };

  return {
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
  };
}
