import { QRCodeSVG } from 'qrcode.react';
import { PDFDocument } from '../types';
import { X, Download, Copy, Check, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: PDFDocument;
}

export default function QRModal({ isOpen, onClose, pdfDoc }: QRModalProps) {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${window.location.origin}/v/${pdfDoc.qrId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${pdfDoc.id}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      ctx?.drawImage(img, 0, 0, 1000, 1000);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${pdfDoc.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden text-center"
      >
        <div className="p-8 pb-0 flex flex-col gap-1">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Código de Acesso QR</h2>
            <button 
                onClick={onClose} 
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
            >
                <X size={20} />
            </button>
           </div>
           <p className="text-xs text-slate-400 mb-8 px-4 leading-relaxed font-medium uppercase tracking-widest">
             Protocolo de Visualização Segura
           </p>
        </div>

        <div className="px-10 py-8 bg-slate-900 flex justify-center items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/20 blur-2xl rounded-full"></div>
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-slate-700 relative z-10">
                <QRCodeSVG 
                    id={`qr-${pdfDoc.id}`}
                    value={publicUrl} 
                    size={160}
                    level="H"
                    includeMargin={true}
                />
            </div>
        </div>

        <div className="p-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-left ml-1">Link de Acesso Direto</label>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="flex-1 text-[10px] text-slate-500 truncate text-left font-mono">{publicUrl}</span>
                    <button 
                        onClick={handleCopy}
                        className={cn(
                            "p-1.5 rounded transition-all",
                            copied ? "text-green-600 bg-green-50" : "text-slate-400 hover:bg-slate-200"
                        )}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={downloadQR}
                    className="flex-1 py-3 bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
                >
                    <Download size={16} />
                    PNG
                </button>
                <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                    <Printer size={16} />
                    Imprimir
                </button>
            </div>
        </div>
      </motion.div>

      {/* Hidden Print Layout */}
      <div className="hidden print-area">
        <h1 className="text-3xl font-bold mb-8 text-black text-center">{pdfDoc.name}</h1>
        <QRCodeSVG 
            value={publicUrl} 
            size={300}
            level="H"
            includeMargin={true}
        />
        <p className="mt-8 text-gray-500 font-mono text-sm">{publicUrl}</p>
      </div>
    </div>
  );
}
