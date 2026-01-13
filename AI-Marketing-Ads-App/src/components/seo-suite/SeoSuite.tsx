import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BarChart3, Wand2, Upload } from 'lucide-react';
import { CompetitorDashboard } from './CompetitorDashboard';
import { SchemaAuditor } from './SchemaAuditor';
import { SchemaGenerator } from './SchemaGenerator';
import { SeoFileUpload } from './SeoFileUpload';

type SeoTab = 'competitors' | 'schema-audit' | 'schema-generate' | 'upload';

export function SeoSuite() {
  const [activeTab, setActiveTab] = useState<SeoTab>('competitors');

  const tabs = [
    { id: 'competitors' as const, label: 'Competitors', icon: BarChart3 },
    { id: 'schema-audit' as const, label: 'Schema Audit', icon: Search },
    { id: 'schema-generate' as const, label: 'Schema Generator', icon: Wand2 },
    { id: 'upload' as const, label: 'Upload Files', icon: Upload },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
          <Search className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            SEO Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Competitor Analysis & Schema Markup Tools
          </p>
        </div>
        <span className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
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
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-lg shadow-purple-500/10'
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
          {activeTab === 'competitors' && <CompetitorDashboard />}
          {activeTab === 'schema-audit' && <SchemaAuditor />}
          {activeTab === 'schema-generate' && <SchemaGenerator />}
          {activeTab === 'upload' && <SeoFileUpload onFilesUploaded={(files) => console.log('Files:', files)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
