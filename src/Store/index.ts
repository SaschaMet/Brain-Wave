import { LocalStorageItemStorage } from './LocalStorage';
import fsrs, { generateCardData } from "../fsrs"

import { QuestionType, CardData } from "../types";

export const Store = LocalStorageItemStorage;

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

export const getUniqueCategories = (items: QuestionType[]) => {
    const categories: string[] = [];
    items.forEach((item: any) => {
        item.categories.forEach((category: string) => {
            if (!categories.includes(category)) {
                categories.push(category);
            }
        });
    });
    return categories;
}

export const searchQuestions = (questions: QuestionType[], searchText: string) => {
    return questions.filter((question) => {
        const search = searchText.toLowerCase();
        const questionText = question.questionText.toLowerCase();
        const answersText = question.correctAnswer.join(" ").toLowerCase();
        const categories = question.categories.join(" ").toLowerCase();
        return questionText.includes(search) || answersText.includes(search) || categories.includes(search);
    });
}