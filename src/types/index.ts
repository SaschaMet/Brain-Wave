export interface QuestionType {
    id: number
    questionText: string
    correctAnswer: string[]
    options?: string[]
    explanation?: string
    imageUrlQuestion?: string
    imageUrlExplanation?: string
}

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

export interface Options {
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