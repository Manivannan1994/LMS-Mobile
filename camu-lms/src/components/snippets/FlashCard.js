import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft,ChevronRight} from 'react-feather';
import '../../styles/_flashCard.scss';
// import AutoRenew from '../../assets/images/autorenew.png';
import NotFoundData from './NotFoundData';

const FlashCard = ({ questions }) => {
    const { t } = useTranslation();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    // const [isShowReg, setIsShowReg] = useState(false);
    const [isShowFlip, setIsShowFlip] = useState(true);
    
    const currentQuestion = questions?.flipcards[currentQuestionIndex];
    const questionLength = questions?.flipcards?.length;

    const handleNext = () => {
        if (currentQuestionIndex < questionLength - 1) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
            }, 200);
        } else {
            // setIsShowReg(true);
            // setIsShowFlip(false);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
            }, 200);
        }
    };

    const questionClick = () => {
        setIsFlipped(!isFlipped); // Toggle flip state
    };

    // const handleRegenerate = () => {
    //     setCurrentQuestionIndex(0);
    //     setIsShowReg(false);
    //     setIsShowFlip(true);
    //     setIsFlipped(false); // Reset flip state
    // };

    return (
        <>
        {isShowFlip && questionLength > 0 && (
        <>
            <div className='flipcard-container'>
                <div className='slider-container'>
                    <div 
                        className='arrow-slider'
                        style={{ opacity: currentQuestionIndex === 0 ? 0.5 : 1, cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer'  }}
                        onClick={handlePrevious}
                    >
                        <ChevronLeft />
                    </div>
                </div>
                <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={questionClick}>
                    <div className='flip-card-inner'>
                        <div className='flip-card-front'>
                            <p>{currentQuestionIndex+1}{'. '}{currentQuestion?.question}</p>
                            <span>{t('translate:PRESS_TO_FLIP')}</span>
                        </div>
                        <div className='flip-card-back'>
                            <p><span className='answer'>Answer:</span> {currentQuestion?.answer}</p>
                        </div>
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
            <div className='flip-footer'>
                {currentQuestionIndex + 1}/{questionLength}
            </div>
        </>
        )}
        {!questionLength && (
            <NotFoundData tabContain={t('translate:FLASH_CARD')} />
        )}
        {/* {isShowReg && (
        <>
            <div className='auto-gen'>
                <img src={AutoRenew} alt='Auto Generate' />
            </div>
            <div className='auto-gen'>
                <button onClick={handleRegenerate}>Generate More</button>
            </div>
        </>
        )} */}
        </>
    );
};

export default FlashCard;
