import { useState } from 'react';
import { PaintType, StockItem, StockTransaction } from '../types';
import { Plus, Minus, ArrowLeft, Search, Edit3, Trash2, History, X, Save, Package } from 'lucide-react';

interface PaintTypeViewProps {
  paintType: PaintType;
  stock: StockItem[];
  onGoBack: () => void;
  onAddOrUpdateStock: (item: Omit<StockItem, 'id'>) => void;
  onAddTransaction: (tx: Omit<StockTransaction, 'id' | 'date'>) => void;
  onDeleteStock: (id: string) => void;
  getStockTransactions: (stockItemId: string) => StockTransaction[];
  isManager: boolean;
  darkMode?: boolean;
}

export default function PaintTypeView({
  paintType,
  stock,
  onGoBack,
  onAddOrUpdateStock,
  onAddTransaction,
  onDeleteStock,
  getStockTransactions,
  isManager,
  darkMode = false,
}: PaintTypeViewProps) {
  void darkMode;
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | null>(null);
  const [stockModal, setStockModal] = useState<{ item: StockItem; type: 'in' | 'out' } | null>(null);
  const [historyModal, setHistoryModal] = useState<StockItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StockItem | null>(null);

  const [formData, setFormData] = useState({
    colorCode: '',
    sizeName: '',
    quantity: '',
    purchasePrice: '',
    salePrice: '',
    minStock: '5',
  });

  const [stockQty, setStockQty] = useState('');
  const [stockNote, setStockNote] = useState('');

  const typeStock = stock.filter(s => s.typeId === paintType.id);
  const totalQty = typeStock.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = typeStock.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);

  const filteredStock = typeStock.filter(s => {
    const color = paintType.colors.find(c => c.code === s.colorCode);
    const searchLower = search.toLowerCase();
    return (
      color?.name.toLowerCase().includes(searchLower) ||
      s.colorCode.includes(search) ||
      s.sizeName.toLowerCase().includes(searchLower)
    );
  });

  const getColorName = (code: string) => paintType.colors.find(c => c.code === code)?.name || code;
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`;

  const handleAddStock = () => {
    if (!formData.colorCode || !formData.sizeName) return;
    onAddOrUpdateStock({
      typeId: paintType.id,
      colorCode: formData.colorCode,
      sizeName: formData.sizeName,
      quantity: Number(formData.quantity) || 0,
      purchasePrice: Number(formData.purchasePrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      minStock: Number(formData.minStock) || 5,
    });
    setFormData({ colorCode: '', sizeName: '', quantity: '', purchasePrice: '', salePrice: '', minStock: '5' });
    setShowAddModal(false);
  };

  const handleEditStock = () => {
    if (!editItem) return;
    onAddOrUpdateStock({
      typeId: paintType.id,
      colorCode: editItem.colorCode,
      sizeName: editItem.sizeName,
      quantity: editItem.quantity,
      purchasePrice: editItem.purchasePrice,
      salePrice: editItem.salePrice,
      minStock: editItem.minStock,
    });
    setEditItem(null);
  };

  const handleStockTransaction = () => {
    if (!stockModal || !stockQty) return;
    onAddTransaction({
      stockItemId: stockModal.item.id,
      type: stockModal.type,
      quantity: Number(stockQty),
      note: stockNote,
    });
    setStockModal(null);
    setStockQty('');
    setStockNote('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onGoBack} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold">{paintType.name}</h1>
            <p className="text-white/60 text-xs">{paintType.colors.length} colors available</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {paintType.sizes.map(size => (
            <span key={size.name} className="bg-white/20 px-3 py-1 rounded-full text-xs">
              {size.name}: {size.liters}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/15 rounded-lg p-3 text-center">
            <p className="text-xl font-bold">{totalQty}</p>
            <p className="text-xs text-white/70">Total Stock</p>
          </div>
          <div className="bg-white/15 rounded-lg p-3 text-center">
            <p className="text-lg font-bold">{formatPrice(totalValue)}</p>
            <p className="text-xs text-white/70">Value</p>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search color or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          />
        </div>
        {isManager && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Add Stock</span>
          </button>
        )}
      </div>

      {/* Stock List */}
      {filteredStock.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No stock items found</p>
          {isManager && (
            <button onClick={() => setShowAddModal(true)} className="mt-4 text-blue-600 text-sm font-medium hover:underline">
              + Add first stock item
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStock.map(item => {
            const isLow = item.quantity > 0 && item.quantity <= item.minStock;
            return (
              <div key={item.id} className={`bg-white rounded-xl border ${isLow ? 'border-red-200' : 'border-gray-100'} p-4 shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{getColorName(item.colorCode)}</h3>
                      {isLow && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Low!</span>}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Code: {item.colorCode}</span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{item.sizeName}</span>
                    </div>
                  </div>
                  <div className={`text-right px-3 py-1 rounded-lg ${isLow ? 'bg-red-50' : 'bg-green-50'}`}>
                    <p className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>{item.quantity}</p>
                    <p className="text-xs text-gray-400">units</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">Purchase</p>
                    <p className="font-semibold text-gray-700">{formatPrice(item.purchasePrice)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-blue-400">Sale</p>
                    <p className="font-semibold text-blue-700">{formatPrice(item.salePrice)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-green-400">Profit</p>
                    <p className="font-semibold text-green-700">{formatPrice(item.salePrice - item.purchasePrice)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 flex-wrap">
                  <button onClick={() => setStockModal({ item, type: 'in' })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium">
                    <Plus className="w-3 h-3" /> Stock In
                  </button>
                  <button onClick={() => setStockModal({ item, type: 'out' })} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium">
                    <Minus className="w-3 h-3" /> Stock Out
                  </button>
                  <button onClick={() => setHistoryModal(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 text-xs font-medium">
                    <History className="w-3 h-3" /> History
                  </button>
                  <div className="flex-1" />
                  {isManager && (
                    <>
                      <button onClick={() => setEditItem(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => setDeleteConfirm(item)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">➕ Add Stock Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Color *</label>
                <select
                  value={formData.colorCode}
                  onChange={e => setFormData(f => ({ ...f, colorCode: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  <option value="">Select Color</option>
                  {paintType.colors.map(c => (
                    <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Size *</label>
                <select
                  value={formData.sizeName}
                  onChange={e => setFormData(f => ({ ...f, sizeName: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                >
                  <option value="">Select Size</option>
                  {paintType.sizes.map(s => (
                    <option key={s.name} value={s.name}>{s.name} ({s.liters})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Purchase Price (Rs.) *</label>
                  <input type="number" value={formData.purchasePrice} onChange={e => setFormData(f => ({ ...f, purchasePrice: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Sale Price (Rs.) *</label>
                  <input type="number" value={formData.salePrice} onChange={e => setFormData(f => ({ ...f, salePrice: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Initial Quantity</label>
                  <input type="number" value={formData.quantity} onChange={e => setFormData(f => ({ ...f, quantity: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Min Stock Alert</label>
                  <input type="number" value={formData.minStock} onChange={e => setFormData(f => ({ ...f, minStock: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
              </div>
              <button onClick={handleAddStock} disabled={!formData.colorCode || !formData.sizeName} className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-40 font-medium text-sm">
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">✏️ Edit Stock</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{getColorName(editItem.colorCode)}</p>
                <p className="text-xs text-gray-500">Code: {editItem.colorCode} • {editItem.sizeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Purchase Price</label>
                  <input type="number" value={editItem.purchasePrice} onChange={e => setEditItem({ ...editItem, purchasePrice: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Sale Price</label>
                  <input type="number" value={editItem.salePrice} onChange={e => setEditItem({ ...editItem, salePrice: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Min Stock Alert</label>
                <input type="number" value={editItem.minStock} onChange={e => setEditItem({ ...editItem, minStock: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
              </div>
              <button onClick={handleEditStock} className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock In/Out Modal */}
      {stockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">
                {stockModal.type === 'in' ? '📦 Stock In' : '📤 Stock Out'}
              </h3>
              <button onClick={() => { setStockModal(null); setStockQty(''); setStockNote(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-800">{getColorName(stockModal.item.colorCode)}</p>
              <p className="text-xs text-gray-500">Current: {stockModal.item.quantity} units</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Quantity *</label>
                <input type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} className="w-full mt-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" min="1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Note (optional)</label>
                <input type="text" value={stockNote} onChange={e => setStockNote(e.target.value)} placeholder="e.g., New shipment" className="w-full mt-1 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
              </div>
              <button onClick={handleStockTransaction} disabled={!stockQty || Number(stockQty) <= 0} className={`w-full py-2.5 rounded-xl text-white font-medium text-sm disabled:opacity-40 ${stockModal.type === 'in' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {stockModal.type === 'in' ? 'Add Stock' : 'Remove Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">📋 History</h3>
              <button onClick={() => setHistoryModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="font-medium text-gray-800">{getColorName(historyModal.colorCode)}</p>
              <p className="text-xs text-gray-500">Code: {historyModal.colorCode} • {historyModal.sizeName}</p>
            </div>
            {(() => {
              const txns = getStockTransactions(historyModal.id);
              return txns.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {txns.map(t => (
                    <div key={t.id} className={`p-3 rounded-lg border ${t.type === 'in' ? 'bg-green-50 border-green-100' : t.type === 'sale' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium text-sm ${t.type === 'in' ? 'text-green-700' : t.type === 'sale' ? 'text-blue-700' : 'text-red-700'}`}>
                          {t.type === 'in' ? '+' : '-'}{t.quantity} • {t.type === 'sale' ? 'Sale' : t.type === 'in' ? 'Stock In' : 'Stock Out'}
                        </span>
                        <span className="text-xs text-gray-400">{t.date}</span>
                      </div>
                      {t.note && <p className="text-xs text-gray-500 mt-1">{t.note}</p>}
                      {t.customerName && <p className="text-xs text-gray-500 mt-0.5">Customer: {t.customerName}</p>}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Stock?</h3>
            <p className="text-sm text-gray-500 mb-5">Kya aap "{getColorName(deleteConfirm.colorCode)}" stock delete karna chahtay hain?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button onClick={() => { onDeleteStock(deleteConfirm.id); setDeleteConfirm(null); }} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
