import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Zap, ArrowRight } from 'lucide-react';

interface ActionItem {
  id: string;
  priority: number;
  category: string;
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  details: string;
}

interface ActionItemCardProps {
  item: ActionItem;
  onStatusChange?: (id: string, status: ActionItem['status']) => void;
}

export function ActionItemCard({ item, onStatusChange }: ActionItemCardProps) {
  const priorityConfig: Record<number, { color: string; badge: string; label: string }> = {
    1: { color: 'border-red-500 bg-red-500/10', badge: 'bg-red-500/20 text-red-400', label: 'Critical' },
    2: { color: 'border-orange-500 bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-400', label: 'High' },
    3: { color: 'border-yellow-500 bg-yellow-500/10', badge: 'bg-yellow-500/20 text-yellow-400', label: 'Medium' },
    4: { color: 'border-blue-500 bg-blue-500/10', badge: 'bg-blue-500/20 text-blue-400', label: 'Low' },
    5: { color: 'border-slate-500 bg-slate-500/10', badge: 'bg-slate-500/20 text-slate-400', label: 'Minor' }
  };

  const impactColors = {
    high: 'text-green-400 bg-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    low: 'text-slate-400 bg-slate-500/20'
  };

  const effortColors = {
    high: 'text-red-400 bg-red-500/20',
    medium: 'text-orange-400 bg-orange-500/20',
    low: 'text-green-400 bg-green-500/20'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-slate-400" />,
    'in-progress': <Zap className="w-4 h-4 text-yellow-400" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-400" />
  };

  const config = priorityConfig[item.priority] || priorityConfig[5];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border-l-4 p-4 ${config.color} hover:bg-opacity-20 transition-colors`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${config.badge}`}>
              P{item.priority}
            </span>
            <span className="text-xs text-muted-foreground capitalize bg-slate-700/50 px-2 py-0.5 rounded">
              {item.category}
            </span>
            <div className="flex items-center gap-1">
              {statusIcons[item.status]}
            </div>
          </div>

          {/* Action */}
          <h4 className="font-medium text-slate-200 mb-1">{item.action}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.details}</p>
        </div>

        {/* Impact/Effort Badges */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <div className={`px-2 py-1 rounded text-xs font-medium ${impactColors[item.impact]}`}>
            {'\u2191'} {item.impact}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${effortColors[item.effort]}`}>
            {'\u26A1'} {item.effort}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {onStatusChange && item.status !== 'completed' && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 flex gap-2">
          {item.status === 'pending' && (
            <button
              onClick={() => onStatusChange(item.id, 'in-progress')}
              className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors flex items-center gap-1"
            >
              Start <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {item.status === 'in-progress' && (
            <button
              onClick={() => onStatusChange(item.id, 'completed')}
              className="text-xs px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors flex items-center gap-1"
            >
              Complete <CheckCircle2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
