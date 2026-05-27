import { useEffect, useRef, useState } from "react";
import { useNewsContext } from "../Context/NewsContext";
import Navbar from "../Components/Navbar";
import type { News } from "../Utils/News";
import "./SCSS/news.scss";

interface NewsCardProps {
    news: News;
    onSelect?: (newsItem: News) => void;
    isActive?: boolean;
}

function NewsCard({ news, onSelect, isActive = false }: NewsCardProps) {
    return (
        <article className={`news-page__card${isActive ? " news-page__card--active" : ""}`}>
            {news.imageUrl ? <img src={news.imageUrl} alt={news.title} /> : null}
            <div className="news-page__card-body">
                <span className="news-page__card-category">{news.category}</span>
                <h2>{news.title}</h2>
                <p className="news-page__card-desc">{news.description}</p>
                <span className="news-page__card-meta">
                    {news.authorName} · {news.createdAt.toDate().toLocaleDateString()}
                </span>
                {onSelect ? (
                    <button type="button" onClick={() => onSelect(news)}>
                        {isActive ? "Seleccionada" : "Ver noticia"}
                    </button>
                ) : null}
            </div>
        </article>
    );
}

interface NewsCarouselProps {
    newsItems: News[];
    activeNewsId: string | null;
    onSelectNews: (newsItem: News) => void;
    onNext: () => void;
    onPrevious: () => void;
}

function NewsCarousel({ newsItems, activeNewsId, onSelectNews, onNext, onPrevious }: NewsCarouselProps) {
    const [resetKey, setResetKey] = useState(0);
    const onNextRef = useRef(onNext);
    useEffect(() => { onNextRef.current = onNext; }, [onNext]);

    useEffect(() => {
        if (newsItems.length <= 1) return;
        const id = setInterval(() => { onNextRef.current(); }, 5000);
        return () => clearInterval(id);
    }, [resetKey, newsItems.length]);

    const handlePrev = () => { onPrevious(); setResetKey((k) => k + 1); };
    const handleNext = () => { onNext(); setResetKey((k) => k + 1); };

    const currentIndex = newsItems.findIndex((n) => n.id === activeNewsId);
    const activeIndex = currentIndex >= 0 ? currentIndex : 0;
    const currentNews = newsItems[activeIndex] ?? null;

    if (!currentNews) {
        return <p className="news-page__empty">No hay noticias disponibles.</p>;
    }

    return (
        <div className="news-page__carousel">
            <div className="news-page__carousel-card">
                <div className="news-page__carousel-img-wrap">
                    {currentNews.imageUrl ? (
                        <img src={currentNews.imageUrl} alt={currentNews.title} className="news-page__carousel-img" />
                    ) : (
                        <div className="news-page__carousel-img--placeholder" />
                    )}
                    <button className="news-page__carousel-arrow news-page__carousel-arrow--left" type="button" onClick={handlePrev} aria-label="Anterior">
                        &#8592;
                    </button>
                    <button className="news-page__carousel-arrow news-page__carousel-arrow--right" type="button" onClick={handleNext} aria-label="Siguiente">
                        &#8594;
                    </button>
                </div>

                <div className="news-page__carousel-body">
                    <span className="news-page__carousel-category">{currentNews.category}</span>
                    <h2 className="news-page__carousel-title">{currentNews.title}</h2>
                    <p className="news-page__carousel-desc">{currentNews.description}</p>
                    <span className="news-page__carousel-meta">
                        {currentNews.authorName} · {currentNews.createdAt.toDate().toLocaleDateString()}
                    </span>
                    <button type="button" className="news-page__carousel-cta" onClick={() => onSelectNews(currentNews)}>
                        Ver noticia
                    </button>
                </div>
            </div>

            {newsItems.length > 1 && (
                <div className="news-page__carousel-dots">
                    {newsItems.map((item, i) => (
                        <span
                            key={item.id}
                            className={`news-page__carousel-dot${i === activeIndex ? " news-page__carousel-dot--active" : ""}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface NewsSearchProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
}

function NewsSearch({ value, onChange, onClear }: NewsSearchProps) {
    return (
        <div className="news-page__search">
            <input
                type="text"
                value={value}
                placeholder="Buscar noticias..."
                onChange={(event) => onChange(event.target.value)}
            />
            <button type="button" onClick={onClear}>Limpiar</button>
        </div>
    );
}

interface NewsSuggestionsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}

function NewsSuggestions({ suggestions, onSelect }: NewsSuggestionsProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className="news-page__suggestions">
            <ul>
                {suggestions.map((suggestion) => (
                    <li key={suggestion}>
                        <button type="button" onClick={() => onSelect(suggestion)}>
                            {suggestion}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

interface FilterBadgeProps {
    query: string;
    count: number;
    onClear: () => void;
}

function FilterBadge({ query, count, onClear }: FilterBadgeProps) {
    if (!query.trim()) return null;

    return (
        <div className="news-page__filter-badge">
            <span className="news-page__filter-badge-icon">&#128269;</span>
            <span>
                Filtrando por <strong>«{query}»</strong> — {count} {count === 1 ? "resultado" : "resultados"}
            </span>
            <button type="button" onClick={onClear} aria-label="Quitar filtro">&#10005;</button>
        </div>
    );
}

export default function NewsPage() {
    const {
        carouselNews,
        filteredNews,
        loading,
        error,
        searchQuery,
        suggestions,
        selectedNews,
        setSearchQuery,
        selectNews,
        selectSuggestion,
        nextNews,
        previousNews,
    } = useNewsContext();

    if (loading) {
        return (
            <div className="news-page">
                <Navbar />
                <p className="news-page__state">Cargando noticias...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-page">
                <Navbar />
                <p className="news-page__state">{error}</p>
            </div>
        );
    }

    return (
        <div className="news-page">
            <Navbar />

            <header className="news-page__hero">
                <h1 className="news-page__hero-title">Noticias</h1>
                <p className="news-page__hero-subtitle">
                    Mantente al día con las últimas novedades institucionales
                </p>
                <NewsSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                />
            </header>

            <NewsSuggestions suggestions={suggestions} onSelect={selectSuggestion} />

            <main className="news-page__content">
                <NewsCarousel
                    newsItems={carouselNews}
                    activeNewsId={selectedNews?.id ?? null}
                    onSelectNews={selectNews}
                    onNext={nextNews}
                    onPrevious={previousNews}
                />

                <section>
                    <div className="news-page__section-header">
                        <h2 className="news-page__section-title">Todas las noticias</h2>
                        <FilterBadge
                            query={searchQuery}
                            count={filteredNews.length}
                            onClear={() => setSearchQuery("")}
                        />
                    </div>
                    {filteredNews.length === 0 ? (
                        <p className="news-page__empty">No hay resultados para tu búsqueda.</p>
                    ) : (
                        <div className="news-page__grid">
                            {filteredNews.map((newsItem) => (
                                <NewsCard
                                    key={newsItem.id}
                                    news={newsItem}
                                    onSelect={selectNews}
                                    isActive={selectedNews?.id === newsItem.id}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
