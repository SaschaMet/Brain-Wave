import { QuestionType } from "@/types"
import { useState } from "react"
import Image from 'next/image'

const stripWhitespace = (str: string) => str.replace(/\s/g, "")

function getImageDimensiion(screenSize: number) {
    return Math.min(350, screenSize * 0.9);
}


export default function Question({ question, giveFeedback, changeQuestion }: { question: QuestionType, giveFeedback: Function, changeQuestion: Function }) {

    const [showNextQuestionButton, setShowNextQuestionButton] = useState(false)
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)

    const answerMultipleChoice = () => {
        let correctlyAnswered = true
        const answers = Array.from(document.querySelectorAll<HTMLLIElement>("li.list-group-item"))
            .filter((li) => !li.classList.contains("disabled"))

        // if an answer contains the list-group-item-danger or list-group-item-warning class, it is incorrect
        answers.forEach((li) => {
            if (li.classList.contains("list-group-item-danger") || li.classList.contains("list-group-item-warning")) {
                correctlyAnswered = false
            }
        })

        giveFeedback(question.id, correctlyAnswered)
    }

    const nextQuestion = () => {
        if (question.options && question.options.length > 1) {
            answerMultipleChoice()
        }
        setShowNextQuestionButton(false)
        setShowCorrectAnswer(false)
        changeQuestion()
    }

    const answerOpenEndedQuestion = (isCorrect: boolean) => {
        giveFeedback(question.id, isCorrect)
        nextQuestion()
    }

    const showMultipleChoiceAnswers = () => {
        Array.from(document.querySelectorAll<HTMLLIElement>("#answer-options > li")).forEach((li) => {
            const input = li.querySelector<HTMLInputElement>("input")
            if (!input) return

            const isCorrect = question.correctAnswer.includes(input.value as string)
            if (input.checked) {
                if (isCorrect) {
                    li.classList.add("list-group-item-success")
                } else {
                    li.classList.add("list-group-item-danger")
                }
            } else if (isCorrect) {
                li.classList.add("list-group-item-warning")
            } else {
                li.classList.add("disabled")
            }
        })
        setShowNextQuestionButton(true)
    }

    const showAnswer = () => {
        if (question.options && question.options.length > 1) {
            showMultipleChoiceAnswers()
        } else {
            setShowCorrectAnswer(true)
            setShowNextQuestionButton(true)
        }
    }

    return (
        <div className="card p-3 w-100">            
            <div className="card-body row">
                <h5 className="card-title col-12">{question.questionText}</h5>
                {question.imageUrlQuestion && (
                    <div className="col-12 mt-5">
                        <Image
                            src={question.imageUrlQuestion}
                            width={getImageDimensiion(window.screen.width)}
                            height={getImageDimensiion(window.screen.height)}
                            alt="Explanation Image"
                        />
                    </div>
                )}
            </div>
            {question.options && (
                <ul className="list-group list-group-flush border-0" id="answer-options">
                    {question.options.map((option) => (
                        <li className="list-group-item border-0" key={stripWhitespace(option)}>
                            <input className="form-check-input me-3" type="checkbox" value={option} id={`answer-${stripWhitespace(option)}`} />
                            <label className="form-check-label stretched-link" htmlFor={`answer-${stripWhitespace(option)}`}>{option}</label>
                        </li>
                    ))}
                </ul>
            )}
            {!question.options && showCorrectAnswer && (
                <div className="px-3">
                    <p>{question.correctAnswer[0]}</p>
                    <div className="row pt-4">
                        <button type="button" onClick={() => answerOpenEndedQuestion(false)} className="btn btn-danger m-auto col-auto">Incorrect</button>
                        <button type="button" onClick={() => answerOpenEndedQuestion(true)} className="btn btn-success m-auto col-auto">Correct</button>
                    </div>
                </div>
            )}
            <div className="card-body row">
                {!showNextQuestionButton && (
                    <button type="button" className="btn btn-secondary text-center m-auto col-auto" onClick={showAnswer}>Show Answer</button>
                )}
                {showNextQuestionButton && question.options?.length && (
                    <button type="button" className="btn btn-secondary text-center m-auto col-auto" onClick={nextQuestion}>Next Question</button>
                )}
                {showNextQuestionButton && question.explanation && (
                    <div className="col-12 mt-5">
                        {question.explanation}
                    </div>
                )}
                {showNextQuestionButton && question.imageUrlExplanation && (
                    <div className="col-12 mt-5">
                        <Image
                            src={question.imageUrlExplanation}
                            width={getImageDimensiion(window.screen.width)}
                            height={getImageDimensiion(window.screen.height)}
                            alt="Explanation Image"
                        />
                    </div>
                )}
                {showNextQuestionButton && question.categories?.length && (
                    <div className="col-12 mt-5">
                        <p className="text-muted" >Categories: {question.categories.join(", ")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}