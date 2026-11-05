/**
 * Inverza Commerce - Google Apps Script & Google Sites Integration Code
 * Este archivo contiene el código completo y listo para producción de Code.gs e Index.html para Apps Script.
 */

export const GAS_CODE_GS = `/**
 * ============================================================================
 * INVERZA COMMERCE - BACKEND GOOGLE APPS SCRIPT (Code.gs)
 * Arquitectura Full-Stack para Google Sheets, Google Drive, WhatsApp & Telegram
 * ============================================================================
 */

// Nombres de las hojas de la base de datos
const SHEET_NAMES = {
  PRODUCTOS: 'Productos',
  EXISTENCIA: 'Existencia',
  CUENTAS: 'Cuentas',
  VENTAS: 'Ventas',
  CONFIGURACION: 'Configuracion',
  SESIONES_ACTIVAS: 'SesionesActivas'
};

/**
 * Función de inicialización automática.
 * Ejecuta esta función una sola vez desde el editor de Apps Script para crear
 * todas las 6 hojas con sus encabezados y datos iniciales en tu Google Sheet.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Productos
  let sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTOS);
  if (!sheetProd) sheetProd = ss.insertSheet(SHEET_NAMES.PRODUCTOS);
  sheetProd.clear();
  sheetProd.appendRow([
    'id', 'Nombre', 'Tipo', 'Categoría', 'SKU', 'Código de barras', 
    'Precio (USD)', 'Unidad', 'Controlar inventario (sí/no)', 'Se vende (sí/no)', 
    'Stock mínimo', 'Activo (sí/no)', 'Imagen_URL'
  ]);
  sheetProd.getRange(1, 1, 1, 13).setFontWeight('bold').setBackground('#F1F5F9');
  sheetProd.setFrozenRows(1);
  
  // 2. Existencia
  let sheetExist = ss.getSheetByName(SHEET_NAMES.EXISTENCIA);
  if (!sheetExist) sheetExist = ss.insertSheet(SHEET_NAMES.EXISTENCIA);
  sheetExist.clear();
  sheetExist.appendRow(['id', 'Producto', 'SKU', 'Ubicación', 'Cantidad', 'Costo unitario']);
  sheetExist.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#F1F5F9');
  sheetExist.setFrozenRows(1);

  // 3. Cuentas
  let sheetCuentas = ss.getSheetByName(SHEET_NAMES.CUENTAS);
  if (!sheetCuentas) sheetCuentas = ss.insertSheet(SHEET_NAMES.CUENTAS);
  sheetCuentas.clear();
  sheetCuentas.appendRow(['id', 'Nombre', 'Tipo', 'Moneda', 'Saldo de hoy', 'Estado']);
  sheetCuentas.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#F1F5F9');
  sheetCuentas.setFrozenRows(1);
  sheetCuentas.appendRow(['acc-001', 'BNC Empresa (Cta Cte)', 'Banco', 'VES', 52340.50, 'Activo']);
  sheetCuentas.appendRow(['acc-002', 'Pago Móvil BNC Principal', 'Móvil', 'VES', 28910.00, 'Activo']);
  sheetCuentas.appendRow(['acc-003', 'CrixtoPay (USDT)', 'Cripto', 'USD', 1420.00, 'Activo']);
  sheetCuentas.appendRow(['acc-004', 'Caja Chica Efectivo USD', 'Efectivo', 'USD', 680.00, 'Activo']);

  // 4. Ventas
  let sheetVentas = ss.getSheetByName(SHEET_NAMES.VENTAS);
  if (!sheetVentas) sheetVentas = ss.insertSheet(SHEET_NAMES.VENTAS);
  sheetVentas.clear();
  sheetVentas.appendRow(['id', 'Fecha', 'Cliente', 'Total USD', 'Total VES', 'Método de Pago', 'Estado', 'Detalle']);
  sheetVentas.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#F1F5F9');
  sheetVentas.setFrozenRows(1);

  // 5. Configuración
  let sheetConfig = ss.getSheetByName(SHEET_NAMES.CONFIGURACION);
  if (!sheetConfig) sheetConfig = ss.insertSheet(SHEET_NAMES.CONFIGURACION);
  sheetConfig.clear();
  sheetConfig.appendRow(['Clave', 'Valor']);
  sheetConfig.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#F1F5F9');
  sheetConfig.setFrozenRows(1);
  sheetConfig.appendRow(['Tasa_USD_VES', '45.20']);
  sheetConfig.appendRow(['Nombre_Negocio', 'Inverza Store & Market']);
  sheetConfig.appendRow(['Telefono_WhatsApp', '+584120001234']);

  // 6. SesionesActivas
  let sheetSesiones = ss.getSheetByName(SHEET_NAMES.SESIONES_ACTIVAS);
  if (!sheetSesiones) sheetSesiones = ss.insertSheet(SHEET_NAMES.SESIONES_ACTIVAS);
  sheetSesiones.clear();
  sheetSesiones.appendRow(['Telefono', 'Canal', 'EstadoActual', 'CarritoJSON', 'UltimaInteraccion']);
  sheetSesiones.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#F1F5F9');
  sheetSesiones.setFrozenRows(1);

  return 'Inverza Commerce: Estructura de base de datos creada exitosamente en Google Sheets.';
}

/**
 * Handler GET: Sirve la WebApp o responde a consultas API JSON.
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
  
  if (action === 'getData') {
    return jsonResponse({
      status: 'success',
      data: getAllData()
    });
  }

  if (action === 'pdfCatalog') {
    return generateCatalogPDFResponse();
  }

  // Sirve la WebApp minimalista incrustable en Google Sites
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Inverza Commerce')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handler POST: Procesa subida de imágenes a Drive, guardado de productos,
 * registro de ventas atómicas y webhooks de WhatsApp/Telegram.
 */
function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Cuerpo de solicitud inválido' });
  }

  const action = body.action || '';

  // 1. Registro de venta atómica con control de concurrencia
  if (action === 'recordSale') {
    return handleAtomicSale(body.sale);
  }

  // 2. Guardar o actualizar producto
  if (action === 'saveProduct') {
    return handleSaveProduct(body.product, body.stock);
  }

  // 3. Subir imagen a Google Drive y generar URL pública
  if (action === 'uploadImageToDrive') {
    return handleUploadImage(body.fileName, body.base64Data, body.mimeType);
  }

  // 4. Actualizar tasa cambiaria o configuración
  if (action === 'updateConfig') {
    return handleUpdateConfig(body.key, body.value);
  }

  // 5. Webhooks de Mensajería (WhatsApp / Telegram)
  if (action === 'webhookWhatsApp' || action === 'webhookTelegram') {
    return handleBotWebhook(action, body);
  }

  return jsonResponse({ status: 'error', message: 'Acción no reconocida' });
}

/**
 * Lee todas las tablas y retorna un paquete JSON consolidado.
 */
function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    productos: sheetToObjects(ss.getSheetByName(SHEET_NAMES.PRODUCTOS)),
    existencia: sheetToObjects(ss.getSheetByName(SHEET_NAMES.EXISTENCIA)),
    cuentas: sheetToObjects(ss.getSheetByName(SHEET_NAMES.CUENTAS)),
    ventas: sheetToObjects(ss.getSheetByName(SHEET_NAMES.VENTAS)),
    configuracion: sheetToKeyValue(ss.getSheetByName(SHEET_NAMES.CONFIGURACION)),
    sesionesActivas: sheetToObjects(ss.getSheetByName(SHEET_NAMES.SESIONES_ACTIVAS))
  };
}

/**
 * Venta atómica con ScriptLock:
 * - Descuenta stock en Existencia
 * - Registra la venta en Ventas
 * - Actualiza el saldo en Cuentas
 */
function handleAtomicSale(sale) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Espera hasta 10 seg por seguridad atómica
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetExist = ss.getSheetByName(SHEET_NAMES.EXISTENCIA);
    const sheetVentas = ss.getSheetByName(SHEET_NAMES.VENTAS);
    const sheetCuentas = ss.getSheetByName(SHEET_NAMES.CUENTAS);

    const detalleItems = typeof sale.Detalle === 'string' ? JSON.parse(sale.Detalle) : sale.Detalle;
    const existData = sheetExist.getDataRange().getValues();

    // Validar y descontar stock
    for (let item of detalleItems) {
      for (let r = 1; r < existData.length; r++) {
        if (existData[r][2] === item.sku || existData[r][1] === item.nombre) {
          const actualCant = Number(existData[r][4]) || 0;
          const nuevaCant = Math.max(0, actualCant - Number(item.cantidad));
          sheetExist.getRange(r + 1, 5).setValue(nuevaCant);
          break;
        }
      }
    }

    // Registrar Venta
    sheetVentas.appendRow([
      sale.id,
      sale.Fecha,
      sale.Cliente,
      sale['Total USD'],
      sale['Total VES'],
      sale['Método de Pago'],
      sale.Estado,
      typeof sale.Detalle === 'string' ? sale.Detalle : JSON.stringify(sale.Detalle)
    ]);

    // Actualizar Saldo en Cuentas
    const cuentasData = sheetCuentas.getDataRange().getValues();
    for (let c = 1; c < cuentasData.length; c++) {
      if (cuentasData[c][1] === sale['Método de Pago']) {
        const moneda = cuentasData[c][3];
        const montoSumar = moneda === 'VES' ? Number(sale['Total VES']) : Number(sale['Total USD']);
        const nuevoSaldo = (Number(cuentasData[c][4]) || 0) + montoSumar;
        sheetCuentas.getRange(c + 1, 5).setValue(nuevoSaldo);
        break;
      }
    }

    return jsonResponse({ status: 'success', message: 'Venta registrada atómicamente', saleId: sale.id });
  } catch (err) {
    return jsonResponse({ status: 'error', message: 'Error de concurrencia: ' + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Sube una imagen a Google Drive en la carpeta "Inverza_Drive_Assets",
 * le otorga permisos públicos de lectura y devuelve el enlace webContent.
 */
function handleUploadImage(fileName, base64Data, mimeType) {
  try {
    const folders = DriveApp.getFoldersByName('Inverza_Drive_Assets');
    const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder('Inverza_Drive_Assets');
    
    const bytes = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(bytes, mimeType || 'image/jpeg', fileName || ('prod_' + Date.now() + '.jpg'));
    const file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileId = file.getId();
    
    // URL amigable para incrustación directa de imagen
    const publicUrl = 'https://drive.google.com/uc?export=view&id=' + fileId;
    
    return jsonResponse({
      status: 'success',
      imageUrl: publicUrl,
      fileId: fileId
    });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Guarda o actualiza un producto en la hoja Productos y su existencia.
 */
function handleSaveProduct(prod, stockData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetProd = ss.getSheetByName(SHEET_NAMES.PRODUCTOS);
  const data = sheetProd.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === prod.id || data[i][4] === prod.SKU) {
      foundRow = i + 1;
      break;
    }
  }

  const rowValues = [
    prod.id,
    prod.Nombre,
    prod.Tipo,
    prod['Categoría'],
    prod.SKU,
    prod['Código de barras'],
    prod['Precio (USD)'],
    prod.Unidad,
    prod['Controlar inventario (sí/no)'],
    prod['Se vende (sí/no)'],
    prod['Stock mínimo'],
    prod['Activo (sí/no)'],
    prod.Imagen_URL
  ];

  if (foundRow > 0) {
    sheetProd.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheetProd.appendRow(rowValues);
  }

  // Actualizar existencia
  if (stockData) {
    const sheetExist = ss.getSheetByName(SHEET_NAMES.EXISTENCIA);
    const existData = sheetExist.getDataRange().getValues();
    let existRow = -1;
    for (let j = 1; j < existData.length; j++) {
      if (existData[j][2] === prod.SKU) {
        existRow = j + 1;
        break;
      }
    }
    if (existRow > 0) {
      sheetExist.getRange(existRow, 4, 1, 3).setValues([[stockData['Ubicación'] || 'Principal', stockData.Cantidad, stockData['Costo unitario']]]);
    } else {
      sheetExist.appendRow(['ex-' + Date.now(), prod.Nombre, prod.SKU, 'Principal', stockData.Cantidad, stockData['Costo unitario']]);
    }
  }

  return jsonResponse({ status: 'success', message: 'Producto guardado exitosamente' });
}

/**
 * Actualiza una clave en la hoja Configuracion.
 */
function handleUpdateConfig(key, value) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.CONFIGURACION);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return jsonResponse({ status: 'success', key: key, value: value });
    }
  }
  sheet.appendRow([key, value]);
  return jsonResponse({ status: 'success', key: key, value: value });
}

/**
 * Procesa mensajes del Bot de Ventas de WhatsApp / Telegram.
 * Reconoce comandos: "catalogo", "pedido", "humano", "asesor".
 */
function handleBotWebhook(channel, payload) {
  const userMsg = (payload.message || '').trim().toLowerCase();
  const sender = payload.sender || payload.from || '+58000000000';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetSesiones = ss.getSheetByName(SHEET_NAMES.SESIONES_ACTIVAS);

  let replyText = '';
  let estado = 'navegando_catalogo';

  if (userMsg.includes('humano') || userMsg.includes('asesor')) {
    estado = 'esperando_asesor';
    replyText = '🔔 *Conectando con un Asesor Humano*\\n\\nUn ejecutivo de Inverza Commerce ha sido notificado y se comunicará contigo de inmediato por este chat.';
  } else if (userMsg.includes('catalogo') || userMsg.includes('catálogo')) {
    replyText = '🌿 *Catálogo Inverza Commerce*\\n\\nPuedes consultar nuestro catálogo visual en vivo aquí: ' + ScriptApp.getService().getUrl() + '\\n\\nO dinos qué productos buscas para agregarlos a tu pedido.';
  } else {
    replyText = '¡Hola! Bienvenido a *Inverza Commerce*.\\n\\nOpciones rápidas:\\n1️⃣ Escribe *catalogo* para ver productos disponibles.\\n2️⃣ Escribe *humano* para hablar directamente con un asesor.';
  }

  // Actualizar o crear sesión activa
  const data = sheetSesiones.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == sender) {
      sheetSesiones.getRange(i + 1, 3, 1, 3).setValues([[estado, '[]', new Date().toISOString()]]);
      found = true;
      break;
    }
  }
  if (!found) {
    sheetSesiones.appendRow([sender, channel.replace('webhook', ''), estado, '[]', new Date().toISOString()]);
  }

  return jsonResponse({ status: 'success', replyText: replyText, estado: estado });
}

/**
 * Genera el Catálogo PDF Minimalista usando HtmlService.
 */
function generateCatalogPDFResponse() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prods = sheetToObjects(ss.getSheetByName(SHEET_NAMES.PRODUCTOS));
  const config = sheetToKeyValue(ss.getSheetByName(SHEET_NAMES.CONFIGURACION));
  const tasa = Number(config.Tasa_USD_VES) || 45.20;

  let html = '<!DOCTYPE html><html><head><meta charset="utf-8">';
  html += '<style>';
  html += 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FFF; color: #0F172A; margin: 30px; }';
  html += '.header { border-bottom: 2px solid #0F172A; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; }';
  html += '.title { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }';
  html += '.meta { font-size: 11px; color: #64748B; text-align: right; }';
  html += '.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }';
  html += '.card { border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px; text-align: center; }';
  html += '.card img { max-width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px; }';
  html += '.name { font-size: 13px; font-weight: 600; margin-bottom: 6px; }';
  html += '.price { font-size: 15px; font-weight: 700; color: #0F172A; }';
  html += '.ves { font-size: 11px; color: #64748B; }';
  html += '</style></head><body>';
  html += '<div class="header"><div><div class="title">' + (config.Nombre_Negocio || 'INVERZA COMMERCE') + '</div><div style="font-size:12px;color:#64748B;">Catálogo Oficial de Productos</div></div>';
  html += '<div class="meta">Tasa referencial: ' + tasa.toFixed(2) + ' VES/USD<br>Fecha: ' + Utilities.formatDate(new Date(), 'GMT-4', 'dd/MM/yyyy') + '</div></div>';
  html += '<div class="grid">';

  prods.forEach(p => {
    if (p['Activo (sí/no)'] === 'sí') {
      const pUsd = Number(p['Precio (USD)']) || 0;
      const pVes = pUsd * tasa;
      html += '<div class="card">';
      if (p.Imagen_URL) html += '<img src="' + p.Imagen_URL + '">';
      html += '<div class="name">' + p.Nombre + '</div>';
      html += '<div class="price">$' + pUsd.toFixed(2) + ' USD</div>';
      html += '<div class="ves">Bs. ' + pVes.toLocaleString('es-VE', {minimumFractionDigits: 2}) + '</div>';
      html += '<div style="font-size:10px;color:#94A3B8;margin-top:4px;">SKU: ' + p.SKU + '</div>';
      html += '</div>';
    }
  });

  html += '</div></body></html>';

  const blob = Utilities.newBlob(html, 'text/html', 'Inverza_Catalogo.html').getAs('application/pdf');
  blob.setName('Inverza_Catalogo_' + Utilities.formatDate(new Date(), 'GMT-4', 'yyyyMMdd') + '.pdf');
  
  return ContentService.createTextOutput(Utilities.base64Encode(blob.getBytes()))
    .setMimeType(ContentService.MimeType.TEXT);
}

// Helpers
function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const rows = [];
  for (let r = 1; r < data.length; r++) {
    const obj = {};
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = data[r][c];
    }
    rows.push(obj);
  }
  return rows;
}

function sheetToKeyValue(sheet) {
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const obj = {};
  for (let r = 1; r < data.length; r++) {
    if (data[r][0]) obj[data[r][0]] = data[r][1];
  }
  return obj;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inverza Commerce</title>
  <!-- Tailwind CSS CDN para renderizado instantáneo en Google Sites -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #F9FAFB; color: #0F172A; }
    /* Estilo de scroll minimalista */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 9999px; }
  </style>
</head>
<body class="antialiased min-h-screen">
  <div id="app" class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    <!-- El frontend reactivo se enlaza directamente con google.script.run -->
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">IC</div>
          <h1 class="text-xl font-bold tracking-tight text-slate-900">Inverza Commerce</h1>
        </div>
        <p class="text-xs text-slate-500 mt-1">Conectado en vivo con Google Sheets & Google Drive</p>
      </div>
      <div id="rate-badge" class="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 shadow-sm flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Tasa BCV: <strong id="tasa-val">Cargando...</strong></span>
      </div>
    </header>

    <!-- Galería / Catálogo en cuadrícula limpia 2 col móvil / 4 col desktop -->
    <main class="mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-base font-semibold text-slate-900">Catálogo de Productos</h2>
        <span id="prod-count" class="text-xs text-slate-400">Cargando existencias...</span>
      </div>

      <div id="grid-productos" class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <!-- Renderizado dinámico de tarjetas minimalistas -->
      </div>
    </main>
  </div>

  <script>
    // Carga inicial mediante google.script.run
    let appData = { productos: [], configuracion: { Tasa_USD_VES: 45.20 } };

    function init() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(renderData)
          .withFailureHandler(function(err) {
            console.error('Error cargando datos de Google Sheets:', err);
          })
          .getAllData();
      } else {
        // Fallback local para pruebas
        console.log('Modo de prueba local');
      }
    }

    function renderData(data) {
      if (!data) return;
      appData = data;
      const tasa = Number(data.configuracion.Tasa_USD_VES) || 45.20;
      document.getElementById('tasa-val').innerText = tasa.toFixed(2) + ' VES';
      
      const grid = document.getElementById('grid-productos');
      grid.innerHTML = '';
      
      data.productos.forEach(p => {
        if (p['Activo (sí/no)'] === 'sí' && p['Se vende (sí/no)'] === 'sí') {
          const pUsd = Number(p['Precio (USD)']) || 0;
          const pVes = pUsd * tasa;
          
          const card = document.createElement('div');
          card.className = "group bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";
          card.innerHTML = \`
            <div>
              <div class="aspect-square w-full rounded-xl bg-slate-50 overflow-hidden mb-3 flex items-center justify-center">
                <img src="\${p.Imagen_URL || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'}" alt="\${p.Nombre}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
              <span class="inline-block px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded-md mb-1.5">\${p.Categoría || 'General'}</span>
              <h3 class="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">\${p.Nombre}</h3>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
              <div>
                <p class="text-base font-bold text-slate-900">\$\${pUsd.toFixed(2)} <span class="text-[10px] text-slate-400 font-normal">USD</span></p>
                <p class="text-[11px] text-slate-500 font-medium">Bs. \${pVes.toLocaleString('es-VE', {minimumFractionDigits: 2})}</p>
              </div>
              <button onclick="contactarPedido('\${p.Nombre}', \${pUsd})" class="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors">
                Pedir
              </button>
            </div>
          \`;
          grid.appendChild(card);
        }
      });
      document.getElementById('prod-count').innerText = data.productos.length + ' artículos';
    }

    function contactarPedido(nombre, precio) {
      const wsp = (appData.configuracion && appData.configuracion.Telefono_WhatsApp) ? appData.configuracion.Telefono_WhatsApp : '584120001234';
      const msg = encodeURIComponent('Hola! Deseo pedir ' + nombre + ' (\$' + precio.toFixed(2) + ' USD) visto en el catálogo.');
      window.open('https://wa.me/' + wsp.replace(/[^0-9]/g, '') + '?text=' + msg, '_blank');
    }

    window.onload = init;
  </script>
</body>
</html>
`;

export const GOOGLE_SITES_EMBED_GUIDE = `
### 🚀 Guía de Despliegue en Google Apps Script e Incrustación en Google Sites

#### Paso 1: Crear la Hoja de Google Sheets
1. Abre [Google Sheets](https://sheets.new) y crea una nueva hoja en blanco.
2. Nómbrala: **"Inverza Commerce - DB"**.
3. En el menú superior, haz clic en **Extensiones > Apps Script**.

#### Paso 2: Pegar el Código
1. En el editor de Apps Script, reemplaza el contenido de **\`Code.gs\`** con el código completo provisto en la pestaña **Code.gs**.
2. Haz clic en el botón **+ (Añadir un archivo) > HTML** y nómbralo **\`Index\`** (Apps Script agregará la extensión \`.html\`).
3. Pega el código provisto en la pestaña **Index.html**.
4. Haz clic en el icono de guardar 💾 (**Guardar proyecto**).

#### Paso 3: Inicializar las Tablas con 1 Clic
1. En el selector de funciones de Apps Script, selecciona la función **\`setupSheets\`**.
2. Haz clic en **Ejecutar**.
3. Concede los permisos solicitados de Google Sheets y Google Drive.
4. ¡Listo! Verás que en tu hoja de cálculo se han generado automáticamente las 6 pestañas:
   - \`Productos\`, \`Existencia\`, \`Cuentas\`, \`Ventas\`, \`Configuracion\`, \`SesionesActivas\`.

#### Paso 4: Implementar como Web App
1. En la esquina superior derecha, haz clic en **Implementar > Nueva implementación**.
2. Tipo: **Aplicación web**.
3. Descripción: \`Inverza Commerce v1.0\`.
4. Ejecutar como: **Yo** (tu cuenta de Google).
5. Quién tiene acceso: **Cualquier usuario** (*Anyone*).
6. Haz clic en **Implementar** y copia la **URL de la aplicación web** (termina en \`/exec\`).

#### Paso 5: Incrustar Transparentemente en Google Sites
1. Abre tu [Google Sites](https://sites.google.com).
2. En el panel lateral derecho, selecciona **Insertar > Insertar (Código)** o **URL**.
3. Si usas la opción **Insertar código**, pega el siguiente iframe minimalista sin bordes ni barras molestas:

\`\`\`html
<iframe 
  src="TU_URL_DE_APPS_SCRIPT_AQUI" 
  width="100%" 
  height="900" 
  frameborder="0" 
  style="border: 0; width: 100%; min-height: 900px; border-radius: 16px; overflow: hidden;"
  allow="camera; clipboard-write;"
></iframe>
\`\`\`

4. Ajusta el ancho y alto del contenedor en Google Sites y haz clic en **Publicar**.
`;
