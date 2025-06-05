import React, { Component, lazy } from 'react';
import { withTranslation } from "react-i18next";
import AnalyticsService from '../service/analytics-service';
// import { connect } from 'react-redux';

const DetailsComponent =  lazy(() =>
import("../components/details-content/DetailsContent")
);
const AnalyticsWrapper = lazy(() =>
   import('../components/analytics-wrapper/AnalyticsWrapper')
);

export class ContentPageComponent extends Component {
    constructor(props){
        super(props);
        AnalyticsService.setCurrPage('CHAP_LIST');
    }
    render() {
        return (
            <div>
           
            <div class="row m-0">
               <div class="col p-0">
                  <DetailsComponent />
               </div>
            </div>
            <AnalyticsWrapper></AnalyticsWrapper>
         </div>
        )
    }
}

export default withTranslation()(ContentPageComponent);