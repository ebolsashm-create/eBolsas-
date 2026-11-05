import React, { useState } from 'react';
import {
  Code,
  FileCode,
  Globe,
  Copy,
  Check,
  Download,
  ExternalLink,
  PlayCircle,
  Database,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { GAS_CODE_GS, GAS_INDEX_HTML, GOOGLE_SITES_EMBED_GUIDE } from '../services/gasCode';
import { useCommerce } from '../context/CommerceContext';

export const GasIntegrationModal: React.FC = () => {
  const {
    configuracion,
    updateConfiguracion,
    syncWithGoogleAppsScript,
    isSyncing,
    syncStatus,
    lastSyncTime,
    resetToDefaultData,
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<'codegs' | 'indexhtml' | 'guia' | 'conector'>('codegs');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(false);
  const [copiedIframe, setCopiedIframe] = useState(false);

  const handleCopy = (text: string, type: 'code' | 'index' | 'iframe') => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'index') {
      setCopiedIndex(true);
      setTimeout(() => setCopiedIndex(false), 2000);
    } else {
      setCopiedIframe(true);
      setTimeout(() => setCopiedIframe(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const iframeSnippet = `<iframe 
  src="${configuracion.Google_Apps_Script_URL || 'TU_URL_DE_APPS_SCRIPT_AQUI'}" 
  width="100%" 
  height="900" 
  frameborder="0" 
  style="border: 0; width: 100%; min-height: 900px; border-radius: 20px; overflow: hidden;"
  allow="camera; clipboard-write;"
></iframe>`;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Arquitectura Google Cloud / Workspace
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Google Apps Script & Google Sites Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Código fuente completo de backend (<code className="font-mono text-slate-700">Code.gs</code>), frontend (<code className="font-mono text-slate-700">Index.html</code>) y guía de incrustación transparente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('Code.gs', GAS_CODE_GS, 'text/javascript')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Code.gs</span>
          </button>
          <button
            onClick={() => handleDownload('Index.html', GAS_INDEX_HTML, 'text/html')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Index.html</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200/80 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('codegs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'codegs'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Code.gs (Backend & API)</span>
        </button>

        <button
          onClick={() => setActiveTab('indexhtml')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'indexhtml'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Index.html (Frontend GAS)</span>
        </button>

        <button
          onClick={() => setActiveTab('guia')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'guia'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Guía de Publicación e Incrustación</span>
        </button>

        <button
          onClick={() => setActiveTab('conector')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'conector'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Conector en Vivo (URL WebApp)</span>
        </button>
      </div>

      {/* Tab 1: Code.gs Viewer */}
      {activeTab === 'codegs' && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono ml-2 font-medium">Code.gs — Google Apps Script</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(GAS_CODE_GS, 'code')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
          </div>

          <pre className="p-6 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-slate-800">
            {GAS_CODE_GS}
          </pre>
        </div>
      )}

      {/* Tab 2: Index.html Viewer */}
      {activeTab === 'indexhtml' && (
        <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="font-mono ml-2 font-medium">Index.html — GAS HtmlService Template</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(GAS_INDEX_HTML, 'index')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                {copiedIndex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex ? '¡Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>
          </div>

          <pre className="p-6 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-slate-800">
            {GAS_INDEX_HTML}
          </pre>
        </div>
      )}

      {/* Tab 3: Step-by-Step Guide */}
      {activeTab === 'guia' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Crear Sheet & Abrir Apps Script</h4>
              <p className="text-xs text-slate-500">
                Abre Google Sheets, ve a <strong>Extensiones &gt; Apps Script</strong> y pega el código de <code className="font-mono">Code.gs</code> e <code className="font-mono">Index.html</code>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ejecutar setupSheets()</h4>
              <p className="text-xs text-slate-500">
                Selecciona la función <code className="font-mono">setupSheets()</code> en el selector superior y haz clic en <strong>Ejecutar</strong> para generar las 6 hojas de forma automática.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs space-y-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Incrustar en Google Sites</h4>
              <p className="text-xs text-slate-500">
                Implementa como Web App con acceso "Cualquiera" e incrusta el código iframe transparente en tu página de Google Sites.
              </p>
            </div>
          </div>

          {/* Iframe snippet box */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Código de Incrustación para Google Sites</h4>
                <p className="text-xs text-slate-500">Copia y pega en Google Sites &gt; Insertar &gt; Código:</p>
              </div>
              <button
                onClick={() => handleCopy(iframeSnippet, 'iframe')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {copiedIframe ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIframe ? 'Copiado al portapapeles' : 'Copiar Iframe'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs text-slate-800 font-mono overflow-x-auto">
              {iframeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 4: Live Connector */}
      {activeTab === 'conector' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Conexión con tu Web App Desplegada</h3>
            <p className="text-xs text-slate-500">
              Pega aquí la URL de tu implementación de Google Apps Script (que termina en <code className="font-mono">/exec</code>) para sincronizar en vivo datos reales de tu Google Sheet.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                URL de Google Apps Script Web App
              </label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                value={configuracion.Google_Apps_Script_URL || ''}
                onChange={(e) => updateConfiguracion({ Google_Apps_Script_URL: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={syncWithGoogleAppsScript}
                disabled={isSyncing || !configuracion.Google_Apps_Script_URL}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-semibold transition-all shadow-sm disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Conectando con Google Sheets...' : 'Sincronizar Datos Ahora'}</span>
              </button>

              <button
                onClick={() => {
                  if (confirm('¿Restablecer datos a valores de prueba iniciales de Inverza?')) {
                    resetToDefaultData();
                  }
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-colors"
              >
                Restablecer a Datos de Prueba
              </button>
            </div>

            {lastSyncTime && (
              <p className="text-xs text-emerald-700 font-medium">
                Última sincronización exitosa: {lastSyncTime}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
