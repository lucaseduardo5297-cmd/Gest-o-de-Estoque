export type Category = 'Alimentos' | 'Carnes' | 'Hortifruti' | 'Limpeza' | 'Higiene' | 'Bebidas' | 'Outros';

export interface Supplier {
  id: string;
  name: string;
}

export interface PurchaseHistory {
  id: string;
  productId: string;
  price: number;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: Category;
  fornecedor_id?: string;
  price: number;
  previousPrice?: number;
  quantity: number;
  unit: 'un' | 'kg' | 'g' | 'l' | 'ml';
  measureValue: number;
  minQuantity: number;
  lastPurchaseDate: string;
  consumptionPerDay: number; // estimated
  addedAt: string;
  purchaseHistory?: PurchaseHistory[];
}

export interface ShoppingItem {
  productId: string;
  checked: boolean;
}

export interface SpendingData {
  weekly: { real: number; medio: number; meta: number };
  monthly: { real: number; medio: number; meta: number };
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  categoryDistribution: { name: string; value: number }[];
  forecastValue: number;
}
