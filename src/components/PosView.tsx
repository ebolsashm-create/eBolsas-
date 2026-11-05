import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  Share2,
  X,
  CreditCard,
  DollarSign,
  Smartphone,
  Coins,
  Receipt,
  User,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Producto, Venta, DetalleVentaItem } from '../types';

export const PosView: React.FC = () => {
  const {
    productos,
    existencia,
    cuentas,
    configuracion,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotalUSD,
    cartTotalVES,
    processSale,
    getStockForProduct,
  } = useCommerce();

  const [searchTerm, setSearchTerm] = useState('');
  const [clienteNombre, setClienteNombre] = useState('Cliente Mostrador');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [selectedCuenta, setSelectedCuenta] = useState<string>(cuentas[1]?.Nombre || cuentas[0]?.Nombre || 'Pago Móvil BNC Principal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedSale, setCompletedSale] = useState<Venta | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filtered search results
  const searchResults = searchTerm.trim()
    ? productos.filter(
        (p) =>
          p['Activo (sí/no)'] === 'sí' &&
          (p.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.SKU.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p['Código de barras'].includes(searchTerm.trim()))
      )
    : productos.slice(0, 6);

  // Handle enter key in search input: if exact barcode match or 1 result, add immediately
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmed = searchTerm.trim();
      const exactBarcode = productos.find((p) => p['Código de barras'] === trimmed);
      if (exactBarcode) {
        addToCart(exactBarcode, 1);
        setSearchTerm('');
        return;
      }
      if (searchResults.length === 1) {
        addToCart(searchResults[0], 1);
        setSearchTerm('');
      }
    }
  };

  const handleQuickBarcode = (barcode: string) => {
    const prod = productos.find((p) => p['Código de barras'] === barcode);
    if (prod) {
      addToCart(prod, 1);
    }
  };

  const handleCobro = async () => {
    setErrorMsg('');
    if (cart.length === 0) {
      setErrorMsg('Selecciona al menos un producto para cobrar');
      return;
    }

    setIsProcessing(true);
    const clientDesc = `${clienteNombre}${clienteTelefono ? ` (${clienteTelefono})` : ''}`;
    const res = await processSale(clientDesc, selectedCuenta);
    setIsProcessing(false);

    if (res.success && res.sale) {
      setCompletedSale(res.sale);
      setSearchTerm('');
      searchInputRef.current?.focus();
    } else {
      setErrorMsg(res.error || 'Error al procesar la venta');
    }
  };

  const getMethodIcon = (nombre: string) => {
    if (nombre.toLowerCase().includes('bnc')) return <CreditCard className="w-4 h-4 text-sky-600" />;
    if (nombre.toLowerCase().includes('pago móvil') || nombre.toLowerCase().includes('móvil')) return <Smartphone className="w-4 h-4 text-emerald-600" />;
    if (nombre.toLowerCase().includes('crixto') || nombre.toLowerCase().includes('cripto') || nombre.toLowerCase().includes('usdt')) return <Coins className="w-4 h-4 text-amber-500" />;
    return <DollarSign className="w-4 h-4 text-slate-700" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Terminal Punto de Venta (POS)</span>
            <span className="px-2 py-0.5 text-[10px] bg-slate-900 text-white rounded-md font-mono">Caja Rápida</span>
          </h1>
          <p className="text-xs text-slate-500">
            Escaneo de código de barras, cobro multimoneda y deducción atómica de inventario.
          </p>
        </div>

        {/* Barcode Test Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Barcode className="w-3.5 h-3.5" /> Demo Scanner:
          </span>
          <button
            onClick={() => handleQuickBarcode('7591001000123')}
            className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-mono text-slate-700 transition-colors"
          >
            + Café San Pedro
          </button>
          <button
            onClick={() => handleQuickBarcode('7591001000456')}
            className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-mono text-slate-700 transition-colors"
          >
            + Aceite Oliva
          </button>
          <button
            onClick={() => handleQuickBarcode('7591001000912')}
            className="px-2 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-mono text-slate-700 transition-colors"
          >
            + Chocolate 70%
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Predictive Catalog */}
        <div className="lg:col-span-7 space-y-4">
          {/* Predictive Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por texto o escanear código de barras (presiona Enter)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Result Items */}
          <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {searchTerm ? 'Resultados predictivos' : 'Artículos sugeridos para caja rápida'}
              </span>
              <span className="text-[11px] text-slate-400">{searchResults.length} items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
              {searchResults.map((prod) => {
                const stock = getStockForProduct(prod.SKU);
                const isOutOfStock = prod['Controlar inventario (sí/no)'] === 'sí' && stock <= 0;

                return (
                  <div
                    key={prod.id}
                    onClick={() => !isOutOfStock && addToCart(prod, 1)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 transition-all ${
                      isOutOfStock
                        ? 'opacity-40 bg-slate-50 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50/80 hover:border-slate-200 cursor-pointer active:scale-98'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.Imagen_URL}
                        alt={prod.Nombre}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{prod.Nombre}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>${prod['Precio (USD)'].toFixed(2)}</span>
                          <span>•</span>
                          <span className={stock <= prod['Stock mínimo'] ? 'text-amber-600 font-bold' : ''}>
                            Stock: {stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors shrink-0 ml-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active POS Order Ticket & Payment Selection */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Ticket de Venta en Curso</h3>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
              >
                Limpiar ticket
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Cart Table / Items */}
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs">No hay productos en la caja rápida.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Usa el buscador o presiona los botones de demo arriba.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const subUSD = item.producto['Precio (USD)'] * item.cantidad;
                return (
                  <div
                    key={item.producto.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-slate-800 truncate">{item.producto.Nombre}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        ${item.producto['Precio (USD)'].toFixed(2)} x {item.cantidad}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center bg-slate-100 rounded-lg px-1">
                        <button
                          onClick={() => updateCartQuantity(item.producto.id, item.cantidad - 1)}
                          className="p-1 hover:text-slate-900 text-slate-500"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-slate-800">{item.cantidad}</span>
                        <button
                          onClick={() => updateCartQuantity(item.producto.id, item.cantidad + 1)}
                          className="p-1 hover:text-slate-900 text-slate-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-16 text-right font-mono font-bold text-slate-900">
                        ${subUSD.toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeFromCart(item.producto.id)}
                        className="text-slate-300 hover:text-rose-500 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Customer Form */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Cliente
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre Cliente"
                  className="w-full text-xs pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-1">
                Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                placeholder="0414..."
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase block mb-2">
              Método de Cobro (Abono directo a cuenta)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {cuentas.map((c) => {
                const isSelected = selectedCuenta === c.Nombre;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCuenta(c.Nombre)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="mt-0.5">{getMethodIcon(c.Nombre)}</div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">{c.Nombre}</p>
                      <p className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {c.Moneda}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Total en Divisas:</span>
              <span className="font-mono font-semibold text-slate-800">${cartTotalUSD.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between items-baseline pt-1 border-t border-slate-200/60">
              <span className="text-xs font-bold text-slate-900">Total en Bolívares (VES):</span>
              <span className="text-base font-bold text-emerald-600 font-mono">
                Bs. {cartTotalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCobro}
            disabled={isProcessing || cart.length === 0}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 disabled:opacity-40"
          >
            {isProcessing ? 'Procesando venta atómica...' : `Cobrar $${cartTotalUSD.toFixed(2)} USD`}
          </button>
        </div>
      </div>

      {/* Sale Receipt Modal */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl relative space-y-4">
            <button
              onClick={() => setCompletedSale(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ticket de Venta</h3>
              <p className="text-xs text-slate-500 font-mono">#{completedSale.id}</p>
            </div>

            <div id="printable-area" className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs font-mono space-y-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <p className="font-bold text-sm text-slate-900">{configuracion.Nombre_Negocio}</p>
                <p className="text-[10px] text-slate-500">{completedSale.Fecha}</p>
                <p className="text-[10px] text-slate-500">Cliente: {completedSale.Cliente}</p>
                <p className="text-[10px] text-slate-500">Pago: {completedSale['Método de Pago']}</p>
              </div>

              <div className="space-y-1 py-2 border-b border-slate-200">
                {JSON.parse(completedSale.Detalle).map((it: DetalleVentaItem, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{it.cantidad}x {it.nombre}</span>
                    <span>${it.subtotalUSD.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1 space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>TOTAL USD:</span>
                  <span>${completedSale['Total USD'].toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>TOTAL VES:</span>
                  <span>Bs. {completedSale['Total VES'].toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>

              <button
                onClick={() => {
                  const detailText = JSON.parse(completedSale.Detalle)
                    .map((it: DetalleVentaItem) => `${it.cantidad}x ${it.nombre} ($${it.subtotalUSD.toFixed(2)})`)
                    .join('%0A');
                  const msg = `*Recibo de Compra - ${configuracion.Nombre_Negocio}*%0A%0ATicket: ${completedSale.id}%0AFecha: ${completedSale.Fecha}%0A%0A*Detalle:*%0A${detailText}%0A%0A*Total:* $${completedSale['Total USD'].toFixed(2)} USD (Bs. ${completedSale['Total VES'].toFixed(2)})%0AMétodo: ${completedSale['Método de Pago']}%0A%0A¡Gracias por su compra!`;
                  window.open(`https://wa.me/?text=${msg}`, '_blank');
                }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
