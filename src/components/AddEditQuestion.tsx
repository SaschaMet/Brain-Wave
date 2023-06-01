import { QuestionType } from '@/types';
import React from 'react';

interface AddEditQuestionProps {
    question: QuestionType;
    index: number;
    removeOption: (answerIndex: number, questionIndex: number) => void;
    removeCategory: (category: string, questionIndex: number) => void;
    addOption: (questionIndex: number) => void;
    addCategory: (questionIndex: number) => void;
    updateQuestion: (e: React.MouseEvent<HTMLButtonElement>, questionIndex: number) => void;
    deleteQuestion?: (questionIndex: number) => void;
    isNewQuestion?: boolean;
}

// create a function that returns false if every element in an array has a length of 0
const hasEmptyElements = (arr: string[]) => {
    return arr.every((element) => element.length === 0);
}

const AddEditQuestion = (props: AddEditQuestionProps)  => {

    const { question, index, removeOption, removeCategory, addCategory, addOption, updateQuestion, deleteQuestion, isNewQuestion } = props;
    const [isMultipleChoice, setIsMultipleChoice] = React.useState<boolean>(!hasEmptyElements(question.options || []));

    return (
        <div className='row' id={`accordion-element-${index}`}>
            <div className="mb-3 col-12">
                <label className="form-check-label text-muted text-small">
                    Question
                </label>
                <input type="text" className="form-control" id={`question-${index}-text`} placeholder="Question Text" defaultValue={question.questionText} />
                <br />
                <label className="form-check-label text-muted text-small">
                    Answer(s)
                </label>
                {isNewQuestion && (
                    <div className="form-check form-switch mb-2">
                        <input className="form-check-input switch-input" type="checkbox" role="switch" id="isMultipleChoiceSwitch" defaultChecked={isMultipleChoice} onChange={() => setIsMultipleChoice(!isMultipleChoice)} />
                        <label className="form-check-label text-small" htmlFor="isMultipleChoiceSwitch">Multiple choice question?</label>
                    </div>
                )}
                {isMultipleChoice && question.options && question.options.map((answer, answerIndex) => (
                    <div className="option-wrapper form-check d-flex justify-content-between align-content-between align-items-center flex-wrap py-1" key={`answer-${answer}-${answerIndex}`}>
                        <div className='col-10'>
                            <input className="form-check-input question-option mt-2" type="checkbox" name={`answer-${index}`} id={`answer-${index}-${answerIndex}`} defaultChecked={question.correctAnswer.includes(answer)} />
                            <input type='text' className="form-control question-text" defaultValue={answer} />
                        </div>
                        <div>
                            <button type="button" className="btn btn-outline-danger btn-sm ms-2" name={`answer-${index}-${answerIndex}`} onClick={() => removeOption(answerIndex, index)}>
                                ❌
                            </button>
                        </div>
                    </div>
                ))}
                
                {isMultipleChoice && (
                    <div className='mt-4 col text-center'>
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => addOption(index)}>
                            Add Option
                        </button>
                    </div>
                )}

                {isNewQuestion && !isMultipleChoice && (
                    <div>
                        <textarea className="form-control" rows={2} name={`answer-${index}`} id={`question-${index}-answer`} defaultValue={question.correctAnswer[0]} placeholder='The answer to the question is ...' />
                    </div>
                )}
                <br />
                <div>
                    <label className="form-check-label text-muted text-small">
                        Explanation - Optional
                    </label>                                     
                    <textarea className="form-control explanation" id={`question-${index}-explanation`} rows={3} placeholder="Further explain your answer" defaultValue={question.explanation} />
                </div>
                <div className='my-3'>
                    <label className="form-check-label text-muted text-small" htmlFor="image-url-question">
                        Image for Questions (Image will be shown together with the question) - Optional
                    </label>
                    <input className="form-control image-url" key="image-url-question" id="image-url-question" type="text" placeholder="https://www.image-url.com" defaultValue={question.imageUrlQuestion}/>
                </div>
                <div className='my-3'>
                    <label className="form-check-label text-muted text-small" htmlFor="image-url-explanation">
                        Image for Explanation (Image will be shown together with the explanation of a question) - Optional
                    </label>
                    <input className="form-control image-url" key="image-url-explanation" id="image-url-explanation" type="text" placeholder="https://www.image-url.com" defaultValue={question.imageUrlExplanation}/>
                </div>
                <div className='my-3 pt-2'>
                    <p className='text-muted text-small pb-0 mb-0'>Categories</p>
                    {question.categories && question.categories.map((category, categoryIndex) => (
                        <div className="option-wrapper d-flex justify-content-between align-content-between flex-wrap mb-1" key={`${category}-${categoryIndex}`} >
                            <div className='col'>                                                
                                <input type='text' className="form-control question-category" defaultValue={category} />
                            </div>
                            <div className='col'>
                                <button type="button" className="btn btn-outline-danger btn-sm ms-2 text-start" onClick={() => removeCategory(category, index)}>
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="btn btn-outline-secondary btn-sm mt-3" onClick={() => addCategory(index)}>
                        Add Category
                    </button>
                </div>
            </div>

            <div className='mt-4 col-12 col-sm-6'>
                <button type="button" className="btn btn-outline-success btn-sm" onClick={(e) => updateQuestion(e, index)}>
                    {isNewQuestion ? "Add New" : "Update"} Question
                </button>
            </div>
        
            {!isNewQuestion && deleteQuestion && (
                <div className='mt-4 col-12 col-sm-6 text-end'>
                    <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => deleteQuestion(index)}>
                        Delete Question
                    </button>
                </div>
            )}
        </div>
    )
};

export default AddEditQuestion;
