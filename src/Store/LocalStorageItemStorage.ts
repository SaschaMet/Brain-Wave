import { ItemStorage } from './ItemStore';

export class LocalStorageItemStorage<T> extends ItemStorage<T> {
    public storageKey: string;

    constructor(storageKey: string) {
        super();
        this.storageKey = storageKey;
    }

    async setup(): Promise<void> {
        this.loadItemsFromLocalStorage();
    }

    replaceItems(newItems: T[]): void {
        super.replaceItems(newItems);
        this.saveItemsToLocalStorage();
    }

    storeMultipleItems(newItems: T[]): void {
        super.storeMultipleItems(newItems);
        this.saveItemsToLocalStorage();
    }

    loadItemsFromLocalStorage(): void {
        const storedItems = localStorage.getItem(this.storageKey);
        if (storedItems) {
            this.items = JSON.parse(storedItems);
        }
    }

    saveItemsToLocalStorage(): void {
        const itemsJson = JSON.stringify(this.items);
        localStorage.setItem(this.storageKey, itemsJson);
    }

}

