import { Store } from "./Store"
import { QuestionType, CardData } from "./types"

export const getCloudItems = async (collection: string) => {
    try {
        const operation = 'fetch';
        const payload = {};
        const response = await fetch('/api/db', {
            method: 'POST',
            body: JSON.stringify({ payload, operation, collection }),
        }).then((res) => res.json());
        return response;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const insertCloudItem = async (collection: string, payload: any) => {
    try {
        const operation = 'insert';
        const response = await fetch('/api/db', {
            method: 'POST',
            body: JSON.stringify({ payload, operation, collection }),
        }).then((res) => res.json());
        return response;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const deleteCloudItem = async (collection: string, payload: any) => {
    try {
        const operation = 'delete';
        const response = await fetch('/api/db', {
            method: 'POST',
            body: JSON.stringify({ payload, operation, collection }),
        }).then((res) => res.json());
        return response;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const updateCloudItem = async (collection: string, payload: any) => {
    try {
        const operation = 'update';
        const response = await fetch('/api/db', {
            method: 'POST',
            body: JSON.stringify({ payload, operation, collection }),
        }).then((res) => res.json());
        return response;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export const cloudSync = async () => {

    try {
        const questionStore = new Store('questions');
        const cardStore = new Store('cards');

        const allCloudQuestions = await getCloudItems('questions') as QuestionType[];
        const allCloudCards = await getCloudItems('cards') as CardData[];

        questionStore.clear();
        cardStore.clear();

        questionStore.replaceItems(allCloudQuestions);
        cardStore.replaceItems(allCloudCards);

        // window reload
        window.location.reload();

    } catch (error) {
        console.error(error);
    }

}