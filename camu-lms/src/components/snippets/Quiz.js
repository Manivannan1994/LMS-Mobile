import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/_quiz.scss';
import { ChevronLeft,ChevronRight} from 'react-feather';
// import AutoRenew from '../../assets/images/autorenew.png';
import Correct from '../../assets/images/check_circle.svg';
import Wrong from '../../assets/images/dangerous.svg';
import NotFoundData from './NotFoundData';

const Quiz = ({ questions }) => {
    const { t } = useTranslation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState(Array(questions?.questions?.length).fill(null));
    const [isAnswered, setIsAnswered] = useState(Array(questions?.questions?.length).fill(false));
    // const [isShowReg, setIsShowReg] = useState(false);
    const [showQuiz, setShowQuiz] = useState(true);

    const currentQuestion = questions?.questions[currentQuestionIndex];
    const questionLength = questions?.questions?.length;

    const handleOptionClick = (option) => {
        if (isAnswered[currentQuestionIndex]) return;

        const updatedSelectedOptions = [...selectedOptions];
        updatedSelectedOptions[currentQuestionIndex] = option;
        setSelectedOptions(updatedSelectedOptions);

        const updatedAnsweredStatus = [...isAnswered];
        updatedAnsweredStatus[currentQuestionIndex] = true;
        setIsAnswered(updatedAnsweredStatus);
    };

    const handleNext = () => {
        if(currentQuestionIndex < questionLength - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // setIsShowReg(true);
            // setShowQuiz(false);
        }
    };

    // const handleRegenerate = () => {
    //     setCurrentQuestionIndex(0);
    //     setSelectedOptions(Array(questions.questions?.length).fill(null));
    //     setIsAnswered(Array(questions.questions?.length).fill(false));
    //     setIsShowReg(false);
    //     setShowQuiz(true);
    // };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    return (
        <>
        {showQuiz &&  questionLength > 0 && (
            <>
            <div className='main-page'>
                <div className='slider-container'>
                    <div 
                        className='arrow-slider'
                        style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'  }}
                        onClick={handlePrevious}
                    >
                        <ChevronLeft />
                    </div>
                </div>
                <div className='question'>
                    <h1>{currentQuestionIndex + 1}{'. '}{currentQuestion?.question}</h1>
                    <div className='quiz-options-block'>
                        {currentQuestion?.options?.map((option, index) => {
                            let bgColor = '';
                            let brdr = '';
                            const selectedOption = selectedOptions[currentQuestionIndex];

                            if (isAnswered[currentQuestionIndex]) {
                                if (option === currentQuestion?.answer) {
                                    bgColor = '#E4F7EC';
                                    brdr = '1px solid #158444';
                                } else if (option === selectedOption) {
                                    bgColor = '#F9EAE9';
                                    brdr = '1px solid #E21D12';
                                }
                            } else if (option === selectedOption) {
                                bgColor = '#E0E0E0';
                            }

                            return (
                                <div
                                    key={index}
                                    className='quiz-option'
                                    style={{ backgroundColor: bgColor, border: brdr }}
                                    onClick={() => handleOptionClick(option)}
                                >
                                    {option}
                                    {isAnswered[currentQuestionIndex] && option === currentQuestion?.answer && (
                                        <img src={Correct} alt='correct-img' />
                                    )}
                                    {isAnswered[currentQuestionIndex] && option === selectedOption && option !== currentQuestion?.answer && (
                                        <img src={Wrong} alt='wrong-img' />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className='slider-container'>
                    <div 
                        className='arrow-slider'
                        style={{ opacity: currentQuestionIndex + 1 === questionLength ? 0.5 : 1, cursor: currentQuestionIndex + 1 === questionLength ? 'not-allowed' : 'pointer'  }}
                        onClick={handleNext}
                    >
                        <ChevronRight />
                    </div>
                </div>
            </div>
            <div className='quiz-footer'>
                {currentQuestionIndex + 1}/{questionLength}
            </div>
            </>
        )}
        {!questionLength && (
            <NotFoundData tabContain={t('translate:QUIZ_')} />
        )}
        {/* {isShowReg && (
        <>
            <div className='last-step'>
                <img src={AutoRenew} alt='Auto Generate' />
            </div>
            <div className='last-step'>
                <button onClick={handleRegenerate}>Generate More</button>
            </div>
        </>
        )} */}
        </>
    );
};

export default Quiz;
