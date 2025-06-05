
import React, { lazy, useEffect, useState } from 'react';
import '../../styles/_quizContentStyle.scss';
import { withTranslation } from 'react-i18next';
import { MoreVertical, Slash, Trash2 } from 'react-feather';
import { Edit, Cross } from '../icons/Icons';
import '../../styles/_commonLmsStyle.scss';
import { useHistory, useLocation, Link } from 'react-router-dom';
import queryString from 'query-string';
import { updateCntViewLog } from '../../store/actions/AnalyticsAction';
import { getContById, deleteItems, updateMarkAsDone, loadItems, getSubChapName } from '../../store/actions/ContentActions';
import { connect } from 'react-redux';
import helper, { lmsDateAndTimeFormat,lmsNonUTCDateAndTimeFormat } from '../../utils/helper';
import HTTPService from "../../utils/http-util";
import _ from "lodash";
import messageUtil from '../../utils/message-util';
import moment from 'moment';
import AnalyticsService from '../../service/analytics-service';
import SlideFooter from '../slide-footer/SlideFooter';
import UserSession from '../../utils/UserSession';


const StaffWrapper = lazy(() =>
    import('../staff-wrapper/StaffWrapper')
);
const StudentWrapper = lazy(() =>
    import('../student-wrapper/StudentWrapper')
);
const Button = lazy(() =>
    import('../button/Button')
);
const LmsModal = lazy(() =>
    import("../modal/LmsModal")
);
const ConversationComponent  = lazy(() =>
import('../conversation/Conversation')
);
const LmsEditorView = lazy(() =>
import('../lms-editor-view/LmsEditorView')
);
const AnalyticsWrapper = lazy(() =>
import('../analytics-wrapper/AnalyticsWrapper')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
const StudentArchiveConversationWrapper = lazy(() =>
   import('../stud-arch-conver-wrapper/StudentArchiveConversationWrapper')
);

const QuizContentComponent = (props) => {
    const history = useHistory();
    const location = useLocation();
    const [vSts, setVstus] = useState('');
    const [isLoadConv ,setIsLoadConv] = useState(false);
    const [itemDelModel, setitemDelModel] = useState(false);
    const [isLoadAnaly ,setIsLoadAnaly] = useState(false);
    const isArchCrsEnable = UserSession.getArchCrsDtls();
    // const [markAsDone, setMarkAsDone] = useState(undefined);
    let values = queryString.parse(location.search);

    // Confirmation modal open and close for item delete
    const itemModalAction = (key) => {
        setitemDelModel(key);
    };

    // Navigate to the mycamu assessments when start the quiz
    const navigateToAssesmnts = () => {
        if (helper.localStorageGet("portal_back_url") && values && values.asmntId) {
            const changeUrl = helper.localStorageGet("portal_back_url").split('/');
            let asmntURL = window.location.href;
            const strngfyState = encodeURIComponent(queryString.stringify(location.state));
            changeUrl[changeUrl.length-1] = 'assessments?source=LMSV2&id='+values.asmntId+"&lms_back_url="+encodeURIComponent(asmntURL)+"&state="+strngfyState;
            let URL = changeUrl.join('/');
            window.location.assign(URL);
        }
    };

    useEffect(() => {
        AnalyticsService.setCurrPage('QUIZ_VW');
        setIsLoadAnaly(true);
        let oReq = {
            _id: values.id,
            quizVw: true
        }
        if (values.state) {
            location.state = queryString.parse(decodeURIComponent(values.state));
        }
        // get contents data by id
        if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content
            // get contents data by id
            props.getContById(true, oReq, updateSts, updateFooter);
        }
    },// eslint-disable-next-line 
        []);

    // Set vSts publish or unpublish 
    const updateSts = (vSts) => {
        setVstus(vSts);
    }
    // Update footer value for quiz list or course content
    const updateFooter = (isInitLoad) => {
        if (isInitLoad) {
            if(!location.state.allSchdl && !location.state.crsSchdl){
                // Check quiz list
                if(values.quizView){
                      props.loadItems(null,null,location.state,"QUIZ");
                      props.getSubChapName();
                }else{ // Checck course content
                      props.loadItems(values.chapId,values.subId,location.state,false);
                      props.getSubChapName(props.oContDtls.subChapNm);
                }
             }
        }
    }
    // Delete Assignment in Assignment view
    const deleteAsign = () => {
        props.deleteItems(values.id, navigateCours);
    }
    // Navigate to Course page
    const navigateCours = (isNavi) => { // is Navigation value boolean
        if (isNavi) {
            itemModalAction(false);
            history.push({ pathname: '/home-page/content-page', state: location.state });
        }
    }

    // Publish content 
    const publishContent = (publishKey)=>{
        let oReq ={
           _id:values.id,
           vSts:publishKey      
        }
        HTTPService.post('/teaching-content/publish-subchapter-items', oReq, null, (err, data) => {
           if (data && data.output) {
              if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONTENT_DETAILS_FOUND") {
                 messageUtil.showInfo("NO_FILE_FOUND", true);
              } else if (data.output.data && !_.isEmpty(data.output.data)) {
                setVstus(data.output.data.vSts);
              } else if (data.output.data && _.isEmpty(data.output.data)) {
                 messageUtil.showInfo("NO_FILE_FOUND", true);
              }
           } else {
              messageUtil.showError("UNKNOWN_ERROR", false);
           }
        });
     }

  //Complete mark as done by student
    // const markAsCompleted = () => {
    //     if (values && values.id && values.id.length) {
    //         const oMrkReq = {
    //             cntId: values.id
    //         }
    //         props.updateMarkAsDone(oMrkReq, markAsDoneClbk);
    //     }
    // }
    // // Update mark as done
    // const markAsDoneClbk = (status) => {
    //     setMarkAsDone(status);
    // }
    // Go to course page or quiz list 
    const goPreview = () =>{
        if(values && values.isItem){
            history.push({ pathname: '/home-page/content-page', state: location.state, itemObj: values });
        }else{
            history.push({ pathname: '/home-page/quiz-list', state: location.state });
        }
    }

    // View the submitted quiz details
    const vwQuizDtls = (lstAnsId) => {
        if (helper.localStorageGet("portal_back_url") && values && values.asmntId && lstAnsId) {
            const changeUrl = helper.localStorageGet("portal_back_url").split('/');
            let asmntURL = window.location.href;
            const strngfyState = encodeURIComponent(queryString.stringify(location.state));
            changeUrl[changeUrl.length-1] = 'assessments?source=LMSV2&id='+values.asmntId+"&lms_back_url="+encodeURIComponent(asmntURL)+"&state="+strngfyState+"&lstAnsId="+lstAnsId;
            let URL = changeUrl.join('/');
            window.location.assign(URL);
        }
    }

    // Footer handler
    const quizFooterChange =(asgmntId,type, currPage)=>{
        values.id = asgmntId;
        let oReq = {
            _id:asgmntId,
            quizVw : true
        }
        // if(type === 'QUIZ'){
            if(UserSession.isStudent()){
                const chckCurPage = AnalyticsService.getCurrPageDetails();
                if(chckCurPage && (currPage !== chckCurPage.pgNm)){
                return;
                }
                const oLog = {
                   isEnCurCrtNwLg : true,  // End current log for current content and create new for next or prev content
                   currPage : currPage,
                   id : asgmntId
                };
                if(location && location.state && location.state.subId){
                   oLog.subId = location.state.subId;
                   oLog.AcYr = location.state.AcYr;
                   oLog.SemID = location.state.SemID;
                }
                props.updateCntViewLog(oLog);
             }
            props.getContById(false,oReq,updateSts,updateFooter);
        // }
     }
    return (
        <div className="quiz-content">
            <div className="quiz-view_options">
                <div className="hide-content_view" onClick={() => goPreview()}>
                    <Cross iconStyle="svg-icon_small icon-dark icon-pointer" />
                </div>
                {!location.state?.isDisabledContent &&
                    <StaffWrapper>
                <div className="view-options">
                    <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>
                        {values && values.quizView ?
                            <Link to={{ pathname: '/home-page/quiz-creation', search: `?id=${values.id}&quizView=${values.quizView}`, state: location.state }}>
                                <Edit iconStyle="svg-icon_small icon-dark" />
                            </Link> :
                            <Link to={{ pathname: '/home-page/quiz-creation', search: `?id=${values.id}&chapId=${props.oContDtls && props.oContDtls.chapId}&subId=${props.oContDtls && props.oContDtls.sChpId}`, state: location.state }}>
                                <Edit iconStyle="svg-icon_small icon-dark" />
                            </Link>
                        }
                    </UIPerWrapper>
                    <UIPerWrapper perCode={["rp_can_delete_lms_content"]}>
                        <div className="more-options" >
                            <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                <MoreVertical className="svg-icon_small icon-dark icon-pointer left-icon" />
                            </div>
                            <div class="dropdown-menu edit-chapter_cont">
                                {/* 
                                <div class="dropdown-item user-info_contents"  >
                                <X className="svg-icon_light  icon-default"/>
                                <span className="option-list_dropdown">Discard changes</span>
                                </div>
                                */}
                                <div class="dropdown-item user-info_contents" onClick={() => itemModalAction(true)}>
                                    <Trash2 className="svg-icon_light  icon-error" />
                                    <span className="option-list_dropdown delete-option_btn">{props.t("translate:CHAPTERLISTCOMPONENT_DELETE")}</span>
                                </div>
                            </div>
                        </div>
                    </UIPerWrapper>
                </div>
                    </StaffWrapper>
                }
            </div>
            <div className="quiz-content_container">
                <StaffWrapper>
                    {/* <div className="quiz-view_header">
                        {vSts === 'D' ? 
                        <p className="quiz-header_label">
                            <Slash className="svg-icon_small icon-dark icon-space_left" />
                            {props.t("translate:LEARNERS_CANT_ACCESS_ITEM")}
                        </p> : ''}
                        <Button theme="btn-rounded btn-outline" clicked={()=>publishContent("F")}>
                         {props.t("translate:PUBLISHED")}
                        </Button>
                    </div> */}
                   {!location.state?.isDisabledContent && <div>
                  <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{vSts && vSts === 'F'  ?
                     <div className="quiz-view_header">
                        <p className="quiz-header_label">{props.t("translate:LEARNERS_ACCESS_ITEM")}</p>
                        <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>publishContent('D')}>
                           {props.t("translate:UNPUBLISHED")} 
                        </Button>
                     </div>
                     :
                     <div className="quiz-view_header">
                        <p className="quiz-header_label"> <Slash className="svg-icon_small icon-dark icon-space_left" />{props.t("translate:LEARNERS_CANT_ACCESS_ITEM")}</p>
                        <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>publishContent('F')}>
                           {props.t("translate:PUBLISHED")} 
                        </Button>
                     </div>
                  }</UIPerWrapper>
                  </div>   
                   }
                </StaffWrapper>
                <div className="quiz-header_container">
                    <div className="assignment-heading_cont">
                        {props.oContDtls && props.oContDtls.subChapNm &&  <p className="assignment-subchapter_label">{props.oContDtls.subChapNm}</p>}
                        {props.oContDtls && props.oContDtls.title && <p className="assignment-heading_label">{props.oContDtls.title}</p>}
                        {props.oContDtls && props.oContDtls.quiz && props.oContDtls.quiz.qzDuDt && <p className="assignment-heading_date">{props.t("translate:STUD_ASMNT_DUE")} {lmsNonUTCDateAndTimeFormat(props.oContDtls.quiz.qzDuDt)}</p>}
                    </div>
                    <div className="stud-assignment_btn">
                        <StaffWrapper>
                            {/* <Button theme="btn-rounded btn-outline">{props.t("translate:PRE_QUIZ")}</Button> */}
                            {/* <Button theme="btn-rounded default btn-left"> {props.t("translate:VIEW_SUBMISSION")}</Button> */}
                        </StaffWrapper>
                        <StudentWrapper>
                            <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}> 
                            {props.oContDtls.oAsRes && !props.oContDtls.oAsRes.isQuizCmp && 
                                <Button clicked={() => navigateToAssesmnts()} theme="btn-rounded default btn-left">{props.t("translate:START_QUIZ")} </Button>
                            }
                            {/* </StudentArchiveContentWrapper> */}
                            {/* <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}>  */}
                            {props.oContDtls.oAsRes && props.oContDtls.oAsRes.isAsReTk && props.oContDtls.oAsRes.NoAttmpts === "M" &&
                                <Button clicked={() => navigateToAssesmnts()} theme="btn-rounded btn-outline">{props.t("translate:RETAKE_QUIZ")} </Button>
                            }
                            </StudentArchiveContentWrapper>
                            {props.oContDtls.oAsRes && props.oContDtls.oAsRes.lstAnsId && props.oContDtls.oAsRes.ShwAns && props.oContDtls.oAsRes.ShwAns !== "D" &&
                                <Button theme="btn-rounded secondary-btn btn-outline btn-left" clicked = {() => vwQuizDtls(props.oContDtls.oAsRes.lstAnsId)}>{props.t("translate:VIEW_SUBMISSION")}</Button>
                            }
                            {/* <div className="stud-assignment_btn">
                                check whether the student completed the mark as done or not
                                {markAsDone ?
                                    <Button theme="btn-rounded positive-btn btn-left">{props.t("translate:COMPLETED")}</Button>
                                    : !markAsDone && markAsDone !== undefined ?
                                        <Button theme="btn-rounded btn-outline btn-left" clicked={() => markAsCompleted()}>{props.t("translate:MARK_AS_COMPLETED")}</Button>
                                        : null
                                }
                            </div> */}
                        </StudentWrapper>
                    </div>
                </div>
                {/* ...............................tabs selection code......................  */}
                <div class="project-tab">
                    <div class="quiz-rating_tab">
                        <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                            <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true" onClick={()=>setIsLoadConv(false)}>{props.t("translate:OVER_VIEW")}</a>
                            <StudentArchiveConversationWrapper>
                                {props.oContDtls &&  props.oContDtls.isAlCn && <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={()=>setIsLoadConv(true)}>{props.t("translate:CONVERSATION")}</a>}
                            </StudentArchiveConversationWrapper>
                        </div>
                    </div>
                    <div class="tab-content student-rating" id="nav-tabContent">
                        <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                            <div className="quiz-tab_container">
                                    <StaffWrapper>
                                        {props.oContDtls && props.oContDtls.quiz && props.oContDtls.quiz.html  && props.oContDtls.quiz.html  !== "<p><br></p>" &&
                                            <div className="description-header">
                                                <p className="description-header_label">{props.t("translate:DESCRIPTION")}</p>
                                                <p className="quiz-content_label">
                                                <LmsEditorView contentData={props.oContDtls.quiz.html }  />
                                                </p>
                                                {/* <p className="more-content_label">Read more</p> */}
                                            </div>
                                        }
                                        <div class="student-rating_box">
                                            {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.subCnt && props.oContDtls.oAsRes.subCnt > 0 ?
                                                <div className="row m-0">
                                                    <div className="col-6 p-0">
                                                        <div class="rating__box divide-cont">
                                                                <p>
                                                                    <p className="point-table">{props.oContDtls.oAsRes.subCnt} <span>of</span> {props.oContDtls.oAsRes.totStud}</p>
                                                                    <p className="point-name">{props.t("translate:SUBMITTED")}</p>
                                                                </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 p-0">
                                                        <div class="rating__box">
                                                            <p className="point-table">{props.oContDtls.oAsRes.avgScr}</p>
                                                            <p className="point-name">{props.t("translate:AVAERAGE_SCORE")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                <p className="point-name">{props.t("translate:NO_QUIZ_SUBMISSION")}</p>
                                            }
                                        </div>
                                    </StaffWrapper>
                                    <StudentWrapper>
                                        {
                                            (props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.aAnswers && props.oContDtls.oAsRes.aAnswers.length > 0) ? 
                                                <div>
                                                    {props.oContDtls.oAsRes.aAnswers.map((oAnswer)=> {
                                                        let toTime = oAnswer.totTime;
                                                        let minTime , secTime;
                                                        if(toTime){
                                                          let dur =  toTime.split(':');
                                                            minTime = dur[0];
                                                            secTime = dur[1];
                                                        }
                                                        return (
                                                            <div class="student-rating_box">
                                                                <div className="row m-0">
                                                                    <div className="col-6 p-0">
                                                                        <div class="rating__box divide-cont">
                                                                            <p className="point-table">{oAnswer.markGot}<span>/{props.oContDtls.oAsRes.totMrk}</span></p>
                                                                            <p className="point-name">{props.t("translate:POINTS")}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-6 p-0">
                                                                        <div class="rating__box">
                                                                            {/* <p className="point-table">{oAnswer.totTime}</p> */}
                                                                            <p className="point-table">{minTime}<span>m</span>:{secTime}<span>s</span></p>
                                                                            <p className="point-name">{props.t("translate:TIME_FOR_ATTEMPT")}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    {/* <p className = "view-more_label">View 2 other previous attempts</p> */}
                                                </div>
                                            :
                                            <div class="student-rating_box">
                                                <div className="row m-0">
                                                    <div className="col-6 p-0">
                                                        <div class="rating__box divide-cont">
                                                            {props.oContDtls && props.oContDtls.oAsRes && 
                                                                <p className="point-table">{props.oContDtls.oAsRes.QPTime} <span>{props.t("translate:MINS")}</span></p>
                                                            }
                                                            <p className="point-name">{props.t("translate:TIME_LIMIT")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 p-0">
                                                        <div class="rating__box">
                                                            {props.oContDtls && props.oContDtls.oAsRes && 
                                                                <p className="point-table">{props.oContDtls.oAsRes.totQues}</p>
                                                            }
                                                            <p className="point-name">{props.t("translate:QUESTIONS")}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </StudentWrapper>
                                <div className="grade-formats">
                                    <div class="row m-0">
                                        {/* <div class="col-2 p-0">
                                            <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:GRADES_QUIZ")}</p>
                                        </div>
                                        <div class="col-10 p-0">
                                            <p className="form-list_value">10 {props.t("translate:MAX_POINTS")}</p>
                                        </div> */}
                                        <StaffWrapper>
                                            {/* <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:QUESTIONS")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                <p className="form-list_value subject_selection">50</p>
                                            </div> */}
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:TIME_LIMIT")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.QPTime &&
                                                    <p className="form-list_value">{props.oContDtls.oAsRes.QPTime} {props.t("translate:MINS")}</p>}
                                            </div>
                                            <div class="col-2 p-0">
                                            <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:QUESTIONS")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                               { props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.totQues ? <p className="form-list_value">{props.oContDtls.oAsRes.totQues}</p> :'-'} 
                                            </div>
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:QUE_PAPER")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.QPaperNm ? <p className="form-list_value">{props.oContDtls.oAsRes.QPaperNm}</p> : '-'}
                                            </div>
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:ALLOCATED_TIME")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.QPTime ? <p className="form-list_value">{props.oContDtls.oAsRes.QPTime}</p> : '-'}
                                            </div>
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:PARTICIPANTS")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.totStud ? <p className="form-list_value">{props.oContDtls.oAsRes.totStud} {props.t("translate:STUDENTS")}</p> : '-'}
                                            </div>
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:JUMBLED")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.Jumble ? <p className="form-list_value">{props.t("translate:YES")}</p> : props.t("translate:NO")}
                                            </div>
                                            {/* <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:PROCTORING")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.isOnBrd ? <p className="form-list_value">{props.t("translate:ONBOARD_ASSESMNT")}</p> : '-'}
                                            </div>
                                            <div class="col-2 p-0">
                                                <p className="form-list_points"><span className="point-notification"></span>{props.t("translate:PROCTORING_TEMP")}</p>
                                            </div>
                                            <div class="col-10 p-0">
                                                {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.ptrTmp ? <p className="form-list_value">{props.oContDtls.oAsRes.ptrTmp}</p> : '-'}
                                            </div> */}
                                        </StaffWrapper>
                                        <div class="col-2 p-0">
                                            <p className="form-list_points"><span className="point-notification"></span>{props.t("translate:MULTI_ATTEMPTS")}</p>

                                        </div>
                                        <div class="col-10 p-0">
                                            {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.NoAttmpts === 'M' ? <p className="form-list_value"> {props.t("translate:ALLOWED")}</p>:'-'}   
                                        </div>
                                        <div class="col-2 p-0">
                                            <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:OPEN_DATE")}</p>
                                        </div>
                                        <div class="col-10 p-0">
                                            {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.StDate ? <p className="form-list_value">{moment(props.oContDtls.oAsRes.StDate * 1000).format("DD-MMM-YYYY hh:mm A")}</p> : '-'}
                                        </div>
                                        <div class="col-2 p-0">
                                            <p className="form-list_points"><span className="point-notification"></span> {props.t("translate:CLOSE_DATE")}</p>
                                        </div>
                                        <div class="col-10 p-0">
                                            {props.oContDtls && props.oContDtls.oAsRes && props.oContDtls.oAsRes.EndDt ? <p className="form-list_value">{moment(props.oContDtls.oAsRes.EndDt * 1000).format("DD-MMM-YYYY hh:mm A")}</p> : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                            <div className="quiz-tab_container">
                                {isLoadConv && <ConversationComponent type='QUIZ' title={props.oContDtls.title} />}
                            </div>
                        </div>
                        {/* <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                                <p>sdf</p>
                            </div> */}
                    </div>
                </div>
            </div>
             {/* students analytics wrapper */}
            <StudentWrapper>
               {isLoadAnaly && values && <AnalyticsWrapper values = {values}></AnalyticsWrapper>}
            </StudentWrapper>
            {props.oContDtls && props.oContDtls.title&& !_.isEmpty(props.oContDtls) && !_.isEmpty(props.oContDtls.title) &&
               <SlideFooter sliderClbk={(asgmntId, type, currPage) => quizFooterChange(asgmntId, type, currPage)} sliderData={props.subChapItems} selectedId={values.id} urlData={values} subChapNm={props.slecSubChapNm} />
            }
            {itemDelModel && <LmsModal open={itemDelModel} onClose={()=>itemModalAction(false)}  value={props.oContDtls.title} modalTitle={props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={()=>deleteAsign()}/>}
        </div>
    );
}

const mapStateToProps = (state) => ({
    ...state.contentReducer
})
const mapDispatchToProps = {
    getContById,
    deleteItems,
    updateMarkAsDone,
    loadItems,
    getSubChapName,
    updateCntViewLog
}
const TabNavigator = (props) => <QuizContentComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components)