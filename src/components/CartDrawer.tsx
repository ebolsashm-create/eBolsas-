import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotalUSD,
    cartTotalVES,
    cuentas,
    configuracion,
    processSale,
    getStockForProduct,
  } = useCommerce();

  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState<string>(cuentas[0]?.Nombre || 'Pago Móvil BNC Principal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [saleSuccessId, setSaleSuccessId] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setErrorMessage('');
    if (cart.length === 0) return;

    setIsProcessing(true);
    const clientDesc = cliente.trim() ? `${cliente} (${telefono || 'Sin tel'})` : 'Cliente Mostrador';
    const result = await processSale(clientDesc, metodoPago);
    setIsProcessing(false);

    if (result.success && result.sale) {
      setSaleSuccessId(result.sale.id);
      setTimeout(() => {
        setSaleSuccessId(null);
        setIsCartOpen(false);
      }, 2000);
    } else {
      setErrorMessage(result.error || 'Error al procesar la venta');
    }
  };

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;
    const itemsList = cart
      .map((it) => `• ${it.cantidad}x ${it.producto.Nombre} ($${(it.producto['Precio (USD)'] * it.cantidad).toFixed(2)})`)
      .join('\n');
    const msg = `🌿 *Nuevo Pedido - Inverza Commerce*\n\nCliente: ${cliente || 'Cliente Web'}\nTeléfono: ${telefono || 'N/A'}\n\n*Productos:*\n${itemsList}\n\n*Total:* $${cartTotalUSD.toFixed(2)} USD (Bs. ${cartTotalVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })})\nMétodo deseado: ${metodoPago}\n\n¡Espero su confirmación!`;
    const cleanPhone = configuracion.Telefono_WhatsApp.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-100 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Carrito de Compra</h2>
              <p className="text-xs text-slate-500">
                {cart.length} {cart.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {saleSuccessId && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold">¡Venta completada con éxito!</p>
                  <p className="text-xs text-emerald-700">Ticket generado: #{saleSuccessId}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <X className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-600">Tu carrito está vacío</p>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Agrega productos desde el catálogo visual o el buscador rápido del POS.
                </p>
              </div>
            ) : (
              cart.map((item) => {
                const stock = getStockForProduct(item.producto.SKU);
                const itemTotalUSD = item.producto['Precio (USD)'] * item.cantidad;
                return (
                  <div
                    key={item.producto.id}
                    className="flex items-center gap-3 p-3 bg-slate-50/70 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
                  >
                    <img
                      src={item.producto.Imagen_URL}
                      alt={item.producto.Nombre}
                      className="w-14 h-14 object-cover rounded-xl bg-white border border-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800 truncate">
                        {item.producto.Nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        ${item.producto['Precio (USD)'].toFixed(2)} c/u
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.producto.id, item.cantidad - 1)}
                            className="p-1 hover:text-slate-900 text-slate-500"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold text-slate-800">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.producto.id, item.cantidad + 1)}
                            disabled={item.producto['Controlar inventario (sí/no)'] === 'sí' && item.cantidad >= stock}
                            className="p-1 hover:text-slate-900 text-slate-500 disabled:opacity-30"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Disp: {stock}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end h-14">
                      <button
                        onClick={() => removeFromCart(item.producto.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        ${itemTotalUSD.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Vaciar carrito
                </button>

                {/* Customer Info Form */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Datos del Cliente
                  </span>
                  <input
                    type="text"
                    placeholder="Nombre y Apellido"
                    value={cliente}
                    onChange={(e) => setCliente(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                  />
                  <input
                    type="text"
                    placeholder="Teléfono / WhatsApp (ej: 04141234567)"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800"
                  />
                </div>

                {/* Payment Account Selector */}
                <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-700 block">
                    Método de Cobro (Cuentas)
                  </span>
                  <select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 font-medium"
                  >
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.Nombre}>
                        {c.Nombre} ({c.Moneda}) - Saldo: {c.Moneda === 'VES' ? 'Bs. ' : '$'}
                        {c['Saldo de hoy'].toLocaleString('es-VE')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer Totals & Action */}
          {cart.length > 0 && (
            <div className="p-6 bg-slate-50/60 border-t border-slate-100 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>Subtotal en Divisas:</span>
                  <span className="font-mono font-medium text-slate-700">${cartTotalUSD.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Total a Pagar</span>
                    <span className="text-[11px] text-slate-400 font-mono">Tasa: Bs. {configuracion.Tasa_USD_VES.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 font-mono block">
                      ${cartTotalUSD.toFixed(2)} USD
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 font-mono block">
                      Bs. {cartTotalVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pedir WhatsApp</span>
                </button>

                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <span>Cobrar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
