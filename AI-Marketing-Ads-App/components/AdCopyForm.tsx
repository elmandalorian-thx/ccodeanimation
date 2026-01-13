import React, { useState, useCallback, useEffect } from 'react';
import { AllAdCopy, AdCopyInput, MetaAdCopy, GoogleAdCopy, TikTokAdCopy } from '../types';
import { Brand } from '../src/types/database';
import { generateAdCopy } from '../services/geminiService';
import { saveAdCopy } from '../src/services/adCopyService';
import { generateMetaCsvContent, generateGoogleCsvContent, generateTikTokCsvContent, generateMetaExcelCopyContent, generateGoogleExcelCopyContent, generateTikTokExcelCopyContent } from '../utils/fileUtils';
import InputGroup from '../src/components/InputGroup';
import OutputSection from './OutputSection';
import { DownloadIcon, CopyIcon, FileIcon, CheckIcon, LoadingSpinner } from './icons';

const SAMPLE_DATA: AdCopyInput = {
  brandName: 'Lumina Smart Home',
  website: 'https://luminatech.example.com',
  additionalUrls: '',
  campaignPurpose: 'Launch of the new Lumina 360 Security Camera. Highlights: 4K resolution, AI detection, night vision, and solar charging option. Target audience: Tech-savvy homeowners.',
  negativeKeywords: 'subscription required, wired only, expensive',
  files: [],
};

const MetaOutput = ({
  copy,
  adCopyId,
  campaignPurpose,
  onCopyAll,
  onDownloadCsv,
  onSave,
  isCopied
}: {
  copy: MetaAdCopy;
  adCopyId?: string;
  campaignPurpose?: string;
  onCopyAll: () => void;
  onDownloadCsv: () => void;
  onSave: () => void;
  isCopied: boolean;
}) => (
  <div className="space-y-6">
    {/* Action Buttons - Inside Tab */}
    <div className="flex items-center justify-end gap-2 pb-4 border-b border-border">
      <button onClick={onSave} className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
        <span>💾</span>
        <span className="hidden sm:inline">Save Ad Copy</span>
        <span className="sm:hidden">Save</span>
      </button>
      <button onClick={onCopyAll} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
        {isCopied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <CopyIcon className="h-5 w-5" />}
        <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy for Excel'}</span>
        <span className="sm:hidden">{isCopied ? 'Copied!' : 'Copy'}</span>
      </button>
      <button onClick={onDownloadCsv} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
        <DownloadIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Download CSV</span>
        <span className="sm:hidden">CSV</span>
      </button>
    </div>

    {/* Content */}
    <OutputSection
      title="Primary Texts (125 chars)"
      items={copy.primaryTexts}
      platform="meta"
      fieldType="primaryText"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Headlines (40 chars)"
      items={copy.headlines}
      platform="meta"
      fieldType="headline"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Descriptions (30 chars)"
      items={copy.descriptions}
      platform="meta"
      fieldType="description"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
  </div>
);

const GoogleOutput = ({
  copy,
  adCopyId,
  campaignPurpose,
  onCopyAll,
  onDownloadCsv,
  onSave,
  isCopied
}: {
  copy: GoogleAdCopy;
  adCopyId?: string;
  campaignPurpose?: string;
  onCopyAll: () => void;
  onDownloadCsv: () => void;
  onSave: () => void;
  isCopied: boolean;
}) => (
  <div className="space-y-6">
    {/* Action Buttons - Inside Tab */}
    <div className="flex items-center justify-end gap-2 pb-4 border-b border-border">
      <button onClick={onSave} className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
        <span>💾</span>
        <span className="hidden sm:inline">Save Ad Copy</span>
        <span className="sm:hidden">Save</span>
      </button>
      <button onClick={onCopyAll} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
        {isCopied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <CopyIcon className="h-5 w-5" />}
        <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy for Excel'}</span>
        <span className="sm:hidden">{isCopied ? 'Copied!' : 'Copy'}</span>
      </button>
      <button onClick={onDownloadCsv} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
        <DownloadIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Download CSV</span>
        <span className="sm:hidden">CSV</span>
      </button>
    </div>

    {/* Content */}
    <OutputSection
      title="Headlines (30 chars)"
      items={copy.headlines}
      platform="google"
      fieldType="headline"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Long Headlines (90 chars)"
      items={copy.longHeadlines}
      platform="google"
      fieldType="longHeadline"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Short Headlines (60 chars)"
      items={copy.shortHeadlines}
      platform="google"
      fieldType="shortHeadline"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Descriptions (90 chars)"
      items={copy.descriptions}
      platform="google"
      fieldType="description"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Callout Extensions (25 chars)"
      items={copy.callouts}
      platform="google"
      fieldType="callout"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
    <OutputSection
      title="Keywords (Broad Match)"
      items={copy.keywords}
      platform="google"
      fieldType="keyword"
      adCopyId={adCopyId}
      campaignPurpose={campaignPurpose}
    />
  </div>
);

const TikTokOutput = ({
  copy,
  adCopyId,
  campaignPurpose,
  onCopyAll,
  onDownloadCsv,
  onSave,
  isCopied
}: {
  copy: TikTokAdCopy;
  adCopyId?: string;
  campaignPurpose?: string;
  onCopyAll: () => void;
  onDownloadCsv: () => void;
  onSave: () => void;
  isCopied: boolean;
}) => (
    <div className="space-y-6">
      {/* Action Buttons - Inside Tab */}
      <div className="flex items-center justify-end gap-2 pb-4 border-b border-border">
        <button onClick={onSave} className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
          <span>💾</span>
          <span className="hidden sm:inline">Save Ad Copy</span>
          <span className="sm:hidden">Save</span>
        </button>
        <button onClick={onCopyAll} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
          {isCopied ? <CheckIcon className="h-5 w-5 text-green-500"/> : <CopyIcon className="h-5 w-5" />}
          <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy for Excel'}</span>
          <span className="sm:hidden">{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
        <button onClick={onDownloadCsv} className="flex items-center space-x-2 bg-slate-800 text-slate-200 font-semibold py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors">
          <DownloadIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Download CSV</span>
          <span className="sm:hidden">CSV</span>
        </button>
      </div>

      {/* Content */}
      <OutputSection
        title="Ad Text (100 chars)"
        items={copy.texts}
        platform="tiktok"
        fieldType="text"
        adCopyId={adCopyId}
        campaignPurpose={campaignPurpose}
      />
    </div>
);

interface AdCopyFormProps {
  brand: Brand;
}

const AdCopyForm: React.FC<AdCopyFormProps> = ({ brand }) => {
  const [inputs, setInputs] = useState<AdCopyInput>({
    brandName: '',
    website: '',
    additionalUrls: '',
    campaignPurpose: '',
    negativeKeywords: '',
    files: [],
  });
  const [adCopy, setAdCopy] = useState<AllAdCopy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'meta' | 'google' | 'tiktok'>('meta');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-populate from brand context
  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      brandName: brand.name,
      website: brand.website,
      additionalUrls: (brand.product_urls || []).join('\n'),
      negativeKeywords: (brand.brand_guidelines?.negativeTerms || []).join('\n'),
    }));
  }, [brand]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setInputs(prev => ({ ...prev, files: Array.from(e.target.files) }));
    }
  };
  
  const handleFillSampleData = () => {
    setInputs(SAMPLE_DATA);
  };

  const handleSubmit = async (type: 'meta' | 'google' | 'tiktok' | 'all') => {
    setIsLoading(true);
    setError(null);
    setAdCopy(null);

    try {
      // Include brand context in the inputs
      const inputsWithBrandContext = {
        ...inputs,
        brandGuidelines: brand.brand_guidelines || undefined,
        technologiesFeatures: brand.technologies_features || undefined,
      };
      const result = await generateAdCopy(inputsWithBrandContext, type);
      setAdCopy(result);
      if (type === 'meta') setActiveTab('meta');
      else if (type === 'google') setActiveTab('google');
      else if (type === 'tiktok') setActiveTab('tiktok');
      else setActiveTab('meta'); // Default for 'all'
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyAll = useCallback(() => {
    if (!adCopy) return;
    let content = '';
    if (activeTab === 'meta' && adCopy.meta) {
      content = generateMetaExcelCopyContent(adCopy.meta);
    } else if (activeTab === 'google' && adCopy.google) {
      content = generateGoogleExcelCopyContent(adCopy.google);
    } else if (activeTab === 'tiktok' && adCopy.tiktok) {
      content = generateTikTokExcelCopyContent(adCopy.tiktok);
    }
    
    if (content) {
      navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [adCopy, activeTab]);

  const handleDownloadCsv = useCallback(() => {
    if (!adCopy) return;
    
    let csvContent = '';
    let filename = 'ad_copy.csv';

    if (activeTab === 'meta' && adCopy.meta) {
        csvContent = generateMetaCsvContent(adCopy.meta);
        filename = 'meta_ad_copy.csv';
    } else if (activeTab === 'google' && adCopy.google) {
        csvContent = generateGoogleCsvContent(adCopy.google);
        filename = 'google_ad_copy.csv';
    } else if (activeTab === 'tiktok' && adCopy.tiktok) {
        csvContent = generateTikTokCsvContent(adCopy.tiktok);
        filename = 'tiktok_ad_copy.csv';
    }

    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [adCopy, activeTab]);

  const handleSave = async () => {
    if (!adCopy || !saveName.trim()) return;
    setIsSaving(true);
    try {
      await saveAdCopy(brand.id, saveName, adCopy, {
        campaignPurpose: inputs.campaignPurpose,
        negativeKeywords: inputs.negativeKeywords,
      });
      setShowSaveDialog(false);
      setSaveName('');
      alert('Ad copy saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save ad copy');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#100320] p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-900/20 border border-purple-600/30 relative">
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
            <button 
                type="button" 
                onClick={handleFillSampleData} 
                className="text-xs bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white py-1 px-3 rounded border border-slate-700 transition-colors"
            >
                Fill Sample Data
            </button>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Brand Name" htmlFor="brandName">
                <input type="text" id="brandName" name="brandName" value={inputs.brandName} onChange={handleInputChange} required className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200" />
            </InputGroup>
            <InputGroup label="Website URL" htmlFor="website">
                <input type="url" id="website" name="website" value={inputs.website} onChange={handleInputChange} required className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200" />
            </InputGroup>
            </div>

            <InputGroup label="Additional Relevant URLs (optional, one per line)" htmlFor="additionalUrls">
            <textarea id="additionalUrls" name="additionalUrls" value={inputs.additionalUrls} onChange={handleInputChange} rows={3} className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200" />
            </InputGroup>

            <InputGroup label="Campaign Purpose / Description" htmlFor="campaignPurpose">
            <textarea id="campaignPurpose" name="campaignPurpose" value={inputs.campaignPurpose} onChange={handleInputChange} required rows={4} className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200" placeholder="e.g., Promote a 20% off summer sale on women's shoes." />
            </InputGroup>

            <InputGroup label="Things to Avoid / Negative Keywords (optional)" htmlFor="negativeKeywords">
            <textarea id="negativeKeywords" name="negativeKeywords" value={inputs.negativeKeywords} onChange={handleInputChange} rows={3} className="w-full p-2 border border-slate-700 rounded-md bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-slate-200" placeholder="e.g., free shipping, cheap, limited time" />
            </InputGroup>

            <InputGroup label="Upload Images for Context (optional)" htmlFor="files">
            <label htmlFor="files" className="relative cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md p-4 flex flex-col items-center justify-center text-center transition-colors">
                <FileIcon className="w-10 h-10 text-slate-500 mb-2"/>
                <span className="text-sm text-slate-400">
                    {inputs.files.length > 0 ? `${inputs.files.length} file(s) selected` : 'Click to upload (PNG, JPG)'}
                </span>
                <input id="files" name="files" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/png, image/jpeg" />
            </label>
            </InputGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <button type="button" onClick={() => handleSubmit('meta')} disabled={isLoading} className="flex justify-center items-center bg-purple-600 text-white font-bold py-3 px-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:bg-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors text-sm">
                {isLoading ? <LoadingSpinner /> : 'Generate Meta'}
            </button>
                <button type="button" onClick={() => handleSubmit('google')} disabled={isLoading} className="flex justify-center items-center bg-purple-600 text-white font-bold py-3 px-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:bg-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors text-sm">
                {isLoading ? <LoadingSpinner /> : 'Generate Google'}
            </button>
            <button type="button" onClick={() => handleSubmit('tiktok')} disabled={isLoading} className="flex justify-center items-center bg-purple-600 text-white font-bold py-3 px-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-slate-800 disabled:bg-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors text-sm">
                {isLoading ? <LoadingSpinner /> : 'Generate TikTok'}
            </button>
                <button type="button" onClick={() => handleSubmit('all')} disabled={isLoading} className="flex justify-center items-center bg-cyan-500 text-slate-900 font-bold py-3 px-2 rounded-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-800 disabled:bg-cyan-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors text-sm">
                {isLoading ? <LoadingSpinner /> : 'Generate All'}
            </button>
            </div>
        </form>

        {error && (
        <div className="mt-8 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
        </div>
        )}

        {adCopy && (
        <div className="mt-8 bg-[#100320] p-6 sm:p-8 rounded-xl shadow-2xl shadow-purple-900/20 border border-purple-600/30">
            {/* Tabs Only */}
            <div className="flex border-b border-purple-600/30 mb-6 overflow-x-auto">
                {adCopy.meta && (
                    <button onClick={() => setActiveTab('meta')} className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'meta' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                        Meta
                    </button>
                )}
                {adCopy.google && (
                    <button onClick={() => setActiveTab('google')} className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'google' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                        Google
                    </button>
                )}
                {adCopy.tiktok && (
                    <button onClick={() => setActiveTab('tiktok')} className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'tiktok' ? 'border-b-2 border-cyan-400 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}>
                        TikTok
                    </button>
                )}
            </div>

            {/* Tab Content with Buttons Inside */}
            {activeTab === 'meta' && adCopy.meta && (
              <MetaOutput
                copy={adCopy.meta}
                campaignPurpose={inputs.campaignPurpose}
                onCopyAll={handleCopyAll}
                onDownloadCsv={handleDownloadCsv}
                onSave={() => setShowSaveDialog(true)}
                isCopied={isCopied}
              />
            )}
            {activeTab === 'google' && adCopy.google && (
              <GoogleOutput
                copy={adCopy.google}
                campaignPurpose={inputs.campaignPurpose}
                onCopyAll={handleCopyAll}
                onDownloadCsv={handleDownloadCsv}
                onSave={() => setShowSaveDialog(true)}
                isCopied={isCopied}
              />
            )}
            {activeTab === 'tiktok' && adCopy.tiktok && (
              <TikTokOutput
                copy={adCopy.tiktok}
                campaignPurpose={inputs.campaignPurpose}
                onCopyAll={handleCopyAll}
                onDownloadCsv={handleDownloadCsv}
                onSave={() => setShowSaveDialog(true)}
                isCopied={isCopied}
              />
            )}

        </div>
        )}

        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 p-6 rounded-lg border border-purple-600 max-w-md w-full">
              <h3 className="text-xl font-bold text-slate-200 mb-4">Save Ad Copy</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name for this ad copy..."
                className="w-full bg-slate-900 text-slate-200 px-4 py-2 rounded border border-purple-600/30 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoFocus
              />
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim() || isSaving}
                  className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-6 py-2 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AdCopyForm;
