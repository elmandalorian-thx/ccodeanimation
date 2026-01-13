import Anthropic from "@anthropic-ai/sdk";
import { AdCopyInput, AllAdCopy, MetaAdCopy, GoogleAdCopy, TikTokAdCopy } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

// Retry helper with exponential backoff
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
      const isRetryable = error?.status === 529 ||
                          error?.status === 503 ||
                          error?.message?.includes('overloaded');
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

const getClient = () => {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_ANTHROPIC_API_KEY environment variable is not set.");
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
};

// --- PROMPTS ---
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

Return your response as valid JSON with this exact structure:
{
  "primaryTexts": ["text1", "text2", "text3", "text4", "text5"],
  "headlines": ["headline1", "headline2", "headline3", "headline4", "headline5"],
  "descriptions": ["desc1", "desc2", "desc3", "desc4", "desc5"]
}
`;

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

Return your response as valid JSON with this exact structure:
{
  "headlines": ["h1", "h2", ...20 items],
  "longHeadlines": ["lh1", "lh2", ...10 items],
  "shortHeadlines": ["sh1", "sh2", ...10 items],
  "descriptions": ["d1", "d2", ...10 items],
  "callouts": ["c1", "c2", ...25 items],
  "keywords": ["kw1", "kw2", ...50 items]
}
`;

const generateTikTokPrompt = (inputs: AdCopyInput): string => `
You are an expert TikTok content strategist and copywriter.
Your task is to generate ad text (captions) based on the provided information.

**Ad Copy Requirements:**
1.  **Generate EXACTLY 5 Ad Text options.**
2.  **Ad Text:**
    *   **Strict Limit: Maximum 100 characters per option.**
    *   Casual, native TikTok style (trends, slang if appropriate for brand, engaging).
    *   Include 1-2 relevant hashtags if space permits within the 100 character limit.

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

Return your response as valid JSON with this exact structure:
{
  "texts": ["text1", "text2", "text3", "text4", "text5"]
}
`;

const parseJsonResponse = (text: string): any => {
  try {
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1].trim() : text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse Claude response:", error);
    console.error("Raw response text:", text);
    throw new Error("Could not parse the generated content. Please try again.");
  }
};

// Convert file to base64 and get media type
const prepareImageForClaude = async (file: File): Promise<Anthropic.ImageBlockParam> => {
  const base64Data = await fileToBase64(file);
  const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  return {
    type: "image",
    source: {
      type: "base64",
      media_type: mediaType,
      data: base64Data,
    },
  };
};

// --- MAIN AD COPY SERVICE ---
export const generateAdCopy = async (
  inputs: AdCopyInput,
  type: 'meta' | 'google' | 'tiktok' | 'all'
): Promise<AllAdCopy> => {
  const client = getClient();

  // Prepare images if any
  const imageBlocks: Anthropic.ImageBlockParam[] = await Promise.all(
    inputs.files
      .filter(file => file.type.startsWith('image/'))
      .map(file => prepareImageForClaude(file))
  );

  const generateWithClaude = async (prompt: string): Promise<string> => {
    const content: Anthropic.MessageCreateParams['content'] = [
      ...imageBlocks,
      { type: "text", text: prompt }
    ];

    if (imageBlocks.length > 0) {
      content.unshift({
        type: "text",
        text: "Analyze the provided images for additional context about the product, promotion, or brand aesthetic."
      });
    }

    const response = await withRetry(() =>
      client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content }],
      })
    );

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text : '';
  };

  const allAdCopy: AllAdCopy = {};

  if (type === 'meta' || type === 'all') {
    const prompt = generateMetaPrompt(inputs);
    const response = await generateWithClaude(prompt);
    allAdCopy.meta = parseJsonResponse(response) as MetaAdCopy;
  }

  if (type === 'google' || type === 'all') {
    const prompt = generateGooglePrompt(inputs);
    const response = await generateWithClaude(prompt);
    allAdCopy.google = parseJsonResponse(response) as GoogleAdCopy;
  }

  if (type === 'tiktok' || type === 'all') {
    const prompt = generateTikTokPrompt(inputs);
    const response = await generateWithClaude(prompt);
    allAdCopy.tiktok = parseJsonResponse(response) as TikTokAdCopy;
  }

  return allAdCopy;
};
