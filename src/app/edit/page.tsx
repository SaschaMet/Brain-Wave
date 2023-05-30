"use client"

import React, { useState, useEffect } from 'react';
import { QuestionType } from "@/types"
import { Store } from "@/store"

const QuestionEditor = () => {
    const questionStore = new Store('questions');

    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionType[]>([]);

    const showQuestion = (e: React.MouseEvent<HTMLButtonElement>) => {
        const index = parseInt(e.currentTarget.id.split('-')[2]);
        const collapseElement = document.getElementById(`accordion-collapse-${index}`);
        if (collapseElement) {
            collapseElement.classList.toggle('show');
        }
    };

    const closeAccordion = (questionIndex: number) => {
        const collapseElement = document.getElementById(`accordion-collapse-${questionIndex}`);
        if (collapseElement) {
            collapseElement.classList.toggle('show');
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 350);
    };

    const deleteQuestion = async (questionIndex: number) => {
        const updatedQuestions = questions.filter((question, index) => index !== questionIndex);
        closeAccordion(questionIndex);
        setQuestions(updatedQuestions);
        await questionStore.replaceItems(updatedQuestions)
    };

    const removeOption = (answerIndex: number, questionIndex: number) => {
        try {
            const question = questions[questionIndex];
            const newOptions = question.options?.filter((option, index) => index !== answerIndex);

            if (newOptions?.length && newOptions.length >= 2) {
                question.options = newOptions;
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex] = question;
                setQuestions(updatedQuestions);
            } else {
                alert('A question must have at least two options');
            }

        } catch (error) {
            console.error(error);
        }
    };

    const addOption = (questionIndex: number) => {
        const question = questions[questionIndex];
        const options = question.options ? question.options : [];
        question.options = [...options, 'new option'];
        questions[questionIndex] = question;
        setQuestions([...questions]);
    };

    const updateQuestion = async (e: React.MouseEvent<HTMLButtonElement>, questionIndex: number) => {
        try {
            e.preventDefault();

            const question = questions[questionIndex];

            let explanation = document.getElementById(`question-${questionIndex}-explanation`) as HTMLTextAreaElement;
            if (explanation && explanation.value !== ''){
                explanation.value = explanation.value.trim();
            }

            let imageUrlQuestion = document.getElementById("image-url-question") as HTMLInputElement;
            if (imageUrlQuestion && imageUrlQuestion.value !== ''){
                imageUrlQuestion.value = imageUrlQuestion.value.trim();
            }
    
            let imageUrlExplanation = document.getElementById("image-url-explanation") as HTMLInputElement;
            if (imageUrlExplanation && imageUrlExplanation.value !== ''){
                imageUrlExplanation.value = imageUrlExplanation.value.trim();
            }
            
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
                    const labels = accordionCollapseElement.querySelectorAll('input.question-text') as NodeListOf<HTMLInputElement>;

                    for (let i = 0; i < labels.length; i++) {
                        updatedOptions.push(labels[i].value);
                        if (options[i].checked) {
                            updatedCorrectAnswer.push(labels[i].value);
                        }
                    }

                    if (!updatedCorrectAnswer.length) {
                        alert('Please select the correct answer');
                        return;
                    }

                    // update the question
                    const updatedQuestion = {
                        ...question,
                        options: updatedOptions,
                        correctAnswer: updatedCorrectAnswer,
                        questionText: questionTextElement.value,
                        explanation: explanation.value === '' ? "" : explanation.value,
                        imageUrlQuestion: imageUrlQuestion.value === '' ? "" : imageUrlQuestion.value,
                        imageUrlExplanation: imageUrlExplanation.value === '' ? "" : imageUrlExplanation.value,
                    } as QuestionType;


                    // filter the new question object to remove any empty strings
                    updatedQuestion.options = updatedQuestion.options?.filter((option: string) => option !== '');

                    // update the questions array
                    const updatedQuestions = [...questions];
                    updatedQuestions[questionIndex] = updatedQuestion;
                    setQuestions(updatedQuestions);
                    await questionStore.replaceItems(updatedQuestions)
                }
            } else {
                // get the new question text
                const questionTextElement = document.getElementById(`question-${questionIndex}-text`) as HTMLInputElement;
                // get the new answer
                const answerElement = document.getElementById(`question-${questionIndex}-answer`) as HTMLInputElement;

                // update the question
                const updatedQuestion = {
                    ...question,
                    correctAnswer: [answerElement.value],
                    questionText: questionTextElement.value,
                    explanation: explanation.value === '' ? "" : explanation.value,
                    imageUrlQuestion: imageUrlQuestion.value === '' ? "" : imageUrlQuestion.value,
                    imageUrlExplanation: imageUrlExplanation.value === '' ? "" : imageUrlExplanation.value,
                } as QuestionType;

                // update the questions array
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex] = updatedQuestion;
                setQuestions(updatedQuestions);
                await questionStore.replaceItems(updatedQuestions)

            }

            closeAccordion(questionIndex);
        } catch (error) {
            console.error(error);
        }
    };

    const setup = async () => {
        try {
            await questionStore.setup()
            const questions = await questionStore.fetchAllItems() as QuestionType[];
            setQuestions(questions)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setup()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className='container'>
                <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='container'>
            <p className='mb-4'>There are {questions.length} questions in your database.</p>
            <div className="accordion accordion-flush" >
                {questions.map((question, index) => (
                    <div className="accordion-item mb-4" key={`question-${question.id}-${question.questionText}`} id={`question-${index}`}>
                        <h2 className="accordion-header">
                            <button className="accordion-button" id={`accordion-element-${index}`} type="button" onClick={showQuestion}>
                                {question.questionText}
                            </button>
                        </h2>
                        <div id={`accordion-collapse-${index}`} className="accordion-collapse collapse">
                            <div className="accordion-body row">

                                <div className="mb-3 col-12">
                                    <label className="form-check-label text-muted">
                                        Question
                                    </label>
                                    <input type="text" className="form-control" id={`question-${index}-text`} placeholder="Question Text" defaultValue={question.questionText} />
                                    <br />
                                    <label className="form-check-label text-muted">
                                        Answer(s)
                                    </label>
                                    {question.options && question.options.map((answer, answerIndex) => (
                                        <div className="option-wrapper form-check d-flex justify-content-between align-content-between flex-wrap py-1" key={`answer-${answer}-${answerIndex}`}>
                                            <div className='col-10'>
                                                <input className="form-check-input question-option mt-2" type="checkbox" name={`answer-${index}`} id={`answer-${index}-${answerIndex}`} defaultChecked={question.correctAnswer.includes(answer)} />
                                                <input type='text' className="form-control question-text" defaultValue={answer} />
                                            </div>
                                            <div>
                                                <button type="button" className="btn btn-danger btn-sm ms-2" name={`answer-${index}-${answerIndex}`} onClick={() => removeOption(answerIndex, index)}>
                                                    Delete Option
                                                </button>
                                            </div>
                                        </div>
                                    )
                                    )}
                                    {!question.options && (
                                        <div>
                                            <input className="form-control" type="text" name={`answer-${index}`} id={`question-${index}-answer`} defaultValue={question.correctAnswer[0]} />
                                        </div>
                                    )}
                                    <br />
                                    <div>
                                        <label className="form-check-label text-muted">
                                            Explanation - Optional
                                        </label>                                     
                                        <textarea className="form-control explanation" id={`question-${index}-explanation`} rows={3} placeholder="Further explain your answer - Optional." defaultValue={question.explanation} />
                                    </div>
                                    <div className='my-3'>
                                        <label className="form-check-label text-muted" htmlFor="image-url-question">
                                            Image URL for Questions- Optional
                                        </label>
                                        <input className="form-control image-url" key="image-url-question" id="image-url-question" type="text" placeholder="Image will be shown together with the question" defaultValue={question.imageUrlQuestion}/>
                                    </div>
                                    <div className='my-3'>
                                        <label className="form-check-label text-muted" htmlFor="image-url-explanation">
                                            Image URL for Explanation- Optional
                                        </label>
                                        <input className="form-control image-url" key="image-url-explanation" id="image-url-explanation" type="text" placeholder="Image will be shown together with the explanation of a question" defaultValue={question.imageUrlExplanation}/>
                                    </div>
                                </div>

                                <div className='mt-4 col'>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={(e) => updateQuestion(e, index)}>
                                        Update Question
                                    </button>
                                </div>
                                <div className='mt-4 col text-center'>
                                    {question.options && (
                                        <button type="button" className="btn btn-info btn-sm" onClick={() => addOption(index)}>
                                            Add Option
                                        </button>
                                    )}
                                </div>
                                <div className='mt-4 col text-end'>
                                    <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteQuestion(index)}>
                                        Delete Question
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionEditor;