export class ItemStorage<T> {
    public items: T[];

    constructor() {
        this.items = [];
    }

    storeMultipleItems(newItems: T[]): void {
        this.items.push(...newItems);
    }

    storeSingleItem(newItem: T): void {
        this.items.push(newItem);
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