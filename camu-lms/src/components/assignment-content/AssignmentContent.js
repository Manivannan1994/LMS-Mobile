import React, { Component, lazy } from 'react';
import axios from 'axios';
import '../../styles/_assigmnetcontentStyle.scss';
import { MoreInfo, PdfFile, MinusCircle,Cross,Trash } from '../icons/Icons';
import { connect } from 'react-redux';
import { initializeFileUpload } from '../../store/actions/FileUploadAction';
import { withRouter } from 'react-router-dom'
import queryString from 'query-string';
import { withTranslation } from 'react-i18next';
// import student_img from '../../assets/images/stud-img.png';
import HTTPService from "../../utils/http-util";
import $ from 'jquery';
import { Info,Plus ,ArrowLeft,Image,X, Trash2, Edit2, Search,Upload, Link2, AlertCircle} from 'react-feather';
import messageUtil from '../../utils/message-util';
import {removeImg} from '../../store/actions/FileUploadAction';
import LmsCommonService from '../../service/lms-service';
import {getSpcAssignMntStudnts, updateFields} from '../../store/actions/ContentActions';
import {updateFields as updateFiles} from '../../store/actions/FileUploadAction';
import { getSubjByEntprsDtls } from '../../store/actions/DashboardActions';
import { getAllParticipantGroups } from '../../store/actions/ParticipantsAction';
import { getRubrics } from "../../store/actions/RubricsActions";
import { generateHexDecCode, isValidURL } from '../../utils/helper';
import _ from 'lodash';
import SimpleReactValidator from 'simple-react-validator';
import FileLoader from '../file-loader/FileLoader';
import ReactDatePicker from '../date-picker/DatePicker';
import moment from 'moment';
import RadioButton from '../radio-button/RadioButton';
import Select from '../react-select/ReactSelect';
import { getAssgnStuds } from '../../store/actions/GradeBookActions';
import { getUploadedScormFiles } from '../../store/actions/ScormFileAction';
import UserSession from '../../utils/UserSession'

const ModelBarComponent = lazy(() => import('../modelbar/Modelbar'));
const Button = lazy(()=>
import('../button/Button')
);
const InputBox = lazy(()=>
import('../input-box/InputBox')
);
const StudentSearch = lazy(()=>
import('../student-searchbox/StudentSearch')
);
const CheckBox = lazy(()=>
import('../checkbox/CheckBox')
);
const LmsSelectDropDown = lazy(()=>
import('../lms-selectdropdown/LmsSelectDropDown')
);
const LmsEditor = lazy(()=>
import('../lms-editor/LmsEditor')
);
const FileUrl = lazy(()=>
import('../fileurl/FileUrl')
);
const LmsFileUploader = lazy(()=>
import('../lms-fileuploader/LmsFileUploader')
);
const LmsModal = lazy(() =>
import("../modal/LmsModal")
);
const FullViewModal =  lazy(() =>
import("../modal/FullViewModal")
);
const StudentNameComponent = lazy(()=>
import('../student-name/StudentName') 
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
let values;

class AssignmentContentComponent extends Component {
   constructor(props) {
      super(props);
      this.errMsgGrdRef = React.createRef();
      this.errMsgDueRef = React.createRef();
      this.state = {
         title: "",
         asmCnt: '',
         atcmnt: {
            atcNme: '',
            atcUrl: '',
            atcId: ''
         },
         asmCtg: '',
         isLtSu: false,
         avlChk: false,
         asDuDt: '',
         asAvPr: '',
         assgnMntStuds:[],
         assgnmtSlctStuds: [],
         stdnts: [],
         aCategory: [],
         aGradConf : [],
         aGradeSys : [],
         grdSys : '',
         value:'',
         disCardModal:false,
         isNavi:false,
         mxMrk:'',
         link:'',
         isAlStu:true,
         isRubSel : true,
         urlvalid: true,
         rubricsTitle:'',
         isAlCn:false,
         isVlPlgm:false,
         rubricsId:'',
         shwEdtRbMdl : false,
         shwEdtCompMod : false,
         shwTotPntErr:false,      // Show total point error for rubrics total not matched
         isRubricsModal:false,    //Launch Rubrics Modal
         shwNwRbrcsMod : false,
         ntInFn : false,        // Not include the assignment in final grade calculation
         vSts:'D',           //View Status(published or not)
         fileTy:'',
         isGroup: false,
         grpIds: [],
         partGroups:[],
         studsSubmitted: false
        
      }
      //For validation and mandatory fields check
      this.validator = new SimpleReactValidator({autoForceUpdate: this});
   }

   // delete the question paper
   delRubric = () => {
      this.props.updateFields('oAsgnRubrc',{});
   }

   // editRubricsInModal = () => {
   //    if(this.props.oAsgnRubrc && this.props.oAsgnRubrc._id){
   //       let rubrcState = this.props.location.state;
   //       rubrcState.title = this.state.title;   // Assignment title
   //       rubrcState.mxMrk = this.state.mxMrk;   // Assignment maximum mark
   //       this.props.history.push({ pathname: "/home-page/rubrics-edit", search:`?rbrcId=${this.props.oAsgnRubrc._id}`, state: rubrcState });
   //    }
   // }

   // Edit the rubrics

   prcdEditRubrc = () => {
      this.setState({shwEdtCompMod : true, shwEdtRbMdl : false});
   }

   // Get the rubrics
   getRubrics = (rubkey,isEditRb) => {
      if(rubkey !== 'frmCal'){
         this.props.updateFields('oAsgnRubrc',{});
      }
      if(this.props.location.state && !_.isEmpty(this.props.location.state)){
         let oReq = {
            "AcYr": this.props.location.state.AcYr,
            "InId": this.props.location.state.InId,
            "DeptID": this.props.location.state.DeptID,
            "PrID": this.props.location.state.PrID,
            "CrID": this.props.location.state.CrID,
            "SemID": this.props.location.state.SemID,
            "SubID"  : this.props.location.state.subId,
            isFrAsgn : true,
            oProj : { title : 1, aCrtrn : 1}
         };
         if(values && values.id){
            oReq.asgnId = values.id;
         }
         if(isEditRb){ // is edit from rubric
            oReq.asiDup = true;
            oReq._id = this.props.oAsgnRubrc._id;
            oReq.isFrEdRb = true;
         }
         this.props.getRubrics(oReq,this.editRbModel);
      }
   }

   getParticipantGroups = () => {
      const oReq = {
        PrID: this.props.location.state.PrID,
        CrID: this.props.location.state.CrID,
        DeptID: this.props.location.state.DeptID,
        SemID: this.props.location.state.SemID,
        AcYr: this.props.location.state.AcYr,
        SecID: this.props.location.state.SecID,
        SubjId: this.props.location.state.subId,
      };

     this.props.getAllParticipantGroups(oReq)
   }

   // Get the staff subejct details for rubrics

   getStaffSubjDetails = () => {
      if(this.props.location.state && !_.isEmpty(this.props.location.state)){
         let oReq = {
            "AcYr": this.props.location.state.AcYr,
            "InId": this.props.location.state.InId,
            "PrID": this.props.location.state.PrID,
            "CrID": this.props.location.state.CrID,
            "SemID": this.props.location.state.SemID,
            "isFrmAsgn" : true
         };
         this.props.getSubjByEntprsDtls(oReq, this.props.session);
      }
   }

   componentDidMount() {
      $('#myModal-page').modal('hide');
      if(this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length){
         this.props.removeImg();
      }
      this.getStaffSubjDetails();
      //To get the assignment cccode values 
      if (this.props.location && this.props.location.search) {
         values = queryString.parse(this.props.location.search);
      }
      //get the domain values
      const oDomainCodes = {
         codes : ['ASSGNMNT_CAT', 'GRAD_CONFIG'],
      };
      
      // Set domain code values
      LmsCommonService.getDomainByCode(oDomainCodes, (err, data)=>{
         if(data && data.length){
            for(let cd = data.length - 1; cd >= 0; cd--){
               if(data[cd].code === "ASSGNMNT_CAT" && data[cd].ccodes && data[cd].ccodes.length){
                  this.setState({ aCategory: data[cd].ccodes, asmCtg : data[cd].ccodes[0].code});
               }
               if(data[cd].code === "GRAD_CONFIG" && data[cd].ccodes && data[cd].ccodes.length){
                  this.setState({ aGradConf: data[cd].ccodes, grdCnf : data[cd].ccodes[0].code});
               }
            }
         }
      });  

      // Set grading system
      LmsCommonService.getGradingSystem({InId : this.props.location.state.InId},(err, data)=>{
         if (data && data.length) {
            this.setState({ aGradeSys: data });
         }
      });
      this.getAssignmentStudDetails()
      this.getParticipantGroups();

      this.getRubrics();
      //get the Assignment students
      this.getTheAssgnmntStuds();
      // Get the Assignment details
      
      this.getAssgnmentDtls();

     
   }


   //fetch assignment student details for submitted unsubmitted status
   getAssignmentStudDetails = () => {
      const oPayload = {
        asgnmntId: values?.id,
        InId: this.props.location.state.InId,
        PrID: this.props.location.state.PrID,
        CrID: this.props.location.state.CrID,
        AcYr: this.props.location.state.AcYr,
        DeptID: this.props.location.state.DeptID,
        SemID: this.props.location.state.SemID,
        SecID: this.props.location.state.SecID,
        subId: this.props.location.state.subId,
      };
      this.props.getAssgnStuds(oPayload)
    }


   // componentDidUpdate(prevProps, prevState) {
   //    // Check if the data prop has changed and update the local state
   //    console.log('group ids changed',this.props.participantGroups )

   //    if (prevProps.participantGroups && this.props.participantGroups && this.props.participantGroups.length) {
   //      this.setState({ partGroups: this.props.participantGroups.map((grp) => ({...grp, grpNmCt: `${grp?.groupName} (${grp?.students?.length})`})) });
   //    }
   //  }


   // Get the Assignment details
   getAssgnmentDtls = () =>{
      if(values && values.id && this.props.location.state && !_.isEmpty(this.props.location.state)){
         let oReq={
            contntId:values.id,
            type: 'ASGMNT'
         }
         HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit',oReq,null,(err,data)=>{
            if(data && data.output){
               if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
                  messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               }else if(data.output.data && data.output.data.asgmnt){
                  this.setState({
                     title:data.output.data.title,
                     asmCtg:data.output.data.asgmnt.asmCtg,
                     grdCnf:data.output.data.asgmnt.grdCnf,
                     grdSys:data.output.data.asgmnt.grdSys,
                     mxMrk:data.output.data.asgmnt.mxMrk,
                     mnMrk:data.output.data.asgmnt.mnMrk,
                     asmCnt:data.output.data.asgmnt.asmCnt,
                     // isAlStu:data.output.data.asgmnt.isAlSt,
                     ntInFn:data.output.data.asgmnt.ntInFn,
                     vSts:data.output.data.vSts,
                     isLtSu: data.output.data.asgmnt.isLtSu,
                     isAlCn:data.output.data.isAlCn,
                     isVlPlgm:data.output.data.isVlPlgm
                     // assgnmtSlctStuds:data.output.data.students && data.output.data.students.length ? data.output.data.students : []
                     // asDuDt:moment(data.output.data.asgmnt.asDuDt).format('YYYY-MM-DD')
                     // asDuDt: new Date(data.output.data.asgmnt.asDuDt)
                  });
                  if(data.output.data.asgmnt && !data.output.data.asgmnt.isAlSt && data.output.data.students && data.output.data.students.length>0){
                     this.setState({...this.state,assgnmtSlctStuds:data.output.data.students,isAlStu:false});
                  }else{
                     this.setState({...this.state,assgnmtSlctStuds:[]});
                  }
                  if(data.output.data.asgmnt.asDuDt){
                     this.setState({
                        asDuDt: moment.utc(data.output.data.asgmnt.asDuDt)
                     });
                  }
                  if(data.output.data.asgmnt.asAvPr){
                     this.setState({
                        asAvPr: moment.utc(data.output.data.asgmnt.asAvPr),
                        avlChk: true
                     });
                     
                  }
                  if(data.output.data.asgmnt.isGroup){
                  this.setState({
                     ...this.state, isGroup: data.output.data.asgmnt.isGroup
                  })
                  }
                  if(data.output.data.asgmnt.grpIds && data.output.data.asgmnt.grpIds.length && this.props.participantGroups && this.props.participantGroups.length){
                     this.setState({
                        ...this.state, grpIds: data.output.data.asgmnt.grpIds.map((d) => {
                           return this.props.participantGroups.find((grp) => grp._id == d.grpId)
                        }).map((grp) => ({...grp, grpNmCt: `${grp?.groupName} (${grp?.students?.length})`}))
                     })
                     }
                  // Set rubrics data
                  if(data.output.data.asgmnt.rbrcId && this.props.aRubrics && this.props.aRubrics.length){
                     for(let rb = this.props.aRubrics.length - 1; rb >= 0; rb--){
                        if(this.props.aRubrics[rb]._id === data.output.data.asgmnt.rbrcId){
                           this.props.updateFields('oAsgnRubrc',this.props.aRubrics[rb]);
                           this.setState({
                              isRubSel : false,
                              rubricsTitle:this.props.aRubrics[rb].title,
                              rubricsId:this.props.aRubrics[rb]._id
                           });
                           break;
                        }
                     }
                  }
                //  For name conversion in edit mode
                  let Aatcmnt = [];
                  if (data.output.data.asgmnt.atcmnt.length) {
                     for(let i = data.output.data.asgmnt.atcmnt.length - 1; i >= 0; i--){
                        if (!data.output.data.asgmnt.atcmnt[i].link) {
                           if(data.output.data.asgmnt.atcmnt[i] && data.output.data.asgmnt.atcmnt[i].embedUrl){
                              Aatcmnt.push({
                                 name: data.output.data.asgmnt.atcmnt[i].atcNme,
                                 url: data.output.data.asgmnt.atcmnt[i].atcUrl,
                                 fileKey: data.output.data.asgmnt.atcmnt[i].atcId,
                                 fileTy: data.output.data.asgmnt.atcmnt[i].fileTy,
                                 embedUrl:data.output.data.asgmnt.atcmnt[i].embedUrl
                              });
                           }else{
                              Aatcmnt.push({
                                 name: data.output.data.asgmnt.atcmnt[i].atcNme,
                                 url: data.output.data.asgmnt.atcmnt[i].atcUrl,
                                 fileKey: data.output.data.asgmnt.atcmnt[i].atcId,
                                 fileTy: data.output.data.asgmnt.atcmnt[i].fileTy
                              });
                           }
                        }else{
                           if(data.output.data.asgmnt.atcmnt[i].link){
                              this.setState({ ...this.state, link: data.output.data.asgmnt.atcmnt[i].link, fileTy: data.output.data.asgmnt.atcmnt[i].fileTy });
                           }
                        }
                     }
                     this.props.updateFiles('attachments', Aatcmnt);
                  }
                  //Matches the Assignment selected students from the assignment students
                  setTimeout(() => {
                     if(this.state.assgnMntStuds && this.state.assgnMntStuds.length>0 && this.state.assgnmtSlctStuds &&  this.state.assgnmtSlctStuds.length){
                        for(let asgmntStud=this.state.assgnMntStuds.length-1;asgmntStud>=0;asgmntStud--){
                           for(let selcStud=this.state.assgnmtSlctStuds.length-1;selcStud>=0;selcStud--){
                              if(this.state.assgnMntStuds[asgmntStud].StuID===this.state.assgnmtSlctStuds[selcStud]._id){
                                 //this.state.assgnMntStuds[asgmntStud].checked=true;
                                 this.setState(state => {
                                    return state.assgnMntStuds[asgmntStud].checked = true
                                 });
                                 break;
                              } 
                           }
                        }
                        // this.setState({assgnMntStuds:this.state.assgnMntStuds});
                     }
                  },2000); 
               }else if(data.output.data && _.isEmpty(data.output.data)){
                  messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               }
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         })   
      }
   }
   
   //Add subchapter assignment item
   addSubChapterAssignment = (publishKey,view)=> {
      this.setState({shwTotPntErr:false});
      // Check rubrics total point and assignment's maximum mark must be equal if rubrics mapped
      if(this.props.oAsgnRubrc && this.props.oAsgnRubrc._id && this.props.oAsgnRubrc.totPnt != null && !isNaN(this.props.oAsgnRubrc.totPnt) && 
         this.state.mxMrk != null && !isNaN(this.state.mxMrk)) {
            // eslint-disable-next-line
            if(this.state.mxMrk != this.props.oAsgnRubrc.totPnt){
            this.setState({shwTotPntErr:true});
            if(this.errMsgGrdRef.current){
               this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
            }
            return;
         }
      }
      //If all the fileds are valid then only allowed to save
      if (this.validator.allValid()) {
         if(this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
            let dateFrmt = moment(this.state.asDuDt).format("YYYY-MM-DD");
            let timeFrmt = moment(this.state.asDuDt).format("HH : mm");
            let actDueDate = dateFrmt+' '+timeFrmt;
            let avPrDt;

            if(this.state.asAvPr){
               	avPrDt = moment(this.state.asAvPr).add(1, 'hours');
            }
			/*
               	* Ensure that the due date is at least one hour greater than the available period date. 
               	* Check if the due date and time of the assignment are later than the available period's date and time.
            */
			if(this.state.asDuDt && avPrDt && moment(avPrDt).unix() > moment(this.state.asDuDt).unix()){
				messageUtil.showInfo("ASSIGNMENT_DUE_DATE_VALIDATION_INFO", true);
				return;
			}

         if (!this.state.isAlStu && !this.state.isGroup && this.state.assgnmtSlctStuds && this.state.assgnmtSlctStuds.length === 0) {
            messageUtil.showInfo("ASSIGNMENT_CONTENT_SPECEFIC_OPTION_NO_STUDENT_SELECT", true);
				return;
         };
         if (this.state.isGroup && this.state.grpIds.length === 0) {
            messageUtil.showInfo("ASSIGNMENT_CONTENT_GROUP_OPTION_NO_GROUP_SELECT", true);
				return;
         }

            let oReq = {
               //SubID: this.props.location.state.subId,            
               PrID: this.props.location.state.PrID,
               CrID: this.props.location.state.CrID,
               DeptID: this.props.location.state.DeptID,
               SemID: this.props.location.state.SemID,
               SecID: this.props.location.state.SecID,
               AcYr: this.props.location.state.AcYr,
               staffId: this.props.location.state.StaffId,
               tCntId: this.props.location.state.TPID,
               chapId: values.chapId,
               sChpId: values.subId,
               subjId: this.props.location.state.subId,
               SubID: this.props.location.state.subId,
               title: this.state.title,
               asmCnt: this.state.asmCnt ? this.state.asmCnt:'',
               asmCtg: this.state.asmCtg ? this.state.asmCtg:'',
               grdCnf: this.state.grdCnf ? this.state.grdCnf:'',
               grdSys: this.state.grdSys ? this.state.grdSys:'',
               mnMrk: this.state.mnMrk ? this.state.mnMrk:'',
               mxMrk: this.state.mxMrk ? this.state.mxMrk:'',
               isLtSu: this.state.isLtSu,
               ntInFn : this.state.ntInFn,
               asDuDt : actDueDate,
               // asDuDt: moment.utc(this.state.asDuDt).format("YYYY-MM-DD HH:mm"),
              // asAvPr: this.state.asAvPr,
               isFE: this.props.session.fe,
               // link:this.state.link,
               vSts:view,
               stdnts:this.state.assgnmtSlctStuds,
               aAlStuds: this.state.assgnMntStuds,
               type: 'ASGMNT',
               seqNo:this.props.location.state.seqNo,
               _id:values.id,
               isAlCn:this.state.isAlCn,
               isVlPlgm:this.state.isVlPlgm,
               isGroup: this.state.isGroup,
               grpIds: this.state.grpIds.length ? this.state.grpIds.map((g) => ({grpId: g?._id, indvGrd: false})) : []
            }
            // For multiple attechments
            oReq.atcmnt = [];
            if (this.props.attachments && this.props.attachments.length > 0) {
               this.props.attachments.forEach((element, index) => {
                  if(element.name === undefined || element.url === undefined){
                     return;
                  }else {
                     if(element.embedUrl){
                        oReq.atcmnt.push({
                           atcNme: element.name,
                           atcUrl: element.url,
                           atcId: element.fileKey,
                           fileTy: element.fileTy,
                           embedUrl:element.embedUrl,
                           ...('isDwldPm' in element ? {isDwldPm: element.isDwldPm} : {})
                        });
                     }else{
                        oReq.atcmnt.push({
                           atcNme: element.name,
                           atcUrl: element.url,
                           atcId: element.fileKey,
                           fileTy: element.fileTy,
                           ...('isDwldPm' in element ? {isDwldPm: element.isDwldPm} : {})
                        });
                     }
                  }
               });
            } else if(this.state.link){
               oReq.atcmnt ={
                  link:this.state.link,
                  fileTy: this.state.fileTy
               }
            }
            if(this.state.asAvPr && this.state.avlChk){
               oReq.asAvPr = moment(this.state.asAvPr).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
            }else{
               oReq.asAvPr ='';
            }
            oReq.isAlSt = this.state.isAlStu;
            oReq.isAssignTo = publishKey;
            // set Rubrics
            if(this.props.oAsgnRubrc && this.props.oAsgnRubrc._id){
               oReq.rbrcId = this.props.oAsgnRubrc._id;
            }else{
               oReq.rbrcId = '';
            }
            let asgmntUrl;
            if(view === "F"){
               asgmntUrl = '/lms-asgnmnt/publish-assgmnt-frm-lms';
            }else{
               asgmntUrl = '/lms-asgnmnt/create-or-edit-assgmnt-frm-lms';
            }
            HTTPService.post(asgmntUrl, oReq, null, (err, data) => {
               //handle err and success
               if(data && data.output){
                  if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONT_DET_FND"){
                     messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
                  }else if(data.output.data && !_.isEmpty(data.output.data)){
                     if(values && values.id && values.id.length){
                        messageUtil.showSuccess('ASSIGNMENT_UPDATED_SUCCESSFULLY',true);
                     }else{
                        messageUtil.showSuccess('ASSIGNMENT_ADDED_SUCCESSFULLY',true);
                     }
                     if(values && values.assgnmntView){
                        this.props.history.push({pathname:"/home-page/assignment-view",search:`?id=${data.output.data._id}&assgnmntView=${true}&rubId=${this.props.oAsgnRubrc &&  this.props.oAsgnRubrc._id ? this.props.oAsgnRubrc._id :''}`,state:this.props.location.state});
                     }else{
                        this.props.history.push({pathname:"/home-page/assignment-view",search:`?id=${data.output.data._id}&chapId=${values.chapId}&subId=${ values.subId}&rubId=${this.props.oAsgnRubrc &&  this.props.oAsgnRubrc._id ? this.props.oAsgnRubrc._id :''}`,state:this.props.location.state});
                     }
                     
                     // this.props.history.push({pathname:"/home-page/assignment-list"});
                  }else {
                     messageUtil.showError("UNKNOWN_ERROR", false);
                  }
               }else {
                  messageUtil.showError("UNKNOWN_ERROR", false);
               } 
               
            });        
            if(this.props?.session?.isEnableAiChat) {
               const fullText = this?.state?.asmCnt?.replace(/<[^>]*>/g, '');
               if(fullText) {
                  try {
                     let oReqQuiz = {
                        document: fullText,
                        id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-quiz`,
                        level: "easy",
                        num_questions: 10
                     };
   
                     let oReqFlash = {
                        document: fullText,
                        id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-flashcard`,
                        num_cards: 10
                     };
   
                     let oReqSnippet = {
                        document: fullText,
                        id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-snippets`,
                     }
                     const pageUrlQuiz = '/camu_lms/quiz';
                     const pageUrlFlash = '/camu_lms/flipcards';
                     const pageUrlSnippet = '/camu_lms/snippets';
                    
                     // For Quiz API
                     axios.post(pageUrlQuiz, oReqQuiz);
                     // For FlashCard API
                     axios.post(pageUrlFlash, oReqFlash);
                     // For Snippets API
                     axios.post(pageUrlSnippet, oReqSnippet);
   
                  } catch (error) {
                     console.error(error);
                  }
               }
            }
         }else{
            console.log("NO_REQUEST_FOUND");
         }
      } else {
         this.validator.showMessages();
         // Scroll down the error message
         if(this.state.asmCtg === "" &&  this.errMsgGrdRef.current){
            this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(this.state.grdCnf === "" &&  this.errMsgGrdRef.current){
            this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(this.state.grdSys === "" &&  this.errMsgGrdRef.current){
            this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(this.state.mxMrk === "" &&  this.errMsgGrdRef.current){
            this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
            return;
         }
         if(this.state.asDuDt === "" && this.errMsgDueRef.current){
            this.errMsgDueRef.current.scrollIntoView({behavior:"smooth"});
            return;
         }
      }
   }
   
   contentChange=(value)=> {
      this.setState({ asmCnt: value })
   }
   
   // Deactivate Assignment students by student and content id
   deactiveAssgnmntStudById=(student)=>{
      if(values && values.id && values.id.length){
         const oStuReq={
            studId:student.studId,
            cntId:values.id
         }
         HTTPService.post('/lms-asgnmnt/deactivate_assgmnt_stud_by_id',oStuReq,null,(err,data)=>{
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_STUDENTS_FOUND"){
               messageUtil.showInfo("ASNMNT_STUDS_NOT_FOUND", true);
            }else if(data.output.data && data.output.data.code && data.output.data.code === "DELETED_SUCCESSFULLY"){
               this.state.assgnmtSlctStuds.forEach((studs,index)=>{
                  if(studs.studId===student.studId){
                     studs.StFl='D';
                  }
               })
               this.setState({assgnmtSlctStuds:this.state.assgnmtSlctStuds});
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         });
      }else{
         this.state.assgnmtSlctStuds.filter((studs,index)=>{
            if(studs.studId===student.studId){
               this.state.assgnmtSlctStuds.splice(index,1);
            }
            return this.state.assgnmtSlctStuds;
         })
         this.setState({assgnmtSlctStuds:this.state.assgnmtSlctStuds});
      }
   }
   searchChange=(event)=>{
     this.setState({...this.state,value:event.target.value});
   }
   // url input handler
    urlChange=(event)=>{
     let valid = isValidURL(event.target.value)
     this.setState({ ...this.state, link: event.target.value });
     this.setState({ urlvalid: valid });
     this.props.removeImg();
     }
     fileUploadChange = (event)=>{
     this.setState({  link:''})
     }
     googleFileUploadChange = (event)=>{
     this.setState({  link:''})
     }
     fileDropUploadChange = (event) => {
      this.setState({  link:''})
   }
   asignMntCategoryChange=(event)=>{
      
     this.setState({...this.state,asmCtg:event.target.value});
   }

   // Set grade config
   gradeConfChange = (event) => {
      this.setState({...this.state, grdCnf : event.target.value, ntInFn : (event.target.value === 'GRD' ? false : this.state.ntInFn)});
   }

   // set grading system
   gradSysChange = (event) => {
      this.setState({...this.state, grdSys : event.target.value});
   }

   groupChange = (event) => {
      this.setState({...this.state, grpIds: event});
   }
   // Changes rubrics
   rubricsHandler = (event) => {
      if(event.target.checked){
         this.setState({isRubSel:false});
      }else{
         this.setState({isRubSel:true});
         this.props.updateFields('oAsgnRubrc', {});

      }
   }

   // Change grade config
   gradeCnfgHandler = (event) => {
      if(event.target.checked){
         this.setState({ntInFn:true});
      }else{
         this.setState({ntInFn:false});
      }
   }

   specficStudentHandler=()=>{ 
      this.getAssignmentStudDetails();
      setTimeout(() => {
         console.log('event.target.checked && !this.state.studsSubmitted', !this.state.studsSubmitted)
      if(!this.state.studsSubmitted){
         const chngDta = this.state.assgnMntStuds.map((stud) => ({ ...stud, checked: false }));
         this.setState({isAlStu:false, isGroup: false, assgnmtSlctStuds:[], assgnMntStuds: chngDta, grpIds: []});
      }
   },400)
      // else{
      //    this.setState({...this.state,assgnmtSlctStuds:[],isAlStu:true});
      // }
   }
   
   everyStudentHandler = () => {
      this.getAssignmentStudDetails();
      setTimeout(() => {
         if(!this.state.studsSubmitted){
            this.setState({...this.state,isAlStu:true, assgnmtSlctStuds:[], isGroup: false, grpIds: []});
         }
      },400)
   }

   groupStudentHandler =  () => {
      this.getAssignmentStudDetails();
      setTimeout(() => {
      if(!this.state.studsSubmitted){
         this.setState({...this.state,isAlStu:false, assgnmtSlctStuds:[], isGroup: true});
      }
   },400)
   }

   // To get the assignment students 
   getTheAssgnmntStuds=()=>{
      if(this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
         const oReq={
            "SecID":this.props.location.state.SecID,
            "AcYr": this.props.location.state.AcYr,
            "InId":  this.props.location.state.InId,
            "DeptID": this.props.location.state.DeptID,
            "PrID": this.props.location.state.PrID,
            "CrID": this.props.location.state.CrID,
            "SemID": this.props.location.state.SemID,
            "SubID": this.props.location.state.subId,
            "getStuds": true,
            "OID": this.props.location.state.InId,
            "StaffID":  this.props.location.state.StaffId,
            "isFE": this.props.session.fe
         }
         HTTPService.post('/stuHWassignment',oReq,null,(err,data)=>{
            if(data && data.output && data.output.data && data.output.data.students && data.output.data.students.length>0){
               this.setState({assgnMntStuds:data.output.data.students});
            }else if(data && data.output && data.output.data && data.output.data.message){
               this.setState({assgnMntStuds:[]});
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
         
         });
         //Initially set empty assignment students
         this.props.getSpcAssignMntStudnts([]);
      }else{
         console.log("NO_REQUEST_FOUND");
      }

   }
   //Get the assignment students from student search
   componentWillReceiveProps(NextToProps){
      //Get the assignment selected students from the dispatched students
      if(NextToProps.assignMntStuds && NextToProps.assignMntStuds.length>0 ){
         this.setState({assgnmtSlctStuds:NextToProps.assignMntStuds})
      }
   }



   // componentDidUpdate(prevProps) {
   //    if (this.props.aStudents !== prevProps.aStudents) {
   //      const hasSubmitted = this.props.aStudents?.some((stud) => stud?.aSts === 'SUB');
   //      if (this.state.studsSubmitted !== hasSubmitted) {
   //        this.setState({ studsSubmitted: hasSubmitted });
   //      }
   //    }
   //  }
   
   componentDidUpdate(prevProps) {
      // Update studsSubmitted state if aStudents prop has changed
      if (this.props.aStudents !== prevProps.aStudents) {
        const hasSubmitted = this.props.aStudents?.some((stud) => stud?.aSts === 'SUB');
         this.setState({ studsSubmitted: hasSubmitted });
        
      }
  
      // Update partGroups state if participantGroups prop has changed
      if (this.props.participantGroups !== prevProps.participantGroups) {
        if (this.props.participantGroups && this.props.participantGroups.length) {
          const updatedGroups = this.props.participantGroups.filter((grp) => grp?.students?.length).map((grp) => ({
            ...grp,
            grpNmCt: `${grp?.groupName} (${grp?.students?.length})`,
          }));
          this.setState({ partGroups: updatedGroups });
        }
      }
    }

   // Discard changes for create and edit 
   discardChanges = () => {
      // If you press back icon to navigate when you click discard
      this.setState({...this.state,isNavi:true},()=>{
         if (this.state.isNavi) {
            this.props.history.go(-1);
         }
      });
      this.setState({ disCardModal: false });
   }

   // Lock until handler
   availableDateHandler=(event)=>{
      this.setState({...this.state,avlChk:event.target.checked});
      if(event.target.checked && !this.state.asAvPr && this.state.asAvPr === ''){
         this.setState({asAvPr: new Date()});
      }else{
         this.setState({asAvPr:''});
      }
   }

  // For remove file in attachments
   removeFile = (index) => {
      let attachmentsCpy = [...this.props.attachments];
      attachmentsCpy.splice(index, 1);
      this.props.updateFiles('attachments', attachmentsCpy);
   }
   removeFileLink = () => {
      this.setState({ ...this.state, fileTy: "" , link: ""});
   }
   // Calculate the rubrics points
   calcRubricsPoints = (oRub) => {
      if(oRub){
         let oAsgnRubrc = {};
         oAsgnRubrc._id = oRub._id;
         oAsgnRubrc.title = oRub.title;
         if(oRub.aCrtrn && oRub.aCrtrn.length){
            oAsgnRubrc.totPnt = 0;
            oAsgnRubrc.crtCnt = 0
            for(let crt = oRub.aCrtrn.length - 1; crt >= 0; crt--){
               oAsgnRubrc.crtCnt += 1;
               if(oRub.aCrtrn[crt].aRtngs && oRub.aCrtrn[crt].aRtngs.length){
                  let maxPnt = 0;
                  for(let rt = oRub.aCrtrn[crt].aRtngs.length - 1; rt >= 0; rt--){
                        // Set maximum point in ratings
                        if(oRub.aCrtrn[crt].isRang){
                           if(oRub.aCrtrn[crt].aRtngs[rt].max>maxPnt){
                               maxPnt=oRub.aCrtrn[crt].aRtngs[rt].max;
                           }
                        }else {
                              if(oRub.aCrtrn[crt].aRtngs[rt].rtPnt>maxPnt){
                                 maxPnt=oRub.aCrtrn[crt].aRtngs[rt].rtPnt;
                              }
                        }
                   }
                  oAsgnRubrc.totPnt += maxPnt;
               }
            }
            this.props.updateFields('oAsgnRubrc', oAsgnRubrc);
         }
         this.getRubrics('frmCal');
      }
   }

   // Back from rubrics edit
   backToassgnmnt = (oRub) => {
      this.setState({shwEdtCompMod : false});
      // Update the new rubrics in edit assignment
      this.calcRubricsPoints(oRub);
   }

   // Back from new rubrics modal
   navFrmNewRubrcs = (oRub) => {
      this.setState({shwNwRbrcsMod : false});
      // Update the new rubrics in edit assignment
      this.calcRubricsPoints(oRub);
   }

   // Launch the new rubrics from modal
   launchNewRubric = () => {
      this.setState({shwNwRbrcsMod : true});
   }
   // Edit rubrics icon
   editRubric = () => {
      this.getRubrics('frmCal', true);
   }
 // Edit rubric model
   editRbModel = (isEditRb) => {
      if (isEditRb) {  // Duplicate rubric
         this.setState({ shwEdtRbMdl: true })
      } else {
         this.prcdEditRubrc();
      }
   }
   //get selected student details
   getSelectedStudents = () => {
      this.setState({ ...this.state, value: "" });
      $('#studentList-model').modal('hide');
      this.props.getSpcAssignMntStudnts(this.state.assgnMntStuds);
   }

   linkAttach = (evant)=>{
      this.setState({ ...this.state, fileTy: "LNK" });
   }

   handleFileSelect = (file) => {
      const index = this.props.attachments?.findIndex(fl => fl._id === file._id);
      if (index === -1) {
         this.props.updateFiles('attachments', this.props.attachments?.concat([{ ...file, name: file.fileNm, url: file.url, fileTy: file.type }]))
      }      
   }

    render() {
      this.validator.purgeFields();
      return (
<div>
   <div className="edit-module_container">
      <div className="edit-module_header">
         <div className="row m-0">
            <div className="col-6 p-0">
               <div className="page-input_title">
                  <div className="page-title_icon" onClick={()=> this.setState({...this.state,disCardModal:true ,isNavi:true})}>
                     <ArrowLeft className="svg-icon_default icon-dark icon-pointer"/>
                  </div>
                  <div className="page-input_details">
                     <label for="fname" className="form-lable"> <span className="mandatory-field">* </span> {this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_Assignment_title")}</label> 
                     <InputBox className="input-block" placeholder="Assignment title" name="Last Name" 
                        value={this.state.title} onChange={(event) =>
                     this.setState({ ...this.state, title: event.target.value })}
                     />
                     {this.validator.message('title', this.state.title, 'required|string',{ className: 'text-empty_content'})}
                  </div>
               </div>
            </div>
            <div className="col-6 p-0">
               <div className="publish-btn">
                     {/* <p className="published-view_label">
                     {this.state.vSts === 'D' ?
                        this.props.t("translate:UNPUBLISHED_LABEL")
                     :
                        this.props.t("translate:PUBLISHED_LABEL")
                     } 
                     </p> */}
                               <div>
                                 {this.state.vSts === 'D'?
                                <p className="unpublished-view_label" >{this.props.t("translate:UNPUBLISHED_LABEL")}</p>
                                :
                                 <p className="published-view_label" >{this.props.t("translate:PUBLISHED_LABEL")}</p>
                                 }
                                </div>
                     
                  <UIPerWrapper perCode={["rp_can_pub_lms_content"]}><div className="save-publish_btn">
                     <Button theme="btn-rounded secondary-btn btn-outline" clicked={() => this.addSubChapterAssignment(true,"F")}> {this.props.t("translate:SAVE_&_PUBLISH")}</Button>
                  </div></UIPerWrapper>
                  <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div className="save-page_btn"> 
                     <Button theme="btn-rounded default" clicked={() => this.addSubChapterAssignment(false,"D")}> {this.props.t("translate:SAVE")}</Button>
                  </div></UIPerWrapper>
                  <div className="option-mode_content">
                  <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                  <i class="views-option">
                     <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                  </i>
                  </div>
                  <div class="dropdown-menu edit-chapter_cont">
                    <div class="dropdown-item user-info_contents"  onClick={()=>this.setState({...this.state,disCardModal:true})}>
                        <X className="svg-icon_light  icon-default" />
                        <span className="option-list_dropdown">{this.props.t("translate:DISCARD")}</span>
                     </div>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <div className="text-editor">
         <p className="edit-box_heading">{this.props.t("translate:INFOCONTENT_DESCRIPTION")}</p>
         <LmsEditor  placeholder={"Enter description"}
         value={this.state.asmCnt} onChange={this.contentChange}
         />
      </div>
      <div className="assignment-upload_content">
         <div class="row m-0">
            <div class="col-4 p-0">
               <p class="uploaded-files">{this.props.t("translate:UPLOAD_FILE")}</p>
               <p className="upload-file_contend">{this.props.t("translate:MAXIMUM_FILES_UPLOAD_ASSGN_CNT")}</p>
            </div>
            {/*  */}
            
            <div class="col-8 p-0">
               <div class="file-upload_box">
                  <div class="file-upload">
                     {/*<LmsFileUploader onChange={()=> this.fileUploadChange()} multiple={true}>*/}
                        <div class="row m-0">
                           <div class="col-8 p-0">
                              <LmsFileUploader onChange={()=> this.fileUploadChange()} onDropChange={()=> this.fileDropUploadChange()} multiple={true}>
                                 <p class="drag-files"> {this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_DRAG_FILE")}</p>
                              </LmsFileUploader>
                           </div>  
                           <div class="col-4 p-0">
                              <div class="assignment-choosebtn">
                                 <span class="option-file">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_OR")}</span>
                                 <LmsFileUploader multiple={true} urlValue={this.state.link} urlChange={(event)=>this.urlChange(event)} urlValid={this.state.urlvalid} 
                                    onBrowseFile={() => this.props.getUploadedScormFiles({ ...this.props, fileType: 'OTH' })}
                                    linkAttach={()=>this.linkAttach()} onFileChange={()=> this.fileUploadChange()} btnEnable={true} onGogleFileChng={()=> this.googleFileUploadChange()}>
                                 </LmsFileUploader>
                              </div>
                           </div>
                        </div>
                     {/* </LmsFileUploader> */}
                  </div>
                  {this.props.attachments && this.props.attachments.length > 0 && this.props.attachments.map((oAttech, index) => {
                     return (
                        <div class="assignment-filename">
                           <div class="files-name uploaded-files_name">
                              { (oAttech && !oAttech.link) &&
                                 <div>
                                    {(oAttech && oAttech.name) && (oAttech.name.split('.')[1] === 'png' || oAttech.name.split('.')[1] === 'jpeg ' || oAttech.name.split('.')[1] === 'jpg' || oAttech.name.split('.')[1] === 'gif') ?
                                       <Image className='svg-icon_small icon-dark' />
                                       :
                                       <PdfFile iconStyle="svg-icon_small" />
                                    }
                                 </div>
                              }
                              <div class="file-select_name">
                                 <a href={oAttech.url} target="_blank">
                                    <span class="file-option">{oAttech.name}</span>
                                 </a>
                                 {oAttech.fileTy && oAttech.fileTy==="LOCL" &&
                                    <p class="file-select_path">{this.props.t("translate:COMPUTER")}</p>
                                 }
                                 {oAttech.fileTy && oAttech.fileTy==="GD" &&
                                    <p class="file-select_path">{this.props.t("translate:GOOGLE_DRIVE")}</p>
                                 }
                              </div>
                           </div>
                           {oAttech.percentageLoaded && oAttech.percentageLoaded !== 100 ?
                              <FileLoader value={oAttech.percentageLoaded}></FileLoader>
                              :
                              <div className="more-options" >
                                 {/* <p className="reload-content">Failed to upload <Reloader iconStyle="svg-icon_small icon-space_right"/></p> */}
                                 {/* <FileLoader /> */}
                                 <div class="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <MoreInfo iconStyle="svg-icon_small icon-pointer icon-default" />
                                 </div>
                                 <div class="dropdown-menu img-edit_option">
                                    <div class="dropdown-item user-info_contents" onClick={() => this.removeFile(index)}>
                                       <Trash iconStyle="svg-icon_extra-small icon-default" />

                                       <span className="option-list_dropdown">   {this.props.t("translate:REMOVE")}</span>
                                    </div>
                                 </div>
                              </div>}
                        </div>
                     )
                  })}
                  {this.state.fileTy && this.state.fileTy==="LNK" && this.state.link &&
                     <div class="assignment-filename">
                        <div class="files-name uploaded-files_name">
                           <Link2 className="svg-icon_small icon-default" />
                           <div class="file-select_name">
                              <a href={this.state.link} target="_blank">
                                 <span class="file-option">{this.state.link}</span>
                              </a>
                              <p class="file-select_path">{this.props.t("translate:LINK")}</p>
                           </div>
                        </div>
                        <div className="more-options">
                           <div class="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                              <MoreInfo iconStyle="svg-icon_small icon-pointer" />
                           </div>
                           <div class="dropdown-menu img-edit_option">
                              <div class="dropdown-item user-info_contents" onClick={() => this.removeFileLink()}>
                                 <Trash iconStyle="svg-icon_extra-small icon-default" />

                                 <span className="option-list_dropdown">   {this.props.t("translate:REMOVE")}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  }
               </div>
            </div>
         </div>
      </div>
      <div className="grade-update">
         <div class="row m-0">
            <div class="col-4 p-0">
               <p class="uploaded-files">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_GRADING_SUBMISSION")}</p>
               <p className="upload-file_contend">{this.props.t("translate:SETTING_TO_MEET_ASSGN_CNT")}</p>
            </div>
            <div class="col-8 p-0">
               <div ref={this.errMsgGrdRef}></div>
               <div class="grade-uploader">
                  <div class="grade-filename">
                     <div class="files-name">
                        <p class="grade-option"><span className="mandatory-field">* </span>{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_GRADE_CATEGORY")}</p>
                     </div>
                     <div class="files-option">
                        <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={this.state.asmCtg} defaultDisabled={false} onChange={this.asignMntCategoryChange} 
                           dropDown={this.state.aCategory} keyTag="code" nameTag="text"/>
                     </div>
                  </div>
                  {this.validator.message('grade category', this.state.asmCtg, 'required|string',{ className: 'text-empty_content' })}
               </div>
               <div class="grade-uploader">
                  <div class="grade-filename">
                     <div class="files-name">
                        <p class="grade-option"><span className="mandatory-field">* </span>{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_GRADE_USING")}</p>
                     </div>
                     <div class="files-option">
                        <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={this.state.grdCnf} defaultDisabled={(values && values.id) ? true : false} onChange={this.gradeConfChange} 
                           dropDown={this.state.aGradConf} keyTag="code" nameTag="text"/>
                     </div>
                  </div>
                  {this.validator.message('grade using', this.state.grdCnf, 'required|string',{ className: 'text-empty_content'})}
               </div>
               <div class="grade-uploader" style = {{ display : (this.state.grdCnf === "POINT") ? 'none' : 'block'}}>
                  <div class="grade-filename">
                     <div class="files-name">
                        <p class="grade-option"><span className="mandatory-field">* </span>{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_GRADE_SYSTEM")}</p>
                     </div>
                     <div class="files-option">
                        <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={this.state.grdSys} defaultDisabled={false} onChange={this.gradSysChange}
                           dropDown={this.state.aGradeSys} keyTag="_id" nameTag="GrdSysNm" isDeflt/>
                     </div>
                  </div>
                  {this.state.grdCnf === "GRD" && this.validator.message('grade system', this.state.grdSys, 'required|string',{ className: 'text-empty_content'})}
               </div>
               {/* <div class="grade-uploader" style = {{ display : (this.state.grdCnf == "POINT") ? 'block' : 'none'}}>
                  <div class="grade-filename">
                     <div class="files-name">
                        <p class="grade-option">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_MINIMUM_MARK")}</p>
                     </div>
                     <div class="files-option">
                        <InputBox className="input-default " placeholder="Minimum mark" name="Minimum Mark" value={this.state.mnMrk} onChange={(event) =>
                        this.setState({ ...this.state, mnMrk: event.target.value })}></InputBox>
                     </div>
                  </div>
               </div> */}
               <div class="grade-uploader">
                  <div class="grade-filename">
                     <div class="files-name">
                        <p class="grade-option"><span className="mandatory-field">* </span>{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_MAXIMUM_MARK")}</p>
                     </div>
                     <div class="files-option">
                        <InputBox className="input-default " placeholder="Maximum mark" name="Maximum Mark" value={this.state.mxMrk} onChange={(event) =>
                        this.setState({ ...this.state, mxMrk: event.target.value })}></InputBox>
                     </div>
                  </div>
                  {this.state.shwTotPntErr && <p className="empty-rubrics_input">Points possible must be equal to rubrics total</p>}
                  {this.validator.message('maximum mark', this.state.mxMrk, 'required|numeric',{ className: 'empty-rubrics_input' })}
               </div>
               <div class="grade-uploader">
                  <div className="due-date" >
                     <div className="due-info">
                        <p className="due__name">{this.props.t("translate:OVERALL_GRADE_CONFIG_IN_ASSGNMENT")}</p>
                        <p className="due__details">{this.props.t("translate:OVERALL_GRADE_CONFIG_INFO_ASSGNMENT")}</p>
                     </div>
                     <span className={(this.state.grdCnf === "GRD") ? "tooltip--ovrall_grade" : ""} data-tooltip={this.props.t("translate:OVERALL_GRADE_LETTER_INFO")}>
                        <CheckBox className="check-box" onChange={(event)=> this.gradeCnfgHandler(event)} checked={this.state.ntInFn} defaultDisabled = {(this.state.grdCnf === "GRD") ? true : false}/>
                     </span>
                  </div>
               </div>
               <div class="grade-uploader">
                  <div className="due-date" >
                     <div className="due-info">
                        <p className="due__name">{this.props.t("translate:RUBRICS")}</p>
                        <p className="due__details">{this.props.t("translate:RUBRICS_CONTENT")}</p>
                     </div>
                     <CheckBox className="check-box" onChange={(event)=>
                     this.rubricsHandler(event)} checked={!this.state.isRubSel}/>
                  </div>
                  {!this.state.isRubSel && 
                     <div>
                        {this.props.oAsgnRubrc && !_.isEmpty(this.props.oAsgnRubrc) ?
                        <div className="attached-rubrics_box">
                        <div className="attached-rubrics-list">
                           <div className="attached-rubrics-name">
                              <p className="rubrics-head_label" onClick={()=>this.setState({rubricsId : this.props.oAsgnRubrc._id, rubricsTitle : this.props.oAsgnRubrc.title, isRubricsModal : true,})}>{this.props.oAsgnRubrc.title}</p>
                              <p className="rubrics-sub_label">{this.props.oAsgnRubrc.crtCnt} {this.props.t("translate:CRITERIA")} {this.props.oAsgnRubrc.totPnt} {this.props.t("translate:POINTS_POSSIBLE")}</p>
                           </div>
                           <div className="attached-rubrics_editor">
                           <UIPerWrapper perCode={["can_create/edit_rubrics"]}>
                           {!this.state.studsSubmitted && (
                           <Edit2 className="svg-icon_small icon-dark icon-pointer right-icon" onClick = { () => this.editRubric()}/>
                           )}
                           </UIPerWrapper>
                           {!this.state.studsSubmitted && (
                           <Trash2 className="svg-icon_small icon-dark icon-pointer " onClick = {() => this.delRubric()}/>
                           )}
                       </div>
                        </div>
                        </div>
                        :
                        <div className="specific-student">
                           <div className="student-lists">
                              <div className="no-student">
                                 <p className="student-notfound">
                                    <span>
                                       <Info className="svg-icon_small icon-primary" />
                                    </span>
                                    {this.props.t("translate:NO_RUBRIC_ADDED")}
                                 </p>
                              </div>
                           </div>
                           <UIPerWrapper perCode={["can_create/edit_rubrics"]}>
                           <div className="add-students" onClick={ () => this.launchNewRubric()}>
                              <p className="student-add">
                                 <span>
                                    <Plus className="svg-icon_small icon-primary" />
                                 </span>
                                 {this.props.t("translate:ADD_RUBRICS")}
                              </p>
                           </div>
                           </UIPerWrapper>
                           <div className="add-students" data-toggle="modal" data-target="#rubricsModal-page" onClick={()=>this.getRubrics()}>
                              <p className="student-add">
                                 <span>
                                    <Search className="svg-icon_small icon-primary" />
                                 </span>
                                 {this.props.t("translate:FIND_RUBRICS")}
                              </p>
                           </div>
                        </div>
                     }
                        {/* <div className="no-student">
                           <p className="student-notfound">
                              <span>
                                 <Info className="svg-icon_small icon-primary" />
                              </span>
                              {this.props.t("translate:NO_RUBRIC_FOUND")}
                           </p>
                        </div> */}
                     </div>
                  }
               </div>
            </div>
         </div>
      </div>
      <div className="grade-update">
         <div class="row m-0">
            <div class="col-4 p-0">
               <p class="uploaded-files">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_DETAILS_INFORMATION")}</p>
               <p className="upload-file_contend">{this.props.t("translate:RULES_ACTIVITY_ASSGN_CNT")}</p>
            </div>
            <div class="col-8 p-0">
             <div ref={this.errMsgDueRef}></div>
               <div class="grade-uploader">
                  <div className="due-date">
                     <div className="due-info">
                        <p className="due__name"><span className="mandatory-field">* </span>{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_DUE_DATE")}</p>
                        <p className="due__details">{this.props.t("translate:DUE_DATE_LEARNERS_ASSGN_CNT")}</p>
                     </div>
                     {/* <CheckBox className="check-box" checked={this.state.dueChk} onChange={(event)=>this.dueDateChkHandler(event)}/> */}
                  </div>
                  <div className="duration-time">
                     <div className="date-picker_cont">
                     {/* <ReactDatePicker  datePickerTheme="date-picker calendar_icon" dateFrmt = "dd-MMM-yyyy    h:mm aa" showTimeInput={true}  selected={this.state.asDuDt} onChange={(event)=>{ */}
                    <ReactDatePicker closeOnSelect={true}  className="date-picker calendar_icon" closeOnSelect dateFormat="DD-MMM-YYYY" inputProps={{placeholder:"DD-MMM-YYYY"}}  value={this.state.asDuDt} onChange={(event)=>{
                     //this.setState({asDuDt:event})
                     if(event){
                        this.setState({asDuDt:event})
                     }else{
                        this.setState({asDuDt:new Date()})
                     } 
                  }}/>
                  
                     {this.validator.message('due date', this.state.asDuDt, 'required',{ className: 'text-empty_content' })}
                     </div>
                     {/* <div  className="time-picker_cont">
                     <ReactTimePicker timeFrmt = "h:mm aa" showTime="showTimeInput"  timePickerTheme="time-picker time_icon" />
                     </div> */}
                  </div>

               </div>
               <div class="grade-uploader">
                  <div className="due-date">
                     <div className="due-info">
                        <p className="due__name">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_LATE_SUBMISSION")}</p>
                        <p className="due__details">{this.props.t("translate:LEARNERS_SUBMIT_DUE_DATE_ASSGN_CNT")}</p>
                     </div>
                     <CheckBox className="check-box" onChange={event =>
                     this.setState({ isLtSu: event.target.checked })} checked={this.state.isLtSu} />
                  </div>
               </div>
               <div class="grade-uploader">
                  <div className="due-date">
                     <div className="due-info">
                        <p className="due__name">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_AVAILABLE_PERIOD")}</p>
                        <p className="due__details">{this.props.t("translate:SET_UP_A_DATE_FROM_WHEN_STUDENTS_CAN_ACCESS_THIS_ACTIVITY")}</p>
                     </div>
                     <CheckBox className="check-box" onChange={event => this.availableDateHandler(event)} checked={this.state.avlChk}/>
                  </div>
                  {this.state.avlChk &&
                     <div className="duration-time">
                        {/* <ReactDatePicker  type='date'  datePickerTheme="date-picker calendar_icon" dateFrmt= "MM-dd-yyyy h:mm aa" showTimeInput={true} value={this.state.asAvPr} onChange={(event)=>{ */}
                       <ReactDatePicker closeOnSelect={true}  type='date'  className="date-picker calendar_icon" dateFormat="DD-MMM-YYYY"   value={this.state.asAvPr} onChange={(event)=>{
                           //this.setState({asAvPr:event})
                           if(event){
                              this.setState({asAvPr:event})
                           }else{
                              this.setState({asAvPr:new Date()})
                           } 
                        }}/>
                     </div>
                  } 
               </div>
               <div class="grade-uploader">
                  <div className="due-date" >
                     <div className="due-info">
                        <p className="due__name">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_ASSIGN_STUDENTS")}</p>
                        {/* <p className="due__details">{this.props.t("translate:SPECIFIC_GROUP_STU_ASSGN_CNT")}</p> */}
                     </div>
                     {/* <CheckBox className="check-box" onChange={(event)=>
                     this.specficStudentHandler(event)} checked={!this.state.isAlStu}/> */}
                     
                  </div>
                  {this.state.studsSubmitted 
                  ?
                  <div className="d-flex flex-row students_submitted_container my-2 p-1">
                   <AlertCircle className="svg-icon_small icon-primary" />
                     <label for="fname" className="form-lable ml-1">
                       {this.props.t("translate:ASSIGNMENT_VIEW_STUDENTS_SUBMITTED_ALREADY")}
                     </label>
                  </div>
                  :""
                  }
                  <div className='d-flex'>
                         <RadioButton defaultDisabled={this.state.studsSubmitted} className="mr-2" onChange={(e) => this.everyStudentHandler(e)} checked={this.state.isAlStu}  /> <span className="due__details">Everyone</span>
                  </div>
                  <div className='d-flex'>
                     <RadioButton defaultDisabled={this.state.studsSubmitted} className="mr-2" onChange={(event)=> this.specficStudentHandler()} 
                     checked={!this.state.isAlStu && !this.state.isGroup}  /> <span className="due__details"> Specific</span>
                  </div>
                  <div className='d-flex'>
                         <RadioButton defaultDisabled={this.state.studsSubmitted} className="mr-2" checked={this.state.isGroup}  onChange={(event)=> this.groupStudentHandler(event)}   /> <span className="due__details">Groups</span>
                  </div>
                  {
                  (this.state.assgnMntStuds && this.state.assgnMntStuds.length>0 ?
                  (
                  <div className="specific-student">
                     <div className="student-lists">
                        {this.state.assgnmtSlctStuds && this.state.assgnmtSlctStuds.length>0 && !this.state.isGroup ? 
                        (
                        this.state.assgnmtSlctStuds.map((stud)=>{
                        return(
                        <div>
                           {stud.StFl==='A' ?
                           (
                           <div className="student-model">
                              <div className="assign-students">
                                 <div className="student-img">
                                    {stud && stud.PhotoImgID ?<img src={'/Image/getImage/' + stud.PhotoImgID} className="stud-list_img" alt="img"/>:<StudentNameComponent className="student-name_icon" fName={stud.FNa.substring(0, 1)} clrCode={generateHexDecCode(stud.studId)}/>}
                                 </div>
                                 <div className="student-details">
                                    <p className="stud-name">{stud.FNa} {stud.LNa}</p>
                                    <p className="stud-id">{stud.AplnNum}</p>
                                 </div>
                              </div>
                              <div className="remove-students" onClick={()=>
                                 this.deactiveAssgnmntStudById(stud)}>
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
                        ): !this.state.isAlStu && !this.state.isGroup ?
                        (
                        <div className="no-student">
                           <p className="student-notfound">
                              <span>
                                 <Info className="svg-icon_small icon-primary" />
                              </span>
                              {this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_NO_STUDENTS")}
                           </p>
                        </div>
                        ): !this.state.isAlStu && this.state.isGroup && this.state.partGroups && this.state.partGroups.length ? 
                        <Select disabled={this.state.studsSubmitted} className="dropdown-border drop-down_arrow" defaultValue={this.state.grpIds} onChange={this.groupChange}
                           data={this.state.partGroups} tag="_id" name="grpNmCt" isMulti={true} /> 
                           :
                           !this.state.isAlStu && this.state.isGroup && !this.state.partGroups.length ?
                           <div className="d-flex flex-row students_submitted_container my-2 p-1">
                             <AlertCircle className="svg-icon_small icon-primary" />
                             <label for="fname" className="form-lable ml-1">
                               {/* {this.props.t("translate:ASSIGNMENT_VIEW_NO_GROUPS_FOUND")} */}
                               You don’t have any groups to select go to <span onClick={() => this.props.history.push({pathname:"/home-page/participants-list", state:this.props.location.state})} className='group-info-label-link'>participants</span> to create a group
                             </label>
                          </div>
                          :''
                        }
                     </div>
                     {!this.state.isAlStu && !this.state.isGroup &&
                     <div className="add-students" data-toggle="modal" data-target="#studentList-model">
                        <p className="student-add">
                           <span>
                              <Plus className="svg-icon_small icon-primary" />
                           </span>
                           {this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_ADD_STUDENTS")}
                        </p>
                     </div>}
                  </div>
                  )
                  :
                  (
                  <div className="no-student">
                     <p className="student-notfound">
                        <span>
                           <Info className="svg-icon_small icon-primary" />
                        </span>
                        {this.props.t("translate:ASNMNT_STUDS_NOT_FOUND")}
                     </p>
                  </div>
                  )
                  )}
               </div>
               <div class="grade-uploader">
                     <div className="quiz-list-view">
                     <div className="due-date">
                        <div className="due-info">
                        <p className="due__name">{this.props.t("translate:ALLOW_CONVERSATION")}</p>
                           {/* <p className="quiz-sub_list">Lorem ipsum dolor sit amet, consectetur adipiscing.</p> */}
                        </div>
                        <CheckBox className="check-box" onChange={(event)=>this.setState({...this.state,isAlCn:event.target.checked})} checked={this.state.isAlCn}/> 
                     </div>
                     </div>
                  </div>
                  {UserSession.isGotPerm(["rp_lms_lti_integration"]) && (
                     <div class="grade-uploader">
                        <div className="quiz-list-view">
                        <div className="due-date">
                           <div className="due-info">
                           <p className="due__name">{this.props.t("translate:ASSIGNMENT_NEEDS_TO_BE_VALIDATED_BY_PLAGIARISM")}</p>
                           </div>
                           <CheckBox className="check-box" onChange={(event)=>this.setState({...this.state,isVlPlgm:event.target.checked})} checked={this.state.isVlPlgm}/> 
                        </div>
                        </div>
                     </div>
                  )}
               <div class="modal fade" id="studentList-model" tabindex="-1" role="dialog" aria-labelledby="studentList-model" aria-hidden="true">
                  <div class="modal-dialog md-modeldialogbox student-search_modal">
                     <div class="modal-content">
                        <div class="modal-header">
                           <p class="modal-title" id="myModalLabel">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_SELECT_STUDENTS")}</p>
                           <div class="close" data-dismiss="modal" aria-label="Close">
                              <Cross iconStyle="svg-icon_small icon-pointer" />
                           </div>
                        </div>
                        <div class="students-containers">
                           <div className="student-selects">
                              {this.state.assgnMntStuds && this.state.assgnMntStuds.length && 
                                 <StudentSearch data={this.state.assgnMntStuds} value={this.state.value} onChange={(event)=>
                                 this.searchChange(event)} clear={()=>this.setState({...this.state,value:""})} getSelectedStudents={this.getSelectedStudents}/>
                              }
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
   {/* Rubrics Modal */}
   {this.state.isRubricsModal &&  <FullViewModal open={this.state.isRubricsModal} onClose={()=>this.setState({isRubricsModal:false})} rubrcId = {this.state.rubricsId} rubTitle = {this.state.rubricsTitle} isFrAsgn = {true} center={true} isRubrics={true}/>}

   {this.state.disCardModal && <LmsModal open={this.state.disCardModal} onClose={()=>this.setState({...this.state,disCardModal:false})}   modalTitle={this.props.t("translate:DISCARD")+'?'} btnName='discard'  discardBtn={true} onClick={()=>this.discardChanges()} />}
   {/* Edit Rubrics modal */}
   {this.state.shwEdtRbMdl && <LmsModal open={this.state.shwEdtRbMdl} onClose={() => this.setState({...this.state,shwEdtRbMdl:false})} shwEdtRbMdl = {true} modalTitle={this.props.t("translate:EDIT_RUBRIC")} onClick={()=>this.prcdEditRubrc()} btnName='item'/>}
   {/* Edit Rubrics Component modal */}
   {this.state.shwEdtCompMod && <FullViewModal open={this.state.shwEdtCompMod} onClose={()=>this.setState({...this.state, shwEdtCompMod:false})}  editRubrcsCB = {this.backToassgnmnt} id = {this.props.oAsgnRubrc._id} title = {this.state.title} mxMrk = {this.state.mxMrk} shwEdtCompMod = {this.state.shwEdtCompMod} asgnId = {values.id} center={true} isRubrics={true}/>}
   {/* New Rubrics Component modal */}
   {this.state.shwNwRbrcsMod && <FullViewModal open={this.state.shwNwRbrcsMod} onClose={()=>this.setState({...this.state, shwNwRbrcsMod:false})} newRubrcCB = {this.navFrmNewRubrcs}  shwNwRbrcsMod = {this.state.shwNwRbrcsMod} center={true} isRubrics={true}/>}
      <ModelBarComponent setSelectedScorm={this.handleFileSelect} />
   </div>
      );
   }
}
 
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.fileUploadReducer,
   ...state.headerReducer,
   ...state.RubricsReducer,
   ...state.dashboardReducer,
   ...state.ParticipantReducer,
   ...state.gradeBookReducer
})
const mapDispatchToProps = {
   getSpcAssignMntStudnts,
   initializeFileUpload,
   removeImg,
   getRubrics,
   updateFields,
   updateFiles,
   getSubjByEntprsDtls,
   getAllParticipantGroups,
   getAssgnStuds,
   getUploadedScormFiles
}
const TabNavigator = (props) => <AssignmentContentComponent {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)
export default withTranslation()(withRouter(Components));
