import React from 'react';
import { Brand } from '../../src/types/database';

interface BrandViewProps {
  brand: Brand;
  onGenerateNew: () => void;
  onViewSaved: () => void;
  onEdit: () => void;
  onBack: () => void;
}

const BrandView: React.FC<BrandViewProps> = ({
  brand,
  onGenerateNew,
  onViewSaved,
  onEdit,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="text-cyan-400 hover:text-cyan-300 mb-2 flex items-center gap-2"
          >
            ← Back to Brands
          </button>
          <h2 className="text-3xl font-bold text-slate-200">{brand.name}</h2>
          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
            {brand.website}
          </a>
        </div>
        <button
          onClick={onEdit}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
        >
          Edit Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onGenerateNew}
          className="group bg-purple-600/20 border-2 border-purple-600 p-8 rounded-xl hover:bg-purple-600/30 transition-all text-left"
        >
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-slate-200 mb-2">Generate New Ad Copy</h3>
          <p className="text-slate-400">Create fresh ad copy for Meta, Google, and TikTok</p>
        </button>

        <button
          onClick={onViewSaved}
          className="group bg-cyan-600/20 border-2 border-cyan-600 p-8 rounded-xl hover:bg-cyan-600/30 transition-all text-left"
        >
          <div className="text-5xl mb-4">📁</div>
          <h3 className="text-2xl font-bold text-slate-200 mb-2">Manage Saved Copies</h3>
          <p className="text-slate-400">View, edit, and export saved ad copies</p>
        </button>
      </div>

      {brand.technologies_features && (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-purple-600/30">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">Technologies & Features</h3>
          <p className="text-slate-400 whitespace-pre-wrap">{brand.technologies_features}</p>
        </div>
      )}
    </div>
  );
};

export default BrandView;
