import React, { Component, lazy } from 'react';
import '../../styles/_gradeAssignmentViewStyle.scss';
import { Download, File, Link, ChevronDown, ChevronLeft, ChevronRight, Edit, ArrowLeft } from 'react-feather';
// import user_img from '../../assets/images/user-profile.png';
// import studImg from '../../assets/images/user-profile.png';
// import bookImg from '../../assets/images/bookImg.png';
// import { DownArrow } from '../icons/Icons';
import queryString from 'query-string';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { getStudAsgnmntContentDetails, getStudsForAssignment, updateStudentAssignment, updatemultpleStudAsgnmnt, updateFields } from '../../store/actions/GradeBookActions'
import _ from "lodash";
import messageUtil from '../../utils/message-util';
import { lmsDateAndTimeFormat, lmsNonUTCDateAndTimeFormat} from '../../utils/helper';
import LmsCommonService from '../../service/lms-service';
import { generateHexDecCode } from '../../utils/helper';
import { filterArray } from '../../utils/filter-util';
import GroupsAndStudentView from './GroupsAndStudentView';
import { downloadS3Files } from '../../store/actions/FileUploadAction';

const FullViewModal =  lazy(() =>
import("../modal/FullViewModal")
);
const Button =  lazy(() =>
import("../button/Button")
);
const InputBox =  lazy(() =>
import("../input-box/InputBox")
);
const SelectControl =  lazy(() =>
import("../select-control/SelectControl")
);
const TextArea =  lazy(() =>
import("../text-area/TextArea")
);
const SearchBox =  lazy(() =>
import("../searchbox/Searchbox")
);
const LmsEditorView =  lazy(() =>
import("../lms-editor-view/LmsEditorView")
);
const LmsSelectDropDown =  lazy(() =>
import("../lms-selectdropdown/LmsSelectDropDown")
);
const StudentNameComponent =  lazy(() =>
import("../student-name/StudentName")
);
class GradeAssignmentViewComponent extends Component {
    constructor(props) {
        super(props);
        this.values = {}
        this.state = {
            showStudDtls: false,
            oStuds: {},
            mrkGrd: '',
            fdBk: '',
            aGradSts: [],
            isEdit: false,
            grdStFil: '',
            oStudsCpy: {},
            aGradeFilter: [],
            searchValue: '',
            isRubricsModal:false,
            aSelRatings : [],
            isFrGrChg : false,
            aStsBsdStus : [],
            stsVal : '' // Filter status value
        };
        this.gradState = {
            asgnmntDtls : {},
            studDtls : {},
            onLoad: true,
            showFdBtn: false
        };
    }

    componentDidMount() {

        //get the domain values
        const oDomainCodes = {
            codes: ['GRAD_STATUS'],
        };
        // Set domain code values
        LmsCommonService.getDomainByCode(oDomainCodes, (err, data) => {
            if (data && data.length) {
                for (let cd = data.length - 1; cd >= 0; cd--) {
                    if (data[cd].code === "GRAD_STATUS" && data[cd].ccodes && data[cd].ccodes.length) {
                        let filVal = 'ALL';
                        const oGrpByDomCd = _.groupBy(data[cd].ccodes, 'code');
                        let stsVal = '';
                        if(this.values.actTab === "NG" || this.values.actTab === "UNGRD"){
                            filVal = "UNGRD";
                        }else if(this.values.actTab === "GRD"){
                            filVal = 'GRD';
                        }
                        stsVal = oGrpByDomCd[filVal][0].text;
                        this.setState({ aGradSts: data[cd].ccodes ,grdStFil : filVal, oGrpByDomCd : oGrpByDomCd, stsVal : stsVal});
                        break;
                    }
                }
            }
        });

        let oAsgnEntRq = {
            asCnId: this.values.asCnId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId
        };

        let oStudReq = oAsgnEntRq;
        oStudReq.onLoad = true;
        
        let oReq = oAsgnEntRq;
        oReq.studId = this.values.studId;
        
        this.props.getStudsForAssignment(oStudReq, oReq);

    }

    componentWillReceiveProps() {
        this.gradState.asgnmntDtls = (this.props.studAsgnmntContDetls && this.props.studAsgnmntContDetls.oAsgnmntDtls) ? this.props.studAsgnmntContDetls.oAsgnmntDtls : {};
        this.gradState.studDtls = (this.props.studAsgnmntContDetls && this.props.studAsgnmntContDetls.oStudDetails) ? this.props.studAsgnmntContDetls.oStudDetails : {};
        this.gradState.aRubrics = (this.props.studAsgnmntContDetls && this.props.studAsgnmntContDetls.aRubrics && this.props.studAsgnmntContDetls.aRubrics.length) ? this.props.studAsgnmntContDetls.aRubrics : [];
        if (!_.isEmpty(this.gradState.studDtls)) {
            if (this.gradState.studDtls.fdBk) {
                this.gradState.showFdBtn = true;            // To show button
                this.gradState.studDtls.shwFdBk = true;     // Show the feedback card
            } else {
                this.gradState.showFdBtn = false;           // Hide button
                this.gradState.studDtls.shwFdBk = false;    // Show feedback text area
            }
            // eslint-disable-next-line
            this.state.aSelRatings = [];
            if(this.gradState.studDtls.aRtng && this.gradState.studDtls.aRtng.length){
                this.setState({aSelRatings : this.gradState.studDtls.aRtng});
            }
            this.setState({ 
                mrkGrd: this.gradState.studDtls.mrkGrd, 
                shwFdBk: this.gradState.studDtls.shwFdBk, 
                showFdBtn: this.gradState.showFdBtn 
            });
        }
        if (this.props.oStudDtls && this.props.oStudDtls.studs && this.props.oStudDtls.studs.length > 0) {
            // Filter based on selection
            let aGradeFilter = this.props.oStudDtls.studs;
            if(this.state.isFrGrChg || this.gradState.onLoad){
                this.gradState.onLoad = false;
                let changeSts = undefined;
                if(this.state.isFrGrChg){
                    changeSts = this.state.grdStFil;
                }else{
                    changeSts = this.values.actTab;
                }
                let oStudShwDetls = {};
                aGradeFilter = this.props.oStudDtls.studs.filter((gradeItems) => {
                    if (changeSts === 'GRD') {
                        return gradeItems.isGrded
                    } else if (changeSts === 'UNGRD' || changeSts === 'NG') {
                        return gradeItems.isUnGrded
                    }  else if (changeSts === 'MISS') {
                        return gradeItems.ismised
                    } else {
                        return gradeItems
                    }
                });
                aGradeFilter = _.sortBy(aGradeFilter, 'studNm');
                for (let i = 0; i < aGradeFilter.length; i++) {
                    if (this.values.studId === aGradeFilter[i].studId) {
                        aGradeFilter[i].index = i;
                        oStudShwDetls = aGradeFilter[i];
                        break;
                    }
                }
                if((aGradeFilter && aGradeFilter.length === 0)){
                    this.goToAll();
                }else{
                    this.setState({ 
                        aGradeFilter: aGradeFilter, 
                        aStsBsdStus : aGradeFilter, 
                        oStuds : oStudShwDetls,
                        isFrGrChg : false
                    });
                }
            }
        }
    }

    // go to all filter

    goToAll = () => {
        const eve = {
            target : {
                value : 'ALL'
            }
        }
        this.gradedHandler(eve);
    }

    // Handling grade drop-down values

    gradeChange = (event) => {
        if (this.gradState.asgnmntDtls && this.gradState.asgnmntDtls.aGrades.length) {
            let gradLtr = ''
            for (let grd = this.gradState.asgnmntDtls.aGrades.length - 1; grd >= 0; grd--) {
                if (event.target.value === this.gradState.asgnmntDtls.aGrades[grd].Grade) {
                    gradLtr = this.gradState.asgnmntDtls.aGrades[grd].GradeNm;
                    break;
                }
            }
            this.setState({ ...this.state, mrkGrd: gradLtr }, () => {
                this.saveMark();
            });
            
        }
    }
    // Post all grade

    postAllGrade = () => {

        if (this.props.oStudDtls.toPsStuds && this.props.oStudDtls.toPsStuds.length > 0) {
            const oPstRq = {
                asgnmntId: this.values.asCnId,
                toPsStuds: this.props.oStudDtls.toPsStuds,
                'pstMrk': true,
                actTab : this.values.actTab
            };

            let oStudAsgRq = {
                asCnId: this.values.asCnId,
                PrID : this.props.location.state.PrID,
                CrID : this.props.location.state.CrID,
                AcYr : this.props.location.state.AcYr,
                DeptID : this.props.location.state.DeptID,
                SemID : this.props.location.state.SemID,
                SecID : this.props.location.state.SecID,
                subId : this.props.location.state.subId
            };
    
            let oStudReq = oStudAsgRq;
            oStudReq.stAsvw = true;
            
            let ostAsRq = oStudAsgRq;
            ostAsRq.studId = this.values.studId;

            this.props.updatemultpleStudAsgnmnt(oPstRq, oStudReq, ostAsRq);
        }
    }

    // save mark points or letter

    saveMark = () => {
        this.gradState.resPst = false;
        let grad = '';
        let mrkGrd = '';
        let mark = '';
        // Number check for grade config
        if (this.gradState.asgnmntDtls && this.gradState.asgnmntDtls.asgmnt.grdCnf && this.gradState.asgnmntDtls.asgmnt.grdCnf === "GRD") {
            if (this.state.mrkGrd !== '') {
                if (this.state.mrkGrd !== null && !isNaN(this.state.mrkGrd)) {
                    // Compares the mark with max mark
                    if(this.state.mrkGrd > this.gradState.asgnmntDtls.asgmnt.mxMrk){
                        messageUtil.showWarning("EXCEEDS_MAX_MARK", true);
                        return;
                    }
                    if (this.gradState.asgnmntDtls.aGrades && this.gradState.asgnmntDtls.aGrades.length) {
                        let mrkTk = (parseFloat(this.state.mrkGrd)*parseFloat(this.gradState.asgnmntDtls.aGradeSystem[0].GrdPercent))/parseFloat(this.gradState.asgnmntDtls.asgmnt.mxMrk);
                        let mrkVal = parseFloat(mrkTk);
                        let gradeMat = false;
                        for (let grd = this.gradState.asgnmntDtls.aGrades.length - 1; grd >= 0; grd--) {
                            // Exceeds the grade maximum mark
                            if (mrkVal >= this.gradState.asgnmntDtls.aGrades[grd].MinMrk && mrkVal <= this.gradState.asgnmntDtls.aGrades[grd].MaxMrk) {
                                gradeMat = true;

                                grad = this.gradState.asgnmntDtls.aGrades[grd].Grade;
                                mrkGrd = this.gradState.asgnmntDtls.aGrades[grd].GradeNm;
                            }
                        }
                        if (!gradeMat) {
                            this.gradState.resPst = true;
                            messageUtil.showWarning("INVALID_GRADE", true);
                            return;
                        }
                    }
                } else {
                    // letters check for grade config
                    if (this.state.mrkGrd && this.gradState.asgnmntDtls.aGrades && this.gradState.asgnmntDtls.aGrades.length) {
                        for (let grd = this.gradState.asgnmntDtls.aGrades.length - 1; grd >= 0; grd--) {
                            if (this.state.mrkGrd === this.gradState.asgnmntDtls.aGrades[grd].GradeNm) {
                                grad = this.gradState.asgnmntDtls.aGrades[grd].Grade;
                                break;
                            } else {
                                if (grd === 0) {
                                    this.gradState.resPst = true;
                                    messageUtil.showWarning("INVALID_GRADE", true);
                                    return;
                                }
                            }
                        }
                    }
                }
            } else {
                grad = '';
                mrkGrd = ''
            }
        } else {
            // Marks entered within max range
            if (this.gradState.asgnmntDtls.asgmnt.mxMrk !== undefined && this.gradState.asgnmntDtls.asgmnt.mxMrk !== null && !isNaN(this.gradState.asgnmntDtls.asgmnt.mxMrk)) {
                let mrkVal = parseFloat(this.state.mrkGrd);
                if (this.state.mrkGrd !== undefined && this.state.mrkGrd !== '') {
                    // Check the mark exceeds the maximum mark
                    if (mrkVal < 0 || mrkVal > this.gradState.asgnmntDtls.asgmnt.mxMrk) {
                        this.gradState.resPst = true;
                        let invMsg = this.props.t("translate:INVALID_POINTS") + " 0 - " + this.gradState.asgnmntDtls.asgmnt.mxMrk
                        messageUtil.showWarning(invMsg, true);
                        return;
                    } else {
                        mark = this.state.mrkGrd;
                    }
                } else {
                    mark = this.state.mrkGrd;
                }
            }
        }
        this.setState({ mrkGrd : mrkGrd, grad : (grad ? grad : ''), mark : (((mark !== null && !isNaN(mark)) || mark === '0' || mark === 0) ? mark : '')});
        let oSaveReq = {
            savMark: true,
            _id: this.state.oStuds._id
        }
        // When re-enter the grade or mark need to unfinalize
        if (this.gradState.studDtls.grdSts === "GRD") {
            oSaveReq.notFinlz = true;
        }
        if (grad) {
            oSaveReq.grad = grad;
        } else {
            oSaveReq.grad = '';
        }
        if ((mark !== null && !isNaN(mark)) || mark === '0' || mark === 0) {
            oSaveReq.mark = mark;
        } else {
            oSaveReq.mark = '';
        }

        let oStudAsgRq = {
            asCnId: this.values.asCnId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId
        };

        let oStdsReq = oStudAsgRq;
        oStdsReq.stAsvw = true;
        
        let ostAsRq = oStudAsgRq;
        ostAsRq.studId = this.values.studId;
        this.props.updateStudentAssignment(oSaveReq, oStdsReq, ostAsRq);
    }

    // set the value of mark in state

    setMark = (event) => {
        this.setState({ ...this.state, mrkGrd: event.target.value });
    }

    // post only one student mark

    postMark = () => {
        if(this.gradState.studDtls && this.gradState.studDtls.isDrop){
            return;
        }
        if (!this.gradState.resPst) {
            let oPstRq = {
                _id: this.state.oStuds._id,
                'pstMrk': true
            };

            let oStudAsgRq = {
                asCnId: this.values.asCnId,
                PrID : this.props.location.state.PrID,
                CrID : this.props.location.state.CrID,
                AcYr : this.props.location.state.AcYr,
                DeptID : this.props.location.state.DeptID,
                SemID : this.props.location.state.SemID,
                SecID : this.props.location.state.SecID,
                subId : this.props.location.state.subId
            };
    
            let oStudReq = oStudAsgRq;
            oStudReq.stAsvw = true;
            
            let ostAsRq = oStudAsgRq;
            ostAsRq.studId = this.values.studId;
            
            this.props.updateStudentAssignment(oPstRq, oStudReq, ostAsRq);
        }
    }
    //  get details for student assignment
    getStudAssignDtls = (studId) => {
        let oReq = {
            asCnId: this.values.asCnId,
            studId: studId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId
        }
        this.props.getStudAsgnmntContentDetails(oReq);
    }

    // go to next student data for assignment details 
    goToNextStud = () => {
        if (this.state.oStuds.index !== null && !isNaN(this.state.oStuds.index)) {
            let nextIndex = this.state.oStuds.index + 1;
            if (this.state.aGradeFilter[nextIndex]) {
                this.state.aGradeFilter[nextIndex].index = nextIndex;
                this.gradState.onLoad = false;
                this.setState({ oStuds: this.state.aGradeFilter[nextIndex], fdBk : '' });
                this.props.history.push({ state: this.props.location.state, search: `?asCnId=${this.values.asCnId}&studId=${this.state.aGradeFilter[nextIndex].studId}&isStud=${true}&actTab=${this.state.grdStFil}`})
                this.getStudAssignDtls(this.state.aGradeFilter[nextIndex].studId);
            }
        }

    }
    // go to previce student data for assignment details
    goToBackStud = () => {
        if (this.state.oStuds.index !== null && !isNaN(this.state.oStuds.index)) {
            let nextIndex = this.state.oStuds.index - 1;
            if (this.state.aGradeFilter[nextIndex]) {
                this.state.aGradeFilter[nextIndex].index = nextIndex;
                this.gradState.onLoad = false;
                this.setState({ oStuds: this.state.aGradeFilter[nextIndex], fdBk : '' });
                this.props.history.push({ state: this.props.location.state, search: `?asCnId=${this.values.asCnId}&studId=${this.state.aGradeFilter[nextIndex].studId}&isStud=${true}&actTab=${this.state.grdStFil}` })
                this.getStudAssignDtls(this.state.aGradeFilter[nextIndex].studId);
            }
        }
    }
    // show all student name and status
    showStud = (studsDtls, index) => {
        studsDtls.index = index;
        this.gradState.onLoad = false;
        this.props.history.push({ state: this.props.location.state, search: `?asCnId=${this.values.asCnId}&studId=${studsDtls.studId}&isStud=${true}&actTab=${this.state.grdStFil}` })
        this.setState({ oStuds: studsDtls, showStudDtls: !this.state.showStudDtls});
        this.getStudAssignDtls(studsDtls.studId);
    }

    // feedback function handler

    feedBackHandler = (event) => {
        if (event.target.value) {
            this.gradState.showFdBtn = true;
        } else {
            this.gradState.showFdBtn = false;
        }
        this.setState({ fdBk: event.target.value, showFdBtn: this.gradState.showFdBtn });
    }

    // post feedback
    postFeedBack = () => {
        let oPstRq = {
            _id: this.state.oStuds._id,
            'pstFdBk': true,
            fdBk: this.state.fdBk
        };
        
        let oStudAsgRq = {
            asCnId: this.values.asCnId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId
        };

        let oStudReq = oStudAsgRq;
        oStudReq.stAsvw = true;
        
        let ostAsRq = oStudAsgRq;
        ostAsRq.studId = this.values.studId;

        this.props.updateStudentAssignment(oPstRq, oStudReq, ostAsRq);
    }

    // edit feedback
    editFeedBack = (actKey) => {
        let fdBk = '';
        // Edit the feedback content
        if (actKey === 'show') {
            fdBk = this.gradState.studDtls.fdBk;
            this.gradState.studDtls.shwFdBk = false;
            this.gradState.showFdBtn = true;
        } else {
            // cancel the feedback
            if (this.gradState.studDtls.fdBk) {
                this.gradState.studDtls.shwFdBk = true;
            } else {
                fdBk = '';
                this.gradState.studDtls.shwFdBk = false;
                this.gradState.showFdBtn = false;
            }
        }
        this.setState({ shwFdBk: this.gradState.studDtls.shwFdBk, fdBk: fdBk, showFdBtn: this.gradState.showFdBtn });
    }
    gradedHandler = (event) => {
        this.gradState.onLoad = false;
        let aGradeFilter = this.props.oStudDtlsCpy.studs.filter((gradeItems) => {
            if (event.target.value === 'GRD') {
                return gradeItems.isGrded
            }else if (event.target.value === 'UNGRD') {
                return gradeItems.isUnGrded
            } else if (event.target.value === 'MISS') {
                return gradeItems.ismised
            } else {
                return gradeItems
            }
        });
        // show information if data is not exists for the filter
        if(aGradeFilter && aGradeFilter.length){
            aGradeFilter = _.sortBy(aGradeFilter, 'studNm');
            this.props.history.push({ state: this.props.location.state, search: `?asCnId=${this.values.asCnId}&studId=${aGradeFilter[0].studId}&isStud=${true}&actTab=${event.target.value}` })
            let stsVal = undefined;
            if(this.state.oGrpByDomCd[event.target.value]){
                stsVal = this.state.oGrpByDomCd[event.target.value][0].text;
            }
            this.setState({ grdStFil: event.target.value, oStuds: aGradeFilter[0], aGradeFilter: aGradeFilter, fdBk : '' , isFrGrChg : true, stsVal : stsVal, aStsBsdStus : aGradeFilter});
            // aGradeFilter[nextIndex].index = nextIndex;
            this.getStudAssignDtls(aGradeFilter[0].studId);
        }else{
            if (event.target.value === 'GRD') {
                messageUtil.showInfo("NO_GRADED_STUD", true);
            } else if (event.target.value === 'MISS') {
                messageUtil.showInfo("NO_MISSED_STUD", true);
            } else if (event.target.value === 'UNGRD') {
                messageUtil.showInfo("NO_UNGRADED_STUD", true);
            }

        }
    }

    searchHandler = (event) => {
        this.setState({ searchValue: event.target.value });
        if (this.state.searchValue) {
            this.setState({ aGradeFilter: filterArray(event.target.value, this.state.aStsBsdStus, ['studNm']) });
        } else {
            this.setState({ aGradeFilter: this.state.aStsBsdStus });
        }
    }

    // Callback from student grade using rubrics from rubrics view
    gradeCallback = (oSndData) => {
        this.setState({ isRubricsModal: false });
        let ostAsRq = {
            asCnId: this.values.asCnId,
            studId: this.values.studId,
            PrID : this.props.location.state.PrID,
            CrID : this.props.location.state.CrID,
            AcYr : this.props.location.state.AcYr,
            DeptID : this.props.location.state.DeptID,
            SemID : this.props.location.state.SemID,
            SecID : this.props.location.state.SecID,
            subId : this.props.location.state.subId
        };
        this.props.getStudAsgnmntContentDetails(ostAsRq);    
    }

    componentDidUpdate(prevProps){
        if(prevProps?.location?.state !== this.props?.location?.state || prevProps?.location?.search !== this.props?.location?.search ){
            this.getStudAssignDtls(this.values?.studId)
        }
        
    }

    render() {
        this.values = queryString.parse(this.props.location.search);
        const { asgnmntDtls, studDtls } = this.gradState;
        return (
            <div>
                <div className="grade-assignment_container">
                    <div className="student-assignment_heading">
                        <div className="student-assign_content">
                            {this.values.isStud ?
                                <ArrowLeft className="svg-icon_default icon-default right-icon icon-pointer" onClick={() => this.props.history.push({ pathname: '/home-page/assgnmnt-grad', state: this.props.location.state, search: `?id=${this.values.asCnId}` })} />
                                :<ArrowLeft className="svg-icon_default icon-default right-icon icon-pointer" onClick={() => this.props.history.push({ pathname: '/home-page/student-grade', state: this.props.location.state,search: `?stuId=${this.values.studId}` })}/>
                            }
                            <div className="student-assign_label">
                                {!_.isEmpty(asgnmntDtls) && asgnmntDtls.title && <h6>{asgnmntDtls.title}</h6>}
                                <p>{`${asgnmntDtls.asgnCatNam} | ${this.props.oStudDtls.totGrdCnt} ${this.props.t('translate:OF')} ${this.props.oStudDtls.totStud} ${this.props.t('translate:GRADED')}`}</p>
                            </div>
                        </div>
                        <div className="manual-setting">
                            {this.props.oStudDtls && this.props.oStudDtls.toPsStuds && this.props.oStudDtls.toPsStuds.length > 0 && <Button theme="btn-rounded secondary-btn " clicked={() => this.postAllGrade()}> {`Post all ${this.props.oStudDtls.toPstCnt} grades`}</Button>}
                            {/* <i class="header-options">
                                <MoreVertical className="svg-icon_small icon-dark" />
                            </i> */}
                        </div>
                    </div>
                    <div className="grade-assignment_content">
                        <div className="row m-0">
                            <div className="col-8 p-0">
                                {!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) ?
                                    <div className="grade-assignment_lists" id="scroll-style">
                                        <div className="grade-assignment_subheader">
                                            {/* {!_.isEmpty(asgnmntDtls) && asgnmntDtls.title && <p className="grade-assignment_head">{asgnmntDtls.title}</p>} */}
                                            {!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && !_.isEmpty(studDtls.sAsgmt.text) && studDtls.sAsgmt.text.html && <p className="grade-assignment_cont">
                                                <LmsEditorView contentData={studDtls.sAsgmt.text.html} />
                                            </p>}

                                        </div>

                                        {!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && !_.isEmpty(studDtls.sAsgmt.file) && studDtls.sAsgmt.isImg && studDtls.sAsgmt.file.url &&

                                            <div className="grade-submission_image">
                                                <img src={studDtls.sAsgmt.file.url} className="assignment-subject_img" alt="img" />
                                                <div className="assignment-img_download">
                                                    <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: studDtls.sAsgmt.file.name , url: studDtls.sAsgmt.file.url})}}>
                                                        <Download className="svg-icon_small icon-primary" />
                                                    </span>
                                                </div>
                                            </div>
                                        }
                                        <div className={!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && 
                                            studDtls.sAsgmt.imgExt && !studDtls.sAsgmt.isImg ? "assignment-files_container" : ''}>
                                            {!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && studDtls.sAsgmt.imgExt  && !studDtls.sAsgmt.isImg && 
                                                <div className="assignment-cont_files">
                                                    <div className="assignment-cont_view">
                                                        <div className="row m-0">
                                                            <div className="col-auto p-0">
                                                                <div className="file-upload_icons">
                                                                    <File className="svg-icon_small icon-default" />
                                                                </div>
                                                            </div>
                                                            <div className="col-11 p-0">
                                                                <p className="assignment-cont_name">
                                                                    <span onClick={() => {downloadS3Files({name: studDtls.sAsgmt.file.name , url: studDtls.sAsgmt.file.url, mode: 'preview'})}}>
                                                                    {studDtls.sAsgmt.file.name}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="col p-0">
                                                                <div className="submission-files_download">
                                                                    <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: studDtls.sAsgmt.file.name , url: studDtls.sAsgmt.file.url})}}>
                                                                        <Download className="svg-icon_small icon-primary" />
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                        {!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && studDtls.sAsgmt.url &&
                                            <div className={!_.isEmpty(studDtls) && !_.isEmpty(studDtls.sAsgmt) && studDtls.sAsgmt.url ? "assignment-submission_url" : ''} >
                                                <div className="assignment-url_name">
                                                    <div className="row m-0">
                                                        <div className="col-auto p-0">
                                                            <div className="link-download_icon">
                                                                <Link className="svg-icon_small icon-default" />
                                                            </div>

                                                        </div>
                                                        <div className="col-11 p-0">
                                                            <a target='_blank' href={studDtls.sAsgmt.url}>
                                                                <p className="link-url_label">
                                                                    <span>{studDtls.sAsgmt.url}</span>
                                                                </p>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div> : <div className="empty-stud_assignment">{this.props.t("translate:NO_Stud_ASNMT_FOUND")}</div>}
                            </div>
                            {!this.values?.isGrp &&
                            <div className="col-4 p-0">
                                <div className="student-list_dropdown">
                                    <ChevronLeft className="svg-icon_small icon-default icon-pointer" onClick={() => this.goToBackStud()} />
                                    <div className="student-name_lists" onClick={() => this.setState({ showStudDtls: !this.state.showStudDtls })}>
                                        {this.state.oStuds && this.state.oStuds.PhotoImgID && this.state.oStuds.PhotoImgID.length > 0 ?
                                            <img src={'/Image/getImage/' + this.state.oStuds.PhotoImgID} className="stud-img_list" alt="img" /> : this.state.oStuds.studNm && <StudentNameComponent className="student-name_icon" fName={this.state.oStuds.studNm.substring(0, 1)} clrCode={generateHexDecCode(this.state.oStuds.studId)} />
                                        }
                                        {this.state.oStuds && this.state.oStuds.studNmRlNo && <p className="student-names_list" >{this.state.oStuds.studNmRlNo}</p>}
                                        <ChevronDown className="svg-icon_small icon-default icon-pointer" />
                                    </div>
                                    <ChevronRight className="svg-icon_small icon-default icon-pointer" onClick={() => this.goToNextStud()} />
                                </div>
                                {
                                    (!this.state.showStudDtls && this.state.grdStFil && this.state.grdStFil!== 'ALL') &&
                                    <div className="show-filter_label">
                                        <span>
                                            <span>Showing only {this.state.stsVal && <span>{this.state.stsVal}</span>}</span>
                                        </span>
                                        <svg width="12" height="12" viewBox="0 0 12 12" onClick={() => this.goToAll()} fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 3L3 9" stroke="#091E42" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M3 3L9 9" stroke="#091E42" stroke-linecap="round" stroke-linejoin="round"/>
                                        </svg>
                                    </div>
                                }
                                
                                {/* .................................student-list design................ */}
                                {this.state.showStudDtls &&
                                    <div className="overall-stud_list">
                                        <div className="stud-search_list">
                                            <SearchBox searchBoxTheme="search-default search-box_default search-outline" placeholder="search" value={this.state.searchValue} onChange={(event) => this.searchHandler(event)} />
                                            <div className="filter-stud_list">
                                                {
                                                    (this.state.aGradeFilter && this.state.aGradeFilter.length > 0) ? 
                                                    <p className="total-stud_label">Total {this.state.aGradeFilter.length} students</p>
                                                    : <p> </p>
                                                }
                                                <LmsSelectDropDown className='dropdown-transparent drop-down_arrow' value={this.state.grdStFil} defaultDisabled={false} dropDown={this.state.aGradSts} keyTag="code" nameTag="text" onChange={(event) => this.gradedHandler(event)} />
                                                {/* <SelectControl dropdownTheme="dropdown-transparent drop-down_arrow " >
                                                    <DownArrow iconStyle="svg-icon_small close-icon-network" />
                                                </SelectControl> */}
                                            </div>
                                        </div>

                                        {this.state.aGradeFilter && this.state.aGradeFilter.length > 0 && this.state.aGradeFilter.map((studsItems, studsIndex) => {
                                            return (
                                                <div>
                                                    <div className="stud-grade_list">
                                                        <div className="stud-list_grade">
                                                            <div className="stud-profile_list" onClick={() => this.showStud(studsItems, studsIndex)}>
                                                                {studsItems.PhotoImgID && studsItems.PhotoImgID.length > 0 ?
                                                                    <img src={'/Image/getImage/' + studsItems.PhotoImgID} className="stud-img_list" alt="img" /> : studsItems.studNm && <StudentNameComponent className="student-name_icon" fName={studsItems.studNm.substring(0, 1)} clrCode={generateHexDecCode(studsItems.studId)} />
                                                                }
                                                                {studsItems.studNm && <p className="stud-names_label" >{studsItems.studNm}</p>}
                                                            </div>
                                                            { (studsItems.isGrded) ? 
                                                                <p className="stud-grade_label">{this.props.t('translate:GRADED')}</p>
                                                                : studsItems.ismised ? 
                                                                <p className="stud-missed_label">{this.props.t('translate:MISSED_GRD_VIEW')}</p> : 
                                                                <p className="stud-upgrade_label">{this.props.t('translate:UNGRADED')}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                    </div>
                                }
                                {/* ............................................... */}
                                {
                                    !this.state.showStudDtls && this.gradState.studDtls && this.gradState.studDtls.isDrop && 
                                    <div className="cont-drop_info">
                                        <div className="complete-download_icon">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12ZM11 8C11 7.44772 11.4477 7 12 7H12.01C12.5623 7 13.01 7.44772 13.01 8C13.01 8.55228 12.5623 9 12.01 9H12C11.4477 9 11 8.55228 11 8ZM12 11C12.5523 11 13 11.4477 13 12V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V12C11 11.4477 11.4477 11 12 11Z" fill="#0D9BE1"/>
                                        </svg>
                                        </div>
                                        <div className="drop-info_cont">
                                            {this.props.t('translate:DROPPED_STUDENT_FEEDBACK')}
                                        </div>
                                    </div>
                                }
                                
                                {!this.state.showStudDtls &&
                                !this.props.location.state?.isDisabledContent ?
                                    <div className="assignment-submission_details">
                                        {this.gradState.studDtls && this.gradState.studDtls.aSubDt ? (
                                            <p className="submit-date_label">
                                                {this.props.t('translate:SUBMITTED_ON')}: <span className="date-view_label">{lmsNonUTCDateAndTimeFormat(this.gradState.studDtls.aSubDt)}</span>
                                                {this.gradState.studDtls.isLateSub && <span className="late-submission_label">Late</span>}
                                            </p>
                                        ) : ''}
                                        {/* <p className="grade-mark_label">To pass: <span className="mark-view_label">85 or higher</span></p> */}
                                        <div className="grade-assign_view">
                                            <p className="assign-grade_value">{this.props.t('translate:GRADE_CAP')}</p>
                                            <InputBox className="input-table" value={this.state.mrkGrd} onChange={(event) => this.setMark(event)} defaultDisabled = {this.gradState.studDtls.isDrop} onBlur={() => this.saveMark()} />
                                            {(this.gradState.studDtls && !this.gradState.studDtls.isDrop && !_.isEmpty(asgnmntDtls) && !_.isEmpty(asgnmntDtls.asgmnt) && asgnmntDtls.asgmnt.grdCnf && asgnmntDtls.asgmnt.grdCnf === "GRD") ? (
                                                <div className="stud-grade_lists">
                                                    <SelectControl dropdownTheme="dropdown-round drop-down_round" data={asgnmntDtls.aGrades} onChange={(event) => this.gradeChange(event)}>
                                                        <ChevronDown className="svg-icon_small close-icon-network" />
                                                    </SelectControl>
                                                </div>
                                            ) :!_.isEmpty(asgnmntDtls) && !_.isEmpty(asgnmntDtls.asgmnt)  && <p className="grade-max_mark">/ {asgnmntDtls.asgmnt.mxMrk}</p>}
                                            {(this.gradState.studDtls && (!this.gradState.studDtls.grdSts || (this.gradState.studDtls.grdSts && this.gradState.studDtls.grdSts !== "GRD"))) && (this.gradState.studDtls.mrkGrd || this.gradState.studDtls.mrkGrd === '0' || this.gradState.studDtls.mrkGrd === 0) ? (
                                                <Button theme="btn-rounded secondary-btn btn-left" clicked={() => this.postMark()} defaultDisabled = {this.gradState.studDtls.isDrop}>
                                                    {this.props.t("translate:POST")}
                                                </Button>
                                            ) : ''}
                                            {this.gradState.studDtls && this.gradState.studDtls.grdSts && this.gradState.studDtls.grdSts === "GRD" && !this.gradState.studDtls.isDrop ? (
                                                <div className="post-align_content">
                                                    {/* <Edit2 className="svg-icon_small icon-dark icon-space_right" /> */}
                                                    <p className="posted-info_label">{this.props.t("translate:POSTED")}</p>
                                                </div>
                                            ) : ''}
                                        </div>
                                         
                                         
                                        {/* ............................. rubrics view design....................... */}
                                        {
                                            this.gradState.aRubrics && this.gradState.aRubrics.length > 0 &&
                                            <div>
                                                {
                                                    this.gradState.studDtls && !this.gradState.studDtls.isDrop && 
                                                    <div className="rubrics-model_viewer">
                                                        <p className="rubrics-model_name">{this.props.t("translate:RUBRIC")}</p>
                                                        <Button theme="btn-rounded secondary-btn btn-right button-overflow_text" clicked={()=>this.setState({isRubricsModal:true})}> {this.gradState.aRubrics[0].title}</Button>
                                                    </div>
                                                }
                                                {
                                                    this.state.aSelRatings && this.state.aSelRatings.length > 0 ?
                                                    (
                                                        this.state.aSelRatings.map((oSelRating) => [
                                                            <div className="rubrics-list">
                                                                <div className="rubrics-modal_list">
                                                                    <div className="rubrics-list_point">
                                                                        <p className="rubrics-name_view">{oSelRating.crtNm}</p>
                                                                        <p className="rubrics-name_point">{oSelRating.rtGvn}/{oSelRating.maxPnt}</p>
                                                                    </div>
                                                                    <p className="rubrics-exemplary">{oSelRating.rtNm}</p>
                                                                    <p className="rubrics-exemplary_content">{oSelRating.rtDes}</p>
                                                                </div>
                                                            </div>
                                                        ])
                                                    ) : ''
                                                }
                                            </div>
                                        }


{/* ................................................................................... */}



                                        {(this.gradState.studDtls && !this.gradState.studDtls.shwFdBk) &&
                                            <div className="submission-comments_cont">
                                                <p className="submission-comments_label">{this.props.t('translate:FEEDBACK_FOR_STUDENT')}</p>
                                                <TextArea className="text-area_default " placeholder="Add feedback" value={this.state.fdBk} defaultDisabled = {this.gradState.studDtls.isDrop} onChange={(event) => this.feedBackHandler(event)} />
                                                {this.gradState.showFdBtn && this.gradState.studDtls && !this.gradState.studDtls.isDrop &&
                                                    <div className="submission-comments_btn">
                                                        <Button theme="btn-rounded secondary-btn" clicked={() => this.editFeedBack('cancel')}>{this.props.t('translate:CANCEL')}</Button>
                                                        <Button theme="btn-rounded default btn-left" clicked={() => this.postFeedBack()}>{this.props.t('translate:POST_FEEDBACK')}</Button>
                                                    </div>
                                                }
                                            </div>}
                                        {this.gradState.studDtls && this.gradState.studDtls.shwFdBk &&
                                            <div className="stud-feedback_container">
                                                <p className="submission-comments_label">{this.props.t('translate:FEEDBACK_FOR_STUDENT')}</p>

                                                <div className="stud-feedback_edit">

                                                    <div className="stud-feedback_info">
                                                        {this.state.oStuds && this.state.oStuds.PhotoImgID && this.state.oStuds.PhotoImgID.length > 0 ?
                                                            <img src={'/Image/getImage/' + this.state.oStuds.PhotoImgID} className="edits-img_feedback"alt="img" /> : this.state.oStuds.studNm && <StudentNameComponent className="student-name_icon" fName={this.state.oStuds.studNm.substring(0, 1)} clrCode={generateHexDecCode(this.state.oStuds.studId)} />
                                                        }
                                                        {this.state.oStuds && this.state.oStuds.studNmRlNo && <p className="edit-stud_name">{this.state.oStuds.studNmRlNo}</p>}
                                                    </div>
                                                    {
                                                        !this.gradState.studDtls.isDrop && 
                                                        <Edit className="svg-icon_extra-small icon-dark icon-pointer" onClick={() => this.editFeedBack('show')} />
                                                    }
                                                </div>
                                                {studDtls && studDtls.fdBk && <p className="edit-info_label">{studDtls.fdBk}</p>}
                                                <p className="edit-info_date">{studDtls.fdBkOn ? lmsDateAndTimeFormat(studDtls.fdBkOn) : ''}</p>
                                            </div>}
                                    </div>
                                    : 
                                    <div className="assignment-submission_details">
                                    <div className="grade-assign_view">
                                    <p className="assign-grade_value">{this.props.t('translate:GRADE_CAP')}</p>
                                    <InputBox className="input-table" value={this.state.mrkGrd} defaultDisabled = {true} />
                                    </div>
                                    {this.gradState.studDtls && this.gradState.studDtls.shwFdBk &&
                                            <div className="stud-feedback_container">
                                                <p className="submission-comments_label">{this.props.t('translate:FEEDBACK_FOR_STUDENT')}</p>

                                                <div className="stud-feedback_edit">

                                                    <div className="stud-feedback_info">
                                                        {this.state.oStuds && this.state.oStuds.PhotoImgID && this.state.oStuds.PhotoImgID.length > 0 ?
                                                            <img src={'/Image/getImage/' + this.state.oStuds.PhotoImgID} className="edits-img_feedback"alt="img" /> : this.state.oStuds.studNm && <StudentNameComponent className="student-name_icon" fName={this.state.oStuds.studNm.substring(0, 1)} clrCode={generateHexDecCode(this.state.oStuds.studId)} />
                                                        }
                                                        {this.state.oStuds && this.state.oStuds.studNmRlNo && <p className="edit-stud_name">{this.state.oStuds.studNmRlNo}</p>}
                                                    </div>
                                                    
                                                </div>
                                                {studDtls && studDtls.fdBk && <p className="edit-info_label">{studDtls.fdBk}</p>}
                                                <p className="edit-info_date">{studDtls.fdBkOn ? lmsDateAndTimeFormat(studDtls.fdBkOn) : ''}</p>
                                            </div>}
                                    </div>
                                }
                            </div>
                            }
                            {this.values?.grpId && this.values?.isGrp &&
                           <GroupsAndStudentView groupId={this.values?.grpId} contentId={this.values?.asCnId} aGradSts={this.state?.aGradSts} studDtls={this.gradState.studDtls} />
                            }

                        </div>
                    </div>
                </div>
                {this.state.isRubricsModal && <FullViewModal open={this.state.isRubricsModal} gradeAsgnCallback = {this.gradeCallback} aSelRatings = {this.state.aSelRatings} shwRat = {(this.state.aSelRatings && this.state.aSelRatings.length) ? true : false}  onClose={()=>this.setState({isRubricsModal:false})} rubrcId = {this.gradState.aRubrics[0]._id} asCnId = {this.values.asCnId} studId = {this.values.studId} rubTitle = {this.gradState.aRubrics[0].title} asgnmntDtls = {this.gradState.asgnmntDtls} isFrmRub = {true} center={true} isRubrics={true}/>}

            </div>
        );
    }
}



const mapStateToProps = (state) => ({
    ...state.gradeBookReducer
})
const mapDispatchToProps = {
    getStudAsgnmntContentDetails,
    getStudsForAssignment,
    updateStudentAssignment,
    updatemultpleStudAsgnmnt,
    updateFields
}
const TabNavigator = (props) => <GradeAssignmentViewComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));
