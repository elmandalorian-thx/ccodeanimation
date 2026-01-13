import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useUIStore } from '../../stores/uiStore';
import { useBrandStore } from '../../stores/brandStore';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'brand-manager' | 'ad-copy' | 'google-tools' | null;

interface AppShellProps {
  children: ReactNode;
  onNavigate?: (view: View, subView?: string) => void;
}

export function AppShell({ children, onNavigate }: AppShellProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const { selectedBrand } = useBrandStore();

  if (!selectedBrand) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar onNavigate={onNavigate} />

      {/* Mobile overlay */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarCollapsed(true)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-0' : 'md:ml-64'
        }`}
      >
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
