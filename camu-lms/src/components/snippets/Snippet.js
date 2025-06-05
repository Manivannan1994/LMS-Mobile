import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../../styles/_snippets.scss';
import Quiz from './Quiz';
import FlashCard from './FlashCard';
import ShortSnippets from './ShortSnippets';
import Loader from '../loader/Loader';

const Snippet = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chapId = queryParams.get('chapId');
  const subId = queryParams.get('subId');
  let exitState = location.state;
  const showTab = exitState?.showSnippet || 'quiz';
  const [activeTab, setActiveTab] = useState(showTab);
  const [showQuizData, setShowQuizData] = useState(null);
  const [showFlashData, setShowFlashData] = useState(null);
  const [showSnippetData, setShowSnippetData] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = '/camu_lms/get_file';

  const fetchData = async (reqData, setData) => {
    try {
      const response = await axios.post(apiUrl, reqData);
      setData(response.data);
    } catch (err) {
      console.error('Error occurred:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const oReqQuiz = { id: `${exitState?.InId}${exitState?.DeptID}${exitState?.subId}${chapId}${subId}-quiz`};

    const oReqFlash = { id: `${exitState?.InId}${exitState?.DeptID}${exitState?.subId}${chapId}${subId}-flashcard`};

    const oReqSnippets = { id: `${exitState?.InId}${exitState?.DeptID}${exitState?.subId}${chapId}${subId}-snippets`};

    if (activeTab === 'quiz') {
      fetchData(oReqQuiz, setShowQuizData);
    } else if (activeTab === 'flashCard') {
      fetchData(oReqFlash, setShowFlashData);
    } else if (activeTab === 'shortSnippets') {
      fetchData(oReqSnippets, setShowSnippetData)
    }

  }, [exitState, chapId, subId, activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const renderDetails = () => {
    if (loading) {
      return <Loader />;
    }

    switch (activeTab) {
      case 'quiz':
        return <Quiz questions={showQuizData} />;  
      case 'flashCard':
        return <FlashCard questions={showFlashData} />;
      case 'shortSnippets':
        return <ShortSnippets snippets={showSnippetData} />; 
      default:
        return null;
    }
  };

  return (
    <div>
      <div className='show-flex'>
        <div 
          className={`label-show ${activeTab === 'quiz' ? 'active' : ''}`} 
          onClick={() => handleTabClick('quiz')}
        >
          {t('translate:QUIZ_')}
        </div>
        <div 
          className={`label-show ${activeTab === 'flashCard' ? 'active' : ''}`} 
          onClick={() => handleTabClick('flashCard')}
        >
          {t('translate:FLASH_CARD')}
        </div>
        <div 
          className={`label-show ${activeTab === 'shortSnippets' ? 'active' : ''}`} 
          onClick={() => handleTabClick('shortSnippets')}
        >
          {t('translate:SHORT_SNIPPETS')}
        </div>
      </div>
      <div className='tab-content'>
        {renderDetails()}
      </div>
    </div>
  );
};

export default Snippet;
