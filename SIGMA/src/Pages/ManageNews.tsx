import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar";
import { useNewsContext } from "../Context/NewsContext";
import type { News, NewsCreateInput } from "../Utils/News";
import "./SCSS/manage-news.scss";

const MAX_DESC = 200;

interface EditFormProps {
    news: News;
    onSave: (updates: NewsCreateInput) => Promise<void>;
    onCancel: () => void;
}

function EditForm({ news, onSave, onCancel }: EditFormProps) {
    const [draft, setDraft] = useState<NewsCreateInput>({
        title: news.title,
        category: news.category,
        description: news.description,
        imageUrl: news.imageUrl,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = (field: keyof NewsCreateInput, value: string) =>
        setDraft((prev) => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        if (!draft.title.trim() || !draft.category.trim() || !draft.description.trim()) {
            setError("Título, categoría y descripción son obligatorios.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await onSave(draft);
        } catch {
            setError("Error al guardar. Intenta de nuevo.");
            setSaving(false);
        }
    };

    const descLen = draft.description.length;
    const counterClass =
        descLen >= MAX_DESC ? "manage-news__edit-counter--limit" :
        descLen >= 150      ? "manage-news__edit-counter--warn"  : "";

    return (
        <div className="manage-news__edit-form">
            {error && <p className="manage-news__error">{error}</p>}

            <div className="manage-news__edit-row">
                <div className="manage-news__edit-field">
                    <label className="manage-news__edit-label">Título</label>
                    <input
                        className="manage-news__edit-input"
                        value={draft.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="Título"
                    />
                </div>
                <div className="manage-news__edit-field">
                    <label className="manage-news__edit-label">Categoría</label>
                    <input
                        className="manage-news__edit-input"
                        value={draft.category}
                        onChange={(e) => update("category", e.target.value)}
                        placeholder="Categoría"
                    />
                </div>
            </div>

            <div className="manage-news__edit-field">
                <label className="manage-news__edit-label">Descripción</label>
                <textarea
                    className="manage-news__edit-textarea"
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    maxLength={MAX_DESC}
                    placeholder="Descripción"
                />
                <div className="manage-news__edit-footer">
                    <span className={`manage-news__edit-counter ${counterClass}`}>
                        {descLen}/{MAX_DESC}
                    </span>
                </div>
            </div>

            <div className="manage-news__edit-field">
                <label className="manage-news__edit-label">URL de imagen (opcional)</label>
                <input
                    className="manage-news__edit-input"
                    value={draft.imageUrl}
                    onChange={(e) => update("imageUrl", e.target.value)}
                    placeholder="https://..."
                />
            </div>

            <div className="manage-news__edit-actions">
                <button className="manage-news__btn manage-news__btn--save" onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : "Guardar cambios"}
                </button>
                <button className="manage-news__btn manage-news__btn--cancel" onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

interface NewsItemRowProps {
    news: News;
    onEdit: () => void;
    onDelete: () => void;
}

function NewsItemRow({ news, onEdit, onDelete }: NewsItemRowProps) {
    return (
        <div className="manage-news__item-row">
            {news.imageUrl
                ? <img className="manage-news__item-img" src={news.imageUrl} alt={news.title} />
                : <div className="manage-news__item-img--placeholder" />
            }
            <div className="manage-news__item-info">
                <span className="manage-news__item-category">{news.category}</span>
                <p className="manage-news__item-title">{news.title}</p>
                <span className="manage-news__item-meta">
                    {news.authorName} · {news.createdAt.toDate().toLocaleDateString()}
                </span>
            </div>
            <div className="manage-news__item-actions">
                <button className="manage-news__btn manage-news__btn--edit" onClick={onEdit}>
                    Editar
                </button>
                <button className="manage-news__btn manage-news__btn--delete" onClick={onDelete}>
                    Borrar
                </button>
            </div>
        </div>
    );
}

export default function ManageNews() {
    const navigate = useNavigate();
    const { news, loading, error, deleteNewsItem, updateNewsItem } = useNewsContext();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (newsId: string) => {
        setDeleting(true);
        try {
            await deleteNewsItem(newsId);
            setConfirmDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    const handleSave = async (newsId: string, updates: NewsCreateInput) => {
        await updateNewsItem(newsId, updates);
        setEditingId(null);
    };

    return (
        <div className="manage-news">
            <AdminNavbar />
            <div className="manage-news__body">
                <div className="manage-news__header">
                    <div>
                        <button className="manage-news__back" onClick={() => navigate("/DashboardAdmin")}>
                            ← Volver al panel
                        </button>
                        <h1 className="manage-news__title">Gestión de noticias</h1>
                    </div>
                    <button className="manage-news__create-btn" onClick={() => navigate("/Dashboard/Noticias/crear")}>
                        + Nueva noticia
                    </button>
                </div>

                {loading && <p className="manage-news__state">Cargando noticias...</p>}
                {error   && <p className="manage-news__state">{error}</p>}

                {!loading && !error && (
                    <div className="manage-news__list">
                        {news.length === 0 && (
                            <p className="manage-news__state">No hay noticias publicadas.</p>
                        )}
                        {news.map((item) => (
                            <div className="manage-news__item" key={item.id}>
                                <NewsItemRow
                                    news={item}
                                    onEdit={() => {
                                        setConfirmDeleteId(null);
                                        setEditingId(editingId === item.id ? null : item.id);
                                    }}
                                    onDelete={() => {
                                        setEditingId(null);
                                        setConfirmDeleteId(confirmDeleteId === item.id ? null : item.id);
                                    }}
                                />

                                {confirmDeleteId === item.id && (
                                    <div className="manage-news__confirm">
                                        <span>¿Eliminar «{item.title}»? Esta acción no se puede deshacer.</span>
                                        <div className="manage-news__confirm-actions">
                                            <button
                                                className="manage-news__btn manage-news__btn--delete"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deleting}
                                            >
                                                {deleting ? "Eliminando..." : "Sí, eliminar"}
                                            </button>
                                            <button
                                                className="manage-news__btn manage-news__btn--cancel"
                                                onClick={() => setConfirmDeleteId(null)}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {editingId === item.id && (
                                    <EditForm
                                        news={item}
                                        onSave={(updates) => handleSave(item.id, updates)}
                                        onCancel={() => setEditingId(null)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
