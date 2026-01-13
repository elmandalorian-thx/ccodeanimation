import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, LayoutDashboard, Target, ListChecks, Upload } from 'lucide-react';
import { GeoDashboard } from './GeoDashboard';
import { GeoAnalyzer } from './GeoAnalyzer';
import { GeoFileUpload } from './GeoFileUpload';
import { GeoActionItems } from './GeoActionItems';
import { GeoAnalysis, GeoPlatformVisibility } from '../../types/geo';

type GeoTab = 'analyze' | 'dashboard' | 'platforms' | 'actions' | 'upload';

export function GeoSuite() {
  const [activeTab, setActiveTab] = useState<GeoTab>('analyze');
  const [currentAnalysis, setCurrentAnalysis] = useState<GeoAnalysis | null>(null);

  const tabs = [
    { id: 'analyze' as const, label: 'Analyze', icon: Target },
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'platforms' as const, label: 'AI Platforms', icon: Globe },
    { id: 'actions' as const, label: 'Action Items', icon: ListChecks },
    { id: 'upload' as const, label: 'Upload Files', icon: Upload },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg">
          <Globe className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            GEO Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            AI Search Engine Optimization Analysis
          </p>
        </div>
        <span className="ml-auto px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/30">
          PRO
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'analyze' && (
            <GeoAnalyzer onAnalysisComplete={setCurrentAnalysis} />
          )}
          {activeTab === 'dashboard' && (
            <GeoDashboard analysis={currentAnalysis} />
          )}
          {activeTab === 'platforms' && currentAnalysis && (
            <GeoPlatformsView platforms={currentAnalysis.aiPlatforms} />
          )}
          {activeTab === 'actions' && currentAnalysis && (
            <GeoActionItems items={currentAnalysis.actionItems} />
          )}
          {activeTab === 'upload' && (
            <GeoFileUpload onFilesUploaded={(files) => console.log('Files:', files)} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Platforms view component
function GeoPlatformsView({ platforms }: { platforms: GeoPlatformVisibility[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {platforms?.map((platform) => (
        <motion.div
          key={platform.platform}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold capitalize">{platform.platform.replace('-', ' ')}</h3>
            <span className={`text-2xl font-bold ${
              platform.visibilityScore >= 70 ? 'text-green-400' :
              platform.visibilityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {platform.visibilityScore}
            </span>
          </div>
          {platform.issues.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-red-400 font-medium mb-1">Issues:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {platform.issues.slice(0, 3).map((issue, i) => (
                  <li key={i}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}
          {platform.opportunities.length > 0 && (
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">Opportunities:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {platform.opportunities.slice(0, 3).map((opp, i) => (
                  <li key={i}>• {opp}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
