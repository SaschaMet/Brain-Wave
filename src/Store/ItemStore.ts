export class ItemStorage<T> {
    public items: T[];

    constructor() {
        this.items = [];
    }

    replaceItems(newItems: T[]): void {
        this.items = newItems;
    }

    storeMultipleItems(newItems: T[]): void {
        this.items = [...this.items, ...newItems];
    }

    fetchAllItems(): T[] {
        return this.items;
    }

    fetchSingleItem(index: number): T | null {
        if (index >= 0 && index < this.items.length) {
            return this.items[index];
        }
        return null;
    }
}