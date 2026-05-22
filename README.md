# StyleAI - AI-Powered Writing Tool

## Overview

StyleAI is a cutting-edge AI-powered writing tool designed to revolutionize your content creation process. Leveraging the latest advancements in artificial intelligence, StyleAI helps you refine your writing, improve clarity, and achieve the perfect tone for any audience.

## Features

*   **AI-Powered Refinement:** Utilizes advanced AI models from Google AI and Mistral AI, powered by Genkit AI, to enhance grammar, style, and overall writing quality.
*   **Intelligent Tone Adjustment:** Tailor the tone of your text to match your specific needs, whether it's professional, casual, persuasive, or engaging.
*   **Clarity and Conciseness:** Eliminates jargon, clichés, and complex sentence structures to ensure your writing is easily understood.
*   **Real-time Suggestions:** Provides contextual suggestions as you type, helping you improve your writing on the fly.
*   **Content History:** Stores your writing history for easy access and version control.
*   **User Style Profiles:** Create and manage different writing style profiles to suit various projects and audiences.
*   **Document Support:** Supports importing and exporting content in various formats, including DOCX and PDF.
*   **Dashboard Analytics:** Visualize your writing progress and track key metrics with interactive charts.
*   **Authentication and Authorization:** Secure email/password authentication powered by Auth.js.

## Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (v14): React framework for building performant and scalable web applications
    *   [TypeScript](https://www.typescriptlang.org/): Superset of JavaScript that adds static typing for improved code maintainability
    *   [Tailwind CSS](https://tailwindcss.com/): Utility-first CSS framework for rapid UI development
    *   [Shadcn UI](https://ui.shadcn.com/): Collection of accessible and reusable UI components
    *   [Lucide React](https://lucide.dev/): Beautifully simple vector icons
    *   [React Hook Form](https://react-hook-form.com/): Library for building robust and user-friendly forms
    *   [Zod](https://zod.dev/): TypeScript-first schema validation with static type inference
*   **AI:**
    *   [Genkit AI](https://genkit.dev/): Framework for building AI-powered applications
    *   [Google AI](https://ai.google/): Access to Google's powerful AI models
    *   [Mistral AI](https://mistral.ai/): Cutting-edge AI models for various natural language processing tasks
*   **Backend/Database:**
    *   [Neon](https://neon.tech/): Serverless PostgreSQL
    *   [Drizzle ORM](https://orm.drizzle.team/): Type-safe database access
    *   [Auth.js](https://authjs.dev/) (NextAuth v5): Session-based authentication
*   **Deployment:**
    *   Compatible with Vercel, Firebase App Hosting, or any Node.js host

## Getting Started

**Note: This application is under development and may not be fully functional.**

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (v18 or higher) and npm
    *   A [Neon](https://neon.tech/) project with a pooled connection string
2.  **Installation:**
    ```bash
    git clone <repo-url>
    cd style-ai
    npm install
    cp .env.example .env.local
    # Fill in DATABASE_URL, AUTH_SECRET, AUTH_URL, and AI API keys
    npm run db:migrate
    npm run dev
    ```
    The app runs at `http://localhost:9002`.

