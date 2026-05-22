'use server';

import { eq, and, desc, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { styleProfiles, books, generatedContent } from '@/lib/db/schema';
import type { AnalyzeWritingStyleOutput } from '@/ai/flows/analyze-writing-style';

export type StyleProfile = AnalyzeWritingStyleOutput;

export interface Book {
  id?: string;
  title: string;
  blurb: string;
  outline: string;
  status: 'ongoing' | 'completed';
  createdAt: Date;
  userId: string;
  coverImage?: string;
}

export interface GeneratedContent {
  id?: string;
  bookId: string;
  prompt: string;
  generatedText: string;
  contentType: string;
  createdAt: Date;
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user.id;
}

export async function saveStyleProfile(profile: StyleProfile): Promise<void> {
  const userId = await requireUserId();
  await db
    .insert(styleProfiles)
    .values({
      userId,
      analysisData: profile.analysisData,
      customPrompt: profile.customPrompt,
    })
    .onConflictDoUpdate({
      target: styleProfiles.userId,
      set: {
        analysisData: profile.analysisData,
        customPrompt: profile.customPrompt,
      },
    });
}

export async function getStyleProfile(): Promise<StyleProfile | null> {
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(styleProfiles)
    .where(eq(styleProfiles.userId, userId))
    .limit(1);

  if (!row) return null;

  return {
    analysisData: row.analysisData as StyleProfile['analysisData'],
    customPrompt: row.customPrompt,
  };
}

export async function addBook(
  book: Omit<Book, 'id' | 'createdAt' | 'userId'>
): Promise<string> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(books)
    .values({
      userId,
      title: book.title,
      blurb: book.blurb,
      outline: book.outline,
      status: book.status,
      coverImage: book.coverImage,
    })
    .returning({ id: books.id });

  return row.id;
}

export async function getBooks(): Promise<Book[]> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(books)
    .where(eq(books.userId, userId))
    .orderBy(desc(books.createdAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    blurb: row.blurb,
    outline: row.outline,
    status: row.status as Book['status'],
    createdAt: row.createdAt,
    userId: row.userId,
    coverImage: row.coverImage ?? undefined,
  }));
}

export async function getBook(bookId: string): Promise<Book | null> {
  const userId = await requireUserId();
  const [row] = await db
    .select()
    .from(books)
    .where(and(eq(books.id, bookId), eq(books.userId, userId)))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    blurb: row.blurb,
    outline: row.outline,
    status: row.status as Book['status'],
    createdAt: row.createdAt,
    userId: row.userId,
    coverImage: row.coverImage ?? undefined,
  };
}

export async function updateBookStatus(
  bookId: string,
  status: 'ongoing' | 'completed'
): Promise<void> {
  const userId = await requireUserId();
  await db
    .update(books)
    .set({ status })
    .where(and(eq(books.id, bookId), eq(books.userId, userId)));
}

export async function saveGeneratedContent(
  content: Omit<GeneratedContent, 'id' | 'createdAt'>
): Promise<string> {
  const userId = await requireUserId();
  const [row] = await db
    .insert(generatedContent)
    .values({
      userId,
      bookId: content.bookId,
      prompt: content.prompt,
      generatedText: content.generatedText,
      contentType: content.contentType,
    })
    .returning({ id: generatedContent.id });

  return row.id;
}

export async function getContentHistory(bookId: string): Promise<GeneratedContent[]> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(generatedContent)
    .where(
      and(eq(generatedContent.userId, userId), eq(generatedContent.bookId, bookId))
    )
    .orderBy(asc(generatedContent.createdAt));

  return rows.map((row) => ({
    id: row.id,
    bookId: row.bookId,
    prompt: row.prompt,
    generatedText: row.generatedText,
    contentType: row.contentType,
    createdAt: row.createdAt,
  }));
}

export async function deleteContent(contentId: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(generatedContent)
    .where(
      and(eq(generatedContent.id, contentId), eq(generatedContent.userId, userId))
    );
}
