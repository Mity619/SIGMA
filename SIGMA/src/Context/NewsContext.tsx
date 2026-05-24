import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { News, NewsAuthor, NewsCreateInput } from "../Utils/News";
import { Stack } from "../Structures/Stack";
import { Trie } from "../Structures/Trie";
import {
    buildStackFromNews,
    buildTrieFromNews,
    createNewsInFirestore,
    deleteNewsFromFirestore,
    fetchNewsFromFirestore,
    filterNewsByQuery,
    findNewsBySuggestion,
    getAutocompleteSuggestions,
    updateNewsInFirestore,
} from "../Hooks/useNews";

interface NewsContextType {
    news: News[];
    carouselNews: News[];
    selectedNews: News | null;
    searchQuery: string;
    suggestions: string[];
    filteredNews: News[];
    loading: boolean;
    error: string | null;
    reloadNews: () => Promise<void>;
    setSearchQuery: (value: string) => void;
    selectNews: (newsItem: News) => void;
    selectSuggestion: (suggestion: string) => void;
    nextNews: () => void;
    previousNews: () => void;
    createNewsItem: (newsInput: NewsCreateInput, author: NewsAuthor) => Promise<void>;
    deleteNewsItem: (newsId: string) => Promise<void>;
    updateNewsItem: (newsId: string, updates: NewsCreateInput) => Promise<void>;
}

interface NewsContextProviderProps {
    children: ReactNode;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const isSameNews = (leftNews: News, rightNews: News): boolean => leftNews.id === rightNews.id;

export const NewsContextProvider = ({ children }: NewsContextProviderProps) => {
    const [news, setNews] = useState<News[]>([]);
    const [stack, setStack] = useState<Stack<News>>(new Stack<News>());
    const [trie, setTrie] = useState<Trie>(new Trie());
    const [selectedNews, setSelectedNews] = useState<News | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const rebuildIndexes = useCallback((newsItems: News[]): void => {
        setStack(buildStackFromNews(newsItems));
        setTrie(buildTrieFromNews(newsItems));
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void (async () => {
                setLoading(true);
                setError(null);

                try {
                    const newsItems = await fetchNewsFromFirestore();
                    setNews(newsItems);
                    rebuildIndexes(newsItems);
                    setSelectedNews((currentNews) => {
                        if (!currentNews) {
                            return newsItems[0] ?? null;
                        }

                        const existingNews = newsItems.find((item) => isSameNews(item, currentNews));
                        return existingNews ?? newsItems[0] ?? null;
                    });
                } catch (fetchError: unknown) {
                    const message =
                        fetchError instanceof Error ? fetchError.message : "Error loading news";
                    setError(message);
                } finally {
                    setLoading(false);
                }
            })();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [rebuildIndexes]);

    const reloadNews = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const newsItems = await fetchNewsFromFirestore();
            setNews(newsItems);
            rebuildIndexes(newsItems);
            setSelectedNews((currentNews) => {
                if (!currentNews) {
                    return newsItems[0] ?? null;
                }

                const existingNews = newsItems.find((item) => isSameNews(item, currentNews));
                return existingNews ?? newsItems[0] ?? null;
            });
        } catch (fetchError: unknown) {
            const message =
                fetchError instanceof Error ? fetchError.message : "Error loading news";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [rebuildIndexes]);

    const carouselNews = stack.toArray();
    const filteredNews = filterNewsByQuery(news, searchQuery, trie);
    const suggestions =
        searchQuery.trim().length > 0
            ? getAutocompleteSuggestions(trie, searchQuery)
            : [];

    const selectNews = (newsItem: News): void => {
        setSelectedNews(newsItem);
        setSearchQuery(newsItem.title);
    };

    const selectSuggestion = (suggestion: string): void => {
        setSearchQuery(suggestion);
        const matchedNews = findNewsBySuggestion(news, suggestion);
        if (matchedNews) {
            setSelectedNews(matchedNews);
        }
    };

    const moveSelection = (direction: 1 | -1): void => {
        if (carouselNews.length === 0) {
            return;
        }

        const currentIndex = selectedNews
            ? carouselNews.findIndex((newsItem) => isSameNews(newsItem, selectedNews))
            : 0;
        const normalizedIndex = currentIndex >= 0 ? currentIndex : 0;
        const nextIndex =
            (normalizedIndex + direction + carouselNews.length) % carouselNews.length;
        setSelectedNews(carouselNews[nextIndex]);
    };

    const nextNews = (): void => {
        moveSelection(1);
    };

    const previousNews = (): void => {
        moveSelection(-1);
    };

    const createNewsItem = async (
        newsInput: NewsCreateInput,
        author: NewsAuthor
    ): Promise<void> => {
        const createdNews = await createNewsInFirestore(newsInput, author);
        setSelectedNews(createdNews);
        setSearchQuery("");
        setNews((currentNews) => {
            const updatedNews = [createdNews, ...currentNews];
            rebuildIndexes(updatedNews);
            return updatedNews;
        });
    };

    const deleteNewsItem = async (newsId: string): Promise<void> => {
        await deleteNewsFromFirestore(newsId);
        setSelectedNews((current) => (current?.id === newsId ? null : current));
        setNews((currentNews) => {
            const updatedNews = currentNews.filter((item) => item.id !== newsId);
            rebuildIndexes(updatedNews);
            return updatedNews;
        });
    };

    const updateNewsItem = async (newsId: string, updates: NewsCreateInput): Promise<void> => {
        await updateNewsInFirestore(newsId, updates);
        setNews((currentNews) => {
            const updatedNews = currentNews.map((item) =>
                item.id === newsId
                    ? { ...item, title: updates.title.trim(), category: updates.category.trim(), description: updates.description.trim(), imageUrl: updates.imageUrl.trim() }
                    : item
            );
            rebuildIndexes(updatedNews);
            return updatedNews;
        });
    };

    const value: NewsContextType = {
        news,
        carouselNews,
        selectedNews,
        searchQuery,
        suggestions,
        filteredNews,
        loading,
        error,
        reloadNews,
        setSearchQuery,
        selectNews,
        selectSuggestion,
        nextNews,
        previousNews,
        createNewsItem,
        deleteNewsItem,
        updateNewsItem,
    };

    return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNewsContext = () => {
    const context = useContext(NewsContext);

    if (!context) {
        throw new Error("useNewsContext debe usarse dentro de NewsContextProvider");
    }

    return context;
};

export default NewsContext;
