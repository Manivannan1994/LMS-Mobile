import React ,{ Component ,lazy } from 'react';
import '../../styles/_studentGradeViewStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { MessageAdd, MessageSelect, MessagePost ,EmptyFeedback} from '../icons/Icons';
import Searchbox from '../searchbox/Searchbox';
import Button from '../button/Button';
import { X, Edit, Columns,ChevronDown, ArrowLeft,ChevronsDown} from 'react-feather';
import InputBox from '../input-box/InputBox';
import TextArea from '../text-area/TextArea';
import { connect } from 'react-redux';
import { getAssgnmntDetails, updateStudentAssignment, updatemultpleStudAsgnmnt,getAssgnmntDetailsForGrading,updateFields} from '../../store/actions/GradeBookActions';
import SelectControl from '../select-control/SelectControl';
import StudentNameComponent from '../student-name/StudentName';
import { generateHexDecCode} from '../../utils/helper';
import messageUtil from '../../utils/message-util';
import { lmsDateAndTimeFormat } from '../../utils/helper';
import { withTranslation } from "react-i18next";
// import { filterArray } from '../../utils/filter-util';
import _ from 'lodash';
import no_grade_book from '../../assets/images/grade-empty.svg';
import StudentWrapper from '../student-wrapper/StudentWrapper';
import StaffWrapper from '../staff-wrapper/StaffWrapper';
import AnalyticsService from '../../service/analytics-service';
import Table from '../table/Table';
import moment from 'moment';
import LmsCommonService from '../../service/lms-service';
import UserSession from '../../utils/UserSession';
import archive_empty_img from '../../assets/images/archive-empty.svg';
import { getAllParticipantGroups } from '../../store/actions/ParticipantsAction';

const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);
const AnalyticsWrapper = lazy(() =>
import('../analytics-wrapper/AnalyticsWrapper')
);
const StudentArchiveGradeWrapper = lazy(() =>
   import('../stud-arch-grade-wrapper/StudentArchiveGradeWrapper')
);
const LmsSelectDropDown = lazy(() => import("../lms-selectdropdown/LmsSelectDropDown"));


class StudentGradeViewComponent extends Component{

    constructor(props){
        super(props);
        this.urlValues=undefined;
        this.state = {
            aStudAssignmnts:[],
            oStudDtls:{},
            oPostAllDtls:{},
            resPst : false,
            edtPrvInd : undefined,
            stuAsgmtSr:'',
            aGradePages : [],
            pageValue:{},
            asmCtg : '',
        };
        AnalyticsService.setCurrPage('STUD_GRD_VW');
        this.studentTableColumns = [
            {
                id: "item",
                Header: this.props.t("translate:ITEM"),
                accessor: "title",
                sortType: "basic",
                Cell: ({ row }) => {
                    return (
                        <div className="details-content_box">
                            <Columns className="svg-icon_default icon-dark" />
                            <StaffWrapper>
                                <div className="details-content_label" onClick={() => !this.returnGroupGradeType(row.original) ? this.props.history.push({ pathname: "/home-page/assgnmnt-grad-view", state: this.props.location.state, search: `?asCnId=${row.original.asCnId}&studId=${this.state.oStudDtls && this.state.oStudDtls.studId}` }) 
                                : 
                            this.goToGroupGrading(row?.original)}>
                                    <p className="details-content_heading stud-grad_name">{row.original && row.original.title}</p>
                                    <p className='asgnmt-cat_label'>{row.original.asgnCatNam}</p>
                                </div>
                            </StaffWrapper>
                            <StudentWrapper>
                                {UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt() ?
                                <div className="details-content_label" onClick={() => this.props.history.push({ pathname: "/home-page/assignment-submission", search: `?cntId=${row.original.asCnId}&pastAsgmnt=${row.original.pastAsgmnt ? true : false}`, state: this.props.location.state })}>
                                    <p className="details-content_heading stud-grad_name">{row.original && row.original.title}</p>
                                    <p className='asgnmt-cat_label'>{row.original.asgnCatNam}</p>
                                </div> : 
                                <div className="details-content_label">
                                    <p className="details-content_heading stud-grad_name">{row.original && row.original.title}</p>
                                    <p className='asgnmt-cat_label'>{row.original.asgnCatNam}</p>
                                </div>}
                            </StudentWrapper>
                        </div>
                    );
                },
            },
            {
                id: "grdSts",
                Header: this.props.t("translate:STATUS"),
                accessor: (row) => row.grdSts === "GRD" ?this.props.t("translate:GRADED"):(row.aSts === "SUB" ?this.props.t("translate:SUBMITTED"):this.props.t("translate:NOT_YET_SUBMITTED")),
                sortType: "basic",
                Cell: ({ row }) => {
                    return <>{row.original.grdSts && row.original.grdSts === "GRD" ? <span className="grad-sub_content">{this.props.t("translate:GRADED")}</span> : row.original.aSts && row.original.aSts === "SUB" ? <span className="grad-sub_content">{this.props.t("translate:SUBMITTED")}</span> : <span className="grad-sub_content">{this.props.t("translate:NOT_YET_SUBMITTED")}</span>}</>;
                },
            },
            {
                id: "asDuDt",
                Header: this.props.t("translate:DUE_DATE"),
                sortType: "basic",
                accessor: (row) => (row.asgmnt && row.asgmnt.asDuDt)? moment(row.asgmnt.asDuDt).unix():-1,
                Cell: ({ row }) => {
                    return (
                        <>{(row.original.asgmnt && row.original.asgmnt.asDuDt) ? lmsDateAndTimeFormat(row.original.asgmnt.asDuDt) : "-"}</>
                    )
                }
            },
            {
                id: "mrkGrd",
                Header: this.props.t("translate:GRADE_CAP"),
                accessor: "mrkGrd",
                sortType: "basic",
                Cell: ({ row, column, onCellEdit }) => {
                    const onChange = e => {
                        onCellEdit(row.index, column.id);
                        this.setMark(e, row.index);
                    };
                    const isArchvCrsEnable = UserSession.getArchCrsDtls();
                    return (
                        <>
                            <StaffWrapper>
                                {!this.props?.location?.state?.isDisabledContent ?
                            <div className={this.returnGroupGradeType(row.original) ? "tooltip--right_input" : ''} data-tooltip={this.props.t('translate:GRADE_ON_ASSIGNMET_PAGE')}>
                                <div className="edit-marks">
                                    <InputBox defaultDisabled={this.returnGroupGradeType(row.original)} className="input-table" value={row.original.mrkGrd} onChange={onChange} onBlur={() => this.saveMark(row.index, row.original)} />
                                    {row.original.asgmnt && row.original.asgmnt.grdCnf && row.original.asgmnt.grdCnf !== "POINT" ? (
                                        <div className="stud-grade_lists">
                                            {/* {} */}
                                            <SelectControl disabled={this.returnGroupGradeType(row.original)} dropdownTheme="dropdown-round drop-down_round" data={row.original.aGrades} onChange={(e) => {onCellEdit(row.index, column.id); this.gradeChange(e, row.index, row.original)}}>
                                                <ChevronDown className="svg-icon_small close-icon-network" />
                                            </SelectControl>
                                        </div>
                                    ) : row.original.asgmnt && row.original.asgmnt.mxMrk ? (
                                        <div className="grade_align"> / {row.original.asgmnt.mxMrk}</div>
                                    ) : (
                                        ""
                                    )}
                                    {/* {(this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf == "POINT" && this.props.oAsgnmntDtls.mxMrk) && <span className="grad-sub_content">/{this.props.oAsgnmntDtls.mxMrk}</span>} */}
                                    {(!row.original.grdSts || (row.original.grdSts && row.original.grdSts !== "GRD")) && (row.original.mrkGrd || row.original.mrkGrd === "0") ? (
                                        <div onClick={() => {onCellEdit(row.index, column.id); this.postMark(row.index, row.original)}}>
                                            <Button theme="btn-rounded secondary-btn btn-left">{this.props.t("translate:POST")}</Button>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                    {row.original.grdSts && row.original.grdSts === "GRD" ? (
                                        <div className="post-align_content">
                                            <p className="posted-info_label">{this.props.t("translate:POSTED")}</p>
                                        </div>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            </div> : 
                            <InputBox defaultDisabled={true} className="input-table" value={row.original.mrkGrd} />}
                            </StaffWrapper>
                            <StudentWrapper>
                                <StudentArchiveGradeWrapper isGradeView={_.isEmpty(isArchvCrsEnable) ? false : true}>
                                <div className="edit-marks">
                                    {row.original.asgmnt && row.original.asgmnt.grdCnf && row.original.asgmnt.grdCnf === "POINT" ? (
                                        <p className="stud-mark_label">
                                            {row.original.grdSts && row.original.grdSts === "GRD"
                                                ? row.original.asgmnt &&
                                                    row.original.asgmnt.mxMrk && (
                                                        <span className="grad-sub_content">
                                                            {row.original.mrkGrd}/{row.original.asgmnt.mxMrk}
                                                        </span>
                                                    )
                                                : row.original.asgmnt && row.original.asgmnt.mxMrk && <span className="grad-sub_content">-/{row.original.asgmnt.mxMrk}</span>}
                                        </p>
                                    ) : (
                                        <p>{row.original.grdSts && row.original.grdSts === "GRD" ? row.original.mrkGrd && <span className="grad-sub_content">{row.original.mrkGrd}</span> : "-"}</p>
                                    )}
                                </div>
                                </StudentArchiveGradeWrapper>
                            </StudentWrapper>
                        </>
                    );
                },
            },
            {
                id: "feedback",
                Header: this.props.t("translate:FEEDBACK_CAP"),
                accessor: "fdBk",
                sortType: "basic",
                disableSortBy: true,
                Cell: ({ row }) => {
                    return (
                        <>
                            <StaffWrapper>
                                <div>
                                    {(row.original.editFdBk || row.original.showFdBk) && (
                                        <div className="message-discussion_icon">
                                            <MessageSelect iconStyle="svg-icon_small icon-dark icon-pointer" />
                                        </div>
                                    )}
                                    {row.original.fdBk && !row.original.showFdBk && !row.original.editFdBk && (
                                        <div onClick={() => this.showFeedBack(row.index, "show")}>
                                            <div className="message-discussion_icon">
                                                <MessagePost iconStyle="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>
                                    )}
                                    {!row.original.fdBk && !row.original.editFdBk && !row.original.showFdBk && (
                                        !this.props.location.state?.isDisabledContent ?
                                        <div className={this.returnGroupGradeType(row.original) ? "tooltip--right_feedback" : ''} data-tooltip={this.props.t('translate:FEEDBACK_ON_ASSIGNMENT_PAGE')}>
                                        <div onClick={() => this.editFeedBack(row.index, "show")}>
                                            <div className="message-discussion_icon">
                                                <MessageAdd iconStyle="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>
                                        </div> : <></>
                                    )}
                                </div>
                            </StaffWrapper>
                            <StudentWrapper>
                                {row.original.fdBk ? (
                                    <div onClick={() => this.showFeedBack(row.index, "show")}>
                                        <div className="message-discussion_icon">
                                            <MessagePost iconStyle="svg-icon_small icon-dark icon-pointer" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="message-discussion_icon">
                                        <EmptyFeedback iconStyle="svg-icon_small icon-dark icon-pointer" />
                                    </div>
                                )}
                            </StudentWrapper>
                            <div>
                                {row.original.editFdBk && (
                                    <div class="dropdown-menu feedback-content" style={{ display: row.original.editFdBk ? "block" : "none" }}>
                                        <p className="feedback-label">{this.props.t("translate:FEEDBACK_FOR_STUDENT")}</p>
                                        <TextArea className="text-area_table" value={row.original.fdBk} onChange={(e) => this.fdBkChange(e, row.index)} />
                                        <div className="feedback-buttons">
                                            <Button theme="btn-rounded secondary-btn" clicked={() => this.editFeedBack(row.index, "cancel")}>
                                                {this.props.t("translate:CANCEL")}
                                            </Button>
                                            {!this.returnGroupGradeType(row.original) &&
                                            <Button defaultDisabled={this.returnGroupGradeType(row.original)} theme="btn-rounded default btn-left" clicked={(e) => this.postFeedBack(row.index)}>
                                                {this.props.t("translate:POST_FEEDBACK")}
                                            </Button>
                                            }
                                        </div>
                                    </div>
                                )}
                                {row.original.showFdBk && (
                                    <div class="dropdown-menu feedback-content_edit" style={{ display: row.original.showFdBk ? "block" : "none" }}>
                                        <div className="edit-feedback_dismiss">
                                            <StaffWrapper>
                                                <p className="feedback-label_edit">{this.props.t("translate:FEEDBACK_FOR_STUDENT")}</p>
                                            </StaffWrapper>
                                            <StudentWrapper>
                                                <p className="feedback-label_edit">{this.props.t("translate:TEACHER_FEEDBACK")}</p>
                                            </StudentWrapper>
                                            <div onClick={() => this.showFeedBack(row.index, "cancel")}>
                                                <X className="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>

                                        <div className="stud-feedback_edit">
                                            <div className="stud-feedback_info">
                                                {this.state.oStudDtls && this.state.oStudDtls.PhotoImgID && this.state.oStudDtls.PhotoImgID.length > 0 ? <img src={"/Image/getImage/" + this.state.oStudDtls.PhotoImgID} className="stud-img_list" alt="img" /> : <StudentNameComponent className="student-name_icon" fName={this.state.oStudDtls.studNm.substring(0, 1)} clrCode={generateHexDecCode(this.state.oStudDtls.studId)} />}
                                                <p className="edit-stud_name">{this.state.oStudDtls.studNm}</p>
                                            </div>
                                            {!this.props.location.state?.isDisabledContent &&
                                            <StaffWrapper>
                                                {!this.returnGroupGradeType(row.original) &&
                                                 <Edit onClick={() => this.editFeedBack(row.index, "show", "canclShow")} className="svg-icon_small icon-dark icon-pointer" />
                                                }
                                            </StaffWrapper>
                                            }
                                        </div>
                                        <p className="edit-info_label">{row.original.fdBk}</p>
                                        <p className="edit-info_date">{row.original.fdBkOn ? lmsDateAndTimeFormat(row.original.fdBkOn) : ""}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    );
                },
            },
        ];
        this.loadPageItems();
    }

    componentDidMount() {
        //get the domain values
        const oDomainCodes = {
            codes : ['ASSGNMNT_CAT'],
        };

        // Set domain code values
        LmsCommonService.getDomainByCode(oDomainCodes, (err, data)=>{
            if(data && data.length){
            for(let cd = data.length - 1; cd >= 0; cd--){
                if(data[cd].code === "ASSGNMNT_CAT" && data[cd].ccodes && data[cd].ccodes.length){
                    let aCpyCat = [{
                        code : "",
                        text : "All"
                    }];
                    aCpyCat = aCpyCat.concat(data[cd].ccodes);
                    this.props.updateFields('aAsgnmCats', aCpyCat);
                }
            }
            }
        });  
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

    // callback function called from TablePagination component
    loadPageItems = (pageValues={}) => {
        //Get the assignment details against the student id
        this.props.getAssgnmntDetailsForGrading(this.props.location,pageValues,this.state.stuAsgmtSr, this.state.asmCtg); 
    }

     // Grade change
     gradeChange = (event, index,studAsgmnt) => {
        const aCopyStuds = [...this.state.aStudAssignmnts];
        if(studAsgmnt.aGrades && studAsgmnt.aGrades.length){
            aCopyStuds[index].grad = '';
            aCopyStuds[index].mrkGrd = ''
            for(let grd = studAsgmnt.aGrades.length - 1; grd >= 0; grd--){
                if(event.target.value === studAsgmnt.aGrades[grd].Grade){
                    aCopyStuds[index].grad   = studAsgmnt.aGrades[grd].Grade;
                    aCopyStuds[index].mrkGrd = studAsgmnt.aGrades[grd].GradeNm;
                    break;
                }
            }
            this.setState({ ...this.state, aStudAssignmnts: aCopyStuds });
            this.saveMark(index,studAsgmnt);
        }
    }

    // Post all grade
    postAllGrade = () => {
        this.setState({resPst :false});
        if (this.state.oPostAllDtls && this.state.oPostAllDtls.aCntIds && this.state.oPostAllDtls.aCntIds.length && this.state.oStudDtls && this.state.oStudDtls.studId) {
            const oPstRq = {
                studId:  this.state.oStudDtls.studId,
                toPsAsgmnts: this.state.oPostAllDtls.aCntIds,
                'pstMrk': true,
                stuAsgmtSr : this.state.stuAsgmtSr,
                asmCtg : this.state.asmCtg
            };
            this.props.updatemultpleStudAsgnmnt(oPstRq, 'studView',this.props.location,this.state.pageValue);
        }
    }

    // Post the mark
    postMark = (index,studAsgmnt) => {
        if(((!this.state.resPst) && ((this.state.aStudAssignmnts[index].mark != null && !isNaN(this.state.aStudAssignmnts[index].mark)) || (this.state.aStudAssignmnts[index].grad)))){
            const oPstRq = {
                _id : this.state.aStudAssignmnts[index]._id,
                'pstMrk' : true,
                stuAsgmtSr : this.state.stuAsgmtSr,
                asmCtg : this.state.asmCtg
            };
            this.props.updateStudentAssignment(oPstRq,'studView',this.props.location,this.state.pageValue);  
        }
    }

    // save mark for student
    saveMark = (index,studAsgmnt) => {
        this.setState({resPst :false});
        const oStudMarks = this.state.aStudAssignmnts[index];
        // Number check for grade config
        if(studAsgmnt && studAsgmnt.asgmnt && studAsgmnt.asgmnt.grdCnf && studAsgmnt.asgmnt.grdCnf === "GRD"){
            if(oStudMarks.mrkGrd !== ''){
                // Compares the mark with max mark
                if(oStudMarks.mrkGrd > studAsgmnt.asgmnt.mxMrk){
                    messageUtil.showWarning("EXCEEDS_MAX_MARK", true);
                    return;
                }
                let mrkTk = (parseFloat(oStudMarks.mrkGrd)*parseFloat(this.props.GrdPercent))/parseFloat(studAsgmnt.asgmnt.mxMrk);
                if(oStudMarks.mrkGrd !== null && !isNaN(oStudMarks.mrkGrd)){
                    if(studAsgmnt.aGrades && studAsgmnt.aGrades.length){
                        let mrkVal = parseFloat(mrkTk);
                        let gradeMat = false;
                        for(let grd =studAsgmnt.aGrades.length - 1; grd >= 0; grd--){
                            // Exceeds the grade maximum mark
                            if(mrkVal >= studAsgmnt.aGrades[grd].MinMrk && mrkVal <= studAsgmnt.aGrades[grd].MaxMrk){
                                gradeMat = true;
                                let studMrk = oStudMarks.mrkGrd;
                                oStudMarks.mark = studMrk;
                                oStudMarks.grad = studAsgmnt.aGrades[grd].Grade;
                                oStudMarks.mrkGrd = studAsgmnt.aGrades[grd].GradeNm;
                            }
                        }
                        if(!gradeMat) {
                            this.setState({resPst :false});
                            messageUtil.showWarning("INVALID_GRADE", true);
                            return;
                        }
                    }
                }else{
                    // letters check for grade config
                    if(oStudMarks.mrkGrd && studAsgmnt.aGrades && studAsgmnt.aGrades.length){
                        for(let grd = studAsgmnt.aGrades.length - 1; grd >= 0; grd--){
                            if(oStudMarks.mrkGrd === studAsgmnt.aGrades[grd].GradeNm){
                                oStudMarks.grad = studAsgmnt.aGrades[grd].Grade;
                                oStudMarks.mark = '';
                                break;
                            }else {
                                if(grd === 0){
                                    this.setState({resPst : true});
                                    messageUtil.showWarning("INVALID_GRADE", true);
                                    return;
                                }
                            }
                        }
                    }
                }
            }else{
                oStudMarks.grad = '';
                oStudMarks.mrkGrd = ''
                oStudMarks.mark = ''
            }
        }else{
            // Marks entered within max range
            if(studAsgmnt.asgmnt && studAsgmnt.asgmnt.mxMrk !== undefined && studAsgmnt.asgmnt.mxMrk !== null && !isNaN(studAsgmnt.asgmnt.mxMrk)){
                let mrkVal = parseFloat(oStudMarks.mrkGrd);
                if(oStudMarks.mrkGrd !== undefined && oStudMarks.mrkGrd !== ''){
                    // Check the mark exceeds the maximum mark
                    if(mrkVal < 0 || mrkVal > studAsgmnt.asgmnt.mxMrk){
                        this.setState({resPst : true});
                        let invMsg = this.props.t("translate:INVALID_POINTS")+" 0 - "+studAsgmnt.asgmnt.mxMrk
                        messageUtil.showWarning(invMsg, true);
                        return;
                    }else{
                        oStudMarks.mark = oStudMarks.mrkGrd;
                    }
                }else{
                    oStudMarks.mark = oStudMarks.mrkGrd;
                }
            }
        }
        const aCopyStudsAssgmnt = [...this.state.aStudAssignmnts];
        aCopyStudsAssgmnt[index] = oStudMarks;
        this.setState({ ...this.state, aStudAssignmnts: aCopyStudsAssgmnt });
        let oSaveRq = oStudMarks;
        oSaveRq.savMark = true;
        if(oStudMarks.grdSts === "GRD"){
            oSaveRq.notFinlz = true;
        }
        oSaveRq.stuAsgmtSr = this.state.stuAsgmtSr;
        oSaveRq.asmCtg = this.state.asmCtg;
        this.props.updateStudentAssignment(oSaveRq,'studView',this.props.location,this.state.pageValue);
    }

    // set the value of mark in state
    setMark = (event, index) => {
        const aCopyStuds = [...this.state.aStudAssignmnts];
        aCopyStuds[index].mrkGrd = event.target.value;
        this.setState({ ...this.state, aStudAssignmnts: aCopyStuds });
    }


    // edit feedback
    editFeedBack = (index, actKey, canclShow) => {
        const aCopyStuds = [...this.state.aStudAssignmnts];
        aCopyStuds[index].showFdBk = false;
        if(canclShow === "canclShow"){
           // this.state.edtPrvInd = undefined;
            this.setState({edtPrvInd:undefined});
        }
        if(actKey === 'show'){
            if(this.state.edtPrvInd !== index){
                aCopyStuds[index].editFdBk = true;
                // Close the opened index feedback dropdown
                if(this.state.edtPrvInd !== undefined && this.state.edtPrvInd !== null && !isNaN(this.state.edtPrvInd)){
                    aCopyStuds[this.state.edtPrvInd].editFdBk = false;
                    aCopyStuds[this.state.edtPrvInd].showFdBk = false;
                }
            }
            //this.state.edtPrvInd = index;
            this.setState({edtPrvInd:index});
        }else{
            //this.state.edtPrvInd = undefined;
            this.setState({edtPrvInd:undefined});
            aCopyStuds[index].editFdBk = false;
        }
        this.setState({ ...this.state, aStudAssignmnts: aCopyStuds });
    }

    // show feedback value
    showFeedBack = (index, actKey) => {
        const aCopyStuds = [...this.state.aStudAssignmnts];
        aCopyStuds[index].editFdBk = false;
        if(actKey === 'show'){
            if(this.state.edtPrvInd !== index){
                aCopyStuds[index].showFdBk = true;
                // Close the opened index feedback dropdown
                if(this.state.edtPrvInd !== undefined && this.state.edtPrvInd !== null && !isNaN(this.state.edtPrvInd)){
                    aCopyStuds[this.state.edtPrvInd].editFdBk = false;
                    aCopyStuds[this.state.edtPrvInd].showFdBk = false;
                }
            }
            //this.state.edtPrvInd = index;
            this.setState({edtPrvInd:index});
        }else{
            //this.state.edtPrvInd = undefined;
            this.setState({edtPrvInd:undefined});
            aCopyStuds[index].showFdBk = false;
        }
        this.setState({ ...this.state, aStudAssignmnts: aCopyStuds });
    }

    // set feedback value
    fdBkChange = (event, index) => {
        const aCopyStuds = [...this.state.aStudAssignmnts];
        aCopyStuds[index].fdBk = event.target.value;
        this.setState({ ...this.state, aStudAssignmnts: aCopyStuds });
    }

    // post the feedback
    postFeedBack = (index) => {
        const oPstRq = {
            _id       : this.state.aStudAssignmnts[index]._id,
          'pstFdBk'   : true,
            fdBk      : this.state.aStudAssignmnts[index].fdBk,
            stuAsgmtSr : this.state.stuAsgmtSr,
            asmCtg : this.state.asmCtg
        };
        this.props.updateStudentAssignment(oPstRq,'studView',this.props.location,this.state.pageValue);
        //this.state.edtPrvInd = undefined;
        this.setState({edtPrvInd:undefined});
        
    }

    // Student Assignment Items Filter
    srchStudAsgmntItms = (event) => {
        if(event.target.value && event.target.value.length > 2){
            this.setState({ stuAsgmtSr : event.target.value, aStudAssignmnts : [] });
        }else{
            this.setState({ stuAsgmtSr : event.target.value });
        }
        // minimum of 3 chars for assignment search
        if (event.target.value && event.target.value.length < 3) {
            return;
        }
        this.props.getAssgnmntDetailsForGrading(this.props.location,this.state.pageValue,event.target.value,this.state.asmCtg); 
    };

    // set assignment category 

    setCatValue = (event) => {
        this.setState({ asmCtg : event.target.value, aStudAssignmnts : []});
        this.props.getAssgnmntDetailsForGrading(this.props.location,this.state.pageValue,this.state.stuAsgmtSr, event.target.value); 
    }

    //Update the state when change occurs
    componentWillReceiveProps(NextToProps){
        if(NextToProps && !_.isEmpty(NextToProps.oStudDtls)){
            this.setState({
                oStudDtls:this.props.oStudDtls,
                aStudAssignmnts:[...this.props.aStudAssignmnts],
                oPostAllDtls:this.props.oPostAllDtls,
                aGradePages : this.props.aGradePages
            });
        }
    }

    returnGroupGradeType = (asgnData) => {
     if(this.props?.participantGroups && this.props?.participantGroups.length 
        && asgnData && asgnData?.asgmnt && asgnData?.asgmnt?.grpIds && asgnData?.asgmnt?.grpIds?.length && this.state.oStudDtls?.studId ){
            const currentGrpIds = asgnData?.asgmnt?.grpIds
            currentGrpIds.map((grp) => {
                const matchingGrp = this.props?.participantGroups.find((mg) => mg._id === grp.grpId)
                if(matchingGrp && matchingGrp.students?.length){
                    if(matchingGrp.students.some((stud) => stud.studId === this.state.oStudDtls?.studId )){
                        grp.isStudPresent = true
                    }else{
                        grp.isStudPresent = false
                    }
                }
                return grp
            })
            const currentStudGroup = currentGrpIds.find(s => s.isStudPresent)
            if(currentStudGroup){
                // this.setState({currentStudGrpId:currentStudGroup?.grpId})
            }
            const isRestrict = currentGrpIds?.length ? currentGrpIds.some(c => c.isStudPresent && !c.indvGrd) : false
            return isRestrict
        }else{
            return false;
        }
    }

    goToGroupGrading = (asgnData) => {
        if(this.props?.participantGroups && this.props?.participantGroups.length 
            && asgnData && asgnData?.asgmnt && asgnData?.asgmnt?.grpIds && asgnData?.asgmnt?.grpIds?.length && this.state.oStudDtls?.studId ){
                const currentGrpIds = asgnData?.asgmnt?.grpIds
                currentGrpIds.map((grp) => {
                    const matchingGrp = this.props?.participantGroups.find((mg) => mg._id === grp.grpId)
                    if(matchingGrp && matchingGrp.students?.length){
                        if(matchingGrp.students.some((stud) => stud.studId === this.state.oStudDtls?.studId )){
                            grp.isStudPresent = true
                        }else{
                            grp.isStudPresent = false
                        }
                    }
                    return grp
                })
                const currentStudGroup = currentGrpIds.find(s => s.isStudPresent)
                if(currentStudGroup){
                    this.props.history.push({
                        pathname: '/home-page/assgnmnt-grad-view', 
                        state: this.props.location.state, 
                        search:`?asCnId=${asgnData?.asCnId}&studId=${this.state.oStudDtls?.studId}&isStud=${true}&actTab=${null}&isGrp=${true}&grpId=${currentStudGroup?.grpId}`
                    })
                }
            }
    }
  
    render(){
        const {oStudDtls,aStudAssignmnts,oPostAllDtls,aGradePages}=this.state;
        const isArchCrsEnable = UserSession.getArchCrsDtls();
        return(
                <div>   
                    <div className="grade-view_heading">
                        <StaffWrapper>
                    <div className="cont-nav ">
                        <div className="course-name student-info_content icon-pointer">
                        <ArrowLeft className="svg-icon_default icon-default right-icon" onClick={()=>this.props.history.push({ pathname: '/home-page/tablelist-page',state: this.props.location.state })}/>
                            {oStudDtls && oStudDtls.PhotoImgID && oStudDtls.PhotoImgID.length>0 ? 
                                <img src={'/Image/getImage/' + oStudDtls.PhotoImgID} className="stud-info_img" alt="img"/>:
                                <StudentNameComponent className="student-name_header" fName={oStudDtls.studNm && oStudDtls.studNm.substring(0, 1)} clrCode={generateHexDecCode(oStudDtls.studId)}/>
                            }
                            <div className="student-name_view">
                                <h6>{oStudDtls && oStudDtls.studNm}</h6>
                                <p>{oStudDtls && oStudDtls.studRlNo} - {this.props.location.state && this.props.location.state.CrName}</p>
                            </div>
                        </div>
                        <div>
                                {
                                    this.props.oStudFinGrad && !_.isEmpty(this.props.oStudFinGrad) && (this.props.oStudFinGrad.fnGrad && this.props.oStudFinGrad.finWghtInPer != null && !isNaN(this.props.oStudFinGrad.finWghtInPer)) ?
                                    <p className="overall-grd_label">
                                        {this.props.t("translate:OVERALL_GRADE")}<span className="overall-grd_pnt_stud"> {this.props.oStudFinGrad.fnGrad} {this.props.oStudFinGrad.finWghtInPer}%</span>
                                    </p>
                                     : 
                                     ''
                                }
                        </div>
                        {/* <div className="manual-setting">
                            <Button theme="btn-transparent">
                            Current Grade
                            </Button>
                            <Button theme="btn-rounded positive-btn btn-right">
                            A+
                            </Button>
                            <Button theme="btn-rounded secondary-btn ">
                                <MessageCircle className="svg-icon_small icon-dark icon-space_right"/>
                                Message
                            </Button>
                            <i class="header-options">
                                <Upload className="svg-icon_small icon-dark" />
                            </i>
                            <i class="header-options">
                                <Download className="svg-icon_small icon-dark" />
                            </i>
                            <i class="header-options">
                                <MoreVertical className="svg-icon_small icon-dark" />
                            </i>
                        </div> */}
                    </div>
                    </StaffWrapper>
                   
                    <StudentWrapper>
                    <div className="cont-nav ">
                        <div className="course-name">
                        <h6>{this.props.t("translate:GRADEBOOK")}</h6>
                       <p>{this.props.t("translate:GRAD_BOOK_DESC")}
                       {/* <span>{this.props.t("translate:LEARN_MORE")}</span> */}
                       </p>
                        </div>
                        <div>
                        {
                            this.props.oStudFinGrad && !_.isEmpty(this.props.oStudFinGrad) && (this.props.oStudFinGrad.fnGrad && this.props.oStudFinGrad.finWghtInPer != null && !isNaN(this.props.oStudFinGrad.finWghtInPer)) ?
                            <p className="overall-grd_label">
                                {this.props.t("translate:OVERALL_GRADE")}<span className="overall-grd_pnt_stud"> {this.props.oStudFinGrad.fnGrad} {this.props.oStudFinGrad.finWghtInPer}%</span>
                            </p>
                            :
                            ''
                        }
                        </div>
                    </div>
                    </StudentWrapper>
                    </div>
                    <StudentArchiveGradeWrapper>
                    <div className="student-grade_container">
                        <div className="student-table_search">
                            <div class="row m-0">
                                <div class="col-6 p-0">
                                    <div className="cont-search-box">
                                    <Searchbox 
                                        value = {this.state.stuAsgmtSr}
                                        placeholder = {this.props.t("translate:SEARCH_ITEMS")}
                                        onChange = {(event) =>
                                            this.srchStudAsgmntItms(event)
                                        }
                                        searchBoxTheme="search-default search-box_default search-outline" 
                                    />
                                    </div>
                                </div>
                                {!this.props.location.state?.isDisabledContent &&
                                <StaffWrapper>
                                    <div class="col-6 p-0">
                                        <div className="grade-post_details">
                                        {oPostAllDtls && oPostAllDtls.postCount > 0 &&
                                            <Button theme="btn-rounded secondary-btn btn-right" clicked={() => this.postAllGrade()}>
                                                <span>{this.props.t("translate:POST_ALL")} {oPostAllDtls.postCount} {this.props.t("translate:POST_ALL_GRADES")}</span>
                                            </Button>
                                        }
                                        {/* <SelectControl dropdownTheme="dropdown-default  drop-down_arrow " >
                                                <ChevronsDown className="svg-icon_small close-icon-network" />
                                        </SelectControl> */}
                                        <LmsSelectDropDown className="dropdown-default drop-down_arrow" value={this.state.asmCtg} defaultDisabled={false} 
                                            dropDown={this.props.aAsgnmCats} keyTag="code" nameTag="text" onChange = {(event) =>
                                                this.setCatValue(event)
                                            }>
                                            <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                                        </LmsSelectDropDown>
                                        </div>
                                    </div>
                                </StaffWrapper>
                                }
                            </div>
                        </div>
                        {this.state.aStudAssignmnts && this.state.aStudAssignmnts.length > 0 ?
                            <div className="table-list_container">
                                <Table data={this.state.aStudAssignmnts} columns={this.studentTableColumns} defaultSortBy="item" disablePagination={true}/>
                            </div>
                        :<NoRecord img={no_grade_book} imgSize="no-data_img-default" studGradeView={true}/>}
                    </div>
                    </StudentArchiveGradeWrapper>
                    {isArchCrsEnable && !_.isEmpty(isArchCrsEnable) && UserSession.archiveCourse && !UserSession.archiveCourse.canViewGrd() &&
                        <NoRecord img={archive_empty_img} imgSize="no-data_img-small" archivedEmptyContent={true} emtyCntTxt ="ARCHIVE_GRADE_BOOK"/>
                    }
                    <StudentWrapper>
                        <AnalyticsWrapper></AnalyticsWrapper>
                    </StudentWrapper>
                </div>
            )
    }

}

// To get the reducers values
const mapStateToProps = (state) => ({
    ...state.gradeBookReducer,
    ...state.ParticipantReducer
});

const mapDispatchToProps = {
    getAssgnmntDetails,
    updateStudentAssignment,
    updatemultpleStudAsgnmnt,
    getAssgnmntDetailsForGrading,
    updateFields,
    getAllParticipantGroups
};

const TabNavigator = (props) => <StudentGradeViewComponent {...props} />
 
const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator);
 
export default withTranslation()(Components);

// export default StudentGradeViewComponent;