import React, { useState, useEffect } from 'react';
import { Brand, AdCopy } from '../../src/types/database';
import { fetchAdCopies, renameAdCopy, deleteAdCopy } from '../../src/services/adCopyService';
import { generateMetaCsvContent, generateGoogleCsvContent, generateTikTokCsvContent } from '../../utils/fileUtils';
import { LoadingSpinner, DownloadIcon } from '../icons';
import { Copy } from 'lucide-react';
import OutputSection from '../OutputSection';

interface AdCopyManagerProps {
  brand: Brand;
}

const AdCopyManager: React.FC<AdCopyManagerProps> = ({ brand }) => {
  const [adCopies, setAdCopies] = useState<AdCopy[]>([]);
  const [selectedAdCopy, setSelectedAdCopy] = useState<AdCopy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meta' | 'google' | 'tiktok'>('meta');

  useEffect(() => {
    loadAdCopies();
  }, [brand.id]);

  const loadAdCopies = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdCopies(brand.id);
      setAdCopies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (id: string) => {
    const newName = prompt('Enter new name:');
    if (!newName) return;
    try {
      await renameAdCopy(id, newName);
      await loadAdCopies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad copy?')) return;
    try {
      await deleteAdCopy(id);
      if (selectedAdCopy?.id === id) setSelectedAdCopy(null);
      await loadAdCopies();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyForExcel = (adCopy: AdCopy) => {
    let csvContent = '';

    if (activeTab === 'meta' && adCopy.meta_copy) {
      csvContent = generateMetaCsvContent(adCopy.meta_copy);
    } else if (activeTab === 'google' && adCopy.google_copy) {
      csvContent = generateGoogleCsvContent(adCopy.google_copy);
    } else if (activeTab === 'tiktok' && adCopy.tiktok_copy) {
      csvContent = generateTikTokCsvContent(adCopy.tiktok_copy);
    }

    navigator.clipboard.writeText(csvContent).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleDownloadCsv = (adCopy: AdCopy) => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'meta' && adCopy.meta_copy) {
      csvContent = generateMetaCsvContent(adCopy.meta_copy);
      filename = `${adCopy.name}_meta.csv`;
    } else if (activeTab === 'google' && adCopy.google_copy) {
      csvContent = generateGoogleCsvContent(adCopy.google_copy);
      filename = `${adCopy.name}_google.csv`;
    } else if (activeTab === 'tiktok' && adCopy.tiktok_copy) {
      csvContent = generateTikTokCsvContent(adCopy.tiktok_copy);
      filename = `${adCopy.name}_tiktok.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (selectedAdCopy) {
    return (
      <div>
        <button
          onClick={() => setSelectedAdCopy(null)}
          className="text-cyan-400 hover:text-cyan-300 mb-4 flex items-center gap-2"
        >
          ← Back to List
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-200">{selectedAdCopy.name}</h2>
            {selectedAdCopy.campaign_purpose && (
              <p className="text-slate-400 mt-1">{selectedAdCopy.campaign_purpose}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleCopyForExcel(selectedAdCopy)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy for Excel
            </button>
            <button
              type="button"
              onClick={() => handleDownloadCsv(selectedAdCopy)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              <DownloadIcon className="h-5 w-5" />
              Download CSV
            </button>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            {selectedAdCopy.meta_copy && (
              <button
                onClick={() => setActiveTab('meta')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'meta' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Meta
              </button>
            )}
            {selectedAdCopy.google_copy && (
              <button
                onClick={() => setActiveTab('google')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'google' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Google
              </button>
            )}
            {selectedAdCopy.tiktok_copy && (
              <button
                onClick={() => setActiveTab('tiktok')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'tiktok' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                TikTok
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'meta' && selectedAdCopy.meta_copy && (
            <>
              <OutputSection
                title="Primary Texts (125 chars)"
                items={selectedAdCopy.meta_copy.primaryTexts}
                platform="meta"
                fieldType="primaryText"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Headlines (40 chars)"
                items={selectedAdCopy.meta_copy.headlines}
                platform="meta"
                fieldType="headline"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Descriptions (30 chars)"
                items={selectedAdCopy.meta_copy.descriptions}
                platform="meta"
                fieldType="description"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
            </>
          )}
          {activeTab === 'google' && selectedAdCopy.google_copy && (
            <>
              <OutputSection
                title="Headlines (30 chars)"
                items={selectedAdCopy.google_copy.headlines}
                platform="google"
                fieldType="headline"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Long Headlines (90 chars)"
                items={selectedAdCopy.google_copy.longHeadlines}
                platform="google"
                fieldType="longHeadline"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Short Headlines (60 chars)"
                items={selectedAdCopy.google_copy.shortHeadlines}
                platform="google"
                fieldType="shortHeadline"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Descriptions (90 chars)"
                items={selectedAdCopy.google_copy.descriptions}
                platform="google"
                fieldType="description"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Callouts (25 chars)"
                items={selectedAdCopy.google_copy.callouts}
                platform="google"
                fieldType="callout"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
              <OutputSection
                title="Keywords"
                items={selectedAdCopy.google_copy.keywords}
                platform="google"
                fieldType="keyword"
                adCopyId={selectedAdCopy.id}
                campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
              />
            </>
          )}
          {activeTab === 'tiktok' && selectedAdCopy.tiktok_copy && (
            <OutputSection
              title="Ad Text (100 chars)"
              items={selectedAdCopy.tiktok_copy.texts}
              platform="tiktok"
              fieldType="text"
              adCopyId={selectedAdCopy.id}
              campaignPurpose={selectedAdCopy.campaign_purpose || undefined}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-200 mb-6">Saved Ad Copies</h2>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {adCopies.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-lg border border-purple-600/30">
          <p className="text-lg text-slate-400">No saved ad copies yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {adCopies.map(adCopy => (
            <div
              key={adCopy.id}
              className="bg-slate-800/50 p-6 rounded-lg border border-purple-600/30 hover:border-cyan-400 transition-all cursor-pointer group"
              onClick={() => setSelectedAdCopy(adCopy)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {adCopy.name}
                  </h3>
                  {adCopy.campaign_purpose && (
                    <p className="text-sm text-slate-400 mt-1">{adCopy.campaign_purpose}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {adCopy.meta_copy && <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">Meta</span>}
                    {adCopy.google_copy && <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">Google</span>}
                    {adCopy.tiktok_copy && <span className="text-xs bg-purple-600/30 px-2 py-1 rounded">TikTok</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(adCopy.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(adCopy.id);
                    }}
                    className="text-sm px-3 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(adCopy.id);
                    }}
                    className="text-sm px-3 py-1 bg-red-900/50 text-red-300 rounded hover:bg-red-900/70"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdCopyManager;
