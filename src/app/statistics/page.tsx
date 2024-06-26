"use client"
import React, { useEffect, useState } from "react"
import { Store } from "../../Store"
import { CardData, QuestionType } from "../../types"
import LoadingSpinner from "../../components/LoadingSpinner"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type StatisticsType = {
    numberOfQuestions: number,
    numberOfCorrectAnswers: number,
    numberOfIncorrectAnswers: number,
    numberOfQuestionsNotYetAnswered: number,
    numberOfCardsWithGrade_2: number
}

const generateStatistics = (questions: QuestionType[], cards: CardData[]) => {
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
    const numberOfIncorrectAnswers = cards.filter(card => card.history.length !== 0 && card.grade < 1).length

    // Number of questions not yet answered
    const numberOfQuestionsNotYetAnswered = cards.filter(card => card.history.length === 0).length

    // Number of cards per grade
    // const numberOfCardsWithGrade_0 = cards.filter(card => card.grade === 0).length
    // const numberOfCardsWithGrade_1 = cards.filter(card => card.grade === 1).length
    const numberOfCardsWithGrade_2 = cards.filter(card => card.grade === 2).length

    return {
        numberOfQuestions,
        numberOfCorrectAnswers,
        numberOfIncorrectAnswers,
        numberOfQuestionsNotYetAnswered,
        numberOfCardsWithGrade_2
    }
}

const generateChartData = (statistics: StatisticsType) => {

    return {
        labels: ['Correct Answers', 'Incorrect Answers', 'New Questions'],
        datasets: [
            {
                label: '# of Questions',
                data: [statistics.numberOfCorrectAnswers, statistics.numberOfIncorrectAnswers, statistics.numberOfQuestionsNotYetAnswered],
                backgroundColor: [
                    'rgba(41, 164, 41, 0.8)',
                    'rgba(255, 0, 0, 0.8)',
                    'rgba(63, 63, 63, 0.6)'
                ],
                borderWidth: 0,
            },
        ],
    };
}

export default function StatisticsPage() {

    const questionStore = new Store('questions');
    const cardStore = new Store('cards');

    const [loading, setLoading] = useState<boolean>(true)
    const [statistics, setStatistics] = useState<StatisticsType | null>(null)

    const setup = async () => {
        await questionStore.setup()
        await cardStore.setup()

        const questions = await questionStore.fetchAllItems() as QuestionType[]
        const cards = await cardStore.fetchAllItems() as CardData[]

        const statistics = generateStatistics(questions, cards)
        setStatistics(statistics)

        setLoading(false)
    }

    useEffect(() => {
        setup()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading || !statistics) {
        return <LoadingSpinner />
    }

    return (
        <div className="container">
            <h1>Statistics</h1>
            <div className="row">
                <div className="row col-12 col-lg-7">
                    <div className="mt-5 chart">
                        <Pie data={generateChartData(statistics)} />
                    </div>
                </div>
                <div className="row col-12 col-lg-5">
                    <figure className="col-12 my-3">
                        <blockquote className="ps-2 blockquote">
                            <p>{statistics.numberOfQuestions}</p>
                        </blockquote>
                        <figcaption className="blockquote-footer">
                            Total number of questions
                        </figcaption>
                    </figure>
                    <figure className="col-12">
                        <blockquote className="ps-2 blockquote">
                            <p>{statistics.numberOfIncorrectAnswers}</p>
                        </blockquote>
                        <figcaption className="blockquote-footer">
                            Number of incorrect answers
                        </figcaption>
                    </figure>
                    <figure className="col-12">
                        <blockquote className="ps-2 blockquote">
                            <p>{statistics.numberOfCorrectAnswers}</p>
                        </blockquote>
                        <figcaption className="blockquote-footer">
                            Number of correct answers
                        </figcaption>
                    </figure>
                    <figure className="col-12">
                        <blockquote className="ps-2 blockquote">
                            <p>{statistics.numberOfCardsWithGrade_2}</p>
                        </blockquote>
                        <figcaption className="blockquote-footer">
                            Questions multiple times correctly answered
                        </figcaption>
                    </figure>
                    <figure className="col-12">
                        <blockquote className="ps-2 blockquote">
                            <p>{statistics.numberOfQuestionsNotYetAnswered}</p>
                        </blockquote>
                        <figcaption className="blockquote-footer">
                            Number of questions not yet answered at least one time correctly
                        </figcaption>
                    </figure>
                </div>
            </div>
        </div>
    );
}