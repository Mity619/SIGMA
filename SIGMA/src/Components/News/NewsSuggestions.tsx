interface NewsSuggestionsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}

export default function NewsSuggestions({ suggestions, onSelect }: NewsSuggestionsProps) {
    if (suggestions.length === 0) {
        return null;
    }

    return (
        <section>
            <ul>
                {suggestions.map((suggestion) => (
                    <li key={suggestion}>
                        <button type="button" onClick={() => onSelect(suggestion)}>
                            {suggestion}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

