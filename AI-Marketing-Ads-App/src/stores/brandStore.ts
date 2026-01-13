import { create } from 'zustand';
import { Brand } from '../types/database';

interface BrandStore {
  selectedBrand: Brand | null;
  brands: Brand[];
  selectBrand: (brand: Brand) => void;
  clearBrand: () => void;
  setBrands: (brands: Brand[]) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updatedBrand: Brand) => void;
  removeBrand: (id: string) => void;
}

export const useBrandStore = create<BrandStore>((set) => ({
  selectedBrand: null,
  brands: [],

  selectBrand: (brand) => set({ selectedBrand: brand }),

  clearBrand: () => set({ selectedBrand: null }),

  setBrands: (brands) => set({ brands }),

  addBrand: (brand) =>
    set((state) => ({
      brands: [...state.brands, brand],
    })),

  updateBrand: (id, updatedBrand) =>
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? updatedBrand : b)),
      selectedBrand: state.selectedBrand?.id === id ? updatedBrand : state.selectedBrand,
    })),

  removeBrand: (id) =>
    set((state) => ({
      brands: state.brands.filter((b) => b.id !== id),
      selectedBrand: state.selectedBrand?.id === id ? null : state.selectedBrand,
    })),
}));
