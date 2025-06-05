import React ,{ Component ,lazy} from 'react';
import '../../styles/_studentGradeBookList.scss';
import '../../styles/_commonLmsStyle.scss';
// import { Message } from '../icons/Icons';
// import studImg from '../../assets/images/user-profile.png';
// import SearchBox from '../searchbox/Searchbox';
import {ArrowLeft} from 'react-feather';
// import InputBox from '../input-box/InputBox';
// import SelectControl from '../select-control/SelectControl';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { getAssgnmntDetails, getAssgnStuds, dwnldGradAsgnmnt, updateFields, getLastDwnldSubmsn, dwnlAssgnmntSubmsn } from '../../store/actions/GradeBookActions';
import {lmsDateFormat} from '../../utils/helper';
import _ from 'lodash';
import messageUtil from '../../utils/message-util';
import { MessageCircle,Upload,Download,MoreVertical,X } from 'react-feather';
import Alert from '../alertbox/Alert';
import Spinner from '../spinner/Spinner';
import GroupGradeList from '../group-gradelist/GroupGradeList';
const StudentGradeListComponent = lazy(()=>
import('../student-gradelist/StudentGradeList')
);
const Button = lazy(() =>
import('../button/Button')
);
class StudentGradeBookListComponent extends Component{

   constructor(props){
      super(props);
      let grpCallback = ''
      const asgnmntVal = queryString.parse(this.props.location.search)
      this.state = {
         frmtDt : '',
         grdKey : '',
         gradeType: 'ALL'
      }
      this.grdState = {
         asgnmntId : asgnmntVal.id,
         oAsgnReq : {}
      };
      this.props.updateFields('showDwnldState', true);
   }

   // Get last download assignment submissions

   downloadAsgnSub = () => {
      const asgnmntVal = queryString.parse(this.props.location.search)
      const oDwnldAsg = {
         asgnId : asgnmntVal.id
      };
      this.props.getLastDwnldSubmsn(oDwnldAsg);
   }
   setData = (gradeSelectData,title) => {
      gradeSelectData.title = title;
      this.props.updateFields('selectGradeDwnld',gradeSelectData);
  }
   // Callback function called from studentGradeList component

   StudCallback = (pageValues) => {
         this.downloadAsgnSub();
         this.grdState.oAsgnReq.asgnmntId = this.grdState.asgnmntId;
         this.grdState.oAsgnReq.InId = this.props.location.state.InId;
         this.grdState.oAsgnReq.PrID = this.props.location.state.PrID;
         this.grdState.oAsgnReq.CrID = this.props.location.state.CrID;
         this.grdState.oAsgnReq.AcYr = this.props.location.state.AcYr;
         this.grdState.oAsgnReq.DeptID = this.props.location.state.DeptID;
         this.grdState.oAsgnReq.SemID = this.props.location.state.SemID;
         this.grdState.oAsgnReq.SecID = this.props.location.state.SecID;
         this.grdState.oAsgnReq.subId = this.props.location.state.subId;
      if(pageValues.pageSize){
         this.grdState.oAsgnReq.pageSize = pageValues.pageSize;
      }
      if(pageValues.pageNo){
         this.grdState.oAsgnReq.pageNo = pageValues.pageNo;
      }
      if(pageValues.srchTerm){
         this.grdState.oAsgnReq.srchTerm = pageValues.srchTerm;
      }else{
         this.grdState.oAsgnReq.srchTerm = undefined;
      }
      // this.props.getAssgnmntDetails(this.grdState.oAsgnReq);
      this.props.getAssgnStuds(this.grdState.oAsgnReq);
      if(this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.asDuDt){
         this.props.oAsgnmntDtls.asDuDt = lmsDateFormat(this.props.oAsgnmntDtls.asDuDt);
         this.setState({frmtDt : this.props.oAsgnmntDtls.asDuDt});
      }
   }

   componentDidMount() {
      this.grdState.oAsgnReq.asgnmntId = this.grdState.asgnmntId;
         this.grdState.oAsgnReq.InId = this.props.location.state.InId;
         this.grdState.oAsgnReq.PrID = this.props.location.state.PrID;
         this.grdState.oAsgnReq.CrID = this.props.location.state.CrID;
         this.grdState.oAsgnReq.AcYr = this.props.location.state.AcYr;
         this.grdState.oAsgnReq.DeptID = this.props.location.state.DeptID;
         this.grdState.oAsgnReq.SemID = this.props.location.state.SemID;
         this.grdState.oAsgnReq.SecID = this.props.location.state.SecID;
         this.grdState.oAsgnReq.subId = this.props.location.state.subId;
      // this.props.getAssgnmntDetails(this.grdState.oAsgnReq);
      this.props.getAssgnStuds(this.grdState.oAsgnReq);
      if(this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.asDuDt){
         this.props.oAsgnmntDtls.asDuDt = lmsDateFormat(this.props.oAsgnmntDtls.asDuDt);
         this.setState({frmtDt : this.props.oAsgnmntDtls.asDuDt});
      }
   }
   
   // Download assignment submissions
   
   dwnldAssgnSubmsn = () => {
      const oLocValue = queryString.parse(this.props.location.search)
      if(oLocValue && oLocValue.id){
         const oRepReq = {
            asgnId : oLocValue.id
         };
         this.props.dwnlAssgnmntSubmsn(oRepReq);
      }else{
         messageUtil.showWarning("NO_REQUEST_FOUND", false);
      }
   }

   // Get assignments based on key
   getAssignments = (grdKey) =>{
      this.grdState.actTab = grdKey;
      this.grdState.oAsgnReq.grdKey = grdKey;
      this.setState({grdKey : this.grdState.oAsgnReq.grdKey});
      this.props.getAssgnStuds(this.grdState.oAsgnReq);
   }

   hideDwldState = () => {
      this.props.updateFields('showDwnldState', false);
   }

   goToPrev = () => {
      const asgnmntVal = queryString.parse(this.props.location.search)
      if(asgnmntVal.frmAsgn){
         // Go back to assignment page
         this.props.history.push({pathname:'/home-page/assignment-view',search:`?id=${asgnmntVal.id}&assgnmntView=${true}`,state:this.props.location.state});
      }else{
         // Go to Grade book page
         this.props.history.push({pathname:'/home-page/tablelist-page',state:this.props.location.state});
      }
   }


   render(){
      return(
         <div>
            <div className="student-grade_heading">
               <div className="cont-nav">
                  <div className="course-name stud-grade_heading">
                     <ArrowLeft className="svg-icon_default icon-default right-icon icon-pointer" onClick={()=> this.goToPrev()} />
                     {this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.title ? (
                        <div>
                           <h6>{this.props.t("translate:ASSIGNMENT")}: {this.props.oAsgnmntDtls.title}</h6>
                           <p className='asgnmt-cat_label'>{this.props.oAsgnmntDtls.asgnCatNam}</p>
                        </div>
                     ) : ''}
                  </div>
                  {!this.props.location.state?.isDisabledContent &&
                  <div className="manual-setting">
                     {/* <Button theme="btn-rounded secondary-btn ">
                        <MessageCircle className="svg-icon_small icon-dark icon-space_left"/>
                        Message students
                     </Button> */}
                     <i class="grade-options_view" data-toggle="modal" data-target="#grade-upload-page" onClick={()=>this.setData(this.props.selectGradeDwnld,`${this.props.oAsgnmntDtls.title}template`)}>
                        <Upload className="svg-icon_small icon-dark" />
                     </i>
                     <i class="grade-options_view" data-toggle="modal" data-target="#grade-page" onClick={()=>this.setData(this.props.selectGradeDwnld,this.props.oAsgnmntDtls.title )}>
                        <Download className="svg-icon_small icon-dark"/>
                     </i>
                     {/* <i class="grade-options_view">
                        <Upload className="svg-icon_small icon-dark" />
                     </i>
                     <i class="grade-options_view">
                        <MoreVertical className="svg-icon_small icon-dark" />
                     </i> */}
                  </div>
                  }
               </div>
            </div>
            {
               this.props.oLstSubDet && this.props.oLstSubDet.showHisState && 
                  <div className="alert alert-download_container" style={{ display: this.props.showDwnldState ? "block" : "none" }}>
                     {
                        this.props.oLstSubDet.hisStatSuc && 
                        <Alert alertTheme=" download-alert alert-default-bg">
                           <div className="submission-view_cont">
                              <div>
                                 {
                                    this.props.oLstSubDet.hisStatPend ? 
                                    <div className="cont-loader_view">
                                       <Spinner spinnerTheme="spinner-default"></Spinner>
                                       <div className="submission-label_cont">
                                          <p className="submission-head_cont">{this.props.t("translate:DWNLD_SUB_REP_HEADER")}</p>
                                          <p className="submission-sub_cont">{this.props.t("translate:DWNLD_SUB_REP_CONTENT")}</p>
                                       </div>
                                    </div>
                                    : 
                                    <div className="cont-loader_view">
                                       <div className="complete-download_icon">
                                          <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <circle cx="20" cy="20.5" r="18" fill="#0D9BE1" stroke="#0D9BE1" stroke-width="4"/>
                                             <path d="M28 15L17 26L12 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                          </svg>
                                       </div>
                                       <div className="submission-label_cont">
                                          <p className="submission-head_cont">{this.props.t("translate:DWNLD_SUB_REP_SUCCESS_HEADER")}</p>
                                          <p className="submission-sub_cont">{this.props.t("translate:DWNLD_SUB_REP_SUCCESS_CONTENT")}</p>
                                       </div>
                                    </div>
                                 }
                                 
                              </div>
                              {
                                 this.props.oLstSubDet.hisStatPend ?
                                 <div className="download-size_label" onClick={this.downloadAsgnSub}>
                                    {this.props.t("translate:REFRESH")}
                                 </div> 
                                    :
                                 <div className="close-view_modal">
                                    <div className="download-size_label">
                                       <a href={this.props.oLstSubDet.dwnldUrl}>
                                          {this.props.t("translate:DOWNLOAD")}
                                       </a>
                                    </div>
                                    <X className="svg-icon_small icon-dark icon-pointer" onClick={this.hideDwldState}/>
                                 </div>
                              }
                           </div>
                        </Alert>
                     }
                     {
                        !this.props.oLstSubDet.hisStatSuc && 
                        <Alert alertTheme=" download-alert alert-danger-bg">
                           <div className="submission-view_cont">
                              <div className="cont-loader_view">
                                 <div className="complete-download_icon">
                                    <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                       <circle cx="20" cy="20.5" r="18" fill="#F24B6B" stroke="#F24B6B" stroke-width="4"/>
                                       <path d="M15.86 11H24.14L30 16.86V25.14L24.14 31H15.86L10 25.14V16.86L15.86 11Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                       <path d="M20 17V21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                       <path d="M20 25H20.0099" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                 </div>
                                 <div className="submission-label_cont">
                                    <p className="submission-head_cont">{this.props.t("translate:CANT_DWNLD_SUBMSN")}</p>
                                    <p className="submission-sub_cont">{this.props.t("translate:PLEASE_TRY_AGAIN")}</p>
                                 </div>
                              </div>
                              <div className="close-view_modal">
                                 <div className="download-size_label" onClick={this.dwnldAssgnSubmsn}>
                                    {this.props.t("translate:RETRY")}
                                 </div>
                                 <X className="svg-icon_small icon-dark icon-pointer" onClick={this.hideDwldState}/>
                              </div>
                           </div>
                        </Alert>
                     }
               </div>
            }

            <div className="student-overall_grade">
               {this.props.oAsgnmntDtls && !_.isEmpty(this.props.oAsgnmntDtls) ? (
                  <div className="grade-views">
                     <div className="grade-view_list">
                        <p className="grade-view_header">{this.props.oAsgnmntDtls.submtPer}%<span>({this.props.oAsgnmntDtls.submtCnt}/{this.props.oAsgnmntDtls.totCnt})</span></p>
                        <p className="grade-view_cont">{this.props.t("translate:SUBMITTED")}</p>
                     </div>
                     <div className="grade-view_list">
                        <p className="grade-view_header">{this.props.oAsgnmntDtls.gradedPer}%<span>({this.props.oAsgnmntDtls.gradedCnt}/{this.props.oAsgnmntDtls.totCnt})</span></p>
                        <p className="grade-view_cont">{this.props.t("translate:GRADED")}</p>
                     </div>
                     <div className="grade-view_list">
                        <p className="grade-view_header">{this.props.oAsgnmntDtls.avgScrCnt}</p>
                        <p className="grade-view_cont">{this.props.t("translate:AVERAGE_GRADED_SCORE")}</p>
                     </div>
                     {/* <div className="grade-view_list">
                        <p className="grade-view_header">40<span>or higher</span></p>
                        <p className="grade-view_cont">To Pass</p>
                     </div> */}
                     <div className="grade-view_list">
                     {/* <span>12:00 AM</span> */}
                        <p className="grade-view_header">{this.props.oAsgnmntDtls.asDuDt ? lmsDateFormat(this.props.oAsgnmntDtls.asDuDt) : ''}</p>
                        <p className="grade-view_cont">{this.props.t("translate:GRAD_DUE_DATE")}</p>
                     </div>
                  </div>
               ) : ''}
               
            </div>
            <div class="project-tab">
                 <div class="student-grade_tabs">
                    <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                       <a class="nav-item nav-link active"  onClick = {() =>this.props.oAsgnmntDtls?.isGroup ? this.setState({gradeType: 'ALL'}) : this.getAssignments()} id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab"  aria-selected="true">{this.props.t("translate:PARTICIPANTS")}</a>
                       <a class="nav-item nav-link"  onClick = {() => this.props.oAsgnmntDtls?.isGroup ? this.setState({gradeType: 'NG'}) : this.getAssignments('NG')} id="nav-profile-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="false">{this.props.t("translate:GRAD_NEED_GRADING")}</a>
                       <a class="nav-item nav-link"  onClick = {() => this.props.oAsgnmntDtls?.isGroup ? this.setState({gradeType: 'GRD'}) : this.getAssignments('GRD')} id="nav-contact-tab" data-toggle="tab" href="#tab-1" role="tab"  aria-selected="false">{this.props.t("translate:GRADED")}</a>
                    </div>
                 </div>
                 <div class="tab-content student-grade_content" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                       {this.props.oAsgnmntDtls?.isGroup ?
                        <GroupGradeList gradeType={this.state.gradeType} actTab = {this.grdState.actTab} aStudents = {this.props.aStudents} oAsgnmntDtls = {this.props.oAsgnmntDtls} /> :
                       <StudentGradeListComponent gradeListCallback = {this.StudCallback} actTab = {this.grdState.actTab} aStudents = {this.props.aStudents} oAsgnmntDtls = {this.props.oAsgnmntDtls}/>
                       }
                    </div>
                 </div>
              </div>
        </div>
      )
   }
}

// To get the reducers values
const mapStateToProps = (state) => ({
   ...state.gradeBookReducer
});

const mapDispatchToProps = {
   getAssgnmntDetails,
   getAssgnStuds,
   dwnldGradAsgnmnt,
   updateFields,
   getLastDwnldSubmsn,
   dwnlAssgnmntSubmsn
};

const TabNavigator = (props) => <StudentGradeBookListComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
