/*
    Analytics wrapper used to log for content view
*/
import React, { Component } from 'react';
import UserSession from '../../utils/UserSession';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { crateAndUpdateCntSts, updateCntViewLog } from '../../store/actions/AnalyticsAction';
import AnalyticsService from '../../service/analytics-service';
import _ from "lodash";
class AnalyticsWrapper extends Component {
    constructor(props) {
        super(props);
        this.isStudent = UserSession.isStudent();
        this.archiveDtls = UserSession.getArchCrsDtls();
    }

    componentDidMount(){
        if(this.isStudent){
            // For archive course
            if(this.archiveDtls && _.isEmpty(this.archiveDtls)){
                // Set the current page content id in analytics service
                if(this.props.values && this.props.values.id){
                    AnalyticsService.setCntId(this.props.values.id);
                }
                // Set the current page subject id in analytics service
                if(this.props.location && this.props.location.state && this.props.location.state.subId){
                    AnalyticsService.setSubId(this.props.location.state.subId, this.props.location.state.AcYr, this.props.location.state.SemID);
                }
                this.props.crateAndUpdateCntSts();
            }
        }
    }

    // Update the out time for content view log when leaves the page/file/assignment
    componentWillUnmount(){
        if(this.isStudent){
            if(this.archiveDtls && _.isEmpty(this.archiveDtls)){ // For archive course
                this.props.updateCntViewLog();
                // Remove the current page content id in analytics service
                if(this.props.values && this.props.values.id){
                    AnalyticsService.rmvePageDetails();
                }
            }
        }
    }
    
    render(){
        return (
            <div>
            </div>
         )
    }
}

const mapStateToProps = (state) => ({
    ...state.analyticsReducer
 })
 const mapDispatchToProps = {
    crateAndUpdateCntSts,
    updateCntViewLog
 }

 const TabNavigator = (props) => <AnalyticsWrapper {...props} />
 
 const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)
 
 export default withTranslation()(withRouter(Components));