import React, { Component, lazy } from 'react';
import '../../styles/_studentGradeList.scss';
import '../../styles/_commonLmsStyle.scss';
// import studImg from '../../assets/images/user-profile.png';
// import { Download, MoreVertical, Upload, Columns, UserCheck, Users, MessageSquare, MessageCircle, Edit2, ChevronsDown } from 'react-feather';
// import studListImg from '../../assets/images/user.png';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import {  withRouter } from 'react-router-dom';
import { lmsDateAndTimeFormat } from '../../utils/helper';
import { getAssgnStuds, getAssgnmntDetails, updateStudentAssignment, updatemultpleStudAsgnmnt } from '../../store/actions/GradeBookActions';
import { X, Edit, ChevronDown } from 'react-feather';
import messageUtil from '../../utils/message-util';
import no_grade_book from '../../assets/images/grade-empty.svg';
import {MessageAdd, MessageSelect, MessageHide, MessagePost } from '../icons/Icons';
import { generateHexDecCode} from '../../utils/helper';
import Table from '../table/Table';
// import { filterArray } from '../../utils/filter-util';
import queryString from 'query-string';
import moment from 'moment';

const SearchBox = lazy(() =>
import('../searchbox/Searchbox')
);

const Button = lazy(()=>
import('../button/Button')
);
const InputBox = lazy(()=>
import('../input-box/InputBox')
);
const SelectControl = lazy(()=>
import('../select-control/SelectControl')
);
const TextArea = lazy(()=>
import('../text-area/TextArea')
);
const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);
const StudentNameComponent = lazy(()=>
import('../student-name/StudentName')
);

// import studImg from '../../assets/images/studImg.svg';
class StudentGradeListComponent extends Component {

    constructor(props) {
        super(props);
        this.values = {}
        this.state = {
            aStudents: [],
            srchstud:'',
        };
        this.stGrdstate = {
            oAsgnReq : {},
            resPst : false,
            aGradePages : [],
            edtPrvInd : undefined,
            pageVals : {}
        };

        const goToNextPage = (rowDet) => {
            console.log("this.props.actTab",this.props.actTab)
            this.props.history.push({
                pathname: '/home-page/assgnmnt-grad-view', 
                state: this.props.location.state, 
                search:`?asCnId=${this.values.id}&studId=${rowDet.studId}&isStud=${true}&actTab=${this.props.actTab}`
            })
        }

        this.studentTableColumns = [
            {
                id: "PhotoImgID",
                Header: '',
                accessor: "PhotoImgID",
                sortType: "basic",
                disableSortBy: true,
                Cell: ({ row }) => {
                    return (
                        <div className="stud-grad_list">
                            {row.original.PhotoImgID && row.original.PhotoImgID.length > 0 ? <img src={"/Image/getImage/" + row.original.PhotoImgID} className="stud-img_list" alt="img" /> : row.original && row.original.FNa && <StudentNameComponent className="student-name_icon" fName={row.original.FNa.substring(0, 1)} clrCode={generateHexDecCode(row.original.studId)} />}
                        </div>
                    );
                },
            },
            {
                id: "FNa",
                Header: this.props.t("translate:FIRST_NAME"),
                accessor: "FNa",
                sortType: "basic",
                Cell: ({ row }) => {
                    return (
                        <div className="stud-grad_list" onClick={()=> goToNextPage(row.original)}>
                            <span className="stud-grad_name">{row.original.FNa}</span>
                        </div>
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
                        <div className="stud-grad_list">
                            <span className="stud-grad_name_unimp">{row.original.LNa}</span>
                            {row.original.isDrop && <span class = "stud-grad_dropped">DROPPED</span>}
                        </div>
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
                        <div className="stud-grad_list">
                            <span className="stud-grad_name_unimp">{row.original.AplnNum}</span>
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
                id: "MoAt",
                Header: this.props.t("translate:LAST_MODIFIED"),
                accessor: (row) => moment(row.MoAt).unix(),
                Cell: ({ row }) => {
                    return (
                        <>{row.original.MoAt ? lmsDateAndTimeFormat(row.original.MoAt) : "-"}</>
                    )
                },
                sortType: "basic"
            },
            {
                id: "mrkGrd",
                Header: ({ row }) => {
                    return (
                        <>
                            {this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf === "POINT" ? <>/{this.props.oAsgnmntDtls.mxMrk}</> : ""}
                            {this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf !== "POINT" ? <>{this.props.oAsgnmntDtls.GrdSysNm}</> : ""}
                        </>
                    );
                },
                accessor: "mrkGrd",
                Cell: ({ row, column, onCellEdit}) => {
                    const onChange = e => {
                        onCellEdit(row.index, column.id);
                        this.setMark(e, row.index);
                    };
                    return (
                        <>
                            {!this.props.location.state?.isDisabledContent ?
                            <div className="edit-marks">
                                <InputBox className="input-table" value={row.original.mrkGrd} onChange={onChange} onBlur={() => this.saveMark(row.index)} defaultDisabled = {row.original.isDrop}/>
                                {!row.original.isDrop && this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf !== "POINT" ? (
                                    <div className="stud-grade_lists">
                                        <SelectControl dropdownTheme="dropdown-round drop-down_round" data={this.props.oAsgnmntDtls.aGrades} onChange={(e) => {onCellEdit(row.index, column.id); this.gradeChange(e, row.index)}}>
                                            <ChevronDown className="svg-icon_small close-icon-network" />
                                        </SelectControl>
                                    </div>
                                ) : (
                                    ""
                                )}
                                {/* {(this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf === "POINT" && this.props.oAsgnmntDtls.mxMrk) && <span className="grad-sub_content">/{this.props.oAsgnmntDtls.mxMrk}</span>} */}
                                {(!row.original.grdSts || (row.original.grdSts && row.original.grdSts !== "GRD")) && (row.original.mrkGrd || row.original.mrkGrd === "0" || row.original.mrkGrd === 0) ? (
                                    <div>
                                        <Button theme="btn-rounded secondary-btn btn-left" clicked={() => {onCellEdit(row.index, column.id); this.postMark(row.index)}} defaultDisabled = {row.original.isDrop}>{this.props.t("translate:POST")}</Button>
                                    </div>
                                ) : (
                                    ""
                                )}
                                {!row.original.isDrop && row.original.grdSts && row.original.grdSts === "GRD" ? (
                                    <div className="post-align_content">
                                        {/* <Edit2 className="svg-icon_small icon-dark icon-space_right" /> */}
                                        <p className="posted-info_label">{this.props.t("translate:POSTED")}</p>
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                            : <>
                             <div className="edit-marks">
                                <InputBox className="input-table" value={row.original.mrkGrd} defaultDisabled = {true}/>
                            </div>
                            </>
                            }
                        </>
                    );
                },
            },
            {
                id: "fdBk",
                Header: this.props.t("translate:FEEDBACK_CAP"),
                accessor: "fdBk",
                sortType: "basic",
                disableSortBy: true,
                Cell: ({ row }) => {
                    return (
                        <>
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
                                {!row.original.isDrop && !row.original.fdBk && !row.original.editFdBk && !row.original.showFdBk && (
                                    !this.props.location.state?.isDisabledContent ?
                                    <div onClick={() => this.editFeedBack(row.index, "show")}>
                                        <div className="message-discussion_icon">
                                            <MessageAdd iconStyle="svg-icon_small icon-dark icon-pointer" />
                                        </div>
                                    </div> : <></>
                                )}
                                {row.original.isDrop && !row.original.fdBk && !row.original.editFdBk && !row.original.showFdBk && (
                                    <div>
                                        <div className="message-discussion_icon">
                                            <MessageHide iconStyle="svg-icon_small icon-dark" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                {row.original.editFdBk && (
                                    <div class="dropdown-menu feedback-content" style={{ display: row.original.editFdBk ? "block" : "none" }}>
                                        <p className="feedback-label">{this.props.t("translate:FEEDBACK_FOR_STUDENT")}</p>
                                        <TextArea className="text-area_table" value={row.original.fdBk} onChange={(e) => this.fdBkChange(e, row.index)} />
                                        <div className="feedback-buttons">
                                            <Button theme="btn-rounded secondary-btn" clicked={() => this.editFeedBack(row.index, "cancel")}>
                                                {this.props.t("translate:CANCEL")}
                                            </Button>
                                            <Button theme="btn-rounded default btn-left" clicked={(e) => this.postFeedBack(row.index)}>
                                                {this.props.t("translate:POST_FEEDBACK")}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {row.original.showFdBk && (
                                    <div class="dropdown-menu feedback-content_edit" style={{ display: row.original.showFdBk ? "block" : "none" }}>
                                        <div className="edit-feedback_dismiss">
                                            <p className="feedback-label_edit">{this.props.t("translate:FEEDBACK_FOR_STUDENT")}</p>
                                            <div onClick={() => this.showFeedBack(row.index, "cancel")}>
                                                <X className="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>

                                        <div className="stud-feedback_edit">
                                            <div className="stud-feedback_info">
                                                {row.original.PhotoImgID && row.original.PhotoImgID.length > 0 ? <img src={"/Image/getImage/" + row.original.PhotoImgID} className="stud-img_list" alt="img" /> : <StudentNameComponent className="student-name_icon" fName={row.original.FNa.substring(0, 1)} clrCode={generateHexDecCode(row.original.studId)} />}
                                                <p className="edit-stud_name">{row.original.studNm}</p>
                                            </div>
                                            {
                                                !row.original.isDrop && !this.props.location.state?.isDisabledContent &&
                                                <Edit onClick={() => this.editFeedBack(row.index, "show", "canclShow")} className="svg-icon_small icon-dark icon-pointer" />
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

    componentWillReceiveProps(NextToProps){
        this.stGrdstate.oAsgnReq = {
            asgnmntId : this.props.oAsgnmntDtls._id,
            InId : this.props.location.state.InId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId,
            grdKey : this.props.actTab
        };
        // set pagination values
        if(this.stGrdstate.pageVals){
            this.stGrdstate.oAsgnReq.pageNo = this.stGrdstate.pageVals.pageNo;
            this.stGrdstate.oAsgnReq.pageSize = this.stGrdstate.pageVals.pageSize;
        }
        if(NextToProps.aGradePages && NextToProps.aGradePages.length){
            this.stGrdstate.aGradePages = NextToProps.aGradePages;
        }
        this.stGrdstate.edtPrvInd = undefined;
        this.setState({...this.state, aStudents : NextToProps.aStudents, aGradePages : this.stGrdstate.aGradePages});
    }

    // Grade change

    gradeChange = (event, index) => {
        const aCopyStuds = [...this.state.aStudents];
        if(this.props.oAsgnmntDtls.aGrades && this.props.oAsgnmntDtls.aGrades.length){
            aCopyStuds[index].grad = '';
            aCopyStuds[index].mrkGrd = ''
            for(let grd = this.props.oAsgnmntDtls.aGrades.length - 1; grd >= 0; grd--){
                if(event.target.value === this.props.oAsgnmntDtls.aGrades[grd].Grade){
                    aCopyStuds[index].grad   = this.props.oAsgnmntDtls.aGrades[grd].Grade;
                    aCopyStuds[index].mrkGrd = this.props.oAsgnmntDtls.aGrades[grd].GradeNm;
                    break;
                }
            }
            this.setState({ ...this.state, aStudents: aCopyStuds });
            this.saveMark(index);
        }
    }

    // Post all grade

    postAllGrade = () => {
        this.stGrdstate.resPst = false;
        if (this.props.oAsgnmntDtls.toPsStuds && this.props.oAsgnmntDtls.toPsStuds.length) {
            const oPstRq = {
                asgnmntId: this.props.oAsgnmntDtls._id,
                toPsStuds: this.props.oAsgnmntDtls.toPsStuds,
                'pstMrk': true
            };
            this.props.updatemultpleStudAsgnmnt(oPstRq, this.stGrdstate.oAsgnReq);
        }
    }

    // Post the mark

    postMark = (index) => {
        // Do not post mark when student is dropped
        if(this.state.aStudents[index].isDrop){
            return;
        }
        if(!this.stGrdstate.resPst && ((this.state.aStudents[index].mark !== null && !isNaN(this.state.aStudents[index].mark)) || this.state.aStudents[index].grad)){
            const oPstRq = {
                _id : this.state.aStudents[index]._id,
                'pstMrk' : true
            };
            this.props.updateStudentAssignment(oPstRq, this.stGrdstate.oAsgnReq, 'studGrad');
        }
    }

    // save mark for student
    saveMark = (index) => {
        this.stGrdstate.resPst = false;
        const oStudMarks = this.state.aStudents[index];
        // Number check for grade config
        if(this.props.oAsgnmntDtls.grdCnf && this.props.oAsgnmntDtls.grdCnf === "GRD"){
            if(oStudMarks.mrkGrd !== ''){
                if(oStudMarks.mrkGrd !== null && !isNaN(oStudMarks.mrkGrd)){
                    // Compares the mark with max mark
                    if(oStudMarks.mrkGrd > this.props.oAsgnmntDtls.mxMrk){
                        messageUtil.showWarning("EXCEEDS_MAX_MARK", true);
                        return;
                    }
                    let mrkTk = (parseFloat(oStudMarks.mrkGrd)*parseFloat(this.props.oAsgnmntDtls.aGradeSystem[0].GrdPercent))/parseFloat(this.props.oAsgnmntDtls.mxMrk);
                    if(this.props.oAsgnmntDtls.aGrades && this.props.oAsgnmntDtls.aGrades.length){
                        let mrkVal = parseFloat(mrkTk);
                        let gradeMat = false;
                        for(let grd = this.props.oAsgnmntDtls.aGrades.length - 1; grd >= 0; grd--){
                            // Exceeds the grade maximum mark
                            if(mrkVal >= this.props.oAsgnmntDtls.aGrades[grd].MinMrk && mrkVal <= this.props.oAsgnmntDtls.aGrades[grd].MaxMrk){
                                gradeMat = true;
                                // let studMrk = oStudMarks.mrkGrd;
                                // oStudMarks.mark = studMrk;
                                oStudMarks.grad = this.props.oAsgnmntDtls.aGrades[grd].Grade;
                                oStudMarks.mrkGrd = this.props.oAsgnmntDtls.aGrades[grd].GradeNm;
                            }
                        }
                        if(!gradeMat) {
                            this.stGrdstate.resPst = true;
                            messageUtil.showWarning("INVALID_GRADE", true);
                            return;
                        }
                    }
                }else{
                    // letters check for grade config
                    if(oStudMarks.mrkGrd && this.props.oAsgnmntDtls.aGrades && this.props.oAsgnmntDtls.aGrades.length){
                        for(let grd = this.props.oAsgnmntDtls.aGrades.length - 1; grd >= 0; grd--){
                            if(oStudMarks.mrkGrd === this.props.oAsgnmntDtls.aGrades[grd].GradeNm){
                                oStudMarks.grad = this.props.oAsgnmntDtls.aGrades[grd].Grade;
                                oStudMarks.mark = '';
                                break;
                            }else {
                                if(grd === 0){
                                    this.stGrdstate.resPst = true;
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
            if(this.props.oAsgnmntDtls.mxMrk !== undefined && this.props.oAsgnmntDtls.mxMrk !== null && !isNaN(this.props.oAsgnmntDtls.mxMrk)){
                let mrkVal = parseFloat(oStudMarks.mrkGrd);
                if(oStudMarks.mrkGrd !== undefined && oStudMarks.mrkGrd !== ''){
                    // Check the mark exceeds the maximum mark
                    if(mrkVal < 0 || mrkVal > this.props.oAsgnmntDtls.mxMrk){
                        this.stGrdstate.resPst = true;
                        let invMsg = this.props.t("translate:INVALID_POINTS")+" 0 - "+this.props.oAsgnmntDtls.mxMrk
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
        const aCopyStuds = [...this.state.aStudents];
        aCopyStuds[index] = oStudMarks;
        this.setState({ ...this.state, aStudents: aCopyStuds });
        const oSaveRq = oStudMarks;
        oSaveRq.savMark = true;
        if(oStudMarks.grdSts === "GRD"){
            oSaveRq.notFinlz = true;
        }
        this.props.updateStudentAssignment(oSaveRq, this.stGrdstate.oAsgnReq, 'studGrad');
    }

    // set the value of mark in state
    setMark = (event, index) => {
        const aCopyStuds = [...this.state.aStudents];
        aCopyStuds[index].mrkGrd = event.target.value;
        this.setState({ ...this.state, aStudents: aCopyStuds });
    }

    // edit feedback

    editFeedBack = (index, actKey, canclShow) => {
        const aCopyStuds = [...this.state.aStudents];
        aCopyStuds[index].showFdBk = false;
        if(canclShow === "canclShow"){
            this.stGrdstate.edtPrvInd = undefined;
        }
        if(actKey === 'show'){
            if(this.stGrdstate.edtPrvInd !== index){
                aCopyStuds[index].editFdBk = true;
                // Close the opened index feedback dropdown
                if(this.stGrdstate.edtPrvInd !== undefined && this.stGrdstate.edtPrvInd !== null && !isNaN(this.stGrdstate.edtPrvInd)){
                    aCopyStuds[this.stGrdstate.edtPrvInd].editFdBk = false;
                    aCopyStuds[this.stGrdstate.edtPrvInd].showFdBk = false;
                }
            }
            this.stGrdstate.edtPrvInd = index;
        }else{
            this.stGrdstate.edtPrvInd = undefined;
            aCopyStuds[index].editFdBk = false;
        }
        this.setState({ ...this.state, aStudents: aCopyStuds });
    }

    // show feedback value

    showFeedBack = (index, actKey) => {
        const aCopyStuds = [...this.state.aStudents];
        aCopyStuds[index].editFdBk = false;
        if(actKey === 'show'){
            if(this.stGrdstate.edtPrvInd !== index){
                aCopyStuds[index].showFdBk = true;
                // Close the opened index feedback dropdown
                if(this.stGrdstate.edtPrvInd !== undefined && this.stGrdstate.edtPrvInd !== null && !isNaN(this.stGrdstate.edtPrvInd)){
                    aCopyStuds[this.stGrdstate.edtPrvInd].editFdBk = false;
                    aCopyStuds[this.stGrdstate.edtPrvInd].showFdBk = false;
                }
            }
            this.stGrdstate.edtPrvInd = index;
        }else{
            this.stGrdstate.edtPrvInd = undefined;
            aCopyStuds[index].showFdBk = false;
        }
        this.setState({ ...this.state, aStudents: aCopyStuds });
    }

    // set feedback value

    fdBkChange = (event, index) => {
        const aCopyStuds = [...this.state.aStudents];
        aCopyStuds[index].fdBk = event.target.value;
        this.setState({ ...this.state, aStudents: aCopyStuds });
    }

    // post the feedback

    postFeedBack = (index) => {
        const oPstRq = {
            _id       : this.state.aStudents[index]._id,
            'pstFdBk' : true,
            fdBk      : this.state.aStudents[index].fdBk
        };
        this.props.updateStudentAssignment(oPstRq, this.stGrdstate.oAsgnReq, 'studGrad');
        this.stGrdstate.edtPrvInd = undefined;
    }

    // callback function called from TablePagination component

    loadPageItems = (pageValues ={}) => {
        //this.stGrdstate.pageVals = pageValues;
        if(this.state.srchstud){
            pageValues.srchTerm = this.state.srchstud;
        }else{
            pageValues.srchTerm = '';
        }
        this.props.gradeListCallback(pageValues);
    }

    // search for student list
   
    searchStudents = (event) => {
        this.setState({...this.state, srchstud : event.target.value }, () => {
            if(event.target.value && event.target.value.length < 3){
                return;
            }else{
                this.stGrdstate.oAsgnReq.srchTerm = this.state.srchstud;
                this.props.getAssgnStuds(this.stGrdstate.oAsgnReq);
            }
        });
     }
    render() {
        this.values = queryString.parse(this.props.location.search);
        return (
            <div>
                <div className="student-grade_container">
                    <div className="student-table_search">
                        {this.props.totStudCount > 0 && 
                            <div class="row m-0">
                                <div class="col-6 p-0">
                                    <div className="cont-search-box">
                                            <SearchBox searchBoxTheme="search-default search-box_default search-outline" placeholder = "Search" value={this.state.srchstud} onChange={(event)=>this.searchStudents(event)}/>
                                    </div>
                                </div>
                                {!this.props.location.state?.isDisabledContent &&
                                <div class="col-6 p-0">
                                    {this.props.oAsgnmntDtls && this.props.oAsgnmntDtls.toPstCnt ? (
                                        <div className="grade-post">
                                            <div onClick={() => this.postAllGrade()}>
                                                <Button theme="btn-rounded secondary-btn">
                                                    <span>{this.props.t("translate:POST_ALL")} {this.props.oAsgnmntDtls.toPstCnt} {this.props.t("translate:POST_ALL_GRADES")}</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : ''}
                                </div>
                                }
                            </div>
                        }
                    </div>
                    {this.state.aStudents && this.state.aStudents.length > 0 ?
                    <div className="table-list_container">
                        <Table data={this.state.aStudents} columns={this.studentTableColumns} defaultSortBy="studNm" disablePagination={true}/>    
                    </div>
                     : <NoRecord img={no_grade_book} imgSize="no-data_img-default" gradAsgnContent={this.props.actTab} />}
                   
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = {
    getAssgnmntDetails,
    getAssgnStuds,
    updateStudentAssignment,
    updatemultpleStudAsgnmnt
};

// To get the reducers values
const mapStateToProps = (state) => ({
    ...state.gradeBookReducer
});

const TabNavigator = (props) => <StudentGradeListComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
