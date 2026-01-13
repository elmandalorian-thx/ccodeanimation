
import { GoogleGenAI, Type } from "@google/genai";
import { AdCopyInput, AllAdCopy, MetaAdCopy, GoogleAdCopy, TikTokAdCopy, SitelinkData, KeywordResearchData } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

// Retry helper with exponential backoff for 503 errors
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRetryable = error?.message?.includes('503') ||
                          error?.message?.includes('overloaded') ||
                          error?.message?.includes('UNAVAILABLE');
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`API overloaded, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

// --- META ADS ---
const metaAdCopySchema = {
  type: Type.OBJECT,
  properties: {
    primaryTexts: {
      type: Type.ARRAY,
      description: "Array of 5 primary text options for the ad. Each should be around 125 characters. Crucial: each option MUST start with an emoji and have a second emoji placed roughly in the middle.",
      items: { type: Type.STRING }
    },
    headlines: {
      type: Type.ARRAY,
      description: "Array of 5 headline options for the ad. Each should be around 40 characters and contain exactly one emoji.",
      items: { type: Type.STRING }
    },
    descriptions: {
      type: Type.ARRAY,
      description: "Array of 5 description options for the ad. Each should be around 30 characters and should not contain emojis.",
      items: { type: Type.STRING }
    }
  },
  required: ['primaryTexts', 'headlines', 'descriptions']
};

const generateMetaPrompt = (inputs: AdCopyInput): string => `
You are an expert Meta Ads copywriter specializing in high-converting, direct-response copy.
Your task is to generate ad copy based on the provided information.

**Ad Copy Requirements:**
1.  **Generate EXACTLY 5 Primary Texts, 5 Headlines, and 5 Descriptions.**
2.  **Primary Text:**
    *   Keep it concise and impactful, ideally around 125 characters.
    *   **Crucial rule: Each option must contain exactly two emojis. The first emoji must be the very first character of the string. The second emoji must be placed somewhere in the middle of the string.**
3.  **Headline:**
    *   Make it attention-grabbing and clear, ideally around 40 characters.
    *   **Must include exactly one relevant emoji.**
4.  **Description:**
    *   Provide a short, supplementary benefit, ideally around 30 characters.
    *   **Do not use emojis in the description.**
5.  **Tone & Style:** The copy should be persuasive, engaging, and aligned with the campaign's purpose.
6.  **Strictly adhere to the JSON output format provided.**

**Brand & Campaign Information:**
- Brand Name: ${inputs.brandName}
- Website: ${inputs.website}
- Other Relevant URLs: ${inputs.additionalUrls || 'N/A'}
- Campaign Purpose: ${inputs.campaignPurpose}

${inputs.technologiesFeatures ? `
**Technologies & Features:**
${inputs.technologiesFeatures}
` : ''}

${inputs.brandGuidelines ? `
**BRAND GUIDELINES (MUST FOLLOW STRICTLY):**
${inputs.brandGuidelines.nameFormatting ? `- Name Formatting: ${inputs.brandGuidelines.nameFormatting}` : ''}
${inputs.brandGuidelines.languageRules?.length ? `- Language Rules:\n${inputs.brandGuidelines.languageRules.map(r => `  • ${r}`).join('\n')}` : ''}
${inputs.brandGuidelines.negativeTerms?.length ? `- **Strictly Avoid These Terms:** ${inputs.brandGuidelines.negativeTerms.join(', ')}` : ''}
` : ''}

${inputs.negativeKeywords ? `- **Additional Terms to Avoid:** ${inputs.negativeKeywords}` : ''}

Analyze any provided images for additional context about the product, promotion, or brand aesthetic.
`;


// --- GOOGLE ADS ---
const googleAdCopySchema = {
  type: Type.OBJECT,
  properties: {
    headlines: {
      type: Type.ARRAY,
      description: "Array of 20 headline options. Max 30 characters each. Capitalize each word.",
      items: { type: Type.STRING }
    },
    longHeadlines: {
      type: Type.ARRAY,
      description: "Array of 10 long headline options. Max 90 characters each. Capitalize each word.",
      items: { type: Type.STRING }
    },
    shortHeadlines: {
        type: Type.ARRAY,
        description: "Array of 10 short headline options. Max 60 characters each. Capitalize each word.",
        items: { type: Type.STRING }
    },
    descriptions: {
      type: Type.ARRAY,
      description: "Array of 10 description options. Max 90 characters each. Written in complementary pairs (1&2, 3&4, etc.). No dashes.",
      items: { type: Type.STRING }
    },
    callouts: {
      type: Type.ARRAY,
      description: "Array of 25 callout extension texts. Max 25 characters each.",
      items: { type: Type.STRING }
    },
    keywords: {
        type: Type.ARRAY,
        description: "Array of 50 broad match keywords based on keyword research and trends.",
        items: { type: Type.STRING }
    }
  },
  required: ['headlines', 'longHeadlines', 'shortHeadlines', 'descriptions', 'callouts', 'keywords']
};

const generateGooglePrompt = (inputs: AdCopyInput): string => `
You are an expert Google Ads copywriter and strategist.
Your task is to generate a comprehensive set of Google Ads assets based on the provided information.

**Ad Copy Requirements:**
1.  **Generate EXACTLY 20 Headlines, 10 Long Headlines, 10 Short Headlines, 10 Descriptions, 25 Callout Extensions, and 50 Keywords.**
2.  **Headlines (20x):**
    *   Max 30 characters.
    *   **Crucial: Capitalize Each Word.**
3.  **Long Headlines (10x):**
    *   Max 90 characters.
    *   **Crucial: Capitalize Each Word.**
4.  **Short Headlines (10x):**
    *   Max 60 characters.
    *   **Crucial: Capitalize Each Word.**
5.  **Descriptions (10x):**
    *   Max 90 characters.
    *   **Must be written in complementary pairs.** (e.g., Description 1 and 2 work together, 3 and 4 work together, etc.).
    *   Follow Google's best practices for punctuation. **Do not use dashes.**
6.  **Callout Extensions (25x):**
    *   Max 25 characters. Highlight key benefits or features.
7.  **Keywords (50x):**
    *   Provide 50 relevant **broad match** keywords.
    *   Base this on Google keyword research, trends, and the provided campaign information.
8.  **Strictly adhere to the JSON output format provided.**

**Brand & Campaign Information:**
- Brand Name: ${inputs.brandName}
- Website: ${inputs.website}
- Other Relevant URLs: ${inputs.additionalUrls || 'N/A'}
- Campaign Purpose: ${inputs.campaignPurpose}

${inputs.technologiesFeatures ? `
**Technologies & Features:**
${inputs.technologiesFeatures}
` : ''}

${inputs.brandGuidelines ? `
**BRAND GUIDELINES (MUST FOLLOW STRICTLY):**
${inputs.brandGuidelines.nameFormatting ? `- Name Formatting: ${inputs.brandGuidelines.nameFormatting}` : ''}
${inputs.brandGuidelines.languageRules?.length ? `- Language Rules:\n${inputs.brandGuidelines.languageRules.map(r => `  • ${r}`).join('\n')}` : ''}
${inputs.brandGuidelines.negativeTerms?.length ? `- **Strictly Avoid These Terms:** ${inputs.brandGuidelines.negativeTerms.join(', ')}` : ''}
` : ''}

${inputs.negativeKeywords ? `- **Additional Terms to Avoid:** ${inputs.negativeKeywords}` : ''}

Analyze any provided images for additional context about the product, promotion, or brand aesthetic.
`;

// --- TIKTOK ADS ---
const tiktokAdCopySchema = {
  type: Type.OBJECT,
  properties: {
    texts: {
      type: Type.ARRAY,
      description: "Array of 5 ad text options. Strict limit: Max 100 characters each. Engaging and native to TikTok style.",
      items: { type: Type.STRING }
    }
  },
  required: ['texts']
};

const generateTikTokPrompt = (inputs: AdCopyInput): string => `
You are an expert TikTok content strategist and copywriter.
Your task is to generate ad text (captions) based on the provided information.

**Ad Copy Requirements:**
1.  **Generate EXACTLY 5 Ad Text options.**
2.  **Ad Text:**
    *   **Strict Limit: Maximum 100 characters per option.**
    *   Casual, native TikTok style (trends, slang if appropriate for brand, engaging).
    *   Include 1-2 relevant hashtags if space permits within the 100 character limit.
3.  **Strictly adhere to the JSON output format provided.**

**Brand & Campaign Information:**
- Brand Name: ${inputs.brandName}
- Website: ${inputs.website}
- Other Relevant URLs: ${inputs.additionalUrls || 'N/A'}
- Campaign Purpose: ${inputs.campaignPurpose}

${inputs.technologiesFeatures ? `
**Technologies & Features:**
${inputs.technologiesFeatures}
` : ''}

${inputs.brandGuidelines ? `
**BRAND GUIDELINES (MUST FOLLOW STRICTLY):**
${inputs.brandGuidelines.nameFormatting ? `- Name Formatting: ${inputs.brandGuidelines.nameFormatting}` : ''}
${inputs.brandGuidelines.languageRules?.length ? `- Language Rules:\n${inputs.brandGuidelines.languageRules.map(r => `  • ${r}`).join('\n')}` : ''}
${inputs.brandGuidelines.negativeTerms?.length ? `- **Strictly Avoid These Terms:** ${inputs.brandGuidelines.negativeTerms.join(', ')}` : ''}
` : ''}

${inputs.negativeKeywords ? `- **Additional Terms to Avoid:** ${inputs.negativeKeywords}` : ''}

Analyze any provided images for additional context about the product, promotion, or brand aesthetic.
`;


const parseJsonResponse = (text: string) => {
    try {
        const jsonString = text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        console.error("Raw response text:", text);
        throw new Error("Could not parse the generated content. Please try again.");
    }
}

// --- MAIN AD COPY SERVICE ---
export const generateAdCopy = async (inputs: AdCopyInput, type: 'meta' | 'google' | 'tiktok' | 'all'): Promise<AllAdCopy> => {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const model = 'gemini-2.5-flash';

  const imageParts = await Promise.all(
    inputs.files.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return { inlineData: { mimeType: file.type, data: base64Data } };
    })
  );

  const generationPromises: Promise<any>[] = [];

  if (type === 'meta' || type === 'all') {
    const metaPrompt = generateMetaPrompt(inputs);
    generationPromises.push(
      withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: metaPrompt }, ...imageParts] },
        config: { responseMimeType: 'application/json', responseSchema: metaAdCopySchema }
      })).then(response => ({ type: 'meta', data: parseJsonResponse(response.text) as MetaAdCopy }))
    );
  }

  if (type === 'google' || type === 'all') {
    const googlePrompt = generateGooglePrompt(inputs);
    generationPromises.push(
      withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: googlePrompt }, ...imageParts] },
        config: { responseMimeType: 'application/json', responseSchema: googleAdCopySchema }
      })).then(response => ({ type: 'google', data: parseJsonResponse(response.text) as GoogleAdCopy }))
    );
  }

  if (type === 'tiktok' || type === 'all') {
    const tiktokPrompt = generateTikTokPrompt(inputs);
    generationPromises.push(
      withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: tiktokPrompt }, ...imageParts] },
        config: { responseMimeType: 'application/json', responseSchema: tiktokAdCopySchema }
      })).then(response => ({ type: 'tiktok', data: parseJsonResponse(response.text) as TikTokAdCopy }))
    );
  }
  
  const results = await Promise.all(generationPromises);
  
  const allAdCopy: AllAdCopy = {};
  results.forEach(result => {
    if (result.type === 'meta') {
      allAdCopy.meta = result.data;
    } else if (result.type === 'google') {
      allAdCopy.google = result.data;
    } else if (result.type === 'tiktok') {
      allAdCopy.tiktok = result.data;
    }
  });

  return allAdCopy;
};


// --- GOOGLE TOOLS SERVICE ---

export const generateSitelinks = async (urls: string[]): Promise<SitelinkData[]> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    // Using search grounding requires specific config. responseSchema is NOT allowed with googleSearch.
    const model = 'gemini-2.5-flash'; 

    const prompt = `
    You are a Google Ads specialist. I have a list of URLs that I want to create Sitelink Extensions for.
    
    Please use Google Search to analyze the content of each URL provided below.
    For each URL, extract the meta title and description or infer the page purpose, then write a Sitelink.
    
    **Also, verify if the page exists.** If the search results indicate the page is broken, not found, or returns a 404 error, indicate this in the 'status' field.
    
    **Sitelink Rules:**
    1. **Link Text**: Max 25 characters. Clear and relevant.
    2. **Description Line 1**: Max 35 characters. A complete thought or sentence fragment.
    3. **Description Line 2**: Max 35 characters. A second complete thought or sentence fragment.
    4. **Formatting**: Ensure Description 1 and Description 2 read like two separate sentences or distinct benefits.
    5. **Status**: Set to "200 OK" if the page looks valid and accessible. Set to "404 Not Found" or "Error" if it seems broken.
    
    **URLs to Process:**
    ${urls.join('\n')}

    **Output Format:**
    Return the result ONLY as a raw JSON array of objects. Do not use Markdown formatting like \`\`\`json.
    Each object must have these keys: "url", "linkText", "description1", "description2", "status".
    Example:
    [
        { "url": "https://...", "linkText": "...", "description1": "...", "description2": "...", "status": "200 OK" },
        { "url": "https://...", "linkText": "...", "description1": "...", "description2": "...", "status": "404 Not Found" }
    ]
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }],
        }
    }));

    const text = response.text || "";
    const cleanJson = text.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(cleanJson) as SitelinkData[];
    } catch (e) {
        console.error("JSON Parse Error", e, text);
        throw new Error("Failed to generate sitelinks. The model response was not valid JSON.");
    }
};

export const analyzePageSpeed = async (url: string): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are a Web Performance Optimization expert.
    Perform a theoretical PageSpeed audit for this URL: ${url}
    
    Use Google Search to identify the technology stack (CMS, Frameworks, Servers) used by this website if possible, and look for any public performance reports or common issues associated with this specific site or its tech stack.

    Produce a "PageSpeed Optimization Plan" in Markdown format.
    
    Structure the report as follows:
    1. **Overview**: Brief summary of the site's likely tech stack and potential performance bottlenecks.
    2. **Mobile Optimization**:
       - What is likely wrong (e.g., LCP, CLS issues common with this stack).
       - Specific fixes for Mobile users.
    3. **Desktop Optimization**:
       - What is likely wrong.
       - Specific fixes for Desktop users.
    
    Be specific. If it uses WordPress, suggest specific plugins. If it uses React, suggest code splitting, etc.
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }]
        }
    }));

    return response.text || "No analysis generated.";
};

export const analyzeSchema = async (url: string): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are an AI Optimization (AIO) and SEO Specialist. 
    Analyze the following URL for Schema Markup opportunities to improve indexation and discovery by modern LLMs (like ChatGPT, Gemini, Perplexity): ${url}
    
    Use Google Search to understand the content, structure, and entity type of the page.

    Produce a "Schema Markup Strategy Report" in Markdown format.

    Structure the report as follows:
    1. **Entity Identification**: What is this page about? (e.g., Organization, Product, LocalBusiness, Article).
    2. **Missing Opportunities**: 
       - Identify specific Schema.org types that are highly recommended for this type of content but likely missing.
       - Explain *WHY* this specific schema helps LLMs (e.g., "Adding 'FAQPage' helps LLMs extract direct answers").
    3. **JSON-LD Examples**:
       - Provide code blocks with *sample* JSON-LD for the most critical missing schema.
    4. **LLM Discovery Tips**:
       - Aside from schema, give 2-3 tips on how to structure the text content (headings, entity clarity) to be better understood by AI models.
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }]
        }
    }));

    return response.text || "No schema analysis generated.";
};

export const analyzeGeo = async (url: string): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are an expert in Generative Engine Optimization (GEO) and AIO (Artificial Intelligence Optimization).
    Your goal is to audit the following URL to see how well it is optimized to appear in AI Search Overviews (like Google SGE, Perplexity, ChatGPT Search, Gemini).
    
    Target URL: ${url}

    Use Google Search to analyze the page content and, if possible, compare it briefly to authoritative competitors in the niche.

    Produce a "GEO (Generative Engine Optimization) Scorecard" in polished Markdown.

    **Structure the report as follows:**

    ### 1. 🧠 Entity Clarity & Confidence
    *   **The "Who/What" Check**: Does the content define its main entity immediately in the first 200 words? (AIs rely on this anchor).
    *   **Authority Signal**: Is the author or brand clearly identified as an expert?
    *   **Factuality**: Does the content align with general consensus, or is it hallucination-prone due to ambiguity?

    ### 2. 📝 Citation Worthiness (The "RAG" Factor)
    *   **Unique Data/Stats**: Does the page offer unique numbers or insights that an AI would *want* to cite?
    *   **External Linking**: Does it link to other high-authority sources (signals trust to the AI)?
    *   **Quote-ability**: Does it contain clear, concise definition statements (e.g., "X is Y because Z")? AIs love these for snippets.

    ### 3. 🏗️ Structural Fluency
    *   **Scannability**: Usage of H2s, H3s, and Bullet points. (AIs parse structured text faster than walls of text).
    *   **Direct Answers**: Does the content answer "People Also Ask" style questions directly?

    ### 4. 🚀 GEO Recommendations
    *   Provide 3 concrete, high-impact changes to make this content "AI-First".
    *   *Example: "Add a 'Key Takeaways' bulleted list at the top for easy summarization."*

    Make the tone professional, forward-thinking, and specific to the AI era of search.
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }]
        }
    }));

    return response.text || "No analysis generated.";
};

export const performKeywordResearch = async (seedKeywords: string): Promise<KeywordResearchData[]> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are a Senior SEO Strategist and Keyword Researcher.
    I will provide a set of "Seed Keywords". 
    
    Your task is to:
    1.  **Generate a comprehensive list of related keywords** (aim for 20-30 high-quality variations, including long-tail and semantic relatives).
    2.  **Estimate the Search Volume**: Since you don't have the Google Ads API, use your knowledge and Google Search trends to estimate if the volume is "Very High", "High", "Medium", or "Low".
    3.  **Identify User Intent**: Is it Informational, Commercial, Transactional, or Navigational?
    4.  **Trend Context**: Use Google Search to see if these topics are currently trending, seasonal, or stable.
    5.  **Estimate Difficulty & CPC**: Provide a strategic estimate for ranking difficulty (Hard/Med/Easy) and CPC (Low/Med/High cost).

    **Seed Keywords:**
    ${seedKeywords}

    **Output Format:**
    Return the result ONLY as a raw JSON array of objects. Do not use Markdown formatting like \`\`\`json.
    Each object must have these keys: "keyword", "intent", "volume", "trend", "difficulty", "cpcEstimate".
    
    "intent" options: 'Informational', 'Commercial', 'Transactional', 'Navigational'
    "volume" options: 'Very High', 'High', 'Medium', 'Low'
    "trend" options: 'Rising', 'Stable', 'Falling', 'Seasonal'
    "difficulty" options: 'Hard', 'Medium', 'Easy'

    Example:
    [
        { "keyword": "best running shoes 2024", "intent": "Commercial", "volume": "High", "trend": "Seasonal", "difficulty": "Hard", "cpcEstimate": "High ($2-5)" }
    ]
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }],
        }
    }));

    const text = response.text || "";
    const cleanJson = text.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(cleanJson) as KeywordResearchData[];
    } catch (e) {
        console.error("JSON Parse Error", e, text);
        throw new Error("Failed to parse keyword data. Please try again.");
    }
};

export const analyzeCompetitors = async (brandUrl: string, competitorUrls: string[]): Promise<string> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are a Strategic SEO & GEO (Generative Engine Optimization) Analyst.
    Your task is to perform a Competitive Gap Analysis between a target brand and its competitors, specifically focusing on how they appear in AI Search Overviews (SGE, ChatGPT, Perplexity).

    **Target Brand:** ${brandUrl}
    **Competitors:**
    ${competitorUrls.map(url => `- ${url}`).join('\n')}

    Use Google Search to analyze the content structure, topical authority, and "citation worthiness" of all these URLs.

    **Produce a "GEO Competitive Intelligence Report" in Markdown.**

    **Structure:**
    1.  **The Battlefield Overview**: Briefly compare the intent and depth of the target page vs. the competitors. Who answers the user's core question fastest?
    2.  **Entity & Topic Gaps**:
        *   What sub-topics or specific entities do the competitors define clearly that the target brand misses?
        *   (e.g., "Competitor A has a dedicated section for 'Pricing Factors', Brand X does not.")
    3.  **Data & Trust Signals**:
        *   Do competitors cite specific studies, data points, or expert authors that make them more likely to be cited by an AI?
    4.  **Winning Strategy (3 Moves)**:
        *   Give 3 specific, actionable recommendations for the Target Brand to outrank these competitors in Generative results.
    `;

    const response = await withRetry(() => ai.models.generateContent({
        model,
        contents: { parts: [{ text: prompt }] },
        config: {
            tools: [{ googleSearch: {} }]
        }
    }));

    return response.text || "No analysis generated.";
};
