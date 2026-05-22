'use server';
/**
 * @fileOverview Generates story chapters tailored to the user's unique style using Mistral AI.
 *
 * - generateContent - A function that generates content based on user style and prompt.
 * - GenerateContentInput - The input type for the generateContent function.
 * - GenerateContentOutput - The return type for the generateContent function.
 */

import {ai} from '@/ai/genkit';
import { getStyleProfile, saveGeneratedContent, getBook, getContentHistory } from '@/services/data';
import {z} from 'genkit';
import MistralClient from '@mistralai/mistralai';
import { config } from 'dotenv';

config(); // Load environment variables

const mistralClient = new MistralClient(process.env.MISTRAL_API_KEY || "your_mistral_api_key_here");

const GenerateContentInputSchema = z.object({
  bookId: z.string().describe('The ID of the book.'),
  prompt: z.string().describe('The prompt for the story chapter.'),
  contentType: z.string().describe('The type of content to generate, e.g., "Chapter".'),
  textToRefine: z.string().optional().describe('The existing text of the chapter to refine.'),
  refinementPrompt: z.string().optional().describe('The user\'s instructions for refining the chapter.'),
});
export type GenerateContentInput = z.infer<typeof GenerateContentInputSchema>;

const GenerateContentOutputSchema = z.object({
  generatedText: z.string().describe('The generated story chapter.'),
  contentId: z.string().optional().describe('The ID of the saved content document if it was saved.'),
});
export type GenerateContentOutput = z.infer<typeof GenerateContentOutputSchema>;

export async function generateContent(input: GenerateContentInput): Promise<GenerateContentOutput> {
  const [styleProfile, book, history] = await Promise.all([
      getStyleProfile(),
      getBook(input.bookId),
      getContentHistory(input.bookId)
  ]);
  
  if (!book) {
      throw new Error(`Book with id ${input.bookId} not found.`);
  }

  const previousChapters = history
      .map((c, i) => `Chapter ${i + 1} (Title: ${c.prompt.split('\n')[0].replace('Title: ', '')}):\n${c.generatedText.substring(0, 300)}...`)
      .join('\n\n');

  const systemPrompt = buildSystemPrompt({
    customPrompt: styleProfile?.customPrompt,
    pointOfView: styleProfile?.analysisData.pointOfView,
    bookBlurb: book.blurb,
    bookOutline: book.outline,
    previousChapters: previousChapters,
    textToRefine: input.textToRefine,
    refinementPrompt: input.refinementPrompt,
  });

  const userPrompt = buildUserPrompt({
      prompt: input.prompt,
      textToRefine: input.textToRefine,
      refinementPrompt: input.refinementPrompt,
  });

  const response = await mistralClient.chat({
    model: 'mistral-large-latest',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
  });
  
  const generatedText = response.choices[0].message.content;

  if (!generatedText) {
    throw new Error('Failed to generate content from Mistral.');
  }

  return { generatedText };
}

function buildSystemPrompt(input: {
  customPrompt?: string;
  pointOfView?: string;
  bookBlurb: string;
  bookOutline: string;
  previousChapters?: string;
  textToRefine?: string;
  refinementPrompt?: string;
}) {
  let systemPrompt = `You are an expert ghostwriter. Your primary goal is to write a compelling story chapter that perfectly matches the user's established style and the book's context.

**Book Context:**
- **Blurb:** ${input.bookBlurb}
- **Outline:** ${input.bookOutline}
`;

  if (input.previousChapters) {
    systemPrompt += `
**Previous Chapter Summaries (for context and consistency):**
${input.previousChapters}
`;
  }

  // This is the most critical instruction section.
  if (input.customPrompt) {
    systemPrompt += `
**USER'S WRITING STYLE (CRITICAL INSTRUCTIONS):**
${input.customPrompt}

**NARRATIVE POINT OF VIEW (ABSOLUTE RULE):**
You MUST write from the following point of view: **${input.pointOfView}**. Do not deviate from this perspective under any circumstances. Failure to adhere to this point of view will ruin the entire story.
`;
  }
  
  if (input.textToRefine) {
      systemPrompt += `
**TASK: REFINE EXISTING CHAPTER**
You are not writing a new chapter from scratch. Instead, you must rewrite the provided chapter text based on the user's specific refinement instructions. Incorporate the changes seamlessly while maintaining the established style and context.
- **Original Chapter Text to Refine:** ${input.textToRefine}
`;
  }
  
  systemPrompt += `
**Formatting and Output Rules:**
- Use Markdown for emphasis where appropriate and natural for the style (e.g., **bold** for impact, *italics* for thoughts or nuanced emphasis).
- Do NOT overuse bolding or any other emphasis. It should feel natural to the writing style, not like a screenplay.
- Do NOT use other markdown like headers (e.g., ###) or blockquotes (>).
- Ensure paragraphs are well-formed and the chapter flows logically and compellingly from beginning to end.
- Write the full chapter text. Do not provide a summary or a plan.
`;

  return systemPrompt;
}

function buildUserPrompt(input: {
  prompt: string;
  textToRefine?: string;
  refinementPrompt?: string;
}) {
  if (input.textToRefine) {
    return `Here are my refinement instructions. Please rewrite the entire chapter, incorporating these changes while adhering to all system instructions about style, POV, and context:\n\n**Refinement Instructions:**\n${input.refinementPrompt}`;
  }
  
  return `Write a full, engaging story chapter based on the following user prompt. Ensure the chapter has a clear beginning, middle, and end. Adhere strictly to all system instructions, especially the point of view, established writing style, and formatting rules.\n\n**User Prompt:**\n${input.prompt}`;
}

export const acceptContent = ai.defineFlow(
  {
    name: 'acceptContentFlow',
    inputSchema: z.object({
      bookId: z.string(),
      prompt: z.string(),
      generatedText: z.string(),
      contentType: z.string(),
    }),
    outputSchema: z.object({
      contentId: z.string(),
    }),
  },
  async ({ bookId, prompt, generatedText, contentType }) => {
    const contentId = await saveGeneratedContent({
      bookId,
      prompt,
      generatedText,
      contentType,
    });
    return { contentId };
  }
);
