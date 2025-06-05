
import React, { lazy, useEffect, useState, useRef } from 'react';
import { withTranslation } from 'react-i18next';
import { Info, Plus, ArrowLeft,  X,  Trash2 } from 'react-feather';
import {  MoreInfo, MinusCircle, Cross } from '../icons/Icons';
import '../../styles/_commonLmsStyle.scss';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import messageUtil from '../../utils/message-util';
import { connect } from 'react-redux';
import moment from 'moment';
import $ from 'jquery';
import '../../styles/_quizCreationStyle.scss';
import _ from 'lodash';
import RadioButton from '../radio-button/RadioButton';
import HTTPService from "../../utils/http-util";
import { generateHexDecCode } from '../../utils/helper';
import { getSpcAssignMntStudnts, getQuestion, addQuiz, updateFields } from '../../store/actions/ContentActions';
// import student_img from '../../assets/images/stud-img.png';
import SimpleReactValidator from 'simple-react-validator';
import ReactDatePicker from '../date-picker/DatePicker';

const Button = lazy(() =>
   import('../button/Button')
);
const InputBox = lazy(() =>
   import('../input-box/InputBox')
);
const StudentSearch = lazy(() =>
   import('../student-searchbox/StudentSearch')
);
const CheckBox = lazy(() =>
   import('../checkbox/CheckBox')
);
// const ReactTimePicker = lazy(() =>
//    import('../time-picker/TimePicker')
// );
// const LmsSelectDropDown = lazy(() =>
//    import('../lms-selectdropdown/LmsSelectDropDown')
// );
const LmsEditor = lazy(() =>
   import('../lms-editor/LmsEditor')
);
// const FileUrl = lazy(() =>
//    import('../fileurl/FileUrl')
// );
// const LmsFileUploader = lazy(() =>
//    import('../lms-fileuploader/LmsFileUploader')
// );
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const StudentNameComponent = lazy(()=>
import('../student-name/StudentName') 
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);


const QuizCreationComponent = (props) => {

   const [ assesNm, setAssesNm ]                        = useState('');
   const [ descr, setDescr ]                            = useState('');
   const [ isShowAns, setIsShowAns ]                    = useState(false);
   const [ shwAns, setShwAns ]                          = useState('');
   const [ isJumble, setIsJumble ]                      = useState(false);
   const [ isMultAtmpts, setIsMultAtmpts ]              = useState(false);
   // const [ noAttmpts, setNoAttmpts ]                    = useState('');
   const [ alttedTime, setAlttedTime ]                  = useState('E');
   // const [ enMkCm, setIsMrkAsCompt ]                    = useState(false);
   const [ qzDuDt, setAsDuDt ]                          = useState('');
   const [ isDuDt, setIsDuDt ]                          = useState(false);
   const [ stDate, setStDate ]                          = useState('');
   const [ endDt, setEndDt ]                            = useState('');
   const [ isQuizInstruct, setIsQuizInstruct ]          = useState(false);
   const [ stInstruct, setStInstruct ]                  = useState('');
   const [ endInstruct, setEndInstruct ]                = useState('');
   const [ isSpcStud, setIsSpcStud ]                    = useState(false);
   const [ isAlCn, setIsAlwCon ]                        = useState(false);
   const [ isProctr, setIsProctr ]                      = useState(false);
   const [ onBordAssemt, setOnBordAssemt ]              = useState(false);
   const [ ptrTmp, setProctrTmpt ]                      = useState('');
   const [ alttedMin, setAlttedMin ]                    = useState('');
   const [ isEndInstrctns, setIsEndInstrctns ]          = useState(false);
   const [isStInstrctns ,setIsStInstrctns]              = useState(false);
   const [ aSpcfStuds, setStuds ]                       = useState([]);
   const [ asmntStuds, setAsmntStuds ]                  = useState([]);
   const [ isDisCard,setIsDicard ]                      = useState(false);
   const [ cntId, setCntnttId ]                         = useState('');
   const [ asmntId, setAsmntId ]                        = useState('');
   // const [ isNaviCrs, setIsNaviCrs]                     = useState(false);
   const [, forceUpdate]                                = useState();
   const [studSearch, setStudSearch]                    = useState('');
   const [isAvaPrd , setAvaPrd]                         = useState(false);
   const [isStAt, setIsStAt]                            = useState(false);
   const [isEntAt, setIsEntAt]                          = useState(false);
 
   const history              = useHistory();
   const location             = useLocation();
   let oSrchVal               = queryString.parse(location.search);
   const errMsgQusRef         = useRef(null);  // Error scroll msg for questions 
   const errMsgAltRef         = useRef(null);  // Error scroll msg for allote time
 
   //For validation and mandatory fields check
   const validator = useRef(new SimpleReactValidator());
   
   // Get details for Assign to specific student
   useEffect(() => {
      props.updateFields('oQusPaper',{});
      getTheAsmntStuds();
      $('#myModal-page').modal('hide');
   }, // eslint-disable-next-line
   []);

   // Call the function after the students has loaded
   useEffect(() => {
      addQuestion();
      if(oSrchVal && oSrchVal.id && props.location.state && !_.isEmpty(props.location.state)){
         getQuizDetails();
      }
   },// eslint-disable-next-line 
   [aSpcfStuds]);

   // Create the assessment
   const addAssesment = (publishKey) => {
      // For valid all required fields
      const formValid = validator.current.allValid();
      if (formValid) {
      // Check the start, end and due date is within the date range
      let frmtStDt = moment(stDate).format("YYYY-MM-DD HH:mm");
      let frmtEnDt = moment(endDt).format("YYYY-MM-DD HH:mm");
      let frmtQzDt = moment(qzDuDt).format("YYYY-MM-DD HH:mm");
      if(stDate && endDt && (moment(frmtStDt).unix() >= moment(frmtEnDt).unix())){
         messageUtil.showInfo("Start date cannot be greater than end date.", true);
         return;
      }
      if(qzDuDt && ((stDate && (moment(frmtQzDt).unix() <= moment(frmtStDt).unix())) || (endDt && (moment(frmtQzDt).unix() >= moment(frmtEnDt).unix())))){
         messageUtil.showInfo("Due date should be within the start and end date.", true);
         return;
      }

      // Set the specific student Ids
      let aSelectedStud = [];
      if(props.contentReducer.assignMntStuds && props.contentReducer.assignMntStuds.length){
         props.contentReducer.assignMntStuds.forEach(function(oStud){
            if(oStud.StFl === 'A'){
               aSelectedStud.push(oStud.StuID);
            }
         });
      }
      let oReq = {
         InId           : location.state.InId,
         PrID           : location.state.PrID,
         CrID           : location.state.CrID,
         AcYr           : location.state.AcYr,
         DeptID         : location.state.DeptID,
         SemID          : location.state.SemID,
         SecID          : location.state.SecID,
         SubjId         : location.state.subId,
         subjId         : location.state.subId,
         tCntId         : location.state.TPID,
         type           : 'QUIZ',
         vSts           : publishKey,
         seqNo          : location.state.seqNo,
         AssesNm        : assesNm,
         title          : assesNm,
         QPID           : props.contentReducer.oQusPaper._id,
         ShwAns         : (isShowAns && shwAns) ? shwAns : 'D',
         Jumble         : isJumble,
         NoAttmpts      : isMultAtmpts ? 'M' : 'S',
         // alttedTime     : alttedTime === 'A' ? alttedMin :'E',
         QPTime         : alttedMin,
         EnfTime        : alttedTime === 'E' ? true : false,
         // enMkCm         : enMkCm,
         StDate         : stDate,
         EndDt          : endDt,
         StInstruct     : stInstruct,
         EndInstruct    : endInstruct,
         chapId         : oSrchVal.chapId,
         sChpId         : oSrchVal.subId,
         // isSpcStud      : isSpcStud,
         students       : (aSelectedStud && aSelectedStud.length) ? aSelectedStud : [],
         isAlCn         : isAlCn,
         canPtrk        : isProctr,
         isOnBrd        : onBordAssemt,
         ptrTmp         : ptrTmp,
         _id            : cntId ? cntId : '',
         asmntId        : asmntId ? asmntId : '',
         quiz           : {
            html        : descr,              // Quiz description
            qzDuDt      : qzDuDt,             // Due date
         }
      }
      // Set question paper time if we enforce the question paper time
      if(alttedTime === 'E'){
         oReq.QPTime = props.contentReducer.oQusPaper.QPTime;
      }
      props.addQuiz(oReq, null, null, navigateToView);
      } else {
         validator.current.showMessages();
         forceUpdate(1);
          // Scroll down the error message
         if(props.contentReducer.oQusPaper && _.isEmpty(props.contentReducer.oQusPaper)){
            errMsgQusRef.current?.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(alttedTime !== 'E' && alttedMin === ""){
            errMsgAltRef.current?.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(stDate === ""){
            errMsgAltRef.current?.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(endDt === ""){
            errMsgAltRef.current?.scrollIntoView({ behavior: "smooth" });
            return;
         }
      }
   }

   // Get the quiz details 
   const getQuizDetails = () => {
      let oReq = {
         contntId:oSrchVal.id,
         type: 'QUIZ'
      };
      HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit',oReq,null,(err,data)=>{
         if(data && data.output){
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
               messageUtil.showInfo("NO_QUIZ_FOUND", true);
            }else if(data.output.data && !_.isEmpty(data.output.data)){
               if(data.output.data._id){
                  setCntnttId(data.output.data._id);
               }
               if(data.output.data.title){
                  setAssesNm(data.output.data.title);
               }
               // if(data.output.data.enMkCm){
               //    setIsMrkAsCompt(data.output.data.enMkCm);
               // }
               if(data.output.data.isAlCn){
                  setIsAlwCon(data.output.data.isAlCn);
               }
               if(data.output.data.quiz && data.output.data.quiz.html){
                  setDescr(data.output.data.quiz.html);
               }
               if(data.output.data.quiz && data.output.data.quiz.qzDuDt){
                  setIsDuDt(true);
                  setAsDuDt(new Date(data.output.data.quiz.qzDuDt));
               }
               if(data.output.data.oAsmntDtls){
                  const oAsmntDtls = data.output.data.oAsmntDtls;
                  if(oAsmntDtls._id){
                     setAsmntId(oAsmntDtls._id);
                  }
                  if(oAsmntDtls.QPID && props.contentReducer.aAsesmnts && props.contentReducer.aAsesmnts.length){
                     for(let qn = props.contentReducer.aAsesmnts.length - 1; qn >= 0; qn--){
                        if(props.contentReducer.aAsesmnts[qn]._id === oAsmntDtls.QPID){
                           props.updateFields('oQusPaper',props.contentReducer.aAsesmnts[qn]);
                           break;
                        }
                     }
                  }
                  if(oAsmntDtls.ShwAns && (oAsmntDtls.ShwAns === 'I' || oAsmntDtls.ShwAns === 'C')){
                     setShwAns(oAsmntDtls.ShwAns);
                     setIsShowAns(true);
                  }
                  if(oAsmntDtls.Jumble){
                     setIsJumble(oAsmntDtls.Jumble);
                  }
                  // Enforce question paper time
                  if(oAsmntDtls.EnfTime){
                     setAlttedTime('E');
                     // setAlttedMin('');
                  }else{
                     // Assigning alloted time
                     if(oAsmntDtls.QPTime){
                        setAlttedTime('A');
                        setAlttedMin(oAsmntDtls.QPTime);
                     }
                  }
                  if(oAsmntDtls.canPtrk){
                     setIsProctr(oAsmntDtls.canPtrk);
                  }
                  if(oAsmntDtls.isOnBrd){
                     setOnBordAssemt(oAsmntDtls.isOnBrd);
                  }
                  if(oAsmntDtls.ptrTmp){
                     setProctrTmpt(oAsmntDtls.ptrTmp);
                  }
                  if(oAsmntDtls.NoAttmpts === 'M'){
                     setIsMultAtmpts(true);
                  }
                  if(oAsmntDtls.StDate){
                     setAvaPrd(true);
                     setIsStAt(true);
                     oAsmntDtls.StDate = new Date(oAsmntDtls.StDate*1000);
                     setStDate(oAsmntDtls.StDate);
                  }
                  if(oAsmntDtls.EndDt){
                     setAvaPrd(true);
                     setIsEntAt(true);
                     oAsmntDtls.EndDt = new Date(oAsmntDtls.EndDt*1000);
                     setEndDt(oAsmntDtls.EndDt);
                  }
                  if(oAsmntDtls.StInstruct || oAsmntDtls.EndInstruct){
                     setIsQuizInstruct(true);
                     if(oAsmntDtls.StInstruct){
                        setIsStInstrctns(true);
                        setStInstruct(oAsmntDtls.StInstruct);
                     }
                     if(oAsmntDtls.EndInstruct){
                        setIsEndInstrctns(true);
                        setEndInstruct(oAsmntDtls.EndInstruct);
                     }
                  }
               }
               if(data.output.data.oAsmntstudDtls &&
                  data.output.data.oAsmntstudDtls.studList && data.output.data.oAsmntstudDtls.studList.length && aSpcfStuds && aSpcfStuds.length){
                     setIsSpcStud(true);
                  for (let i = aSpcfStuds.length - 1; i >= 0; i--) {
                     if(aSpcfStuds[i].StuID){
                        if(data.output.data.oAsmntstudDtls.studList.indexOf(aSpcfStuds[i].StuID) === -1){
                           aSpcfStuds[i].checked = false;
                        }else{
                           aSpcfStuds[i].checked = true;
                        }
                     }
                  }
                  setAsmntStuds(aSpcfStuds);
                  // For student list in edit view
                  props.getSpcAssignMntStudnts(aSpcfStuds);
               }else{
                  // Only assign all students for duplicating contents in edit view
                  if(oSrchVal && oSrchVal.id && aSpcfStuds && aSpcfStuds.length){
                     aSpcfStuds.forEach((oStud) => {
                        oStud.checked = false;
                     });
                     setAsmntStuds(aSpcfStuds);
                  }
               }
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
         }
      });
   }
   // Get the assessment students
   const getTheAsmntStuds = () => {
      if (location && location.state && !_.isEmpty(location.state)) {
         const oReq = {
            "SecID": location.state.SecID,
            "AcYr": location.state.AcYr,
            "InId": location.state.InId,
            "DeptID": location.state.DeptID,
            "PrID": location.state.PrID,
            "CrID": location.state.CrID,
            "SemID": location.state.SemID,
            "SubID": location.state.subId,
            "getStuds": true,
            "OID": location.state.InId,
            "StaffID": location.state.StaffId,
            "isFE": props.session.fe
         };
         HTTPService.post('/stuHWassignment', oReq, null, (err, data) => {
            if (data && data.output && data.output.data && data.output.data.students && data.output.data.students.length > 0) {
               setStuds(data.output.data.students);
               if(oSrchVal && !oSrchVal.id){
                  setAsmntStuds(data.output.data.students);
               }
            } else if (data && data.output && data.output.data && data.output.data.message) {
               setStuds([]);
            } else {
               messageUtil.showError("UNKNOWN_ERROR", false);
            }

         });
         //Initially set empty assignment students
         props.getSpcAssignMntStudnts([]);
      } else {
         console.log("NO_REQUEST_FOUND");
      }
   }

   // Get the question papers
   const addQuestion = () => {
      let oReq = {
         "AcYr": location.state.AcYr,
         "InId": location.state.InId,
         "DeptID": location.state.DeptID,
         "PrID": location.state.PrID,
         "CrID": location.state.CrID,
         "SemID": location.state.SemID,
         "SubjId": location.state.subId,
      }
      props.getQuestion(oReq);
   }

   // Navigation to quiz view once you create or edit assesment
   const navigateToView = (isNavi, conId, asmnId) => {
      if (isNavi) {
         if(oSrchVal.quizView){
            history.push({ pathname: "/home-page/quiz-content", search: `?id=${conId}&asmntId=${asmnId}&quizView=${oSrchVal.quizView}`, state: location.state });
         }else{
            history.push({ pathname: "/home-page/quiz-content", search: `?id=${conId}&isItem=${true}&asmntId=${asmnId}&chapId=${oSrchVal.chapId}&subId=${oSrchVal.subId}`, state: location.state });
         }
      }
   }
   // Discard changes for create and edit 
   const discardChanges = () => {
      // If you press back icon to navigate when you click discard
      history.go(-1);
      setIsDicard(false);
   }

   // delete the question paper
   const delQuesPaper = () => {
      props.updateFields('oQusPaper',{});
   }

   // Due date handler
   const dueDtHandler = (event) => {
      setAsDuDt(event)
   }
  // Start date handler 
   const stDateHandler = (event) => {
      setStDate(event)
   }
   // End date handler
   const endDtHandler = (event) => {
      setEndDt(event)
   }
   // Deactive students in quiz
   const deactiveQuizStud = (index) => {
      props.contentReducer.assignMntStuds[index].checked = false;
      props.contentReducer.assignMntStuds[index].StFl = 'D';
      props.updateFields('assignMntStuds', props.contentReducer.assignMntStuds);
   }
   // Allow specific student handler
   const alwStudHandler = () => {
      setIsSpcStud(!isSpcStud);
      if (isSpcStud) {
         props.updateFields('assignMntStuds', []);
      }
   }

   //get selected student details
   const getSelectedStudents = () => {
      setStudSearch('');
      $('#studentList-model').modal('hide');
      props.getSpcAssignMntStudnts(asmntStuds);
   }
 
   return (
      <div className="quiz-creation">
         <div className="quiz-module_header">
            <div className="row m-0">
               <div className="col-6 p-0">
                  <div className="page-input_title">
                     <div className="page-title_icon">
                        <ArrowLeft className="svg-icon_default icon-dark icon-pointer" onClick={()=> {setIsDicard(true); }}/>
                     </div>
                     <div className="page-input_details">
                        <label htmlFor="fname" className="form-lable"> <span className="mandatory-field">* </span> {props.t("translate:QUIZ_TITTLE")}</label>
                        <InputBox className="input-block" placeholder="Enter Title" name="Last Name" value={assesNm} onChange={(event) => setAssesNm(event.target.value)}/>
                        {validator.current.message('title', assesNm, 'required|string',{ className: 'text-empty_content' })}
                     </div>
                  </div>
               </div>
               <div className="col-6 p-0">
                  <div className="publish-btn">
                     <div>
                        <p className="unpublished-view_label" >{props.t("translate:UNPUBLISHED_LABEL")}</p>
                     </div>
                     <UIPerWrapper perCode={["rp_can_pub_lms_content"]}><div className="save-publish_btn">
                        <Button theme="btn-rounded secondary-btn btn-outline" clicked={() => addAssesment("F")}> {props.t("translate:SAVE_&_PUBLISH")}</Button>
                     </div></UIPerWrapper>
                     <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div className="save-page_btn">
                        <Button theme="btn-rounded default" clicked={() => addAssesment("D")}> {props.t("translate:SAVE")}</Button>
                     </div></UIPerWrapper>
                     <div className="option-mode_content">
                        <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                           <i className="views-option">
                              <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                           </i>
                        </div>
                        <div className="dropdown-menu edit-chapter_cont">
                           <div className="dropdown-item user-info_contents" onClick={()=>setIsDicard(true)}>
                              <X className="svg-icon_light  icon-default" />
                              <span className="option-list_dropdown">{props.t("translate:DISCARD")}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <div ref={errMsgQusRef}></div>
         <div className="text-editor" >
            <p className="edit-box_heading">{props.t("translate:INFOCONTENT_DESCRIPTION")}</p>
            <LmsEditor  placeholder={"Enter description"} value={descr} onChange={(event) => setDescr(event)} />
         </div>
         <div className="assignment-upload_content">
            <div className="row m-0">
               <div className="col-4 p-0">
                  <p className="uploaded-files"><span className="mandatory-field">* </span>{props.t("translate:QUESTIONS")}</p>
                  <p className="upload-file_contend">{props.t("translate:ADD_QUS_CAMU")}</p>
               </div>
               <div className="col-8 p-0">
                  <div className="attached-question">
                     {props.contentReducer.oQusPaper && !_.isEmpty(props.contentReducer.oQusPaper) ?
                        <div className="attached-quiz-list">
                           <div className="attached-quiz-name">
                              <p className="question-head_label">{props.contentReducer.oQusPaper.QPaperNm}</p>
                              <p className="question-sub_label">{props.contentReducer.oQusPaper.totQust} {props.t("translate:QUES")} {props.contentReducer.oQusPaper.totMrk} {props.t("translate:MARKS")}</p>
                           </div>
                           {oSrchVal && !oSrchVal.id && <Trash2 className="svg-icon_small icon-dark icon-pointer" onClick = {() => delQuesPaper()}/>}
                        </div>
                        :
                        <div className="attached-question_box">
                           <p className="attached-question_label" >
                                 <span>{props.t("translate:NO_QUS_ATTACH")}</span>
                           </p>
                           <div data-toggle="modal" data-target="#quizeModal-page">
                           {/* clicked={() => addQuestion()} */}
                           {props.contentReducer.oQusPaper && _.isEmpty(props.contentReducer.oQusPaper) &&   <Button theme="btn-rounded secondary-btn btn-outline"> {props.t("translate:ATTACH_QUS")}</Button>}
                           </div>
                        </div>
                     }
                        {validator.current.message('Question', props.contentReducer.oQusPaper.QPaperNm, 'required|string',{ className: 'text-empty_content' })}
                  </div>
               </div>
            </div>
         </div>
         <div className="quiz-list_cont">
            <div className="row m-0">
               <div className="col-4 p-0">
                  <p className="uploaded-files">{props.t("translate:QUIZ_SETTING")}</p>
                  <p className="upload-file_contend">{props.t("translate:CUSTOM_SETTING_QUIZ")}</p>
               </div>
               <div className="col-8 p-0"> 
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:SHOW_ANSWER")}</p>
                        </div>
                        <CheckBox className="check-box" checked={isShowAns} onChange={() => setIsShowAns(!isShowAns)} />
                     </div>
                     {isShowAns &&
                        <div className="quiz-time_select">
                           <div className="quiz-select-cont">
                              <RadioButton className="radio-btn" name="showAns" value="I" checked={shwAns === 'I'} onChange={(event) => setShwAns(event.target.value)} />
                              <p className="quiz-radio_label"> {props.t("translate:IMMEDIAT_ANSWER_QUIZ")}</p>
                           </div>
                           <div className="quiz-select-cont">
                              <RadioButton className="radio-btn" name="showAns" value="C" checked={shwAns === 'C'} onChange={(event) => setShwAns(event.target.value)} />
                              <p className="quiz-radio_label"> {props.t("translate:ONCE_QUIZ_COMPLETED")} </p>
                           </div>
                        </div>}
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:JUMBLE_QUS_ANS")}</p>
                        </div>
                        <CheckBox className="check-box" onChange={() => setIsJumble(!isJumble)} checked={isJumble} />
                     </div>
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="quiz-header_box">
                           <p className="quiz-header_list">{props.t("translate:ALLOW_MULTI_ATTEMPTS")}</p>
                           <p className="quiz-sub_list">{props.t("translate:QUIZ_ONCE_LEARNER")}</p>
                        </div>
                        <CheckBox className="check-box" checked={isMultAtmpts} onChange={() => setIsMultAtmpts(!isMultAtmpts)} />
                     </div>
                     {/* <div className="quiz-time_select">
                              <div className="quiz-select-cont">
                                 <RadioButton className="radio-btn" name="attempts" value="A" checked={noAttmpts === 'A'} onChange={(event)=>setNoAttmpts(event.target.value)}/>
                                 <p className="quiz-radio_label"> {props.t("translate:ALLOWED")}</p>
                                 <InputBox className="input-table" />
                                 <p className="quiz-radio_label">{props.t("translate:ATTEMPTS")}</p>
                              </div>
                              <div className="quiz-select-cont">
                                 <RadioButton className="radio-btn" name="attempts" value="M" checked={noAttmpts === 'M'} onChange={(event)=>setNoAttmpts(event.target.value)}/>
                                 <p className="quiz-radio_label"> {props.t("translate:INFINITE_AMOUNT_QUIZ")}  </p>
                              </div>
                           </div> */}
                  </div>
                  <div ref={errMsgAltRef}></div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="quiz-header_box">
                           <p className="quiz-header_list">{props.t("translate:ALLOTTED_TIME")}</p>
                        </div>
                     </div>
                     <div className="quiz-time_select">
                        <div className="quiz-select-cont">
                           <RadioButton className="radio-btn" name="allotted" value="A" checked={alttedTime === 'A'} onChange={(event) => setAlttedTime(event.target.value)} />
                           <p className="quiz-radio_label"> {props.t("translate:ASSIGN_TIME")}</p>
                           <InputBox className="input-table" value={alttedMin} onChange={(event) => setAlttedMin(event.target.value)} />
                           <p className="quiz-radio_label">{props.t("translate:MINUTES")}</p>
                        {alttedTime === 'A' &&  validator.current.message('Assign time', alttedMin, 'required|numeric',{ className: 'text-empty_content' })}
                        </div>
                        <div className="quiz-select-cont">
                           <RadioButton className="radio-btn" name="allotted" value="E" checked={alttedTime === 'E'} onChange={(event) => {
                              setAlttedTime(event.target.value);
                              setAlttedMin(0);
                           }
                           } />
                           <p className="quiz-radio_label"> {props.t("translate:ENFORCE_TIME_QUIZ")}</p>
                        </div>
                        {validator.current.message('Allotted time', alttedTime, 'required|string',{ className: 'text-empty_content' })}
                        
                     </div>
                  </div>
                  {/* <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:ENABLE_MARK_QUIZ")}</p>
                        </div>
                        <CheckBox className="check-box" onChange={() => setIsMrkAsCompt(!enMkCm)} checked={enMkCm} />
                     </div>
                  </div> */}
               </div>
            </div>
         </div>
         <div className="quiz-list_cont">
            <div className="row m-0">
               <div className="col-4 p-0">
                  <p className="uploaded-files">{props.t("translate:DETLS_INFO")}</p>
                  <p className="upload-file_contend">{props.t("translate:SET_UP_RULES")}</p>
               </div>
               <div className="col-8 p-0">
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:INFOCONTENT_DUE_DATE")}</p>
                           <p className="quiz-sub_list">{props.t("translate:DUE_DATE_LEARNERS_ASSGN_CNT")}</p>
                        </div>
                        <CheckBox className="check-box" checked={isDuDt} onChange={() => setIsDuDt(!isDuDt)} />
                     </div>
                     {isDuDt &&
                        <div className="quiz-time_select">
                           <div className="date-picker_cont">
                              <ReactDatePicker closeOnSelect={true}  type='date' className="date-picker calendar_icon" value={qzDuDt} onChange={(event) =>dueDtHandler(event) } dateFormat="DD-MMM-YYYY" showTimeInput={true} />
                           </div>
                        </div>}
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list"><span className="mandatory-field">* </span>{props.t("translate:ASSIGNMENTCONTENTCOMPONENT_AVAILABLE_PERIOD")}</p>
                           <p className="quiz-sub_list">{props.t("translate:RANGE_STUDENT_ACTIVITY_ASSGN_CNT")}</p>
                        </div>
                           {/* <CheckBox className="check-box" checked={isAvaPrd} onChange={() => {setAvaPrd(!isAvaPrd); setIsStAt(true)}}/> */}
                     </div>
                     {/* <div className="quiz-time_select">
                        <div className="quiz-date_selection">
                           <p className="quiz-start_label">{props.t("translate:START_AT")}</p>
                           <ReactDatePicker type='date' datePickerTheme="date-picker calendar_icon" selected={stDate} onChange={(event) => stDateHandler(event)} dateFrmt="dd-MMM-yyyy    h:mm aa" showTimeInput={true} />
                        </div>
                        <div className="quiz-date_selection">
                           <p className="quiz-end_label">{props.t("translate:END_AT")}</p>
                           <ReactDatePicker type='date' datePickerTheme="date-picker calendar_icon" selected={endDt} onChange={(event) => endDtHandler(event)} dateFrmt="dd-MMM-yyyy    h:mm aa" showTimeInput={true} />
                        </div>
                           {validator.current.message('End date', endDt, 'required',{ className: 'text-danger alert-cont_label' })}
                     </div> */}

                     {/* Start and End date */}
                     {/* {isAvaPrd &&  */}
                     <div className="activity-instructions">
                        {/* {isStAt &&  */}
                     <div className="activity-instructions_box">
                        <div className="row m-0">
                           <div className="col p-0">
                              <div className="activity-date_box">
                                 <p className="activity-instructions_label">{props.t("translate:START_AT")}</p>
                           <ReactDatePicker closeOnSelect={true}  type='date' className="date-picker calendar_icon" value={stDate} onChange={(event) => stDateHandler(event)} dateFormat="DD-MMM-YYYY" showTimeInput={true} />
                              </div>
                        {validator.current.message('Start Date', stDate, 'required',{ className: 'text-empty_content' })}
                           </div>
                           {/* {isAvaPrd && */}
                           {/* <div className="col-1 p-0" onClick={()=>{setIsStAt(false);setStDate('')}}>
                              <div className="remove-instruction">
                                 <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                              </div>
                           </div> */}
                        </div>
                     </div>
                     {/* } */}
                     {/* {isEntAt &&  */}
                     <div className="activity-instructions_box">
                        <div className="row m-0">
                           <div className="col p-0">
                              <div className="activity-date_box">
                                 <p className="activity-instructions_label">{props.t("translate:END_AT")}</p>
                           <ReactDatePicker closeOnSelect={true}  type='date' className="date-picker calendar_icon" value={endDt} onChange={(event) => endDtHandler(event)} dateFormat="DD-MMM-YYYY" showTimeInput={true} />
                              </div>
                        {validator.current.message('End Date', endDt, 'required',{ className: 'text-empty_content' })}
                           </div>
                           {/* <div className="col-1 p-0">
                              <div className="remove-instruction" onClick={()=>{setIsEntAt(false); setEndDt('')}}>
                                 <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                              </div>
                           </div> */}
                        </div>
                     </div>
                     {/* } */}
                     
                     {/* {!isStAt &&  */}
                     {/* <p className="add-quiz_instructions" onClick={()=>setIsStAt(true)}>
                        <span>
                           <Plus className="svg-icon_small icon-primary icon-pointer"/>
                        </span>
                        {props.t("translate:ADD_START_DATE")}
                     </p> */}
                     {/* } */}
                     {/* {!isEntAt &&  */}
                     {/* <p className="add-quiz_instructions" onClick={()=>setIsEntAt(true)}>
                        <span>
                           <Plus className="svg-icon_small icon-primary icon-pointer"/>
                        </span>
                        {props.t("translate:ADD_CLOSE_DATE")}
                     </p> */}
                     {/* } */}
                     </div>
                     {/* } */}
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="quiz-header_box">
                           <p className="quiz-header_list">{props.t("translate:QUIZ_INSTRUTION")}</p>
                           <p className="quiz-sub_list">{props.t("translate:RANGE_STUDENT_ACTIVITY_ASSGN_CNT")}</p>
                        </div>
                        <CheckBox className="check-box" checked={isQuizInstruct} onChange={() => {setIsQuizInstruct(!isQuizInstruct);setIsStInstrctns(true) }} />
                     </div>
                     {isQuizInstruct &&
                        <div className="quiz-time_select">
                           {/* starting instructions */}
                           {isStInstrctns && 
                           <div className="quiz-instructions">
                              <div className="row m-0">
                                 <div className="col p-0">
                                    <div className="quiz-instructions_box">
                                       <p className="quiz-instructions_label">{props.t("translate:START_INSTRUTION")}</p>
                                       <LmsEditor  placeholder={"Enter description"} value={stInstruct} onChange={(event) => setStInstruct(event)} />
                                    </div>
                                 </div>
                                 <div className="col-1 p-0">
                                    <div className="remove-instruction" onClick={()=>{setIsStInstrctns(false); setStInstruct('')}}>
                                       <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                    </div>
                                 </div>
                              </div>
                           </div>}
                           {/* Ending instructions */}
                           {isEndInstrctns &&
                              <div className="quiz-instructions">
                                 <div className="row m-0">
                                    <div className="col p-0">
                                       <div className="quiz-instructions_box">
                                          <p className="quiz-instructions_label">{props.t("translate:END_INSTRUTION")}</p>
                                          <LmsEditor  placeholder={"Enter description"} value={endInstruct} onChange={(event) => setEndInstruct(event)} />
                                       </div>
                                    </div>
                                    <div className="col-1 p-0">
                                       <div className="remove-instruction" onClick={() => {setIsEndInstrctns(false); setEndInstruct('')}}>
                                          <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer"  />
                                       </div>
                                    </div>
                                 </div>
                              </div>}
                        {!isStInstrctns &&
                           <p className="add-quiz_instructions" onClick={() => setIsStInstrctns(!isStInstrctns)}>
                              <span>
                                 <Plus className="svg-icon_small icon-primary icon-pointer" />
                              </span>
                              {props.t("translate:ADD_START_INSTRUTION")}
                              </p>}
                           {!isEndInstrctns &&
                              <p className="add-quiz_instructions" onClick={() => setIsEndInstrctns(!isEndInstrctns)}>
                                 <span>
                                    <Plus className="svg-icon_small icon-primary icon-pointer" />
                                 </span>
                                 {props.t("translate:ADD_END_INSTRUTION")}
                              </p>}
                        </div>}
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:ASSIGNMENTCONTENTCOMPONENT_ASSIGN_STUDENTS")}</p>
                           {/* <p className="quiz-sub_list">Lorem ipsum dolor sit amet, consectetur adipiscing.</p> */}
                        </div>
                        {/* <CheckBox className="check-box" onChange={() => setIsSpcStud(!isSpcStud)} checked={isSpcStud} /> */}
                        <CheckBox className="check-box" onChange={() => alwStudHandler()} checked={isSpcStud} />

                     </div>
                     {isSpcStud &&
                        <div>
                           <div className="specific-student">
                              <div className="student-lists">
                                 {props.contentReducer.assignMntStuds && props.contentReducer.assignMntStuds.length > 0 ?
                                    (
                                       props.contentReducer.assignMntStuds.map((stud,index) => {
                                          return (
                                             <div>
                                                {stud.StFl === 'A' ?
                                                   (
                                                      <div className="student-model">
                                                         <div className="assign-students">
                                                            <div className="student-img">
                                                               {stud && stud.PhotoImgID ? <img src={'/Image/getImage/' + stud.PhotoImgID} className="stud-list_img" alt="img" /> : <StudentNameComponent className="student-name_icon" fName={stud.FNa.substring(0, 1)} clrCode={generateHexDecCode(stud.studId)}/>}
                                                            </div>
                                                            <div className="student-details">
                                                               <p className="stud-name">{stud.FNa} {stud.LNa}</p>
                                                               <p className="stud-id">{stud.AplnNum}</p>
                                                            </div>
                                                         </div>
                                                         <div className="remove-students" onClick={() =>
                                                            deactiveQuizStud(index)}>
                                                            <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                                         </div>
                                                      </div>
                                                   )
                                                   :
                                                   (null)
                                                }
                                             </div>
                                          )
                                       })
                                    ) :
                                    (
                                       <div className="no-student">
                                          <p className="student-notfound">
                                             <span>
                                                <Info className="svg-icon_small icon-primary" />
                                             </span>
                                             {props.t("translate:ASSIGNMENTCONTENTCOMPONENT_NO_STUDENTS")}
                                          </p>
                                       </div>
                                    )
                                 }
                              </div>
                              <div className="add-students" data-toggle="modal" data-target="#studentList-model">
                                 <p className="student-add">
                                    <span>
                                       <Plus className="svg-icon_small icon-primary" />
                                    </span>
                                    {props.t("translate:ASSIGNMENTCONTENTCOMPONENT_ADD_STUDENTS")}
                                 </p>
                              </div>
                           </div>
                           {/* <div className="no-student">
                            <p className="student-notfound">
                               <span>
                                  <Info className="svg-icon_small icon-primary" />
                               </span>
                               {props.t("translate:ASNMNT_STUDS_NOT_FOUND")}
                            </p>
                         </div> */}
                           {/* <div className="add-students" data-toggle="modal" data-target="#studentList-model">
                            <p className="student-add" onClick={()=>getTheAsmntStuds()}>
                               <span>
                                  <Plus className="svg-icon_small icon-primary" />
                               </span>
                               {props.t("translate:ASSIGNMENTCONTENTCOMPONENT_ADD_STUDENTS")}
                            </p>
                         </div> */}
                        </div>}
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:ALLOW_CONVERSATION")}</p>
                           {/* <p className="quiz-sub_list">Lorem ipsum dolor sit amet, consectetur adipiscing.</p> */}
                        </div>
                        <CheckBox className="check-box" onChange={() => setIsAlwCon(!isAlCn)} checked={isAlCn} />
                     </div>
                  </div>
               </div>
            </div>
         </div>
         {/* <div className="quiz-list_cont">
            <div className="row m-0">
               <div className="col-4 p-0">
                  <p className="uploaded-files">{props.t("translate:PROCTORING")}</p>
                  <p className="upload-file_contend">{props.t("translate:PROCTORING_TOOL_QUIZ")}</p>
               </div>
               <div className="col-8 p-0">
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:ENABLE_PROCTORING")}</p>
                        </div>
                        <CheckBox className="check-box" onChange={() => setIsProctr(!isProctr)} checked={isProctr} defaultDisabled = {props.ptrkSts === 'Y' ? false : true}/>
                     </div>
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:ONBOARD_ASSESSMNT")}</p>
                        </div>
                        <CheckBox className="check-box" onChange={() => setOnBordAssemt(!onBordAssemt)} checked={onBordAssemt} defaultDisabled = {props.ptrkSts === 'Y' ? false : true}/>
                     </div>
                  </div>
                  <div className="grade-uploader">
                     <div className="quiz-list-view">
                        <div className="due-info">
                           <p className="quiz-header_list">{props.t("translate:PROCTORING_TEMPLATE")}</p>
                        </div>
                        <InputBox className="input-default " placeholder="20 characters maximum" value={ptrTmp} onChange={(event) => setProctrTmpt(event.target.value)} defaultDisabled = {props.ptrkSts === 'Y' ? false : true}/>
                     </div>
                  </div>
               </div>
            </div>
         </div> */}
         <div className="modal fade" id="studentList-model" tabIndex="-1" role="dialog" aria-labelledby="studentList-model" aria-hidden="true">
            <div className="modal-dialog md-modeldialogbox student-search_modal">
               <div className="modal-content">
                  <div className="modal-header">
                     <p className="modal-title" id="myModalLabel">{props.t("translate:ASSIGNMENTCONTENTCOMPONENT_SELECT_STUDENTS")}</p>
                     <div className="close" data-dismiss="modal" aria-label="Close">
                        <Cross iconStyle="svg-icon_small icon-pointer" />
                     </div>
                  </div>
                  <div className="students-containers">
                     <div className="student-selects">
                        {asmntStuds && Boolean(asmntStuds.length) && 
                        <StudentSearch data={asmntStuds} onChange={(event)=>setStudSearch(event.target.value)} value={studSearch} clear={()=>setStudSearch('')} getSelectedStudents={getSelectedStudents}/>
                         } 
                     </div>
                  </div>
               </div>
            </div>
         </div>
        {isDisCard && <LmsModal open={isDisCard} onClose={()=>setIsDicard(false)}   modalTitle={props.t("translate:DISCARD")+'?'} btnName='discard'  discardBtn={true} onClick={()=>{discardChanges()}} />}
      </div>
   );
}

const mapStateToProps = (state) => ({
   // ...state.contentReducer,
   contentReducer:state.contentReducer,
   ...state.headerReducer
})
const mapDispatchToProps = {
   getSpcAssignMntStudnts,
   getQuestion,
   addQuiz,
   updateFields
}
const TabNavigator = (props) => <QuizCreationComponent {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)
export default withTranslation()(Components);

// export default withTranslation()(QuizCreationComponent)
