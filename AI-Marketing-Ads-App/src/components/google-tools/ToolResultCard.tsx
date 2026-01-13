import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Search,
  BarChart3,
  FileText,
  Target,
  Users,
  Eye,
  Trash2,
  Clock
} from 'lucide-react';
import { ToolResult } from '../../types/database';

type ToolType = 'sitelinks' | 'keywords' | 'pagespeed' | 'schema' | 'geo' | 'competitors';

interface ToolMetadata {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const TOOL_METADATA: Record<ToolType, ToolMetadata> = {
  sitelinks: { name: 'Sitelinks', icon: Zap, color: 'text-blue-500' },
  keywords: { name: 'Keywords', icon: Search, color: 'text-green-500' },
  pagespeed: { name: 'PageSpeed', icon: BarChart3, color: 'text-yellow-500' },
  schema: { name: 'Schema', icon: FileText, color: 'text-purple-500' },
  geo: { name: 'GEO', icon: Target, color: 'text-red-500' },
  competitors: { name: 'Competitors', icon: Users, color: 'text-orange-500' }
};

interface ToolResultCardProps {
  result: ToolResult;
  onView: () => void;
  onDelete: () => void;
}

// Helper function to format timestamp
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Helper function to get preview text from result data
function getResultPreview(toolType: ToolType, resultData: any): string[] {
  switch (toolType) {
    case 'sitelinks':
      return Array.isArray(resultData)
        ? resultData.slice(0, 3).map((s: any) => s.linkText || s.url)
        : [];
    case 'keywords':
      return Array.isArray(resultData)
        ? resultData.slice(0, 3).map((k: any) => k.keyword)
        : [];
    case 'pagespeed':
    case 'schema':
    case 'geo':
    case 'competitors':
      // For markdown/text results, show first 100 chars
      return typeof resultData === 'string'
        ? [resultData.substring(0, 100) + '...']
        : ['View full analysis'];
    default:
      return ['View results'];
  }
}

export function ToolResultCard({ result, onView, onDelete }: ToolResultCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toolMeta = TOOL_METADATA[result.tool_type as ToolType];

  if (!toolMeta) return null;

  const Icon = toolMeta.icon;
  const preview = getResultPreview(result.tool_type as ToolType, result.result_data);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
      // Reset after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative cursor-pointer"
      onClick={onView}
    >
      <div className="relative h-full bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
        {/* Header with Icon and Tool Type */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors`}>
              <Icon className={`w-6 h-6 ${toolMeta.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                {toolMeta.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(result.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className={`p-2 rounded-md transition-colors ${
              showDeleteConfirm
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete result'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="mb-4">
          {preview.length > 0 && (
            <ul className="space-y-2">
              {preview.map((item, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground truncate flex items-start gap-2"
                >
                  <span className="text-primary mt-1">•</span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* View Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 px-4 rounded-md transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>View Full Results</span>
        </button>

        {/* Input Context (if available) */}
        {result.input_data && Object.keys(result.input_data).length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {result.tool_type === 'sitelinks' && result.input_data.urls && (
                <>Analyzed {Array.isArray(result.input_data.urls) ? result.input_data.urls.length : 1} URL(s)</>
              )}
              {result.tool_type === 'keywords' && result.input_data.seedKeywords && (
                <>Seeds: {String(result.input_data.seedKeywords).substring(0, 40)}...</>
              )}
              {(result.tool_type === 'pagespeed' || result.tool_type === 'schema' || result.tool_type === 'geo') && result.input_data.url && (
                <>URL: {String(result.input_data.url).replace(/^https?:\/\//, '').substring(0, 30)}...</>
              )}
              {result.tool_type === 'competitors' && result.input_data.brandUrl && (
                <>Brand: {String(result.input_data.brandUrl).replace(/^https?:\/\//, '').substring(0, 25)}...</>
              )}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
