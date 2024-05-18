import { QuestionType, ToastMessageProps } from '../types';
import React, { useEffect, useState } from 'react';
import { ToastMessage } from './ToastMessage';
import Modal from './Modal';
import { cloudSync } from "../cloudSync";
import { Store } from "../Store"

const FileUpload = () => {
    const questionStore = new Store('questions');
    const cardStore = new Store('cards');

    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<ToastMessageProps | null>(null);

    const createQuestions = (jsonData: any) => {
        try {
            if (!jsonData) throw new Error('No data found in file. Aborting...');

            jsonData.forEach((item: QuestionType) => {
                if (!item.questionText || !item.correctAnswer) {
                    alert('Please enter valid json data. Aborting...');
                    throw new Error('Invalid data found in file. Aborting...');
                }
            });

            let counter = 0;
            const newQuestions = jsonData.map((item: any) => {
                return {
                    id: counter++,
                    questionText: item.questionText,
                    correctAnswer: item.correctAnswer,
                    options: item.options || [],
                    explanation: item.explanation || null,
                    imageUrlQuestion: item.imageUrlQuestion || null,
                    imageUrlExplanation: item.imageUrlExplanation || null,
                    categories: item.categories || [],
                }
            })

            return newQuestions as QuestionType[];
        } catch (error) {
            console.error(error);
            setToastMessage({
                message: "Error uploading file. Please check console for more details.",
                type: 'error',
            });
            return null;
        }
    }

    const downloadItemAsJSON = () => {
        const stores = [questionStore, cardStore];
        stores.forEach((store) => {
            const items = store.fetchAllItems();
            const dataStr = JSON.stringify(items, null, 2);
            const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', store.storageKey + '.json');
            linkElement.click();
        });
    };

    const handleFileChange = (event: any) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        try {
            await questionStore.setup();
            await cardStore.setup();
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = async () => {
                    const file = selectedFile as any;
                    const name = file!.name!;

                    if (!name.includes('json')) {
                        setToastMessage({
                            message: "Invalid file type. Please upload a JSON file.",
                            type: 'error',
                        });
                        return;
                    }

                    const fileContent = reader.result as any;
                    let jsonData = JSON.parse(fileContent);
                    jsonData = jsonData.map((item: any) => {
                        if (item.questionText) {
                            item.questionText = item.questionText.replace(/↵/g, '\n\n');
                        }
                        if (item.explanation) {
                            item.explanation = item.explanation.replace(/↵/g, '\n\n');
                        }
                        return item;
                    });

                    if (name.includes('questions')) {
                        const newQuestions = createQuestions(jsonData);
                        if (newQuestions) {
                            cardStore.clear();
                            await questionStore.replaceItems(newQuestions);
                            setToastMessage({
                                message: "Questions uploaded successfully.",
                                type: 'success',
                            });
                            setShowModal(false);
                            const fileInput = document.getElementById('file-input') as HTMLInputElement;
                            fileInput.value = '';
                        }
                    }

                    if (name.includes('cards')) {
                        cardStore.clear();
                        await cardStore.replaceItems(jsonData);
                        setToastMessage({
                            message: "Progress data uploaded successfully.",
                            type: 'success',
                        });
                        setShowModal(false);
                        const fileInput = document.getElementById('file-input') as HTMLInputElement;
                        fileInput.value = '';
                    }
                };
                reader.readAsText(selectedFile);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setToastMessage(null);
        }, 5000);
    }, [toastMessage]);

    useEffect(() => {
        if (selectedFile) {
            const file = selectedFile as any;
            console.log({ file, name: file!.name! })
        }
    }, [selectedFile]);

    return (
        <>
            <p className='h5 pb-3' >Upload / Download Questions</p>
            <div className="row align-items-center">
                <div className="col-auto">
                    <input type="file" id="file-input" className="form-control" onChange={handleFileChange} />
                </div>
                <div className="col-auto">
                    <button className='btn btn-outline-secondary btn-sm my-4 my-sm-0' disabled={selectedFile ? false : true} onClick={() => setShowModal(true)}>Upload file</button>
                </div>
                <div className="col-auto">
                    <span className="form-text">
                        You can find a sample input file <a href="https://github.com/SaschaMet/Brain-Wave/blob/3f4bd383a6de66d59f63b7813bd04a8f65007ca2/__mock__/questions.json" target="_blank" rel="noreferrer">here</a>.
                    </span>
                </div>
            </div>
            <div className="col-auto mt-4">
                <button className='btn btn-outline-secondary btn-sm' onClick={downloadItemAsJSON}>Download questions and progress data</button>
            </div>
            {process.env.NEXT_PUBLIC_ISPRO && (
                <div className="col-auto mt-4 mb-5">
                    <button className="btn btn-outline-secondary" onClick={() => cloudSync()} >☁️ Cloud sync</button>
                </div>
            )}
            {toastMessage && <ToastMessage message={toastMessage.message} type={toastMessage.type} />}
            {showModal && <Modal title='Upload Question' message='Are you sure you want to upload this file? This will overwrite your current questions and reset your learning process.' confirmAction={handleUpload} cancelAction={() => setShowModal(false)} />}
        </>
    );
};

export default FileUpload;
