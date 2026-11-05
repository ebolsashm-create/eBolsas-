import React, { useState } from 'react';
import {
  Package,
  Boxes,
  CreditCard,
  History,
  Settings,
  Plus,
  Upload,
  FileDown,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { Producto, Existencia, Cuenta } from '../types';

interface AdminViewProps {
  onOpenPdfCatalog: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onOpenPdfCatalog }) => {
  const {
    productos,
    existencia,
    cuentas,
    ventas,
    configuracion,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    updateCuentaSaldo,
    updateConfiguracion,
    getStockForProduct,
  } = useCommerce();

  const [activeSubTab, setActiveSubTab] = useState<'productos' | 'inventario' | 'cuentas' | 'ventas' | 'ajustes'>('productos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  // Form State for new/edit product
  const [formNombre, setFormNombre] = useState('');
  const [formTipo, setFormTipo] = useState<'Producto' | 'Servicio'>('Producto');
  const [formCategoria, setFormCategoria] = useState('Despensa');
  const [formSKU, setFormSKU] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formPrecioUSD, setFormPrecioUSD] = useState('');
  const [formUnidad, setFormUnidad] = useState('UND');
  const [formControlStock, setFormControlStock] = useState<'sí' | 'no'>('sí');
  const [formSeVende, setFormSeVende] = useState<'sí' | 'no'>('sí');
  const [formStockMinimo, setFormStockMinimo] = useState('5');
  const [formActivo, setFormActivo] = useState<'sí' | 'no'>('sí');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formStockInicial, setFormStockInicial] = useState('20');
  const [formCostoUnitario, setFormCostoUnitario] = useState('3.50');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState(false);

  // Calculate low stock items
  const lowStockItems = existencia.filter((ex) => {
    const prod = productos.find((p) => p.SKU === ex.SKU);
    if (!prod || prod['Controlar inventario (sí/no)'] !== 'sí') return false;
    return ex.Cantidad <= prod['Stock mínimo'];
  });

  // Open modal for new product
  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setFormNombre('');
    setFormTipo('Producto');
    setFormCategoria('Despensa');
    const autoSku = `INV-${Date.now().toString().slice(-4)}`;
    setFormSKU(autoSku);
    setFormBarcode(`759${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setFormPrecioUSD('5.00');
    setFormUnidad('UND');
    setFormControlStock('sí');
    setFormSeVende('sí');
    setFormStockMinimo('5');
    setFormActivo('sí');
    setFormImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    setFormStockInicial('25');
    setFormCostoUnitario('3.00');
    setDriveUploadSuccess(false);
    setIsModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditModal = (prod: Producto) => {
    setEditingProduct(prod);
    setFormNombre(prod.Nombre);
    setFormTipo(prod.Tipo);
    setFormCategoria(prod.Categoría);
    setFormSKU(prod.SKU);
    setFormBarcode(prod['Código de barras']);
    setFormPrecioUSD(prod['Precio (USD)'].toString());
    setFormUnidad(prod.Unidad);
    setFormControlStock(prod['Controlar inventario (sí/no)']);
    setFormSeVende(prod['Se vende (sí/no)']);
    setFormStockMinimo(prod['Stock mínimo'].toString());
    setFormActivo(prod['Activo (sí/no)']);
    setFormImageUrl(prod.Imagen_URL);
    const ex = existencia.find((e) => e.SKU === prod.SKU);
    setFormStockInicial(ex ? ex.Cantidad.toString() : '0');
    setFormCostoUnitario(ex ? ex['Costo unitario'].toString() : '0');
    setDriveUploadSuccess(false);
    setIsModalOpen(true);
  };

  // Handle image upload simulation/connector to Google Drive
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingToDrive(true);
    const reader = new FileReader();
    reader.onload = () => {
      setTimeout(() => {
        // Generates preview & Google Drive style simulated public image ID
        const fakeFileId = `1drive_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const drivePublicUrl = reader.result as string;
        setFormImageUrl(drivePublicUrl);
        setIsUploadingToDrive(false);
        setDriveUploadSuccess(true);
      }, 700);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(formPrecioUSD) || 0;
    const stockMin = parseInt(formStockMinimo) || 0;
    const stockQty = parseInt(formStockInicial) || 0;
    const cost = parseFloat(formCostoUnitario) || 0;

    if (editingProduct) {
      updateProduct(
        {
          ...editingProduct,
          Nombre: formNombre,
          Tipo: formTipo,
          Categoría: formCategoria,
          SKU: formSKU,
          'Código de barras': formBarcode,
          'Precio (USD)': precio,
          Unidad: formUnidad,
          'Controlar inventario (sí/no)': formControlStock,
          'Se vende (sí/no)': formSeVende,
          'Stock mínimo': stockMin,
          'Activo (sí/no)': formActivo,
          Imagen_URL: formImageUrl,
        },
        stockQty,
        cost
      );
    } else {
      addProduct(
        {
          Nombre: formNombre,
          Tipo: formTipo,
          Categoría: formCategoria,
          SKU: formSKU,
          'Código de barras': formBarcode,
          'Precio (USD)': precio,
          Unidad: formUnidad,
          'Controlar inventario (sí/no)': formControlStock,
          'Se vende (sí/no)': formSeVende,
          'Stock mínimo': stockMin,
          'Activo (sí/no)': formActivo,
          Imagen_URL: formImageUrl,
        },
        stockQty,
        cost
      );
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar with Module Title & Export PDF button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Panel de Control
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Gestión Integral & Base de Datos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sincronizado con Google Sheets (Productos, Existencia, Cuentas, Ventas y Configuración).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPdfCatalog}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02] shadow-2xs"
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            <span>Exportar Catálogo PDF</span>
          </button>

          <button
            onClick={handleOpenNewModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-200/70 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <span className="font-bold block">
              Atención: {lowStockItems.length} artículo(s) con existencia igual o inferior al stock mínimo.
            </span>
            <span className="text-amber-700">
              Artículos afectados: {lowStockItems.map((i) => `${i.Producto} (${i.Cantidad} disp.)`).join(', ')}.
            </span>
          </div>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('productos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeSubTab === 'productos'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Productos ({productos.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inventario')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeSubTab === 'inventario'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Existencia / Inventario</span>
          {lowStockItems.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
              {lowStockItems.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('cuentas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeSubTab === 'cuentas'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Cuentas Bancarias ({cuentas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ventas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeSubTab === 'ventas'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Registro de Ventas ({ventas.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ajustes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
            activeSubTab === 'ajustes'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configuración Negocio</span>
        </button>
      </div>

      {/* SubTab 1: PRODUCTOS */}
      {activeSubTab === 'productos' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">SKU / Barras</th>
                  <th className="py-3 px-4 text-right">Precio USD</th>
                  <th className="py-3 px-4 text-right">Precio VES</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productos.map((prod) => {
                  const stock = getStockForProduct(prod.SKU);
                  const pUSD = prod['Precio (USD)'];
                  const pVES = pUSD * configuracion.Tasa_USD_VES;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={prod.Imagen_URL}
                          alt={prod.Nombre}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate max-w-xs">{prod.Nombre}</p>
                          <p className="text-[10px] text-slate-400">{prod.Tipo} • {prod.Unidad}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium">
                          {prod.Categoría}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <div>{prod.SKU}</div>
                        <div className="text-slate-400 text-[10px]">{prod['Código de barras']}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${pUSD.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        Bs. {pVES.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            stock <= prod['Stock mínimo']
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {stock} {prod.Unidad}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            prod['Activo (sí/no)'] === 'sí' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={prod['Activo (sí/no)'] === 'sí' ? 'Activo' : 'Inactivo'}
                        />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="Editar producto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar producto "${prod.Nombre}"?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: INVENTARIO / EXISTENCIA */}
      {activeSubTab === 'inventario' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Control de Existencia por Almacén</h3>
            <p className="text-xs text-slate-500">
              Hoja: <code className="text-slate-800 font-semibold font-mono">Existencia</code> (id, Producto, SKU, Ubicación, Cantidad, Costo unitario).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4 text-right">Costo Unitario ($)</th>
                  <th className="py-3 px-4 text-center">Cantidad Disponible</th>
                  <th className="py-3 px-4 text-right">Valor Total ($)</th>
                  <th className="py-3 px-4 text-center">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {existencia.map((ex) => {
                  const valorTotal = ex.Cantidad * ex['Costo unitario'];
                  return (
                    <tr key={ex.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800">{ex.Producto}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{ex.SKU}</td>
                      <td className="py-3 px-4 text-slate-600">{ex.Ubicación}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        ${ex['Costo unitario'].toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-sm text-slate-900 font-mono">
                          {ex.Cantidad}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${valorTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateStock(ex.SKU, Math.max(0, ex.Cantidad - 1))}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-bold text-slate-700"
                            title="Restar 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => updateStock(ex.SKU, ex.Cantidad + 5)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded text-[11px] font-bold text-white"
                            title="Añadir 5 unidades"
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: CUENTAS */}
      {activeSubTab === 'cuentas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cuentas.map((c) => (
              <div
                key={c.id}
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                      {c.Tipo} • {c.Moneda}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{c.Nombre}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block">Saldo Actual Registrado:</span>
                  <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                    {c.Moneda === 'VES' ? 'Bs. ' : '$'}
                    {c['Saldo de hoy'].toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Resumen Financiero Consolidado</h4>
            <p className="text-xs text-slate-500">
              Todas las ventas registradas mediante el punto de venta o catálogo se acreditan automáticamente en la cuenta correspondiente según la moneda pactada.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 4: VENTAS */}
      {activeSubTab === 'ventas' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Historial y Libro de Ventas</h3>
            <p className="text-xs text-slate-500">
              Hoja: <code className="text-slate-800 font-semibold font-mono">Ventas</code> (id, Fecha, Cliente, Total USD, Total VES, Método de Pago, Estado, Detalle).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Método de Cobro</th>
                  <th className="py-3 px-4 text-right">Total USD</th>
                  <th className="py-3 px-4 text-right">Total VES</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ventas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{v.id}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{v.Fecha}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{v.Cliente}</td>
                    <td className="py-3 px-4 text-slate-600">{v['Método de Pago']}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${v['Total USD'].toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      Bs. {v['Total VES'].toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {v.Estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 5: CONFIGURACIÓN */}
      {activeSubTab === 'ajustes' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Configuración del Negocio</h3>
            <p className="text-xs text-slate-500">
              Valores almacenados en la hoja <code className="font-mono text-slate-800 font-semibold">Configuracion</code>.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={configuracion.Nombre_Negocio}
                onChange={(e) => updateConfiguracion({ Nombre_Negocio: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tasa Oficial USD / VES</label>
                <input
                  type="number"
                  step="0.01"
                  value={configuracion.Tasa_USD_VES}
                  onChange={(e) => updateConfiguracion({ Tasa_USD_VES: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">WhatsApp de Atención</label>
                <input
                  type="text"
                  value={configuracion.Telefono_WhatsApp}
                  onChange={(e) => updateConfiguracion({ Telefono_WhatsApp: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Dirección Comercial</label>
              <input
                type="text"
                value={configuracion.Direccion_Fisica}
                onChange={(e) => updateConfiguracion({ Direccion_Fisica: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                URL de Web App Google Apps Script (/exec)
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={configuracion.Google_Apps_Script_URL || ''}
                onChange={(e) => updateConfiguracion({ Google_Apps_Script_URL: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Al colocar la URL desplegada de Apps Script, la app se sincroniza en vivo con tu Google Sheet real.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New / Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-100 shadow-2xl relative space-y-4 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Editar Producto' : 'Cargar Nuevo Producto'}
              </h3>
              <p className="text-xs text-slate-500">
                Actualización atómica en hojas <code className="font-mono">Productos</code> y <code className="font-mono">Existencia</code>.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Image Preview & Upload to Drive */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <span className="text-xs font-semibold text-slate-700 block">
                  Foto del Producto (Integración Google Drive)
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formImageUrl ? (
                      <img src={formImageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-medium text-slate-700 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingToDrive ? 'Subiendo a Drive...' : 'Subir Imagen Local'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    {driveUploadSuccess && (
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" /> Imagen procesada con permiso público en Drive
                      </p>
                    )}

                    <input
                      type="text"
                      placeholder="O pega una URL directa de imagen..."
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full text-[11px] px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej: Café Grano Gourmet San Pedro 500g"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Unidad de Medida</label>
                  <select
                    value={formUnidad}
                    onChange={(e) => setFormUnidad(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                  >
                    <option value="UND">Unidad (UND)</option>
                    <option value="PAQ">Paquete (PAQ)</option>
                    <option value="KG">Kilogramo (KG)</option>
                    <option value="L">Litro (L)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formSKU}
                    onChange={(e) => setFormSKU(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Precio Venta (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrecioUSD}
                    onChange={(e) => setFormPrecioUSD(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Costo Unitario (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCostoUnitario}
                    onChange={(e) => setFormCostoUnitario(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Actual (Existencia)</label>
                  <input
                    type="number"
                    value={formStockInicial}
                    onChange={(e) => setFormStockInicial(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    value={formStockMinimo}
                    onChange={(e) => setFormStockMinimo(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Guardar en Google Sheets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
