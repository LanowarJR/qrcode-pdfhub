import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PDFDocument } from '../types';
import { ShieldCheck, FileText, Download, AlertCircle, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function PublicViewer() {
  const { qrId } = useParams<{ qrId: string }>();
  const [docData, setDocData] = useState<PDFDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError("Configuração do Supabase ausente. Verifique as variáveis de ambiente.");
      setLoading(false);
      return;
    }

    const fetchDoc = async () => {
      if (!qrId) return;
      
      try {
        const { data, error: dbError } = await supabase
          .from('documents')
          .select('*')
          .eq('qr_id', qrId)
          .single();
        
        if (dbError || !data) {
          setError("Documento não encontrado ou código inválido.");
        } else {
          setDocData({
            ...data,
            ownerId: data.owner_id,
            storagePath: data.storage_path,
            qrId: data.qr_id,
            createdAt: new Date(data.created_at).getTime(),
          } as PDFDocument);
        }
      } catch (err) {
        console.error(err);
        setError("Ocorreu um erro ao buscar o documento.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [qrId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="text-slate-500 font-bold tracking-tighter uppercase text-xs">Validando Protocolos...</p>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <div className="p-4 bg-red-100 text-red-600 rounded-full mb-6 border border-red-200">
          <AlertCircle size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Erro de Acesso</h1>
        <p className="text-slate-500 max-w-md mb-8">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold uppercase text-xs hover:bg-slate-800 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // Fetch the file as a blob to force download from cross-origin
      const response = await fetch(docData.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = docData.name || 'documento.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback if fetch fails (e.g. CORS issues)
      window.open(docData.url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      <header className="bg-slate-900 text-white h-14 flex items-center px-6 sticky top-0 z-10 shadow-md border-b-2 border-amber-500">
        <div className="container mx-auto flex items-center gap-3">
          <ShieldCheck size={20} className="text-amber-500" />
          <span className="font-bold tracking-tight text-sm uppercase">QR-Code PDF HUB</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200"
        >
          <div className="p-8 pb-4 flex flex-col items-center text-center">
            <div className="p-4 bg-slate-50 text-slate-800 rounded-2xl mb-6 shadow-inner border border-slate-100">
                <FileText size={40} />
            </div>
            
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.2em] mb-2">Documento Digital</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 px-2 leading-tight tracking-tight">
              {docData.name}
            </h1>
          </div>

          <div className="px-8 flex flex-col gap-2">
             <div className="grid grid-cols-2 gap-4 py-5 border-y border-slate-50">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Emissão
                    </span>
                    <span className="text-sm font-bold text-slate-700 font-mono">
                        {format(docData.createdAt, "dd/MM/yyyy")}
                    </span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest flex items-center gap-1">
                        <MapPin size={10} /> Segurança
                    </span>
                    <span className="text-sm font-bold text-amber-600">
                        Link Verificado
                    </span>
                </div>
             </div>
             
             <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100/50 my-4">
               <p className="text-xs text-slate-600 leading-relaxed italic text-center">
                 "Acesso digital verificado. Utilize os botões abaixo para visualizar ou baixar o conteúdo original."
               </p>
             </div>
          </div>

          <div className="p-8 pt-2 flex flex-col gap-3">
             <a 
               href={docData.url}
               target="_blank"
               rel="noopener noreferrer"
               className="w-full py-4 bg-amber-500 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-lg shadow-amber-100 text-base uppercase active:scale-95"
             >
               <ExternalLink size={18} />
               Visualizar PDF
             </a>
             <button 
               onClick={handleDownload}
               className="w-full py-3 bg-slate-50 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all text-xs uppercase"
             >
               <Download size={16} />
               Baixar PDF
             </button>
          </div>

          <div className="bg-slate-900 p-5 flex flex-col items-center gap-2">
             <div className="flex items-center gap-2 text-amber-500/50">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] leading-none">Security Protocol Active</span>
             </div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center gap-2 text-slate-400">
          <div className="h-px w-12 bg-slate-300"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest">QR-Code PDF HUB &bull; {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}

function Check({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    )
}
