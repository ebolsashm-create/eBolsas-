import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Producto,
  Existencia,
  Cuenta,
  Venta,
  Configuracion,
  SesionActiva,
  AlertaHumano,
  CartItem,
  DetalleVentaItem,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_PRODUCTOS,
  INITIAL_EXISTENCIA,
  INITIAL_CUENTAS,
  INITIAL_VENTAS,
  INITIAL_SESIONES,
  INITIAL_ALERTAS_HUMANO,
} from '../data/initialData';

interface CommerceContextType {
  productos: Producto[];
  existencia: Existencia[];
  cuentas: Cuenta[];
  ventas: Venta[];
  configuracion: Configuracion;
  sesiones: SesionActiva[];
  alertasHumano: AlertaHumano[];
  cart: CartItem[];
  isCartOpen: boolean;
  activeTab: 'catalogo' | 'pos' | 'admin' | 'bot' | 'gas';
  isSyncing: boolean;
  syncStatus: 'local' | 'synced' | 'error';
  lastSyncTime: string | null;
  selectedProductForDetail: Producto | null;
  lastCompletedSale: Venta | null;
  
  // Actions
  setActiveTab: (tab: 'catalogo' | 'pos' | 'admin' | 'bot' | 'gas') => void;
  setIsCartOpen: (open: boolean) => void;
  setSelectedProductForDetail: (prod: Producto | null) => void;
  setLastCompletedSale: (sale: Venta | null) => void;
  
  // Cart
  addToCart: (product: Producto, cantidad?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, cantidad: number) => void;
  clearCart: () => void;
  cartTotalUSD: number;
  cartTotalVES: number;
  
  // Inventory & Sales
  getStockForProduct: (sku: string) => number;
  processSale: (
    cliente: string,
    metodoPago: string,
    itemsToProcess?: CartItem[]
  ) => Promise<{ success: boolean; sale?: Venta; error?: string }>;
  addProduct: (product: Omit<Producto, 'id'>, stockCantidad: number, costoUnitario: number) => void;
  updateProduct: (product: Producto, stockCantidad?: number, costoUnitario?: number) => void;
  deleteProduct: (id: string) => void;
  updateStock: (sku: string, cantidad: number, costoUnitario?: number) => void;
  updateCuentaSaldo: (id: string, nuevoSaldo: number) => void;
  updateConfiguracion: (newConfig: Partial<Configuracion>) => void;
  
  // Bot & Alerts
  simulateBotMessage: (
    sender: string,
    canal: 'WhatsApp' | 'Telegram',
    texto: string
  ) => Promise<{ reply: string; isHumano: boolean }>;
  resolveAlertaHumano: (id: string) => void;
  
  // Sync
  syncWithGoogleAppsScript: () => Promise<void>;
  resetToDefaultData: () => void;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTOS: 'inverza_productos',
  EXISTENCIA: 'inverza_existencia',
  CUENTAS: 'inverza_cuentas',
  VENTAS: 'inverza_ventas',
  CONFIGURACION: 'inverza_configuracion',
  SESIONES: 'inverza_sesiones',
  ALERTAS: 'inverza_alertas',
};

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial seed
  const [productos, setProductos] = useState<Producto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTOS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTOS;
  });

  const [existencia, setExistencia] = useState<Existencia[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXISTENCIA);
    return saved ? JSON.parse(saved) : INITIAL_EXISTENCIA;
  });

  const [cuentas, setCuentas] = useState<Cuenta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUENTAS);
    return saved ? JSON.parse(saved) : INITIAL_CUENTAS;
  });

  const [ventas, setVentas] = useState<Venta[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENTAS);
    return saved ? JSON.parse(saved) : INITIAL_VENTAS;
  });

  const [configuracion, setConfiguracion] = useState<Configuracion>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIGURACION);
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [sesiones, setSesiones] = useState<SesionActiva[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESIONES);
    return saved ? JSON.parse(saved) : INITIAL_SESIONES;
  });

  const [alertasHumano, setAlertasHumano] = useState<AlertaHumano[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTAS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTAS_HUMANO;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'pos' | 'admin' | 'bot' | 'gas'>('catalogo');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'local' | 'synced' | 'error'>('local');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Producto | null>(null);
  const [lastCompletedSale, setLastCompletedSale] = useState<Venta | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXISTENCIA, JSON.stringify(existencia));
  }, [existencia]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUENTAS, JSON.stringify(cuentas));
  }, [cuentas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VENTAS, JSON.stringify(ventas));
  }, [ventas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIGURACION, JSON.stringify(configuracion));
  }, [configuracion]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESIONES, JSON.stringify(sesiones));
  }, [sesiones]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTAS, JSON.stringify(alertasHumano));
  }, [alertasHumano]);

  // Stock lookup helper
  const getStockForProduct = (sku: string): number => {
    const item = existencia.find((e) => e.SKU === sku);
    return item ? Number(item.Cantidad) : 0;
  };

  // Cart Helpers
  const addToCart = (product: Producto, cantidad = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === product.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      return [...prev, { producto: product, cantidad }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.producto.id !== productId));
  };

  const updateCartQuantity = (productId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.producto.id === productId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotalUSD = cart.reduce((sum, item) => sum + item.producto['Precio (USD)'] * item.cantidad, 0);
  const cartTotalVES = cartTotalUSD * configuracion.Tasa_USD_VES;

  // Process atomic sale
  const processSale = async (
    cliente: string,
    metodoPago: string,
    itemsToProcess?: CartItem[]
  ): Promise<{ success: boolean; sale?: Venta; error?: string }> => {
    const items = itemsToProcess || cart;
    if (items.length === 0) {
      return { success: false, error: 'El carrito está vacío' };
    }

    // 1. Verify stock for each item if tracking is enabled
    for (const item of items) {
      if (item.producto['Controlar inventario (sí/no)'] === 'sí') {
        const available = getStockForProduct(item.producto.SKU);
        if (available < item.cantidad) {
          return {
            success: false,
            error: `Stock insuficiente para ${item.producto.Nombre}. Disponible: ${available}, Solicitado: ${item.cantidad}`,
          };
        }
      }
    }

    const totalUSD = items.reduce((sum, it) => sum + it.producto['Precio (USD)'] * it.cantidad, 0);
    const totalVES = totalUSD * configuracion.Tasa_USD_VES;

    const detalleItems: DetalleVentaItem[] = items.map((it) => ({
      id: it.producto.id,
      nombre: it.producto.Nombre,
      sku: it.producto.SKU,
      cantidad: it.cantidad,
      precioUSD: it.producto['Precio (USD)'],
      subtotalUSD: it.producto['Precio (USD)'] * it.cantidad,
    }));

    const saleId = `VEN-${new Date().getFullYear()}-${String(ventas.length + 92).padStart(4, '0')}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newSale: Venta = {
      id: saleId,
      Fecha: formattedDate,
      Cliente: cliente || 'Cliente General',
      'Total USD': parseFloat(totalUSD.toFixed(2)),
      'Total VES': parseFloat(totalVES.toFixed(2)),
      'Método de Pago': metodoPago,
      Estado: 'Completada',
      Detalle: JSON.stringify(detalleItems),
    };

    // 2. Atomic Stock Deduction
    setExistencia((prev) =>
      prev.map((ex) => {
        const cartMatch = items.find((it) => it.producto.SKU === ex.SKU);
        if (cartMatch) {
          return {
            ...ex,
            Cantidad: Math.max(0, ex.Cantidad - cartMatch.cantidad),
          };
        }
        return ex;
      })
    );

    // 3. Update Bank Accounts Balance
    setCuentas((prev) =>
      prev.map((cuenta) => {
        if (cuenta.Nombre === metodoPago) {
          const addAmount = cuenta.Moneda === 'VES' ? totalVES : totalUSD;
          return {
            ...cuenta,
            'Saldo de hoy': parseFloat((cuenta['Saldo de hoy'] + addAmount).toFixed(2)),
          };
        }
        return cuenta;
      })
    );

    // 4. Save to Ventas
    setVentas((prev) => [newSale, ...prev]);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#0F172A', '#38BDF8', '#10B981', '#F59E0B'],
      });
    } catch {
      // ignore
    }

    // Set last sale for receipt preview
    setLastCompletedSale(newSale);

    // Clear cart if default
    if (!itemsToProcess) {
      clearCart();
    }

    // Attempt remote Google Apps Script sync if URL is provided
    if (configuracion.Google_Apps_Script_URL && configuracion.Auto_Sync) {
      try {
        fetch(configuracion.Google_Apps_Script_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'recordSale', sale: newSale }),
        }).catch((e) => console.warn('Sync background failed:', e));
      } catch (e) {
        console.warn('Sync POST error:', e);
      }
    }

    return { success: true, sale: newSale };
  };

  // Product CRUD
  const addProduct = (productData: Omit<Producto, 'id'>, stockCantidad: number, costoUnitario: number) => {
    const id = `prod-${Date.now().toString(36)}`;
    const newProduct: Producto = {
      ...productData,
      id,
    };

    const newExistencia: Existencia = {
      id: `ex-${Date.now().toString(36)}`,
      Producto: newProduct.Nombre,
      SKU: newProduct.SKU,
      Ubicación: 'Principal',
      Cantidad: stockCantidad,
      'Costo unitario': costoUnitario,
    };

    setProductos((prev) => [newProduct, ...prev]);
    setExistencia((prev) => [newExistencia, ...prev]);
  };

  const updateProduct = (updated: Producto, stockCantidad?: number, costoUnitario?: number) => {
    setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (stockCantidad !== undefined || costoUnitario !== undefined) {
      setExistencia((prev) =>
        prev.map((ex) => {
          if (ex.SKU === updated.SKU) {
            return {
              ...ex,
              Producto: updated.Nombre,
              Cantidad: stockCantidad !== undefined ? stockCantidad : ex.Cantidad,
              'Costo unitario': costoUnitario !== undefined ? costoUnitario : ex['Costo unitario'],
            };
          }
          return ex;
        })
      );
    }
  };

  const deleteProduct = (id: string) => {
    const prod = productos.find((p) => p.id === id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
    if (prod) {
      setExistencia((prev) => prev.filter((e) => e.SKU !== prod.SKU));
    }
  };

  const updateStock = (sku: string, cantidad: number, costoUnitario?: number) => {
    setExistencia((prev) =>
      prev.map((ex) => {
        if (ex.SKU === sku) {
          return {
            ...ex,
            Cantidad: cantidad,
            'Costo unitario': costoUnitario !== undefined ? costoUnitario : ex['Costo unitario'],
          };
        }
        return ex;
      })
    );
  };

  const updateCuentaSaldo = (id: string, nuevoSaldo: number) => {
    setCuentas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, 'Saldo de hoy': nuevoSaldo } : c))
    );
  };

  const updateConfiguracion = (newConfig: Partial<Configuracion>) => {
    setConfiguracion((prev) => ({ ...prev, ...newConfig }));
  };

  // Bot & Human Alert Simulation
  const simulateBotMessage = async (
    sender: string,
    canal: 'WhatsApp' | 'Telegram',
    texto: string
  ): Promise<{ reply: string; isHumano: boolean }> => {
    const clean = texto.trim().toLowerCase();
    const isHumano = clean.includes('humano') || clean.includes('asesor') || clean.includes('persona');

    let reply = '';
    let nuevoEstado: SesionActiva['EstadoActual'] = 'navegando_catalogo';

    if (isHumano) {
      nuevoEstado = 'esperando_asesor';
      reply = `🔔 *Solicitud de Atención Humana Registrada*\n\nHemos alertado a un asesor comercial de Inverza Commerce. Tu ticket es prioritario y te contactaremos en breve por este mismo medio.`;

      // Create AlertaHumano
      const newAlert: AlertaHumano = {
        id: `alt-${Date.now()}`,
        telefono: sender,
        nombreCliente: canal === 'WhatsApp' ? `Cliente WhatsApp (${sender.slice(-4)})` : `Usuario Telegram (${sender})`,
        canal,
        mensaje: texto,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        atendida: false,
      };

      setAlertasHumano((prev) => [newAlert, ...prev]);

      // Subtle notification chime via Web Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {
        // audio fail safe
      }
    } else if (clean.includes('catalogo') || clean.includes('catálogo') || clean.includes('productos') || clean.includes('precio')) {
      nuevoEstado = 'navegando_catalogo';
      const sample = productos.slice(0, 3).map((p) => `• *${p.Nombre}*: $${p['Precio (USD)'].toFixed(2)} / Bs. ${(p['Precio (USD)'] * configuracion.Tasa_USD_VES).toFixed(2)}`).join('\n');
      reply = `🌿 *Catálogo Inverza Commerce*\n\nNovedades destacadas hoy:\n${sample}\n\n👉 Puedes descargar el Catálogo en PDF completo o escribir el nombre de lo que buscas para agregarlo a tu carrito. Tasa oficial: *Bs. ${configuracion.Tasa_USD_VES.toFixed(2)}*.\n\nEscribe *humano* si deseas hablar con nuestro equipo.`;
    } else if (clean.includes('quiero') || clean.includes('agregar') || clean.includes('comprar')) {
      nuevoEstado = 'armando_carrito';
      reply = `🛒 *Artículo añadido a tu pedido*\n\nHemos tomado nota. ¿Deseas algo más o prefieres procesar tu pago por *Pago Móvil*, *BNC* o *CrixtoPay*? Escribe *pagar* o *humano* para coordinar el despacho.`;
    } else {
      reply = `¡Hola! Bienvenido a *Inverza Commerce* 🌿.\n\n¿En qué podemos ayudarte hoy?\n1️⃣ Escribe *catalogo* para ver precios y existencias.\n2️⃣ Escribe *humano* o *asesor* para ser atendido por un ejecutivo.\n3️⃣ Tasa del día: *Bs. ${configuracion.Tasa_USD_VES.toFixed(2)}* por USD.`;
    }

    // Update SesionesActivas
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSesiones((prev) => {
      const idx = prev.findIndex((s) => s.Telefono === sender);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          EstadoActual: nuevoEstado,
          UltimaInteraccion: nowStr,
        };
        return updated;
      }
      return [
        {
          Telefono: sender,
          Canal: canal,
          EstadoActual: nuevoEstado,
          CarritoJSON: '[]',
          UltimaInteraccion: nowStr,
        },
        ...prev,
      ];
    });

    return { reply, isHumano };
  };

  const resolveAlertaHumano = (id: string) => {
    setAlertasHumano((prev) =>
      prev.map((a) => (a.id === id ? { ...a, atendida: true } : a))
    );
  };

  // Direct sync with Google Apps Script
  const syncWithGoogleAppsScript = async () => {
    if (!configuracion.Google_Apps_Script_URL) {
      setSyncStatus('local');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch(`${configuracion.Google_Apps_Script_URL}?action=getData`);
      const json = await res.json();
      if (json && json.status === 'success' && json.data) {
        if (json.data.productos && json.data.productos.length > 0) setProductos(json.data.productos);
        if (json.data.existencia && json.data.existencia.length > 0) setExistencia(json.data.existencia);
        if (json.data.cuentas && json.data.cuentas.length > 0) setCuentas(json.data.cuentas);
        if (json.data.ventas && json.data.ventas.length > 0) setVentas(json.data.ventas);
        if (json.data.configuracion) setConfiguracion((prev) => ({ ...prev, ...json.data.configuracion }));
        setSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Error sincronizando con Google Apps Script:', err);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const resetToDefaultData = () => {
    setProductos(INITIAL_PRODUCTOS);
    setExistencia(INITIAL_EXISTENCIA);
    setCuentas(INITIAL_CUENTAS);
    setVentas(INITIAL_VENTAS);
    setConfiguracion(INITIAL_CONFIG);
    setSesiones(INITIAL_SESIONES);
    setAlertasHumano(INITIAL_ALERTAS_HUMANO);
    setCart([]);
    localStorage.clear();
  };

  return (
    <CommerceContext.Provider
      value={{
        productos,
        existencia,
        cuentas,
        ventas,
        configuracion,
        sesiones,
        alertasHumano,
        cart,
        isCartOpen,
        activeTab,
        isSyncing,
        syncStatus,
        lastSyncTime,
        selectedProductForDetail,
        lastCompletedSale,
        setActiveTab,
        setIsCartOpen,
        setSelectedProductForDetail,
        setLastCompletedSale,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotalUSD,
        cartTotalVES,
        getStockForProduct,
        processSale,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        updateCuentaSaldo,
        updateConfiguracion,
        simulateBotMessage,
        resolveAlertaHumano,
        syncWithGoogleAppsScript,
        resetToDefaultData,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
};
