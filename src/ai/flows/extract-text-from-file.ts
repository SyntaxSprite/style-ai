'use server';
/**
 * @fileOverview A flow for extracting text from various file types.
 *
 * - extractTextFromFile - A function that handles the text extraction process.
 * - ExtractTextFromFileInput - The input type for the extractTextFromFile function.
 * - ExtractTextFromFileOutput - The return type for the extractTextFromFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import pdf from 'pdf-parse/lib/pdf-parse';
import { Document } from 'docx';

const ExtractTextFromFileInputSchema = z.object({
    fileDataUri: z.string().describe("A file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractTextFromFileInput = z.infer<typeof ExtractTextFromFileInputSchema>;

const ExtractTextFromFileOutputSchema = z.object({
    extractedText: z.string().describe('The text extracted from the file.'),
});
export type ExtractTextFromFileOutput = z.infer<typeof ExtractTextFromFileOutputSchema>;


export async function extractTextFromFile(input: ExtractTextFromFileInput): Promise<ExtractTextFromFileOutput> {
    return extractTextFromFileFlow(input);
}

const extractTextFromFileFlow = ai.defineFlow(
    {
        name: 'extractTextFromFileFlow',
        inputSchema: ExtractTextFromFileInputSchema,
        outputSchema: ExtractTextFromFileOutputSchema,
    },
    async ({ fileDataUri }) => {
        const match = fileDataUri.match(/^data:(.*);base64,(.*)$/);
        if (!match) {
            console.warn("Invalid data URI format. Skipping file.");
            return { extractedText: "" };
        }
        
        const mimeType = match[1];
        const base64Data = match[2];
        let text = '';
        
        try {
            const buffer = Buffer.from(base64Data, 'base64');
    
            if (mimeType === 'application/pdf') {
                const data = await pdf(buffer);
                text = data.text;
            } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // This is a placeholder for DOCX parsing.
                // The `docx` library is primarily for creating documents, not parsing them.
                // A proper parsing library (like `mammoth`) would be needed for full support.
                // For now, we will return an empty string to avoid crashing.
                console.warn("DOCX parsing is not fully supported and may yield incomplete results.");
                text = ""; // Placeholder
            } else if (mimeType.startsWith('text/')) {
                text = buffer.toString();
            } else {
                console.warn(`Unsupported file type: ${mimeType}. Skipping file.`);
            }
        } catch (error) {
            console.error(`Error parsing file with mime type ${mimeType}:`, error);
            // Return empty string on error to avoid crashing the whole analysis
            return { extractedText: "" };
        }

        return { extractedText: text };
    }
);
