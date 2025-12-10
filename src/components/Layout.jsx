// src/components/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import logoShineray from '../assets/logo-shineray.png'; // Importe a logo aqui também

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Sidebar (Controlada pelo State no Mobile) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER MOBILE (Só aparece em telas pequenas) */}
        <header className="bg-black border-b border-neutral-800 h-16 flex items-center justify-between px-4 md:hidden shrink-0 z-10 relative">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-white hover:bg-neutral-800 rounded-lg"
                >
                    <Menu size={24} />
                </button>
                <span className="text-white font-black uppercase tracking-widest text-sm">Portal TI</span>
            </div>
            
            {/* Logo Pequena no Header Mobile */}
            <div className="bg-white p-1.5 rounded-lg">
                <img src={logoShineray} alt="Shineray" className="h-6 w-auto object-contain" />
            </div>
        </header>

        {/* Área de Scroll das Páginas */}
        <main className="flex-1 overflow-y-auto p-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;