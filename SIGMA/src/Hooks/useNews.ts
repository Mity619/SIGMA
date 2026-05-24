import { collection, deleteDoc, doc, getDocs, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "../Firebase/config";
import type { News, NewsAuthor, NewsCreateInput } from "../Utils/News";
import { Stack } from "../utils/Stack";
import { Trie } from "../utils/Trie";

const normalizeValue = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "");

export const sortNewsByNewestFirst = (newsItems: News[]): News[] =>
    [...newsItems].sort(
        (leftNews, rightNews) =>
            rightNews.createdAt.toMillis() - leftNews.createdAt.toMillis()
    );

export const toNewsItem = (documentId: string, data: Record<string, unknown>): News | null => {
    const title = data.title;
    const category = data.category;
    const description = data.description;
    const imageUrl = data.imageUrl;
    const createdAt = data.createdAt;
    const authorId = data.authorId;
    const authorName = data.authorName;
    const id = data.id;

    if (
        typeof title !== "string" ||
        typeof category !== "string" ||
        typeof description !== "string" ||
        typeof imageUrl !== "string" ||
        typeof authorId !== "string" ||
        typeof authorName !== "string"
    ) {
        return null;
    }

    if (!(createdAt instanceof Timestamp)) {
        return null;
    }

    return {
        id: typeof id === "string" && id.trim().length > 0 ? id : documentId,
        title,
        category,
        description,
        imageUrl,
        createdAt,
        authorId,
        authorName,
    };
};

export const buildStackFromNews = (newsItems: News[]): Stack<News> => {
    const stack = new Stack<News>();
    const oldestToNewest = [...sortNewsByNewestFirst(newsItems)].reverse();

    for (const newsItem of oldestToNewest) {
        stack.push(newsItem);
    }

    return stack;
};

export const buildTrieFromNews = (newsItems: News[]): Trie => {
    const trie = new Trie();

    for (const newsItem of newsItems) {
        trie.insert(newsItem.title);
        trie.insert(newsItem.category);
    }

    return trie;
};

export const filterNewsByQuery = (newsItems: News[], query: string, trie: Trie): News[] => {
    const normalizedQuery = normalizeValue(query);

    if (!normalizedQuery) {
        return newsItems;
    }

    const suggestions = new Set<string>(
        trie.searchByPrefix(query).map((suggestion) => normalizeValue(suggestion))
    );

    return newsItems.filter((newsItem) => {
        const normalizedTitle = normalizeValue(newsItem.title);
        const normalizedCategory = normalizeValue(newsItem.category);

        return (
            normalizedTitle.startsWith(normalizedQuery) ||
            normalizedCategory.startsWith(normalizedQuery) ||
            suggestions.has(normalizedTitle) ||
            suggestions.has(normalizedCategory)
        );
    });
};

export const findNewsBySuggestion = (newsItems: News[], suggestion: string): News | null => {
    const normalizedSuggestion = normalizeValue(suggestion);

    if (!normalizedSuggestion) {
        return null;
    }

    const matchedNews = newsItems.find((newsItem) => {
        const normalizedTitle = normalizeValue(newsItem.title);
        const normalizedCategory = normalizeValue(newsItem.category);

        return (
            normalizedTitle === normalizedSuggestion ||
            normalizedCategory === normalizedSuggestion
        );
    });

    return matchedNews ?? null;
};

export const fetchNewsFromFirestore = async (): Promise<News[]> => {
        const snapshot = await getDocs(collection(db, "news"));
        const newsItems = snapshot.docs
            .map((documentSnapshot) => {
                const data = documentSnapshot.data() as Record<string, unknown>;
                return toNewsItem(documentSnapshot.id, data);
            })
            .filter((newsItem): newsItem is News => newsItem !== null);

        return sortNewsByNewestFirst(newsItems);
};

export const createNewsInFirestore = async (
    newsInput: NewsCreateInput,
    author: NewsAuthor
): Promise<News> => {
    const newsRef = doc(collection(db, "news"));
    const newsItem: News = {
        id: newsRef.id,
        title: newsInput.title.trim(),
        category: newsInput.category.trim(),
        description: newsInput.description.trim(),
        imageUrl: newsInput.imageUrl.trim(),
        createdAt: Timestamp.now(),
        authorId: author.authorId,
        authorName: author.authorName.trim(),
    };

    await setDoc(newsRef, newsItem);
    return newsItem;
};

export const deleteNewsFromFirestore = async (newsId: string): Promise<void> => {
    await deleteDoc(doc(db, "news", newsId));
};

export const updateNewsInFirestore = async (
    newsId: string,
    updates: NewsCreateInput
): Promise<void> => {
    await updateDoc(doc(db, "news", newsId), {
        title: updates.title.trim(),
        category: updates.category.trim(),
        description: updates.description.trim(),
        imageUrl: updates.imageUrl.trim(),
    });
};

export const getAutocompleteSuggestions = (trie: Trie, query: string): string[] =>
    trie.searchByPrefix(query);

export const useNews = () => ({
    buildStackFromNews,
    buildTrieFromNews,
    createNews: createNewsInFirestore,
    fetchNews: fetchNewsFromFirestore,
    filterNewsByQuery,
    findNewsBySuggestion,
    getAutocompleteSuggestions,
});
