import React, { Component } from "react";
import "../../styles/_headerStyle.scss";
import Button from "../button/Button";
import { DownArrow, Menu,} from "../icons/Icons";
import userimg from "../../assets/images/user-profile.png";
import { withTranslation } from "react-i18next";
import { connect } from 'react-redux';
import {withRouter} from 'react-router-dom';
import { getSessionDtls, logout_LMS, devLogin, authenticateStudent, getArCrsSubConfiq } from '../../store/actions/HeaderAction';
import _ from 'lodash';
import helper from '../../utils/helper';
class HeaderComponent extends Component {
   // get the session details 
   componentDidMount() {
      // Get lms back url and lms state
      const lms_back_url = helper.localStorageGet('lms_back_url');
      const lms_state = helper.localStorageGet('lms_state');
      if(lms_back_url){
         localStorage.removeItem('lms_back_url');
         window.location = lms_back_url;
      }
      if (lms_state) {
         this.props.location.state = lms_state;
         // localStorage.removeItem('lms_state');
      }
      //first check for student login auth token else proceed to staff
      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      if(params["auth-token"] && params["auth-token"].length>0){//student
         this.props.authenticateStudent(params["auth-token"],(err, data)=>{
            if(data){
               this.props.getSessionDtls(this.isStudentSession);
            }
         });
      }else{//staff
         if(process.env.NODE_ENV === 'development' && params['dev_auth']){
            this.props.devLogin("v","1", ()=>{
               this.props.getSessionDtls(this.isStudentSession);
            });
         }else{
            this.props.getSessionDtls(this.isStudentSession);
         }
      }
      
   }
   // logOut LMS login 
   logOut = () => {
      this.props.logout_LMS()
   }

   isArchiveCrsFunction = () => {
      if(this.props.location.state && this.props.location.state.subId){
         let oReq = {
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            AcYr: this.props.location.state.AcYr,
            DeptID: this.props.location.state.DeptID,
            SemID: this.props.location.state.SemID,
            SecID: this.props.location.state.SecID,
            subjId: this.props.location.state.subId,
            isArchCrs:true,
            projct:{
               oAvCrsDls:1
            }
         };
         this.props.getArCrsSubConfiq(oReq);
      }
   }
   isStudentSession = (isStudentSession) => {
      if(isStudentSession){
         this.isArchiveCrsFunction();
      }else {
         this.isArchiveCrsFunction();
      }
   }
   
   render() {
      const {session} = this.props;
      const headerData=this.props.location.state;
      return (
         <div className="header-nav">
            <div className="dept-name">
               {headerData && !_.isEmpty(headerData) ? (
                  <div className="sub-infocontent">
                     <div className="menu-toggle">
                        <Menu iconStyle="svg-icon_small icon-secondary" />
                     </div>
                     <div className="user-info">
                        <h6>{headerData.subNa}</h6>
                        <p>{headerData.SemName} <span class="dots-icon"></span> {headerData.AcYrNm} <span class="dots-icon"></span> {headerData.CrName} <span class="dots-icon"></span> {headerData.SecName}</p>
                     </div>
                  </div>
               ) : (
                  <div>
                     <h6> {this.props.t("translate:HEADERCOMPONENT_All_COURSES")} </h6>
                     <p>{session.orgname}</p>
                  </div>
               )
               }
            </div>

            <div className="manual-setting">
               {/* <i class="question-icons">
                  <QuestionCircle iconStyle="svg-icon_small icon-default" />
               </i> */}
               {/* className="expand-box"  */}
               <div className="select-stud_view">
                  <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                     {/* {session && session.imageUrl ? <img src={'/Image/getImage/' + session.imageUrl} className="user-imgs" /> : <img src={userimg} className="user-imgs" />} */}
                     {session && session.imageUrl ? <img src={session?.camuURL+'/Image/getImage/' + session.imageUrl} className="user-imgs" alt="img" /> : <img src={userimg} className="user-imgs" alt="img" />}
                     <Button theme="btn-rounded btn-transparent" >
                        <span className="staff-name">{session.uname}</span>
                        <DownArrow iconStyle="svg-icon_small" />
                     </Button>
                  </div>
                  <div class="dropdown-menu user-info_dropdown">
                     {/* <a class="dropdown-item user-information" >
                        {this.props.t("translate:HEADERCOMPONENT_ENTER_STUDENT_PREVIEW_MODE")}
                     </a>
                     <a class="dropdown-item user-information">
                        {this.props.t("translate:HEADERCOMPONENT_ACCOUNT_SETTINGS")}
                     </a> */}
                     <div class="dropdown-item user-information" onClick={this.logOut}>
                        {this.props.t("translate:HEADERCOMPONENT_LOG_OUT")}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
const mapStateToProps = (state) => ({
   ...state.headerReducer,
   ...state.dashboardReducer,
   ...state.contentReducer

})

const mapDispatchToProps = {
   getSessionDtls,
   logout_LMS,
   devLogin,
   authenticateStudent,
   getArCrsSubConfiq
}

const TabNavigator = (props) => <HeaderComponent {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));
