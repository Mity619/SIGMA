import type { News } from "../../Utils/News";
import NewsCard from "./NewsCard";

interface NewsCarouselProps {
    newsItems: News[];
    activeNewsId: string | null;
    onSelectNews: (newsItem: News) => void;
    onNext: () => void;
    onPrevious: () => void;
}

export default function NewsCarousel({
    newsItems,
    activeNewsId,
    onSelectNews,
    onNext,
    onPrevious,
}: NewsCarouselProps) {
    const currentNews =
        newsItems.find((newsItem) => newsItem.id === activeNewsId) ?? newsItems[0] ?? null;

    if (!currentNews) {
        return <p>No hay noticias disponibles.</p>;
    }

    return (
        <section>
            <button type="button" onClick={onPrevious}>
                Anterior
            </button>
            <button type="button" onClick={onNext}>
                Siguiente
            </button>
            <NewsCard news={currentNews} onSelect={onSelectNews} isActive />
        </section>
    );
}

