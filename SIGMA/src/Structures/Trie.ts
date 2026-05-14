export class TrieNode {
    public readonly children: Map<string, TrieNode>;
    public isEnd: boolean;
    public readonly words: Set<string>;

    public constructor() {
        this.children = new Map<string, TrieNode>();
        this.isEnd = false;
        this.words = new Set<string>();
    }
}

const normalizeValue = (value: string): string =>
    value
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/gu, "");

export class Trie {
    private readonly root: TrieNode;

    public constructor() {
        this.root = new TrieNode();
    }

    public insert(word: string): void {
        const normalizedWord = normalizeValue(word);

        if (!normalizedWord) {
            return;
        }

        let currentNode = this.root;

        for (const char of normalizedWord) {
            if (!currentNode.children.has(char)) {
                currentNode.children.set(char, new TrieNode());
            }

            const nextNode = currentNode.children.get(char);

            if (!nextNode) {
                return;
            }

            currentNode = nextNode;
        }

        currentNode.isEnd = true;
        currentNode.words.add(word.trim());
    }

    public searchByPrefix(prefix: string): string[] {
        const normalizedPrefix = normalizeValue(prefix);

        if (!normalizedPrefix) {
            return [];
        }

        let currentNode = this.root;

        for (const char of normalizedPrefix) {
            const nextNode = currentNode.children.get(char);

            if (!nextNode) {
                return [];
            }

            currentNode = nextNode;
        }

        return [...new Set(this.collectWords(currentNode))].sort((leftWord, rightWord) =>
            leftWord.localeCompare(rightWord)
        );
    }

    public collectWords(node: TrieNode): string[] {
        const collectedWords: string[] = [];

        for (const word of node.words) {
            collectedWords.push(word);
        }

        for (const childNode of node.children.values()) {
            collectedWords.push(...this.collectWords(childNode));
        }

        return collectedWords;
    }
}

