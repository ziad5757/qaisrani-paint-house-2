export interface PaintColor {
  name: string;
  code: string; // e.g., "1145", "8902"
}

export interface PaintSize {
  name: string; // "Quarter", "Gallon", "Drum"
  liters: string; // "0.91 L", "3.56 L", etc.
}

export interface PaintType {
  id: string;
  name: string;
  sizes: PaintSize[];
  colors: PaintColor[];
}

export interface StockItem {
  id: string;
  typeId: string;
  colorCode: string;
  sizeName: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  minStock: number;
}

export interface StockTransaction {
  id: string;
  stockItemId: string;
  type: 'in' | 'out' | 'sale';
  quantity: number;
  date: string;
  note: string;
  customerName?: string;
}

export interface InvoiceItem {
  typeId: string;
  typeName: string;
  colorName: string;
  colorCode: string;
  sizeName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  createdBy: string;
}

export type UserRole = 'manager' | 'editor';

export interface User {
  username: string;
  password: string;
  role: UserRole;
  name: string;
}
