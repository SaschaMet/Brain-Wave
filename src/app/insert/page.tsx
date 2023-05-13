"use client"

import React, { useState } from 'react';
import { QuestionType } from "@/types"
import { Store } from "@/Store"

const CreateNewQuestion = () => {
    const questionStore = new Store('questions');

    const [loading, setLoading] = useState<boolean>(false)

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

    const handleSubmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        await questionStore.setup();
        const questions = await questionStore.fetchAllItems() as QuestionType[]

        const correctAnswer = getCorrectAnswer();

        if (!correctAnswer || correctAnswer.length === 0) {
            alert('Please select at least one correct answer!');
            return;
        }

        const newAnswers = answers.filter((answer) => answer !== '');

        // create a new question object
        const newQuestion: QuestionType = {
            id: questions.length + 1,
            questionText: question,
            correctAnswer,
            options: isMultipleChoice ? newAnswers : undefined,
        }

        // alert if the question text is empty
        if (!newQuestion.questionText || newQuestion.questionText === '') {
            alert('Please enter a question!');
            return;
        }

        // alert if the question type is multiple choice and there are less than 2 options
        if (isMultipleChoice && newQuestion.options?.length && newQuestion.options.length < 2) {
            alert('Please enter at least 2 options!');
            return;
        }

        // filter the new question object to remove any empty strings
        newQuestion.options = newQuestion.options?.filter((option: string) => option !== '');

        // add the new question to the questions array
        questions.push(newQuestion);

        questionStore.storeMultipleItems(questions);

        // reset the form
        setLoading(true);
        setQuestion('');
        setAnswers(['']);
        setIsMultipleChoice(true);

        setTimeout(() => {
            setLoading(false);
        }, 350);
    };

    const validateData = async () => {
        try {
            await questionStore.setup();
            const questions = await questionStore.fetchAllItems() as QuestionType[]

            const data = document.getElementById('manual-data') as HTMLTextAreaElement;

            // if data is empty, alert the user and abort
            if (!data.value) {
                alert('Please enter valid data! Aborting...');
                return null;
            }

            // if the first element is not an [, add [ as the first element and ] as the last element
            if (data.value[0] !== '[') {
                data.value = '[' + data.value + ']';
            }

            const parsedData = JSON.parse(data.value);

            // if parsedData is not an array, alert the user and abort
            if (!Array.isArray(parsedData)) {
                alert('Please enter valid data! Aborting...');
                return null;
            }

            // if parsedData is an array, check if all items in the array are of type Question
            parsedData.forEach((item: QuestionType) => {
                if (!item.questionText || !item.correctAnswer) {
                    alert('Please enter valid json data that matches the Question type! Aborting...');
                    return null;
                }
            });

            const newQuestions = parsedData.map((item) => {
                return {
                    id: questions.length + 1,
                    questionText: item.questionText,
                    correctAnswer: item.correctAnswer,
                    options: item.options || undefined,
                    explanation: item.explanation || undefined,
                }
            })

            return newQuestions as QuestionType[];
        } catch (error) {
            console.error(error);
            alert('Error. Aborting...');
            return null;
        }
    }

    const addDataManually = async () => {
        try {
            const data = await validateData();
            if (!data) return null;
            await questionStore.storeMultipleItems(data);
            const textArea = document.getElementById('manual-data') as HTMLTextAreaElement;
            textArea.value = '';
            alert('Data added successfully!');
        } catch (error) {
            console.error(error);
        }
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

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

            <div className='col-12 mt-5 row'>
                <hr />
                <div className='col-12 mb-3'>
                    <textarea id="manual-data" className='form-control' rows={3} placeholder='Paste your questions here ...' />
                </div>
                <div className='col-12 col-sm-6'>
                    <button type="button" className="btn btn-outline-secondary" onClick={addDataManually} >
                        Add questions manually.
                    </button>
                </div>
            </div>

        </div>
    );

};

export default CreateNewQuestion;
