/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { AuthState } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PublicViewer from './pages/PublicViewer';
import Sidebar from './components/Navbar';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    if (!supabase) {
      setAuthState("unauthenticated");
      return;
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthState(session ? "authenticated" : "unauthenticated");
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthState(session ? "authenticated" : "unauthenticated");
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Routes>
          {/* Public Routes */}
          <Route path="/v/:qrId" element={<PublicViewer />} />
          
          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={authState === "authenticated" ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          
          {/* Private Routes */}
          <Route 
            path="/dashboard" 
            element={
              authState === "authenticated" ? (
                <div className="flex flex-col md:flex-row min-h-screen">
                  <Sidebar user={user} />
                  <main className="flex-1 overflow-auto pb-16 md:pb-0">
                    <Dashboard user={user!} />
                  </main>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to={authState === "authenticated" ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}
