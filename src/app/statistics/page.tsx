"use client"

import { CardData } from "../../fsrs"
import { Question } from "../page"

export default function StatisticsPage() {

    // Read the cards from local storage
    const cards = JSON.parse(window.localStorage.getItem("cards") || "[]") as CardData[]

    // Read the questions from local storage
    const questions = JSON.parse(window.localStorage.getItem("questions") || "[]") as Question[]

    // Total number of questions
    const numberOfQuestions = questions.length

    // Total number of cards
    const numberOfCards = cards.length

    if (numberOfQuestions !== numberOfCards) {
        console.error("Number of questions and number of cards do not match")
    }

    // Number of correct answers
    const numberOfCorrectAnswers = cards.filter(card => card.grade >= 1).length

    // Number of incorrect answers
    const numberOfIncorrectAnswers = cards.filter(card => card.grade === 0).length

    // Number of questions not yet answered
    const numberOfQuestionsNotYetAnswered = cards.filter(card => card.grade === -1).length

    // Number of cards per grade
    // const numberOfCardsWithGrade_0 = cards.filter(card => card.grade === 0).length
    // const numberOfCardsWithGrade_1 = cards.filter(card => card.grade === 1).length
    const numberOfCardsWithGrade_2 = cards.filter(card => card.grade === 2).length

    return (
        <div className="container">
            <h1>Statistics</h1>
            <div className="row mt-5">
                <figure className="col-12">
                    <blockquote className="ps-2 blockquote">
                        <p>{numberOfQuestions}</p>
                    </blockquote>
                    <figcaption className="blockquote-footer">
                        Total number of questions
                    </figcaption>
                </figure>
                <figure className="col-12">
                    <blockquote className="ps-2 blockquote">
                        <p>{numberOfIncorrectAnswers}</p>
                    </blockquote>
                    <figcaption className="blockquote-footer">
                        Number of incorrect answers
                    </figcaption>
                </figure>
                <figure className="col-12">
                    <blockquote className="ps-2 blockquote">
                        <p>{numberOfCorrectAnswers}</p>
                    </blockquote>
                    <figcaption className="blockquote-footer">
                        Number of correct answers
                    </figcaption>
                </figure>
                <figure className="col-12">
                    <blockquote className="ps-2 blockquote">
                        <p>{numberOfCardsWithGrade_2}</p>
                    </blockquote>
                    <figcaption className="blockquote-footer">
                        Questions multiple times correctly answered
                    </figcaption>
                </figure>
                <figure className="col-12">
                    <blockquote className="ps-2 blockquote">
                        <p>{numberOfQuestionsNotYetAnswered}</p>
                    </blockquote>
                    <figcaption className="blockquote-footer">
                        Number of questions not yet answered
                    </figcaption>
                </figure>
            </div>
        </div>
    );
}