"use client"

import { ChangeEvent, useEffect, useState } from "react"
import LoadingSpinner from "../components/LoadingSpinner"
import { Store, setupCards, sortCardsForLearning } from "../Store"
import Question from "../components/Question"
import fsrs from "../fsrs"

import { QuestionType, CardData, FilterEntity } from "../types"

export default function Home() {

    const questionStore = new Store('questions');
    const cardStore = new Store('cards');

    const [questions, setQuestions] = useState<QuestionType[] | null>(null)
    const [cards, setCards] = useState<CardData[] | null>(null)

    const [filteredCards, setFilteredCards] = useState<CardData[] | null>(null)
    const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null)

    const [showFilters, setShowFilters] = useState(false)

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
            cardStore.replaceItems(newCards)
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
            cardStore.replaceItems(newCards)
            setCards(newCards)
            nextIndex = 0
        }

        setTimeout(() => {
            setCurrentCardIndex(nextIndex)
        }, 350);
    }

    const getNextCard = (): QuestionType => {
        const nextCard = filteredCards![currentCardIndex!]
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
            await cardStore.replaceItems(newCards)
            await setFilteredCards(newCards)
        } else {
            await setFilteredCards(cards)
        }
        
        setCurrentCardIndex(0)
    }

    const filterCards = async (e: ChangeEvent<HTMLSelectElement>, filterEntity: FilterEntity) => {
        const filter = e.target.value
        if (filterEntity === "category") {
            const filteredQuestions = questions!.filter(question => {
                if (filterEntity === "category") {
                    return question.categories?.includes(filter)
                }
            }).map(n => n)
    
            if (filteredQuestions.length === 0) {
                alert("No questions found for filter")
                return
            }

            const newCards = await setupCards(filteredQuestions!)
            await setFilteredCards(newCards)
            setCurrentCardIndex(0)
            changeQuestion()
            return
        }
        if (filterEntity === "difficulty") {
            if (filter === "easy") {
                const filteredCards = cards!.filter(card => card.difficulty < 5)
                if (!filteredCards.length) {
                    alert("No questions found for filter")
                    return
                }
                await setFilteredCards(filteredCards)
                setCurrentCardIndex(0)
                changeQuestion()
                return
            }

            if (filter === "hard") {
                const filteredCards = cards!.filter(card => card.difficulty >= 5)
                if (!filteredCards.length) {
                    alert("No questions found for filter")
                    return
                }
                await setFilteredCards(filteredCards)
                setCurrentCardIndex(0)
                changeQuestion()
                return
            }
        }
        await setFilteredCards(cards)
        setCurrentCardIndex(0)
        changeQuestion()
    }

    useEffect(() => {
        setup()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const categories = questions?.map(question => question.categories).flat().filter((v, i, a) => a.indexOf(v) === i).filter(n => n)

    return (
        <div className="container-xl">
            <div className="row">
                <div className="col-12 mx-auto p-4 py-md-5">
                    <main>
                        {currentCardIndex === null && (<LoadingSpinner />)}
                        {questions && questions.length === 0 && (
                            <div className="alert alert-warning" role="alert">
                                <h4 className="alert-heading">No questions found!</h4>
                                <p>
                                    Please add some questions to your <a href="/insert">question list</a> first.
                                </p>
                            </div>
                        )}
                        {Boolean(questions?.length && cards?.length && filteredCards?.length && currentCardIndex !== null) && (
                            <>
                                <Question
                                    question={getNextCard()}
                                    giveFeedback={updateCards}
                                    changeQuestion={changeQuestion}
                                />                                
                            </>
                        )}
                        <div className="form-check form-switch mt-3">
                            <input className="form-check-input switch-input" type="checkbox" role="switch" id="showFilterSwitch" defaultChecked={showFilters} onChange={() => setShowFilters(!showFilters)} />
                            <label className="form-check-label text-small" htmlFor="showFilterSwitch">Filter questions</label>
                        </div>
                        <div className={`row justify-content-center ${showFilters ? '' : 'collapse'}`}>
                            <div className="col-12 col-sm-4 mt-5" >
                                <div className="form-border-transparent form-fs-lg bg-light rounded-3 h-100 p-3">
                                    <label className="mb-1 text-muted">Filter By Difficulty:</label>
                                    <div className="choices">
                                        <div className="choices__inner">
                                            <select className="form-select" aria-label="Default select example" onChange={(e) => filterCards(e, FilterEntity.difficulty)}>                                                        
                                                <option value="medium">Medium</option>
                                                <option value="easy">Easy</option>
                                                <option value="hard">Hard</option>
                                            </select>                                               
                                        </div>
                                    </div>
                                    <p className="pt-3 fw-lighter" style={{ fontSize: "0.75rem" }}>
                                        Easy means you only see questions that you have answered correctly. Medium means you see all questions. Hard means you only see questions that you have answered incorrectly.
                                        Default = Medium.</p>
                                </div>
                            </div>

                            {categories && categories.length > 0 && (
                                <div className="col-12 col-sm-4 mt-5" >
                                    <div className="form-border-transparent form-fs-lg bg-light rounded-3 h-100 p-3">
                                    <label className="mb-1 text-muted">Filter By Category:</label>
                                        <div className="choices">
                                            <div className="choices__inner">
                                                <select className="form-select" aria-label="Default select example" onChange={(e) => filterCards(e, FilterEntity.category)}>
                                                    <option>Select an Option</option>
                                                    {categories?.map(category => (
                                                        <option key={category} value={category}>{category}</option>
                                                    ))}
                                                </select>                                               
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div> 
                    </main>
                </div>
            </div>
            <footer className="pt-5 my-5 text-body-secondary border-top">
                Created by <a href="https://github.com/SaschaMet" target="_blank" >SaschaM</a> · © {new Date().getFullYear()}
            </footer>
        </div>
    )
}
