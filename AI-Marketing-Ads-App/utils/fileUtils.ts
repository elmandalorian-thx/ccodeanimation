
import { MetaAdCopy, GoogleAdCopy, TikTokAdCopy, SitelinkData, KeywordResearchData } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const escapeCsvField = (field: string | undefined): string => {
    if (field === undefined || field === null) return '""';
    return `"${field.replace(/"/g, '""')}"`;
}

export const generateMetaCsvContent = (data: MetaAdCopy): string => {
  const headers = '"Primary Text","Headline","Description"';
  const rows = [];
  const numRows = Math.max(
    data.primaryTexts?.length || 0,
    data.headlines?.length || 0,
    data.descriptions?.length || 0
  );

  for (let i = 0; i < numRows; i++) {
    rows.push([
        escapeCsvField(data.primaryTexts?.[i]),
        escapeCsvField(data.headlines?.[i]),
        escapeCsvField(data.descriptions?.[i]),
    ].join(','));
  }
  return [headers, ...rows].join('\n');
};

export const generateGoogleCsvContent = (data: GoogleAdCopy): string => {
    const headers = '"Headline","Long Headline","Short Headline","Description","Callout","Keyword"';
    const rows = [];
    const numRows = Math.max(
      data.headlines?.length || 0,
      data.longHeadlines?.length || 0,
      data.shortHeadlines?.length || 0,
      data.descriptions?.length || 0,
      data.callouts?.length || 0,
      data.keywords?.length || 0,
    );
  
    for (let i = 0; i < numRows; i++) {
      rows.push([
        escapeCsvField(data.headlines?.[i]),
        escapeCsvField(data.longHeadlines?.[i]),
        escapeCsvField(data.shortHeadlines?.[i]),
        escapeCsvField(data.descriptions?.[i]),
        escapeCsvField(data.callouts?.[i]),
        escapeCsvField(data.keywords?.[i]),
      ].join(','));
    }
    return [headers, ...rows].join('\n');
};

export const generateTikTokCsvContent = (data: TikTokAdCopy): string => {
  const headers = '"TikTok Ad Text"';
  const rows = [];
  const numRows = data.texts?.length || 0;

  for (let i = 0; i < numRows; i++) {
    rows.push([
        escapeCsvField(data.texts?.[i]),
    ].join(','));
  }
  return [headers, ...rows].join('\n');
};

export const generateSitelinksCsvContent = (data: SitelinkData[]): string => {
    const headers = '"URL","Link Text","Description Line 1","Description Line 2","Status"';
    const rows = data.map(item => [
        escapeCsvField(item.url),
        escapeCsvField(item.linkText),
        escapeCsvField(item.description1),
        escapeCsvField(item.description2),
        escapeCsvField(item.status)
    ].join(','));
    return [headers, ...rows].join('\n');
};

export const generateKeywordResearchCsvContent = (data: KeywordResearchData[]): string => {
    const headers = '"Keyword","Intent","Volume Estimate","Trend Context","Difficulty","CPC Estimate"';
    const rows = data.map(item => [
        escapeCsvField(item.keyword),
        escapeCsvField(item.intent),
        escapeCsvField(item.volume),
        escapeCsvField(item.trend),
        escapeCsvField(item.difficulty),
        escapeCsvField(item.cpcEstimate)
    ].join(','));
    return [headers, ...rows].join('\n');
};

const generateExcelCopySection = (title: string, items: string[] | undefined): string[] => {
    const parts: string[] = [];
    parts.push(title);
    if (items && Array.isArray(items)) {
        parts.push(...items);
    }
    return parts;
}

export const generateMetaExcelCopyContent = (data: MetaAdCopy): string => {
  const sections = [
    generateExcelCopySection('Primary Texts', data.primaryTexts),
    generateExcelCopySection('Headlines', data.headlines),
    generateExcelCopySection('Descriptions', data.descriptions),
  ];
  return sections.map(part => part.join('\n')).join('\n\n');
};

export const generateGoogleExcelCopyContent = (data: GoogleAdCopy): string => {
    const sections = [
      generateExcelCopySection('Headlines', data.headlines),
      generateExcelCopySection('Long Headlines', data.longHeadlines),
      generateExcelCopySection('Short Headlines', data.shortHeadlines),
      generateExcelCopySection('Descriptions', data.descriptions),
      generateExcelCopySection('Callout Extensions', data.callouts),
      generateExcelCopySection('Keywords', data.keywords),
    ];
    return sections.map(part => part.join('\n')).join('\n\n');
  };

export const generateTikTokExcelCopyContent = (data: TikTokAdCopy): string => {
  const sections = [
    generateExcelCopySection('TikTok Ad Text', data.texts),
  ];
  return sections.map(part => part.join('\n')).join('\n\n');
};

export const generateSitelinksExcelCopyContent = (data: SitelinkData[]): string => {
    const header = "URL\tLink Text\tDescription Line 1\tDescription Line 2\tStatus";
    const rows = data.map(item => `${item.url}\t${item.linkText}\t${item.description1}\t${item.description2}\t${item.status}`);
    return [header, ...rows].join('\n');
};

export const generateKeywordResearchExcelCopyContent = (data: KeywordResearchData[]): string => {
    const header = "Keyword\tIntent\tVolume\tTrend\tDifficulty\tCPC Estimate";
    const rows = data.map(item => `${item.keyword}\t${item.intent}\t${item.volume}\t${item.trend}\t${item.difficulty}\t${item.cpcEstimate}`);
    return [header, ...rows].join('\n');
};
