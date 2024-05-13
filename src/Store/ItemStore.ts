export class ItemStorage<T> {
    public items: T[];

    constructor() {
        this.items = [];
    }

    replaceItems(newItems: T[]): void {
        this.items = newItems;
    }

    fetchAllItems(): T[] {
        return this.items;
    }

    addItem(item: T): void {
        this.items.push(item);
    }

    deleteItem(index: number): void {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
        }
    }

    updateItem(index: number, item: T): void {
        if (index >= 0 && index < this.items.length) {
            this.items[index] = item;
        }
    }

    clear(): void {
        this.items = [];
    }
}