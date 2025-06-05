
import React, { lazy, useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { MoreVertical, Slash, Trash2, CheckCircle, Edit } from 'react-feather';
import '../../styles/_commonLmsStyle.scss';
import '../../styles/_quizListStyle.scss';
import HTTPService from "../../utils/http-util";
import _ from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import messageUtil from '../../utils/message-util';
import StaffWrapper from "../staff-wrapper/StaffWrapper";
import no_grade_book from '../../assets/images/grade-empty.svg';
import { deleteItems } from '../../store/actions/ContentActions';
import { connect } from 'react-redux';
import { filterArray } from '../../utils/filter-util';
import { lmsDateAndTimeFormat,lmsNonUTCDateAndTimeFormat} from '../../utils/helper';
import AnalyticsService from '../../service/analytics-service';
import UserSession from '../../utils/UserSession';
import archive_empty_img from '../../assets/images/archive-empty.svg';


// const Button = lazy(()=>
// import('../button/Button')
// );
const Searchbox = lazy(() =>
    import('../searchbox/Searchbox')
);
const NoRecord = lazy(() =>
    import('../../components/error-page/Datanotfound')
);
const LmsModal = lazy(() =>
    import("../modal/LmsModal")
);
const AnalyticsWrapper = lazy(() =>
import('../analytics-wrapper/AnalyticsWrapper')
);
const StudentWrapper = lazy(() =>
    import('../student-wrapper/StudentWrapper')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);

const QuizListComponent = (props) => {
    const [quizDtls, setQuizDtls] = useState([]);
    const [itemDelModel, setItemDelModel] = useState(false);
    const [quizId, setQuizId] = useState('');
    const [quizTitle, setQuzTitle] = useState('');
    const [quizSearch , setQuizSearch] = useState('');
    const [quizDtlsCpy, setQuizDtlsCpy] = useState([]);
    const isArchCrsEnable = UserSession.getArchCrsDtls();

    const history = useHistory();
    const location = useLocation();

    // Get quiz details
    useEffect(() => {
      AnalyticsService.setCurrPage('STUD_QUIZ_LST');
      if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content
            getQuizDtls();
        }
    }, // eslint-disable-next-line
    []); 
    // Get quiz details
    const getQuizDtls = () => {
        if (location.state) {
            let oReq = {
                PrID: location.state.PrID,
                CrID: location.state.CrID,
                DeptID: location.state.DeptID,
                SemID: location.state.SemID,
                AcYr: location.state.AcYr,
                SecID: location.state.SecID,
                type: 'QUIZ',
                subjId: location.state.subId,
                SubjId: location.state.subId,
                TPID : location.state.TPID,
                projct: {
                    'title': 1,
                    'vSts': 1,
                    'subChapNm': 1,
                    'asmnId': 1,
                    'asgmnt.asDuDt': 1,
                    'quiz.qzDuDt': 1,
                    'chapId' : 1,
                    'sChpId' : 1,
                    'seqNo' : 1
                }
            }
            HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit', oReq, null, (err, data) => {
                if (data && data.output) {
                    if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND") {
                        //  messageUtil.showInfo("NO_QUIZ_FOUND", true);
                    } else if (data.output.data && !_.isEmpty(data.output.data)) {
                        setQuizDtls(data.output.data);
                        setQuizDtlsCpy(data.output.data);
                    } else if (data.output.data && _.isEmpty(data.output.data)) {
                    }
                } else {
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }

            });
        }
    }

    // Delete quiz by id
    const deleteQuiz = () => {
        props.deleteItems(quizId, closeModel);
    }
    // Confirmation modal open for item delete
    const deleteModel = (id, title) => {
        setItemDelModel(true); //Open model
        setQuizId(id); // Set quiz id
        setQuzTitle(title); // Set title for model
    }
    // Close for model when delete quiz
    const closeModel = () => {
        setItemDelModel(false);
        getQuizDtls();
    }
    // Filter for quiz list
    const searchingHandling = (event) => {
        setQuizSearch(event.target.value);
        if (quizSearch) {
            setQuizDtls(filterArray(event.target.value, quizDtlsCpy, ['title']));
        } else {
            setQuizDtls(quizDtlsCpy);
        }
    }
    return (
        <div className="quiz-list_box">
            <div className="assignment-heading">
                <div className="cont-nav">
                    <div className="quiz-name">
                        <h6>{props.t("translate:QUIZZES")}</h6>
                        <p>{props.t("translate:ASSIGNMENTLISTCOMPONENT_THE EASIEST WAY")}</p>
                    </div>
                    <div className="manual-setting">
                        {/* 
                    <Button theme="btn-rounded default ">
                        <Plus className="svg-icon_small icon-white " />
                        New Discussion
                    </Button>
                    */}
                        {/* 
                    <i class="header-options">
                        <MoreVertical className="svg-icon_small icon-dark" />
                    </i>
                    */}
                    </div>
                </div>
            </div>
                <StudentArchiveContentWrapper>
                <div className="quiz-selection">
                    <div className="quiz-search">
                        <div class="row m-0">
                            <div class="col-6 p-0">
                                <div className="cont-search-box">
                                    <Searchbox placeholder={props.t("translate:SEARCH")} searchBoxTheme="search-default search-box_default search-outline" value={quizSearch} onChange={(event)=>searchingHandling(event)}/>
                                </div>
                            </div>
                            <div class="col-6 p-0">
                                <div className="assignment-option_list">
                                </div>
                            </div>
                        </div>
                    </div>
                    {quizDtls && quizDtls.length > 0 ?
                    <div>
                    {quizDtls && quizDtls.length > 0 && quizDtls.map((oQuizDtls, index) => {
                        return (
                            <div className="quiz-lists" style={ oQuizDtls.isHide ? { cursor:'not-allowed'} : { cursor:'pointer'}}>

                                <div className="quiz-titles"  onClick={() => { !oQuizDtls.isHide && history.push({ pathname: "/home-page/quiz-content", search: `?id=${oQuizDtls._id}&asmntId=${oQuizDtls.asmnId}&quizView=${true}`, state: location.state })}}>
                                    <p className={oQuizDtls.isHide ?"quiz-list_heading_hide":"quiz-list_heading"}>{oQuizDtls.title}</p>
                                   <div>
                                    {oQuizDtls.sChpName && 
                                   <p className="quiz_content">{oQuizDtls.sChpName}
                                   {oQuizDtls.quiz && oQuizDtls.quiz.qzDuDt &&  
                                   <span className="quiz-content_date">|  {props.t("translate:STUD_ASMNT_DUE")}: {lmsNonUTCDateAndTimeFormat(oQuizDtls.quiz.qzDuDt)} </span>}
                                   </p>} 
                                   </div>
                                    {/* <p className="quiz-list_content">The easiest way to collect quiz from students</p> */}
                                </div>
                                {!location.state.isDisabledContent &&
                                <StaffWrapper>
                                    <div className="quiz-options">
                                        <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{oQuizDtls.vSts === 'F' ?
                                            <span className="tooltip--bottom" data-tooltip="Published">
                                                <CheckCircle className="svg-icon_small icon-positive" />
                                            </span> :
                                            <span className="tooltip--bottom" data-tooltip="Unpublished">
                                                <Slash className="svg-icon_small icon-default " />
                                            </span>}</UIPerWrapper>

                                        <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                            <MoreVertical className="svg-icon_small icon-dark left-icon icon-pointer" />
                                        </div>
                                        <div class="dropdown-menu edit-quiz_cont">
                                            <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div class="dropdown-item user-info_contents" onClick={() => history.push({ pathname: '/home-page/quiz-creation', search: `?id=${oQuizDtls._id}`, state: location.state })}>
                                                <Edit className="svg-icon_light  icon-default" />
                                                <span className="option-list_dropdown">{props.t("translate:ASSIGNMENTLISTCOMPONENT_EDIT")}</span>
                                            </div></UIPerWrapper>
                                            <UIPerWrapper perCode={["rp_can_delete_lms_content"]}><div class="dropdown-item user-info_contents" onClick={() => deleteModel(oQuizDtls._id, oQuizDtls.title)}>
                                                <Trash2 className="svg-icon_light icon-error" />
                                                <span className="option-list_dropdown delete-quiz_cont">{props.t("translate:DELETE")}</span>
                                            </div></UIPerWrapper>
                                        </div>
                                    </div>
                                </StaffWrapper>
                                }
                            </div>
                        )
                    })}
                    </div> :<NoRecord img={no_grade_book} imgSize="no-data_img-default" quizCont={true} /> }
                </div>
                </StudentArchiveContentWrapper>
                {isArchCrsEnable && !_.isEmpty(isArchCrsEnable) && UserSession.archiveCourse && !UserSession.archiveCourse.canViewCnt() &&
                    <NoRecord img={archive_empty_img} imgSize="no-data_img-small" archivedEmptyContent={true} emtyCntTxt="ARCHIVE_QUIZ" />
                }
            {itemDelModel && <LmsModal open={itemDelModel} onClose={() => setItemDelModel(false)} value={quizTitle} modalTitle={props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={() => deleteQuiz()} />}
           <StudentWrapper>
               <AnalyticsWrapper></AnalyticsWrapper>
           </StudentWrapper>
        </div>
    );
}
const mapStateToProps = (state) => ({
    ...state.contentReducer
})
const mapDispatchToProps = {
    deleteItems
}
const TabNavigator = (props) => <QuizListComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(Components);
