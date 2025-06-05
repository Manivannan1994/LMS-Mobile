import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/_notFoundData.scss';

const NotFoundData = ({tabContain}) => {

    const { t } = useTranslation();

    return (
        
        <div className='no-data-block'>
            <div className='no-data-container'>
                <h1>{t('translate:TRY_AGAIN_LATER')}</h1>
                <p>
                    {t('translate:CURRENTLY_WE_DONT_HAVE_ANY')} {tabContain} {t('translate:TO_SHOW')}
                </p>
            </div>
        </div>
    )
}

export default NotFoundData;