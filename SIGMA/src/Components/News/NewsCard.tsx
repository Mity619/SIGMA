import type { News } from "../../Utils/News";

interface NewsCardProps {
    news: News;
    onSelect?: (newsItem: News) => void;
    isActive?: boolean;
}

export default function NewsCard({ news, onSelect, isActive = false }: NewsCardProps) {
    return (
        <article>
            <h2>{news.title}</h2>
            <p>Categoría: {news.category}</p>
            <p>{news.description}</p>
            {news.imageUrl ? <img src={news.imageUrl} alt={news.title} /> : null}
            <p>Autor: {news.authorName}</p>
            <p>Fecha: {news.createdAt.toDate().toLocaleString()}</p>
            {onSelect ? (
                <button type="button" onClick={() => onSelect(news)}>
                    {isActive ? "Seleccionada" : "Ver noticia"}
                </button>
            ) : null}
        </article>
    );
}

