import { QuestionType } from "../types"
import { useEffect, useState } from "react"
import Image from 'next/image'

const stripWhitespace = (str: string) => str.replace(/\s/g, "")

function getImageDimension(screenSize: number, minDimension = 250) {
    return Math.min(minDimension, screenSize * 0.75);
}

export default function Question({ question, giveFeedback, changeQuestion }: { question: QuestionType, giveFeedback: Function, changeQuestion: Function }) {
    const [showNextQuestionButton, setShowNextQuestionButton] = useState(false)
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)
    const [flipped, setFlipped] = useState(false);
    const [showBack, setShowBack] = useState(false);

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
            setFlipped(!flipped);
            setShowNextQuestionButton(true)
            setTimeout(() => {
                setShowCorrectAnswer(true)
            }, 150);
        }
    }

    useEffect(() => {
        if (flipped) {
            setTimeout(() => {
                setShowBack(true)
            }, 150);
        } else {
            setShowBack(false)
        }
    }, [flipped])


    return (
        <>
            <div className={`card question-card ${flipped ? 'flipped' : ''} shadow py-3 m-auto`}  >
                <div className={`card-front card-body row py-3 ${flipped ? 'hidden' : ''}`}>
                    <h5 className="card-title col-12 d-flex justify-content-center align-items-center">{question.questionText}</h5>

                    {question.imageUrlQuestion && (
                        <div className="col-12 mt-5">
                            <Image
                                src={question.imageUrlQuestion}
                                width={getImageDimension(window.screen.width)}
                                height={getImageDimension(window.screen.height)}
                                alt="Explanation Image"
                            />
                        </div>
                    )}

                    {question.options && (
                        <ul className="list-group list-group-flush border-0" id="answer-options">
                            {question.options.map((option) => (
                                <li className="list-group-item border-0" key={stripWhitespace(option)}>
                                    <input className="form-check-input me-2" type="checkbox" value={option} id={`answer-${stripWhitespace(option)}`} />
                                    <label className="form-check-label stretched-link d-inline" htmlFor={`answer-${stripWhitespace(option)}`}>{option}</label>
                                </li>
                            ))}
                        </ul>
                    )}

                    {!showNextQuestionButton && (
                        <button type="button" className="btn btn-sm btn-outline-secondary text-center m-auto col-auto mt-5" onClick={showAnswer}>Show Answer</button>
                    )}

                    {showNextQuestionButton && question.options?.length && (
                        <button type="button" className="btn btn-sm btn-outline-secondary text-center m-auto col-auto mt-4 mt-sm-2" onClick={nextQuestion}>Next Question 👉</button>
                    )}

                </div>
                <div className={`card-back card-body row ${showBack ? '' : 'hidden'}`}>

                    <h5 className="card-title ms-2">{question.questionText}</h5>
                    <br />
                    <br />

                    {question.options && question.correctAnswer.map(answer => (
                        <p key={answer}><span className="text-muted" >Answer:</span><br />{answer}</p>
                    ))}

                    {!question.options && (
                        <textarea className="form-control show-answer-correctAnswer" disabled rows={6} name={`answer-${question.id}`} id={`question-${question.id}-answer`} defaultValue={question.correctAnswer[0]} placeholder='The answer to the question is ...' />
                    )}

                    {showNextQuestionButton && question.explanation && (
                        <div className="col-12 question-explanation">
                            <p className="pb-0 mb-0 mt-3 text-muted">
                                Explanation:
                            </p>
                            <pre>
                                {question.explanation}
                            </pre>
                        </div>
                    )}

                    {showNextQuestionButton && question.imageUrlExplanation && (
                        <div className="col-12">
                            <Image
                                src={question.imageUrlExplanation}
                                width={getImageDimension(window.screen.width)}
                                height={getImageDimension(window.screen.height)}
                                alt="Explanation Image"
                            />
                        </div>
                    )}
                </div>
            </div>
            {showCorrectAnswer && (
                <div className="col-12 border py-3 mt-4 rounded d-flex align-items-center justify-content-evenly text-center">
                    <p className="m-0 h5 pb-3"> Was your answer correct? </p>
                    <div>
                        <button type="button" onClick={() => answerOpenEndedQuestion(true)} className="btn btn-sm btn-success m-auto col-auto mx-3 mt-2 mb-5 mb-sm-0 mt-sm-0">Yes 👍</button>
                        <button type="button" onClick={() => answerOpenEndedQuestion(false)} className="btn btn-sm btn-danger m-auto col-auto mx-3">No 👎</button>
                    </div>
                </div>
            )}

        </>
    );
}
