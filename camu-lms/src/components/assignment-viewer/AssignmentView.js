import React ,{ Component, lazy } from 'react';
import '../../styles/_assignmentviewStyle.scss';
import '../../styles/_commonLmsStyle.scss';
// import {PdfFile,UserRemove,Useradd,Book,Trash} from '../icons/Icons';
import {PdfFile,UserRemove,Useradd,Trash} from '../icons/Icons';
import { Award, Check,Circle,Edit,MessageSquare,MoreVertical,Slash,X} from 'react-feather';
import {MessageSelect} from '../icons/Icons'
import { connect } from 'react-redux';
import {withRouter,Link} from 'react-router-dom';
import _ from "lodash";
import { withTranslation } from 'react-i18next';
import SlideFooter from '../slide-footer/SlideFooter';
import queryString from 'query-string';
import HTTPService from "../../utils/http-util";
import {loadItems,getSubChapName,updateMarkAsDone,deleteItems, getAsgnAnalytics} from '../../store/actions/ContentActions';
import { updateCntViewLog } from '../../store/actions/AnalyticsAction';
import messageUtil from '../../utils/message-util';
import { lmsDateFormat,getHoursBetweenDates, getDaysCountBetween,lmsDateAndTimeFormat, lmsNonUTCDateAndTimeFormat, generateHexDecCode} from '../../utils/helper';
import AnalyticsService from '../../service/analytics-service';
import Table from '../table/Table';
import UserSession from '../../utils/UserSession';
import { getAllParticipantGroups } from "../../store/actions/ParticipantsAction";
import { getAssgnStuds } from '../../store/actions/GradeBookActions';
import StudentNameComponent from '../student-name/StudentName';

const Button = lazy(() =>
import('../button/Button')
);
const LmsEditorView = lazy(() =>
import('../lms-editor-view/LmsEditorView')
);
const ConversationComponent = lazy(() =>
import('../conversation/Conversation')
);
const StudentWrapper = lazy(() =>
import('../student-wrapper/StudentWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
const StaffWrapper = lazy(() =>
import('../staff-wrapper/StaffWrapper')
);
const AnalyticsWrapper = lazy(() =>
import('../analytics-wrapper/AnalyticsWrapper')
);
const LmsModal = lazy(() =>
import("../modal/LmsModal")
);
const FullViewModal =  lazy(() =>
import("../modal/FullViewModal")
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const FilePerview  = lazy(() =>
import('../file-perview/FilePerview')
);
const StudentArchiveConversationWrapper = lazy(() =>
   import('../stud-arch-conver-wrapper/StudentArchiveConversationWrapper')
);
class AssignmentViewComponent extends Component{
   constructor(props) {
      super(props);
      this.assgnmntId=undefined;
      this.values=undefined;
      this.state = {
        title:'',
        asgmntData:{},
        vSts:'',
        asDuDt:'',
        isLoadConv:false,
        diffInDays: '',
        hrs: '',
        aSubDt:'',
        grdSts:'',
        grdOn:'',
        mark:'',
        mxMrk:'',
        asgmnt:'',
        fdBk:'',
        GrdNm:'',
        subChapNm:'',
        rubricsTitle:'',
        isFdbk:false,
        asignDelModel:false,
        markAsDone:undefined,
        asgmtSts:'',             //Assignment Status
        isRubricsModal:false,    //Launch Rubrics Modal
        rubricsId:'',
        actAsgnBut : true,
        ntViewBut : false,
        viewBut : false,
        subBut : false,
        missBut : false,
        aStudAsgns : [],
        showEmptySt : false,
        oAsgnAnyltcs : {},
        groupData: {},
        submittedStudent: {}
      }
      // ASSIGNED STUDENT COLUMNS
      this.assignedStudColumn = [
         {
               id: "FNa",
               Header: this.props.t("translate:FIRST_NAME"),
               accessor: "FNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.FNa}</div>
                  );
               },
         },
         {
               id: "LNa",
               Header: this.props.t("translate:LAST_NAME"),
               accessor: "LNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.LNa}</div>
                  );
               },
         },
         {
               id: "AplnNum",
               Header: this.props.t("translate:ROLL_NO"),
               accessor: "AplnNum",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.AplnNum}</div>
                  );
               },
         },
         {
            id: "asgDt",
            Header: this.props.t("translate:ASSIGNED_ON"),
            accessor: "asgDt",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.asgDt ? lmsNonUTCDateAndTimeFormat(row.original.asgDt) : ""}</div>
               )
            },
            sortType: "basic"
         }
      ];

      this.analyticsColumns = this.assignedStudColumn;

      // NOT VIEWED STUDENT COLUMNS
      this.notViewedStudColumn = [
         {
            id: "FNa",
            Header: this.props.t("translate:FIRST_NAME"),
            accessor: "FNa",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.FNa}</div>
               );
            },
         },
         {
               id: "LNa",
               Header: this.props.t("translate:LAST_NAME"),
               accessor: "LNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.LNa}</div>
                  );
               },
         },
         {
               id: "AplnNum",
               Header: this.props.t("translate:ROLL_NO"),
               accessor: "AplnNum",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.AplnNum}</div>
                  );
               },
         }
      ];

      // VIEWED STUDENT COLUMNS
      this.viewedStudColumn = [
         {
            id: "FNa",
            Header: this.props.t("translate:FIRST_NAME"),
            accessor: "FNa",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.FNa}</div>
               );
            },
         },
         {
               id: "LNa",
               Header: this.props.t("translate:LAST_NAME"),
               accessor: "LNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.LNa}</div>
                  );
               },
         },
         {
               id: "AplnNum",
               Header: this.props.t("translate:ROLL_NO"),
               accessor: "AplnNum",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.AplnNum}</div>
                  );
               },
         },
         {
            id: "vwCnt",
            Header: this.props.t("translate:NO_OF_VIEW"),
            accessor: "vwCnt",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.vwCnt}</div>
               )
            },
         },
         {
            id: "frsVw",
            Header: this.props.t("translate:FIRST_VIEWED"),
            accessor: 'frsVw',
            Cell: ({ row }) => {
               return (
                  <div>{row.original.frsVw ? lmsNonUTCDateAndTimeFormat(row.original.frsVw) : ""}</div>
               )
            },
            sortType: "basic"
         },
         {
            id: "lstVw",
            Header: this.props.t("translate:LAST_VIEWED"),
            accessor: 'lstVw',
            Cell: ({ row }) => {
               return (
                  <div>{row.original.lstVw ? lmsNonUTCDateAndTimeFormat(row.original.lstVw) : ""}</div>
               )
            },
            sortType: "basic"
         }
      ];

      // SUBMITTED STUDENT COLUMNS
      this.submittedStudColumn = [
         {
            id: "FNa",
            Header: this.props.t("translate:FIRST_NAME"),
            accessor: "FNa",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.FNa}</div>
               );
            },
         },
         {
               id: "LNa",
               Header: this.props.t("translate:LAST_NAME"),
               accessor: "LNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.LNa}</div>
                  );
               },
         },
         {
               id: "AplnNum",
               Header: this.props.t("translate:ROLL_NO"),
               accessor: "AplnNum",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.AplnNum}</div>
                  );
               },
         },
         {
            id: "submDt",
            Header: this.props.t("translate:SUBMITTED_ON"),
            accessor: "submDt",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.submDt ? lmsNonUTCDateAndTimeFormat(row.original.submDt) : ""}</div>
               )
            },
            sortType: "basic"
         }
      ];

      // MISSED STUDENT COLUMNS
      this.missedStudColumn = [
         {
            id: "FNa",
            Header: this.props.t("translate:FIRST_NAME"),
            accessor: "FNa",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>{row.original.FNa}</div>
               );
            },
         },
         {
               id: "LNa",
               Header: this.props.t("translate:LAST_NAME"),
               accessor: "LNa",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.LNa}</div>
                  );
               },
         },
         {
               id: "AplnNum",
               Header: this.props.t("translate:ROLL_NO"),
               accessor: "AplnNum",
               sortType: "basic",
               Cell: ({ row }) => {
                  return (
                     <div>{row.original.AplnNum}</div>
                  );
               },
         }
      ];
   }

   getCurretParticipantGroups = () => {
      const AppState = this.props.location.state
      const oCommonPayload = {
         PrID: AppState?.PrID,
         CrID: AppState?.CrID,
         DeptID: AppState?.DeptID,
         SemID: AppState?.SemID,
         AcYr: AppState?.AcYr,
         SecID: AppState?.SecID,
         SubjId: AppState?.subId,
       };
       this.props.getAllParticipantGroups(oCommonPayload)
   }

   getAssesmentStudents =  (contentId) => {
      const AppState = this.props.location.state
      const oAssignmentPayload = {
         AcYr: AppState.AcYr,
         InId: AppState.InId,
         DeptID: AppState.DeptID,
         PrID: AppState.PrID,
         CrID: AppState.CrID,
         SemID: AppState.SemID,
         SecID: AppState.SecID,
         subId: AppState.subId,
         asgnmntId: contentId,
      };
      this.props.getAssgnStuds(oAssignmentPayload)
   }

   componentDidMount(){
      AnalyticsService.setCurrPage('ASGN_VW');
      if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content
         this.getAssignmentDetails('initialCall');
      }
      this.getCurretParticipantGroups()
   }
   //Get the Assignment details by id
   getAssignmentDetails=(initLoad,asmntId)=>{
         let oReq={};
         if(asmntId){
            this.assgnmntId=asmntId;
             oReq = {
               _id: asmntId,
               sChpId:  this.values.subId
            }
            this.getAssesmentStudents(asmntId)
         }else if(this.props.location.search && !_.isEmpty(this.props.location.search)){
            this.values = queryString.parse(this.props.location.search);
            if(this.values && this.values.id){
               this.assgnmntId=this.values.id;
               oReq = {
                        _id: this.values.id,
                        sChpId:  this.values.subId
               }
            }
            this.getAssesmentStudents(this.values.id)
         }
         HTTPService.post('/teaching-content/get-subchapter-items', oReq, null,(err, response)=>{                                                                                                                                                                                                                                                                                                        
               if (response && response.output) {                                                                                                                                                                                                                                                                                                      
                  if(response.output.errors && response.output.errors.code && response.output.errors.code === "NO_DOCS_FOUND"){
                     messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
                  }else if (response.output.data && response.output.data.aContents && response.output.data.aContents.length>0) {
                     let currentGroup = undefined;
                     if(response.output.data.aContents[0].asgmnt && response.output.data.aContents[0].asgmnt?.isGroup){
                      const currentSession = UserSession.getSession()
                      const currentUser = currentSession?.mappedid;
                      if(this.props?.participantGroups && this.props?.participantGroups.length){
                        const currentGroupData = this.props?.participantGroups.find((gp) =>{
                           if(gp?.students && gp?.students?.length){
                              if(gp.students.some(s => s?.studId === currentUser )){
                                 return gp
                              }
                           }
                        })

                        if(currentGroupData && this.props?.aStudents && this.props?.aStudents.length){
                           currentGroupData.students.map((d) =>{
                              const currentStud = this.props?.aStudents.find((stud) => stud.studId === d.studId)
                              if(currentStud){
                                 d.FNa = currentStud?.FNa
                                 d.LNa = currentStud?.LNa
                                 d.AplnNum = currentStud?.AplnNum
                                 if(currentStud && Object.keys(currentStud?.sAsgmt)?.length){
                                    this.setState((prev) => ({...prev, submittedStudent:currentStud}))
                                 }
                              }
                              return d
                           })
                          currentGroup = currentGroupData
                        }
                        
                      }
                     }
                     this.setState({title:response.output.data.aContents[0].title,
                        asgmntData:response.output.data.aContents[0].asgmnt,
                        rubricsTitle:response.output.data.aContents[0].asgmnt.rubTitle,
                        rubricsId:response.output.data.aContents[0].asgmnt.rbrcId,
                        vSts:response.output.data.aContents[0].vSts,
                        aSubDt:response.output.data.aContents[0].aSubDt,
                        grdSts:response.output.data.aContents[0].grdSts,
                        grdOn:response.output.data.aContents[0].grdOn,
                        mark:response.output.data.aContents[0].mark,
                        fdBk:response.output.data.aContents[0].fdBk,
                        aSelRatings:response.output.data.aContents[0].aRtng,
                        GrdNm:response.output.data.aContents[0].GrdNm,
                        subChapNm:response.output.data.aContents[0].subChapNm,
                        markAsDone:response.output.data.aContents[0].markAsDone,
                        asgmtSts:response.output.data.aContents[0].asgmSts,
                        isAlCn:response.output.data.aContents[0].isAlCn,
                        isVlPlgm:response.output.data.aContents[0].isVlPlgm,
                        groupData: currentGroup
                     });
                     
                     //Calculate no.of days and hours between two dates
                     if (response.output.data.aContents[0].asgmnt && response.output.data.aContents[0].asgmnt.isLtSu && response.output.data.aContents[0].asgmnt.asDuDt && response.output.data.aContents[0].asgmnt.asDuDt.length) {
                        const today = new Date();
                        const dueDt = new Date( response.output.data.aContents[0].asgmnt.asDuDt);
                        const days = getDaysCountBetween(today,dueDt);
                        const hours = getHoursBetweenDates(today,dueDt);
                        this.setState({ diffInDays: days > 0 && days, hrs: hours > 0 && hours});
                     }
                     if(response.output.data.aContents[0].asgmnt){
                        this.setState({ grdCnf : response.output.data.aContents[0].asgmnt.grdCnf, mxMrk : response.output.data.aContents[0].asgmnt.mxMrk, asAvPr : response.output.data.aContents[0].asgmnt.asAvPr, isAlSt:response.output.data.aContents[0].asgmnt.isAlSt,isGroup :response.output.data.aContents[0].asgmnt.isGroup});
                     }
                     if(response.output.data.oAsndDtls){
                        this.setState({oAsndDtls : response.output.data.oAsndDtls});
                     }
                  }else if(response.output.data && response.output.data.aContents && response.output.data.aContents.length === 0){
                     messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
                  }
               }else{
                  messageUtil.showError("UNKNOWN_ERROR", false);
               }
               //Check this is comes from assignment view or content view
               if(!this.props.location.state.allSchdl && !this.props.location.state.crsSchdl){
                  if(this.values.assgnmntView){
                     if(initLoad){
                        this.props.loadItems(null,null,this.props.location.state,"ASGMNT");
                        this.props.getSubChapName();
                     }
                  }else{
                     if(initLoad){
                        this.props.loadItems(this.values.chapId,this.values.subId,this.props.location.state,false);
                        this.props.getSubChapName(this.state.subChapNm);
                     }
                  }
               }
         })

   }

   // go to previous page

   goToPrevious = () => {
      if(this.props.location.state.allSchdl){                                 // From overall schedule page
         this.props.history.push({pathname:"/Schedule-page", state : '', hideComp : true});
      }else if(this.props.location.state.crsSchdl){                           // From course-wise schedule page
         this.props.history.push({pathname:"/home-page/schedule-page",state:this.props.location.state});
      }else if(this.values && this.values.assgnmntView){
         this.props.history.push({pathname:"/home-page/assignment-list",state:this.props.location.state});
      }else{
         this.props.history.push({pathname:'/home-page/content-page',state:this.props.location.state,itemObj:true});
      }
   }

   // Publish and unpublish
   publishContent = (publishKey)=>{
      let oReq ={
         _id: this.values.id,
         vSts: publishKey,
         staffId: this.props.location.state.StaffId,
         isAlCn:this.state.isAlCn,
         isVlPlgm:this.state.isVlPlgm
      }
      if (this.state.asgmntData && this.state.asgmntData.atcmnt) {
         oReq.atcmnt = this.state.asgmntData.atcmnt;
      }
      if((this.values && this.values.rubId) || (this.state.asgmntData &&this.state.asgmntData.rbrcId)){
         oReq.rbrcId = this.values.rubId || this.state.asgmntData.rbrcId;
      }else{
         oReq.rbrcId = '';
      }
      if(this.state.asgmntData?.isGroup){
         oReq.isGroup = true;
      }else{
         oReq.isGroup = false;
      }
      HTTPService.post('/lms-asgnmnt/publish-assgmnt-frm-lms', oReq, null, (err, data) => {
         //handle err and success
         if(data && data.output){
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONT_DET_FND"){
               messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
            }else if(data.output.data && !_.isEmpty(data.output.data)){
               this.setState({vSts:data.output.data.vSts});
            }else {
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         }else {
            messageUtil.showError("UNKNOWN_ERROR", false);
         } 
         
      });
   }

   // go to student grading page

   goToStudGrad = () => {
      this.props.history.push({pathname: '/home-page/assgnmnt-grad', state: this.props.location.state, search:`?id=${this.values.id}&frmAsgn=${true}`});
   }
   //Assignment View from footer navigation
   asgmntFooterChange =(asgmntId,type, currPage)=>{
      this.values.id = asgmntId;
      // if(type === 'ASGMNT'){
         // Creating view log for student
         if(UserSession.isStudent()){
            const chckCurPage = AnalyticsService.getCurrPageDetails();
            // Only create if the same content is continued while navigation coz it will not re-render component
            if(chckCurPage && (currPage !== chckCurPage.pgNm)){
               return;
            }
            const oLog = {
               isEnCurCrtNwLg : true,  // End current log for current content and create new for next or prev content
               currPage : currPage,
               id : asgmntId
            };
            if(this.props.location && this.props.location.state && this.props.location.state.subId){
               oLog.subId = this.props.location.state.subId;
               oLog.AcYr = this.props.location.state.AcYr;
               oLog.SemID = this.props.location.state.SemID;
            }
            this.props.updateCntViewLog(oLog);
         }
         this.setState({ aStudAsgns : [], showEmptySt : false, isLoadConv: false, actAsgnBut : true, ntViewBut : false, viewBut : false, subBut : false, missBut : false})
         this.getAssignmentDetails(null,asgmntId);
         this.values.id = asgmntId;
         this.getAssgnAnalytcs(null, asgmntId);
      // }
   }

   //Complete mark as done by student
   markAsDone=()=>{
      if(this.values && this.values.id && this.values.id.length){
         const oMrkReq={
            cntId:this.values.id
         }
         this.props.updateMarkAsDone(oMrkReq,this.markAsDoneClbk);
      }
   }
   //Mark as done callback
   markAsDoneClbk=(status)=>{
      this.setState({markAsDone:status});
   }
   // Delete Assignment in Assignment view
   deleteAsign = () => {
      this.props.deleteItems(this.values.id, this.navigateCours);
   }
   // Navigate to Course page
   navigateCours = (isNavi) => { // is Navigation value boolean
      if (isNavi) {
         this.setState({ ...this.state, asignDelModel: false });
         this.props.history.push({ pathname: '/home-page/content-page', search:`?chapIndex=${this.values.chapIndex}`, state: this.props.location.state, itemObj: this.values });
      }

   }

   // get assignment analytics
   getAssgnAnalytcs = (key, asgnmntId) => {
      const oStateUpdate = {
         actAsgnBut : false,
         ntViewBut : false,
         viewBut : false, 
         subBut : false, 
         missBut : false,
         aStudAsgns : [],
         showEmptySt : false,
      };
      if(!key){
         this.analyticsColumns = this.assignedStudColumn;
         oStateUpdate.actAsgnBut = true;
         this.setState(oStateUpdate);
      }else if(key === 'NOT_VIEW'){
         this.analyticsColumns = this.notViewedStudColumn;
         oStateUpdate.ntViewBut = true;
         this.setState(oStateUpdate);
      }else if(key === 'VIEW'){
         this.analyticsColumns = this.viewedStudColumn;
         oStateUpdate.viewBut = true;
         this.setState(oStateUpdate);
      }else if(key === 'SUB'){
         this.analyticsColumns = this.submittedStudColumn;
         oStateUpdate.subBut = true;
         this.setState(oStateUpdate);
      }else if(key === 'MISS'){
         this.analyticsColumns = this.missedStudColumn;
         oStateUpdate.missBut = true;
         this.setState(oStateUpdate);
      }
      const oAsgnReq = {
         id : this.values.id,
         actKey : key
      };
      this.props.getAsgnAnalytics(oAsgnReq, (data) => {
         this.setState({showEmptySt : true, oAsgnAnyltcs : data, aStudAsgns : data.aStudAsgns});
      });
   }

   render() {
      const { asgmntData, title, vSts, isLoadConv, diffInDays, hrs, aSubDt, fdBk, subChapNm, markAsDone, asgmtSts ,asignDelModel,rubricsTitle,isAlCn, isVlPlgm} = this.state;
      const isArchCrsEnable = UserSession.getArchCrsDtls();
      const totStud = this.state.oAsndDtls && this.state.oAsndDtls.totStud;
      const studentText = totStud > 1 ? this.props.t("translate:SMALL_STUDENTS") : this.props.t("translate:STUDENT");
      return (
         <div>
            <div className="view-content_box">
               <div className="files-options">
                  {/* 
      <div className="hide-content_view"  onClick={()=>
         this.props.history.go(-1)}> */}
                  <div className="hide-content_view" onClick={() => this.goToPrevious()}>
                     <X className="svg-icon_small icon-dark icon-pointer" />
                  </div>
                  {!this.props.location.state?.isDisabledContent &&
                     <StaffWrapper>
                        <div className="view-options">
                           <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>{this.values && this.values.assgnmntView ?
                              <Link to={{ pathname: '/home-page/assignment', search: `?id=${this.assgnmntId}&assgnmntView=${true}`, state: this.props.location.state }}>
                                 <Edit className="svg-icon_small icon-dark" />
                              </Link>
                              : <Link to={{ pathname: '/home-page/assignment', search: `?id=${this.assgnmntId}&chapId=${this.values && this.values.chapId}&subId=${this.values && this.values.subId}`, state: this.props.location.state }}>
                                 <Edit className="svg-icon_small icon-dark" />
                              </Link>
                           }</UIPerWrapper>
                           <UIPerWrapper perCode={["rp_can_delete_lms_content"]}><div className="more-options">
                              <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                 <MoreVertical className="svg-icon_small icon-dark icon-pointer left-icon" />
                              </div>
                              <div class="dropdown-menu edit-chapter_cont">
                                 {/* <div class="dropdown-item user-info_contents"  >
                                    <X className="svg-icon_light  icon-default" />
                                    <span className="option-list_dropdown">Discard changes</span>
                                 </div> */}

                                 <div class="dropdown-item user-info_contents" onClick={()=>this.setState({...this.state,asignDelModel:true})}>
                                    <Trash iconStyle="svg-icon_light  icon-error" />
                                    <span className="option-list_dropdown delete-option_btn">{this.props.t("translate:CHAPTERLISTCOMPONENT_DELETE")}</span>
                                 </div>
                              </div>
                           </div></UIPerWrapper>

                        </div>
                     </StaffWrapper>
                   }
               </div>

               <div className="assignment-view_container">
                  <div>
                  {!this.props.location.state?.isDisabledContent &&
                     <StaffWrapper>
                        <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{vSts && vSts === 'F' ?
                           <div className="assignment-view_header">
                              <p className="assignment-header_label">{this.props.t("translate:LEARNERS_ACCESS_ITEM")}</p>
                              <Button theme="btn-rounded secondary-btn btn-outline" clicked={() => this.publishContent('D')}>
                                 {this.props.t("translate:UNPUBLISHED")}
                              </Button>
                           </div>
                           :
                           <div className="assignment-view_header">

                              <p className="assignment-header_label"> <Slash className="svg-icon_small icon-dark icon-space_left" />{this.props.t("translate:LEARNERS_CANT_ACCESS_ITEM")}</p>
                              <Button theme="btn-rounded secondary-btn btn-outline" clicked={() => this.publishContent('F')}>
                                 {this.props.t("translate:PUBLISHED")}
                              </Button>
                           </div>
                        }</UIPerWrapper>
                     </StaffWrapper>
                  }
                  </div>
                  <div className="assignment-header_container">
                     <div className="assignment-heading_cont">
                        {subChapNm && subChapNm.length > 0 && <p className="assignment-subchapter_label">{subChapNm}</p>}
                        <p className="assignment-heading_label">{title}</p>
                        <StaffWrapper>
                           <p className="assignment-heading_date">{this.props.t("translate:STUD_ASMNT_DUE")} {asgmntData && asgmntData.asDuDt ? lmsDateAndTimeFormat(asgmntData.asDuDt) : '-'}</p>
                        </StaffWrapper>
                        <StudentWrapper>
                           {(asgmtSts === "SUB" || asgmtSts === "NS") &&
                              <p className="assign-due">{this.props.t("translate:DUE")}
                                 {asgmntData && asgmntData.asDuDt ? lmsDateAndTimeFormat(asgmntData.asDuDt) : '-'}
                              </p>
                           } 
                        </StudentWrapper>
                        {asgmtSts === "subLate" ?
                           <p className="over-due_info">{this.props.t("translate:OVERDUE_BY")} {diffInDays} {this.props.t("translate:DAYS")} {hrs} {this.props.t("translate:ASSIGNMENT_SUBMITTED_LATE")}</p>
                           : asgmtSts === "missed" ? <p className="over-due_info">{this.props.t("translate:DUE_DATE_OVER")} {asgmntData && asgmntData.asDuDt && lmsDateAndTimeFormat(asgmntData.asDuDt)}</p> : null
                        }
                        {asgmtSts === "NS" &&
                           <p className="todo-label">{this.props.t("translate:TODO_MAKE_A_SUBMISSION")}</p>
                        }
                     </div>
                     {/* <Button theme="btn-rounded default" >
            View submissions
               </Button> */}
                     {!this.props.location.state?.isDisabledContent &&
                        <StaffWrapper>
                           <UIPerWrapper perCode={["rp_can_enter_lms_grade"]}><div className="stud-assignment_btn">
                              <Button theme="btn-rounded default btn-left" clicked={() => this.goToStudGrad()}> {this.props.t("translate:Grade")}</Button>
                           </div></UIPerWrapper>
                        </StaffWrapper>
                     } 

                     <StudentWrapper>
                        <div className="stud-assignment_btn">
                           {/* check whether the student completed the mark as done or not */}
                           <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}>
                           {markAsDone ?
                              <Button theme="btn-rounded positive-btn btn-left">{this.props.t("translate:COMPLETED")}</Button>
                              : !markAsDone && markAsDone !== undefined ?
                                 <Button theme="btn-rounded btn-outline btn-left" clicked={() => this.markAsDone()}>{this.props.t("translate:MARK_AS_COMPLETED")}</Button>
                                 : null
                           }
                           </StudentArchiveContentWrapper>
                           {/* Check the students assignment status */}
                           {asgmtSts === "subLate" && !this.values.pastAsgmnt ?
                              <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}>
                                 <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission', search: `?cntId=${this.values.id}&submit=${true}`, state: {...this.props.location.state, isGroup:asgmntData?.isGroup, groupData: this.state.groupData} })}>
                                    {this.props.t("translate:SUBMIT_LATE")}
                                 </Button>
                              </StudentArchiveContentWrapper>
                              : asgmtSts === "NS" && !this.values.pastAsgmnt ?
                                 <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}>
                                 <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission', search: `?cntId=${this.values.id}&submit=${true}`, state: {isVlPlgm:this.state.isVlPlgm,...this.props.location.state, isGroup:asgmntData?.isGroup, groupData: this.state.groupData} })}>
                                    { asgmntData?.isGroup ? this.props.t("translate:SUBMIT_ASSIGNMENT_GROUP") : this.props.t("translate:SUBMIT_ASSIGNMENT")}
                                 </Button>
                                 </StudentArchiveContentWrapper>
                                 : asgmtSts === "SUB" ?
                                    <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission', search: `?cntId=${this.values.id}&pastAsgmnt=${this.values.pastAsgmnt ? true : false}`, state: {...this.props.location.state, isGroup:asgmntData?.isGroup, groupData: this.state.groupData} })}>
                                       {this.props.t("translate:VIEW_SUBMISSION")}
                                    </Button>
                                    : null
                           }
                        </div>
                     </StudentWrapper>


                  </div>



                  {/* ...............................tabs selection code......................  */}
                  <div class="project-tab">
                     <div class="student-rating_tab">
                        <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                           <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true" onClick={() => this.setState({ isLoadConv: false })}>{this.props.t("translate:OVER_VIEW")}</a>
                           <StudentArchiveConversationWrapper>
                              {isAlCn && <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={() => this.setState({ isLoadConv: true })}>{this.props.t("translate:CONVERSATION")}</a>}
                           </StudentArchiveConversationWrapper>
                           {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false"onClick={()=>this.setState({isLoadConv:false})}>{this.props.t("translate:NOTES")}</a> */}
                           <StaffWrapper>
                              <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-4" role="tab" aria-selected="false" onClick = {() => this.getAssgnAnalytcs()}>{this.props.t("translate:ANALYTICS")}</a>
                           </StaffWrapper>
                        </div>
                     </div>
                     <div class="tab-content student-rating" id="nav-tabContent">
                        <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                           <div className="assignment-tab_container">
                              {asgmntData && asgmntData.asmCnt && asgmntData.asmCnt !== "<p><br></p>" &&
                                 <div className="description-header">
                                    <p className="description-header_label">{this.props.t("translate:DESCRIPTION")}</p>
                                    <p className="assign-content">
                                       <LmsEditorView contentData={asgmntData.asmCnt} />
                                    </p>
                                    {/* <p className="more-content_label">Read more</p> */}
                                 </div>
                              }
                              <div className="attached-header">
                                 {asgmntData && asgmntData.atcmnt && asgmntData.atcmnt.length > 0 && <p className="attached-header_label">{this.props.t("translate:ATTACHMENT")}</p>}
                                 <FilePerview fileData={asgmntData.atcmnt} isPerview={false} pervWidth={"100%"} pervHeight={"500px"} isMultiple={true}/>
                              </div>
                              {asgmntData && asgmntData?.isGroup && this.state.groupData && <div>
                                 <p className="attached-header_label">{this.props.t("translate:ASSIGNMENT_VIEW_GROUP_ASSIGNMENT")}</p>
                                 <div className='group-name-view'>
                                    <div className='d-flex justify-content-between'>
                                       <p className='assignment-subchapter_label'>{this.state.groupData?.groupName && this.state.groupData?.groupName}</p>
                                       <div className="view-option_cont">
                                          <div
                                             id="dropdownMenuButton"
                                             data-toggle="dropdown"
                                             aria-haspopup="true"
                                             aria-expanded="false"
                                             className="option-dropdown"
                                          >
                                             <p className="group-info-label-link ml-1">View Students</p>
                                          </div>
                                          <div class="dropdown-menu view-options_cont_studs">
                                             {this.state.groupData?.students.map((stud) => (
                                             <div class="dropdown-item user-info_contents">
                                                <span className="view-options_dropdown">
                                                <StudentNameComponent
                                                   className="student-name_icon"
                                                   fName={stud?.FNa?.substring(0, 1)}
                                                   clrCode={generateHexDecCode(stud?.studId)}
                                                   /> {stud?.AplnNum} - {stud?.FNa}
                                                </span>
                                             </div>
                                             ))}
                                          </div>
                                       </div>

                                    </div>
                                 </div>
                              </div>
                              }
                              <div className="student-assignment_status">
                                 {(asgmtSts === "NS" || asgmtSts === "subLate") &&
                                    <div className="assignment-incomplete">
                                       <p> <Circle className="svg-icon_small icon-primary icon-space_left" />{this.props.t("translate:NOT_COMPLETED")}</p>
                                    </div>
                                 }
                                 {asgmtSts === "missed" &&
                                    <div className="assignment-incomplete">
                                       <p> <Circle className="svg-icon_small icon-error icon-space_left" />{this.props.t("translate:ASSIGNMENT_MISSED")}</p>
                                    </div>
                                 }

                                 {/* {this.values && this.values.asgmSts && this.values.asgmSts == 'submitted' &&
                     <div className="assignment-complete">
                     <div className="assignment-complete_details">
                        <Check className="svg-icon_default icon-positive"/>
                        <div className="complete-label">
                           <p className="submit_label">{this.props.t("translate:SUBMITTED")}</p>
                           <p className="submit_date">{aSubDt && aSubDt.length && lmsDateAndTimeFormat(aSubDt)}</p>
                        </div>
                     </div>
                   </div>
                  } */}
                                 {/* {this.values && this.values.asgmSts && this.values.asgmSts == 'graded' && */}
                                 {(this.state.grdSts && this.state.grdSts === 'GRD') ?
                                    (
                                       <div className="grade-view_container">
                                          <div className="grade-view">
                                             <div className="grade-complete_details">
                                                <Award className="svg-icon_default icon-primary" />
                                                <div className="complete-label">
                                                   <p className="grade_label">{this.props.t("translate:GRADE_RECEIVED")}</p>
                                                   <p className="submit_date">
                                                      {/* on Nov 30, 2020, 9:07 AM */}
                                                      {this.state.grdOn && lmsDateAndTimeFormat(this.state.grdOn)}
                                                   </p>
                                                </div>
                                             </div>
                                             <div className="grad-label_content">
                                                <div className="grade-point_value">
                                                   {this.state.asgmntData.grdCnf === 'POINT' ?
                                                      <p className="grade-value_point">
                                                         <span>{this.state.mark}</span> /{this.state.asgmntData.mxMrk}</p>

                                                      : <p className="grade-value_point"><span>{this.state.GrdNm}</span> {this.props.t("translate:STUD_ASMNT_GRADE")}</p>
                                                   }
                                                </div>
                                                {fdBk &&
                                                   <div className="grade-comment">
                                                      <p className="grade-comment_message">{this.state.isFdbk ?
                                                         <MessageSelect iconStyle="svg-icon_default icon-dark icon-pointer" onClick={() => this.setState({ isFdbk: !this.state.isFdbk })} />
                                                         : (<p className="grade-comment_notification"><MessageSquare className="svg-icon_default icon-dark icon-pointer" onClick={() => this.setState({ isFdbk: !this.state.isFdbk })} />
                                                            <span className="feedback_notification"></span>
                                                         </p>)}
                                                      </p>
                                                      <p className="grade-comment_label">{this.props.t("translate:FEEDBACK")}</p>
                                                   </div>
                                                }
                                             </div>
                                          </div>
                                          {this.state.isFdbk &&
                                             <div className="stud-feedback_view">
                                                <p>{fdBk}</p>
                                             </div>
                                          }
                                       </div>
                                    ) :
                                    <div>
                                       {asgmtSts === "SUB" &&
                                          <div className="assignment-complete">
                                             <div className="assignment-complete_details">
                                                <Check className="svg-icon_default icon-positive" />
                                                <div className="complete-label">
                                                   <p className="submit_label">{this.props.t("translate:SUBMITTED")}</p>
                                                   <p className="submit_date"> {asgmntData?.isGroup && this.props.t("translate:AS_GROUP_ASSIGNMENT_BY")} {asgmntData?.isGroup && this.state?.submittedStudent?.FNa ? this.state?.submittedStudent?.FNa : ""} {asgmntData?.isGroup && this.props.t("translate:ON")} {aSubDt && aSubDt.length && lmsNonUTCDateAndTimeFormat(aSubDt)}</p>
                                                  
                                                </div>
                                             </div>
                                          </div>
                                       }
                                    </div>
                                 }

                                 {/* <div className="grad-label_content">
                      <p className="submit_grad">Not graded yet</p>
                   </div> */}
                              </div>
                              <StaffWrapper>
                                 <div class="student-rating_box">
                                    <div className="row m-0">
                                       <div className="col-4 p-0">
                                          <div class="rating__box divide-cont">
                                             {this.state.oAsndDtls &&
                                                <p className="point-table">{this.state.oAsndDtls.submtCnt} <span>{this.props.t("translate:OF")}</span> {this.state.oAsndDtls.totStud}</p>
                                             }
                                             <p className="point-name">{this.props.t("translate:SUBMITTED")}</p>
                                          </div>
                                       </div>
                                       <div className="col-4 p-0">
                                          <div class="rating__box divide-cont">
                                             <p className="point-table">
                                                <Useradd iconStyle="icon-positive svg-icon_small icon-center icon-space_left" />
                                                {this.state.oAsndDtls && this.state.oAsndDtls.grdCnt}
                                             </p>
                                             <p className="point-name">{this.props.t("translate:GRADED")}</p>
                                          </div>
                                       </div>
                                       <div className="col-4 p-0">
                                          <div class="rating__box">
                                             <p className="point-table">
                                                <UserRemove iconStyle="icon-secondary svg-icon_small icon-center icon-space_left" />
                                                {this.state.oAsndDtls && this.state.oAsndDtls.ndGrdCnt}
                                             </p>
                                             <p className="point-name">{this.props.t("translate:GRAD_NEED_GRADING")}</p>
                                          </div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="grade-formats">
                                    <div class="row m-0">
                                       <div class="col-2 p-0">
                                          <p className="form-list_points"><span className="point-notification"></span> {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_GRADE")}</p>
                                       </div>
                                       <div class="col-10 p-0">
                                          {this.state.grdCnf && this.state.grdCnf === "POINT" ?
                                             <p className="form-list_value">{this.state.mxMrk} {this.props.t("translate:MAX_POINTS")}</p>
                                             : <p className="form-list_value">{this.state.oAsndDtls && this.state.oAsndDtls.grdMxMrk} {this.props.t("translate:MAX_POINTS")}</p>
                                          }
                                       </div>
                                       <div class="col-2 p-0">
                                          <p className="form-list_points"><span className="point-notification"></span>{this.props.t("translate:AVAILABILITY")}</p>
                                       </div>
                                       <div class="col-10 p-0">
                                          <p className="form-list_value subject_selection">{this.state.asAvPr ? <span> {lmsDateFormat(this.state.asAvPr)}</span> : ''}</p>
                                       </div>
                                       <div class="col-2 p-0">
                                          <p className="form-list_points"><span className="point-notification"></span> {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_PARTICIPANTS")}</p>
                                       </div>
                                       <div class="col-10 p-0">
                                       <p className="form-list_value">{this.state.isAlSt ? this.props.t("translate:EVERYONE"): this.state.isGroup? this.props.t("translate:GROUPS"): this.props.t("translate:SPECIFIC")}({this.state.oAsndDtls && this.state.oAsndDtls.totStud} {studentText})</p>
                                       </div>
                                       <div class="col-2 p-0">
                                          <p className="form-list_points"><span className="point-notification"></span> {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_RUBRICS")} :</p>
                                       </div>
                                       {rubricsTitle ?
                                       <div class="col-10 p-0" onClick={()=>this.setState({isRubricsModal:true})}>
                                          <p className="rubric-assign_label">{rubricsTitle}</p>
                                       </div> :
                                          <p>-</p>
                                       }
                                    </div>
                                 </div>
                              </StaffWrapper>
                              <StudentWrapper>
                                 <div className="grade-formats">
                                    <div class="row m-0">
                                       <div class="col-2 p-0">
                                          <p className="form-list_points"><span className="point-notification"></span> {this.props.t("translate:ASSIGNMENTVIEWCOMPONENT_RUBRICS")} :</p>
                                       </div>
                                       {rubricsTitle ? 
                                       <div class="col-10 p-0" onClick={()=>this.setState({isRubricsModal:true})}>
                                          <p className="rubric-assign_label">{rubricsTitle}</p>
                                       </div> :
                                       <p>-</p>}
                                    </div>
                                 </div>
                              </StudentWrapper>
                           </div>
                        </div>
                        <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                           <div className="assignment-tab_container">
                              {isLoadConv && <ConversationComponent type='ASGMNT' title={title} />}
                           </div>
                        </div>

                        <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                           <div className="assignment-tab_container">
                              <p>{this.props.t("translate:NOTES_CONTENT")}</p>
                           </div>
                        </div>

                        <div class="tab-pane fade" id="tab-4" role="tabpanel" aria-labelledby="nav-profile-tab">
                           <div className="analytics-tab_container">
                              <div className="analytics-tab_btns" id="scroll-style_lite">
                                 <Button theme = {this.state.actAsgnBut ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'} clicked = {() => this.getAssgnAnalytcs()}>{this.props.t("translate:ASSIGNED")} <span className={this.state.actAsgnBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.asgnCnt}</span>}</span>
                                 </Button>
                                 <Button theme = {this.state.ntViewBut ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'} clicked = {() => this.getAssgnAnalytcs('NOT_VIEW')}>{this.props.t("translate:NOT_VIEWED")} <span className={this.state.ntViewBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.ntVwCnt}</span>}</span>
                                 </Button>
                                 <Button theme = {this.state.viewBut ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'} clicked = {() => this.getAssgnAnalytcs('VIEW')}>{this.props.t("translate:VIEWED")} <span className={this.state.viewBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.viewCnt}</span>}</span>
                                 </Button>
                                 <Button theme = {this.state.subBut ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'} clicked = {() => this.getAssgnAnalytcs('SUB')}>{this.props.t("translate:SUBMITTED")}<span className={this.state.subBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.submCnt}</span>}</span>
                                 </Button>
                                 {/* <Button theme = {this.state.actButn ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'}>Submitted late <span className={this.state.actAsgnBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.asgnCnt}</span>}</span>
                                 </Button> */}
                                 <Button theme = {this.state.missBut ? 'active-button_class btn-rounded button-lite' : 'btn-rounded button-lite'} clicked = {() => this.getAssgnAnalytcs('MISS')}>{this.props.t("translate:MISSED_ANALYTICS")}<span className={this.state.missBut ? 'analytics-btn_total--select' : 'analytics-btn_total'}>{this.state.oAsgnAnyltcs && <span>{this.state.oAsgnAnyltcs.misdCnt}</span>}</span>
                                 </Button>
                              </div>
                           </div>
                           <div className="analytics-tab_table">
                              {
                                 (this.state.aStudAsgns && this.state.aStudAsgns.length) ?
                                 <div className="table-list_container">
                                    <Table data={this.state.aStudAsgns} columns={this.analyticsColumns} defaultSortBy="FNa" disablePagination={true}/>    
                                 </div>
                                 : 
                                 <div>
                                    {
                                       this.state.showEmptySt && 
                                       <div className="empty-state_analytics">
                                          {this.props.t("translate:NO_STUDENT_ANALYTICS")}
                                       </div>
                                    }
                                 </div>
                              }
                           </div>
                        </div>
                     </div>
                  </div>


                  {/* <div className="assignment-header">
         <StaffWrapper>
         {vSts && vSts ==='F' && 
            <Button theme="btn-rounded positive-btn">
               <Select iconStyle="svg-icon_small" />&nbsp;
               {this.props.t("translate:PUBLISHED")} &nbsp;
               <ChevronDown className="svg-icon_small" />
            </Button>
          }
         <Button theme="btn-rounded default btn-left">
            {this.props.t("translate:Grade")}
         </Button>
         </StaffWrapper>
         <StudentWrapper>

            {this.values && this.values.isLtSu && this.values.isLtSu == 'true' &&
               <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission',search:`?cntId=${this.values.id}`+`&submit=${true}`, state: this.props.location.state })}>
               {this.props.t("translate:SUBMIT_LATE")}
               </Button>
            }
     
            {this.values && this.values.asgmSts && (this.values.asgmSts == 'submitted' || this.values.asgmSts == 'graded') ?
               <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission',search:`?cntId=${this.values.id}`+`&pastAsgmnt=${this.values.pastAsgmnt ? true : false}`, state: this.props.location.state })}>
               {this.props.t("translate:VIEW_SUBMISSION")}
               </Button>:null
            }
          
            {this.values && !this.values.pastAsgmnt && this.values.asgmSts && this.values.asgmSts == 'notSub' && 
               <Button theme="btn-rounded default" clicked={() => this.props.history.push({ pathname: '/home-page/assignment-submission',search:`?cntId=${this.values.id}`+`&submit=${true}`, state: this.props.location.state })}>
               {this.props.t("translate:SUBMIT_ASSIGNMENT")}
               </Button>
            }
         </StudentWrapper>
      </div> */}
                  {/* <div className="assignment-viewer">
         <p className="assign-header">{title}</p>
         {this.values && this.values.asgmSts && !this.values.pastAsgmnt && this.values.asgmSts != 'lateNt' &&
            <p className="assign-due">DUE: 
            { asgmntData && asgmntData.asDuDt ?  lmsDateFormat(asgmntData.asDuDt) : '-'}  
            </p>
         }
         {this.values && this.values.isLtSu && this.values.isLtSu == 'true'?
            <p className="over-due_info">Overdue by {diffInDays} days {hrs} hrs this assignment will be submitted late</p>
            :this.values && (this.values.isLtSu && this.values.isLtSu == 'false' || this.values.pastAsgmnt && this.values.asgmSts && this.values.asgmSts == 'notSub' || this.values.asgmSts && this.values.asgmSts == 'lateNt')? <p className="over-due_info">Due date over { asgmntData && asgmntData.asDuDt && lmsDateFormat(asgmntData.asDuDt)}</p>:null
         }
         {this.values && (this.values.isLtSu &&  this.values.isLtSu == 'true' || this.values.asgmSts && this.values.asgmSts == 'notSub' && !this.values.pastAsgmnt) &&
            <p className="todo-label">Todo: Make a submission</p>
         }
        
  
      </div> */}

               </div>


            </div>
            {asgmntData && title && !_.isEmpty(asgmntData) && !_.isEmpty(title) &&
               <SlideFooter sliderClbk={(asgmntId, type,currPage) => this.asgmntFooterChange(asgmntId, type,currPage)} sliderData={this.props.subChapItems} selectedId={this.assgnmntId} urlData={this.values} subChapNm={this.props.slecSubChapNm} />
            }
            {/* students analytics wrapper */}
            <StudentWrapper>
               {this.values && <AnalyticsWrapper values={this.values}></AnalyticsWrapper>}
            </StudentWrapper>

            {/* Rubrics Modal */}
            {this.state.isRubricsModal && <FullViewModal open={this.state.isRubricsModal} onClose={()=>this.setState({isRubricsModal:false})} aSelRatings = {this.state.aSelRatings} shwRat = {(this.state.aSelRatings && this.state.aSelRatings.length) ? true : false} rubrcId = {this.state.rubricsId} rubTitle = {this.state.rubricsTitle} isFrAsgn = {true} center={true} isRubrics={true}/>}

            {asignDelModel && <LmsModal open={asignDelModel}  onClose={()=>this.setState({...this.state,asignDelModel:false})}  value={title} modalTitle={this.props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={() => this.deleteAsign()} />}
         </div>
      )
    }
}
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.ParticipantReducer,
   ...state.gradeBookReducer
 })
const mapDispatchToProps={
   loadItems,
   getSubChapName,
   updateMarkAsDone,
   deleteItems,
   getAsgnAnalytics,
   updateCntViewLog,
   getAllParticipantGroups,
   getAssgnStuds
}  
const TabNavigator = (props) => <AssignmentViewComponent {...props} />

const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));
