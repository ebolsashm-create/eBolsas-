import React, { useState } from 'react';
import { ShoppingBag, Zap, LayoutGrid, MessageSquare, Code2, Edit2, Check, RefreshCw } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cart,
    setIsCartOpen,
    configuracion,
    updateConfiguracion,
    alertasHumano,
    isSyncing,
    syncStatus,
    syncWithGoogleAppsScript,
  } = useCommerce();

  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(configuracion.Tasa_USD_VES.toString());

  const totalCartCount = cart.reduce((sum, it) => sum + it.cantidad, 0);
  const pendingAlertsCount = alertasHumano.filter((a) => !a.atendida).length;

  const handleSaveRate = () => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val > 0) {
      updateConfiguracion({ Tasa_USD_VES: val });
    }
    setIsEditingRate(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('catalogo')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-slate-800 transition-colors">
                IC
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-slate-900 text-sm tracking-tight block">
                  Inverza Commerce
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                  Notion Minimalist Suite
                </span>
              </div>
            </button>

            {/* Exchange Rate Widget */}
            <div className="ml-2 sm:ml-4 flex items-center bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-full px-2.5 py-1 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              {isEditingRate ? (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 font-mono">1$ =</span>
                  <input
                    type="number"
                    step="0.01"
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveRate()}
                    autoFocus
                    className="w-16 text-[11px] font-mono px-1 py-0.5 bg-white border border-slate-300 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                  <button
                    onClick={handleSaveRate}
                    className="text-slate-600 hover:text-emerald-600 p-0.5"
                    title="Guardar tasa"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTempRate(configuracion.Tasa_USD_VES.toString());
                    setIsEditingRate(true);
                  }}
                  className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-medium"
                  title="Clic para editar tasa de cambio USD/VES"
                >
                  <span className="text-slate-400 font-normal">Tasa:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    Bs. {configuracion.Tasa_USD_VES.toFixed(2)}
                  </span>
                  <Edit2 className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                </button>
              )}
            </div>

            {/* Sync Status Badge */}
            {configuracion.Google_Apps_Script_URL && (
              <button
                onClick={syncWithGoogleAppsScript}
                disabled={isSyncing}
                title="Sincronizar con Google Sheets"
                className="hidden md:flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-200/50 rounded-full px-2 py-0.5"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`} />
                <span>{syncStatus === 'synced' ? 'Sheets Conectado' : syncStatus === 'error' ? 'Error Sync' : 'Sync'}</span>
              </button>
            )}
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/50">
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'catalogo'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'pos'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>POS Caja</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Gestión</span>
            </button>

            <button
              onClick={() => setActiveTab('bot')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'bot'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Bot & Chats</span>
              {pendingAlertsCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('gas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'gas'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Apps Script</span>
            </button>
          </nav>

          {/* Right Action: Cart Drawer Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full min-w-4 text-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
