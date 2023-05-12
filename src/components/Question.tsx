import { Question } from "../app/page"

const stripWhitespace = (str: string) => str.replace(/\s/g, "")

export default function Question({ question, changeQuestion, giveFeedback }: { question: Question, changeQuestion: Function, giveFeedback: Function }) {

    const toggleButtons = () => {
        const answerQuestionButton = document.getElementById("answer-question-button")
        if (answerQuestionButton) {
            answerQuestionButton.classList.toggle("d-none")
        }
        const nextQuestionButton = document.getElementById("next-question-button")
        if (nextQuestionButton) {
            nextQuestionButton.classList.toggle("d-none")
        }
    }

    const nextQuestion = () => {
        changeQuestion()
        toggleButtons()
    }

    const answerOpenEndedQuestion = (isCorrect: boolean) => {
        giveFeedback(question.id, isCorrect)
        nextQuestion()
    }

    const answerQuestion = () => {
        const isMultipleChoice = question.options && question.options.length > 1
        let correctlyAnswered = true
        if (isMultipleChoice) {
            Array.from(document.querySelectorAll<HTMLLIElement>("#answer-options > li")).forEach((li) => {
                const input = li.querySelector<HTMLInputElement>("input")
                if (!input) return

                const isCorrect = question.correctAnswer.includes(input.value as string)
                if (input.checked) {
                    if (isCorrect) {
                        li.classList.add("list-group-item-success")
                    } else {
                        correctlyAnswered = false
                        li.classList.add("list-group-item-danger")
                    }
                } else if (isCorrect) {
                    li.classList.add("list-group-item-warning")
                } else {
                    li.classList.add("disabled")
                }
            })

            if (correctlyAnswered) {
                giveFeedback(question.id, true)
            } else {
                giveFeedback(question.id, false)
            }

            toggleButtons()
        } else {
            // show the correct answer
            const correctAnswer = document.getElementById("show-correct-answer")
            if (correctAnswer) {
                correctAnswer.classList.remove("d-none")
            }
            const answerQuestionButton = document.getElementById("answer-question-button")
            if (answerQuestionButton) {
                answerQuestionButton.classList.toggle("d-none")
            }
        }
    }

    return (
        <div className="card p-3 w-100">
            {/* <img src="https://placehold.co/400" className="card-img-top text-center m-auto mb-5" alt="..." style={{ maxWidth: 400 }} /> */}
            <div className="card-body row">
                <h5 className="card-title col-12">{question.questionText}</h5>
                {question.explanation && <p className="card-text">{question.explanation}</p>}
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
            {!question.options && (
                <div className="px-3 d-none" id="show-correct-answer">
                    <p>{question.correctAnswer[0]}</p>
                    <div className="row">
                        <button type="button" onClick={() => answerOpenEndedQuestion(false)} className="btn btn-danger m-auto col-auto">Incorrect</button>
                        <button type="button" onClick={() => answerOpenEndedQuestion(true)} className="btn btn-success m-auto col-auto">Correct</button>
                    </div>
                </div>
            )}
            <div className="card-body row">
                <button type="button" id="answer-question-button" className="btn btn-secondary text-center m-auto col-auto" onClick={answerQuestion}>Show Answer</button>
                <button type="button" id="next-question-button" className="btn btn-secondary text-center m-auto col-auto d-none" onClick={nextQuestion}>Next Question</button>
            </div>
        </div>
    )
}