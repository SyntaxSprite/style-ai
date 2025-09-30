'use server';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, addDoc, query, getDocs, orderBy, where, updateDoc, deleteDoc } from 'firebase/firestore';
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
    coverImage?: string; // Add coverImage field
}

export interface GeneratedContent {
    id?: string;
    bookId: string;
    prompt: string;
    generatedText: string;
    contentType: string;
    createdAt: Date;
}

// Style Profile Functions
export async function saveStyleProfile(userId: string, profile: StyleProfile): Promise<void> {
    const profileRef = doc(db, 'users', userId, 'styleProfile', 'default');
    await setDoc(profileRef, profile);
}

export async function getStyleProfile(userId: string): Promise<StyleProfile | null> {
    const profileRef = doc(db, 'users', userId, 'styleProfile', 'default');
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
        return profileSnap.data() as StyleProfile;
    } else {
        return null;
    }
}

// Book Functions
export async function addBook(book: Omit<Book, 'id' | 'createdAt'>): Promise<string> {
    const booksCollectionRef = collection(db, 'users', book.userId, 'books');
    const docRef = await addDoc(booksCollectionRef, {
        ...book,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function getBooks(userId: string): Promise<Book[]> {
    const booksCollectionRef = collection(db, 'users', userId, 'books');
    const q = query(booksCollectionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
    })) as Book[];
}

export async function getBook(userId: string, bookId: string): Promise<Book | null> {
    const bookRef = doc(db, 'users', userId, 'books', bookId);
    const bookSnap = await getDoc(bookRef);

    if (bookSnap.exists()) {
        const data = bookSnap.data();
        return {
            id: bookSnap.id,
            ...data,
            createdAt: new Date(data.createdAt),
        } as Book;
    } else {
        return null;
    }
}

export async function updateBookStatus(userId: string, bookId: string, status: 'ongoing' | 'completed'): Promise<void> {
    const bookRef = doc(db, 'users', userId, 'books', bookId);
    await updateDoc(bookRef, { status });
}


// Content Functions
export async function saveGeneratedContent(userId: string, content: Omit<GeneratedContent, 'id' | 'createdAt'>): Promise<string> {
    const contentCollectionRef = collection(db, 'users', userId, 'contentHistory');
    const docRef = await addDoc(contentCollectionRef, {
        ...content,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function getContentHistory(userId: string, bookId: string): Promise<GeneratedContent[]> {
    const contentCollectionRef = collection(db, 'users', userId, 'contentHistory');
    const q = query(
        contentCollectionRef, 
        where('bookId', '==', bookId),
        orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: new Date(doc.data().createdAt)
    })) as GeneratedContent[];
}


export async function deleteContent(userId: string, contentId: string): Promise<void> {
    const contentRef = doc(db, 'users', userId, 'contentHistory', contentId);
    await deleteDoc(contentRef);
}
