import React, { useState } from 'react';
import { Brand, BrandInput } from '../../src/types/database';
import InputGroup from '../../src/components/InputGroup';
import { LoadingSpinner } from '../icons';

interface BrandFormProps {
  brand?: Brand;
  onSubmit: (input: BrandInput) => Promise<void>;
  onCancel: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ brand, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<BrandInput>({
    name: brand?.name || '',
    website: brand?.website || '',
    product_urls: brand?.product_urls || [],
    technologies_features: brand?.technologies_features || '',
    brand_guidelines: brand?.brand_guidelines || {},
    competitor_websites: brand?.competitor_websites || [],
    competitor_social_handles: brand?.competitor_social_handles || [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputGroup label="Brand Name" htmlFor="name">
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>

        <InputGroup label="Website URL" htmlFor="website">
          <input
            id="website"
            type="url"
            required
            value={formData.website}
            onChange={e => setFormData({ ...formData, website: e.target.value })}
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>
      </div>

      <InputGroup label="Product URLs (one per line)" htmlFor="product_urls">
        <textarea
          id="product_urls"
          rows={3}
          value={(formData.product_urls || []).join('\n')}
          onChange={e => setFormData({ ...formData, product_urls: e.target.value.split('\n').filter(Boolean) })}
          className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </InputGroup>

      <InputGroup label="Technologies & Features" htmlFor="technologies_features">
        <textarea
          id="technologies_features"
          rows={4}
          value={formData.technologies_features}
          onChange={e => setFormData({ ...formData, technologies_features: e.target.value })}
          placeholder="Describe technologies, features, USPs..."
          className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
        />
      </InputGroup>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Brand Guidelines</h3>

        <InputGroup label="Name Formatting (e.g., 'STIHL' always uppercase)" htmlFor="nameFormatting">
          <input
            id="nameFormatting"
            type="text"
            value={formData.brand_guidelines?.nameFormatting || ''}
            onChange={e => setFormData({
              ...formData,
              brand_guidelines: { ...formData.brand_guidelines, nameFormatting: e.target.value }
            })}
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>

        <InputGroup label="Language Rules (one per line)" htmlFor="languageRules">
          <textarea
            id="languageRules"
            rows={3}
            value={(formData.brand_guidelines?.languageRules || []).join('\n')}
            onChange={e => setFormData({
              ...formData,
              brand_guidelines: {
                ...formData.brand_guidelines,
                languageRules: e.target.value.split('\n').filter(Boolean)
              }
            })}
            placeholder="Always use active voice&#10;Avoid technical jargon"
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>

        <InputGroup label="Negative Terms (one per line)" htmlFor="negativeTerms">
          <textarea
            id="negativeTerms"
            rows={3}
            value={(formData.brand_guidelines?.negativeTerms || []).join('\n')}
            onChange={e => setFormData({
              ...formData,
              brand_guidelines: {
                ...formData.brand_guidelines,
                negativeTerms: e.target.value.split('\n').filter(Boolean)
              }
            })}
            placeholder="cheap&#10;discount"
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Competitors (for future analysis)</h3>

        <InputGroup label="Competitor Websites (one per line)" htmlFor="competitor_websites">
          <textarea
            id="competitor_websites"
            rows={3}
            value={(formData.competitor_websites || []).join('\n')}
            onChange={e => setFormData({ ...formData, competitor_websites: e.target.value.split('\n').filter(Boolean) })}
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>

        <InputGroup label="Competitor Social Handles (one per line)" htmlFor="competitor_social_handles">
          <textarea
            id="competitor_social_handles"
            rows={3}
            value={(formData.competitor_social_handles || []).join('\n')}
            onChange={e => setFormData({ ...formData, competitor_social_handles: e.target.value.split('\n').filter(Boolean) })}
            placeholder="@competitor_instagram&#10;@competitor_tiktok"
            className="w-full bg-slate-800 text-slate-200 px-4 py-2 rounded border border-purple-600/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          />
        </InputGroup>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : (brand ? 'Update Brand' : 'Create Brand')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BrandForm;
