"use client"

import React, { useState, useEffect } from 'react';

import { Question } from "../page"

const QuestionEditor = () => {
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        setTimeout(() => {
            const storedQuestions = localStorage.getItem('questions');
            if (storedQuestions) {
                setQuestions(JSON.parse(storedQuestions));
            }
        }, 350);
    }, []);

    const showQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
        const index = parseInt(e.currentTarget.id.split('-')[2]);
        const collapseElement = document.getElementById(`accordion-collapse-${index}`);
        if (collapseElement) {
            collapseElement.classList.toggle('show');
        }
    };

    const updateQuestion = (questionIndex: number) => {
        const question = questions[questionIndex];

        // check if the question has options
        if (question.options) {
            // get the new question text
            const questionTextElement = document.getElementById(`question-${questionIndex}-text`) as HTMLInputElement;
            // get the new options. The options are child elements of the accordion-collapse element
            const accordionCollapseElement = document.getElementById(`accordion-collapse-${questionIndex}`);

            if (accordionCollapseElement) {
                const updatedOptions = [];
                const updatedCorrectAnswer = [];
                const options = accordionCollapseElement.querySelectorAll('input.form-check-input.question-option') as NodeListOf<HTMLInputElement>;
                const labels = accordionCollapseElement.querySelectorAll('label.form-check-label') as NodeListOf<HTMLLabelElement>;

                for (let i = 0; i < labels.length; i++) {
                    updatedOptions.push(labels[i].textContent);
                    if (options[i].checked) {
                        updatedCorrectAnswer.push(labels[i].textContent);
                    }
                }

                if (!updatedCorrectAnswer.length) {
                    alert('Please select the correct answer');
                    return;
                }

                // update the question
                const updatedQuestion = {
                    ...question,
                    questionText: questionTextElement.value,
                    options: updatedOptions,
                    correctAnswer: updatedCorrectAnswer,
                } as Question;

                // update the questions array
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex] = updatedQuestion;
                setQuestions(updatedQuestions);
                localStorage.setItem('questions', JSON.stringify(updatedQuestions));
            }
        } else {
            // get the new question text
            const questionTextElement = document.getElementById(`question-${questionIndex}-text`) as HTMLInputElement;
            // get the new answer
            const answerElement = document.getElementById(`question-${questionIndex}-answer`) as HTMLInputElement;

            // update the question
            const updatedQuestion = {
                ...question,
                questionText: questionTextElement.value,
                correctAnswer: [answerElement.value],
            } as Question;

            // update the questions array
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex] = updatedQuestion;
            setQuestions(updatedQuestions);
            localStorage.setItem('questions', JSON.stringify(updatedQuestions));

        }

        // close the accordion
        const collapseElement = document.getElementById(`accordion-collapse-${questionIndex}`);
        if (collapseElement) {
            collapseElement.classList.toggle('show');
        }

    };

    return (
        <div className='container'>
            {!questions || questions.length === 0 && (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            {questions && questions.length > 0 && (
                <div className="accordion accordion-flush" >
                    {questions.map((question, index) => (
                        <div className="accordion-item mb-4" key={`question-${index}`} id={`question-${index}`}>
                            <h2 className="accordion-header">
                                <button className="accordion-button" id={`accordion-element-${index}`} type="button" onClick={showQuestion}>
                                    {question.questionText}
                                </button>
                            </h2>
                            <div id={`accordion-collapse-${index}`} className="accordion-collapse collapse">
                                <div className="accordion-body row">

                                    <div className="mb-3 col-12">
                                        <input type="text" className="form-control" id={`question-${index}-text`} placeholder="Question Text" defaultValue={question.questionText} />
                                        <br />
                                        {question.options && question.options.map((answer, answerIndex) => (
                                            <div className="form-check col-12" key={`answer-${answerIndex}`}>
                                                <input className="form-check-input question-option" type="checkbox" name={`answer-${index}`} id={`answer-${index}-${answerIndex}`} defaultChecked={question.correctAnswer.includes(answer)} />
                                                <label className="form-check-label" htmlFor={`answer-${index}-${answerIndex}`}>
                                                    {answer}
                                                </label>
                                            </div>
                                        ))}
                                        {!question.options && (
                                            <div className="">
                                                <input className="form-control" type="text" name={`answer-${index}`} id={`question-${index}-answer`} defaultValue={question.correctAnswer[0]} />
                                            </div>
                                        )}
                                    </div>

                                    <div className='mt-4 col-6'>
                                        <button type="button" className="btn btn-secondary" onClick={() => updateQuestion(index)}>
                                            Update Question
                                        </button>
                                    </div>
                                    <div className='mt-4 col-6 text-end'>
                                        <button type="button" className="btn btn-danger">
                                            Delete Question
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestionEditor;