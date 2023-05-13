let iframe = document.getElementById('contentoverlaycontainer');
let iframe_2 = iframe.children[0];
let iframe_3 = iframe_2.contentDocument.querySelector('iframe');
let content_frame = iframe_3.contentDocument.querySelectorAll("frameset")[2]
let content_frame_2 = content_frame.querySelector('frame[name="wbtframecontent"]');
let doc = content_frame_2.contentDocument;

function extractQuestionData(document) {

    const QUESTION_TEXT_ID = 'question_question_text';
    const ANSWER_ELEMENT_CLASS = '.' + 'answer';
    const ANSWER_ELEMENT_SELECTOR = 'div[id^="answer_text_"]'
    const CORRECT_ANSWER_SELECTOR = 'img[src="../sys/gfx/icon_success.png"]';
    const DESCRIPTION_ELEMENT_ID = 'question_beschreibungContainer';

    let questionObj = {
        questionText: "",
        correctAnswer: [],
        options: [],
        explanation: ""
    };

    // Extract question text
    let questionTextElement = document.getElementById(QUESTION_TEXT_ID);
    if (questionTextElement) {
        questionObj.questionText = questionTextElement.textContent;
    }

    // Extract answer options
    let answerElements = document.querySelectorAll(ANSWER_ELEMENT_CLASS);
    if (answerElements) {
        answerElements.forEach(function (answerElement) {
            let answerTextElement = answerElement.querySelector(ANSWER_ELEMENT_SELECTOR);
            if (answerTextElement) {
                questionObj.options.push(answerTextElement.textContent);
            }
        });
    }

    // Extract correct answers
    let correctAnswerElements = document.querySelectorAll(CORRECT_ANSWER_SELECTOR);
    if (correctAnswerElements) {
        correctAnswerElements.forEach(function (correctAnswerElement) {
            let answerRowElement = correctAnswerElement.closest(ANSWER_ELEMENT_CLASS);
            if (answerRowElement) {
                let correctAnswerTextElement = answerRowElement.querySelector(ANSWER_ELEMENT_SELECTOR);
                if (correctAnswerTextElement) {
                    questionObj.correctAnswer.push(correctAnswerTextElement.textContent);
                }
            }
        });
    }

    // Extract description text
    let descriptionElement = document.getElementById(DESCRIPTION_ELEMENT_ID);
    if (descriptionElement) {
        questionObj.explanation = descriptionElement.textContent;
    }

    console.log(JSON.stringify(questionObj));
}

extractQuestionData(doc)