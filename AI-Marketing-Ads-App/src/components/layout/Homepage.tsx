import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useBrandStore } from '../../stores/brandStore';
import { fetchBrands, createBrand } from '../../services/brandService';
import { BrandCard } from '../brands/BrandCard';
import BrandForm from '../../../components/brands/BrandForm';
import { PlusCircle, X } from 'lucide-react';
import { Brand, BrandInput } from '../../types/database';

export function Homepage() {
  const { brands, setBrands, selectBrand } = useBrandStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      const fetchedBrands = await fetchBrands();
      setBrands(fetchedBrands);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandClick = (brand: Brand) => {
    selectBrand(brand);
  };

  const handleCreateBrand = () => {
    setShowCreateForm(true);
  };

  const handleSubmitBrand = async (brandInput: BrandInput) => {
    await createBrand(brandInput);
    setShowCreateForm(false);
    await loadBrands();
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Parallax */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              Choose Your Brand
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              Select a brand to start creating high-converting ad copy and analyzing marketing performance
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Brands Grid Section */}
      <div className="container mx-auto px-4 pb-16">
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 bg-card border border-border rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : brands.length === 0 ? (
          // Empty state
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <PlusCircle className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-4">No Brands Yet</h2>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first brand to unlock powerful AI-driven marketing tools
              </p>
              <button
                onClick={handleCreateBrand}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Your First Brand
              </button>
            </div>
          </motion.div>
        ) : (
          // Brands grid
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold">Your Brands</h2>
              <button
                onClick={handleCreateBrand}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                New Brand
              </button>
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {brands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  onClick={() => handleBrandClick(brand)}
                />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating parallax elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed top-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="fixed bottom-20 left-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none"
      />

      {/* Create Brand Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create New Brand</h2>
              <button
                onClick={handleCancelCreate}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <BrandForm
                onSubmit={handleSubmitBrand}
                onCancel={handleCancelCreate}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
