import React,{ Component } from 'react';
import '../styles/_schudlepageStyle.scss';
// import {DownArrow,Search,Select,Option,Message, Calender} from '../components/icons/Icons';
// import { CalendarListComponent } from '../components/calendar/Calendarlist';
import Button from '../components/button/Button';
import { ChevronLeft,ChevronRight} from 'react-feather';
import { CalendarComponent } from '../components/big-calendar/Calendar';
import HeaderComponent from '../components/header/Header';
import moment from 'moment';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { getTTSchedules,createOnlineMeeting,startOnlineMeeting,launchMeeting,recordOnlineAttendance,cancelOnlineMeeting,getStfCustmUrl,scheduleMSMeeting,cancelMSMeeting,bookVirtualClass,submitStudFeedback,getFeedbackDetails } from '../store/actions/ScheduleActions';
import  {ScheduleListComponent}  from '../components/schedule-list/ScheduleList';
import {withRouter} from 'react-router-dom';
import CourseHeader from '../components/course-header/CourseHeader';
import NoRecord  from '../components/error-page/Datanotfound';
import no_schedule from '../assets/images/calendarsvg.svg';
import ReactDatePicker from '../components/date-picker/DatePicker';
import { localStorageGet,localStorageSet } from '../utils/helper';
import UserSession from '../utils/UserSession';
class SchedulePageComponent extends Component{
   constructor(props){
      super(props);
      this.state = {
         curMonth : '',       // Current week number
         usrSession: {}
      };
      this.scdlState = {
         start : '',          // Current week start date
         end   : '',          // Current week end date
         aDates: [],
         schdlDate : '',
         curTmZone : ''
      }
      if(!localStorageGet('utype')){
         localStorageSet('utype',this.props.session.utype);
      }
   }

   // Invoking immediately after the compenent has been mounted
   componentDidMount(){
      const { state } = this.props.location;
      // Set the current month and fetch schedules based on `selectDate`
      if (state?.selectDate) {
        this.setState({ curMonth: state.selectDate },()=> {
            this.getSelectedSchedules();
        });
      } else {
        this.getCurrentWeekSchedules();
      }

      this.scdlState.curTmZone = '';
      if(UserSession.getSession() && UserSession.getSession().tzOfst){
         this.getCurTimeZone(UserSession.getSession().tzOfst, UserSession.getSession().tzOfstNm);
      }
      
   }

   componentDidUpdate(prevProps, prevState) {
      const userSession = UserSession.getSession() || {};

      // Only update state if user session changed
      if (
         userSession.utype === "student" &&
         userSession.stuId &&
         prevState.usrSession !== userSession
      ) {
         this.setState(
            {
               usrSession: userSession,
               curMonth: this.props.location?.state?.selectDate || prevState.curMonth,
            },
            this.props.location?.state?.selectDate ? this.getSelectedSchedules : this.getCurrentWeekSchedules
         );
      }
   }

   componentWillReceiveProps () {
      this.scdlState.curTmZone = '';
      if(UserSession.getSession() && UserSession.getSession().tzOfst){
         this.getCurTimeZone(UserSession.getSession().tzOfst, UserSession.getSession().tzOfstNm);
      }
   }

   getCurTimeZone = (tzOfst, tzOfstNm) => {
      let isPosTmZn = false;
      if (tzOfst >= 0) {
         isPosTmZn = true;
      }
      let cnvTmZnOfst = Math.abs(tzOfst);
      let h = cnvTmZnOfst / 60 | 0, m = cnvTmZnOfst % 60 | 0;
      let curTmZone = moment.utc().hours(h).minutes(m).format("HH:mm");
      if(isPosTmZn){
         this.scdlState.curTmZone += 'UTC+'+curTmZone;
      }else{
         this.scdlState.curTmZone += 'UTC-'+curTmZone;
      }
      if(tzOfstNm){
         this.scdlState.curTmZone += ' ('+tzOfstNm+')';
      }
   }

   // Get schedules based on date range selected
   getSchedules = (selectDate) => {
      let isCrsWse = false;    // get course wise schedules
      if(this.props.location && this.props.location.state && this.props.location.state.isCrWsScdl){
         isCrsWse = true;
      }
      let state = undefined;
      if(this.props.location && this.props.location.state){
         state = this.props.location.state;
         if(this.props?.location?.state?.utype === "student" && this.props?.location?.state?.stuId){
            state.StuID = this.props.location.state?.stuId
         }
      }else{
         if(localStorageGet('utype') ==="student"){
            state = {};
            state.PrID = this.props.selcDtls.PrID;
            state.CrID = this.props.selcDtls.CrID;
            state.DeptID = this.props.selcDtls.DeptID;
            state.AcYr = this.props.selcDtls.AcYr;
            state.SemID = this.props.selcDtls.SemID;
            state.SecID = this.props.selcDtls.SecID;
            state.StuID = this.state.usrSession?.stuId || "";
         }
      }
      this.scdlState.schdlDate = selectDate ? selectDate : new Date();
      this.props.getTTSchedules(this.scdlState, state, isCrsWse);
   }

   // get start and end date of given date week
   getDateRangeOfWeek = (weekDate,frmMnth) => {
      let actDay = weekDate.day();
      let dayOrder = 0;
      let aDates = [];
      while(dayOrder <= 6){
         let dayCnt = dayOrder-actDay;
         if(Math.sign(dayCnt)===1){  // To add for next days
            let frmtdate = moment(weekDate).add('days',Math.abs(dayCnt)).format();
            if(frmMnth === moment(frmtdate).format('M')){
               aDates.push(moment(frmtdate).format("YYYY-MM-DD"));
            }
         }else if(Math.sign(dayCnt)===-1){ // To subtract for previous days
            let frmtdate = moment(weekDate).subtract('days',Math.abs(dayCnt)).format();
            if(frmMnth === moment(frmtdate).format('M')){
               aDates.push(moment(frmtdate).format("YYYY-MM-DD"));
            }
         }else{
            aDates.push(moment(weekDate).format("YYYY-MM-DD"));
         }
         dayOrder++;
      }
      return (aDates);
   }

   // get current week data
   getCurrentWeekSchedules = () => {
      const curDate = moment().format("YYYY-MM-DD");
      this.setState({curMonth : new Date(curDate)});
      const frmMnth = moment(curDate).format('M');
      const aDates = this.getDateRangeOfWeek(moment(),frmMnth);
      if(aDates && aDates.length){
         this.scdlState.aDates = aDates;
         this.scdlState.start = aDates[0];
         this.scdlState.end   = aDates[aDates.length-1];
         this.getSchedules();
      }
   }

   // to get previous and next schedules
   goToPrevorNextSchedules = (schKey) => {
      if(schKey === "prev"){
         this.scdlState.month = moment(this.scdlState.start).subtract(1, 'M');
      }else{
         this.scdlState.month = moment(this.scdlState.start).add(1, 'M');
      }
      const frmMnth = moment(this.scdlState.month).format('M');
      const frstDate = moment(this.scdlState.month).startOf('month');
      this.setState({curMonth : new Date(moment(frstDate).format("YYYY-MM-DD"))});
      const aDates = this.getDateRangeOfWeek(frstDate,frmMnth);
      if(aDates && aDates.length){
         this.scdlState.aDates = aDates;
         this.scdlState.start = aDates[0];
         this.scdlState.end   = aDates[aDates.length-1];
         this.getSchedules(frstDate);
      }
   }

   // get the schedules based on selected date
   getSelectedSchedules = () => {
         const selectedDate = moment(this.state.curMonth);
         this.setState({curMonth : new Date(moment(selectedDate).format("YYYY-MM-DD"))});
         const frmMnth = moment(selectedDate).format('M');
         const aDates = this.getDateRangeOfWeek(selectedDate,frmMnth);
         if(aDates && aDates.length){
            this.scdlState.aDates = aDates;
            this.scdlState.start = aDates[0];
            this.scdlState.end   = aDates[aDates.length-1];
            this.getSchedules(selectedDate);
         }
   }

    render(){
        return(
         <div>
         <div className="schedule-content_box">
            {this.props.location && !this.props.location.state ? (
                  <div  className="fixed-header">
                     <HeaderComponent />
                  </div>
            ) : null}
            
            <div className="schedule-content_list" style = {{paddingTop : this.props.location && this.props.location.state && this.props.location.state.isCrWsScdl ? '0px' : ''}}>
               {/* <div className="schedule-header">
                  <div className="schedule-content">
                     <p className="schedule-name">Schedules</p>
                     <p className="schedule-contents"> Lorem ipsum dolor sit amet, consectetur adipiscing elit. <span>Learn more</span></p>
                  </div>
                  <div className="schedule-more">
                     <Button theme="btn-rounded default">
                     Add schedule
                     </Button>
                     <i class="more-option">
                        <MoreVertical className="svg-icon_small icon-dark" />
                     </i>
                  </div>
               </div> */}
               {/* <div className="date-changes">
                  <div class="row m-0">
                     <div class="col-3 p-0">
                        <Button theme="btn-rounded btn-outline">
                        Goto Today
                        </Button>
                     </div>
                     <div class="col-6 p-0">
                        <div className="date-selector">
                           <p className="select-dates">
                              <span className="date-backward">
                                 <ChevronLeft className="svg-icon_small icon-dark"/>
                              </span>
                              29 Jan - 4 Feb 2020 
                              <span className="date-forward">
                                 <ChevronRight className="svg-icon_small icon-dark"/>
                              </span>
                           </p>
                        </div>
                     </div>
            
                  </div>
               </div> */}



            <CourseHeader title={this.props.t("translate:SCHEDULE_CONTENT")} content={this.props.t("translate:SCHEDULE_HEADER_CONTENT")}/>
            <div className="schedule-date_changes">
               <div class="row m-0">
                  <div class="col-4 p-0" onClick={()=> this.getCurrentWeekSchedules()}>
                     <Button theme="btn-rounded secondary-btn btn-outline">
                     {this.props.t("translate:GOTO_TODAY")}
                     </Button>
                  </div>
                  <div class="col-4 p-0">
                     <div className="schedule-date_selector">
                     
                           <div className="schedule-date_backward">
                              <ChevronLeft className="svg-icon_small icon-dark icon-pointer" onClick={()=> this.goToPrevorNextSchedules('prev')}/>
                           </div>
                           <div className="schedule-select_dates">
                              
                           {this.state.curMonth && <ReactDatePicker closeOnSelect={true}  className="date-picker_transparent"  dateFormat="DD-MMM-YYYY" timeFormat={false} value={this.state.curMonth} onChange={(event)=> this.setState({curMonth:event}, (event) => this.getSelectedSchedules())}/>}

                           </div>
                           <div className="schedule-date_forward" onClick={()=> this.goToPrevorNextSchedules('next')}>
                              <ChevronRight className="svg-icon_small icon-dark icon-pointer"/>
                           </div>

                     
                     </div>
                  </div>
                  <div class="col-4 p-0">
                     {/* <div class="project-tab" >   */}
                     <div class="project-tab" style = {{display : (this.props.location && !this.props.location.state) ? 'block' : 'none'}}> 
                        <div class="nav date-option nav-fill" id="nav-tab" role="tablist">
                           <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab"  aria-selected="true">{this.props.t("translate:CALENDAR")}</a>
                           <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false">{this.props.t("translate:TASKS")}</a>
                        </div>
                     </div>
                  </div>
               </div>
               <div className='utc-time_label'>
                  {this.scdlState.curTmZone}
               </div>
            </div>
            {(this.props.location && this.props.location.state && this.props.location.state.isCrWsScdl) ? (
               <div>
            <ScheduleListComponent lstVals = {this.props} schdlDate = {this.scdlState.schdlDate} getTT = {() => this.getSchedules(this.scdlState.schdlDate)}/>
                  {/* {this.props.aSchedules && this.props.aSchedules.length > 0 ? <ScheduleListComponent lstVals = {this.props} schdlDate = {this.scdlState.schdlDate}/> : <NoRecord crsname = {this.props.location.state.subNa} img={no_schedule} crseSchdlContnt={true} imgSize="no-data_img-default"/>}         */}
               </div>
            ) : 
            <div class="tab-content" id="nav-tabContent" style = {{display : (this.props.location && !this.props.location.state) ? 'block' : 'none'}}>
               <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                  <CalendarComponent calValues = {this.props} schdlDate = {this.scdlState.schdlDate}/>
               </div>
               <div className="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                  {this.props.aSchedules && this.props.aSchedules.length > 0 ? <ScheduleListComponent lstVals = {this.props} schdlDate = {this.scdlState.schdlDate} getTT = {() => this.getSchedules(this.scdlState.schdlDate)}/> : <NoRecord img={no_schedule} imgSize="no-data_img-default" scheduleContent={true}/>}
               </div>
            </div> 
            }
            {/* <ScheduleListComponent lstVals = {this.props} schdlDate = {this.scdlState.schdlDate}/>         */}
               {/* <div class="tab-content" id="nav-tabContent"> */}
                  {/* <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                     <CalendarComponent/>
                  </div> */}
                  {/* <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab"> */}
                     {/* {this.props.session && !_.isEmpty(this.props.session) && <ScheduleListComponent isAllScd = "true"/>} */}
                  {/* </div> */}
               {/* </div> */}
            </div>
         </div>
      </div>
         
        )
    }
}

// To get the reducers values
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.dashboardReducer,
   ...state.headerReducer,
   ...state.scheduleReducer
});

const mapDispatchToProps = {
   getTTSchedules,
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

const TabNavigator = (props) => <SchedulePageComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
