import { ItemStorage } from './ItemStore';

import { insertCloudItem, deleteCloudItem, updateCloudItem } from '../cloudSync';

const isPro = process.env.NEXT_PUBLIC_ISPRO && process.env.NEXT_PUBLIC_ISPRO.toString() === "1"

export class LocalStorageItemStorage<T> extends ItemStorage<T> {
    public storageKey: string;

    constructor(storageKey: string) {
        super();
        this.storageKey = storageKey;
    }

    setup(): void {
        this.loadItemsFromLocalStorage();
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

    // Inherited from ItemStorage
    replaceItems(newItems: T[]): void {
        super.replaceItems(newItems);
        this.saveItemsToLocalStorage();
    }

    fetchAllItems(): T[] {
        this.loadItemsFromLocalStorage();
        return this.items;
    }

    addItem(item: T): void {
        super.addItem(item);
        this.saveItemsToLocalStorage();
        if (isPro) {
            insertCloudItem(this.storageKey, item);
        }
    }

    deleteItem(index: number): void {
        this.loadItemsFromLocalStorage();
        if (isPro) {
            const item = this.items[index];
            deleteCloudItem(this.storageKey, item);
        }
        super.deleteItem(index);
        this.saveItemsToLocalStorage();
    }

    updateItem(index: number, item: T): void {
        this.loadItemsFromLocalStorage();
        if (isPro) {
            updateCloudItem(this.storageKey, item)
        }
        super.updateItem(index, item);
        this.saveItemsToLocalStorage();
    }

    clear(): void {
        localStorage.removeItem(this.storageKey);
        super.clear();
    }

}

