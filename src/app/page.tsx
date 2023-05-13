"use client"

import { useEffect, useState } from "react"

import { Store, setupCards, sortCardsForLearning } from "@/Store"
import Question from "../components/Question"
import fsrs from "../fsrs"

import { QuestionType, CardData } from "@/types"

export default function Home() {

    const questionStore = new Store('questions');
    const cardStore = new Store('cards');

    const [questions, setQuestions] = useState<QuestionType[] | null>(null)
    const [cards, setCards] = useState<CardData[] | null>(null)

    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null)

    const updateCards = (questionId: number, correctlyAnswered: boolean) => {
        if (cards) {
            const card = cards.find(card => card.id === questionId)

            if (!card) return
            card.grade = correctlyAnswered ? 1 : 0

            let newCards = [...cards]
            const newCard = fsrs(card)

            newCards = newCards.filter(card => card.id !== questionId)
            newCards.push(newCard)

            newCards = sortCardsForLearning(newCards)

            cardStore.storeMultipleItems(newCards)
        }
    }

    const changeQuestion = () => {
        let nextIndex = (currentCardIndex || 0) + 1
        setCurrentCardIndex(null)

        // if the next card is not in the index anymore, we need to reset the index
        if (nextIndex >= cards!.length) {
            console.info("resetting index")
            let newCards = [...cards!]
            newCards = sortCardsForLearning(newCards)
            cardStore.storeMultipleItems(newCards)
            setCards(newCards)
            nextIndex = 0
        }

        setTimeout(() => {
            setCurrentCardIndex(nextIndex)
        }, 350);
    }

    const getNextCard = (): QuestionType => {
        const nextCard = cards![currentCardIndex!]
        // get the question with the id of the card
        const question = questions!.find(question => question.id === nextCard.id)

        if (!question) {
            console.error("No question found for card with id " + nextCard.id)
            throw new Error("No question found for card with id " + nextCard.id)
        }

        // randomize the order of the options
        if (question.options && question.options.length > 1) {
            question.options = question.options.sort(() => Math.random() - 0.5)
        }

        return question
    }

    const setup = async () => {
        await questionStore.setup()
        await cardStore.setup()

        const questions = await questionStore.fetchAllItems() as QuestionType[]
        setQuestions(questions)

        const cards = await cardStore.fetchAllItems() as CardData[]
        setCards(cards)

        if (!cards || !questions) {
            console.error("No cards or questions found!")
        }

        if ((!cards && questions) || cards.length !== questions.length) {
            console.info("Setting up cards")
            const newCards = await setupCards(questions)
            await setCards(newCards)
            await cardStore.storeMultipleItems(newCards)
        }

        setCurrentCardIndex(0)
    }

    useEffect(() => {
        setup()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
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
                        {questions && questions.length === 0 && (
                            <div className="alert alert-warning" role="alert">
                                <h4 className="alert-heading">No questions found!</h4>
                                <p>
                                    Please add some questions to your <a href="/insert">question list</a> first.
                                </p>
                            </div>
                        )}
                        {Boolean(questions?.length && cards?.length && currentCardIndex !== null) && (
                            <Question
                                question={getNextCard()}
                                giveFeedback={updateCards}
                                changeQuestion={changeQuestion}
                            />
                        )}
                    </main>
                </div>
            </div>
            <footer className="pt-5 my-5 text-body-secondary border-top">
                Created by SaschaM · © 2023
            </footer>
        </div>
    )
}
