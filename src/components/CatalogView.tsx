import React, { useState, useMemo } from 'react';
import { Search, Plus, Check, ShoppingBag, Eye, X, MessageCircle } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Producto } from '../types';

export const CatalogView: React.FC = () => {
  const {
    productos,
    configuracion,
    addToCart,
    getStockForProduct,
    setIsCartOpen,
    cart,
  } = useCommerce();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => {
      if (p.Categoría) set.add(p.Categoría);
    });
    return ['Todas', ...Array.from(set)];
  }, [productos]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      if (p['Activo (sí/no)'] !== 'sí') return false;
      if (p['Se vende (sí/no)'] !== 'sí') return false;

      const matchesCat = selectedCategory === 'Todas' || p.Categoría === selectedCategory;
      const matchesSearch =
        p.Nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.SKU.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p['Código de barras'].includes(searchQuery);

      return matchesCat && matchesSearch;
    });
  }, [productos, selectedCategory, searchQuery]);

  const handleAdd = (e: React.MouseEvent, prod: Producto) => {
    e.stopPropagation();
    addToCart(prod, 1);
    setJustAddedId(prod.id);
    setTimeout(() => setJustAddedId(null), 1200);
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero / Search Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Catálogo Comercial Inverza
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Productos selectos con inventario en tiempo real.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Precios referenciales en USD con conversión automática a Bolívares (VES) a tasa oficial:
            <strong className="text-slate-900 ml-1 font-mono">Bs. {configuracion.Tasa_USD_VES.toFixed(2)}</strong>.
          </p>

          {/* Search Box */}
          <div className="pt-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 hover:bg-slate-200/60 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 2 columns on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((prod) => {
          const stock = getStockForProduct(prod.SKU);
          const isOutOfStock = prod['Controlar inventario (sí/no)'] === 'sí' && stock <= 0;
          const isLowStock = prod['Controlar inventario (sí/no)'] === 'sí' && stock > 0 && stock <= prod['Stock mínimo'];
          const priceUSD = prod['Precio (USD)'];
          const priceVES = priceUSD * configuracion.Tasa_USD_VES;

          return (
            <div
              key={prod.id}
              onClick={() => setSelectedProduct(prod)}
              className="group bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Centered Image with stock status dot */}
                <div className="relative aspect-square w-full rounded-xl bg-slate-50/80 overflow-hidden mb-3.5 flex items-center justify-center border border-slate-100/50">
                  <img
                    src={prod.Imagen_URL}
                    alt={prod.Nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Stock Dot Badge (Top Right) */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200/50 flex items-center gap-1.5 shadow-2xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOutOfStock
                          ? 'bg-rose-500'
                          : isLowStock
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-[10px] font-medium text-slate-700">
                      {isOutOfStock ? 'Agotado' : isLowStock ? `${stock} disp.` : `${stock} disp.`}
                    </span>
                  </div>

                  {/* Category Pill (Top Left) */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-medium rounded-md">
                    {prod.Categoría || 'General'}
                  </span>
                </div>

                {/* Product Info */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-slate-900 transition-colors">
                  {prod.Nombre}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-1">
                  SKU: {prod.SKU}
                </p>
              </div>

              {/* Price & Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-end justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm sm:text-base font-bold text-slate-900 font-mono">
                      ${priceUSD.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">USD</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 font-mono">
                    Bs. {priceVES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  onClick={(e) => handleAdd(e, prod)}
                  disabled={isOutOfStock}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all active:scale-95 ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : justAddedId === prod.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  }`}
                  title="Añadir al carrito"
                >
                  {justAddedId === prod.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Listo</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Agregar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
          <p className="text-sm font-medium text-slate-700">No se encontraron productos coincidentes</p>
          <p className="text-xs text-slate-400">Intenta con otro término o selecciona otra categoría.</p>
        </div>
      )}

      {/* Floating Cart Indicator when items are added */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                {totalCartCount}
              </span>
            </div>
            <div className="text-left text-xs">
              <span className="font-semibold block">Ver Carrito</span>
            </div>
          </button>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-100 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
              <img
                src={selectedProduct.Imagen_URL}
                alt={selectedProduct.Nombre}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                  {selectedProduct.Categoría}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {selectedProduct.SKU}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedProduct.Nombre}</h2>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    ${selectedProduct['Precio (USD)'].toFixed(2)} USD
                  </span>
                  <span className="text-xs text-slate-500 font-mono block">
                    Bs. {(selectedProduct['Precio (USD)'] * configuracion.Tasa_USD_VES).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-4 text-xs text-slate-500 space-y-0.5">
                  <p>Existencia: <strong>{getStockForProduct(selectedProduct.SKU)} {selectedProduct.Unidad}</strong></p>
                  <p>Código: <strong className="font-mono">{selectedProduct['Código de barras']}</strong></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  addToCart(selectedProduct, 1);
                  setSelectedProduct(null);
                  setIsCartOpen(true);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </button>

              <button
                onClick={() => {
                  const wsp = configuracion.Telefono_WhatsApp.replace(/[^0-9]/g, '');
                  const msg = `Hola! Quisiera consultar disponibilidad de ${selectedProduct.Nombre} (SKU: ${selectedProduct.SKU}).`;
                  window.open(`https://wa.me/${wsp}?text=${encodeURIComponent(msg)}`, '_blank');
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar Asesor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
