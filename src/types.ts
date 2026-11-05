export interface Producto {
  id: string; // UUID
  Nombre: string;
  Tipo: 'Producto' | 'Servicio';
  Categoría: string;
  SKU: string;
  'Código de barras': string;
  'Precio (USD)': number;
  Unidad: string; // 'UND', 'KG', 'L', 'PAQ'
  'Controlar inventario (sí/no)': 'sí' | 'no';
  'Se vende (sí/no)': 'sí' | 'no';
  'Stock mínimo': number;
  'Activo (sí/no)': 'sí' | 'no';
  Imagen_URL: string;
}

export interface Existencia {
  id: string;
  Producto: string; // Nombre o ID
  SKU: string;
  Ubicación: string; // 'Principal'
  Cantidad: number;
  'Costo unitario': number;
}

export interface Cuenta {
  id: string;
  Nombre: string; // Ej: BNC Empresa, Pago Móvil, CrixtoPay, Efectivo USD
  Tipo: 'Banco' | 'Móvil' | 'Cripto' | 'Efectivo';
  Moneda: 'USD' | 'VES';
  'Saldo de hoy': number;
  Estado: 'Activo' | 'Inactivo';
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

export interface DetalleVentaItem {
  id: string;
  nombre: string;
  sku: string;
  cantidad: number;
  precioUSD: number;
  subtotalUSD: number;
}

export interface Venta {
  id: string;
  Fecha: string; // ISO string o formato legible
  Cliente: string; // Teléfono / Nombre
  'Total USD': number;
  'Total VES': number;
  'Método de Pago': string;
  Estado: 'Completada' | 'Pendiente' | 'Cancelada';
  Detalle: string; // JSON con DetalleVentaItem[]
}

export interface Configuracion {
  Tasa_USD_VES: number;
  Nombre_Negocio: string;
  Telefono_WhatsApp: string;
  Direccion_Fisica: string;
  Mensaje_Bienvenida_Bot: string;
  Google_Apps_Script_URL?: string;
  Auto_Sync: boolean;
}

export interface SesionActiva {
  Telefono: string;
  Canal: 'WhatsApp' | 'Telegram';
  EstadoActual: 'inicio' | 'navegando_catalogo' | 'armando_carrito' | 'esperando_pago' | 'esperando_asesor';
  CarritoJSON: string;
  UltimaInteraccion: string;
}

export interface AlertaHumano {
  id: string;
  telefono: string;
  nombreCliente: string;
  canal: 'WhatsApp' | 'Telegram';
  mensaje: string;
  fecha: string;
  atendida: boolean;
}
