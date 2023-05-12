/**
 This function is based on the DSR algorithm proposed by Piotr Wozniak.
 The DSR model is a theoretical model for the learning process in which:
    Difficulty (D) refers to how hard the information is to learn or understand.
    Stability (S) refers to how well the information sticks in the mind after it's been learned.
    Retrievability (R) refers to how easy it is to recall the information once it's been learned.
 */

export interface CardData {
    id: number;
    due: string;
    interval: number;
    difficulty: number;
    stability: number;
    retrievability: number;
    grade: number;
    review: string;
    reps: number;
    lapses: number;
    history: any[];
}

interface Options {
    difficultyDecay: number;
    stabilityDecay: number;
    increaseFactor: number;
    requestRetention: number;
    totalCase: number;
    totalDiff: number;
    totalReview: number;
    defaultDifficulty: number;
    defaultStability: number;
    stabilityDataArray: Array<{ interval: number; retrievability: number }>;
}

const MILLISECONDS_IN_DAY = 86400000;
const DEFAULT_RETENTION = 0.9;
const HISTORY_LENGTH = 10;

const options: Options = {
    difficultyDecay: -0.7,
    stabilityDecay: -0.2,
    increaseFactor: 60,
    requestRetention: DEFAULT_RETENTION,
    totalCase: 0,
    totalDiff: 0,
    totalReview: 0,
    defaultDifficulty: 5,
    defaultStability: 2,
    stabilityDataArray: [],
}

export function calculateGrade(cardData: CardData): number {
    if (!cardData.history || cardData.history.length === 0) {
        return -1;
    }

    let totalGrades = 0;
    let gradesCounted = 0;

    // Start from the end of the history array and work backwards
    for (let i = cardData.history.length - 1; i >= 0 && gradesCounted < HISTORY_LENGTH; i--) {
        if (cardData.history[i].grade !== undefined) {
            totalGrades += cardData.history[i].grade;
            gradesCounted++;
        }
    }

    if (gradesCounted === 0) {
        return -1;
    }

    const averageGrade = totalGrades / gradesCounted;

    // If the average grade is bigger than 0.8, return 2
    if (averageGrade > 0.8) {
        return 2;
    }

    // If the average grade is smaller than 0.2, return 0
    if (averageGrade > 0.2) {
        return 1;
    }

    return 0;
}

const fsrs = (
    cardData: CardData
): CardData => {

    if (!cardData) {
        throw new Error("Card data is not provided.");
    }

    // Assign default values if some fields are not provided
    if (!cardData.difficulty) cardData.difficulty = options.defaultDifficulty;
    if (!cardData.stability) cardData.stability = options.defaultStability;
    if (!cardData.retrievability) cardData.retrievability = 1;
    if (!cardData.grade) cardData.grade = -1;
    if (!cardData.reps) cardData.reps = 1;
    if (!cardData.lapses) cardData.lapses = 0;
    if (!cardData.history) cardData.history = [];

    if (cardData.grade === -1) {
        // Initial calculation
        const addDay = Math.round(options.defaultStability * Math.log(options.requestRetention) / Math.log(DEFAULT_RETENTION));
        cardData.due = new Date(addDay * MILLISECONDS_IN_DAY + new Date().getTime()).toISOString();
        cardData.interval = 0;
        cardData.review = new Date().toISOString();
    } else {
        // Update existing card
        const lastDifficulty = cardData.difficulty;
        const lastStability = cardData.stability;
        const lastLapses = cardData.lapses;
        const lastReps = cardData.reps;
        const lastReview = cardData.review;

        // if there are more grades than we need, remove the first one
        if (cardData.history.length > HISTORY_LENGTH - 1) {
            cardData.history.shift();
        }

        cardData.history.push({
            due: cardData.due,
            interval: cardData.interval,
            difficulty: cardData.difficulty,
            stability: cardData.stability,
            retrievability: cardData.retrievability,
            grade: cardData.grade,
            lapses: cardData.lapses,
            reps: cardData.reps,
            review: cardData.review,
        });

        const diffDay = (new Date().getTime() - new Date(lastReview).getTime()) / MILLISECONDS_IN_DAY;

        // Calculate grade
        const grade = calculateGrade(cardData);

        cardData.interval = diffDay > 0 ? Math.ceil(diffDay) : 0;
        cardData.review = new Date().toISOString();
        cardData.retrievability = Math.exp(Math.log(DEFAULT_RETENTION) * cardData.interval / lastStability);
        cardData.difficulty = Math.min(Math.max(lastDifficulty + cardData.retrievability - grade + 0.2, 1), 10);

        if (grade === 0) {
            cardData.stability = options.defaultStability * Math.exp(-0.3 * (lastLapses + 1));

            if (lastReps > 1) {
                options.totalDiff -= cardData.retrievability;
            }

            cardData.lapses++;
            cardData.reps = 1;
        } else {
            cardData.stability =
                lastStability *
                (1 +
                    options.increaseFactor *
                    Math.pow(cardData.difficulty, options.difficultyDecay) * Math.pow(lastStability, options.stabilityDecay) * (Math.exp(1 - cardData.retrievability) - 1)
                );

            if (lastReps > 1) {
                options.totalDiff += 1 - cardData.retrievability;
            }

            cardData.lapses = lastLapses;
            cardData.reps++;
        }

        options.totalCase++;
        options.totalReview++;

        let addDay;
        if (options.requestRetention === DEFAULT_RETENTION) {
            // If requestRetention and DEFAULT_RETENTION are the same, handle this case separately
            addDay = Math.round(cardData.stability);
        } else {
            addDay = Math.round(cardData.stability * Math.log(options.requestRetention) / Math.log(DEFAULT_RETENTION));
        }
        cardData.due = new Date(addDay * MILLISECONDS_IN_DAY + new Date().getTime()).toISOString();

        // Adaptive options.defaultDifficulty
        if (options.totalCase > 100) {
            options.defaultDifficulty =
                (1 / Math.pow(options.totalReview, 0.3)) *
                (Math.pow(Math.log(options.requestRetention) / Math.max(Math.log(options.requestRetention + options.totalDiff / options.totalCase), 0), 1 / options.difficultyDecay) *
                    5 +
                    (1 - 1 / Math.pow(options.totalReview, 0.3))) *
                options.defaultDifficulty;

            options.totalDiff = 0;
            options.totalCase = 0;
        }

        // Adaptive options.defaultStability
        if (lastReps === 1 && lastLapses === 0) {
            options.stabilityDataArray.push({
                interval: cardData.interval,
                retrievability: grade === 0 ? 0 : 1,
            });

            if (options.stabilityDataArray.length > 0 && options.stabilityDataArray.length % 50 === 0) {
                const intervalSetArray: number[] = [];
                let sumRI2S = 0;
                let sumI2S = 0;

                for (let s = 0; s < options.stabilityDataArray.length; s++) {
                    const ivl = options.stabilityDataArray[s].interval;

                    if (intervalSetArray.indexOf(ivl) === -1) {
                        intervalSetArray.push(ivl);

                        const filterArray = options.stabilityDataArray.filter((fi) => fi.interval === ivl);

                        const retrievabilitySum = filterArray.reduce((sum, e) => sum + e.retrievability, 0);

                        if (retrievabilitySum > 0) {
                            sumRI2S += ivl * Math.log(retrievabilitySum / filterArray.length) * filterArray.length;
                            sumI2S += ivl * ivl * filterArray.length;
                        }
                    }
                }

                options.defaultStability = (Math.max(Math.log(DEFAULT_RETENTION) / (sumRI2S / sumI2S), 0.1) + options.defaultStability) / 2;
            }
        }
    };

    return cardData;
}

export default fsrs;

export function generateCardData(cardId: number) {
    let cardData: CardData = {
        id: cardId,
        due: "", // Empty initially, will be filled by the function
        interval: 0, // Will be updated by the function
        difficulty: 0, // Will be updated by the function
        stability: 0, // Will be updated by the function
        retrievability: 0, // Will be updated by the function
        grade: -1, // Will be updated by the function
        review: "", // Empty initially, will be filled by the function
        reps: 0, // Will be updated by the function
        lapses: 0, // Will be updated by the function
        history: [], // Empty initially, will be filled by the function
    };
    return cardData;
}