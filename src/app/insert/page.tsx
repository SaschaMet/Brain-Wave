"use client"

import React, { useEffect, useState } from 'react';
import { QuestionType, ToastMessageProps } from "../../types"
import { Store } from "../../Store"
import AddEditQuestion from '../../components/AddEditQuestion';
import { ToastMessage } from '../../components/ToastMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileUpload from '../../components/FileUploader';

const newQuestionTemplate = {
    questionText: '',
    correctAnswer: [],
    categories: [],
    id: -1,
};

const CreateNewQuestion = () => {
    const questionStore = new Store('questions');

    const [loading, setLoading] = useState<boolean>(false);
    const [newQuestion, setNewQuestion] = useState<QuestionType>(newQuestionTemplate);
    const [toastMessage, setToastMessage] = useState<ToastMessageProps | null>(null);

    const removeOption = (answerIndex: number) => {
        try {            
            const newOptions = newQuestion.options?.filter((option, index) => index !== answerIndex);
            if (newOptions?.length && newOptions.length >= 2) {
                newQuestion.options = newOptions;
                setNewQuestion({...newQuestion});                
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

    const removeCategory = (category: string) => {
        try {
            const newCategories = newQuestion.categories?.filter((cat) => cat !== category);
            newQuestion.categories = newCategories;
            setNewQuestion({...newQuestion});  
        } catch (error) {
            console.error(error);
        }
    };

    const addOption = () => {
        const options = newQuestion.options ? newQuestion.options : [];
        newQuestion.options = [...options, ''];
        setNewQuestion({...newQuestion});  
    };

    const addCategory = () => {
        const categories = newQuestion.categories ? newQuestion.categories : [];
        newQuestion.categories = [...categories, ''];
        setNewQuestion({...newQuestion});  
    };

    const updateQuestion = async (e: React.MouseEvent<HTMLButtonElement>) => {
        try {
            e.preventDefault();
            
            await questionStore.setup();
            const questions = await questionStore.fetchAllItems() as QuestionType[]
            
            const element = document.getElementById("accordion-element-1") as HTMLDivElement;
            const isMultipleChoice = document.getElementById("isMultipleChoiceSwitch") as HTMLInputElement;

            const question = document.getElementById("question-1-text") as HTMLInputElement;
            if (question && question.value === '') {
                setToastMessage({
                    message: 'A question must have text!',
                    type: 'error'
                });
                return;
            }

            let explanation = element.querySelector(`#question-1-explanation`) as HTMLTextAreaElement;
            if (explanation && explanation.value !== ''){
                explanation.value = explanation.value.trim();
            }

            let imageUrlQuestion = element.querySelector("#image-url-question") as HTMLInputElement;
            if (imageUrlQuestion && imageUrlQuestion.value !== ''){
                imageUrlQuestion.value = imageUrlQuestion.value.trim();
            }
    
            let imageUrlExplanation = element.querySelector("#image-url-explanation") as HTMLInputElement;
            if (imageUrlExplanation && imageUrlExplanation.value !== ''){
                imageUrlExplanation.value = imageUrlExplanation.value.trim();
            }

            let categories = [] as string[];
            let categoryElements = element.querySelectorAll('input.question-category') as NodeListOf<HTMLInputElement>;
            if (categoryElements?.length) {
                categories = Array.from(categoryElements).map((category) => category.value.trim());
                categories = Array.from(new Set(categories));
            }

            const updatedQuestion = {
                id: questions.length + 1,
                categories,
                correctAnswer : [],
                questionText: question.value,
                explanation: explanation.value === '' ? "" : explanation.value,
                imageUrlQuestion: imageUrlQuestion.value === '' ? "" : imageUrlQuestion.value,
                imageUrlExplanation: imageUrlExplanation.value === '' ? "" : imageUrlExplanation.value,
            } as QuestionType;

            if (isMultipleChoice.checked) {
                const newOptions = [];
                const newCorrectAnswers = [];
                const options = element.querySelectorAll('input.form-check-input.question-option') as NodeListOf<HTMLInputElement>;
                const labels = element.querySelectorAll('input.question-text') as NodeListOf<HTMLInputElement>;

                for (let i = 0; i < labels.length; i++) {
                    newOptions.push(labels[i].value);
                    if (options[i].checked) {
                        newCorrectAnswers.push(labels[i].value);
                    }
                }

                if (newOptions.length < 2) {
                    setToastMessage({
                        message: 'A question must have at least two options',
                        type: 'error'
                    });
                    return;
                }

                if (!newCorrectAnswers.length) {
                    setToastMessage({
                        message: 'Please select a correct answer', 
                        type: 'error'
                    });
                    return;
                }

                updatedQuestion.options = newOptions;
                updatedQuestion.correctAnswer = newCorrectAnswers;

            } else {
                const correctAnswer = element.querySelector(`#question-1-answer`) as HTMLInputElement;
                if (correctAnswer && correctAnswer.value !== '') {
                    updatedQuestion.correctAnswer = [correctAnswer.value.trim()];
                } else {
                    setToastMessage({
                        message: 'A question must have an answer!',
                        type: 'error'
                    });
                    return;
                }
            }

            questions.push(updatedQuestion);
            questionStore.replaceItems(questions);

            setLoading(true);
            setTimeout(() => {
                setNewQuestion(newQuestionTemplate);
                setLoading(false);
            }, 350);

            setToastMessage({
                message: 'Added Question successfully!', 
                type: 'success'
            });

        } catch (error) {
            console.error(error);
        }
    };
    
    useEffect(() => {
        if (toastMessage) {
            setTimeout(() => {
                setToastMessage(null);
            }, 8000);
        }
    }, [toastMessage]);

    return (
        <div className='container'>
            {loading ? 
                <LoadingSpinner /> :
                <>
                    <AddEditQuestion 
                        question={newQuestion}
                        index={1}
                        removeOption={removeOption}
                        removeCategory={removeCategory}
                        addCategory={addCategory}
                        addOption={addOption}
                        updateQuestion={updateQuestion}
                        isNewQuestion={true}
                    />
                    <div className='mt-5'>
                        <hr />
                        <FileUpload />
                    </div>
                </>
            }
            {toastMessage && <ToastMessage message={toastMessage.message} type={toastMessage.type} />}     
        </div>
    );

};

export default CreateNewQuestion;
