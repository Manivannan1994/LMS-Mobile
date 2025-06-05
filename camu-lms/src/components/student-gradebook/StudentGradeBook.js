import React, { Component, lazy } from 'react';
import '../../styles/_studentGradeBookStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import {Upload,Download,MoreVertical} from 'react-feather';
import messageUtil from '../../utils/message-util';
import _ from 'lodash';
import { publshTrnscrptLMS } from '../../store/actions/GradeBookActions';

const StudentTablesComponent = lazy(() =>
   import('../student-tables/StudentTables')
);
const StudentGradesComponent = lazy(()=>
import('../student-grades/StudentGrades')
);

const UIPerWrapper = lazy(() =>
   import('../ui-per-wrapper/UIPerWrapper')
);
const Button = lazy(() =>
import('../button/Button')
);


class StudentGradeBookComponent extends Component {

   constructor(props) {
      super(props);

      this.state = {
         gradItms: 0,   // Show the count grade book items
         studGrd: false   // Initial state of students tab
      };
   }
   // Callback to get value from grade book item component
   gradeCallback = (grdItmLen) => {
      this.setState({ gradItms: grdItmLen })
   }

   // Publish trnascript from LMS subjectwise
   publishTranscriptFrmLMS = () => {
      if(this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
         
         const oTrnscrptReq = {
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            DeptID: this.props.location.state.DeptID,
            SemID: this.props.location.state.SemID,
            AcYr: this.props.location.state.AcYr,
            SecID: this.props.location.state.SecID,
            SubjId:this.props.location.state.subId,
         };

         const publshCallback = (err, data) => {
            if(data && data.output && data.output.data && data.output.data.code){
               if(data.output.data.code == "SUCCESS"){
                  messageUtil.showSuccess("TRANS_PUB_SUCCESS", true);
               }else if(data.output.data.code == "ALREADY_EXISTS"){
                  messageUtil.showWarning("REQ_ALRDY_EXISTS", true);
               }else if( data.output.data.code == "NO_SEM_CNFG"){
                  messageUtil.showError("NO_SEM_CNFG", true); // No sem  Configuration error
               }
            } else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         };

         // Publish transcript

         this.props.publshTrnscrptLMS(oTrnscrptReq, publshCallback);
      }else{
         console.log("NO_REQUEST_FOUND");
      }
   }

   render() {
      return (
         <div>
            <div className="student-grade_heading">
               <div className="cont-nav">
                  <div className="course-name">
                     <h6>{this.props.t("translate:GRAD_BOOK")}</h6>
                     <p>{this.props.t("translate:GRAD_BOOK_DESC")}</p>
                  </div>
                  <div className="manual-setting">

                     {/* <Button theme="btn-rounded secondary-btn">
                        {this.props.t("translate:ADVANCED_MODE")}
                     </Button>
                     <i class="grade-options_view">
                        <Download className="svg-icon_small icon-dark" />
                     </i>
                     <i class="grade-options_view">
                        <Upload className="svg-icon_small icon-dark" />
                     </i> */}
                     {!this.props.location.state?.isDisabledContent &&
                     <UIPerWrapper perCode={["rp_can_publsh_lms_trnscrpt"]}>
                        {
                           this.props.session && this.props.session.fe ?
                           <div className="view-option_cont">
                              <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                 <i class="grade-options_view">
                                    <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
                                 </i>
                              </div>
                              <div class="dropdown-menu grade-view_options">
                                 <div class="dropdown-item user-info_contents" onClick={()=>this.publishTranscriptFrmLMS()}>
                                    <span className="view-options_dropdown">{this.props.t("translate:PUBLISH_TRANSCRIPT")}</span>
                                 </div>
                              </div>
                           </div> : ''
                        }
                     </UIPerWrapper>
                     }
                  </div>
               </div>
            </div>
            <div class="project-tab">
               {/* {this.state.gradItms > 0 ? ( */}
                  <div class="student-grade_tabs">
                     <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                        <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">{this.props.t("translate:GRADABLE_ITEMS")} <span className={this.state.gradItms && this.state.gradItms > 0 ? "grade-notification" : 'grade-notification_noAssg'}>{this.state.gradItms && this.state.gradItms > 0 ? this.state.gradItms : ''}</span></a>
                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={() => this.setState({ studGrd: true })}>{this.props.t("translate:STUDENT")}</a>
                        {/* <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#tab-3" role="tab"  aria-selected="false">Coaching class (9)</a> */}
                     </div>
                  </div>
               {/* ) : ''} */}
               <div class="tab-content student-grade_content" id="nav-tabContent">
                  <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                     <StudentGradesComponent gradItmCompCallback={this.gradeCallback} />
                  </div>
                  {this.state.studGrd &&
                     <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                        <StudentTablesComponent />
                     </div>
                  }
                  {/* <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-contact-tab">
                     <p>content 3</p>
                  </div> */}
               </div>
            </div>
         </div>
      )
   }

}

// To get the reducers values
const mapStateToProps = (state) => ({
   ...state.gradeBookReducer,
   ...state.headerReducer
});

const mapDispatchToProps = {
   publshTrnscrptLMS
};

const TabNavigator = (props) => <StudentGradeBookComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));