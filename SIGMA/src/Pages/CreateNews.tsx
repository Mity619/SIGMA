import { useContext, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Context/AuthContext";
import { useNewsContext } from "../Context/NewsContext";
import AdminNavbar from "../Components/AdminNavbar";
import type { NewsCreateInput } from "../Utils/News";
import "./SCSS/create-news.scss";

interface CreateNewsFormProps {
    onSubmit: (newsInput: NewsCreateInput) => Promise<boolean>;
    submitting: boolean;
}

const initialFormState: NewsCreateInput = {
    title: "",
    category: "",
    description: "",
    imageUrl: "",
};

function CreateNewsForm({ onSubmit, submitting }: CreateNewsFormProps) {
    const [formData, setFormData] = useState<NewsCreateInput>(initialFormState);

    const updateField = <FieldName extends keyof NewsCreateInput>(
        fieldName: FieldName,
        value: NewsCreateInput[FieldName]
    ): void => {
        setFormData((currentFormData) => ({
            ...currentFormData,
            [fieldName]: value,
        }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        const wasCreated = await onSubmit(formData);
        if (wasCreated) {
            setFormData(initialFormState);
        }
    };

    return (
        <form className="create-news__form" onSubmit={handleSubmit}>
            <div className="create-news__field">
                <label className="create-news__label">Título</label>
                <input
                    className="create-news__input"
                    type="text"
                    placeholder="Ej: Apertura de inscripciones 2025"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    required
                />
            </div>

            <div className="create-news__field">
                <label className="create-news__label">Categoría</label>
                <input
                    className="create-news__input"
                    type="text"
                    placeholder="Ej: Académico, Eventos..."
                    value={formData.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    required
                />
            </div>

            <div className="create-news__field">
                <label className="create-news__label">Descripción</label>
                <textarea
                    className="create-news__textarea"
                    placeholder="Escribe el contenido de la noticia..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    maxLength={200}
                    required
                />
                <div className="create-news__field-footer">
                    <span className={
                        `create-news__counter${
                            formData.description.length >= 200 ? " create-news__counter--limit" :
                            formData.description.length >= 150 ? " create-news__counter--warn" : ""
                        }`
                    }>
                        {formData.description.length}/200
                    </span>
                </div>
            </div>

            <div className="create-news__field">
                <label className="create-news__label">
                    URL de imagen
                    <span className="create-news__label--optional">(opcional)</span>
                </label>
                <input
                    className="create-news__input"
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => updateField("imageUrl", e.target.value)}
                />
            </div>

            <button className="create-news__submit" type="submit" disabled={submitting}>
                {submitting ? "Guardando..." : "Publicar noticia"}
            </button>
        </form>
    );
}

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
            navigate("/Dashboard/Noticias");
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
        <div className="create-news">
            <AdminNavbar />
            <div className="create-news__body">
                <div className="create-news__card">
                    <div className="create-news__header">
                        <button className="create-news__back" type="button" onClick={() => navigate("/Dashboard/Noticias")}>
                            ← Volver 
                        </button>
                        <h1 className="create-news__title">Nueva noticia</h1>
                        <p className="create-news__subtitle">Completa los campos para publicar una noticia.</p>
                    </div>

                    {error ? (
                        <div className="create-news__error">
                            <span>&#9888;</span> {error}
                        </div>
                    ) : null}

                    <CreateNewsForm onSubmit={handleSubmit} submitting={submitting} />
                </div>
            </div>
        </div>
    );
}
