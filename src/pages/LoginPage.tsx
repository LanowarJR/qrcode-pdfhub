import { supabase } from '../lib/supabase';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const handleLogin = async () => {
    if (!supabase) {
      alert("Configuração do Supabase ausente. Verifique as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200"
      >
        <div className="p-10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="p-5 bg-slate-900 text-amber-500 rounded-2xl shadow-xl shadow-slate-900/20">
              <ShieldCheck size={48} />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">QR-Code PDF HUB</h1>
          <p className="text-slate-400 mb-10 text-sm font-medium uppercase tracking-[0.1em]">
            Gestão de documentos PDF
          </p>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] duration-200"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Acessar com Google
          </button>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Acesso Restrito
            </p>
          </div>
        </div>
        
        <div className="bg-slate-50 px-10 py-4 flex justify-center border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium">Compliance & Security System v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
