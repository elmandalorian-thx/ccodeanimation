import { motion } from 'framer-motion';
import { useState } from 'react';
import { Brand } from '../../types/database';
import { ExternalLink, Building2, Trash2 } from 'lucide-react';
import { deleteBrand } from '../../services/brandService';
import { useBrandStore } from '../../stores/brandStore';

interface BrandCardProps {
  brand: Brand;
  onClick: () => void;
}

export function BrandCard({ brand, onClick }: BrandCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { removeBrand } = useBrandStore();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }

    try {
      await deleteBrand(brand.id);
      removeBrand(brand.id);
    } catch (error) {
      console.error('Failed to delete brand:', error);
    }
  };
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div className="relative h-full bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
        {/* Brand Icon/Avatar */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
        </div>

        {/* Brand Name */}
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {brand.name}
        </h3>

        {/* Website */}
        {brand.website && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 group-hover:text-foreground transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span className="truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
          </div>
        )}

        {/* Technologies/Features Preview */}
        {brand.technologies_features && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {brand.technologies_features}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
          <span>
            {new Date(brand.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            Active
          </span>
        </div>

        {/* Delete Button */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleDelete}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              showDeleteConfirm
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{showDeleteConfirm ? 'Click again to confirm' : 'Delete Brand'}</span>
          </button>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </motion.div>
  );
}
