import { StockItem } from '../types';
import { paintTypes, shopInfo } from '../data/paintTypes';
import { Package, TrendingUp, AlertTriangle, DollarSign, ShoppingCart, FileText } from 'lucide-react';

interface DashboardProps {
  stock: StockItem[];
  getLowStockItems: () => StockItem[];
  getTotalStockValue: () => number;
  getTotalPurchaseValue: () => number;
  onNavigate: (page: string) => void;
  darkMode?: boolean;
}

export default function Dashboard({
  stock,
  getLowStockItems,
  getTotalStockValue,
  getTotalPurchaseValue,
  onNavigate,
  darkMode = false,
}: DashboardProps) {
  void darkMode;
  const lowStock = getLowStockItems();
  const totalValue = getTotalStockValue();
  const purchaseValue = getTotalPurchaseValue();
  const totalProfit = totalValue - purchaseValue;
  const totalItems = stock.reduce((sum, s) => sum + s.quantity, 0);

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`;

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Logo */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-red-600 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 p-1 border-2 border-blue-200">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">{shopInfo.name}</h1>
              <p className="text-white/70 text-xs">{shopInfo.address}</p>
            </div>
          </div>
          <p className="text-white/80 text-sm">📞 {shopInfo.phone}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('invoice')}
          className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl flex items-center gap-3 hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
        >
          <FileText className="w-8 h-8" />
          <div className="text-left">
            <p className="font-bold">Create Invoice</p>
            <p className="text-xs text-white/80">نیا بل بنائیں</p>
          </div>
        </button>
        <button
          onClick={() => onNavigate('stock')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl flex items-center gap-3 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
        >
          <Package className="w-8 h-8" />
          <div className="text-left">
            <p className="font-bold">Manage Stock</p>
            <p className="text-xs text-white/80">اسٹاک مینیج کریں</p>
          </div>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stock.length}</p>
          <p className="text-xs text-gray-500 mt-1">Stock Items</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">Total Units</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-800">{formatPrice(totalValue)}</p>
          <p className="text-xs text-gray-500 mt-1">Sale Value</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-green-600">{formatPrice(totalProfit)}</p>
          <p className="text-xs text-gray-500 mt-1">Expected Profit</p>
        </div>
      </div>

      {/* Paint Types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📦 Paint Types / پینٹ کی اقسام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paintTypes.map(type => {
            const typeStock = stock.filter(s => s.typeId === type.id);
            const typeQty = typeStock.reduce((sum, s) => sum + s.quantity, 0);
            const typeValue = typeStock.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);

            return (
              <button
                key={type.id}
                onClick={() => onNavigate(`type-${type.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-lg hover:border-blue-300 transition-all"
              >
                <h3 className="font-bold text-gray-800 text-sm mb-1">{type.name}</h3>
                <p className="text-xs text-gray-400 mb-2">
                  {type.colors.length} colors • {type.sizes.map(s => s.name).join(', ')}
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Stock: <strong className="text-gray-800">{typeQty}</strong></span>
                  <span className="font-semibold text-blue-600">{formatPrice(typeValue)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-700">
              ⚠️ Low Stock Alert! ({lowStock.length} items)
            </h2>
          </div>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map(item => (
              <div key={item.id} className="bg-white rounded-lg p-3 flex items-center justify-between border border-red-100">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{paintTypes.find(t => t.id === item.typeId)?.name || item.typeId}</p>
                  <p className="text-xs text-gray-500">
                    {paintTypes.find(t => t.id === item.typeId)?.colors.find(c => c.code === item.colorCode)?.name || item.colorCode} ({item.colorCode}) • {item.sizeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-red-600 font-bold">{item.quantity} left</p>
                  <p className="text-xs text-gray-400">Min: {item.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
