import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/_shortsnippets.scss';
import { ChevronLeft,ChevronRight} from 'react-feather';
import Up from '../../assets/images/Up.svg';
import Down from '../../assets/images/Down.svg';
import NotFoundData from './NotFoundData';

const ShortSnippets = ({ snippets }) => {
    const { t } = useTranslation();
    const [state, setState] = useState({ currentSet: 0, position: 0, viewMode: 'brief' });

    const currentPage = snippets?.pages[state.currentSet];
    const currentSnippets = currentPage?.[state.viewMode] || [];
    const totalSets = currentSnippets.length;

    const handleNext = useCallback(() => {
        setState(prev => {
            const nextPosition = (prev.position + 1) % currentSnippets.length;
            return { ...prev, position: nextPosition };
        });
    }, [currentSnippets?.length]);

    const handlePrev = useCallback(() => {
        setState(prev => {
            const prevPosition = (prev.position - 1 + currentSnippets.length) % currentSnippets.length;
            return { ...prev, position: prevPosition };
        });
    }, [currentSnippets?.length]);

    const handleDown = useCallback(() => {
        setState(prev => {
            if (prev.currentSet < snippets.pages.length - 1) {
                return { ...prev, currentSet: prev.currentSet + 1, position: 0 };
            }
            return prev;
        });
    }, [snippets?.pages?.length]);

    const handleUp = useCallback(() => {
        setState(prev => {
            if (prev.currentSet > 0) {
                return { ...prev, currentSet: prev.currentSet - 1, position: 0 };
            }
            return prev;
        });
    }, []);

    // Add keyboard event listener
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                handleDown();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                handleUp();
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                handleNext();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleDown, handleUp, handleNext, handlePrev]);

    const currentSetClass = `bg-color-${state.currentSet % 3}`;

    return (
        <>
        {totalSets > 0 ? (
            <div className='snippet-container'>
                <div className='arrow-slider' onClick={handlePrev}>
                    <ChevronLeft />
                </div>
                <div className='snippet-show'>
                <div className={`${state.currentSet === 0 ? '' : 'pre-short_top'} ${currentSetClass}`}>
                    </div>
                    <div className={`short-container ${currentSetClass}`}>
                        <div className='indicator-container'>
                            {currentSnippets.map((_, index) => (
                                <div
                                    key={index}
                                    className={`indicator ${index === state.position ? 'active' : ''}`}
                                />
                            ))}
                        </div>
                        <div className='content-visibility'>
                            <p>{currentSnippets[state.position]?.topic}: {currentSnippets[state.position]?.content}</p>
                        </div>
                    </div>
                    <div className={`${state.currentSet < snippets.pages.length - 1 ? 'pre-short_bottom' : ''} ${currentSetClass}`}>
                    </div>
                </div>
                <div className='arrow-slider' onClick={handleNext}>
                    <ChevronRight />
                </div>
                <div className='up-down-container'>
                    <div 
                        className='up-arrow'
                        style={{ opacity: state.currentSet === 0 ? 0.5 : 1, cursor: state.currentSet === 0 ? 'not-allowed' : 'pointer' }}
                        onClick={handleUp}
                    >
                        <img src={Up} alt='up-arrow' />
                    </div>
                    <div 
                        className='down-arrow' 
                        style={{ opacity: state.currentSet === snippets.pages.length - 1 ? 0.5 : 1, cursor: state.currentSet === snippets.pages.length - 1 ? 'not-allowed' : 'pointer' }}
                        onClick={handleDown}
                    >    
                        <img src={Down} alt='down-arrow' />
                    </div>
                </div>
            </div>
        ) : (
            <NotFoundData tabContain={t('translate:SHORT_SNIPPETS')} />
        )}
        </>
    );
};

export default ShortSnippets;
