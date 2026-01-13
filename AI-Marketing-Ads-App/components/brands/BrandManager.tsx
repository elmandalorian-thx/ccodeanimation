import React, { useState, useEffect } from 'react';
import { Brand } from '../../src/types/database';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '../../src/services/brandService';
import BrandForm from './BrandForm';
import BrandView from './BrandView';
import AdCopyForm from '../AdCopyForm';
import AdCopyManager from '../adcopy/AdCopyManager';
import { LoadingSpinner } from '../icons';

type View = 'list' | 'create' | 'edit' | 'view' | 'generate' | 'saved-copies';

const BrandManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [view, setView] = useState<View>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBrands();
      setBrands(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async (input: any) => {
    await createBrand(input);
    await loadBrands();
    setView('list');
  };

  const handleUpdateBrand = async (input: any) => {
    if (!selectedBrand) return;
    await updateBrand(selectedBrand.id, input);
    await loadBrands();
    setView('list');
    setSelectedBrand(null);
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Delete this brand and all associated ad copies?')) return;
    await deleteBrand(id);
    await loadBrands();
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setView('view');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Create New Brand</h2>
        <BrandForm onSubmit={handleCreateBrand} onCancel={() => setView('list')} />
      </div>
    );
  }

  if (view === 'edit' && selectedBrand) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-6">Edit Brand</h2>
        <BrandForm
          brand={selectedBrand}
          onSubmit={handleUpdateBrand}
          onCancel={() => setView('view')}
        />
      </div>
    );
  }

  if (view === 'view' && selectedBrand) {
    return (
      <BrandView
        brand={selectedBrand}
        onGenerateNew={() => setView('generate')}
        onViewSaved={() => setView('saved-copies')}
        onEdit={() => setView('edit')}
        onBack={() => {
          setSelectedBrand(null);
          setView('list');
        }}
      />
    );
  }

  if (view === 'generate' && selectedBrand) {
    return (
      <div>
        <button
          onClick={() => setView('view')}
          className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
        >
          ← Back to {selectedBrand.name}
        </button>
        <AdCopyForm brand={selectedBrand} />
      </div>
    );
  }

  if (view === 'saved-copies' && selectedBrand) {
    return (
      <div>
        <button
          onClick={() => setView('view')}
          className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
        >
          ← Back to {selectedBrand.name}
        </button>
        <AdCopyManager brand={selectedBrand} />
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-200">Your Brands</h2>
        <button
          onClick={() => setView('create')}
          className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          + New Brand
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {brands.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-purple-600/30">
          <p className="text-lg text-slate-400 mb-4">No brands yet</p>
          <button
            onClick={() => setView('create')}
            className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
          >
            Create Your First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map(brand => (
            <div
              key={brand.id}
              className="bg-slate-800/50 p-6 rounded-lg border border-purple-600/30 hover:border-cyan-400 transition-all cursor-pointer group"
              onClick={() => handleSelectBrand(brand)}
            >
              <h3 className="text-xl font-bold text-slate-200 mb-2 group-hover:text-cyan-400 transition-colors">
                {brand.name}
              </h3>
              <p className="text-sm text-slate-400 mb-4 truncate">{brand.website}</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBrand(brand);
                    setView('edit');
                  }}
                  className="text-sm px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBrand(brand.id);
                  }}
                  className="text-sm px-3 py-1 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrandManager;
