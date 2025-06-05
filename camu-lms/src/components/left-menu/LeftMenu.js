import React, { Component } from "react";
import "../../styles/_listcontentStyle.scss";
import { NavLink} from "react-router-dom";
// import {
//   BookOpen,
//   Calendar,
//   MessageCircle,
//   User,
//   Watch,
//   Star,
//   UserCheck,
//   Folder,
//   Settings,
// } from "react-feather";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import StaffWrapper from "../staff-wrapper/StaffWrapper";
import StudentWrapper from "../student-wrapper/StudentWrapper";
import UserSession from '../../utils/UserSession'

class LeftMenuComponent extends Component {

  render() {
    const pathName = this.props.location.pathname;
    let schlState = this.props.location.state;
    if(schlState){
      schlState.isCrWsScdl = true; // key used to hide some of the details for overall-schedule
    }
    const oUserSession = UserSession.getSession();
    return (
      <div>
        <div className="dept-cont">
          <div className="dept-actionlist">
            <ul class="list-groups">
              <NavLink
                to={{
                  pathname: "/home-page/content-page",
                  state: this.props.location.state,
                }}
                className={
                  pathName === "/home-page/content-page" ||
                  pathName === "/home-page/assignment-view" ||
                  pathName === "/home-page/page-content" ||
                  pathName === "/home-page/files-view" ||
                  pathName === "/home-page/pages" ||
                  pathName === "/home-page/files-upload" ||
                  pathName === "/home-page/assignment" ||
                  pathName === "/home-page/assignment-submission" ||
                  pathName === "/home-page/chapter-info" ||
                  pathName === "/home-page/scorm-view" ||
                  pathName === "/home-page/prerequest-form" || pathName === "/home-page/import-content"
                    ? "selected"
                    : ""
                }
              >
                <li className="list-item">
                  {this.props.t("translate:CONTENT")}
                </li>
              </NavLink>
              <NavLink
                to={{ pathname: "/home-page/schedule-page", state: schlState }}
                className={
                  pathName === "/home-page/schedule-page" ? "selected" : ""
                }
              >
                <li class="list-item">{this.props.t("translate:SCHEDULES")}</li>
              </NavLink>
              {/* <NavLink to={{pathname:"/home-page/infocontent-page", state:this.props.location.state}} activeClassName="selected">
                    <li class="list-item">
                       {this.props.t("translate:MESSAGES")}
                    </li>
                 </NavLink> */}

              <NavLink
                to={{
                  pathname: "/home-page/assignment-list",
                  state: this.props.location.state,
                }}
                className={
                     pathName === "/home-page/assignment-list"  ? "selected" : ""
                }
              >
                <li class="list-item">
                  {this.props.t("translate:ASSIGNMENTS")}
                </li>
              </NavLink>

              <NavLink
                  to={{
                    pathname: "/home-page/quiz-list",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/quiz-creation" || pathName ==="/home-page/quiz-list" || pathName ==="/home-page/quiz-content"? "selected" : ""
                  }
                >
                  <li class="list-item">
                    {this.props.t("translate:QUIZZES")}
                  </li>
                </NavLink>


                <StaffWrapper>
                  <NavLink
                    to={{
                      pathname: "/home-page/rubrics-list",
                      state: this.props.location.state,
                    }}
                    className={
                      pathName === "/home-page/rubrics-list" || pathName === "/home-page/rubrics-view" || pathName ==="/home-page/rubrics-edit" ? "selected" : ""
                    }
                  >
                    <li class="list-item">
                    Rubrics
                    </li>
                  </NavLink>
                </StaffWrapper>

              <StaffWrapper>
              <NavLink
                to={{
                  pathname: "/home-page/tablelist-page",
                  state: this.props.location.state,
                }}
                className={
                  pathName === "/home-page/tablelist-page" || pathName === "/home-page/assgnmnt-grad" || pathName ==="/home-page/assgnmnt-grad-view" || pathName ==="/home-page/student-grade"  ? "selected" : ""
                }
              >
                <li class="list-item">{this.props.t("translate:GRADEBOOK")}</li>
              </NavLink>
              </StaffWrapper>
              <StudentWrapper>
                {oUserSession && oUserSession.stuId &&
                  <NavLink
                    to={{
                      pathname: "/home-page/student-grade",
                      state: this.props.location.state,
                      search:`?stuId=${oUserSession.stuId}`
                    }}
                    className={
                      pathName === "/home-page/tablelist-page" || pathName === "/home-page/assgnmnt-grad" || pathName ==="/home-page/assgnmnt-grad-view" || pathName ==="/home-page/student-grade" ? "selected" : ""
                    }
                  >
                    <li class="list-item">{this.props.t("translate:GRADEBOOK")}</li>
                  </NavLink>
                }
              </StudentWrapper>
              {/* <li class="list-item">
                <a
                  target="_blank"
                  href="http://www.portaldemo.camuerp.in/#/home/feed/assessments"
                  rel="noreferrer" >
                  {this.props.t("translate:QUIZZES")}
                </a>
              </li> */}

              {/* <StaffWrapper>
                <NavLink
                  to={{
                    pathname: "/home-page/analytics",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/analytics" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                  Analytics
                  </li>
                </NavLink>
              </StaffWrapper> */}
              <StaffWrapper>
                <NavLink
                  to={{
                    pathname: "/home-page/participants-list",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/participants-list" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                  {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_PARTICIPANTS")}
                  </li>
                </NavLink>
              </StaffWrapper>
              {
                // SHOW THE MESSAGE FEATURE ONLY TO LECTURER STAFF TYPE AND STUDENTS
                ((this.props.location.state && this.props.location.state.stfTyp === "LECT") || (oUserSession && oUserSession.utype && oUserSession.utype === "student")) &&
                <NavLink
                  to={{
                    pathname: "/home-page/course-messages",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/course-messages" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                  {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_MESSAGES")}
                  </li>
                </NavLink>
              }
              <StaffWrapper>
                <NavLink
                  to={{
                    pathname: "/home-page/course-setting",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName ===  "/home-page/course-setting" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                    {this.props.t("translate:SETTING")}
                  </li>
                </NavLink>
              </StaffWrapper>

              <StaffWrapper>
                <NavLink
                  to={{
                    pathname: "/home-page/notification",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/notification" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                    Notifications
                  </li>
                </NavLink>
              </StaffWrapper>
           
              {/* <StaffWrapper> */}
            

           
              

                {/* <NavLink
                  to={{
                    pathname: "/home-page/rubrics-view",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/rubrics-view" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                  Rubrics view
                  </li>
                </NavLink> */}

                {/* <NavLink
                  to={{
                    pathname: "/home-page/rubrics-edit",
                    state: this.props.location.state,
                  }}
                  className={
                    pathName === "/home-page/rubrics-edit" ? "selected" : ""
                  }
                >
                  <li class="list-item">
                  Rubrics edit
                  </li>
                </NavLink> */}



              {/* </StaffWrapper> */}

              {/* <NavLink to={{pathname:"/home-page/discussions-page", state:this.props.location.state}} className={pathName ==="/home-page/discussions-page"  ? "selected":''}>
                    <li class="list-item">
                       {this.props.t("translate:DISCUSSION")}
                    </li>
                 </NavLink> */}
              {/* <li class="list-item">
                       {this.props.t("translate:QUIZZES")}
                    </li>
                 <li class="list-item">
                    {this.props.t("translate:STUDENTS")}
                 </li>
                 <li class="list-item">
                    {this.props.t("translate:ATTENDENCE")}
                 </li>
                 <li class="list-item">
                    {this.props.t("translate:FILES")}
                 </li>
                 <li class="list-item">
                    {this.props.t("translate:SETTING")}
                 </li> */}
                  <StaffWrapper>
                    <NavLink
                    to={{
                    pathname: "/home-page/reports-view",
                    state: this.props.location.state,
                    }}
                    className={
                    pathName === "/home-page/reports-view" ? "selected" : ""
                    }
                    >
                    <li class="list-item">
                    {this.props.t("translate:REPORTS")}
                    </li>
                    </NavLink>
                  </StaffWrapper>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  ...state.contentReducer,
  ...state.dashboardReducer,
});
// export default ListComponent;
//export default withTranslation()(ListComponent);
const TabNavigator = (props) => <LeftMenuComponent {...props} />;

const Components = connect(mapStateToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
