import React, { Component, lazy} from 'react';
import '../../styles/_modelbarStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import '../../styles/_scormFile.scss';
import { Cross, Attached, Book, Columns, MoreInfo, Trash } from '../icons/Icons';
import { Link } from 'react-router-dom';
import InputBox from '../input-box/InputBox';
import RadioButton from '../radio-button/RadioButton';
import TextArea from '../text-area/TextArea';
import { connect } from 'react-redux';
import { initializeFileUpload, updateFields as updateFileUploadFields } from '../../store/actions/FileUploadAction';
import { withRouter } from 'react-router-dom';
import queryString from 'query-string';
import { getTeachContentBySubjSelection, addChapter, addSubChapter, addQuiz, updateFields } from '../../store/actions/ContentActions';
import { updateCrseSetFields } from '../../store/actions/SettingsActions';
import { getRubrics } from "../../store/actions/RubricsActions";
import { dwnldGradAsgnmnt,getAssgnStuds,dwnlAssgnmntSubmsn,uploadGradeForAsgmnt} from "../../store/actions/GradeBookActions";
// import { selectedScorm } from "../../store/actions/ScormFileAction";
import { Watch, ChevronDown, Star,File,Trash2,Package,X} from 'react-feather';
import { withTranslation } from 'react-i18next';
import { filterArray } from '../../utils/filter-util';
import _ from 'lodash';
import studLogo from '../../assets/images/Avatar.png';
import messageUtil from '../../utils/message-util';
import helper, { lmsDateFormat, lmsTimeFormat } from '../../utils/helper';
import BackDrop from '../back-drop';
import DragNUpload from '../camudragndrop';
import $ from 'jquery';
import ReactSelect from '../../components/react-select/ReactSelect';
import HTTPService from "../../utils/http-util";
import SimpleReactValidator from 'simple-react-validator';
import { getScormFile, saveScormFile ,getScormLog, editScormFiles } from '../../store/actions/ScormFileAction';
import {lmsNonUTCDateAndTimeFormat} from '../../utils/helper';
import { getSessionDtls } from '../../store/actions/HeaderAction';
import userimg from "../../assets/images/user-profile.png";
import Table from '../../components/table/Table';

const LmsFileUploader = lazy(() => import('../lms-fileuploader/LmsFileUploader'));

const UIPerWrapper = lazy(() =>
  import('../../components/ui-per-wrapper/UIPerWrapper')
);

const FullViewModal = lazy(() =>
   import("../modal/FullViewModal")
);
const Button = lazy(() =>
   import("../button/Button")
);
// const InputBox =  lazy(() =>
// import('../input-box/InputBox')
// );
// const RadioButton =  lazy(() =>
// import('../radio-button/RadioButton')
// );
const Searchbox = lazy(() =>
   import('../searchbox/Searchbox')
);
const LmsSelectDropDown = lazy(() =>
   import('../lms-selectdropdown/LmsSelectDropDown')
);
  
// let params;
let values = {};
let selcDtls = {};
let enterPriseDtls = {}, setSelectedScormFn = () => {};
class ModelBarComponent extends Component {
   constructor(props) {
      super(props);
      this.state = {
         chapterName: '',
         subChapName: '',
         modalErr: '',
         queSearch: '',
         grdSearch: '',
         selcDtls: {},
         enterPriseDtls: {},
         rbSbId: '',
         shwNwRbrcsMod: false,
         gradsUploadFil:null,
         openConfirmPost:false,
         isUploading:false,
         uploadError:null,
         aSubjects: props?.editScormFile?.subjectNms ?? [],
         curntIndex: "",
         isPub: props?.editScormFile?.isPub ?? true,
         isPubSF: props?.editScormFile?.isPub ?? true,
         entFilNm: props?.editScormFile?.eFile ? (props.editScormFile.eFile.split('.')?.[0] ?? '') : 'index',
         isDwldPm: props?.editScormFile?.isDwldPm ?? false,
         isDwldPmSF: props?.editScormFile?.isDwldPm ?? false,
         aScormTags:props?.editScormFile?.tagId ?? [],
         scormDesc: props?.editScormFile?.desc ?? '',
         scormFilter :"",
         aFilterScorm :[]
      }
      this.validator = new SimpleReactValidator({autoForceUpdate: this});

      this.otherFileColumns = [
        {
          id: 'fileNm',
          Header: 'Item',
          accessor: 'fileNm',
          size: '40%',
          Cell: ({ row }) => {
              return (
              <div className="d-flex gap-1">
                <div>
                <File className="svg-icon_light icon-default scorm-icon" />
                </div>
                <div className='text-break'>
                  <h6 >{row.original.fileName}</h6>
                  <p className="m-0">
                    <span className="scorm-subheading">{row.original.fileType?.toUpperCase()}</span>
                    {row.original.scormNms?.length ? row.original.scormNms.map((val)=>
                      <span className="scorm-sub_head">{val.tag}</span>).filter((val, ind)=>ind < 3) : <></>}
                      {row.original?.scormNms?.length > 3 ? (
                        <span
                          className="tooltip--scorm-file scorm-sub_head"
                          data-tooltip={row.original.scormNms
                            .filter((_, index) => index >=3)
                            .map((tagNm) => tagNm.tag)
                            .join("\n")}
                        >
                          {`+${row.original.scormNms.length - 3} ${props.t(
                            "translate:MORE"
                          )}`}
                        </span>
                      ) : null}
                  </p>
                </div>
              </div>
              )
          }
        },
        {
          id: 'crDt',
          Header: 'Uploaded on',
          accessor: 'CrAt',
          size: '40%',
          Cell: ({ row }) => (
            <div>
              <h6>{row.original.CrAt ? lmsDateFormat(row.original.CrAt) : "-"}</h6>
              <p className="m-0">
                <span className="sub-data"> {row.original.CrAt ? lmsTimeFormat(row.original.CrAt) : "-"}</span>
                <span className="sub-data"> {row.original.staffNm ? row.original.staffNm : "-"}</span>
              </p>
            </div>
          )
        },
        {
          id: 'size',
          Header: 'size',
          accessor: 'size',
          size: '10%',
          Cell: ({ row }) => (row?.original?.size ?? '-')
        },
        {
          id: 'action',
          Header: 'Action',
          accessor: (row) => (
            <Button theme="btn-rounded secondary-btn" clicked={() => this.selectScormBrowseFile(row)}>
              {this.props.t('translate:SELECT')}
            </Button>
          ),
          canSort: false,
          size: '10%'
        }
      ];
   }

   componentDidMount() {
      const backdropelement=document.getElementById("grade-upload-page")
      // Create a new MutationObserver
      const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const classList = mutation.target.classList;
          if (classList.contains("fade")) {
            // The "fade" class has been added, clear state variable here
            this.setState({
              ...this.state,
              openConfirmPost: false,
              gradsUploadFil: null,
              uploadError:null
            });
          }
        }
      }
  });
  // Start observing class attribute changes on the backdrop element
  observer.observe(backdropelement, { attributes: true });
      // params = new URLSearchParams(this.props.location.search);
      if (this.props.location && this.props.location.state) {
         selcDtls = {
            CrID: this.props.location.state.CrID,
            DeptID: this.props.location.state.DeptID,
            InId: this.props.location.state.InId,
            PrID: this.props.location.state.PrID,
            SemID: this.props.location.state.SemID
         }
         enterPriseDtls = {
            AcYrNm: this.props.location.state.AcYrNm,
            SemName: this.props.location.state.SemName,
            CrName: this.props.location.state.CrName,
            SecName: this.props.location.state.SecName
         }
         this.setState({ rbSbId: this.props.location.state.subId });
      }
   }

   componentDidUpdate(prevProps) {
    if (prevProps.editScormFile?.isDwldPm !== this.props.editScormFile?.isDwldPm) {
      this.setState({
        isDwldPm: this.props?.editScormFile?.isDwldPm ?? false,
        isDwldPmSF: this.props?.editScormFile?.isDwldPm ?? false,
      });
    }
    if (prevProps.editScormFile?.subjectNms !== this.props.editScormFile?.subjectNms) {
      this.setState({
        aSubjects: this.props.editScormFile.subjectNms || []
      });
    }
    if (prevProps.editScormFile?.isPub !== this.props.editScormFile?.isPub) {
      this.setState({
        isPub: this.props?.editScormFile?.isPub ?? true,
        isPubSF: this.props?.editScormFile?.isPub ?? true
      });
    }
    if (prevProps.editScormFile?.scormNms !== this.props.editScormFile?.scormNms) {
      this.setState({
        aScormTags: this.props.editScormFile.scormNms || []
      });
    }
    if (prevProps.editScormFile?.desc !== this.props.editScormFile?.desc) {
      this.setState({
        scormDesc: this.props.editScormFile.desc || ''
      });
    }
    if (prevProps.editScormFile?.eFile !== this.props.editScormFile?.eFile) {
      this.setState({
        entFilNm: (this.props.editScormFile?.eFile?.split('.')?.[0] ?? 'index')
      }); 
    }
    if (prevProps.uploadedScormFiles !== this.props.uploadedScormFiles) {
      const aFiles = this.props.uploadedScormFiles;
      aFiles.map(fl => {
        let fileType;
        const aFileNames = fl.fileNm.split('.');
        if (aFileNames.length > 1) {
          fileType = aFileNames.pop();
          fl.fileName = aFileNames.join('');
        }

        if (fileType) {
          fl.fileType = fileType;
        }

        return fl;
      })
      this.setState({
        aFilterScorm: aFiles || []
      });
    }
  }
   
   //adding the chapter
   addChapterHandler = () => {
      let oReq = {};
      oReq = {
         TPID: this.props.teachContent && this.props.teachContent[0] && this.props.teachContent[0].TPID ? this.props.teachContent[0].TPID : '',
         SubjId: this.props.teachContent[0].SubjId,
         isread: true,
         Chapter: [
            {
               ChapName: this.state.chapterName,
               SubChapter: []
            }
         ]
      }
      this.props.addChapter(oReq, this.props.teachContent[0].SubjId, this.props.session, this.props.OutCmBsdEdu, selcDtls, enterPriseDtls)
      this.setState({ ...this.state, chapterName: '' })
   }
   //handle file choosing
   fileChoose=(type,event)=>{
      if(type==="d"){
         this.setState({...this.state,gradsUploadFil:null,uploadError:null})
      }
      else{
         this.setState({...this.state,gradsUploadFil:event[0]})
      }
   }
   //adding the subchapter
   addSubChapterHandler = () => {
      let oReq = {};
      oReq = {
         TPID: this.props.teachContent[0].TPID,
         SubjId: this.props.teachContent[0].SubjId,
         chapId: values.chapId,
         SubChapter: [{
            Name: this.state.subChapName,
            ScNo: values.ScNo,
            Dur: 0
         }],
         subChapter: true
      }
      this.props.addSubChapter(oReq, this.props.teachContent[0].SubjId, this.props.session, this.props.OutCmBsdEdu, selcDtls, enterPriseDtls)
      this.setState({ ...this.state, subChapName: '' })
      this.props.history.go(-1)
   }

   // Add assesmnt
   addAssesmnt = (queIndx) => {
      if (this.props.aAsesmnts[queIndx]) {
         this.props.updateFields('oQusPaper', this.props.aAsesmnts[queIndx]);
      }
   }

   // Add rubrics in the assignment

   addRubrics = (rbIndx) => {
      if (this.props.aRubrics[rbIndx]) {
         this.props.updateFields('oAsgnRubrc', this.props.aRubrics[rbIndx]);
      }
   }

   // Add grade scheme in the settings

   addGradSys = (grdIndx) => {
      if (this.props.aGrdSystem[grdIndx]) {
         this.props.updateCrseSetFields('oGradScheme', this.props.aGrdSystem[grdIndx]);
      }
   }

   // Filter for qustion paper
   searchingHandling = (event) => {
      this.setState({ queSearch: event.target.value });
      if (event.target.value) {
         this.props.updateFields('aAsesmntsCpy', filterArray(event.target.value, this.props.aAsesmntsCpy, ['QPaperNm']))
      } else {
         this.props.updateFields('aAsesmntsCpy', this.props.aAsesmntsCpy)
      }

   }

   // Filter for grade scheme
   searchGradeScheme = (event) => {
      this.setState({ grdSearch: event.target.value });
      if (event.target.value) {
         this.props.updateCrseSetFields('aGrdSystem', filterArray(event.target.value, this.props.aGrdSystem, ['GrdSysNm']))
      } else {
         this.props.updateCrseSetFields('aGrdSystem', this.props.aGrdSysCpy)
      }

   }
   gradeUpload=(isPost)=>{
      let oLocValue = {};
      const formData = new FormData();
      oLocValue = queryString.parse(this.props.location.search);
      if (oLocValue && !oLocValue.id) {
         if (this.props.selectGradeDwnld && this.props.selectGradeDwnld.isFrmGrdList) {
            oLocValue.id = this.props.selectGradeDwnld._id;
         }
      }
      if(isPost){
         formData.append('pstMrk',isPost);
      }
      if (oLocValue && oLocValue.id) {
         formData.append('asgnId',oLocValue.id);
         formData.append('savMark',true);
         formData.append('pstFdBk',true);
       }  
       if(this.state.gradsUploadFil){
         
         formData.append('gradeUpl', this.state.gradsUploadFil);
         
       }
       this.setState({...this.state,isUploading:true})
       let modal = document.getElementById('control-modal');
         const upldCallback = (err, data) => {
          this.setState({...this.state,isUploading:false})
            if (err && err.status && err.status == 500) {
               this.setState({...this.state,openConfirmPost:false,uploadError:err.data.output.errors});
            } else {
               if (this.props.location.state && !_.isEmpty(this.props.location.state)) {
                  let oReq = {
                     "AcYr": this.props.location.state.AcYr,
                     "InId": this.props.location.state.InId,
                     "DeptID": this.props.location.state.DeptID,
                     "PrID": this.props.location.state.PrID,
                     "CrID": this.props.location.state.CrID,
                     "SemID": this.props.location.state.SemID,
                     "SecID":this.props.location.state.SecID,
                     "subId": this.props.location.state.subId,
                     "asgnmntId":oLocValue.id
                  };
                  this.props.getAssgnStuds(oReq);  
               }
               modal.click();
               this.fileChoose('d');
               this.setState({...this.state,openConfirmPost:false,uploadError:''});
               messageUtil.showSuccess("Uploaded grades", true);
            }
         };
         this.props.uploadGradeForAsgmnt(formData, upldCallback);
      }
   
   // Get the rubrics based on subject id
   getRubrics = (subId) => {
      // this.props.updateFields('oAsgnRubrc',{});
      if (this.props.location.state && !_.isEmpty(this.props.location.state)) {
         let oReq = {
            "AcYr": this.props.location.state.AcYr,
            "InId": this.props.location.state.InId,
            "DeptID": this.props.location.state.DeptID,
            "PrID": this.props.location.state.PrID,
            "CrID": this.props.location.state.CrID,
            "SemID": this.props.location.state.SemID,
            "SubID": subId,
            isFrAsgn: true,
            oProj: { title: 1, aCrtrn: 1 }
         };
         this.props.getRubrics(oReq);
      }
   }

   // Change the subject in rubrics modal

   changeStfSub = (event) => {
      this.getRubrics(event.target.value);
      this.setState({ rbSbId: event.target.value });
   }
  
   // Download grades for assignment
   dwnldGradesFrAsgnmnt = (isTmpl) => {
      let oLocValue = {};
      oLocValue = queryString.parse(this.props.location.search);
      if (oLocValue && !oLocValue.id) {
         if (this.props.selectGradeDwnld && this.props.selectGradeDwnld.isFrmGrdList) {
            oLocValue.id = this.props.selectGradeDwnld._id;
         }
      }
      if (oLocValue && oLocValue.id) {
         const oRepReq = {
            asgnId: oLocValue.id
         };
         if(isTmpl){
            oRepReq.isTmpl = isTmpl
         }
         const dwnldCallback = (err, data) => {
            if (err && err.status && err.status == 500) {
               messageUtil.showError("UNKNOWN_ERROR", false);
            } else {
               helper.dwnldExcelFileWithName(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", this.props.selectGradeDwnld.title);
               // let blob = new Blob([data], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
               // let objectUrl = URL.createObjectURL(blob);
               // window.open(objectUrl);
            }
         };
         this.props.dwnldGradAsgnmnt(oRepReq, dwnldCallback);
      } else {
         messageUtil.showWarning("NO_REQUEST_FOUND", false);
      }
   }

   // Download assignment submissions

   dwnldAssgnSubmsn = () => {
      let oLocValue = {};
      let launchAsgnData = false;
      oLocValue = queryString.parse(this.props.location.search)
      if (oLocValue && !oLocValue.id) {
         // Check grade page download req exists
         if (this.props.selectGradeDwnld && this.props.selectGradeDwnld.isFrmGrdList) {
            oLocValue.id = this.props.selectGradeDwnld._id;
            launchAsgnData = true;
         }
      }
      if (oLocValue && oLocValue.id) {
         const oRepReq = {
            asgnId: oLocValue.id
         };
         this.props.dwnlAssgnmntSubmsn(oRepReq);
         // Launch data from grade list page download
         if (launchAsgnData) {
            this.props.history.push({ pathname: '/home-page/assgnmnt-grad', search: `?id=${oLocValue.id}`, state: this.props.location.state });
         }
      } else {
         messageUtil.showWarning("NO_REQUEST_FOUND", false);
      }
   }

   // updating the selected scorm file in a state
   selectScormFile = (val) =>{
    this.props.history.location.state.scormId = val._id
    setSelectedScormFn({name : val.fileNm, url: val.url});
    $("#scorm-add").modal("hide");
   }
  
  selectScormBrowseFile = (val) => {
    setSelectedScormFn(val);
    $('#scorm-browse').modal('hide');
  }

  // Get subject list 
  getSubjectList =  (value, setOption) => {
    const oReq ={
        InId :this.props.session.InId,
        term : value
    };
    HTTPService.post('/lms/getSubjectsByInId', oReq, null, (err,data)=>{
        if(data && data.output){
        if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
            messageUtil.showInfo("NO_SUBJECT_FOUND", true);
        }else if(data.output.data && !_.isEmpty(data.output.data)){
            const outputData = data.output.data?.map((val) => {
              return { ...val, displayNm: val.SubId + "-" + val.SubNa }
            })?.filter((val) =>
              val?._id && !this.state.aSubjects?.some((subj) => subj?._id && subj._id === val._id)
            );            
            setOption(outputData)
        }else {
            messageUtil.showInfo("NO_SUBJECT_FOUND", true);
        }
        }else{
        messageUtil.showError("UNKNOWN_ERROR", false);
        } 
    })  
  }

  // if any subject is selected setting in state
  handleSubjectSearch = (selectedOption, setOptions) => {
    if(selectedOption.length> 3){
      this.getSubjectList(selectedOption, setOptions);
    } else {
      setOptions([]);
    }
  };

  // if any subject is selected setting in state
  handleSubjectSelect = (val) => {
    this.setState((prevState) => ({
      aSubjects: [...prevState.aSubjects, val[0]] 
    }));
  };

  // filtering out the selected subject
  removeSubject = (id) => {
    this.setState((prevState) => ({
      aSubjects: prevState.aSubjects.filter((val) => val._id !== id)
    }));
  };

  // function for editing and saving scorm file
  editAndSaveScormFile=()=>{
    //If all the fileds are valid then only allowed to save
    if (this.validator.allValid()) {
      const oReq = {
        scormId: this.props.editScormFile._id,
        isPub:this.state.isPub,
        subIds: this.state.aSubjects.map((val)=>val?._id).filter(Boolean),
        scormTagId: this.state.aScormTags.map((val)=>val?._id).filter(Boolean),
        scormDesc:this.state.scormDesc,
        isDwldPm: this.state.isDwldPm,
        eFile: this.state?.entFilNm
      };
      this.props.saveScormFile(oReq, () => {
        $("#scorm-manage").modal("hide");
        this.resetSingleFileValues();
        this.props.getScormFile();
      });
    } else{
      this.validator.showMessages();
    }
    
  }

  // In case a tag is searched 
  handleTagSearch =(value, setOption)=>{
    if(value.length> 3){
      const oReq ={
        InId :this.props.session.InId,
        tagNm : value
        }
      HTTPService.post('/lms/get-scorm-tag', oReq, null, (err,data)=>{
        if(data && data.output){
          if(data.output.errors && data.output.errors.code && data.output.errors.code){
              setOption([{tag:this.props.t("translate:CREATE_TAG")+":"+" "+value}])
          }else if(data.output.data && !_.isEmpty(data.output.data)){
            const outputData = data.output.data?.filter((val) =>
                val?._id && !this.state.aScormTags?.some((subj) => subj?._id && subj._id === val._id)
            );  
            const isDuplicate = this.state.aScormTags?.some((sub) => sub?.tag === value);
            if(isDuplicate) {
              setOption([]);
            } else if (!outputData.length)  {
              setOption([{tag:this.props.t("translate:CREATE_TAG")+":"+" "+value}])
            } else {
              if (outputData.every((val) => val.tag !== value)) {
                outputData.push({tag:this.props.t("translate:CREATE_TAG")+":"+" "+value});
              }
              setOption(outputData);
            }
          }else {
              messageUtil.showInfo("NO_SCORM_TAG_FOUND", true);
          }
        }else{
          messageUtil.showError("UNKNOWN_ERROR", false);
        } 
    })
    } else {
      setOption([]);
    }
  }

  // If tag is selected
  handleTagSelect =(tagDet)=>{
    if(tagDet && tagDet.length){
      if(tagDet[0].tag?.includes(this.props.t("translate:CREATE_TAG")+":") && !tagDet[0]._id) {
        const newTag = tagDet[0].tag.substring(12).trim();
        this.createScormTag({scormTag: newTag});
      }else {
        this.setState((prevState) => ({
          aScormTags: [...prevState.aScormTags, ...tagDet]
        }));
      }
    } 
  }

  // If new scorm tag is selected we have to create a new tag and selcet it
  createScormTag =(oReq) =>{      
    HTTPService.post('/lms/save-scorm-tag', oReq, null, (err,data)=>{
        if(data && data.output){
          if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_TAG_FOUND"){
            messageUtil.showInfo("ERROR_CREATING_TAG", true);
          }else if(data.output.data && !_.isEmpty(data.output.data)){
            const newTagData = data.output.data;
            if (newTagData._id && newTagData.tag){
              this.setState((prevState) => ({
                aScormTags: [...prevState.aScormTags, { _id: newTagData._id, tag: newTagData.tag }]
              }));
            }
            messageUtil.showInfo("TAG_CREATED_SUCCESSFULLY", true);
          }else {
            messageUtil.showInfo("ERROR_CREATING_TAG", true);
          }
        }else{
          messageUtil.showError("UNKNOWN_ERROR", false);
        } 
    })
  }

  // For removing the selected tag
  removeTag =(id)=>{
    this.setState((prevState) => ({
      aScormTags: prevState.aScormTags.filter((val) => val._id !== id) 
    }));
  }
    
  // search scorm file based on name and tag
  searchHandling = (event) => {
    this.setState({ scormFilter: event }, () => {
      if (event) {
        this.setState({
          aFilterScorm: filterArray(event, this.props.uploadedScormFiles, ['fileNm', 'scormNms'], {
            scormNms: 'tag'
          })
        });
      } else {
        this.setState({ aFilterScorm: this.props.uploadedScormFiles });
      }
    });
  };

  // Resetting single file values
  resetSingleFileValues = () => {
    this.setState({
      entFilNm: 'index',
      isDwldPm: false,
      isDwldPmSF: false,
      scormDesc: '',
      aScormTags: [],
      isPub: true,
      isPubSF: true,
      aSubjects: []
    });
    this.props.updateFileUploadFields('attachments', []);
    this.props.editScormFiles('editScormFile', {});
  }
    
   render() {
    const { session } = this.props;
      if (this.props.location && this.props.location.search) {
         values = queryString.parse(this.props.location.search)
         values.isItem = true // For navigate to the content and show the items of current sub chapters
      }
      return (
        <div>
          {/* .................new code for model box page   ............ */}
          <div className="modal right fade" id="myModal-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content modal-content-page">
                <div class="modal-header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p class="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t("translate:ADD_COURSE")}
                  </p>
                </div>
                <div class="modal-body">
                  <Link
                    to={{
                      pathname: "/home-page/pages",
                      search: `?${queryString.stringify(values)}`,
                      state: this.props.location.state,
                    }}
                    className="nav-urllink"
                  >
                    <div className="course-itemlist">
                      <div className="course-itemlist-name">
                        <p className="">
                          <span>
                            <Book iconStyle="svg-icon_small  icon-primary" />
                            &ensp; {this.props.t("translate:PAGES")}
                          </span>
                        </p>
                      </div>
                      {/* <div className="course-item-move">
                                 <RightArrow iconStyle="svg-icon_small  icon-default" />
                              </div> */}
                    </div>
                  </Link>
                  <Link
                    to={{
                      pathname: "/home-page/files-upload",
                      search: `?${queryString.stringify(values)}`,
                      state: this.props.location.state,
                    }}
                    className="nav-urllink"
                  >
                    <div className="course-itemlist">
                      <div className="course-itemlist-name">
                        <p className="">
                          <span>
                            <Attached iconStyle="svg-icon_small  icon-primary" />
                            &ensp; {this.props.t("translate:FILES")}
                          </span>
                        </p>
                      </div>
                      {/* <div className="course-item-move">
                                 <RightArrow iconStyle="svg-icon_small  icon-default" />
                              </div> */}
                    </div>
                  </Link>
                  <Link
                    to={{
                      pathname: "/home-page/assignment",
                      search: `?${queryString.stringify(values)}`,
                      state: this.props.location.state,
                    }}
                    className="nav-urllink"
                  >
                    <div className="course-itemlist">
                      <div className="course-itemlist-name">
                        <p className="">
                          <span>
                            <Columns iconStyle="svg-icon_small  icon-primary" />
                            &ensp; {this.props.t("translate:ASSIGNMENT")}
                          </span>
                        </p>
                      </div>
                      {/* <div className="course-item-move">
                                 <RightArrow iconStyle="svg-icon_small  icon-default" />
                              </div> */}
                    </div>
                  </Link>
                  <Link
                    to={{
                      pathname: "/home-page/quiz-creation",
                      search: `?${queryString.stringify(values)}`,
                      state: this.props.location.state,
                    }}
                    className="nav-urllink"
                  >
                    <div className="course-itemlist">
                      <div className="course-itemlist-name">
                        <p className="">
                          <span>
                            <Watch className="svg-icon_small  icon-primary" />
                            &ensp; {this.props.t("translate:QUIZ_LABEL")}
                          </span>
                        </p>
                      </div>
                      {/* <div className="course-item-move">
                                 <RightArrow iconStyle="svg-icon_small  icon-default" />
                              </div>  */}
                    </div>
                  </Link>
                  <Link
                    to={{
                      pathname: "/home-page/scorm-addfile",
                      search: `?${queryString.stringify(values)}`,
                      state: this.props.location.state,
                    }}
                    className="nav-urllink"
                  >
                    <div className="course-itemlist">
                      <div className="course-itemlist-name">
                        <p className="">
                          <span>
                            <Package className="svg-icon_small  icon-primary" />
                            &ensp; {this.props.t("translate:SCORM_PACKAGE")}
                          </span>
                        </p>
                      </div>
                      {/* <div className="course-item-move">
                                 <RightArrow iconStyle="svg-icon_small  icon-default" />
                              </div>  */}
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}

          {/* .................quiz view model box page   ............ */}

          <div className="modal right fade" id="quizeModal-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content modal-quiz-page">
                <div class="modal-header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p class="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t("translate:ADD_QUIZ")}
                  </p>
                </div>
                <div class="modal-body">
                  {this.props.aAsesmnts && this.props.aAsesmnts.length > 0 ? (
                    <div className="quiz-search_box">
                      <Searchbox
                        placeholder={this.props.t("translate:SEARCH")}
                        searchBoxTheme="search-default search-box_default search-outline"
                        value={this.state.queSearch}
                        onChange={(event) => this.searchingHandling(event)}
                      />
                    </div>
                  ) : (
                    <div className="empty-question_box">
                      <p className="empty-question_label">
                        {this.props.t("translate:EMPTY_PAPER")}
                      </p>
                    </div>
                  )}
                  {this.props.aAsesmnts &&
                    this.props.aAsesmnts.length > 0 &&
                    this.props.aAsesmnts.map((oAsesmnt, index) => {
                      return (
                        <div
                          className="quiz-list"
                          data-dismiss="modal"
                          data-toggle="modal"
                          onClick={() => this.addAssesmnt(index)}
                        >
                          <p className="quiz-title_label">
                            {oAsesmnt.QPaperNm}
                          </p>
                          {/* <p className="quiz-date_label">{moment(oAsesmnt.StDate*1000).format("DD-MMM-YYYY hh:mm A")} {this.props.t("translate:TO")} {moment(oAsesmnt.EndDt*1000).format("DD-MMM-YYYY hh:mm A")}</p> */}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* .................Rubrics model box page   ............ */}

          <div
            className="modal right fade"
            id="rubricsModal-page"
            role="dialog"
          >
            <div class="modal-dialog">
              <div class="modal-content modal-quiz-page">
                <div class="modal-header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p class="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t("translate:ATTACH_RUBRICS")}
                  </p>
                </div>
                <div class="modal-body">
                  {this.props.aStfSubs && this.props.aStfSubs.length && (
                    <div className="rubrics-select_modal">
                      <LmsSelectDropDown
                        className="dropdown-default_modal drop-down_arrow"
                        value={this.state.rbSbId}
                        dropDown={this.props.aStfSubs}
                        keyTag="SubjId"
                        nameTag="text"
                        onChange={(e) => this.changeStfSub(e)}
                      >
                        <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                      </LmsSelectDropDown>
                    </div>
                  )}
                  {this.props.aRubrics && this.props.aRubrics.length > 0 ? (
                    this.props.aRubrics.map((oRubric, index) => {
                      return (
                        <div
                          className="rubrics-list_modal"
                          data-dismiss="modal"
                          data-toggle="modal"
                          onClick={() => this.addRubrics(index)}
                        >
                          <p className="rubrics-head_modal">{oRubric.title}</p>
                          <p className="rubrics-criteria_label">
                            {" "}
                            {oRubric.crtCnt}{" "}
                            {this.props.t("translate:CRITERIA")} |{" "}
                            {oRubric.totPnt}{" "}
                            {this.props.t("translate:POINTS_POSSIBLE")}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="empty-question_box">
                      <p className="empty-question_label">
                        {this.props.t("translate:EMPTY_RUBRIC")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* .................Grade system model box page   ............ */}

          <div className="modal right fade" id="gradeSystem-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content modal-quiz-page">
                <div class="modal-header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p class="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t("translate:GRADING_SCHEME")}
                  </p>
                </div>
                <div class="modal-body">
                  {this.props.aGrdSysCpy &&
                    this.props.aGrdSysCpy.length > 0 && (
                      <div className="quiz-search_box">
                        <Searchbox
                          placeholder={this.props.t("translate:SEARCH")}
                          searchBoxTheme="search-default search-box_default search-outline"
                          value={this.state.grdSearch}
                          onChange={(event) => this.searchGradeScheme(event)}
                        />
                      </div>
                    )}
                  {this.props.aGrdSystem &&
                    this.props.aGrdSystem.length === 0 && (
                      <div className="empty-question_box">
                        <p className="empty-question_label">
                          {this.props.t("translate:EMPTY_GRADE_SCHEME")}
                        </p>
                      </div>
                    )}
                  {this.props.aGrdSystem &&
                    this.props.aGrdSystem.length > 0 &&
                    this.props.aGrdSystem.map((oGradeSys, index) => {
                      return (
                        <div
                          className="quiz-list"
                          data-dismiss="modal"
                          data-toggle="modal"
                          onClick={() => this.addGradSys(index)}
                        >
                          <p className="quiz-title_label">
                            {oGradeSys.GrdSysNm}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* .................participant model box page   ............ */}

          <div className="modal right fade" id="participant-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content modal-quiz-page">
                <div class="modal-participant_header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <div className="participant-select_stud">
                    <div className="participant-cont_stud">
                      <img src={studLogo} alt="camu-logo" />
                      <div className="participant-stud-info">
                        <p className="participant-stud_name">Elanthamilan J</p>
                        <p className="participant-stud_info">
                          Section: B.E Bio technology A
                        </p>
                        <p className="participant-stud_info">
                          Last login 2 Oct 2021
                        </p>
                      </div>
                    </div>
                    <p className="participant-user">Act as user</p>
                  </div>
                  <div className="participant-rating_container">
                    <div className="participant-select_rating">
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">57%</p>
                        <p className="rating-cont_label">Completion ratio</p>
                      </div>
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">124</p>
                        <p className="rating-cont_label">Hours of learning</p>
                      </div>
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">70%</p>
                        <p className="rating-cont_label">Grade</p>
                      </div>
                    </div>
                    <div className="participant-select_rating">
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">4</p>
                        <p className="rating-cont_label">Missing</p>
                      </div>
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">3</p>
                        <p className="rating-cont_label">Late</p>
                      </div>
                      <div className="rating-participant_cont">
                        <p className="rating-value_label">
                          <Star className="svg-icon_small icon-secondary" />
                          <Star className="svg-icon_small icon-secondary" />
                          <Star className="svg-icon_small icon-secondary" />
                        </p>
                        <p className="rating-cont_label">Grade</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="participant-modal_body">
                  <div className="participants-content">
                    {/* ...............................tabs selection code......................  */}
                    <div class="project-tab">
                      <div class="participants-modal_tab">
                        <div
                          class="nav nav-tabs nav-fill"
                          id="nav-tab"
                          role="tablist"
                        >
                          <a
                            class="nav-item nav-link active"
                            id="nav-home-tab"
                            data-toggle="tab"
                            href="#tab-modal_1"
                            role="tab"
                            aria-selected="true"
                          >
                            Info
                          </a>
                          <a
                            class="nav-item nav-link"
                            id="nav-profile-tab"
                            data-toggle="tab"
                            href="#tab-modal_2"
                            role="tab"
                            aria-selected="false"
                          >
                            Inbox
                          </a>
                          {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Groups</a> */}
                        </div>
                      </div>
                      <div
                        class="tab-content participants-tabs_body"
                        id="nav-tabContent"
                      >
                        <div
                          class="tab-pane fade show active"
                          id="tab-modal_1"
                          role="tabpanel"
                          aria-labelledby="nav-home-tab"
                        >
                          <div className="student-table_list">
                            <p className="grading-header_label">Need grading</p>
                            <table class="table table-cont student-grades_table">
                              <thead class="thead-list">
                                <tr className="table-header_label">
                                  <th class="sortable">name</th>
                                  <th class="sortable">status</th>
                                  <th class="sortable">last modified</th>
                                  <th class="sortable">due date</th>
                                </tr>
                              </thead>

                              <tbody>
                                <tr>
                                  <td>Assignment name goes here</td>
                                  <td>Submitted</td>
                                  <td>12 Oct 2021</td>
                                  <td>17 Oct 2021</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div className="student-table_list">
                            <p className="grading-header_label">Activities</p>
                            <table class="table table-cont student-grades_table">
                                <thead class="thead-list">
                                  <tr className="table-header_label">
                                      <th class="sortable">Date</th>
                                      <th class="sortable">Page views</th>
                                      <th class="sortable">Action taken</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  <tr>
                                      <td>Today</td>
                                      <td>3</td>
                                      <td>1</td>
                                  </tr>
                                </tbody>

                            </table>
                          </div>
                          <div className="student-table_list">
                            <p className="grading-header_label">Access history</p>
                            <table class="table table-cont student-grades_table">
                                <thead class="thead-list">
                                  <tr className="table-header_label">
                                      <th class="sortable">Date</th>
                                      <th class="sortable">Hours spent</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  <tr>
                                      <td >12 Oct 2021</td>
                                      <td >1hr 30min</td>
                                  </tr>
                                </tbody>

                            </table>
                          </div>
                        </div>
                        <div
                          class="tab-pane fade"
                          id="tab-modal_2"
                          role="tabpanel"
                          aria-labelledby="nav-profile-tab"
                        >
                          <p>inbox content</p>
                        </div>
                        {/* <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                            <p>Groups content</p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}
          {/* .................SCORM Manage model box page   ............ */}
          <div className="modal right fade" id="scorm-manage" data-backdrop="static" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content modal-quiz-page">
                <div className="modal-header header-content">
                  <div className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetSingleFileValues}>
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p className="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t('translate:SCORM_MANAGE')}{" "}{this.props.editScormFile.fileNm}
                  </p>
                </div>
                <div className="modal-body">
                <div className="list-form_container">
                <div>
                  {this.props.fileUpldTyp === 'SRM' && (
                        <div className="mb-4">
                          <h6 className="mb-0">
                            {this.props.t("translate:ENTRY_FILE_NAME")}
                          </h6>
                          <label for="fname" className="scorm-detail_head_  mb-1">
                            {this.props.t("translate:HTML_FILE_LAUNCHES_SCORM_PACKAGE")}
                          </label>
                          <InputBox className="input-block" value={this.state.entFilNm} onChange={(e) => {
                            this.setState({ entFilNm: e.target.value });
                          }} />
                           {this.validator.message(
                            this.props.t("translate:ENTRY_FILE_NAME"),  
                            this.state.entFilNm, 
                            'required|string',
                            { className: 'text-empty_content' }
                            )}
                        </div>
                      )}
                  <h6 className="mb-1">
                       {this.props.t("translate:DOWNLOAD_PERMISSION")}
                     </h6>
                     <label for="fname" className="form-lable mt-1 mb-0">
                       {this.props.t("translate:DOWNLOAD_DESC")}
                     </label>
                     <div className="d-flex gap-1 align-items-center">
                      <RadioButton className="radio-btn mt-2" name="isDwldPm" value={true} checked={this.state.isDwldPm} 
                        onChange={() => this.setState({ isDwldPm: true })} defaultDisabled={this.props.fileUpldTyp === 'SRM'} />
                       <span>
                       {this.props.t("translate:Allowed")}
                       </span>
                     </div>
                     <div className="d-flex gap-1 align-items-center">
                      <RadioButton className="radio-btn mt-2" name="isDwldPm" value={false} checked={!this.state.isDwldPm}
                        onChange={() => this.setState({ isDwldPm: false })} defaultDisabled={this.props.fileUpldTyp === 'SRM'} />
                       <span>
                       {this.props.t("translate:NOT_ALLOWED")}
                       </span>
                     </div>
                    </div>
                     <h6 className="mb-1 mt-4">
                       {this.props.t("translate:INFOCONTENT_DESCRIPTION")}
                     </h6>
                     <TextArea 
                     className="text-area_default"
                      value={this.state.scormDesc}
                      onChange={(e) =>
                        this.setState({
                          scormDesc: e.target.value
                        })
                      }
                    />
                     <h6 className="mt-4 mb-0">
                       {this.props.t("translate:TAGS")}
                     </h6>
                     <label for="fname" className="form-lable mb-1">
                       {this.props.t("translate:TO_IDENTIFY_THE_FILE")}
                     </label>
                     <ReactSelect 
                        isApi={true}
                        handleInputChange={this.handleTagSearch}
                        onChange={this.handleTagSelect}
                        placeholder={this.props.t("translate:Ex_#SUB3955")}
                        name="tag"
                        tag="value"
                        value="_id"
                        isMulti
                      />
                      <div className='d-flex flex-wrap'>
                          {this.state.aScormTags.length ? this.state.aScormTags?.map((val, index) => {
                          return (
                          val? <div className="sub_name mr-2 mt-2" key={index}>
                            <span>
                              {val?.tag}
                            </span>
                            <X className='svg-icon_light icon-default' onClick={() => this.removeTag(val._id)} />
                          </div> : <></>
                        )}): null}
                    </div>
                     <h6 className="mt-4 mb-1">
                       {this.props.t("translate:AVAILABILITY")}
                     </h6>
                     <div className="d-flex gap-1 align-items-center">
                       <RadioButton className="radio-btn mt-2" name="isPub" value= {true} checked={this.state.isPub === true} onChange={(event) =>{
                          if(event.target){
                            this.setState({ isPub: true, aSubjects: []})
                          }
                          }
                        }/>
                       <span>
                       {this.props.t("translate:Public")}
                       </span>
                     </div>
                     <div className="d-flex gap-1 align-items-center">
                       <RadioButton className="radio-btn mt-2" name="isPub" value={false} checked={this.state.isPub === false} onChange={(event) =>{
                        if(event.target){
                          this.setState({ isPub: false })
                        }
                       }
                        }/>
                       <span>
                       {this.props.t("translate:SPECIFIC_COURSE_AVAILABLITY")}
                       </span>
                     </div>
                     <label for="fname" className="form-lable mt-1 mb-1">
                       {this.props.t("translate:AVAILABILITY_DESC")}
                     </label>
                     <ReactSelect 
                        isApi={true}
                        handleInputChange={this.handleSubjectSearch}
                        onChange={this.handleSubjectSelect}
                        name="displayNm"
                        disabled={this.state.isPub}
                        placeholder={this.props.t("translate:TYPE_SUBJECT_CODE")}
                        tag="value"
                        value="_id"
                        isMulti
                      />
                      {this.validator.message(
                        'search subjects', 
                        this.state.aSubjects, 
                        this.state.isPub ? 'array' : 'required|array', // Condition applied here
                        { className: 'text-empty_content' }
                      )}
                      <div className='d-flex flex-wrap'>
                        {this.state.aSubjects.length ? this.state.aSubjects.map((val, index) => {
                          return (
                          val? <div className="sub_name mr-2 mt-2" key={index}>
                            <span>
                              {val?.displayNm}
                            </span>
                            <X className='svg-icon_light icon-default' onClick={() => this.removeSubject(val._id)} />
                          </div> : <></>
                        )}): null}
                    </div>
                   </div>
                </div>
                <div className="modal-footer">
                  <Button theme="btn-rounded secondary-btn btn-left" clicked={() => {$("#scorm-manage").modal("hide"); this.resetSingleFileValues()}}>{this.props.t("translate:CANCEL")}</Button>
                  <Button theme="btn-rounded default btn-left" clicked={() => this.editAndSaveScormFile()}>{this.props.t("translate:SAVE")}</Button>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}
          {/* .................SCORM detail model box page   ............ */}
          <div className="modal right fade" id="scorm-detail" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content modal-quiz-page">
                <div className="modal-header header-content">
                  <div className="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p className="modal-title right-model_heading" id="myModalLabel">
                    {this.props.selectedScormFile?.fileNm}
                  </p>
                </div>
                <div className="modal-body">
                <div className="list-form_container">
                   <div className="participants-content_tab">
                     <div className="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                       <a className={`nav-item nav-link scorm-tab ${ this.props?.activeTab === "DETAIL" ? "active" : ""}`} id="nav-home-tab" data-toggle="tab"
                       href="#model-tab-1" role="tab" aria-selected="true"  onClick={() => this.props?.handleTabClick("DETAIL",this.props?.selectedScormFile)}>
                         {this.props.t("translate:DETAIL")}
                        
                       </a>
                       <a className={`nav-item nav-link scorm-tab ${ this.props?.activeTab === "USER_ACTIVITY" ? "active" : ""}`} id="nav-home-tab" data-toggle="tab" href="#model-tab-2"
                       role="tab" aria-selected="true"  onClick={() => this.props?.handleTabClick("USER_ACTIVITY",this.props?.selectedScormFile)}>
                         {this.props.t("translate:USER_ACTIVITY")}
                       </a>
                     </div>
                   </div>
                   <div className="tab-content participants-tabs_cont" id="nav-tabContent">
                     <div className={`tab-pane fade ${ this.props?.activeTab === "DETAIL" ? "show active" : ""}`} id="model-tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                     <UIPerWrapper perCode={["rp_can_create_or_edit_lms_scorm"]}>
                     <div className="d-flex justify-content-end mt-3">
                     <Button
                        theme="btn-rounded secondary-btn"
                        clicked={() => {
                          $("#scorm-detail").modal("hide");
                          $("#scorm-manage").modal("show");
                        }}
                      >
                        {this.props.t('translate:MANAGE')}
                         </Button>
                         </div>
                     </UIPerWrapper>
                        <h6 className='scorm-detail_head'>
                       {this.props.t("translate:INFOCONTENT_DESCRIPTION")}
                     </h6>
                     <div className="text-primary fs-3">
                        {this.props.editScormFile?.desc}
                     </div>
                     <h6 className="mt-4 mb-0 scorm-detail_head mb-1">
                       {this.props.t("translate:TAGS")}
                     </h6>
                     {this.props.editScormFile?.scormNms?.length
                        ? this.props.editScormFile?.scormNms.map((val) => (
                          <span className='scorm-sub_head_'>{val.tag}</span>
                          ))
                        : <></>}
                     <h6 className="mt-4 mb-0 scorm-detail_head">
                       {this.props.t("translate:AVAILABILITY")}
                     </h6>
                     <p className='scorm-detail_head_ mb-1'>{this.props.t("translate:AVAILABLE_FOR_STAFF_PARTICIPANTS")}</p>
                     {this.props.editScormFile.isPub ? this.props.t("translate:Public") :(<ul className='pl-4'>{this.props.editScormFile?.subjectNms?.length
                        ? this.props.editScormFile?.subjectNms.map((val) => (
                            <li>{val?.displayNm}</li>
                          ))
                        : <></>}</ul>)}
                        <h6 className="mt-4 mb-1 scorm-detail_head">
                       {this.props.t("translate:FILE_TYPE")}
                     </h6>
                     <span >{this.props.editScormFile?.type==='SRM' ? this.props.t("translate:SCORM") : this.props.t("translate:OTHERS")}</span>
                     <h6 className="mt-4 mb-1 scorm-detail_head">
                       {this.props.t("translate:UPLOADED_ON")}
                     </h6>
                     <span >{lmsNonUTCDateAndTimeFormat(this.props.editScormFile?.CrAt)}</span>
                     <h6 className="mt-4 mb-1 scorm-detail_head">
                       {this.props.t("translate:UPLOADED_BY")}
                     </h6>
                     <span >{this.props.editScormFile?.staffNm}</span>
                     <h6 className="mt-4 mb-1 scorm-detail_head">
                       {this.props.t("translate:SIZE")}
                     </h6>
                     <span>{this.props.editScormFile?.size}</span>
                     </div>
                     {/* <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-home-tab">
                        <div className=" mt-4 gap-1 justify-content-start scorm-itemlist">
    
                        <img src={'/static/media/user-profile.57b4e4a6.png'} className="user-imgs" alt="img" />
                        <div>
                           <h6 className="mb-0">STF2944 - Elanthamilan used in SUB1203 - Physics II</h6>
                           <p className="mb-0">12 Jan 2024 on 11:00 AM</p>
                        </div>
                        </div>
                     </div> */}  
                        <div className={`tab-pane fade mt-4 ${ this.props?.activeTab === "USER_ACTIVITY" ? "show active" : ""}`} id="model-tab-2" role="tabpanel" aria-labelledby="nav-home-tab">
                          {this?.props?.aActivity.map((row) => (
                              <div key={row._id} className="mt-2 gap-1 justify-content-start scorm-itemlist">
                              <div className="d-flex gap-1 align-items-center">
                            {row?.staffImg? <img src={session?.camuURL+'/Image/getImage/' + row.staffImg} className="user-imgs" alt="img" /> : <img src={userimg} className="user-imgs" alt="img" />}
                                <div>
                                  <h6 className="mb-0">{row.staffNm} - {row.actType}</h6>
                                  <p className="mb-0">{lmsNonUTCDateAndTimeFormat(row.CrAt)}</p>
                                </div>
                              </div>
                              </div>
                            ))}
                        </div>
                   </div>
                 </div>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}
          {/* .................SCORM Add file model box page   ............ */}
          <div className="modal right fade" id="scorm-add" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content modal-quiz-page">
                <div className="modal-header header-content">
                  <div className="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p className="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t('translate:SCORM')} 
                  </p>
                </div>
                <div className="modal-body p-0">
                  <div className="row h-100">
                    <div className="col-3 border-right h-100 p-0"> 
                      <ul className="list-groups p-0">
                        <li className="list-item"> {this.props.t('translate:SCORM_FILE')}</li>
                      </ul>
                      </div>
                      <div className="col-9 px-4">
                            <Searchbox placeholder={this.props.t('translate:SEARCH_BY_FILE_NAME_TAGS')} searchBoxTheme='search-default search-box_default search-outline' value={this.state.scormFilter} onChange={(e) =>{ if(e){this.searchHandling(e.target.value)}}} />
                         {(this.state.aFilterScorm && this.state.aFilterScorm.length) ? this.state.aFilterScorm.map((val) =>
                         <div className="course-itemlist mt-3">
                           <div className='w-75'>
                              <h6 className="m-0 file_title">{val.fileNm}</h6>
                                {val.scormNms?.length ? val.scormNms.map((tagNm, index) =><span className="form-lable" key={index}> {tagNm?.tag}</span>): <></>}
                           </div>
                           <Button theme="btn-rounded secondary-btn" clicked={() => this.selectScormFile(val)} > {this.props.t('translate:SELECT')}</Button>
                         </div>) : <p className="scorm-label_empty"> {this.props.t('translate:NO_SCORM_FILES_FOUND')}</p>}
                       </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}
          {/* .................SCORM upload file model box page   ............ */}
          <div className="modal right fade" id="scorm-singleFile" role="dialog" data-backdrop="static">
            <div className="modal-dialog">
              <div className="modal-content modal-quiz-page">
                <div className="modal-header header-content">
                  <div className="close" data-dismiss="modal" aria-label="Close" onClick={() => this.resetSingleFileValues()}>
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p className="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t('translate:' + (this.props?.fileUpldTyp === 'SRM' ? 'UPLOAD_SCORM_FILE' : 'UPLOAD_FILE'))}
                  </p>
                </div>
                <div className="modal-body p-0">
                  <div className="file-upload_box mb-4">
                    <div className="file-upload">
                      <div className="row m-0">
                        <div className="col-7 p-0">
                          <LmsFileUploader 
                            onChange={() => this.props?.setErrorFile(false)}
                            onFileChange={() => this.props?.setErrorFile(false)}
                            onDropChange={() => this.props?.setErrorFile(false)}
                            multiple={false}
                            isFromScorm={this.props?.fileUpldTyp === 'SRM'}
                            isFromOth={this.props?.fileUpldTyp === 'OTH'}
                            accept={this.props?.fileUpldTyp === 'SRM' ? '.zip' : null}
                          >
                            <p className="drag-files">{this.props.t("translate:Drag_File")}</p>
                          </LmsFileUploader>
                        </div>
                        <div className="col-5 p-0 file-selection d-flex align-items-center justify-content-end">
                          <span className="option-file">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_OR")}</span>
                          <LmsFileUploader
                            onChange={() => this.props?.setErrorFile(false)} 
                            onFileChange={() => this.props?.setErrorFile(false)}
                            onDropChange={() => this.props?.setErrorFile(false)} 
                            multiple={false}
                            isFromScorm={this.props?.fileUpldTyp === 'SRM'}
                            isFromOth={this.props?.fileUpldTyp === 'OTH'}
                            accept={this.props?.fileUpldTyp === 'SRM' ? '.zip' : null}
                          >
                            <Button theme="btn-rounded btn-outline">
                              {this.props.t("translate:CHOOSE_FILE")}
                            </Button>
                          </LmsFileUploader>
                        </div>
                      </div>
                    </div>
                    <div>
                      {this.props?.errMsgFile && <p className="text-error_content mb-0 mt-1">{this.props.t("translate:UPLOAD_FILE_OR_URL")}</p>}
                    </div>
                    {!!this.props.attachments?.length && (
                      <div className="uploaded-filename">
                        <span>{this.props.attachments[0]?.orgFileNm}</span>
                        <div className="more-options" >
                          <div className="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <MoreInfo iconStyle="svg-icon_small icon-pointer icon-default" />
                          </div>
                          <div className="dropdown-menu ">
                            <div className="dropdown-item user-info_contents" onClick={() => this.props.updateFileUploadFields('attachments', [])}>
                              <Trash iconStyle="svg-icon_extra-small icon-default" />
                              <span className="option-list_dropdown">{this.props.t("translate:REMOVE")}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="file-upload_box mt-2">
                    {this.props.fileUpldTyp === 'SRM' && (
                      <div className="mb-4">
                        <h6 className="mb-0">
                          {this.props.t("translate:ENTRY_FILE_NAME")}
                        </h6>
                        <label for="fname" className="scorm-detail_head_  mb-1">
                          {this.props.t("translate:HTML_FILE_LAUNCHES_SCORM_PACKAGE")}
                        </label>
                        <InputBox className="input-block" value={this.state.entFilNm} onChange={(e) => {
                          this.setState({ entFilNm: e.target.value });
                        }} />
                      </div>
                    )}
                    <div className="mb-4">
                      <h6 className="mb-1">
                        {this.props.t("translate:DOWNLOAD_PERMISSION")}
                      </h6>
                      <label for="fname" className="form-lable mt-1 mb-0">
                        {this.props.t("translate:DOWNLOAD_DESC")}
                      </label>
                      <div className="d-flex gap-1 align-items-center">
                        <RadioButton className="radio-btn mt-2" name="isDwldPmSF" value={true} checked={this.state.isDwldPmSF} 
                          onChange={() => this.setState({ isDwldPmSF: true })} defaultDisabled={this.props.fileUpldTyp === 'SRM'} />
                        <span>{this.props.t("translate:Allowed")}</span>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        <RadioButton className="radio-btn mt-2" name="isDwldPmSF" value={false} checked={!this.state.isDwldPmSF}
                          onChange={() => this.setState({ isDwldPmSF: false })} defaultDisabled={this.props.fileUpldTyp === 'SRM'} />
                        <span>{this.props.t("translate:NOT_ALLOWED")}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h6 className="mb-1">
                        {this.props.t("translate:INFOCONTENT_DESCRIPTION")}
                      </h6>
                      <TextArea
                        className="text-area_default"
                        value={this.state.scormDesc}
                        onChange={(e) => {
                          this.setState({ scormDesc: e.target.value });
                        }}
                      />
                    </div>
                    <div className="mb-4">
                      <h6 className="mb-0">
                        {this.props.t("translate:TAGS")}
                      </h6>
                      <label for="fname" className="form-lable mb-1">
                        {this.props.t("translate:TO_IDENTIFY_THE_FILE")}
                      </label>
                      <ReactSelect
                        isApi={true}
                        handleInputChange={this.handleTagSearch}
                        onChange={this.handleTagSelect}
                        placeholder={this.props.t("translate:Ex_#SUB3955")}
                        name="tag"
                        tag="value"
                        value="_id"
                        isMulti
                      />
                      <div className='d-flex flex-wrap'>
                        {!!this.state.aScormTags.length && (
                          this.state.aScormTags?.map((val, index) => {
                            return (
                              val && (
                                <div className="sub_name mr-2 mt-2" key={index}>
                                  <span>
                                    {val?.tag}
                                  </span>
                                  <X className='svg-icon_light icon-default' onClick={() => this.removeTag(val._id)} />
                                </div>
                              )
                            )
                          })
                        )}
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">
                        {this.props.t("translate:AVAILABILITY")}
                      </h6>
                      <div className="d-flex gap-1 align-items-center">
                        <RadioButton className="radio-btn mt-2" name="isPubSF" value={true} checked={this.state.isPubSF} 
                          onChange={() => this.setState({ isPubSF: true, aSubjects: [] })} />
                        <span>{this.props.t("translate:Public")}</span>
                      </div>
                      <div className="d-flex gap-1 align-items-center">
                        <RadioButton className="radio-btn mt-2" name="isPubSF" value={false} checked={!this.state.isPubSF}
                          onChange={() => this.setState({ isPubSF: false })} />
                        <span>{this.props.t("translate:SPECIFIC_COURSE_AVAILABLITY")}</span>
                      </div>
                      <label for="fname" className="form-lable mt-1 mb-1">
                        {this.props.t("translate:AVAILABILITY_DESC")}
                      </label>
                      <ReactSelect
                        isApi={true}
                        handleInputChange={this.handleSubjectSearch}
                        onChange={this.handleSubjectSelect}
                        name="displayNm"
                        disabled={this.state.isPubSF}
                        placeholder={this.props.t("translate:TYPE_SUBJECT_CODE")}
                        tag="value"
                        value="_id"
                        isMulti
                      />
                      <div className='d-flex flex-wrap'>
                        {!!this.state.aSubjects.length && (
                          this.state.aSubjects?.map((val, index) => {
                            return (
                              val && (
                                <div className="sub_name mr-2 mt-2" key={index}>
                                  <span>
                                    {val?.displayNm}
                                  </span>
                                  <X className='svg-icon_light icon-default' onClick={() => this.removeSubject(val._id)} />
                                </div>
                              )
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <Button theme="btn-rounded secondary-btn btn-left" clicked={() => {
                    $("#scorm-singleFile").modal("hide");
                    this.resetSingleFileValues();
                  }}>{this.props.t("translate:CANCEL")}</Button>
                  <Button theme="btn-rounded default btn-left" 
                    clicked={() => {
                      if (!this.props?.attachments.length) {
                        this.props?.setErrorFile(true);
                        return;
                      }

                      $("#scorm-singleFile").modal("hide");
                      this.props.saveFileUpload?.({
                        entFilNm: this.state.entFilNm,
                        isDwldPm: this.state.isDwldPmSF,
                        scormDesc: this.state.scormDesc,
                        scormTagId: this.state.aScormTags.map(tag => tag._id),
                        isPub: this.state.isPubSF,
                        subIds: this.state.aSubjects.map(sub => sub._id)
                      });
                      this.resetSingleFileValues();
                    }}>{this.props.t("translate:SAVE")}</Button>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}
          {/* .................SCORM browse file model box page   ............ */}
          <div className="modal right fade" id="scorm-browse" role="dialog">
            <div className="modal-dialog">
              <div className="modal-content modal-content">
                <div className="modal-header header-content">
                  <div className="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p className="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t('translate:Browse')}
                  </p>
                </div>
                <div className="modal-body p-0">
                  <div className="scorm-table h-100">
                    <div className='col-7 p-0'>
                      <Searchbox placeholder={this.props.t('translate:SEARCH_BY_FILE_NAME_TAGS')} searchBoxTheme='search-default search-box_default search-outline' value={this.state.scormFilter} onChange={(e) => e && this.searchHandling(e.target.value)} />
                    </div>
                    <div className='mt-4'>
                      <Table
                        data={this.state.aFilterScorm ?? []}
                        columns={this.otherFileColumns}
                        defaultSortBy='name'
                        sortDesc={false}
                      />
                    </div>
                    {/* <p className="scorm-label_empty"> {this.props.t('translate:NO_SCORM_FILES_FOUND')}</p> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* .................................................................... */}

          {/* .................Grade book model box page   ............ */}

          <div className="modal right fade" id="grade-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content grade-content">
                <div class="modal-header header-content">
                  <div class="close" data-dismiss="modal" aria-label="Close">
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                  <p class="modal-title right-model_heading" id="myModalLabel">
                    {this.props.t("translate:DOWNLOAD")}
                  </p>
                </div>
                <div class="modal-body">
                  <div className="view-download_list">
                    <div className="grade-download_list">
                      <div className="grade-download_label">
                        <p className="grade-head_cont">
                          {this.props.t("translate:GRADES_QUIZ")}
                        </p>
                      </div>
                      <div
                        className="grade-download_btn"
                        data-dismiss="modal"
                        data-toggle="modal"
                      >
                        <Button
                          theme="btn-rounded secondary-btn"
                          clicked={() => this.dwnldGradesFrAsgnmnt()}
                        >
                          {this.props.t("translate:DOWNLOAD")}
                        </Button>
                      </div>
                    </div>

                    <div className="grade-download_list">
                      <div className="grade-download_label">
                        <p className="grade-head_cont">
                          {this.props.t("translate:ASSIGNMENT_SUBMISSIONS")}
                        </p>
                        <p className="grade-sub_cont">
                          {this.props.t(
                            "translate:DOWNLOAD_ASSIGNMENT_SUBMISSION_INFO"
                          )}
                        </p>
                      </div>
                      <div
                        className="grade-download_btn"
                        data-dismiss="modal"
                        data-toggle="modal"
                      >
                        <Button
                          theme="btn-rounded secondary-btn"
                          clicked={() => this.dwnldAssgnSubmsn()}
                        >
                          {this.props.t("translate:DOWNLOAD")}
                        </Button>
                      </div>
                    </div>

                    {/* <div className="grade-download_list">
                        <div className="grade-download_label">
                        <p className="grade-head_cont">Grade history</p>
                        <p className="grade-sub_cont">History of changes made to grades</p>
                        </div>
                        <div className="grade-download_btn">
                        <Button theme="btn-rounded secondary-btn ">
                              Download
                        </Button>
                        </div>
                  </div> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal fade" id="grade-upload-page" role="dialog">
            <div class="modal-dialog">
              <div class="modal-content grade-content">
                <div class="modal-header header-content">
                  <p class="modal-title model_heading" id="myModalLabel">
                    {this.props.t("translate:UPLOAD_GRADES")}
                  </p>
                  <div
                    class="close"
                    data-dismiss="modal"
                    aria-label="Close"
                    onClick={() => this.fileChoose("d")}
                  >
                    <Cross iconStyle="svg-icon_small icon-pointer" />
                  </div>
                </div>
                <div class="modal-body">
                  <div className="grade-upload_cont">
                    <DragNUpload
                      accept='.csv,.xsl,.xlsx'
                      onSelectFiles={(e) =>this.fileChoose("",e) }/>
                    {this.state.gradsUploadFil && (
                      <div className={`grad-upload_list ${this.state.uploadError && 'error'}`}>
                          <File className="svg-icon_small icon-dark icon-pointer" />
                          <div className='grade-file-cont'>
                          <p className='upl-file-name'>{this.state.gradsUploadFil.name}</p>
                          {this.state.uploadError && <>
                          <p>{this.state.uploadError.msg}</p>
                          <p className='errorrow'>{this.state.uploadError.rows}</p>
                      </>}</div>
                          <Trash2 className="svg-icon_small icon-dark icon-pointer" onClick={() => this.fileChoose('d')}/>
                      </div>
                    )}
                    <span className='grade-template_dwnl'>
                    <Button theme='btn-transparent'><a href='/downloadsample/Assignment grade template.xlsx' download target="_blank" >Download template</a></Button>
                    </span>
                    <BackDrop
                      dialog={this.state.openConfirmPost}
                      close={() =>
                        this.setState({ ...this.state, openConfirmPost: false })
                      }
                    >
                      {this.state.openConfirmPost && (
                        <dialog
                          open={this.state.openConfirmPost}
                          className="grade-download_list camu-dialog"
                        >
                          <div>
                            <p>Do you want to post the grade ?</p>
                            <div className="d-flex justify-content-center">
                              <Button
                                theme={`btn-rounded ${
                                  this.state.gradsUploadFil
                                    ? "default"
                                    : "secondary-btn"
                                }`}
                                clicked={() => this.gradeUpload(true)}
                                defaultDisabled={
                                  this.state.gradsUploadFil === null||this.state.isUploading
                                }
                              >
                                {this.props.t("translate:YES")}
                              </Button>
                              <Button
                                theme={`btn-rounded ${
                                  this.state.gradsUploadFil
                                    ? "default"
                                    : "secondary-btn"
                                } mx-2`}
                                clicked={() => this.gradeUpload(false)}
                                defaultDisabled={
                                  this.state.gradsUploadFil === null||this.state.isUploading
                                }
                              >
                                {this.props.t("translate:NO")}
                              </Button>
                            </div>
                          </div>
                        </dialog>
                      )}
                    </BackDrop>
                  </div>
                </div>
                <div className="modal-footer">
                  <div data-dismiss="modal" data-toggle="modal">
                    <Button
                      theme={`btn-rounded secondary-btn`}
                      id="control-modal"
                    >
                      {this.props.t("translate:CANCEL")}
                    </Button>
                  </div>
                  <Button
                    theme={`btn-rounded ${
                      this.state.gradsUploadFil ? "default" : "secondary-btn"
                    }`}
                    clicked={() =>
                      this.setState({ ...this.state, openConfirmPost: true })
                    }
                    defaultDisabled={this.state.gradsUploadFil === null}
                  >
                    {/* <Upload className="svg-icon_extra-small" /> */}
                    {this.props.t("translate:UPLOAD")}
                  </Button>
                  <button
                    id="control-modal"
                    data-dismiss="modal"
                    data-toggle="modal"
                    hidden
                  ></button>
                </div>
              </div>
            </div>
          </div>

          {/* .................................................................... */}

          {this.state.shwNwRbrcsMod && (
            <FullViewModal
              open={this.state.shwNwRbrcsMod}
              onClose={() =>
                this.setState({ ...this.state, shwNwRbrcsMod: false })
              }
              shwNwRbrcsMod={this.state.shwNwRbrcsMod}
              center={true}
              isRubrics={true}
            />
          )}
        </div>
      );
   }
}
const mapStateToProps = (state) => ({
   ...state.fileUploadReducer,
   ...state.contentReducer,
   ...state.headerReducer,
   ...state.RubricsReducer,
   ...state.dashboardReducer,
   ...state.settingsReducer,
   ...state.gradeBookReducer,
   ...state.ScormFileReducer
})

const mapDispatchToProps = {
   getTeachContentBySubjSelection,
   initializeFileUpload,
   addChapter,
   addSubChapter,
   // getQuizDtls,
   addQuiz,
   updateFields,
   updateFileUploadFields,
   editScormFiles,
   updateCrseSetFields,
   getRubrics,
   dwnldGradAsgnmnt,
   dwnlAssgnmntSubmsn,
   uploadGradeForAsgmnt,
   getAssgnStuds,
   getSessionDtls,
   saveScormFile,
   getScormFile,
   getScormLog
}
const TabNavigator = (props) => {
  const { setSelectedScorm } = props;
  setSelectedScormFn = setSelectedScorm || (() => {});

return <ModelBarComponent {...props} />
}

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));


