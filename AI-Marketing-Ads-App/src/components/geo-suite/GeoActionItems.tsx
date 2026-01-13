import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListChecks, Filter } from 'lucide-react';
import { GeoActionItem } from '../../types/geo';
import { ActionItemCard } from '../ui/ActionItemCard';

interface GeoActionItemsProps {
  items: GeoActionItem[];
}

export function GeoActionItems({ items }: GeoActionItemsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = ['all', ...new Set(items.map(i => i.category))];

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  }).sort((a, b) => a.priority - b.priority);

  const handleStatusChange = (id: string, status: GeoActionItem['status']) => {
    // In a real app, this would update the state/database
    console.log('Status change:', id, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-cyan-400" />
          Action Items ({items.length})
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Status:</span>
          <div className="flex gap-1">
            {(['all', 'pending', 'in-progress', 'completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  filter === status
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Category:</span>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                  categoryFilter === cat
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActionItemCard item={item} onStatusChange={handleStatusChange} />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No action items match the current filters
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-slate-800/30 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">
            {items.filter(i => i.priority <= 2).length}
          </p>
          <p className="text-xs text-muted-foreground">High Priority</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">
            {items.filter(i => i.impact === 'high').length}
          </p>
          <p className="text-xs text-muted-foreground">High Impact</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-cyan-400">
            {items.filter(i => i.effort === 'low').length}
          </p>
          <p className="text-xs text-muted-foreground">Quick Wins</p>
        </div>
      </div>
    </div>
  );
}
