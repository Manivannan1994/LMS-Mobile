import React, { Component, lazy } from 'react';
import '../../styles/_assignmentSubmissionStyle.scss';
import { Award, Check, CheckCircle, Circle, File, FileText, Link, MinusCircle,Upload,ArrowLeft} from 'react-feather';
import '../../styles/_commonLmsStyle.scss';
import HTTPService from '../../utils/http-util';
import messageUtil from '../../utils/message-util';
import UserSession from '../../utils/UserSession';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { downloadS3Files, initializeFileUpload, removeImg } from '../../store/actions/FileUploadAction';
import { isValidURL, getHoursBetweenDates, getDaysCountBetween } from "../../utils/helper";
import _ from 'lodash';
import queryString from 'query-string';
import StudentNameComponent from '../student-name/StudentName';
import { lmsDateAndTimeFormat } from '../../utils/helper';
import { generateHexDecCode} from '../../utils/helper';
import moment from 'moment';
import AnalyticsService from '../../service/analytics-service';
import FileLoader from '../file-loader/FileLoader';
const ModelBarComponent = lazy(() => import('../modelbar/Modelbar'));
const Button = lazy(()=>
import('../button/Button')
);
const LmsEditor = lazy(()=>
import('../lms-editor/LmsEditor')
);
const LmsEditorView = lazy(()=>
import('../lms-editor-view/LmsEditorView')
);
const SubmissionViewComponent = lazy(()=>
import('../submission-view/SubmissionView')
);
const LmsFileUploader = lazy(()=>
import('../lms-fileuploader/LmsFileUploader')
);
const FileUrl = lazy(()=>
import('../fileurl/FileUrl')
);
const AnalyticsWrapper = lazy(() =>
    import('../analytics-wrapper/AnalyticsWrapper')
);
const FullViewModal =  lazy(() =>
    import("../modal/FullViewModal")
);
const StudentArchiveGradeWrapper = lazy(() =>
   import('../stud-arch-grade-wrapper/StudentArchiveGradeWrapper')
);
class AssignmentSubmissionComponent extends Component {
    constructor(props) {
        super(props);
        this.values = undefined;
        this.studAssignData = {};
        this.oPlagrismTool = {};
        this.aPlagrismlaunchToolHTML = [];
        this.state = {
            title: '',
            asgmntCnt: '',
            asDuDt: '',
            atcmnt: [],
            studTextdata: '',
            studUrlData: '',
            aSts: '',
            diffInDays: '',
            hrs: '',
            viewUrl: false,
            viewText: true,
            viewFile: true,
            urlvalid: true,
            GrdNm : '',
            grdSts : '',
            mark : '',
            grdCnf : '',
            mxMrk : '',
            hideEdit:false,
            isRubricsModal:false,    //Launch Rubrics Modal
            asignmentStudId: ''
        }
        AnalyticsService.setCurrPage('ASGN_SUB');
    }
    componentDidMount() {
        //Initially remove the attachments from the store
        if (this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length) {
            this.props.removeImg();
        }
        if (this.props.location.search && !_.isEmpty(this.props.location.search)) {
            this.values = queryString.parse(this.props.location.search);
            const oReq = {
                contntId: this.values.cntId,
                submit: this.values.submit ? true : false,
                projct: {
                    title: 1,
                    asgmnt: 1
                }
            }
            const oUserSession = UserSession.getSession();
            if(oUserSession && oUserSession.stuId){
                oReq.studId = oUserSession.stuId;
            };
            if (this.props.location?.state?.groupData?.students?.length){
                const studIds = [];
                this.props.location.state.groupData.students.forEach(function(student){
                    studIds.push(student.studId)
                });
                if (studIds.length) {
                    oReq.aGrpStudets = studIds
                }
            }
            HTTPService.post('/lms-asgnmnt/get_stud_submit_view_assgmnt_frm_lms', oReq, null, (err, data) => {
                if (data && data.output) {
                    if (data.output.data && data.output.data.code === 'NO_DOCS_FOUND') {
                        messageUtil.showInfo('NO_DOCS_FOUND', true);
                    } else if (data.output.data && data.output.data.contentAssignData && data.output.data.contentAssignData.length > 0) {
                        this.setState({ title: data.output.data.contentAssignData[0].title, rubTitle : data.output.data.contentAssignData[0].rubTitle, rbrcId : data.output.data.contentAssignData[0].rbrcId});
                        if(data.output.data.studDtls){
                            this.setState({
                                studNm: data.output.data.studDtls.studNm,
                                PhotoImgID: data.output.data.studDtls.PhotoImgID,
                                studId : oReq.studId ? oReq.studId : ''
                            });
                        }
                        if (data.output.data.contentAssignData[0] && data.output.data.contentAssignData[0].asgmnt) {
                            this.setState({
                                asDuDt: data.output.data.contentAssignData[0].asgmnt.asDuDt,
                                asgmntCnt: data.output.data.contentAssignData[0]?.asgmnt?.asmCnt || '',
                                grdCnf: data.output.data.contentAssignData[0].asgmnt.grdCnf,
                                mxMrk: data.output.data.contentAssignData[0].asgmnt.mxMrk,
                                atcmnt: data.output.data.contentAssignData[0].asgmnt.atcmnt
                            });       
                            let curDate = moment(new Date()).format("YYYY-MM-DD HH:mm")
                            let asDuDt = moment.utc(data.output.data.contentAssignData[0].asgmnt.asDuDt).format("YYYY-MM-DD HH:mm")
                            if ((moment(asDuDt).unix() < moment(curDate).unix()) && !data.output.data.contentAssignData[0].asgmnt.isLtSu) {
                                this.setState({ hideEdit: true });
                            }
                        }
                        //Set the students submitted assignments
                        if (data.output.data.studAsgmntData && data.output.data.studAsgmntData.length) {
                            this.studAssignData = data.output.data.studAsgmntData[0].sAsgmt;
                            this.setState({
                                aSelRatings : data.output.data.studAsgmntData[0].aRtng,
                                fdBkOn : data.output.data.studAsgmntData[0].fdBkOn,
                                fdBk : data.output.data.studAsgmntData[0].fdBk,
                                GrdNm : data.output.data.studAsgmntData[0].GrdNm,
                                grdSts : data.output.data.studAsgmntData[0].grdSts,
                                mark : data.output.data.studAsgmntData[0].mark,
                                aSts: data.output.data.studAsgmntData[0].aSts,
                                aRtng: data.output.data.studAsgmntData[0].aRtng,
                                studTextdata: data.output.data.studAsgmntData[0].sAsgmt && data.output.data.studAsgmntData[0].sAsgmt.text && data.output.data.studAsgmntData[0].sAsgmt.text.html,
                                studUrlData: data.output.data.studAsgmntData[0].sAsgmt && data.output.data.studAsgmntData[0].sAsgmt.url,
                                asignmentStudId: data.output.data.studAsgmntData[0]?.studId
                            });
                            this.props.attachments.push(data.output.data.studAsgmntData[0].sAsgmt.file);
                        }
                        //Calculate no.of days and hours between two dates
                        if (this.state.asDuDt && this.state.asDuDt.length) {
                            const today = new Date();
                            const dueDt = new Date(this.state.asDuDt);
                            const days = getDaysCountBetween(dueDt, today);
                            const hours = getHoursBetweenDates(dueDt, today);
                            this.setState({ diffInDays: days > 0 && days, hrs: hours > 0 && hours });
                        }
                        if(this.props?.location?.state?.isVlPlgm){
                            this.getExternalTools({
                                studId:data.output.data?.studDtls?.studId,
                                studNm: data.output.data?.studDtls?.studNm,
                                studEmail: data.output.data?.studDtls?.studEmail,
                                assignmentTitle: data.output.data?.contentAssignData?.[0]?.title,
                                assignmentId: data.output.data?.contentAssignData?.[0]?._id,
                                subId:this.props?.location?.state?.subId,
                                subNa:this.props?.location?.state?.subNa,
                                InId:this.props.location?.state?.InId
                            });
                        }
                    }
                } else {
                    // messageUtil.showError("UNKNOWN_ERROR", false);
                }
            });
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    }

    // url input handler
    urlChange = (event) => {
        //validate the given URL
        const valid = isValidURL(event.target.value);
        this.setState({ ...this.state, studUrlData: event.target.value });
        this.studAssignData.url = event.target.value;
        this.setState({ urlvalid: valid });
    }

    //Remove students text editor/file upload/URL
    removeStudCntnt = (type) => {
        if (type === 'text') {
            this.setState({ viewText: false, studTextdata: '' });
        } else if (type === 'file') {
            this.props.removeImg();
            this.setState({ viewFile: false });
        } else {
            this.setState({ viewUrl: false, studUrlData: '' });
        }
        //Type matches remove the property from the student assignment data
        if (this.studAssignData[type]) {
            this.studAssignData = _.omit(this.studAssignData, type);
        }
    }

    //Submit Student Assignment
    submitAssignment = () => {
        const oReq = {
            asCnId: this.values.cntId,
            sAsgmt: this.studAssignData
        }
        const isGrpStatus = this.props.location.state?.isGroup;
        const aGrpStuds = this.props.location?.state?.groupData?.students;

        if(isGrpStatus){
            oReq.isGroup = true
            oReq.grpStudIds = aGrpStuds.map((s) => s?.studId)
        }

        HTTPService.post('/lms-asgnmnt/submit-stud-assgmnt-frm-lms', oReq, null, (err, data) => {
            if (data && data.output) {
                if (data.output.data && data.output.data.code === 'UPDATED_SUCCESS') {
                    messageUtil.showSuccess('ASSIGNMENT_SUBMITTED_SUCCESSFULLY', true);
                    this.props.history.push({ pathname: "/home-page/assignment-view", search: `?id=${this.values && this.values.cntId}&asgmSts=submitted`, state: this.props.location.state });
                } else if (data.output.data && data.output.data.code === 'NO_DOCS_FOUND') {
                    messageUtil.showInfo('NO_DOCS_FOUND', true);
                }  else if (data.output.data && data.output.data.code === 'DUE_DATE_CROSS') {
                    messageUtil.showInfo('DUE_DATE_CROSS', true);
                }  else {
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        });

    }

    getExternalTools = (AsgnmentDtls) => {
        const oReq = {InId:this.props.location?.state?.InId};
        HTTPService.post('/lms/get-external-tool', oReq, null, (err, response) => {
            if (response?.output?.data?.length) {
                const matchedObj = response?.output?.data.find(item => item.toolURL === "https://api.identific.com");
                this.oPlagrismTool = { ...matchedObj, ...AsgnmentDtls };
                this.LTILaunchRequest(this.oPlagrismTool);
            }
        });
    }

    LTILaunchRequest = (toolDetils) => {
        const oReq = toolDetils;
        HTTPService.post('/lms/launch-lti-tool', oReq, null, (err, response) => {
          if (response?.output?.data) {
            this.aPlagrismlaunchToolHTML = response?.output?.data;
          }else if(err){
            messageUtil.showError("UNKNOWN_ERROR", false);
          }
        });
    }

    // File upload handler
    fileUploadChange = () => {
        this.props.removeImg();
    }

    render() {
        const { aSts,title, asgmntCnt,atcmnt, diffInDays, hrs, viewUrl, studUrlData, viewText, viewFile } = this.state;
        this.values = queryString.parse(this.props.location.search);
        const date = lmsDateAndTimeFormat(this.state.asDuDt);
        //Add file type to the students assignments
        if (this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length && this.props.attachments[0].url && this.props.attachments[0].url.length && this.state.viewFile) {
            this.studAssignData.file = {
                name: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name,
                url: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].url
            };
        }
        const isArchCrsEnable = UserSession.getArchCrsDtls();
        return (
            <div>
                {(this.props?.location?.state?.isVlPlgm && this.oPlagrismTool && this.aPlagrismlaunchToolHTML && this.aPlagrismlaunchToolHTML.length > 0) ?
                  <iframe
                    title="LTI Launch"
                    srcDoc={this.aPlagrismlaunchToolHTML}
                    style={{ width: '100%', height: '800px', border: 'none' }}
                  />
                 :
                    <div className="assignment-submission_container">
                        <div className="row m-0">
                            <div className="col-8 p-0">
                                <div className="assignment-submission">
                                    <div className="assignment-submission_header">
                                    <ArrowLeft className="svg-icon_default icon-default right-icon icon-pointer" onClick={()=>this.props.history.go(-1)}/>
                                    <p className="assignment-submission_title">{title}</p>
                                    </div>
                                    <p className="assignment-submission_content">
                                        <div><LmsEditorView contentData={asgmntCnt} /></div>
                                    </p>
                                    {atcmnt && atcmnt.length > 0 &&
                                        <div>
                                            <p className="assignment-attachment">Attachments</p>
                                            <div className="attachment-files">
                                                <p className="attachment-files_name"><File className="svg-icon_small icon-dark" />
                                                 <span className='cursor-pointer'>
                                                <span className='download-File_s3' onClick={() => {downloadS3Files({name: atcmnt[0].atcNme || '' , url: atcmnt[0].atcUrl})}}>{atcmnt[0] && atcmnt[0].atcNme}</span>
                                                   </span></p>
                                            </div>
                                        </div>
                                    }
                                    {/* <div className="attachment-files">
                                    <p className="attachment-files_name"><File className="svg-icon_small icon-dark"/> <span>Parts of the body.pdf</span></p>
                                </div> */}
                                    {this.values && (this.values.submit || this.values.fromView) ?
                                        (<div className="submission-container">
                                            <div className="submission-container_box">
                                                <p className="submission-header">{this.props.t("translate:YOUR_SUBMISSION")}</p>
                                                {viewText &&  
                                                    <div>
                                                        <p className="entry-header">{this.props.t("translate:ASMNT_SUBM_TEXT_ENTRY")}</p>
                                                        <div className="editor-content_box">
                                                            <div className="edit-option">
                                                                <LmsEditor  placeholder={"Enter Description"}
                                                                    value={this.state.studTextdata} onChange={(html) => {
                                                                        this.setState({ ...this.state, studTextdata: html });
                                                                        this.studAssignData.text = { html: html }
                                                                    }} />
                                                                {/* <LmsEditor  className="editor-box" placeholder={"Enter description"} /> */}
                                                            </div>
                                                            <div onClick={() => this.removeStudCntnt('text')}>
                                                                <MinusCircle className="svg-icon_small icon-dark" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length && viewFile &&
                                                    <div>
                                                        <p className="entry-header">{this.props.t("translate:FILE_UPLOAD")}</p>
                                                        <div className="editor-content_box">
                                                            <div className="files-attachment">
                                                                <p className="attachment-files_name"><File className="svg-icon_small icon-dark" />  <span><span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: this.props.attachments[0].name , url: this.props.attachments[0].url})}}>{this.props.attachments[0] && this.props.attachments[0].name}</span></span></p>
                                                                {  this.props.attachments[0].percentageLoaded && this.props.attachments[0].percentageLoaded !== 100 && 
                                                                    <FileLoader value={this.props.attachments[0].percentageLoaded}></FileLoader>
                                                                }
                                                            </div>
                                                            <div onClick={() => this.removeStudCntnt('file')}>
                                                                <MinusCircle className="svg-icon_small icon-dark" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                                {/* {!_.isEmpty(studfileData) && this.props.attachments.length==0 && 
                                            <div>
                                                <p className="entry-header">File upload</p>
                                                <div className="editor-content_box">
                                                <div className="files-attachment">
                                                <p className="attachment-files_name"><File className="svg-icon_small icon-dark"/>  <span><a href={studfileData.url}>{studfileData.name}</a></span></p>
                                                </div>
                                                <MinusCircle className="svg-icon_small icon-dark" />
                                                </div>
                                            </div>
                                        } */}
                                                {(viewUrl || studUrlData) &&
                                                    <div>
                                                        <p className="entry-header">{this.props.t("translate:WEBSITE_URL")}</p>
                                                        <div className="editor-content_box">
                                                            <div className="url-attachment">
                                                                {/* <input type="text" className="url-uploader" placeholder="Enter URL"/> */}
                                                                <FileUrl value={this.state.studUrlData} onChange={this.urlChange} URLTheme="url-uploader_default" />
                                                                {
                                                                    !this.state.urlvalid && <span className="text-empty_content">{this.props.t("translate:NOT_A_VALID_URL")}</span>
                                                                }
                                                            </div>
                                                            <div onClick={() => this.removeStudCntnt('url')}>
                                                                <MinusCircle className="svg-icon_small icon-dark" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>


                                            <div className="submission-upload_btn">
                                                <div className="line-submission">
                                                    <div className="btn-line"></div>
                                                </div>
                                                <div className="submission-btn_group">
                                                    <LmsFileUploader multiple={false} onChange={()=> this.fileUploadChange()} onDropChange={()=> this.fileUploadChange()}>
                                                        <p onClick={() => this.setState({ viewFile: true })}><Upload className="svg-icon_small icon-primary" /><span>{this.props.t("translate:FILE_UPLOAD")}</span></p>
                                                    </LmsFileUploader>
                                                    <p onClick={() => this.setState({ viewText: true })}><FileText className="svg-icon_small icon-primary" /><span>{this.props.t("translate:TEXT_ENTRY")}</span></p>
                                                    <p onClick={() => this.setState({ viewUrl: true })}><Link className="svg-icon_small icon-primary" /><span>{this.props.t("translate:WEBSITE_URL")}</span></p>

                                                </div>
                                            </div>
                                            <div className="submission-submit_btn">
                                                {_.isEmpty(this.studAssignData) || !this.state.urlvalid ?
                                                    <Button theme="btn-rounded lite_dark-btn">{this.props.t("translate:ENTER_AN_ANSWER")}</Button>
                                                    :<Button theme="btn-rounded default " clicked={this.submitAssignment}> <Check className="svg-icon_small icon-white icon-space_left" />{this.props.location.state?.isGroup ? `${this.props.t('translate:SUBMIT_ASSIGNMENT_GROUP')} ${this.props.location.state?.groupData?.groupName}` : this.props.t("translate:SUBMIT_ASSIGNMENT")} </Button>
                                                }
                                            </div>

                                        </div>) :
                                        (
                                            (this.state.studTextdata || this.state.studUrlData ||  this.studAssignData)  ?
                                            (!_.isEmpty(this.studAssignData) && <SubmissionViewComponent grdSts = {this.state.grdSts} hideEdit={this.state.hideEdit} studAsgmntData={this.studAssignData} pastAsgmnt={this.values && this.values.pastAsgmnt} asgmntStudId={this.state.asignmentStudId} />)
                                            : this.state.grdSts && this.state.grdSts === "GRD" && <p className="empty-stud_assignment">{this.props.t("translate:NO_SUBMISSION")}</p>
                                        )
                                    }

                                </div>
                            </div>


                            <div className="col-4 p-0">
                                <div className="assignment-grad">
                                    {/* check the student assignment status submitted/graded/not submitted */}
                                    { this.state.grdSts && this.state.grdSts === "GRD" ? 
                                        <div className="grade-status">
                                            <p><Award className="svg-icon_small icon-primary"/> <span>{this.props.t("translate:GRADED")}</span></p>
                                        </div>
                                        : aSts && aSts === "SUB" ?
                                        <div className="submitted-status">
                                            <p><CheckCircle className="svg-icon_small icon-positive " /> <span>{this.props.t("translate:SUBMITTED")}</span></p>
                                        </div>
                                        : <div className="not-completed_status">
                                            <p><Circle className="svg-icon_small icon-primary" /> <span>{this.props.t("translate:NOT_COMPLETED_YET")}</span></p>
                                        </div>
                                    }
                                    <div className="assignment-date_list">
                                        { this.state.grdSts && this.state.grdSts === "GRD" ? 
                                            <div>
                                                <StudentArchiveGradeWrapper isGradeView={_.isEmpty(isArchCrsEnable) ? false : true}>
                                                {this.state.grdCnf && this.state.grdCnf === "POINT" ? 
                                                    <p className="assignment-grade_points"> {this.props.t("translate:GRADES")}  <span>{this.state.mark}</span>/{this.state.mxMrk}</p>
                                                    : 
                                                    <p className="assignment-grade_points"> {this.props.t("translate:GRADES")}  <span>{this.state.GrdNm} </span> {this.props.t("translate:STUD_ASMNT_GRADE")}</p>
                                                }
                                                </StudentArchiveGradeWrapper>
                                                {
                                                    this.state.fdBk &&
                                                        <div className="stud-feedback_container">
                                                            <p className="submission-comments_label"> {this.props.t("translate:TEACHER_FEEDBACK")}</p>
                                                            <div className="stud-feedback_edit">
                                                                <div className="stud-feedback_info">
                                                                    {this.state.PhotoImgID && this.state.PhotoImgID.length>0 ?
                                                                        <img src={'/Image/getImage/' + this.state.PhotoImgID} className="stud-img_list" alt="img" /> : this.state &&  this.state.studNm && <StudentNameComponent className="student-name_icon" fName={this.state.studNm.substring(0, 1)} clrCode={generateHexDecCode(this.state.studId)}/>
                                                                    }
                                                                    <p className="edit-stud_name">{this.state.studNm}</p>
                                                                </div>
                                                            </div>
                                                            <p className="edit-info_label">{this.state.fdBk}</p>
                                                            {this.state.fdBkOn && 
                                                                <p className="edit-info_date">{lmsDateAndTimeFormat(this.state.fdBkOn)}</p>
                                                            }
                                                        </div>

                                                    }
                                               </div> 
                                            :
                                            <div>
                                                <p className="assignment-grade_due">{this.props.t("translate:DUE")} <span className="date-view_label">{date}</span>
                                                    {diffInDays && hrs &&
                                                        <span className="date-view_label"> ( {diffInDays +'days'}, {hrs+'hrs more'} )</span>
                                                    }
                                                </p> 
                                                {
                                                    (!this.state.grdSts || this.state.grdSts !== "GRD") && this.state.mxMrk &&
                                                    <p className="assignment-grade_due"> {this.props.t("translate:GRADES")} <span className="date-view_label"> {this.state.mxMrk} {this.props.t("translate:MAX_POINTS")} </span>
                                                    </p>
                                                }
                                            </div>
                                        }
                                        {/* <p><span>{this.props.t("translate:TO_PASS")}</span> 85 or higher</p> */}
                                        <p className='rubrics-assign-stud'>{this.props.t("translate:RUBRICS_CAP")}<span onClick={()=>this.setState({isRubricsModal:true})}> {this.state.rubTitle}</span></p>
                                        <div>
                                            {
                                                this.state.aRtng && this.state.aRtng.length > 0 ?
                                                (
                                                    this.state.aRtng.map((oSelRating) => [
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
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Rubrics Modal */}
                        {this.state.isRubricsModal && <FullViewModal open={this.state.isRubricsModal} onClose={()=>this.setState({isRubricsModal:false})} aSelRatings = {this.state.aSelRatings} shwRat = {(this.state.aSelRatings && this.state.aSelRatings.length) ? true : false} rubrcId = {this.state.rbrcId} rubTitle = {this.state.rubTitle} isFrAsgn = {true} center={true} isRubrics={true}/>}
                    </div>
                }
                <ModelBarComponent />
                <AnalyticsWrapper></AnalyticsWrapper>
            </div>
        )
    }

}

const mapStateToProps = (state) => ({
    ...state.fileUploadReducer
})
const mapDispatchToProps = {
    initializeFileUpload,
    removeImg
}
const TabNavigator = (props) => <AssignmentSubmissionComponent {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)
export default withTranslation()(Components);

//export default AssignmentSubmissionComponent;