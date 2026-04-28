import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { PDFDocument } from '../types';
import { FileText, Search, Plus, Info } from 'lucide-react';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [docs, setDocs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDocs = async (showLoading = true) => {
    if (!supabase) return;
    if (showLoading) setLoading(true);
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      const formattedDocs: PDFDocument[] = (data || []).map(doc => ({
        ...doc,
        ownerId: doc.owner_id,
        storagePath: doc.storage_path,
        qrId: doc.qr_id,
        createdAt: new Date(doc.created_at).getTime(),
      }));
      setDocs(formattedDocs);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();

    // Set up real-time subscription
    const channel = supabase
      ?.channel('documents_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'documents',
        filter: `owner_id=eq.${user.id}`
      }, () => {
        fetchDocs(false);
      })
      .subscribe();

    return () => {
      if (channel) supabase?.removeChannel(channel);
    };
  }, [user.id]);

  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-slate-800">QR-Code PDF HUB</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={16} />
            Novo PDF
          </button>
        </div>
      </header>

      <div className="p-4 md:p-8 flex flex-col gap-6 md:gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Arquivos Ativos</h2>
            <p className="text-xs text-slate-400">Total de {docs.length} documentos gerenciados</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Pesquisar documento..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-start">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900/80">
            <p className="font-semibold text-blue-900">Dica de Gestão</p>
            <p>Os códigos QR gerados permitem acesso instantâneo ao PDF original para visualização em campo.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
            <p className="text-slate-500 font-medium tracking-tight">Sincronizando arquivos...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileCard 
                    doc={doc} 
                    onDelete={() => fetchDocs(false)} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="p-4 bg-slate-50 rounded-2xl text-slate-300 mb-4">
              <FileText size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              {searchTerm ? "Nenhum resultado" : "Repositório Vazio"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">
              {searchTerm ? "Não encontramos documentos com este termo." : "Comece subindo seus arquivos PDF para gerar códigos QR de acesso rápido."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Novo Upload
              </button>
            )}
          </div>
        )}
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onSuccess={() => fetchDocs(false)}
        user={user}
      />
    </div>
  );
}
