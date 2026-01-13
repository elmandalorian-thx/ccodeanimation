import React, { useState } from 'react';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Login from './src/components/auth/Login';
import { Homepage } from './src/components/layout/Homepage';
import { AppShell } from './src/components/layout/AppShell';
import { useBrandStore } from './src/stores/brandStore';
import BrandManager from './components/brands/BrandManager';
import AdCopyForm from './components/AdCopyForm';
import AdCopyManager from './components/adcopy/AdCopyManager';
import GoogleTools from './components/GoogleTools';
import { SavedToolResults } from './src/components/google-tools/SavedToolResults';
import { LoadingSpinner } from './components/icons';
import './src/index.css';

type View = 'brand-manager' | 'ad-copy' | 'google-tools' | 'saved-tools' | null;

const AppContent: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { selectedBrand } = useBrandStore();
  const [currentView, setCurrentView] = useState<{ main: View; sub?: string }>({
    main: 'ad-copy',
    sub: 'generate',
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return <Login />;

  // If no brand is selected, show homepage
  if (!selectedBrand) {
    return <Homepage />;
  }

  // Brand is selected, show AppShell with Sidebar
  const handleNavigation = (main: View, sub?: string) => {
    setCurrentView({ main, sub });
  };

  const renderContent = () => {
    const { main, sub } = currentView;

    switch (main) {
      case 'brand-manager':
        if (sub === 'edit') {
          return <BrandManager initialView="edit" brandId={selectedBrand.id} />;
        }
        if (sub === 'delete') {
          return <BrandManager initialView="list" brandId={selectedBrand.id} />;
        }
        return <BrandManager />;

      case 'ad-copy':
        if (sub === 'generate') {
          return <AdCopyForm brand={selectedBrand} />;
        }
        if (sub === 'saved') {
          return <AdCopyManager brand={selectedBrand} />;
        }
        return <AdCopyForm brand={selectedBrand} />;

      case 'google-tools':
        return <GoogleTools initialTool={sub} />;

      case 'saved-tools':
        return <SavedToolResults initialFilter={sub as any} />;

      default:
        return <AdCopyForm brand={selectedBrand} />;
    }
  };

  return (
    <AppShell onNavigate={handleNavigation}>
      <div className="relative">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold">
              {currentView.main === 'brand-manager' && 'Brand Manager'}
              {currentView.main === 'ad-copy' && currentView.sub === 'generate' && 'Generate Ad Copy'}
              {currentView.main === 'ad-copy' && currentView.sub === 'saved' && 'Saved Ad Copies'}
              {currentView.main === 'google-tools' && 'Google Marketing Tools'}
              {currentView.main === 'saved-tools' && 'Saved Tool Results'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedBrand.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="text-sm bg-secondary hover:bg-secondary/80 text-foreground py-2 px-4 rounded-md border border-border transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Main content area */}
        {renderContent()}
      </div>
    </AppShell>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
