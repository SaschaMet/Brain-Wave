"use client"

import React, { useState, useEffect } from 'react';
import { useDebounce, useDebounceCallback } from '@react-hook/debounce'

import { QuestionType, ToastMessageProps } from "../../types"
import { Store, getUniqueCategories, searchQuestions } from "../../Store"
import AddEditQuestion from '../../components/AddEditQuestion';
import { Accordion, AccordionItem } from "../../components/Accordion"
import { ToastMessage } from '../../components/ToastMessage';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const QuestionEditor = () => {
    const questionStore = new Store('questions');

    const [loading, setLoading] = useState<boolean>(true);
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [allQuestions, setAllQuestions] = useState<QuestionType[]>([]);
    const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);

    const [showModal, setShowModal] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<ToastMessageProps | null>(null);
    const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);

    const confirmQuestionDeletion = (questionIndex: number | null) => {
        if (questionIndex) {
            setQuestionToDelete(questionIndex);
            setShowModal(true);
        } else {
            setShowModal(false);
            setQuestionToDelete(null);
        }
    }

    const deleteQuestion = async () => {
        const updatedQuestions = questions.filter((question, index) => index !== questionToDelete);
        setQuestions(updatedQuestions);
        await questionStore.replaceItems(updatedQuestions)
        setShowModal(false);
        setQuestionToDelete(null);
        setToastMessage({
            message: 'Question deleted successfully',
            type: 'success'
        });
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
                setToastMessage({
                    message: 'A question must have at least two options',
                    type: 'error'
                });
            }

        } catch (error) {
            console.error(error);
        }
    };

    const removeCategory = (category: string, questionIndex: number) => {
        try {
            const question = questions[questionIndex];
            const newCategories = question.categories?.filter((cat) => cat !== category);

            question.categories = newCategories;
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex] = question;
            setQuestions(updatedQuestions);

        } catch (error) {
            console.error(error);
        }
    };

    const addOption = (questionIndex: number) => {
        const question = questions[questionIndex];
        const options = question.options ? question.options : [];
        question.options = [...options, ''];
        questions[questionIndex] = question;
        setQuestions([...questions]);
    };

    const addCategory = (questionIndex: number) => {
        const question = questions[questionIndex];
        const categories = question.categories ? question.categories : [];
        question.categories = [...categories, ''];
        questions[questionIndex] = question;
        setQuestions([...questions]);
    };

    const updateQuestion = async (e: React.MouseEvent<HTMLButtonElement>, questionIndex: number) => {
        try {
            e.preventDefault();

            const question = questions[questionIndex];

            const element = document.getElementById(`accordion-element-${questionIndex}`) as Document | null;
            if (!element) throw new Error('Could not find accordion element');

            let explanation = element.querySelector(`#question-${questionIndex}-explanation`) as HTMLTextAreaElement;
            if (explanation && explanation.value !== '') {
                explanation.value = explanation.value.trim();
            }

            let imageUrlQuestion = element.querySelector("#image-url-question") as HTMLInputElement;
            if (imageUrlQuestion && imageUrlQuestion.value !== '') {
                imageUrlQuestion.value = imageUrlQuestion.value.trim();
            }

            let imageUrlExplanation = element.querySelector("#image-url-explanation") as HTMLInputElement;
            if (imageUrlExplanation && imageUrlExplanation.value !== '') {
                imageUrlExplanation.value = imageUrlExplanation.value.trim();
            }

            let categories = element.querySelectorAll('input.question-category') as NodeListOf<HTMLInputElement>;
            if (categories?.length) {
                question.categories = Array.from(categories).map((category) => category.value.trim());
                question.categories = Array.from(new Set(question.categories));
            }

            if (question.options) {
                const questionTextElement = element.querySelector(`#question-${questionIndex}-text`) as HTMLInputElement;

                const updatedOptions = [];
                const updatedCorrectAnswer = [];
                const options = element.querySelectorAll('input.form-check-input.question-option') as NodeListOf<HTMLInputElement>;
                const labels = element.querySelectorAll('input.question-text') as NodeListOf<HTMLInputElement>;

                for (let i = 0; i < labels.length; i++) {
                    updatedOptions.push(labels[i].value);
                    if (options[i].checked) {
                        updatedCorrectAnswer.push(labels[i].value);
                    }
                }

                if (!updatedCorrectAnswer.length) {
                    setToastMessage({
                        message: 'Please select a correct answer',
                        type: 'error'
                    });
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
            } else {
                // get the new question text
                const questionTextElement = element.querySelector(`#question-${questionIndex}-text`) as HTMLInputElement;
                // get the new answer
                const answerElement = element.querySelector(`#question-${questionIndex}-answer`) as HTMLInputElement;

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

            setToastMessage({
                message: 'Question updated successfully!',
                type: 'success'
            });

        } catch (error) {
            console.error(error);
        }
    };

    const debouncedSearch = useDebounceCallback(() => {
        const searchText = (document.querySelector('input[type="text"]') as HTMLInputElement).value;

        if (!searchText || searchText.length < 3) {
            setQuestions(allQuestions);
            return;
        }

        const filteredQuestions = searchQuestions(questions, searchText);
        setQuestions(filteredQuestions);
    }, 300);

    const setup = async () => {
        try {
            await questionStore.setup()
            const questions = await questionStore.fetchAllItems() as QuestionType[];
            const uniqueCategories = getUniqueCategories(questions);
            setQuestions(questions)
            setAllQuestions(questions)
            setUniqueCategories(uniqueCategories)
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

    useEffect(() => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 3000);
        }
    }, [toastMessage]);

    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [showModal]);



    if (loading) return (<LoadingSpinner />);

    return (
        <div className='container pt-5'>
            <div className='pb-5'>
                <input type="text" className="form-control" placeholder="Search questions by text & categories ..." aria-label="Search questions by text & categories" aria-describedby="button-search" onKeyUp={debouncedSearch} />
            </div>
            <div className='pb-5 text-muted text-small'>
                Questions: {questions.length} of {questions.length}
            </div>
            <Accordion>
                {questions.map((question, index) => (
                    <AccordionItem title={question.questionText} key={question.id}>
                        <AddEditQuestion
                            index={index}
                            question={question}
                            addOption={addOption}
                            addCategory={addCategory}
                            removeOption={removeOption}
                            updateQuestion={updateQuestion}
                            removeCategory={removeCategory}
                            deleteQuestion={confirmQuestionDeletion}
                            uniqueCategories={uniqueCategories}
                        />
                    </AccordionItem>
                ))}
            </Accordion>
            {toastMessage && <ToastMessage message={toastMessage.message} type={toastMessage.type} />}
            {showModal && <Modal title='Delete Question' message='Are you sure you want to delete the question?' confirmAction={deleteQuestion} cancelAction={() => setShowModal(false)} />}
        </div>
    );
};

export default QuestionEditor;