import React, { lazy, useState, useRef, useEffect } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import { withTranslation } from "react-i18next";
import { ArrowLeft, X } from "react-feather";
import { MoreInfo, Trash } from "../components/icons/Icons";
import "../styles/_commonLmsStyle.scss";
import { withRouter } from "react-router-dom";
import "../styles/_quizCreationStyle.scss";
import ModelBarComponent from "../components/modelbar/Modelbar";
import SimpleReactValidator from 'simple-react-validator';
import queryString from 'query-string';
import messageUtil from '../utils/message-util';
import _ from 'lodash';
import HTTPService from "../utils/http-util";
import { getUploadedScormFiles } from "../store/actions/ScormFileAction";
import { useDispatch } from "react-redux";
import $ from 'jquery';

const Button = lazy(() => import("../components/button/Button"));
const InputBox = lazy(() => import("../components/input-box/InputBox"));
const LmsEditor = lazy(() => import("../components/lms-editor/LmsEditor"));
const FilePerview  = lazy(() =>import('../components/file-perview/FilePerview'));

const LmsModal = lazy(() => import("../components/modal/LmsModal"));
const ScormAddComponent = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isDisCard, setIsDicard] = useState(false);
  const [desc, setDesc]= useState('');
  const [scormTitle, setScormTitle] = useState('');
  const [vSts, setVSts] = useState('');
  const history = useHistory();
  const [scormFileNm, setScormFileNm] = useState({});
  const [, forceUpdate] = useState();

  const validator = useRef(new SimpleReactValidator());

  let oSrchVal = queryString.parse(location.search);

  // Discard changes for create and edit
  const discardChanges = () => {
    // If you press back icon to navigate when you click discard
    history.go(-1);
    setIsDicard(false);
  };

  // on load getting scorm details
  useEffect(() => {
    $("#myModal-page").modal("hide");
    if(oSrchVal && oSrchVal.id && props.location.state && !_.isEmpty(props.location.state)){
      getScormDetails();
    }
  }, [])

  //creating a page item
  const addSubChapterScorm = (view) => {
    //If all the fileds are valid then only allowed to save
    const isValid = validator.current.allValid();
    if (isValid) {
      if(props.location && props.location.state && !_.isEmpty(props.location.state)){
        let oReq = {
          tCntId: props.location.state.TPID,
          PrID: props.location.state.PrID,
          CrID: props.location.state.CrID,
          AcYr: props.location.state.AcYr,
          DeptID: props.location.state.DeptID,
          SemID: props.location.state.SemID,
          SecID: props.location.state.SecID,
          chapId: oSrchVal.chapId,
          sChpId: oSrchVal.subId,
          subjId: props.location.state.subId,
          title: scormTitle,
          scorm: {
            scormId: props.location.state.scormId || null},
          vSts:view,
          type: 'SCORM',
          seqNo: props.location.state.seqNo,
          _id:oSrchVal.id
        }
        if(desc && !_.isEmpty(desc)){
          oReq.scorm.html = desc;
        }
        
        let pageUrl;
        if(view === "F"){
          pageUrl = '/teaching-content/publish-subchapter-items';
        }else{
          pageUrl = '/teaching-content/create-or-edit-subchapter-items';
        }
        HTTPService.post(pageUrl,oReq,null,(err,data)=>{
          if(data && data.output){
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONTENT_DETAILS_FOUND"){
              setDesc('');
              setScormTitle('');
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            }else if(data.output.data && !_.isEmpty(data.output.data)){
              if(oSrchVal && oSrchVal.id && oSrchVal.id.length){
                messageUtil.showSuccess('PAGE_UPDATED_SUCCESSFULLY',true);
              }else{
                messageUtil.showSuccess('PAGE_ADDED_SUCCESSFULLY',true);
              }
              props.history.push({pathname:"/home-page/scorm-view",search:`?id=${data.output.data._id}&chapId=${oSrchVal.chapId}&subId=${ oSrchVal.subId}`,state:props.location.state});
            }else if(data.output.data && _.isEmpty(data.output.data)) {
              setDesc('');
              setScormTitle('');
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            } 
          }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
          } 
        })
      } else {
        messageUtil.showError("NO_REQUEST_FOUND", false);
      }
    } else {
        validator.current.showMessages();
        forceUpdate({});
    }
  }

  // To get scorm Details
  const getScormDetails = () => {
    let oReq = {
        contntId:oSrchVal.id,
        type: 'SCORM',
        projct: {
          title: 1,
          scorm: 1,
          vSts:1          
        }
    };
      //Get the Page details by id
      HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit',oReq,null,(err,data)=>{
        if(data && data.output){
          if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
            messageUtil.showInfo("NO_PAGE_FOUND", true);
          }else if(data.output.data && !_.isEmpty(data.output.data)){
            setScormTitle(data.output.data.title);
            setVSts(data.output.data.vSts);
            setDesc(data.output.data?.scorm?.html ? data.output.data.scorm.html : '')
            setScormFileNm({
              name : data.output.data?.scorm?.fileNm || '', 
              url : data.output.data?.scorm?.url || ''
            })
          }else if(data.output.data && _.isEmpty(data.output.data)){
            messageUtil.showInfo("NO_PAGE_FOUND", true);
          }
        }else{
          messageUtil.showError("UNKNOWN_ERROR", false);
        } 
    })  
  }

  return (
    <div className="quiz-creation">
      <div className="quiz-module_header">
        <div className="row m-0">
          <div className="col-6 p-0">
            <div className="page-input_title">
              <div className="page-title_icon" onClick={() => props.history.go(-1)}>
                <ArrowLeft className="svg-icon_default icon-dark icon-pointer" />
              </div>
              <div className="page-input_details">
                <label htmlFor="fname" className="form-lable">
                  <span className="mandatory-field">* </span>
                  {props.t("translate:SCORM_CONTENT_TITLE")}
                </label>
                <InputBox
                  className="input-block"
                  placeholder="Enter Title"
                  name="Last Name"
                  value = {scormTitle}
                  onChange={(event) => setScormTitle(event.target.value)}
                />
                {validator.current.message('title', scormTitle, 'required|string',{ className: 'text-empty_content' })}
              </div>
            </div>
          </div>
          <div className="col-6 p-0">
            <div className="publish-btn">
            {vSts === 'F'?
              <p className="published-view_label" >{props.t("translate:PUBLISHED_LABEL")}</p>
              :
              <p className="unpublished-view_label" >{props.t("translate:UNPUBLISHED_LABEL")}</p>
              }
              <Button theme="btn-rounded secondary-btn btn-outline" clicked= {()=>addSubChapterScorm("F")}>
                {props.t("translate:SAVE_&_PUBLISH")}
              </Button>
              <Button theme="btn-rounded default save-page_btn" clicked= {()=>addSubChapterScorm("D")}>
                {props.t("translate:SAVE")}
              </Button>

              <div className="option-mode_content">
                <div
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  className="option-dropdown"
                >
                  <i className="views-option">
                    <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                  </i>
                </div>
                <div className="dropdown-menu edit-chapter_cont">
                  <div
                    className="dropdown-item user-info_contents"
                    onClick={() => setIsDicard(true)}
                  >
                    <X className="svg-icon_light  icon-default" />
                    <span className="option-list_dropdown">
                      {props.t("translate:DISCARD")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-editor">
        <p className="edit-box_heading">
          {props.t("translate:INFOCONTENT_DESCRIPTION")}
        </p>
        <LmsEditor placeholder={props.t("Enter description")}
        value={desc} onChange={(val) => setDesc(val)}/>
      </div>
      <div className="assignment-upload_content">
        <div className="row m-0">
          <div className="col-4 p-0">
            <p className="uploaded-files">{props.t("translate:SCORM_FILE")}</p>
          </div>
          <div className="col-8 file-upload_box">
            <div className="file-upload">
              <div className="row m-0">
                <div className="col-8 p-0 ">
                  <p className="drag-files">{props.t("translate:Drag_File")}</p>
                </div>
                <div className="col-4 p-0">
                  <div className="file-selection d-flex align-items-center justify-content-end">
                    <span className="option-file">{props.t("translate:ASSIGNMENTCONTENTCOMPONENT_OR")}</span>
                    <div data-toggle="modal" data-target="#scorm-add">
                      <Button theme="btn-rounded secondary-btn btn-outline" clicked={() => dispatch(getUploadedScormFiles({ ...props, fileType: 'SRM' }))}>
                        {props.t("translate:CHOOSE_A_FILE")}
                      </Button>
                      <div>   
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {scormFileNm?.name ?
            <div className="uploaded-filename">
            <span> {scormFileNm?.name} </span>
            <div className="more-options" >
                <div className="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <MoreInfo iconStyle="svg-icon_small icon-pointer icon-default" />
                 </div>
                 <div className="dropdown-menu img-edit_option">
                    <div className="dropdown-item user-info_contents" onClick={() => setScormFileNm({})}>
                        <Trash iconStyle="svg-icon_extra-small icon-default" />
                        <span className="option-list_dropdown">   {props.t("translate:REMOVE")}</span>
                     </div>
                   </div>
             </div>
            </div>
            :""}
            {validator.current.message('scormFile', scormFileNm?.name, 'required|string',{ className: 'text-empty_content' })}
          </div>
        </div>
      </div>
      <ModelBarComponent {...props} setSelectedScorm={setScormFileNm} />
      {isDisCard && (
        <LmsModal
          open={isDisCard}
          onClose={() => setIsDicard(false)}
          modalTitle={props.t("translate:DISCARD") + "?"}
          btnName="discard"
          discardBtn={true}
          onClick={() => {
            discardChanges();
          }}
        />
      )}
    </div>
  );
};

export default withTranslation()(withRouter(ScormAddComponent));
