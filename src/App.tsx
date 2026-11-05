import React, { useState } from 'react';
import { CommerceProvider, useCommerce } from './context/CommerceContext';
import { Header } from './components/Header';
import { CatalogView } from './components/CatalogView';
import { PosView } from './components/PosView';
import { AdminView } from './components/AdminView';
import { BotMessagingView } from './components/BotMessagingView';
import { GasIntegrationModal } from './components/GasIntegrationModal';
import { CartDrawer } from './components/CartDrawer';
import { PdfCatalogModal } from './components/PdfCatalogModal';

const MainContent: React.FC = () => {
  const { activeTab, configuracion } = useCommerce();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0F172A] flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'catalogo' && <CatalogView />}
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'admin' && <AdminView onOpenPdfCatalog={() => setIsPdfModalOpen(true)} />}
        {activeTab === 'bot' && <BotMessagingView />}
        {activeTab === 'gas' && <GasIntegrationModal />}
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Minimalist Printable PDF Catalog Modal */}
      <PdfCatalogModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Minimalist Clean Footer */}
      <footer className="border-t border-slate-100 bg-white/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">{configuracion.Nombre_Negocio}</span>
            <span>•</span>
            <span>Google Sheets & Google Sites Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Tasa BCV: Bs. {configuracion.Tasa_USD_VES.toFixed(2)}</span>
            <span>•</span>
            <span>BNC / Pago Móvil / CrixtoPay</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CommerceProvider>
      <MainContent />
    </CommerceProvider>
  );
}
