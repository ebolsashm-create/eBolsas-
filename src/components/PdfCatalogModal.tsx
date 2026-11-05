import React from 'react';
import { X, Printer, Download, Sparkles, QrCode } from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';

interface PdfCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfCatalogModal: React.FC<PdfCatalogModalProps> = ({ isOpen, onClose }) => {
  const { productos, configuracion } = useCommerce();

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Controls Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-xs sm:text-sm font-bold">Vista Previa Catálogo PDF Minimalista</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white" id="printable-area">
          <div className="max-w-3xl mx-auto space-y-8 relative">
            {/* Subtle Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <span className="text-8xl font-black rotate-[-25deg] tracking-widest text-slate-900">
                INVERZA
              </span>
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-6 flex justify-between items-end">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                    IC
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {configuracion.Nombre_Negocio}
                  </h1>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Catálogo Comercial Oficial • {configuracion.Direccion_Fisica}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  Atención / Pedidos: {configuracion.Telefono_WhatsApp}
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="inline-block px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800">
                  Tasa Oficial: Bs. {configuracion.Tasa_USD_VES.toFixed(2)} / USD
                </span>
                <p className="text-[11px] text-slate-400 font-mono">Fecha de Emisión: {todayStr}</p>
              </div>
            </div>

            {/* Symmetric 3-column Grid */}
            <div className="grid grid-cols-3 gap-6 pt-2">
              {productos
                .filter((p) => p['Activo (sí/no)'] === 'sí' && p['Se vende (sí/no)'] === 'sí')
                .map((prod) => {
                  const pUSD = prod['Precio (USD)'];
                  const pVES = pUSD * configuracion.Tasa_USD_VES;

                  return (
                    <div
                      key={prod.id}
                      className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between text-center bg-white shadow-2xs"
                    >
                      <div>
                        <div className="aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center">
                          <img
                            src={prod.Imagen_URL}
                            alt={prod.Nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="inline-block px-2 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-600 rounded mb-1">
                          {prod.Categoría}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                          {prod.Nombre}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <p className="text-sm font-bold text-slate-900 font-mono">
                          ${pUSD.toFixed(2)} <span className="text-[9px] font-normal text-slate-400">USD</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-600 font-mono">
                          Bs. {pVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-1">
                          SKU: {prod.SKU}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Document Footer */}
            <div className="border-t border-slate-200 pt-6 flex justify-between items-center text-xs text-slate-400 font-mono">
              <div>
                <p>Generado con Inverza Commerce Engine para Google Apps Script & Sheets</p>
                <p className="text-[10px]">Precios sujetos a cambio según tasa oficial del día.</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-600">Página 1 de 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
