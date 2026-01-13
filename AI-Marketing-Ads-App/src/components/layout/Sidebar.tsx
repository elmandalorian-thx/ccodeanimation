import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBrandStore } from '../../stores/brandStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Building2,
  FileText,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Home,
  Edit3,
  Trash2,
  PlusCircle,
  Save,
  Search,
  Zap,
  BarChart3,
  Target,
  Users,
  ExternalLink,
  Archive,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

type View = 'brand-manager' | 'ad-copy' | 'google-tools' | 'saved-tools' | null;
type GoogleTool = 'sitelinks' | 'keywords' | 'pagespeed' | 'schema' | 'geo' | 'competitors';

interface SidebarProps {
  onNavigate?: (view: View, subView?: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { selectedBrand, clearBrand } = useBrandStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [expandedSection, setExpandedSection] = useState<View>('ad-copy');
  const [activeView, setActiveView] = useState<{ main: View; sub?: string }>({
    main: 'ad-copy',
    sub: 'generate',
  });

  if (!selectedBrand) return null;

  const handleSectionClick = (section: View) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleNavigation = (main: View, sub?: string) => {
    setActiveView({ main, sub });
    if (onNavigate) {
      onNavigate(main, sub);
    }
  };

  const isActive = (main: View, sub?: string) => {
    return activeView.main === main && (sub ? activeView.sub === sub : true);
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? 0 : 256,
          x: sidebarCollapsed ? -256 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen bg-card border-r border-border z-50 overflow-hidden md:relative"
      >
        <div className="flex flex-col h-full w-64">
          {/* Brand Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <h2 className="font-semibold truncate">{selectedBrand.name}</h2>
                </div>
                {selectedBrand.website && (
                  <a
                    href={selectedBrand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span className="truncate">{selectedBrand.website.replace(/^https?:\/\//, '')}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={clearBrand}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Brands</span>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-2">
            {/* Brand Manager Section */}
            <div className="mb-1">
              <button
                onClick={() => handleSectionClick('brand-manager')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Brand Manager</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'brand-manager' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedSection === 'brand-manager' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-1"
                  >
                    <button
                      onClick={() => handleNavigation('brand-manager', 'edit')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('brand-manager', 'edit')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Brand</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Ad Copy Creator Section */}
            <div className="mb-1">
              <button
                onClick={() => handleSectionClick('ad-copy')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Ad Copy Creator</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'ad-copy' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedSection === 'ad-copy' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-1"
                  >
                    <button
                      onClick={() => handleNavigation('ad-copy', 'generate')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('ad-copy', 'generate')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Generate New</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('ad-copy', 'saved')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('ad-copy', 'saved')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>View Saved Copies</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Google Tools Section */}
            <div className="mb-1">
              <button
                onClick={() => handleSectionClick('google-tools')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Google Tools</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'google-tools' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedSection === 'google-tools' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-1"
                  >
                    <button
                      onClick={() => handleNavigation('google-tools', 'sitelinks')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'sitelinks')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Sitelinks Generator</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('google-tools', 'keywords')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'keywords')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Keyword Research</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('google-tools', 'pagespeed')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'pagespeed')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>PageSpeed Analyzer</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('google-tools', 'schema')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'schema')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Schema Audit</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('google-tools', 'geo')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'geo')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>GEO Analysis</span>
                    </button>
                    <button
                      onClick={() => handleNavigation('google-tools', 'competitors')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('google-tools', 'competitors')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Competitor Analysis</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Saved Tool Results Section */}
            <div className="mb-1">
              <button
                onClick={() => handleSectionClick('saved-tools')}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  <span>Saved Tool Results</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    expandedSection === 'saved-tools' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedSection === 'saved-tools' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden ml-4 mt-1"
                  >
                    <button
                      onClick={() => handleNavigation('saved-tools', 'all')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive('saved-tools', 'all')
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>View All Results</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-secondary transition-colors hidden md:block"
                aria-label="Toggle sidebar"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile toggle button */}
      {sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-lg md:hidden"
          aria-label="Open sidebar"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
