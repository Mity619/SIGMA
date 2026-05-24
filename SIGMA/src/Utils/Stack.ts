export class Stack<T> {
    private readonly items: T[];

    public constructor(initialItems: T[] = []) {
        this.items = [...initialItems];
    }

    public push(item: T): void {
        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public peek(): T | undefined {
        return this.items.at(-1);
    }

    public size(): number {
        return this.items.length;
    }

    public isEmpty(): boolean {
        return this.items.length === 0;
    }

    public toArray(): T[] {
        return [...this.items].reverse();
    }
}
