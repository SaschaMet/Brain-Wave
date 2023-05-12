"use client"

import { useEffect, useState } from "react"

import questionsStore from "../../public/questions.json"

import fsrs, { generateCardData, CardData } from "../fsrs"
import Question from "../components/Question"
export interface Question {
    id: number
    questionText: string
    correctAnswer: string[]
    options?: string[]
    explanation?: string
}

function sortCardsForLearning(cardDataArray: CardData[]): CardData[] {
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

const setupCards = (questions: Question[]) => {
    const cards = questions.map((question) => {
        const card = generateCardData(question.id) as CardData
        return fsrs(card)
    })
    return sortCardsForLearning(cards)
}

export default function Home() {

    const [questions, setQuestions] = useState<Question[] | null>(null)
    const [cards, setCards] = useState<CardData[] | null>(null)

    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null)

    const updateCards = (cardId: number, correctlyAnswered: boolean) => {
        if (cards) {
            const card = cards.find(card => card.id === cardId)
            const cardIndex = cards.findIndex(card => card.id === cardId)

            if (!card) return
            card.grade = correctlyAnswered ? 1 : 0

            let newCards = [...cards]
            const newCard = fsrs(card)
            newCards[cardIndex] = newCard

            setCards(newCards)
            window.localStorage.setItem("cards", JSON.stringify(newCards))
        }
    }

    const changeQuestion = () => {
        let nextIndex = (currentCardIndex || 0) + 1
        setCurrentCardIndex(null)

        // if the next card is not in the index anymore, we need to reset the index
        if (nextIndex >= cards!.length) {
            let newCards = [...cards!]
            newCards = sortCardsForLearning(newCards)
            window.localStorage.setItem("cards", JSON.stringify(newCards))
            setCards(newCards)
            nextIndex = 0
        }

        setTimeout(() => {
            setCurrentCardIndex(nextIndex)
        }, 350);
    }

    const getNextCard = (): Question => {
        const nextCard = cards![currentCardIndex!]
        // get the question with the id of the card
        const question = questions!.find(question => question.id === nextCard.id)
        return question!
    }

    useEffect(() => {
        // check if we have saved the questions already to local storage
        if (window.localStorage.getItem("questions")) {
            const questions = JSON.parse(window.localStorage.getItem("questions") || "[]")
            if (questions.length === 0) {
                setQuestions(questionsStore.questions)
            } else {
                setQuestions(questions)
            }
        } else {
            window.localStorage.setItem("questions", JSON.stringify(questionsStore.questions))
            setQuestions(questionsStore.questions)
        }

        // check if we have saved the cards already to local storage
        if (window.localStorage.getItem("cards")) {
            const cards = JSON.parse(window.localStorage.getItem("cards") || "[]")
            if (cards.length === 0) {
                const cards = setupCards(questionsStore.questions)
                setCards(cards)
                window.localStorage.setItem("cards", JSON.stringify(cards))
            } else {
                setCards(cards)
            }
        } else {
            const cards = setupCards(questionsStore.questions)
            setCards(cards)
            window.localStorage.setItem("cards", JSON.stringify(cards))
        }

        setCurrentCardIndex(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div className="container-xl">
                <div className="row">
                    <div className="col-12 mx-auto p-4 py-md-5">
                        <main>
                            {currentCardIndex === null && (
                                <div className="d-flex justify-content-center">
                                    <div className="spinner-border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {questions && cards && currentCardIndex !== null && (
                                <Question
                                    question={getNextCard()}
                                    changeQuestion={changeQuestion}
                                    giveFeedback={updateCards}
                                />
                            )}
                        </main>
                    </div>
                </div>
                <footer className="pt-5 my-5 text-body-secondary border-top">
                    Created by SaschaM · © 2023
                </footer>
            </div>
        </>
    )
}
