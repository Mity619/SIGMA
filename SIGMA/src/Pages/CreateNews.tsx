import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import { useNewsContext } from "../Context/NewsContext";
import CreateNewsForm from "../Components/News/CreateNewsForm";
import type { NewsCreateInput } from "../Utils/News";

export default function CreateNews() {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const newsContext = useNewsContext();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!authContext) {
        throw new Error("CreateNews debe usarse dentro de AuthContextProvider");
    }

    const { user } = authContext;

    const handleSubmit = async (newsInput: NewsCreateInput): Promise<boolean> => {
        if (!user) {
            setError("Debes iniciar sesión para crear noticias.");
            return false;
        }

        if (user.type !== "Admin" && user.type !== "Profesor") {
            navigate("/unauthorized");
            return false;
        }

        if (
            !newsInput.title.trim() ||
            !newsInput.category.trim() ||
            !newsInput.description.trim()
        ) {
            setError("Título, categoría y descripción son obligatorios.");
            return false;
        }

        setSubmitting(true);
        setError(null);

        try {
            await newsContext.createNewsItem(newsInput, {
                authorId: user.id,
                authorName: user.name,
            });
            navigate("/Dashboard");
            return true;
        } catch (createError: unknown) {
            const message =
                createError instanceof Error ? createError.message : "Error al crear la noticia.";
            setError(message);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main>
            <h1>Crear noticia</h1>
            {error ? <p>{error}</p> : null}
            <CreateNewsForm onSubmit={handleSubmit} submitting={submitting} />
        </main>
    );
}
