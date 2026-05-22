'use server';

/**
 * @fileOverview Analyzes user-uploaded writing samples using Google's Gemini API to create a custom writing profile and saves it to Postgres.
 *
 * - analyzeWritingStyle - A function that handles the writing style analysis process.
 * - AnalyzeWritingStyleInput - The input type for the analyzeWritingstyle function.
 * - AnalyzeWritingStyleOutput - The return type for the analyzeWritingStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { saveStyleProfile } from '@/services/data';
import { extractTextFromFile } from './extract-text-from-file';


const AnalyzeWritingStyleInputSchema = z.object({
  fileDataUris: z
    .array(z.string())
    .describe('An array of file contents as data URIs.'),
});
export type AnalyzeWritingStyleInput = z.infer<typeof AnalyzeWritingStyleInputSchema>;

const AnalyzeWritingStyleOutputSchema = z.object({
  analysisData: z
    .object({
      pointOfView: z.string().describe('The primary point of view used (e.g., First Person, Third Person Limited). This is a critical attribute.'),
      vocabularyComplexity: z.string().describe('The complexity of the vocabulary (e.g., Simple, Advanced, Mixed).'),
      sentenceStructure: z.string().describe('Typical sentence structure (e.g., Short and punchy, Long and descriptive, Varied).'),
      toneAndMood: z.string().describe('The dominant tone and mood (e.g., Dark and suspenseful, Light and humorous).'),
      dialogueStyle: z.string().describe('The style of dialogue (e.g., Direct and witty, Formal, Sparse).'),
      punctuationUsage: z.string().describe('Distinctive punctuation habits (e.g., Frequent use of em-dashes for effect, Minimalist punctuation).'),
    })
    .describe('Detailed analysis of writing style patterns.'),
  customPrompt: z.string().describe('A detailed, personalized system prompt that encapsulates the full writing style to guide the ghostwriting AI.'),
});
export type AnalyzeWritingStyleOutput = z.infer<typeof AnalyzeWritingStyleOutputSchema>;

export async function analyzeWritingStyle(input: AnalyzeWritingStyleInput): Promise<AnalyzeWritingStyleOutput> {
  return analyzeWritingStyleFlow(input);
}

const analyzeWritingStylePrompt = ai.definePrompt({
  name: 'analyzeWritingStylePrompt',
  input: {schema: z.object({
    textSamples: z.array(z.string()),
  })},
  output: {schema: AnalyzeWritingStyleOutputSchema},
  prompt: `You are an expert literary analyst AI. Your task is to perform a deep analysis of the provided writing samples to create a comprehensive authorial style profile. This profile will be used to guide another AI to ghostwrite in the same style. Be precise and detailed.

Analyze the following writing samples:
{{#each textSamples}}
---
{{this}}
---
{{/each}}

Based on your analysis, provide a detailed breakdown for each of the following categories and then generate a custom prompt for the ghostwriting AI.

**Analysis Categories:**

1.  **Point of View (CRITICAL):** Identify the narrative perspective. Is it First Person ("I", "we"), Second Person ("you"), or Third Person ("he", "she", "they")? If Third Person, is it limited or omniscient? This is the most important attribute to get right.
2.  **Vocabulary Complexity:** Describe the author's word choice. Is it simple and direct, or complex and academic? Are there recurring types of words (e.g., technical jargon, poetic language)?
3.  **Sentence Structure:** Analyze sentence patterns. Are they typically short and punchy, long and flowing, or a mix? Is there a lot of variation?
4.  **Tone and Mood:** What is the overall feeling the writing evokes? Is it dark, humorous, formal, conversational, suspenseful, romantic?
5.  **Dialogue Style:** How is dialogue written? Is it fast-paced and witty, or more formal and descriptive? How much of the text is dialogue versus narration?
6.  **Punctuation Usage:** Note any distinctive uses of punctuation. Is there frequent use of em-dashes, ellipses, or semicolons? Is the punctuation style conventional or more experimental?

**Custom Prompt Generation:**

Based on your detailed analysis, create a comprehensive "customPrompt" for a ghostwriting AI. This prompt should be a directive that clearly explains how to replicate the author's style. It must start with: "You are an expert ghostwriter. Your sole purpose is to write in a style that is indistinguishable from the user's. Adhere to the following rules derived from their work:" and then list the specific stylistic instructions based on your analysis above.

Output the final result in the required JSON format.
`,
});

const analyzeWritingStyleFlow = ai.defineFlow(
  {
    name: 'analyzeWritingStyleFlow',
    inputSchema: AnalyzeWritingStyleInputSchema,
    outputSchema: AnalyzeWritingStyleOutputSchema,
  },
  async ({ fileDataUris }) => {
    
    const textExtractionPromises = fileDataUris.map(uri => 
      extractTextFromFile({ fileDataUri: uri }).catch(e => {
        console.warn("Skipping a file that failed to parse:", e);
        return { extractedText: "" }; // Return an object with empty text on failure
      })
    );

    const extractionResults = await Promise.all(textExtractionPromises);
    const textSamples = extractionResults.map(r => r.extractedText).filter(text => text && text.trim().length > 0);

    if (textSamples.length === 0) {
        throw new Error("Could not extract any text from the provided files. Please check the files and try again.");
    }

    const {output} = await analyzeWritingStylePrompt({textSamples});
    
    if (!output) {
      throw new Error('Failed to analyze writing style.');
    }
    
    await saveStyleProfile(output);
    return output;
  }
);
