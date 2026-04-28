import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogOut, ShieldCheck, Home, FileText, QrCode, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface SidebarProps {
  user: User | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const handleSignOut = () => supabase.auth.signOut();

  const userPhoto = user?.user_metadata?.avatar_url;
  const userDisplayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900 text-slate-300 flex md:flex-col border-t md:border-t-0 md:border-r border-slate-800 md:h-screen md:sticky md:top-0 md:w-64 md:shrink-0 transition-all">
      <div className="hidden md:flex p-6 items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-slate-900 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <span className="font-bold text-white tracking-tight text-lg"> QR-Code PDF HUB</span>
      </div>

      <nav className="flex-1 flex flex-row md:flex-col px-2 md:px-4 space-x-2 md:space-x-0 md:space-y-1 mt-0 md:mt-4 items-center justify-around md:justify-start">
        <a href="/dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-2.5 bg-slate-800 text-white rounded-md transition-colors w-full justify-center md:justify-start">
          <Home size={20} className="md:w-[18px] md:h-[18px]" />
          <span className="text-[10px] md:text-sm font-medium">Painel</span>
        </a>
        <a href="#" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-2.5 hover:bg-slate-800 hover:text-white rounded-md transition-colors w-full justify-center md:justify-start">
          <FileText size={20} className="md:w-[18px] md:h-[18px]" />
          <span className="text-[10px] md:text-sm font-medium">Fichas</span>
        </a>
        <a href="#" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:py-2.5 hover:bg-slate-800 hover:text-white rounded-md transition-colors w-full justify-center md:justify-start">
          <QrCode size={20} className="md:w-[18px] md:h-[18px]" />
          <span className="text-[10px] md:text-sm font-medium">QR Codes</span>
        </a>
      </nav>

      <div className="hidden md:block p-4 space-y-4">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-2 overflow-hidden">
            {userPhoto ? (
              <img src={userPhoto} alt="" className="w-8 h-8 rounded-full border border-slate-700 shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                <UserIcon size={14} />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">{userDisplayName}</span>
              <span className="text-[10px] text-slate-500 truncate">Gerente</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors shrink-0"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      
      {/* Mobile Logout Button */}
      <button
        onClick={handleSignOut}
        className="md:hidden flex flex-col items-center gap-1 px-3 py-2 hover:bg-slate-800 hover:text-red-400 transition-colors text-slate-500 justify-center min-w-[64px]"
        title="Sair"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium">Sair</span>
      </button>
    </aside>
  );
}
