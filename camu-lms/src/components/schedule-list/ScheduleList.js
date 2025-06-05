import React,{ Component,  lazy} from 'react';
import '../../styles/_scheduleListStyle.scss';
import { RightArrow,VideoHide,VideoShow } from '../icons/Icons';
import Button from '../button/Button';
import { ExternalLink, Trash2 ,X} from 'react-feather';
// import StudentWrapper from '../student-wrapper/StudentWrapper';
import AnalyticsService from '../../service/analytics-service';
import NoRecord  from '../../components/error-page/Datanotfound';
import no_schedule from '../../assets/images/calendarsvg.svg';
import {withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import { createOnlineMeeting,startOnlineMeeting,launchMeeting,recordOnlineAttendance,cancelOnlineMeeting,getStfCustmUrl,scheduleMSMeeting,cancelMSMeeting,bookVirtualClass,submitStudFeedback,getFeedbackDetails } from '../../store/actions/ScheduleActions';
import { withTranslation } from "react-i18next";
import _ from 'lodash';
import UserSession from '../../utils/UserSession';
import helper, { isBeforeDate } from '../../utils/helper';
import messageUtil from '../../utils/message-util';
const AnalyticsWrapper = lazy(() =>
   import('../analytics-wrapper/AnalyticsWrapper')
);
const StudentWrapper =  lazy(() =>
   import('../student-wrapper/StudentWrapper')
);
const StaffWrapper = lazy(() =>
import('../staff-wrapper/StaffWrapper')
);

const InputBox = lazy(()=>
import('../input-box/InputBox')
);
const LmsModal = lazy(() =>
  import("../modal/LmsModal")
);

const VcFeedbackModal =  lazy(() =>
  import('./FeedbackModal')
);

export class ScheduleListComponent extends Component{
   constructor(props){
      super(props);
      this.state = {
         asgnIdx : '',        // Assignment index
         expAsg : false,      // Key to show the assigments
         tchIdx : '',         // Lesson plan index
         expTch : false,      // Key to show the lesson plan
         schedIndx:'',        // Scheduled index
         vdoEnable:false,     // Video enabled flag
         attnModal:false,     // Attendance modal
         isCustmModal:false,  // Custom link modal
         invalidLink:false,   // Invalid link
         link:'',              // custom link
         isReact: '',           //check if it is camu react project or not
         backUrl:'',
         feedbackModalData:{},   // Feedback modal
         isFeedbackModel: false,  // Feedback modal flag
         isTeachingRmrkModel: false, //Teaching Remark model,
         tchRmrk: "" // Teaching remark
      };
         
      this.moreSel = false;
      if(this.props.lstVals && this.props.lstVals.location && this.props.lstVals.location.state && this.props.lstVals.location.state.isCrWsScdl){
         AnalyticsService.setCurrPage('CRS_WS_SCHDL');
      }
   }

   componentDidMount(){
    this.setState({backUrl:helper.localStorageGet('portal_back_url'), isReact: helper.localStorageGet('isReact')})
   }

   // Go to assignment view
   goToAssignmentView = (assgnmntId, oSchdl) => {
      if(this.props.lstVals.history) {
         if(this.props.lstVals.location && this.props.lstVals.location.pathname && this.props.lstVals.location.pathname === "/Schedule-page"){
            this.props.lstVals.location.state          = {};
            this.props.lstVals.location.state.InId     = oSchdl.InId;
            this.props.lstVals.location.state.PrID     = oSchdl.PrID;
            this.props.lstVals.location.state.CrID     = oSchdl.CrID;
            this.props.lstVals.location.state.AcYr     = oSchdl.AcYr;
            this.props.lstVals.location.state.DeptID   = oSchdl.DeptID;
            this.props.lstVals.location.state.SemID    = oSchdl.SemID;
            this.props.lstVals.location.state.SecID    = oSchdl.SecID;
            this.props.lstVals.location.state.subId    = oSchdl.SubID;
            this.props.lstVals.location.state.subNa    = oSchdl.subNm;
            this.props.lstVals.location.state.SemName  = oSchdl.semNm;
            this.props.lstVals.location.state.AcYrNm   = oSchdl.acyrNm;
            this.props.lstVals.location.state.CrName   = oSchdl.crsNm;
            this.props.lstVals.location.state.SecName  = oSchdl.secNm;
            this.props.lstVals.location.state.allSchdl = true;
            this.props.lstVals.history.push({pathname:"/home-page/assignment-view",search:`?id=${assgnmntId}`, state : this.props.lstVals.location.state});
         }else{
            this.props.lstVals.location.state.crsSchdl = true;
            this.props.lstVals.history.push({pathname:"/home-page/assignment-view",search:`?id=${assgnmntId}`,state : this.props.lstVals.location.state});
         }
      }
   }

   // Set more or less state in assignment and lesson plan
   setMoreOrLessState = (indx, stKey) => {
      if(stKey === "assgnmnt"){   // Assignment
         if(indx === this.state.asgnIdx && this.state.expAsg){
            this.moreSel = false;
            this.setState({ ...this.state, asgnIdx: '', expAsg : false });
         }else{
            if(this.moreSel){ // If alreay more selected, then empty the index and set another one.
               this.setState({ ...this.state, asgnIdx: '', expAsg : false });
            }else{
               this.moreSel = true;
            }
            setTimeout(function(){
               this.setState({ ...this.state, asgnIdx: indx, expAsg : !this.state.expAsg });
            }.bind(this),10); 
         }
      }else{   // Lesson Plan
         if(indx === this.state.tchIdx && this.state.expTch){
            this.moreSel = false;
            this.setState({ ...this.state, tchIdx: '', expTch : false });
         }else{
            if(this.moreSel){ // If alreay more selected, then empty the index and set another one.
               this.setState({ ...this.state, tchIdx: '', expTch : false });
            }else{
               this.moreSel = true;
            }
            setTimeout(function(){
               this.setState({ ...this.state, tchIdx: indx, expTch : !this.state.expTch });
            }.bind(this),10); 
         }
      }
   } 
  //Show Confirmation online meeting popup
  showMeetingModal = (indx,vendor,key) => {
    if ( vendor === "CUSTOM" ) {
      const oCustmObj = {
        'staffId': UserSession.getSession().mappedid,
        'InId': UserSession.getSession().InId
      };
      this.props.lstVals.aSchedules[indx].vdoEnable = key;
      this.setState({isCustmModal:key});
      this.props.lstVals.getStfCustmUrl(oCustmObj,this.updateCustmUrl);
    }else{
      this.props.lstVals.aSchedules[indx].vdoEnable = key;
      this.setState({vdoEnable:key});
    } 
  }

  //Schedule Online meeting based on the vendor
  scheduleMeeting = (vendor,oSchedule,indx) => {
    this.setState({schedIndx:indx});
    if (vendor) {
      switch (vendor) {
        case "ZOOM":
          oSchedule.meetingReq = {
            vendor: "ZOOM",
          };
          this.props.lstVals.createOnlineMeeting(
            oSchedule,
            this.updateMeetingDtls
          );
          break;
        case "MS_TEAM":
          this.props.lstVals.scheduleMSMeeting(
            oSchedule,
            this.updateMeetingDtls
          );
          break;
        case "CUSTOM":
          oSchedule.meetingReq = {
            vendor: "CUSTOM",
          };
          oSchedule.link = this.state.link;
          this.props.lstVals.createOnlineMeeting(
            oSchedule,
            this.updateMeetingDtls
          );
          break;
        default:
          break;
      }
    }
  }

    /**
   * To book online virtual class
   * @params {string} currentSlotId -> selected schedule _id
   * @params {string} stTm -> start time of the schedule
   */
  bookVirtualClass = (schdl) => {
    this.props.lstVals.bookVirtualClass(schdl);
    this.props.getTT();
  }

  setFeedBack = (data) => {
    if (data?.fdBckId && data?.stuFbk) {
      this.setState({ isFeedbackModel: true, feedbackModalData: data?.stuFbk });
    } else if (data?.fdBckId && !data?.stuFbk) {
      this.props.lstVals.getFeedbackDetails(data?.fdBckId, (feedbackData) => {
        this.setState({ isFeedbackModel: true, feedbackModalData: feedbackData })}, data?.vcId)
    } else {
      this.setState({ isFeedbackModel: true, feedbackModalData: {} });
    }
  }

  handleFeedbackSubmit = (feedbackData) => {
    this.props.lstVals.submitStudFeedback(feedbackData);
    this.props.getTT();
    this.closeFeedbackModal();
  }

  updateCustmUrl=(link)=>{
    this.setState({link:link,isCustmModal:true});
  }

  //Update the meeting details against the scheduled index
  updateMeetingDtls = (meetData) =>{
    this.props.lstVals.aSchedules[this.state.schedIndx].vdoEnable = false;
    this.props.lstVals.aSchedules[this.state.schedIndx].meeting=meetData;
    this.setState({vdoEnable:false,isCustmModal:false});
  }

  closeFeedbackModal = () => {
    this.setState({ isFeedbackModel: false, feedbackModalData: null });
  }

  //Launch the meeting based on the vendor
  launchMeeting = (indx,vendor,oSchedule,actKey) =>{
    if(actKey === 'student'){
      if(oSchedule.attendanceId && !oSchedule.isAttendanceSaved){
        this.props.lstVals.aSchedules[indx].attnModal = true;
        this.setState({attnModal:true});
      }else{
        this.props.lstVals.launchMeeting(oSchedule.meeting);
      }
    }else{
      this.props.lstVals.startOnlineMeeting(vendor,oSchedule.meeting);
    }
  }

  //Record the attendance from the confirmation popup and launch the meeting for students
  launchStudMeeting = async (indx,oSchedule,recordAttn) =>{
    this.setState({schedIndx:indx});
    if(recordAttn && oSchedule && oSchedule.meeting){
      const oAttnReq = {
        meetingId : oSchedule.meeting.meetingId,
        attendanceId: oSchedule.attendanceId
      };
      await this.props.lstVals.recordOnlineAttendance(oAttnReq,oSchedule.meeting,this.updateAttendance);
    }else{
      this.props.lstVals.aSchedules[indx].attnModal = false;
      this.setState({attnModal:false});
      this.props.lstVals.launchMeeting(oSchedule.meeting);
    }
  }

  launchBookedStudMeeting = async (indx,oSchedule) =>{
    this.setState({schedIndx:indx});
    if(oSchedule && oSchedule.meeting){
      const oAttnReq = {
        meetingId : oSchedule.meeting.meetingId,
      };
      if (oSchedule?.attendanceId) {
        oAttnReq.attendanceId = oSchedule.attendanceId;
      }
      const response = await this.props.lstVals.recordOnlineAttendance(oAttnReq,oSchedule.meeting,this.updateAttendance, true);
      if (response?.isStarted) {
        this.props.lstVals.launchMeeting(oSchedule.meeting);
      }
    } else {
      this.props.lstVals.aSchedules[indx].attnModal = false;
      this.setState({attnModal:false});
      this.props.lstVals.launchMeeting(oSchedule.meeting);
    }
  }
  //Update the attendance recorded status
  updateAttendance = (attnVal,oMeetingDtls) =>{
    if(attnVal){
      this.props.lstVals.launchMeeting(oMeetingDtls);
      this.props.lstVals.aSchedules[this.state.schedIndx].isAttendanceSaved = attnVal;
    }
    this.props.lstVals.aSchedules[this.state.schedIndx].attnModal = false;
    this.setState({attnModal:false});
  }
  //Initialize the cancel meeting functionality
  initCancelMeeting = (indx,meetingId) =>{
    this.setState({schedIndx:indx});
    //Check the vendor type
    if(this.props.lstVals.onMeeting["vendor"] === "MS_TEAM"){
      this.props.lstVals.cancelMSMeeting(meetingId,this.updateCancelMeeting);
    }else{
      this.props.lstVals.cancelOnlineMeeting(meetingId,null,this.updateCancelMeeting);
    }
    
  }
  //Update the cancel meeting
  updateCancelMeeting = () =>{
    this.props.lstVals.aSchedules[this.state.schedIndx].meeting={};
  }
  //Set the enterprise details in localstorage for attendance launch
  setEnterPriseDtls = (e, oSchedule) =>{
    if (UserSession.isGotPerm(['f_attendance'])){
      const selcDtls={
        "Institute" : this.props.lstVals.location.state.InId,
        "Program": this.props.lstVals.location.state.PrID,
        "Course" : this.props.lstVals.location.state.CrID,
        'AcYr'   : this.props.lstVals.location.state.AcYr,
        "Department": this.props.lstVals.location.state.DeptID,
        "Semester" : this.props.lstVals.location.state.SemID,
        "Section" : this.props.lstVals.location.state.SecID
      }
      helper.localStorageSet('_selectedOption', selcDtls);
      const url = this.state?.isReact ? `${process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : (window.location.origin + '/v2')}/attendance/${oSchedule.SubID}/${oSchedule.FrTime}/${oSchedule.start}` :window.location.origin + '#/attendance?SubjId=' + oSchedule.SubID + '&FT=' + oSchedule.FrTime + '&SD=' + oSchedule.start + '&PrID=' + oSchedule.PrID + '&CrID=' + oSchedule.CrID +'&DeptID=' + oSchedule.DeptID +'&AcYr=' + oSchedule.AcYr + '&SemID=' + oSchedule.SemID + '&SecID=' + oSchedule.SecID
      window.open(url, "_blank");
    } else {
      e.preventDefault();
      messageUtil.showInfo("YOU_DO_NOT_HAVE_PERMISSION_TO_ACCESS_THE_ATTENDANCE_SCREEN", false)
    }
  }

  isCurrentAcademic = (academics, id) => {
    if(academics?.length && id){
      const oCurrentIdDetail = academics.find(a => a.AcYr === id)
      if(oCurrentIdDetail && oCurrentIdDetail?.isCurSem === false){
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }
   
   render() {
    const {vdoEnable,link,invalidLink,isCustmModal, feedbackModalData, isFeedbackModel, isTeachingRmrkModel} = this.state;
    const { acYr } = this.props?.lstVals;
      return (
        <div>
          {/* <CourseHeader title={this.props.lstVals.t("translate:SCHEDULE_CONTENT")} content={this.props.lstVals.t("translate:SCHEDULE_HEADER_CONTENT")}/> */}

          {/* <div className="schedule-header" >
               <div className="schedule-content">
                  <p className="schedule-name">Schedules</p>
                  <p className="schedule-contents"> Get a clear and real-time view of any day of the week with this weekly class schedule</p>
               </div>
            </div> */}

          {/* Tab contents */}

          {/* {this.props.lstVals.isAllScd ? 'show active' : ''} */}

          {/* show active */}
          {/* + (this.props.lstVals.showBulkActions ? 'show' : 'hidden') */}
          {/* <div className="tab-pane fade {!this.props.lstVals.isAllScd ? 'active show' : ''} " id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab"> */}
          {this.props.lstVals.aSchedules &&
          this.props.lstVals.aSchedules.length > 0 ? (
            this.props.lstVals.aSchedules.map((oSchedule, indx) => [
              <div>
                {
                  (!oSchedule.isHolOrEv || (oSchedule.isHolOrEv && !oSchedule.hasAsgn)) && 
                  <div className="calender-list">
                    <h6 className="calendar-day">
                      <span className="calender_date">
                        {oSchedule.dateFrmt}{" "}
                        <span className="calender_date">
                          {oSchedule.dayNm} {oSchedule.isTod}
                        </span>
                      </span>
                    </h6>
                    {oSchedule.isHolOrEv && (
                      <p className="holiday-info">{oSchedule.Name}</p>
                    )}
                    {oSchedule.isNosch && (
                      <p className="holiday-info">
                        {this.props.lstVals.t("translate:NO_CLASS")}
                      </p>
                    )}
                    <div className="calender-header">
                      <div className="calender-header_links">
                        <p>
                          {oSchedule.forFrmTm && oSchedule.forToTm  &&
                            !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls 
                            && (
                            <span>
                              {oSchedule.forFrmTm} - {oSchedule.forToTm}
                            </span>
                          )}
                          {oSchedule.locNm &&
                            !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls 
                            && (
                            <span>
                              <span className="dot-pointer_list"></span>
                              {oSchedule.locNm}
                            </span>
                          )}
                        </p>
                        {this.props.lstVals.onMeeting["vendor"] &&
                          !oSchedule.isHolOrEv &&
                          !oSchedule.isNosch && (
                            <div className="video-link_cont">
                              <StaffWrapper>
                                {(!oSchedule.meeting ||
                                  _.isEmpty(oSchedule.meeting)) && (
                                  <span className="dot-video_pointer"></span>
                                )}
                                <span
                                  className="tooltip--zoom_link"
                                  data-tooltip={this.props.lstVals.t(
                                    "translate:SCHEDULE_ONLINE_MEET"
                                  )}
                                  onClick={() =>
                                    this.showMeetingModal(
                                      indx,
                                      this.props.lstVals.onMeeting["vendor"],
                                      true
                                    )
                                  }
                                >
                                  {oSchedule.vdoEnable &&
                                  (!oSchedule.meeting ||
                                    _.isEmpty(oSchedule.meeting)) ? (
                                    <VideoShow iconStyle="svg-icon_small icon-pointer" />
                                  ) : !oSchedule.vdoEnable &&
                                    (!oSchedule.meeting ||
                                      _.isEmpty(oSchedule.meeting)) ? (
                                    <VideoHide iconStyle="svg-icon_small icon-pointer" />
                                  ) : null}
                                </span>
                                {oSchedule.meeting &&
                                  !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls &&
                                  !_.isEmpty(oSchedule.meeting) &&
                                  oSchedule.isTod && (
                                    <Button
                                      theme="btn-rounded default btn-left"
                                      clicked={() =>
                                        this.launchMeeting(
                                          indx,
                                          this.props.lstVals.onMeeting["vendor"],
                                          oSchedule,
                                          "staff"
                                        )
                                      }
                                    >
                                      <ExternalLink className="svg-icon_small" />{" "}
                                      {this.props.lstVals.t("translate:LAUNCH_MEET")}
                                    </Button>
                                  )}
                                {oSchedule.meeting &&
                                  !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls &&
                                  !_.isEmpty(oSchedule.meeting) &&
                                  !oSchedule.isTod && (
                                    <span
                                      className="tooltip--zoom_btn"
                                      data-tooltip={this.props.lstVals.t(
                                        "translate:ONLINE_MEET_ACCESSABILITY"
                                      )}
                                    >
                                      <Button theme="btn-rounded lite_dark-btn btn-left">
                                        <ExternalLink className="svg-icon_small" />{" "}
                                        {this.props.lstVals.t(
                                          "translate:LAUNCH_MEET"
                                        )}
                                      </Button>
                                    </span>
                                  )}
                                {/* <span
                                  className="tooltip--zoom_link"
                                  data-tooltip={this.props.lstVals.t("translate:COPY_MEETING")}
                                >
                                  <Copy className="svg-icon_small icon-default left-icon icon-pointer" />
                                </span> */}
                                {oSchedule.meeting &&
                                  !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls &&
                                  !_.isEmpty(oSchedule.meeting) && (
                                    <span
                                      className="tooltip--zoom_link"
                                      data-tooltip={this.props.lstVals.t(
                                        "translate:DELETE_MEETING"
                                      )}
                                      onClick={() =>
                                        this.initCancelMeeting(
                                          indx,
                                          oSchedule.meeting.meetingId
                                        )
                                      }
                                    >
                                      <Trash2 className="svg-icon_small icon-default left-icon icon-pointer" />
                                    </span>
                                  )}
                              </StaffWrapper>
                              <StudentWrapper>
                                {oSchedule.meeting &&
                                  !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls &&
                                  !_.isEmpty(oSchedule.meeting) &&
                                oSchedule.isTod ? (
                                  <Button
                                    theme="btn-rounded default btn-left"
                                    clicked={() =>
                                      this.launchMeeting(
                                        indx,
                                        this.props.lstVals.onMeeting["vendor"],
                                        oSchedule,
                                        "student"
                                      )
                                    }
                                  >
                                    <ExternalLink className="svg-icon_small" />{" "}
                                    {this.props.lstVals.t("translate:LAUNCH_MEET")}
                                  </Button>
                                ) : oSchedule.meeting &&
                                  !this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls &&
                                  !_.isEmpty(oSchedule.meeting) &&
                                  !oSchedule.isTod ? (
                                  <span
                                    className="tooltip--zoom_btn"
                                    data-tooltip={this.props.lstVals.t(
                                      "translate:ONLINE_MEET_ACCESSABILITY"
                                    )}
                                  >
                                    <Button theme="btn-rounded lite_dark-btn btn-left">
                                      <ExternalLink className="svg-icon_small" />{" "}
                                      {this.props.lstVals.t("translate:LAUNCH_MEET")}
                                    </Button>
                                  </span>
                                ) : null}
                              </StudentWrapper>
                              {oSchedule.attnModal && (
                                <div class="dropdown-menu attendance-link_modal">
                                  <div
                                    className="zoom-link_dismiss"
                                    onClick={() => {
                                      //this.setState({schedIndx:indx});
                                      this.props.lstVals.aSchedules[
                                        indx
                                      ].attnModal = false;
                                      this.setState({ attnModal: false });
                                    }}
                                  >
                                    <X className="svg-icon_small icon-dark icon-pointer" />
                                  </div>
                                  <p className="zoom-link_label">
                                    {this.props.lstVals.t(
                                      "translate:ONLINE_ATTENDANCE_CONFIRM"
                                    )}
                                  </p>
    
                                  <Button
                                    theme="btn-rounded default btn-block"
                                    clicked={() =>
                                      this.launchStudMeeting(indx, oSchedule, true)
                                    }
                                  >
                                    {this.props.lstVals.t(
                                      "translate:RECORD_ATTENDANCE_YES"
                                    )}
                                  </Button>
    
                                  <Button
                                    theme="btn-rounded secondary-btn btn-block"
                                    clicked={() =>
                                      this.launchStudMeeting(indx, oSchedule, false)
                                    }
                                  >
                                    {this.props.lstVals.t(
                                      "translate:RECORD_ATTENDANCE_NO"
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                          {this.isCurrentAcademic(acYr, oSchedule?.AcYr) &&
                          <StaffWrapper>
                            {!oSchedule.isHolOrEv &&
                              !oSchedule.isNosch &&
                              UserSession.getSession().perdAtten &&
                              <a className="student-attn_view"
                                onClick={(e) => this.setEnterPriseDtls(e, oSchedule)}
                                target="_blank"
                                href = "#"
                                // href={window.location.origin + '#/attendance?SubjId=' + oSchedule.SubID + '&FT=' + oSchedule.FrTime + '&SD=' + oSchedule.start}
                                rel="noreferrer" >
                                {this.props.lstVals.t("translate:ATTENDENCE")}
                              </a>
                            }
                          </StaffWrapper>
   }
                        {oSchedule.vdoEnable && vdoEnable && (
                          <div class="dropdown-menu zoom-link_modal">
                            <div
                              className="zoom-link_dismiss"
                              onClick={() =>
                                this.showMeetingModal(
                                  indx,
                                  this.props.lstVals.onMeeting["vendor"],
                                  false
                                )
                              }
                            >
                              <X className="svg-icon_small icon-dark icon-pointer" />
                            </div>
                            <p className="zoom-link_label">
                              {this.props.lstVals.t(
                                "translate:CONFIRM_ONLINE_SCHEDULE"
                              )}
                            </p>
                            <div className="zoom-meet_add">
                              <Button
                                theme="btn-rounded default"
                                clicked={() =>
                                  this.scheduleMeeting(
                                    this.props.lstVals.onMeeting["vendor"],
                                    oSchedule,
                                    indx
                                  )
                                }
                              >
                                {this.props.lstVals.t(
                                  "translate:CREATE_ZOOM_OR_MS"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                        {oSchedule.vdoEnable && isCustmModal && (
                          <div class="dropdown-menu zoom-link_modal">
                            <div
                              className="zoom-link_dismiss"
                              onClick={() =>
                                this.showMeetingModal(
                                  indx,
                                  this.props.lstVals.onMeeting["vendor"],
                                  false
                                )
                              }
                            >
                              <X className="svg-icon_small icon-dark icon-pointer" />
                            </div>
                            <p className="zoom-link_label">
                              {this.props.lstVals.t("translate:ADD_MEET_LINK_DESC")}
                            </p>
                            <div className="meet-link_box">
                              <InputBox
                                className="input-block "
                                placeholder="Paste the meeting link"
                                value={link}
                                onChange={(event) => {
                                  /*validate custom link*/
                                  if (
                                    event.target.value &&
                                    event.target.value.substring(0, 7) !==
                                      "http://" &&
                                    event.target.value.substring(0, 8) !==
                                      "https://"
                                  ) {
                                    this.setState({ invalidLink: true });
                                    return;
                                  }
                                  this.setState({
                                    ...this.state,
                                    link: event.target.value,
                                    invalidLink: false,
                                  });
                                }}
                              ></InputBox>
                            </div>
                            {!invalidLink ? (
                              <div
                                className="zoom-meet_add"
                                onClick={() =>
                                  this.scheduleMeeting(
                                    this.props.lstVals.onMeeting["vendor"],
                                    oSchedule,
                                    indx
                                  )
                                }
                              >
                                <Button theme="btn-rounded default">
                                  {this.props.lstVals.t("translate:ADD_MEET_LINK")}
                                </Button>
                              </div>
                            ) : (
                              <div className="text-empty_content">
                                {this.props.lstVals.t("translate:NOT_A_VALID_URL")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {oSchedule.aAssgnmnts && oSchedule.aAssgnmnts.length >= 1 && (
                        <p>
                          {oSchedule.aAssgnmnts.length}{" "}
                          {this.props.lstVals.t("translate:DUES")}
                        </p>
                      )}
    
                      {/* <p><span><FileText  className="svg-icon_light icon-space"/></span>Notes</p> */}
                    </div>
                    {this.props.lstVals.aSchedules?.[0]?.vcDtls?.isOnBkCls && oSchedule?.meeting && (
                      <div className="virtual-cls_content">
                        <div className="vir-class-container">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="sub-name_content">{oSchedule.subNm}</span>
                            <div className='schedule-cont_list'>
                              {oSchedule.forFrmTm && oSchedule.forToTm && (
                                <div>
                                <p className ='sub-name_lists'>
                                  {oSchedule.forFrmTm} - {oSchedule.forToTm}
                                </p>
                                </div>
                              )}
                              {oSchedule.duration && (
                                <span className='sub-name_lists'>{`(${oSchedule.duration} ${this.props.lstVals.t("translate:MINS")})`}</span>
                              )}
                              {oSchedule.FacID && oSchedule.SubID && oSchedule.StaffNm && (
                                <span className='sub-name_lists'>{oSchedule.StaffNm}</span>
                              )}
                              </div>
                              {oSchedule?.locNm && oSchedule?.LocID && ( 
                                <p className='sub-name_lists'>{oSchedule.locNm}</p>
                              )}
                              {oSchedule?.tchRmrks && (
                                <div className='mt-3 mb-1'>
                                <Button
                                size="sm"
                                clicked={() => this.setState({isTeachingRmrkModel:true ,tchRmrk: oSchedule?.tchRmrks})}
                                theme="btn-rounded default btn-left"
                                >
                                  {this.props.lstVals.t("translate:TEACHING_REMARKS")}
                                </Button>
                                </div>
                              )}
                            </div>
                            {/* Booking Not Started */}
                            {oSchedule?.crntStatus === "BOOKING_IS_NOT_STARTED" && (
                              <p className="m-0 fs-3 status-critical">
                                {this.props.lstVals.t("translate:BOOKING_IS_NOT_STARTED")}
                              </p>
                            )}

                            {/* Can Book */}
                            {oSchedule?.crntStatus === "CAN_BOOK" && (
                              <div className="virtual-cls_btn">
                                <span className="m-0 fs-3 text-secondary">
                                  {`${oSchedule.availSeat} ${oSchedule.availSeat === 1 ?
                                    this.props.lstVals.t("translate:SEAT_AVAILABLE") :
                                    this.props.lstVals.t("translate:SEATS_AVAILABLE")}`}
                                </span>
                                <Button
                                  size="sm"
                                  clicked={() =>
                                    this.bookVirtualClass(oSchedule)}
                                  theme="btn-rounded default btn-left"
                                >
                                  {this.props.lstVals.t("translate:BOOK_CLASS")}
                                </Button>
                              </div>
                            )}
                            {/* Already Registered / Can Join */}
                            {(oSchedule?.crntStatus === "ALREADY_REGISTERED" || oSchedule?.crntStatus === "CAN_JOIN") && oSchedule?.StFl !== 'C' && (
                              <div className="virtual-cls_btn">
                                <Button
                                  theme="btn-rounded secondary-btn btn-left"
                                  clicked={() => this.setFeedBack(oSchedule)}
                                >
                                  {this.props.lstVals.t("translate:FEEDBACK")}
                                </Button>
                                <span className="disabled-text status-success">
                                  {this.props.lstVals.t("translate:BOOKED")}
                                </span>
                                <Button
                                  theme="btn-rounded default btn-left"
                                  clicked={() => this.launchBookedStudMeeting(indx, oSchedule)}
                                >
                                  {this.props.lstVals.t("translate:JOIN")}
                                </Button>
                              </div>
                            )}

                            {/* Booking Capacity Exceeded */}
                            {oSchedule?.crntStatus === "BOOKING_CAPACITY_EXCEEDS" && (
                              <p className="disabled-text">
                                {this.props.lstVals.t("translate:CAN'T_BOOK_SEATS_FILLED")}
                              </p>
                            )}

                            {/* Booking Time Exceeded */}
                            {oSchedule?.crntStatus === "BOOKING_TIME_EXCEEDS" && (
                              <p className="status-info disabled-text">
                                {this.props.lstVals.t("translate:BOOKING_TIME_EXCEEDS")}
                              </p>
                            )}

                            {/* Watch Recorded Class */}
                            {(oSchedule?.crntStatus === "NO_RECORD_AVAILABLE" || oSchedule?.crntStatus === "RECORD_AVAILABLE") && (
                              <div className="virtual-cls_btn">
                                <Button
                                  theme="btn-rounded secondary-btn btn-left"
                                  clicked={() => this.setFeedBack(oSchedule)}
                                >
                                  {this.props.lstVals.t("translate:FEEDBACK")}
                                </Button>
                                <Button
                                  theme="btn-rounded secondary-btn btn-left"
                                  defaultDisabled={oSchedule?.crntStatus === "NO_RECORD_AVAILABLE"}
                                  clicked={() => window.open(oSchedule.rcrdUrl)}
                                >
                                  {oSchedule?.crntStatus === "NO_RECORD_AVAILABLE"
                                    ? this.props.lstVals.t("translate:RECORDED_CLASS_UNAVAILABLE")
                                    : this.props.lstVals.t("translate:WATCH_RECORDED_CLASS")}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {((!oSchedule.isHolOrEv && !oSchedule.isNosch) || ((oSchedule.isHolOrEv || oSchedule.isNosch) && oSchedule.aAssgnmnts && oSchedule.aAssgnmnts.length)) ? (
                      <div
                        className="schedule-datalist"
                        style={{
                          borderLeft: oSchedule.textColor
                            ? "solid 12px " + oSchedule.textColor
                            : "solid 1px #DFE1E5",
                        }}
                      >
                        <div>
                          <div className="calender-activity">
                            {this.props.lstVals.location &&
                              !this.props.lstVals.location.state && (
                                <div className="calender-sub_name">
                                  <p className="sub-name_content">
                                    {oSchedule.subNm}
                                  </p>
                                  <p className="sub-name_lists">
                                    {oSchedule.prgNm}
                                    <span className="dot-pointer_list"></span>
                                    {oSchedule.semNm}
                                    <span className="dot-pointer_list"></span>
                                    {oSchedule.acyrNm}
                                    <span className="dot-pointer_list"></span>
                                    {oSchedule.crsNm}
                                    <span className="dot-pointer_list"></span>
                                    {oSchedule.secNm}
                                  </p>
                                </div>
                              )}
                          </div>
                          <div className="calender-activity">
                            <div class="row m-0">
                              {/* <div class="col-6 p-0">
                                                    <div  className={(indx === this.state.tchIdx && this.state.expTch) ? 'more-content' : 'less-content'}>
                                                      <p className="calender-activity_name">{this.props.lstVals.t("translate:TOPIC")}</p>
                                                      {oSchedule.aTcPlans && oSchedule.aTcPlans.length>0 ? (
                                                          oSchedule.aTcPlans.map((oTchPlan) => {
                                                            return (
                                createOnlineMeeting                                <div>
                                                                  <div className="calender-activity_list">
                                                                      <div className="activity-list_name">
                                                                        <p>{oTchPlan._id.subChapNm}</p>
                                                                        <span>{oTchPlan._id.chapNm}</span>
                                                                      </div>
                                                                      <RightArrow iconStyle="svg-icon_default icon-dark"/>
                                                                  </div>
                                                                </div>
                                                            )
                                                          })
                                                          ) : (<p className="no-data_label">{this.props.lstVals.t("translate:NO_TOPIC_FND")}</p>)
                                                      }
                                                    </div>
                                                    {oSchedule.aTcPlans && oSchedule.aTcPlans.length>1 && <p className="more-data_label" onClick={() => this.setMoreOrLessState(indx, 'lsnpln')}> { (indx === this.state.tchIdx && this.state.expTch) ? <span>Less</span> : <span>More</span> }</p>}
                                                </div> */}
                              <div class="col-12 p-0">
                                <div
                                  className={
                                    indx === this.state.asgnIdx && this.state.expAsg
                                      ? "more-content"
                                      : "less-content"
                                  }
                                >
                                  <p className="calender-activity_name">
                                    {this.props.lstVals.t(
                                      "translate:ASSIGNMENT_DUE"
                                    )}
                                  </p>
                                  {oSchedule.aAssgnmnts &&
                                  oSchedule.aAssgnmnts.length > 0 ? (
                                    oSchedule.aAssgnmnts.map((oAssgnmnt) => {
                                      return (
                                        <div>
                                          {oAssgnmnt && oAssgnmnt.isNotArchCrs ?
                                            <div
                                              className="calender-activity_list"
                                              onClick={() =>
                                                this.goToAssignmentView(
                                                  oAssgnmnt._id,
                                                  oSchedule
                                                )
                                              }
                                            >
                                              <div className="activity-list_name">
                                                <p>{oAssgnmnt.title}</p>
                                                <span>
                                                  <StudentWrapper>
                                                    {oAssgnmnt.aSts === "SUB" ?
                                                      this.props.lstVals.t("translate:SUBMITTED") : oAssgnmnt.aSts === "NS" ?
                                                        this.props.lstVals.t("translate:NOT_COMPLETED_YET") : null}
                                                  </StudentWrapper>
                                                  <StaffWrapper>
                                                    {oAssgnmnt.submtCnt}/
                                                    {oAssgnmnt.totStud}{" "}
                                                    {this.props.lstVals.t(
                                                      "translate:SUBMITTED"
                                                    )}
                                                  </StaffWrapper>
                                                </span>
                                              </div>
                                              <RightArrow iconStyle="svg-icon_default icon-dark" />
                                            </div>
                                            : <p className="no-data_label">
                                              {this.props.lstVals.t(
                                                "translate:ARCHIVE_COURSE"
                                              )}
                                            </p>
                                          }
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="no-data_label">
                                      {this.props.lstVals.t(
                                        "translate:NO_ASSGNMNT_FND"
                                      )}
                                    </p>
                                  )}
                                </div>
                                {oSchedule.aAssgnmnts &&
                                  oSchedule.aAssgnmnts.length > 1 && (
                                    <p
                                      className="more-data_label"
                                      onClick={() =>
                                        this.setMoreOrLessState(indx, "assgnmnt")
                                      }
                                    >
                                      {" "}
                                      {indx === this.state.asgnIdx &&
                                      this.state.expAsg ? (
                                        <span>Less</span>
                                      ) : (
                                        <span>More</span>
                                      )}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* <RightArrow iconStyle="svg-icon_default icon-dark"/> */}
                      </div>
                    ) : (
                      ""
                    )}
                    {/* <div className="calender-schedule">
                                    <div className="activity-list_name">
                                        <p>Some title goes here </p>
                                        <span>consectetur adipiscing elit. Egestas ornare morbi lacus, nullam in tellus metus eget a. Id quam vulputate blandit pellentesque mi</span>
                                    </div>
                                    <p className="calender-activity_location"> <Map iconStyle="svg-icon_extra-small icon-dark"/> &nbsp;Valli prayer hall</p>
                                  </div> */}
                  </div>
                }
              </div>
              
            ])
          ) : (
            <div>
              {this.props.lstVals &&
                this.props.lstVals.location &&
                this.props.lstVals.location.state &&
                this.props.lstVals.location.state.isCrWsScdl && (
                  <NoRecord
                    crsname={this.props.lstVals.location.state.subNa}
                    img={no_schedule}
                    crseSchdlContnt={true}
                    imgSize="no-data_img-default"
                  />
                )}
            </div>
          )}

          <div className="no-schedule_found">{/* <NodataComponent/> */}</div>
          {this.props.lstVals &&
            this.props.lstVals.location &&
            this.props.lstVals.location.state &&
            this.props.lstVals.location.state.isCrWsScdl && (
              <StudentWrapper>
                <AnalyticsWrapper></AnalyticsWrapper>
              </StudentWrapper>
            )}
          {(isFeedbackModel) && (
            <VcFeedbackModal
              feedbackSubmit={this.handleFeedbackSubmit}
              onClose={this.closeFeedbackModal}
              oFeedbackDtls={feedbackModalData}
              t = {this.props.lstVals.t}
              isOpen={isFeedbackModel}
            />
          )}   
          {(isTeachingRmrkModel) && (
            <LmsModal modalTitle={this.props.lstVals.t("translate:TEACHING_REMARKS")} open={isTeachingRmrkModel} isTeachingRmrkModel={true} tchRmrk={this.state.tchRmrk} onClose = {() => this.setState({isTeachingRmrkModel : false}) } />
          )}
        </div>
      );
   }
};
// To get the reducers values
const mapStateToProps = (state) => ({
  ...state.scheduleReducer,
  ...state.dashboardReducer
});

const mapDispatchToProps = {
  createOnlineMeeting,
  startOnlineMeeting,
  launchMeeting,
  recordOnlineAttendance,
  cancelOnlineMeeting,
  getStfCustmUrl,
  scheduleMSMeeting,
  cancelMSMeeting,
  bookVirtualClass,
  getFeedbackDetails,
  submitStudFeedback
};

const TabNavigator = (props) => <ScheduleListComponent {...props} />

const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
