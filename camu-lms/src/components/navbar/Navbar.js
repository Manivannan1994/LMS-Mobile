import React, { Component } from 'react';
import SvgLogo from '../../assets/images/logo.svg';
import '../../styles/_navbarStyle.scss';
import { NavLink } from "react-router-dom";
import { Book, Calendar, Folder ,Columns, Tool } from 'react-feather';
import i18next from "i18next";
import {withRouter} from 'react-router-dom';
import {Portal} from '../icons/Icons'
import helper from '../../utils/helper';
import UserSession from '../../utils/UserSession';
import _ from 'lodash';
 class NavbarComponent extends Component {
   /* Redirect to portal */
   redirectToPortal = ()=>{
      // Set lms back url in localstorage
      helper.localStorageSet("lms_back_url", window.location.href);
      // Set lms state in localstorage
      if (this.props.location.state && !_.isEmpty(this.props.location.state)) {
         helper.localStorageSet("lms_state", this.props.location.state);
      }
      if(helper.localStorageGet("portal_back_url")){
         window.location.assign(decodeURIComponent(helper.localStorageGet("portal_back_url")));
      }else{
         if(UserSession.isStaff){//staff portal home page
            window.location.assign(window.location.origin);
         }
      }
   }
    // Clear state value in localstorage
    clearLmsState = () =>{
      localStorage.removeItem("lms_state");
    }

    render() {
      const pathName = this.props.location.pathname;
      return (
         <nav className="sidenav ">
         <div className="camu-logo">
            <img src={SvgLogo} alt="camu-logo"/>
         </div>
         <ul className="nav nav-pills">
         <li className="tooltip--right_nav" data-tooltip={i18next.t("translate:MY_COURSES")}>
               <NavLink to="/dashboard-page" onClick={()=>this.clearLmsState()}
                 className={pathName ==='/dashboard-page' ||
                 pathName ==='/home-page/content-page' || 
                 pathName ==='/lms'|| pathName ==='/home-page/schedule-page' || 
                 pathName ==="/home-page/assignment-list" || pathName ==="/home-page/tablelist-page" || pathName ==="/home-page/message-page" || 
                 pathName ==="/home-page/pages" ||  pathName ==="/home-page/page-content" || pathName ==="/home-page/files-view" || pathName ==="/home-page/assignment-view" ||
                 pathName ==="/home-page/files-upload" ||  pathName ==="/home-page/assignment" || pathName === "/home-page/assgnmnt-grad" || pathName ==='/home-page/assgnmnt-grad-view' ||
                 pathName ==="/home-page/student-grade" || pathName ==="/home-page/assignment-submission" || pathName ==="/home-page/course-setting" || pathName ==="/home-page/analytics" || 
                 pathName ==="/home-page/quiz-list"  || pathName ==="/home-page/quiz-creation" ||  pathName === "/home-page/chapter-info" ||
                 pathName === "/home-page/prerequest-form" || pathName === "/home-page/quiz-content" || pathName === "/home-page/rubrics-list" || pathName === "/home-page/rubrics-view" || 
                 pathName === "/home-page/rubrics-edit" || pathName === "/home-page/participants-list" || pathName === "/home-page/import-content" || pathName === "/home-page/PlagiarismDetectionComponent-File"                 ? "selected":''}>
                <Book className='main-menu_icon' />
               </NavLink>
            </li>
            <li className="tooltip--right_nav" data-tooltip={i18next.t("translate:MY_SCHEDULES")}>
            {/* My schedules */}
               <NavLink to="/Schedule-page" activeClassName="selected" onClick={()=>this.clearLmsState()}>
               <Calendar className='main-menu_icon' />
               </NavLink>
            </li>
            {UserSession.isGotPerm(["rubrics_admin"]) && (
            <li className="tooltip--right_nav" data-tooltip={i18next.t("translate:RUBRICS")}>
               {/* Rubrics */}
            <NavLink to="/Rubrics-page" activeClassName="selected" onClick={()=>this.clearLmsState()}>
               <Columns className='main-menu_icon' />
            </NavLink>
         </li>
          )} 
         {UserSession.isGotPerm(["lms_file_management"]) && (
            <li className="tooltip--right_nav" data-tooltip={i18next.t("translate:FILE")}>
                  <NavLink to="/scorm-File" activeClassName="selected" onClick={()=>this.clearLmsState()}>
                  < Folder  className='main-menu_icon' />
                  </NavLink>
            </li>
         )} 
         {UserSession.isGotPerm(["rp_lms_lti_integration"]) && (
            <li className="tooltip--right_nav" data-tooltip={i18next.t("translate:EXTERNAL_TOOL")}>
               {/* Plagiarism  */}
               <NavLink to="/plagiarismdetectioncomponent-file" activeClassName="selected" onClick={() => this.clearLmsState()}>
                  <Tool className='main-menu_icon' />
               </NavLink>
            </li>
         )}
            <li>
               <div activeClassName="selected" onClick={this.redirectToPortal} href="#">
               <Portal iconStyle='portal-menu_icon' />
               <p className="portal-url">Portal</p>
               </div>
            </li>
          
         </ul>
      </nav>
      )
   }
}

export default withRouter(NavbarComponent)