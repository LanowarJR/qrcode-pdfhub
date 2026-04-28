import { useState } from 'react';
import { PDFDocument } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, QrCode, Trash2, ExternalLink, MoreVertical } from 'lucide-react';
import { formatBytes, cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import QRModal from './QRModal';

interface FileCardProps {
  doc: PDFDocument;
  onDelete?: () => void;
}

export default function FileCard({ doc: pdfDoc, onDelete }: FileCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (!supabase) {
      alert("Configuração do Supabase ausente.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este documento?")) return;
    
    setIsDeleting(true);
    try {
      // 1. Delete from Supabase Database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', pdfDoc.id);

      if (dbError) throw dbError;
      
      // 2. Delete from Supabase Storage
      if (pdfDoc.storagePath) {
        await supabase.storage
          .from('qrcode_pdf_hub')
          .remove([pdfDoc.storagePath]);
      }
      
      if (onDelete) onDelete();
    } catch (error) {
      console.error("Delete failed", error);
      alert("Erro ao excluir o arquivo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 group hover:shadow-md transition-all duration-300 flex flex-col gap-4 relative overflow-hidden h-full">
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
          <FileText size={20} />
        </div>
        
        <div className="flex items-center gap-1">
           <button
            onClick={() => setShowQR(true)}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
            title="Ver QR Code"
          >
            <QrCode size={18} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <MoreVertical size={18} />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                  >
                    <Trash2 size={16} />
                    Excluir Documento
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight mb-1 min-h-[2.5rem]" title={pdfDoc.name}>
          {pdfDoc.name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {pdfDoc.category ? (
            <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase rounded tracking-wider">
              {pdfDoc.category}
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded tracking-wider">
              FISPQ
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1 border-t border-slate-50 pt-2">
          <div className="flex justify-between items-center text-[11px] font-medium">
            <span className="text-slate-400 uppercase tracking-tight">Tamanho</span>
            <span className="text-slate-600 font-mono">{pdfDoc.size ? formatBytes(pdfDoc.size) : "--"}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-medium">
            <span className="text-slate-400 uppercase tracking-tight">Postado</span>
            <span className="text-slate-600 font-mono">{format(pdfDoc.createdAt, "dd MMM yyyy", { locale: ptBR })}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <a 
          href={pdfDoc.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded transition-all uppercase"
        >
          <ExternalLink size={12} />
          Ver
        </a>
        <button 
          onClick={() => setShowQR(true)}
          className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded transition-all uppercase"
        >
          <QrCode size={12} />
          QR
        </button>
      </div>

      <QRModal 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
        pdfDoc={pdfDoc}
      />
    </div>
  );
}
