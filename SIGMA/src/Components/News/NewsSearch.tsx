interface NewsSearchProps {
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
}

export default function NewsSearch({ value, onChange, onClear }: NewsSearchProps) {
    return (
        <section>
            <input
                type="text"
                value={value}
                placeholder="Buscar noticias..."
                onChange={(event) => onChange(event.target.value)}
            />
            <button type="button" onClick={onClear}>
                Limpiar
            </button>
        </section>
    );
}

