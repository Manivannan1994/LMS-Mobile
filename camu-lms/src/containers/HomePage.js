import React, { Component, lazy, Suspense } from "react";
import "../styles/_homepageStyle.scss";
import "../styles/_alertStyle.scss";
import "../styles/_toasterStyle.scss";
import loader from '../assets/images/loader.svg';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import {
  BrowserRouter as Router,
  Route,withRouter
} from "react-router-dom";
// import { connect } from "react-redux";
import UserSession from "../utils/UserSession";
import { AlertTriangle } from 'react-feather';
// import ChapterInfoComponent from "../components/chapter-info/ChapterInfo";

const HeaderComponent = lazy(() => import("../components/header/Header"));
const SchedulePageComponent = lazy(() => import("./schedulePage"));
const RubricsPageComponent = lazy(() => import("./RubricsPage"));
const RubricsCreateComponent = lazy(() => import("./RubricsCreate"));
const ScormFileComponent = lazy(() => import("./ScormFile"));
const ScormAddFileComponent = lazy(() => import("./ScormAddFile"));
const ScormViewComponent = lazy(() => import("./ScormView"));
const RubricsListViewComponent = lazy(() => import("./RubricsListView"));
const PlagiarismDetectionComponent = lazy(() => import("./PlagiarismDetection"));
const ExternalToolPage = lazy(() => import("./ExternalDetctTool"));
const LeftMenuComponent = lazy(() =>
  import("../components/left-menu/LeftMenu")
);
const InfoContentPageComponent = lazy(() => import("./InfocontentPage"));
// const TableListComponent = lazy(() => import("../containers/TablelistPage"));
const CalendarListComponent = lazy(() =>
  import("../components/calendar/Calendarlist")
);
const ContentPageComponent = lazy(() => import("./ContentPage"));
// const InfoBannerComponent = lazy(() =>
//   import("../components/banner/Infobanner")
// );
// const MessageComponent = lazy(() => import("./MessagePage"));
const EditContentComponent = lazy(() =>
  import("../components/edit-content/EditContent")
);
const ContentViewComponent = lazy(() =>
  import("../components/content-viewer/Contentviewer")
);
const FileUploadComponent = lazy(() =>
  import("../components/file-uploader/FileUploader")
);
const FilesViewComponent = lazy(() =>
  import("../components/file-viewer/FileViewer")
);
const ModelBarComponent = lazy(() => import("../components/modelbar/Modelbar"));
const AssignmentContentComponent = lazy(() =>
  import("../components/assignment-content/AssignmentContent")
);
const AssignmentViewComponent = lazy(() =>
  import("../components/assignment-viewer/AssignmentView")
);
const AssignmentListComponent = lazy(() =>
  import("../components/assignment-list/AssignmentList")
);
// const ScheduleListComponent = lazy(() =>
//   import("../components/schedule-list/ScheduleList")
// );
const DiscussionsListComponent = lazy(() =>
  import("../components/discussions-list/DiscussionsList")
);
const StudentAssignmentListComponent = lazy(() =>
  import("../components/assignmentlist-student/StudentAssignmentList")
);
const AssignmentSubmissionComponent = lazy(() =>
  import("../components/assignment-submission/AssignmentSubmission")
);
const StudentGradeBookComponent = lazy(() =>
  import("../components/student-gradebook/StudentGradeBook")
);
const StudentGradeViewComponent = lazy(() =>
  import("../components/student-gradeview/StudentGradeView")
);
const StudentGradeBookListComponent = lazy(() =>
  import("../components/student-gradebooklist/StudentGradeBookList")
);
const GradeAssignmentViewComponent = lazy(() =>
  import("../components/grade-assignmentview/GradeAssignmentView")
);
const CourseSettingComponent = lazy(() =>
  import("../components/course-setting/CourseSetting")
);
const AnalyticsComponent = lazy(() =>
  import("../components/analytics/Analytics")
);
const FreeFormComponent = lazy(() =>
  import("../components/free-form/FreeForm")
);
const PrerequestForm = lazy(() =>
  import("../components/ prerequest-form/PrerequestForm")
);
const ChapterInfoComponent = lazy(() =>
import("../components/chapter-info/ChapterInfo")
);
const QuizContentComponent = lazy(() =>
import("../components/quiz-content/QuizContent")
);
const QuizCreationComponent = lazy(() =>
import("../components/quiz-creation/QuizCreation")
);
const QuizListComponent = lazy(() =>
import("../components/quiz-list/QuizList")
);
const RubricsListComponent = lazy(() =>
import("../components/rubrics-list/RubricsList")
);
const RubricsViewComponent = lazy(() =>
import("../components/rubrics-view/RubricsView")
);
const RubricsEditComponent = lazy(() =>
import("../components/rubrics-edit/RubricsEdit")
);
const ParticipantsListComponent = lazy(() =>
import("../components/Participants-list/ParticipantsList")
);
const ImportContentComponent = lazy(()=>
import("../components/import-content/ImportContent")
);
const ExportContentComponent = lazy(()=>
import("../components/export-content/exportContent")
);
const NotificationComponent = lazy(()=>
import("../components/notifications/Notifications")
);

const CourseMessages = lazy(()=>
import("../components/course-messages/CourseMessages")
);
const ReportsViewPageComponent = lazy(()=>
import("../components/reports-view/ReportsView")
);

const NewMessageModal = lazy(()=>
import("../components/course-messages/NewMessageModal")
);


class HomePage extends Component {
  render() {
    return (
      <div>
        <Router basename="/lms#">
          <Suspense fallback={<div className="loader-content">
            {/* {i18next.t("translate:LOADING")}sdfsdf */}
            <img src={loader} alt="img"/>
            </div>}>
            <div className="fixed-header">
              <HeaderComponent />
            </div>
            <div>
              <ModelBarComponent />
            </div>
            {/* <div>
              <NewMessageModal />
            </div> */}
            <div className="fixed-content_box">
              <div className="fixed-list_content">
                <LeftMenuComponent />
              </div>
              <div className="fixed-page_content">
                {this.props.isArcCrsFrStaff &&
                  < div className="course-alert">
                    <p className="course-alert_label"> <span><AlertTriangle className="svg-icon_small icon-alert icon-space_left" /></span>{UserSession.isStaff() ?  this.props.t("translate:COURSE_ARCHIVE_MSG_STAFF")  : this.props.t("translate:COURSE_ARCHIVE_MSG_STUDENT")}</p>
                  </div>
                }
                <Route
                  path="/Schedule-page"
                  component={SchedulePageComponent}
                />
                <Route
                  path="/home-page/content-page"
                  exact
                  component={ContentPageComponent}
                />
                {/* <Route path="/home-page/schedule-page" component={ScheduleListComponent} /> */}
                <Route
                  path="/home-page/schedule-page"
                  component={SchedulePageComponent}
                />
                <Route
                  path="/home-page/infocontent-page"
                  component={InfoContentPageComponent}
                />
                <Route
                  path="/home-page/tablelist-page"
                  component={StudentGradeBookComponent}
                />
                {/* <Route path="/home-page/tablelist-page" component={StudentGradeViewComponent} /> */}

                <Route
                  path="/home-page/calenderlist-page"
                  component={CalendarListComponent}
                />
                <Route
                  path="/home-page/assignment-list"
                  component={
                    UserSession.isStaff()
                      ? AssignmentListComponent
                      : StudentAssignmentListComponent
                  }
                />
                {/* <Route path="/home-page/assignment-list" component={StudentAssignmentListComponent} /> */}
                <Route
                  path="/home-page/assignment-submission"
                  component={AssignmentSubmissionComponent}
                />
                <Route
                  path="/home-page/discussions-page"
                  component={DiscussionsListComponent}
                />
                <Route
                  path="/home-page/pages"
                  component={EditContentComponent}
                />
                <Route
                  path="/home-page/page-content"
                  component={ContentViewComponent}
                />
                <Route
                  path="/home-page/files-upload"
                  component={FileUploadComponent}
                />
                <Route
                  path="/home-page/files-view"
                  component={FilesViewComponent}
                />
                <Route
                  path="/home-page/assignment"
                  component={AssignmentContentComponent}
                />
                <Route
                  path="/home-page/assignment-view"
                  component={AssignmentViewComponent}
                />
                <Route
                  path="/home-page/assgnmnt-grad"
                  component={StudentGradeBookListComponent}
                />
                <Route
                  path="/home-page/assgnmnt-grad-view"
                  component={GradeAssignmentViewComponent}
                />
                <Route 
                  path="/home-page/student-grade" 
                  component={StudentGradeViewComponent} 
                />
                     <Route 
                  path="/home-page/course-setting" 
                  component={CourseSettingComponent} 
                />
                   <Route 
                  path="/home-page/analytics" 
                  component={AnalyticsComponent} 
                />
                       <Route 
                  path="/home-page/free-form" 
                  component={FreeFormComponent} 
                />
                <Route 
                  path="/home-page/prerequest-form" 
                  component={PrerequestForm} 
                />
                 <Route 
                  path="/home-page/chapter-info" 
                  component={ChapterInfoComponent} 
                />
                 <Route
                  path="/home-page/quiz-content"
                  component={QuizContentComponent}
                />
                  <Route
                  path="/home-page/quiz-creation"
                  component={QuizCreationComponent}
                />
                  <Route
                  path="/home-page/quiz-list"
                  component={QuizListComponent}
                />
                 <Route
                  path="/home-page/rubrics-list"
                  component={RubricsListComponent}
                />
                 <Route
                  path="/home-page/rubrics-view"
                  component={RubricsViewComponent}
                />
                 <Route
                  path="/home-page/rubrics-edit"
                  component={RubricsEditComponent}
                />

                <Route
                  path="/Rubrics-page"
                  component={RubricsPageComponent}
                />

                <Route
                  path="/Rubrics-create"
                  component={RubricsCreateComponent}
                />
                <Route
                  path="/scorm-File"
                  component={ScormFileComponent}
                />
                 <Route
                  path="/home-page/scorm-addfile"
                  component={ScormAddFileComponent}
                />
                <Route
                  path="/home-page/scorm-view"
                  component={ScormViewComponent}
                />

                <Route
                  path="/Rubrics-listview"
                  component={RubricsListViewComponent}
                />

                <Route
                  path="/home-page/participants-list"
                  component={ParticipantsListComponent}
                />
                <Route
                  path="/home-page/course-messages"
                  component={CourseMessages}
                />
                <Route
                  path="/home-page/import-content"
                  component={ImportContentComponent}
                />
                <Route
                  path="/home-page/export-content"
                  component={ExportContentComponent}
                />
                <Route
                  path="/home-page/notification"
                  component={NotificationComponent}
                />
                    <Route
                  path="/home-page/reports-view"
                  component={ReportsViewPageComponent}
                />
                <Route
                  path="/plagiarismdetectioncomponent-file"
                  component={PlagiarismDetectionComponent}
                />
                <Route
                  path="/externaltoolpage-file"
                  component={ExternalToolPage}
                />
              </div>
            </div>
          </Suspense>
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state.headerReducer
});
const TabNavigator = (props) => <HomePage {...props} />


const Components = connect(mapStateToProps, null)(TabNavigator);

export default withTranslation()(withRouter(Components));
