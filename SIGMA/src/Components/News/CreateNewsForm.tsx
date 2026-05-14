import { useState } from "react";
import type { FormEvent } from "react";
import type { NewsCreateInput } from "../../Utils/News";

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

export default function CreateNewsForm({ onSubmit, submitting }: CreateNewsFormProps) {
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
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Título"
                value={formData.title}
                onChange={(event) => updateField("title", event.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Categoría"
                value={formData.category}
                onChange={(event) => updateField("category", event.target.value)}
                required
            />
            <textarea
                placeholder="Descripción"
                value={formData.description}
                onChange={(event) => updateField("description", event.target.value)}
                required
            />
            <input
                type="text"
                placeholder="URL de imagen"
                value={formData.imageUrl}
                onChange={(event) => updateField("imageUrl", event.target.value)}
            />
            <button type="submit" disabled={submitting}>
                Guardar noticia
            </button>
        </form>
    );
}
