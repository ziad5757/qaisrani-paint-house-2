import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface RemoteStockItem {
  id: string;
  type_id: string;
  color_code: string;
  size_name: string;
  quantity: number;
  purchase_price: number;
  sale_price: number;
  min_stock: number;
}

export interface RemoteTransaction {
  id: string;
  stock_item_id: string;
  type: 'in' | 'out' | 'sale';
  quantity: number;
  note: string;
  customer_name?: string;
  created_at: string;
}

export interface RemoteInvoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_address?: string;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  created_by: string;
  created_at: string;
}

export const useOnline = () => isSupabaseConfigured();

export const onlineStock = {
  async getAll(): Promise<RemoteStockItem[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('stock_items').select('*').order('created_at');
    if (error) throw error;
    return data || [];
  },

  async upsert(item: Omit<RemoteStockItem, 'id' | 'created_at'> & { id?: string }) {
    if (!isSupabaseConfigured()) return;
    const { id, ...rest } = item;
    const { error } = await supabase.from('stock_items').upsert({
      ...rest,
      ...(id ? { id } : {}),
    });
    if (error) throw error;
  },

  async delete(id: string) {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('stock_items').delete().eq('id', id);
    if (error) throw error;
  },

  subscribe(callback: () => void) {
    if (!isSupabaseConfigured()) return () => {};
    const channel = supabase.channel('stock-changes').on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stock_items' },
      () => callback()
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  },
};

export const onlineTransactions = {
  async add(tx: Omit<RemoteTransaction, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('transactions').insert(tx);
    if (error) throw error;
  },

  async getAll(stockItemId: string): Promise<RemoteTransaction[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('transactions').select('*')
      .eq('stock_item_id', stockItemId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

export const onlineInvoices = {
  async add(inv: Omit<RemoteInvoice, 'id' | 'created_at'>) {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('invoices').insert(inv);
    if (error) throw error;
  },

  async getAll(): Promise<RemoteInvoice[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};

export const onlineUsers = {
  async authenticate(username: string, password: string) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('users').select('*')
      .eq('username', username).eq('password', password).maybeSingle();
    if (error) return null;
    return data;
  },
};
