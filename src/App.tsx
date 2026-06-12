import { useState, useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { paintTypes, shopInfo } from './data/paintTypes';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PaintTypeView from './components/PaintTypeView';
import InvoiceCreate from './components/InvoiceCreate';
import Settings from './components/Settings';
import { LayoutDashboard, FileText, Settings as SettingsIcon, LogOut, User, History, Sun, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';

type Page = 'dashboard' | 'invoice' | 'invoices' | 'settings' | 'stock' | string;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const store = useStore();

  useEffect(() => {
    localStorage.setItem('dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  if (!store.currentUser) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className={darkMode ? 'bg-gray-900 min-h-screen' : ''}>
          <Login onLogin={store.login} />
        </div>
      </div>
    );
  }

  const isManager = store.currentUser.role === 'manager';
  const currentPaintType = currentPage.startsWith('type-') 
    ? paintTypes.find(t => t.id === currentPage.replace('type-', ''))
    : null;

  const navItems = [
    { key: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { key: 'invoice', label: 'Invoice', icon: <FileText className="w-5 h-5" /> },
    { key: 'invoices', label: 'History', icon: <History className="w-5 h-5" /> },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const handleRefresh = async () => {
  setIsRefreshing(true);
  
  // Supabase se live naya data khinchne ke liye yeh jor diya
  if (store.refreshData) {
    await store.refreshData();
  }
  
  setTimeout(() => {
    setRefreshKey(prev => prev + 1);
    setIsRefreshing(false);
  }, 500);
};

  const mainBg = darkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen';
  const textLight = darkMode ? 'text-gray-100' : 'text-gray-800';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';

  return (
    <div className={mainBg} key={refreshKey}>
      {/* Top Nav Bar */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 sticky top-0 z-40 shadow-lg print:hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 border border-blue-200">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain rounded-full" />
              </div>
              <div className="hidden sm:block">
                <h1 className={`font-bold text-white text-sm leading-tight`}>{shopInfo.name}</h1>
                <p className="text-[10px] text-blue-200 leading-tight">{shopInfo.phone}</p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setCurrentPage(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === item.key
                      ? 'bg-white/20 text-white'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Connection Status */}
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-blue-200 bg-white/10 rounded-full px-2 py-1 mr-1" title={store.online ? 'Online Mode - Data synced' : 'Offline Mode - Local only'}>
                {store.online ? <><Wifi className="w-3 h-3 text-green-300" /><span>Online</span></> : <><WifiOff className="w-3 h-3 text-yellow-300" /><span>Offline</span></>}
              </div>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Mobile Settings */}
              <button
                onClick={() => setCurrentPage('settings')}
                className="md:hidden text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>

              {/* User */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <User className="w-4 h-4 text-blue-200" />
                <div>
                  <p className="text-xs font-medium text-white">{store.currentUser.name}</p>
                  <p className="text-[10px] text-blue-200 capitalize">{store.currentUser.role}</p>
                </div>
              </div>

              <button
                onClick={store.logout}
                className="text-blue-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 z-40 shadow-lg print:hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="flex items-center justify-around py-1">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setCurrentPage(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors min-w-[3.5rem] ${
                currentPage === item.key ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8 ${textLight}`}>
        {currentPage === 'dashboard' && (
          <Dashboard
            stock={store.stock}
            getLowStockItems={store.getLowStockItems}
            getTotalStockValue={store.getTotalStockValue}
            getTotalPurchaseValue={store.getTotalPurchaseValue}
            onNavigate={setCurrentPage}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'invoice' && (
          <InvoiceCreate
            stock={store.stock}
            onGoBack={() => setCurrentPage('dashboard')}
            onCreateInvoice={store.createInvoice}
            currentUserName={store.currentUser.name}
          />
        )}

        {currentPage === 'invoices' && (
          <div className="space-y-4">
            <div className={`rounded-2xl p-5 text-white bg-gradient-to-r from-blue-700 to-blue-900`}>
              <h1 className="text-xl font-bold">Invoice History</h1>
              <p className="text-white/60 text-xs">پرانے بل دیکھیں</p>
            </div>
            {store.invoices.length === 0 ? (
              <div className={`rounded-xl border p-8 text-center ${cardBg}`}>
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-400'}>No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.invoices.map(inv => (
                  <div key={inv.id} className={`rounded-xl border p-4 flex items-center justify-between ${cardBg}`}>
                    <div>
                      <p className={`font-medium ${textLight}`}>{inv.customerName}</p>
                      <p className="text-xs text-gray-500">#{inv.invoiceNumber} • {inv.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">Rs. {inv.total.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{inv.items.length} items</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'settings' && (
          <Settings
            currentUser={store.currentUser}
            onGoBack={() => setCurrentPage('dashboard')}
            onLogout={store.logout}
            onUpdateUser={store.updateUser}
            darkMode={darkMode}
          />
        )}

        {currentPage === 'stock' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setCurrentPage('dashboard')} className="text-white/60 hover:text-white">
                  ← Back
                </button>
              </div>
              <h1 className="text-xl font-bold mt-2">All Stock Items</h1>
              <p className="text-white/60 text-xs">تمام اسٹاک دیکھیں</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {paintTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setCurrentPage(`type-${type.id}`)}
                  className={`rounded-xl border p-4 text-left hover:shadow-lg hover:border-blue-300 transition-all ${cardBg}`}
                >
                  <h3 className={`font-bold text-sm mb-1 ${textLight}`}>{type.name}</h3>
                  <p className="text-xs text-gray-400">{type.colors.length} colors</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.sizes.map(s => (
                      <span key={s.name} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.name}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentPaintType && (
          <PaintTypeView
            paintType={currentPaintType}
            stock={store.getStockByType(currentPaintType.id)}
            onGoBack={() => setCurrentPage('stock')}
            onAddOrUpdateStock={store.addOrUpdateStock}
            onAddTransaction={store.addTransaction}
            onDeleteStock={store.deleteStockItem}
            getStockTransactions={store.getStockTransactions}
            isManager={isManager}
            darkMode={darkMode}
          />
        )}
      </main>
    </div>
  );
}
