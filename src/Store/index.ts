import { LocalStorageItemStorage } from './LocalStorageItemStorage';
import fsrs, { generateCardData } from "../fsrs"

import { QuestionType, CardData } from "../types";

let storageModule = LocalStorageItemStorage;

export const Store = storageModule;

export function sortCardsForLearning(cardDataArray: CardData[]): CardData[] {
    return cardDataArray.sort((a, b) => {
        const dateA = new Date(a.due!).getTime();
        const dateB = new Date(b.due!).getTime();

        if (dateA !== dateB) {
            return dateA - dateB; // Sort by due date first
        }

        if (a.stability !== b.stability) {
            return b.stability! - a.stability!; // If due dates are equal, sort by stability
        }

        return b.difficulty! - a.difficulty!; // If stability is also equal, sort by difficulty
    });
}

/**
 * This function takes an array of questions and returns an array of cards
 * @param questions
 * @returns sorted training cards
 */
export const setupCards = (questions: QuestionType[]) => {
    const cards = questions.map((question) => {
        const card = generateCardData(question.id) as CardData
        return fsrs(card)
    })
    return sortCardsForLearning(cards)
}