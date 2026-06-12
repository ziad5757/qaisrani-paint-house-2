import { useState, useRef } from 'react';
import { StockItem, InvoiceItem, Invoice } from '../types';
import { paintTypes, shopInfo } from '../data/paintTypes';
import { ArrowLeft, Plus, Trash2, Printer, X, Check, Download, Share2, MessageCircle, Mail } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceCreateProps {
  stock: StockItem[];
  onGoBack: () => void;
  onCreateInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'date'>) => Promise<Invoice> | Invoice;
  currentUserName: string;
}

export default function InvoiceCreate({ stock, onGoBack, onCreateInvoice, currentUserName }: InvoiceCreateProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showAddItem, setShowAddItem] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [selectedType, setSelectedType] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const getTypeName = (typeId: string) => paintTypes.find(t => t.id === typeId)?.name || typeId;
  const getColorName = (typeId: string, code: string) => paintTypes.find(t => t.id === typeId)?.colors.find(c => c.code === code)?.name || code;
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`;

  const availableStock = selectedType && selectedColor && selectedSize
    ? stock.find(s => s.typeId === selectedType && s.colorCode === selectedColor && s.sizeName === selectedSize)
    : null;

  const handleAddItem = () => {
    if (!availableStock || quantity <= 0) return;
    const newItem: InvoiceItem = {
      typeId: selectedType,
      typeName: getTypeName(selectedType),
      colorName: getColorName(selectedType, selectedColor),
      colorCode: selectedColor,
      sizeName: selectedSize,
      quantity,
      unitPrice: availableStock.salePrice,
      total: availableStock.salePrice * quantity,
    };
    setItems([...items, newItem]);
    setShowAddItem(false);
    setSelectedType('');
    setSelectedColor('');
    setSelectedSize('');
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.total, 0);
  const total = subtotal - discount;

  const handleCreateInvoice = async () => {
    if (!customerName || items.length === 0) return;
    const invoice = await onCreateInvoice({
      customerName,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      discount,
      total,
      createdBy: currentUserName,
    });
    setCreatedInvoice(invoice);
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = async (): Promise<Blob | null> => {
    if (!printRef.current) return null;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      return pdf.output('blob');
    } catch (error) {
      console.error('PDF generation failed:', error);
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    const pdfBlob = await generatePDF();
    if (pdfBlob && createdInvoice) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${createdInvoice.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleShareWhatsApp = async () => {
    if (!createdInvoice) return;
    const message = `*${shopInfo.name}*
📍 ${shopInfo.address}
📞 ${shopInfo.phone}

━━━━━━━━━━━━━━━
*INVOICE #${createdInvoice.invoiceNumber}*
Date: ${createdInvoice.date}
━━━━━━━━━━━━━━━

*Customer:* ${createdInvoice.customerName}
${createdInvoice.customerPhone ? `📞 ${createdInvoice.customerPhone}` : ''}

*Items:*
${createdInvoice.items.map((item, idx) => 
`${idx + 1}. ${item.typeName}
   ${item.colorName} (${item.colorCode})
   ${item.sizeName} x ${item.quantity}
   Rs. ${item.total.toLocaleString()}`
).join('\n\n')}

━━━━━━━━━━━━━━━
Subtotal: Rs. ${createdInvoice.subtotal.toLocaleString()}
${createdInvoice.discount > 0 ? `Discount: Rs. ${createdInvoice.discount.toLocaleString()}` : ''}
*TOTAL: Rs. ${createdInvoice.total.toLocaleString()}*
━━━━━━━━━━━━━━━

Thank you for your business! 
شکریہ`;

    const phoneNumber = createdInvoice.customerPhone?.replace(/[^0-9]/g, '') || '';
    const whatsappUrl = phoneNumber 
      ? `https://wa.me/92${phoneNumber.slice(-10)}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };

  const handleShareEmail = () => {
    if (!createdInvoice) return;
    const subject = `Invoice ${createdInvoice.invoiceNumber} - ${shopInfo.name}`;
    const body = `Dear ${createdInvoice.customerName},

Please find your invoice details below:

Invoice #: ${createdInvoice.invoiceNumber}
Date: ${createdInvoice.date}

Items:
${createdInvoice.items.map((item, idx) => 
`${idx + 1}. ${item.typeName} - ${item.colorName} (${item.colorCode}) - ${item.sizeName} x ${item.quantity} = Rs. ${item.total.toLocaleString()}`
).join('\n')}

Subtotal: Rs. ${createdInvoice.subtotal.toLocaleString()}
${createdInvoice.discount > 0 ? `Discount: Rs. ${createdInvoice.discount.toLocaleString()}` : ''}
Total: Rs. ${createdInvoice.total.toLocaleString()}

Thank you for your business!

${shopInfo.name}
${shopInfo.address}
Phone: ${shopInfo.phone}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareMenu(false);
  };

  // ===================== RENDER =====================
  if (createdInvoice) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <button onClick={onGoBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="bg-green-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isGeneratingPDF ? 'Generating...' : 'PDF'}
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowShareMenu(!showShareMenu)} 
                className="bg-blue-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" /> Share
              </button>
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                  <button onClick={handleShareWhatsApp} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">WhatsApp</span>
                  </button>
                  <button onClick={handleShareEmail} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-t border-gray-100">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </button>
                </div>
              )}
            </div>
            <button onClick={handlePrint} className="bg-gray-600 text-white px-3 py-2 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-gray-700">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Printable Invoice */}
        <div ref={printRef} className="bg-white rounded-xl border border-gray-200 p-6 print:border-none print:shadow-none print:p-4">
          {/* Header */}
          <div className="border-b-2 border-blue-800 pb-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <img src="/logo.png" alt="Ziad Qaisrani Traders" className="w-16 h-16 object-contain" />
                  <div>
                    <h1 className="text-xl font-bold text-blue-800">{shopInfo.name}</h1>
                    <p className="text-sm text-gray-600">{shopInfo.address}</p>
                    <p className="text-sm text-gray-600">📞 {shopInfo.phone}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-red-600">INVOICE</h2>
                <p className="text-sm text-gray-600">#{createdInvoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">{createdInvoice.date}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 mb-2">BILL TO:</h3>
            <p className="font-semibold text-gray-800">{createdInvoice.customerName}</p>
            {createdInvoice.customerPhone && <p className="text-sm text-gray-600">📞 {createdInvoice.customerPhone}</p>}
            {createdInvoice.customerAddress && <p className="text-sm text-gray-600"> {createdInvoice.customerAddress}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="text-left py-2 px-3 rounded-tl-lg">#</th>
                <th className="text-left py-2 px-3">Item</th>
                <th className="text-left py-2 px-3">Size</th>
                <th className="text-center py-2 px-3">Qty</th>
                <th className="text-right py-2 px-3">Rate</th>
                <th className="text-right py-2 px-3 rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody>
              {createdInvoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium text-gray-800">{item.typeName}</p>
                    <p className="text-xs text-gray-500">{item.colorName} ({item.colorCode})</p>
                  </td>
                  <td className="py-2 px-3 text-gray-600">{item.sizeName}</td>
                  <td className="py-2 px-3 text-center font-medium">{item.quantity}</td>
                  <td className="py-2 px-3 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                  <td className="py-2 px-3 text-right font-semibold">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(createdInvoice.subtotal)}</span>
              </div>
              {createdInvoice.discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100 text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(createdInvoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-blue-800 text-white rounded-lg px-3 mt-2">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold text-lg">{formatPrice(createdInvoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>Thank you for your business! • شکریہ</p>
            <p className="mt-1">Created by: {createdInvoice.createdBy}</p>
          </div>
        </div>
      </div>
    );
  }

  // ===================== CREATE FORM =====================
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={onGoBack} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Create Invoice</h1>
            <p className="text-white/70 text-xs">نیا بل بنائیں</p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Customer Details / گاہک کی تفصیلات</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Customer Name *</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="گاہک کا نام" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Phone (optional)</label>
              <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="03XX-XXXXXXX" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Address (optional)</label>
              <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="پتہ" className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Items / اشیاء</h3>
          <button onClick={() => setShowAddItem(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium hover:bg-blue-700">
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No items added yet</div>
        ) : (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{item.typeName}</p>
                  <p className="text-xs text-gray-500">{item.colorName} ({item.colorCode}) • {item.sizeName} • x{item.quantity}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-gray-800">{formatPrice(item.total)}</p>
                  <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Discount:</label>
              <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-32 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-right" />
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="font-bold text-xl text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            onClick={handleCreateInvoice}
            disabled={!customerName || items.length === 0}
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-blue-800 disabled:opacity-40"
          >
            <Check className="w-5 h-5" /> Create Invoice
          </button>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Add Item</h3>
              <button onClick={() => setShowAddItem(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Paint Type *</label>
                <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setSelectedColor(''); setSelectedSize(''); }} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm">
                  <option value="">Select Type</option>
                  {paintTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              {selectedType && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Color *</label>
                    <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm">
                      <option value="">Select Color</option>
                      {paintTypes.find(t => t.id === selectedType)?.colors.map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">Size *</label>
                    <select value={selectedSize} onChange={e => setSelectedSize(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm">
                      <option value="">Select Size</option>
                      {paintTypes.find(t => t.id === selectedType)?.sizes.map(s => (
                        <option key={s.name} value={s.name}>{s.name} ({s.liters})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {availableStock && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    ✓ Available: <strong>{availableStock.quantity}</strong> units @ <strong>{formatPrice(availableStock.salePrice)}</strong>
                  </p>
                </div>
              )}

              {selectedType && selectedColor && selectedSize && !availableStock && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">✗ Not in stock</p>
                </div>
              )}

              {availableStock && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Quantity *</label>
                  <input type="number" value={quantity} onChange={e => setQuantity(Math.min(Number(e.target.value), availableStock.quantity))} min="1" max={availableStock.quantity} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm" />
                </div>
              )}

              <button onClick={handleAddItem} disabled={!availableStock || quantity <= 0} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-40">
                Add to Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
