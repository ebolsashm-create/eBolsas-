import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  Send,
  PhoneCall,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useCommerce } from '../context/CommerceContext';
import { SesionActiva, AlertaHumano } from '../types';

export const BotMessagingView: React.FC = () => {
  const {
    sesiones,
    alertasHumano,
    simulateBotMessage,
    resolveAlertaHumano,
    configuracion,
  } = useCommerce();

  // Chat simulator state
  const [selectedCanal, setSelectedCanal] = useState<'WhatsApp' | 'Telegram'>('WhatsApp');
  const [senderPhone, setSenderPhone] = useState('+584128876543');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; time: string }>
  >([
    {
      sender: 'bot',
      text: configuracion.Mensaje_Bienvenida_Bot,
      time: '11:00 AM',
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory((prev) => [...prev, { sender: 'user', text: textToSend, time: userTime }]);
    if (!customText) setInputText('');

    setIsBotTyping(true);

    // Simulate network delay to bot engine
    setTimeout(async () => {
      const res = await simulateBotMessage(senderPhone, selectedCanal, textToSend);
      const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatHistory((prev) => [...prev, { sender: 'bot', text: res.reply, time: botTime }]);
      setIsBotTyping(false);
    }, 600);
  };

  const getStatusBadge = (estado: SesionActiva['EstadoActual']) => {
    switch (estado) {
      case 'esperando_asesor':
        return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold animate-pulse">Humano Solicitado</span>;
      case 'armando_carrito':
        return <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">Armando Carrito</span>;
      case 'navegando_catalogo':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Navegando Catálogo</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium">{estado}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Agente Conversacional
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Bot de Ventas & Centro de Mensajería
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manejo inteligente de pedidos por WhatsApp y Telegram conectado a la hoja <code className="font-mono text-slate-700 font-bold">SesionesActivas</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-2xl text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Webhook Activo</span>
          </span>
        </div>
      </div>

      {/* Unresolved Human Alerts Panel */}
      {alertasHumano.some((a) => !a.atendida) && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800">
              <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
              <h3 className="text-sm font-bold">
                Alertas de Atención Humana Prioritarias ({alertasHumano.filter((a) => !a.atendida).length})
              </h3>
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              Clientes que escribieron "humano" o "asesor"
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alertasHumano
              .filter((a) => !a.atendida)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="bg-white p-3.5 rounded-2xl border border-rose-200 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-bold text-slate-900">{alert.nombreCliente}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{alert.fecha}</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">"{alert.mensaje}"</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                      Canal: {alert.canal} • {alert.telefono}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => resolveAlertaHumano(alert.id)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
                    >
                      Marcar Atendida
                    </button>

                    <button
                      onClick={() => {
                        const clean = alert.telefono.replace(/[^0-9]/g, '');
                        window.open(`https://wa.me/${clean}?text=Hola,%20soy%20tu%20asesor%20de%20Inverza%20Commerce.%20¿En%20qué%20puedo%20apoyarte?`, '_blank');
                        resolveAlertaHumano(alert.id);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Abrir Chat Directo</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Grid: Active Sessions vs Chat Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: SesionesActivas Viewer */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sesiones Activas en Google Sheets</h3>
              <p className="text-xs text-slate-400">Hoja: <code className="font-mono text-slate-700">SesionesActivas</code></p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{sesiones.length} sesiones</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {sesiones.map((s, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-slate-200 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 block">
                      {s.Telefono}
                    </span>
                    <span className="text-[10px] text-slate-400">Canal: {s.Canal}</span>
                  </div>
                  {getStatusBadge(s.EstadoActual)}
                </div>

                <div className="text-[11px] text-slate-500 flex justify-between items-center pt-1 border-t border-slate-200/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Última: {s.UltimaInteraccion}</span>
                  </span>
                  <button
                    onClick={() => {
                      setSenderPhone(s.Telefono);
                      setSelectedCanal(s.Canal);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    Cargar en simulador →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interactive Bot Simulator */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4 flex flex-col h-[600px]">
          {/* Simulator Bar */}
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Simulador de Bot de Ventas</h3>
                <p className="text-[10px] text-slate-400">Prueba el flujo del cliente en tiempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
                <button
                  onClick={() => setSelectedCanal('WhatsApp')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCanal === 'WhatsApp' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setSelectedCanal('Telegram')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedCanal === 'Telegram' ? 'bg-sky-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Telegram
                </button>
              </div>
            </div>
          </div>

          {/* Preset Buttons for Quick Testing */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Atajos de prueba:</span>
            <button
              onClick={() => handleSendMessage('catalogo')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition-colors"
            >
              "catalogo"
            </button>
            <button
              onClick={() => handleSendMessage('quiero 2 Café San Pedro')}
              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-medium transition-colors"
            >
              "quiero 2 Café San Pedro"
            </button>
            <button
              onClick={() => handleSendMessage('humano')}
              className="px-2 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md text-[10px] font-bold transition-colors"
            >
              "humano" (Alerta)
            </button>
            <button
              onClick={() => handleSendMessage('asesor')}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md text-[10px] font-bold transition-colors"
            >
              "asesor"
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs whitespace-pre-wrap leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex items-center gap-1.5 p-2 bg-white rounded-xl border border-slate-200/60 max-w-24 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Escribe un mensaje de prueba (ej: catalogo, asesor, quiero 2 café)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
