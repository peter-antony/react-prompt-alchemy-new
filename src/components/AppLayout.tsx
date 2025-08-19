
import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { useFooterStore } from '@/stores/footerStore';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { config } = useFooterStore();


  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className=''>
      <div className="min-h-screen bg-gray-50 flex">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 ml-[60px]">
          <div className="fixed top-0 right-0 left-[60px] z-10">
            <AppHeader />
          </div>
          
          <main className={`flex-1 overflow-auto mt-[60px] ${config.visible ? 'padding-bottom-4r' : ''}`}>
            {children}
          </main>

          <AppFooter />
        </div>
      </div>
    </div>
  );
};
