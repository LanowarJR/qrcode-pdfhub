import { useState, useRef, ChangeEvent } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User;
}

export default function UploadModal({ isOpen, onClose, onSuccess, user }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Por favor, selecione apenas arquivos PDF.");
        return;
      }
      setFile(selectedFile);
      setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!supabase) {
      setError("Configuração do Supabase ausente. Verifique as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.");
      return;
    }
    if (!file || !name) return;

    setIsUploading(true);
    setError(null);
    try {
      const docId = crypto.randomUUID();
      const storagePath = `${user.id}/${docId}-${file.name}`;

      // 1. Upload to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('qrcode_pdf_hub')
        .upload(storagePath, file);

      if (storageError) throw storageError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('qrcode_pdf_hub')
        .getPublicUrl(storagePath);

      // 3. Save to Supabase Database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          id: docId,
          name,
          url: publicUrl,
          storage_path: storagePath,
          owner_id: user.id,
          qr_id: docId,
          size: file.size,
          category,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      setIsSuccess(true);
      if (onSuccess) onSuccess();
      
      setTimeout(() => {
        setFile(null);
        setName("");
        setCategory("");
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao fazer upload do arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={!isUploading ? onClose : undefined} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Novo Upload</h2>
          <button 
            disabled={isUploading}
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center gap-4"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Upload Concluído!</h3>
                <p className="text-sm text-slate-500 mt-1">O documento foi processado e o QR Code gerado.</p>
              </div>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-xs font-bold border border-red-100">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group"
                >
                  <div className="p-4 bg-slate-50 text-slate-400 rounded-full group-hover:bg-amber-100 group-hover:text-amber-500 transition-all">
                    <Upload size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-700">Clique ou arraste o PDF</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-black">Processamento QR</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept=".pdf"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl flex items-center gap-4 border border-slate-100">
                    <div className="p-2 bg-slate-900 text-amber-500 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate text-sm">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button 
                      disabled={isUploading}
                      onClick={() => setFile(null)} 
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título do Documento</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Manual de Operação v1"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria / Pasta</label>
                      <input 
                        type="text" 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Manuais, Certificados..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-6 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs uppercase rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 tracking-widest"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || !name || isUploading}
                  className="flex-1 py-2.5 bg-amber-500 text-slate-900 font-bold text-xs uppercase rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50 disabled:bg-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-200 tracking-widest"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                      Processando...
                    </>
                  ) : (
                    "Finalizar Protocolo"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
