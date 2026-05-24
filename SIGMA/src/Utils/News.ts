import type { Timestamp } from "firebase/firestore";

export interface News {
    id: string;
    title: string;
    category: string;
    description: string;
    imageUrl: string;
    createdAt: Timestamp;
    authorId: string;
    authorName: string;
}

export interface NewsCreateInput {
    title: string;
    category: string;
    description: string;
    imageUrl: string;
}

export interface NewsAuthor {
    authorId: string;
    authorName: string;
}

