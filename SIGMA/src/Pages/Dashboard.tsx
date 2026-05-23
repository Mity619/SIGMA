import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import NewsCard from "../Components/News/NewsCard";
import NewsCarousel from "../Components/News/NewsCarousel";
import NewsSearch from "../Components/News/NewsSearch";
import NewsSuggestions from "../Components/News/NewsSuggestions";
import AuthContext from "../Context/AuthContext";
import { useNewsContext } from "../Context/NewsContext";

export default function Dashboard() {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const user = authContext?.user ?? null;
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
        return <p>Cargando noticias...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <main>
            <h1>Dashboard</h1>
            <button className="btn btn-danger btn-sm" onClick={authContext.logout}>
                Cerrar sesión
            </button>
            <NewsSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery("")}
            />
            <NewsSuggestions suggestions={suggestions} onSelect={selectSuggestion} />
            <NewsCarousel
                newsItems={carouselNews}
                activeNewsId={selectedNews?.id ?? null}
                onSelectNews={selectNews}
                onNext={nextNews}
                onPrevious={previousNews}
            />
            <section>
                <h2>Noticias filtradas</h2>
                {filteredNews.length === 0 ? (
                    <p>No hay resultados.</p>
                ) : (
                    filteredNews.map((newsItem) => (
                        <NewsCard
                            key={newsItem.id}
                            news={newsItem}
                            onSelect={selectNews}
                            isActive={selectedNews?.id === newsItem.id}
                        />
                    ))
                )}
            </section>
        </main>
    );
}
