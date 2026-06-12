import { useState, useEffect, useCallback } from 'react';
import { StockItem, StockTransaction, Invoice, User } from '../types';
import { defaultUsers } from '../data/paintTypes';
import { isSupabaseConfigured } from '../lib/supabase';
import { onlineStock, onlineTransactions, onlineInvoices, onlineUsers } from './useDataSync';

const STOCK_KEY = 'qaisrani_stock_v1';
const TRANSACTIONS_KEY = 'qaisrani_transactions_v1';
const INVOICES_KEY = 'qaisrani_invoices_v1';
const USERS_KEY = 'qaisrani_users_v1';
const AUTH_KEY = 'qaisrani_auth_v1';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    return fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function toLocalStock(remote: any): StockItem {
  return {
    id: remote.id,
    typeId: remote.type_id,
    colorCode: remote.color_code,
    sizeName: remote.size_name,
    quantity: remote.quantity || 0,
    purchasePrice: Number(remote.purchase_price) || 0,
    salePrice: Number(remote.sale_price) || 0,
    minStock: remote.min_stock || 5,
  };
}

function toRemoteStock(local: Omit<StockItem, 'id'> & { id?: string }) {
  return {
    ...(local.id ? { id: local.id } : {}),
    type_id: local.typeId,
    color_code: local.colorCode,
    size_name: local.sizeName,
    quantity: local.quantity,
    purchase_price: local.purchasePrice,
    sale_price: local.salePrice,
    min_stock: local.minStock,
  };
}

export function useStore() {
  const online = isSupabaseConfigured();
  const [stock, setStock] = useState<StockItem[]>(() => loadFromStorage(STOCK_KEY, []));
  const [transactions, setTransactions] = useState<StockTransaction[]>(() => loadFromStorage(TRANSACTIONS_KEY, []));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage(INVOICES_KEY, []));
  const [users] = useState<User[]>(() => loadFromStorage(USERS_KEY, defaultUsers));
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage(AUTH_KEY, null));

  useEffect(() => { saveToStorage(STOCK_KEY, stock); }, [stock]);
  useEffect(() => { saveToStorage(TRANSACTIONS_KEY, transactions); }, [transactions]);
  useEffect(() => { saveToStorage(INVOICES_KEY, invoices); }, [invoices]);
  useEffect(() => { saveToStorage(USERS_KEY, users); }, [users]);
  useEffect(() => { saveToStorage(AUTH_KEY, currentUser); }, [currentUser]);

  // Load from Supabase on mount (if configured)
  useEffect(() => {
    if (!online) return;
    onlineStock.getAll().then(items => {
      if (items.length > 0) {
        setStock(items.map(toLocalStock));
      }
    }).catch(console.error);
    onlineInvoices.getAll().then(remoteInvoices => {
      if (remoteInvoices.length > 0) {
        setInvoices(remoteInvoices.map((inv: any) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          date: inv.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          customerName: inv.customer_name,
          customerPhone: inv.customer_phone,
          customerAddress: inv.customer_address,
          items: inv.items,
          subtotal: Number(inv.subtotal),
          discount: Number(inv.discount),
          total: Number(inv.total),
          createdBy: inv.created_by,
        })));
      }
    }).catch(console.error);
    // Subscribe to real-time changes
    const unsubscribe = onlineStock.subscribe(async () => {
      const items = await onlineStock.getAll();
      if (items.length > 0) setStock(items.map(toLocalStock));
    });
    return unsubscribe;
  }, [online]);

  // Auth
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    let user: User | null = null;

    // Try online auth first
    if (online) {
      const remoteUser = await onlineUsers.authenticate(username, password).catch(() => null);
      if (remoteUser) {
        user = { username: remoteUser.username, password: remoteUser.password, role: remoteUser.role, name: remoteUser.name };
      }
    }
    
    // Fallback to local
    if (!user) {
      user = users.find(u => u.username === username && u.password === password) || null;
    }

    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users, online]);

  const logout = useCallback(() => setCurrentUser(null), []);

  const updateUser = useCallback((username: string, updates: Partial<User>) => {
    // For now, just update local auth
    if (currentUser?.username === username) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
    }
  }, [currentUser]);

  // Stock
  const getStockItem = useCallback((typeId: string, colorCode: string, sizeName: string) => {
    return stock.find(s => s.typeId === typeId && s.colorCode === colorCode && s.sizeName === sizeName);
  }, [stock]);

  const addOrUpdateStock = useCallback(async (item: Omit<StockItem, 'id'>) => {
    const existing = stock.find(s => s.typeId === item.typeId && s.colorCode === item.colorCode && s.sizeName === item.sizeName);
    
    if (existing) {
      const updated = { ...existing, ...item };
      setStock(prev => prev.map(s => s.id === existing.id ? updated : s));
      if (online) {
        await onlineStock.upsert(toRemoteStock({ ...updated })).catch(console.error);
      }
    } else {
      const newItem: StockItem = { ...item, id: Date.now().toString() };
      setStock(prev => [...prev, newItem]);
      if (online) {
        await onlineStock.upsert(toRemoteStock({ ...item })).catch(console.error);
      }
    }
  }, [stock, online]);

  const deleteStockItem = useCallback(async (stockItemId: string) => {
    setStock(prev => prev.filter(s => s.id !== stockItemId));
    if (online) {
      await onlineStock.delete(stockItemId).catch(console.error);
    }
  }, [online]);

  // Transactions
  const addTransaction = useCallback(async (tx: Omit<StockTransaction, 'id' | 'date'>) => {
    const newTx: StockTransaction = {
      ...tx,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
    };
    setTransactions(prev => [newTx, ...prev]);

    // Update local stock
    setStock(prev => prev.map(s => {
      if (s.id === tx.stockItemId) {
        const newQty = tx.type === 'in'
          ? s.quantity + tx.quantity
          : Math.max(0, s.quantity - tx.quantity);
        if (online) {
          onlineStock.upsert(toRemoteStock({ ...s, quantity: newQty, id: s.id })).catch(console.error);
        }
        return { ...s, quantity: newQty };
      }
      return s;
    }));

    // Sync to online
    if (online) {
      await onlineTransactions.add({
        stock_item_id: tx.stockItemId,
        type: tx.type,
        quantity: tx.quantity,
        note: tx.note,
        customer_name: tx.customerName,
      }).catch(console.error);
    }
  }, [stock, online]);

  const getStockTransactions = useCallback((stockItemId: string) => {
    return transactions.filter(t => t.stockItemId === stockItemId);
  }, [transactions]);

  // Invoices
  const createInvoice = useCallback(async (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
    const newInvoice: Invoice = {
      ...inv,
      id: Date.now().toString(),
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // Deduct stock locally
    inv.items.forEach(item => {
      const stockItem = stock.find(s =>
        s.typeId === item.typeId && s.colorCode === item.colorCode && s.sizeName === item.sizeName
      );
      if (stockItem) {
        const newQty = Math.max(0, stockItem.quantity - item.quantity);
        setStock(prev => prev.map(s => s.id === stockItem.id ? { ...s, quantity: newQty } : s));
        
        // Transaction
        const newTx: StockTransaction = {
          id: `tx-${Date.now()}-${Math.random()}`,
          stockItemId: stockItem.id,
          type: 'sale',
          quantity: item.quantity,
          note: `Invoice: ${invoiceNumber}`,
          customerName: inv.customerName,
          date: new Date().toISOString().split('T')[0],
        };
        setTransactions(prev => [newTx, ...prev]);

        if (online) {
          onlineStock.upsert(toRemoteStock({ ...stockItem, quantity: newQty, id: stockItem.id })).catch(console.error);
          onlineTransactions.add({
            stock_item_id: stockItem.id,
            type: 'sale',
            quantity: item.quantity,
            note: `Invoice: ${invoiceNumber}`,
            customer_name: inv.customerName,
          }).catch(console.error);
        }
      }
    });

    if (online) {
      await onlineInvoices.add({
        invoice_number: invoiceNumber,
        customer_name: inv.customerName,
        customer_phone: inv.customerPhone,
        customer_address: inv.customerAddress,
        items: inv.items,
        subtotal: inv.subtotal,
        discount: inv.discount,
        total: inv.total,
        created_by: inv.createdBy,
      }).catch(console.error);
    }

    return newInvoice;
  }, [stock, online]);

  // Stats
  const getTotalStockValue = useCallback(() => stock.reduce((sum, s) => sum + s.salePrice * s.quantity, 0), [stock]);
  const getTotalPurchaseValue = useCallback(() => stock.reduce((sum, s) => sum + s.purchasePrice * s.quantity, 0), [stock]);
  const getLowStockItems = useCallback(() => stock.filter(s => s.quantity > 0 && s.quantity <= s.minStock), [stock]);
  const getStockByType = useCallback((typeId: string) => stock.filter(s => s.typeId === typeId), [stock]);

  return {
    currentUser,
    online,
    stock,
    invoices,
    login,
    logout,
    updateUser,
    getStockItem,
    addOrUpdateStock,
    deleteStockItem,
    transactions,
    addTransaction,
    getStockTransactions,
    createInvoice,
    getTotalStockValue,
    getTotalPurchaseValue,
    getLowStockItems,
    getStockByType,
  };
}
