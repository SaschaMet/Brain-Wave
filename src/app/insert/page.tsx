"use client"

import React, { useEffect, useState } from 'react';

import { Question } from "../page"

const CreateNewQuestion = () => {
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(['']);
    const [isMultipleChoice, setIsMultipleChoice] = useState(true);

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    };

    const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setIsMultipleChoice(e.target.value === 'multipleChoice');
    };

    const getCorrectAnswer = () => {
        if (isMultipleChoice) {
            const correctAnswer = []
            const correctAnswerIndexes = [] as number[];

            // iterate over all answer-checkbox elements
            const checkboxes = document.querySelectorAll('.answer-checkbox') as NodeListOf<HTMLInputElement>;
            checkboxes.forEach((checkbox, index) => {
                // if the checkbox is checked, add the index to the correctAnswerIndexes array
                if (checkbox.checked) {
                    correctAnswerIndexes.push(index);
                }
            });

            // next iterate over all answer-input elements and get the value of the input
            const inputs = document.querySelectorAll('.answer-input') as NodeListOf<HTMLInputElement>;
            for (let i = 0; i < correctAnswerIndexes.length; i++) {
                correctAnswer.push(inputs[correctAnswerIndexes[i]].value);
            }

            return correctAnswer;
        } else {
            const input = document.getElementsByClassName("answer-open-ended-question")[0] as HTMLInputElement;
            console.log(input)
            if (!input) return;
            return [input.value];
        }
    }

    const handleAnswerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = e.target.value;
        setAnswers(updatedAnswers);
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, '']);
    };

    const handleRemoveAnswer = (index: number) => {
        const updatedAnswers = [...answers];
        updatedAnswers.splice(index, 1);
        setAnswers(updatedAnswers);
    };

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        // get the questions from local storage
        const questions = JSON.parse(localStorage.getItem('questions') || '[]') as Question[];

        const correctAnswer = getCorrectAnswer();

        if (!correctAnswer || correctAnswer.length === 0) {
            alert('Please select a correct answer!');
            return;
        }

        // create a new question object
        const newQuestion: Question = {
            id: questions.length + 1,
            questionText: question,
            correctAnswer,
            options: answers.length > 0 ? answers : undefined,
        }

        // add the new question to the questions array
        questions.push(newQuestion);

        // save the questions array to local storage
        localStorage.setItem('questions', JSON.stringify(questions));

        // reload the page
        window.location.reload();
    };

    return (
        <div className='container'>
            <form onSubmit={handleSubmit} id="new-question-form">
                <div className="form-group my-4">
                    <label htmlFor="question">Question Text:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="question"
                        value={question}
                        onChange={handleQuestionChange}
                    />
                </div>
                <div className="form-group my-4" style={{ maxWidth: 250 }}>
                    <label htmlFor="questionType">Question Type:</label>
                    <select
                        id="questionType"
                        className="form-select"
                        onChange={handleQuestionTypeChange}
                        value={isMultipleChoice ? 'multipleChoice' : 'openEnded'}
                    >
                        <option value="multipleChoice">Multiple Choice</option>
                        <option value="openEnded">Open Ended</option>
                    </select>
                </div>
                {isMultipleChoice && (
                    <div className="form-group my-4">
                        <label>Answers:</label>
                        {answers.map((answer, index) => (
                            <div key={index} className="input-group mb-3">
                                <input
                                    type="text"
                                    className="form-control answer-input me-3"
                                    value={answer}
                                    onChange={(e) => handleAnswerChange(index, e)}
                                />
                                <div className="form-check form-check-reverse me-3 pt-2">
                                    <input className="form-check-input answer-checkbox" type="checkbox" value="" id={`checkbox-${index}`} />
                                    <label className="form-check-label" htmlFor={`checkbox-${index}`}>
                                        Is Correct Answer
                                    </label>
                                </div>
                                <div className="input-group-append">
                                    {index !== answers.length - 1 && (
                                        <button
                                            className="btn btn-outline-dark"
                                            type="button"
                                            onClick={() => handleRemoveAnswer(index)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                    {index === answers.length - 1 && (
                                        <button
                                            className="btn btn-success"
                                            type="button"
                                            onClick={handleAddAnswer}
                                        >
                                            Add Answer
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!isMultipleChoice && (
                    <div className='mb-3'>
                        <input className="form-control answer-open-ended-question" key="answer-open-ended-question" type="text" placeholder="The answer to your question ..." />
                    </div>
                )}
                <button type="submit" className="btn btn-secondary mt-5">
                    Submit
                </button>
            </form>
        </div>
    );

};

export default CreateNewQuestion;
