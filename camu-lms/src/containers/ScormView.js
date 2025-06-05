import React, { lazy, useState, useEffect } from "react";
import "../styles/_assignmentviewStyle.scss";
import "../styles/_commonLmsStyle.scss";
import { Edit, MoreVertical, Trash2, X, Slash } from "react-feather";
import { withRouter, Link } from "react-router-dom";
import { withTranslation } from "react-i18next";
import Button from "../components/button/Button";
import { getContById, deleteItems, updateMarkAsDone, loadItems, getSubChapName } from '../store/actions/ContentActions';
import AnalyticsService from '../service/analytics-service';
import queryString from 'query-string';
import { useHistory, useLocation } from 'react-router-dom';
import UserSession from '../utils/UserSession';
import { updateCntViewLog } from '../store/actions/AnalyticsAction';
import { connect } from 'react-redux';
import _ from "lodash";
import HTTPService from "../utils/http-util";
import messageUtil from '../utils/message-util';
import SlideFooter from "../components/slide-footer/SlideFooter";
// import {generateClouldFrontCookies } from '../store/actions/ScormFileAction';

const LmsModal = lazy(() =>
  import("../components/modal/LmsModal")
);
const UIPerWrapper = lazy(() =>
  import('../components/ui-per-wrapper/UIPerWrapper')
);
const ConversationComponent = lazy(() =>
  import('../components/conversation/Conversation')
);
const LmsEditorView = lazy(()=>
  import('../components/lms-editor-view/LmsEditorView')
);
const AnalyticsWrapper = lazy(() =>
  import('../components/analytics-wrapper/AnalyticsWrapper')
);
const StudentWrapper = lazy(() =>
  import('../components/student-wrapper/StudentWrapper')
);
const StaffWrapper = lazy(() =>
  import('../components/staff-wrapper/StaffWrapper')
  );


const ScormViewComponent = (props)=> {
  const history = useHistory();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("tab-1");
  const [vSts, setVstus] = useState('');
  const [isLoadConv, setIsLoadConvo] = useState(false);
  const [isLoadAnaly ,setIsLoadAnaly] = useState(false);
  const [itemDelModel, setitemDelModel] = useState(false);
  const [scormContent, setscormContent] = useState(false);   //Scorm content
  const [scormUrl, setScormUrl] = useState('');   //Scorm URl

  let values = queryString.parse(location.search);

  const handleTabClick = (tabId, loadConv = false) => {
    setActiveTab(tabId);
    setIsLoadConvo(loadConv);
  };

  // Confirmation modal open and close for item delete
  const itemModalAction = (key) => {
    setitemDelModel(key);
  };

  // Delete Assignment in Assignment view
  const deleteAsign = () => {
    props.deleteItems(values.id, navigateCours);
  }

  // On load getting the content values
  useEffect(() => {
    AnalyticsService.setCurrPage('SCORM_VW');
    setIsLoadAnaly(true);
    let oReq = {
      _id: values.id
    }
    if (values.state) {
      location.state = queryString.parse(decodeURIComponent(values.state));
    }
    // get contents data by id
    if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content
      // get contents data by id
      props.getContById(true, oReq, updateSts, updateFooter);
    }
  }, []);

  // Set vSts publish or unpublish 
  const updateSts = (vSts) => {
    setVstus(vSts); 
  }

  // Navigate to Course page
  const navigateCours = (isNavi) => { // is Navigation value boolean
    if (isNavi) {
        itemModalAction(false);
        history.push({ pathname: '/home-page/content-page', state: location.state });
    }
  }

  // Update footer value for quiz list or course content
  const updateFooter = (isInitLoad) => {
    if (isInitLoad) {
        if(!location.state.allSchdl && !location.state.crsSchdl){
            if(values.scormView){
                  props.loadItems(null,null,location.state,"SCORM");
                  props.getSubChapName();
            }else{ 
                  props.loadItems(values.chapId,values.subId,location.state,false);
                  props.getSubChapName(props.oContDtls.subChapNm);
            }
          }
    }
  }

  // go to preview
  const goPreview = () =>{
        history.push({ pathname: '/home-page/content-page', state: location.state, itemObj: values });
  }


  // Footer handler
  const scormFooterChange =(scormId,type, currPage)=>{
    values.id = scormId;
    let oReq = {
        _id:scormId,
    }
  
    if(UserSession.isStudent()){    // need to change accordingly 
        const chckCurPage = AnalyticsService.getCurrPageDetails();
        if(chckCurPage && (currPage !== chckCurPage.pgNm)){
        return;
        }
        const oLog = {
            isEnCurCrtNwLg : true,  // End current log for current content and create new for next or prev content
            currPage : currPage,
            id : scormId
        };
        if(location && location.state && location.state.subId){
            oLog.subId = location.state.subId;
            oLog.AcYr = location.state.AcYr;
            oLog.SemID = location.state.SemID;
        }
        props.updateCntViewLog(oLog);
      }
      props.getContById(false,oReq,updateSts,updateFooter);
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

  const generateClouldFrontCookies =()=>{
    setScormUrl('');
    if(props?.oContDtls?.scorm?.scormId){
        const oReqObj = {
            scormId: props.oContDtls.scorm.scormId,
        }
      HTTPService.post('/lms/generate-cloudFront-cookie', oReqObj, null, (err, data) => {
        if (data && data.output) {
          if( data?.output?.data){
            setScormUrl(data.output.data);
            setscormContent(true)
          }else if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_SCROM_FILE_FOUND") {
              messageUtil.showInfo("NO_FILE_FOUND", true);
          }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
          }
        } else {
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
    }
  }

    return (
      <div>
        <div className="view-content_box">
          <div className="files-options">
            <div className="hide-content_view" onClick={() => goPreview()}>
              <X className="svg-icon_small icon-dark icon-pointer" />
            </div>
            <StaffWrapper>
              <div className="view-options">
                {values && values.scormView ?
                    <Link to={{ pathname: '/home-page/scorm-addfile', search: `?id=${values.id}&scormView=${values.scormView}`, state: location.state }}>
                        <Edit className="svg-icon_small icon-dark" />
                    </Link> :
                    <Link to={{ pathname: '/home-page/scorm-addfile', search: `?id=${values.id}&chapId=${props.oContDtls && props.oContDtls.chapId}&subId=${props.oContDtls && props.oContDtls.sChpId}`, state: location.state }}>
                        <Edit className="svg-icon_small icon-dark" />
                    </Link>
                }
                <div className="more-options" >
                  <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                      <MoreVertical className="svg-icon_small icon-dark icon-pointer left-icon" />
                  </div>
                  <div className="dropdown-menu edit-chapter_cont">
                      <div className="dropdown-item user-info_contents" onClick={() => itemModalAction(true)}>
                          <Trash2 className="svg-icon_light  icon-error" />
                          <span className="option-list_dropdown delete-option_btn">{props.t("translate:CHAPTERLISTCOMPONENT_DELETE")}</span>
                      </div>
                  </div>
                </div>
              </div>
            </StaffWrapper>
          </div>

          <div className="assignment-view_container">
          {!location.state?.isDisabledContent && <div>
              <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{vSts && vSts === 'F'  ?
                  <div className="assignment-view_header">
                    <p className="quiz-header_label mb-0">{props.t("translate:LEARNERS_ACCESS_ITEM")}</p>
                    <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>publishContent('D')}>
                        {props.t("translate:UNPUBLISHED")} 
                    </Button>
                  </div>
                  :
                  <div className="assignment-view_header">
                    <p className="quiz-header_label mb-0"> <Slash className="svg-icon_small icon-dark icon-space_left" />{props.t("translate:LEARNERS_CANT_ACCESS_ITEM")}</p>
                    <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>publishContent('F')}>
                        {props.t("translate:PUBLISHED")} 
                    </Button>
                  </div>
              }</UIPerWrapper>
              </div>   
            }

            <div className="assignment-header_container">
              <div className="assignment-heading_cont">
                {props.oContDtls && props.oContDtls.subChapNm &&  <p className="assignment-subchapter_label">{props.oContDtls.subChapNm}</p>}
                {props.oContDtls && props.oContDtls.title && <p className="assignment-heading_label">{props.oContDtls.title}</p>}
              </div>
            </div>

            {/* Tabs Section */}
            <div className="project-tab">
              <div className="student-rating_tab">
                <div
                  className="nav nav-tabs nav-fill"
                  id="nav-tab"
                  role="tablist"
                >
                  <a
                    className={`nav-item nav-link scorm-tab ${
                      activeTab === "tab-1" ? "active" : ""
                    }`}
                    id="nav-overview-tab"
                    data-toggle="tab"
                    href="#tab-1"
                    role="tab"
                    aria-controls="tab-1"
                    aria-selected={activeTab === "tab-1"}
                    onClick={() => handleTabClick("tab-1")}
                  >
                    {props.t("translate:OVER_VIEW")}
                  </a>
                  <a
                    className={`nav-item nav-link scorm-tab ${
                      activeTab === "tab-2" ? "active" : ""
                    }`}
                    id="nav-conversation-tab"
                    data-toggle="tab"
                    href="#tab-2"
                    role="tab"
                    aria-controls="tab-2"
                    aria-selected={activeTab === "tab-2"}
                    onClick={() => handleTabClick("tab-2", true)}
                  >
                    {props.t("translate:CONVERSATION")}
                  </a>
                </div>
              </div>
              <div className="tab-content student-rating" id="nav-tabContent">
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab-1" ? "show active" : ""
                  }`}
                  id="tab-1"
                  role="tabpanel"
                  aria-labelledby="nav-overview-tab"
                >
                  <div className="assignment-tab_container">
                    {props.oContDtls && props.oContDtls.scorm && props.oContDtls.scorm.html  && props.oContDtls.scorm.html  !== "<p><br></p>" &&
                        <div className="description-header">
                            <p className="description-header_label">{props.t("translate:DESCRIPTION")}</p>
                            <p className="quiz-content_label">
                            <LmsEditorView contentData={props.oContDtls.scorm.html }  />
                            </p>
                            {/* <p className="more-content_label">Read more</p> */}
                        </div>
                    }
                    <Button theme="btn-rounded default px-5 mt-2" clicked={() => generateClouldFrontCookies()}>
                      {props.t("translate:VIEW_CONTENT")}
                    </Button>
                  </div>
                </div>
                <div
                  className={`tab-pane fade ${
                    activeTab === "tab-2" ? "show active" : ""
                  }`}
                  id="tab-2"
                  role="tabpanel"
                  aria-labelledby="nav-conversation-tab"
                >
                  <div className="assignment-tab_container">
                    {isLoadConv && <ConversationComponent type='SCORM' title={props.oContDtls.title} />}
                  </div>
                </div>
              </div>
            </div>
            {/* End Tabs */}
          </div>
        </div>
        {scormContent && (
          <LmsModal
            open={scormContent}
            scormUrl = {scormUrl}
            modalTitle={props.oContDtls.title}
            fileView={true}
            onClose={() => setscormContent(false)}
            size="xl"
          />
        )}
        {props.oContDtls && props.oContDtls.title&& !_.isEmpty(props.oContDtls) && !_.isEmpty(props.oContDtls.title) &&
               <SlideFooter sliderClbk={(asgmntId, type, currPage) => scormFooterChange(asgmntId, type, currPage)} sliderData={props.subChapItems} selectedId={values.id} urlData={values} subChapNm={props.slecSubChapNm} />
          }
          {itemDelModel && <LmsModal open={itemDelModel} onClose={()=>itemModalAction(false)}  value={props.oContDtls.title} modalTitle={props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={()=>deleteAsign()}/>}
          <StudentWrapper>
            {isLoadAnaly && values &&<AnalyticsWrapper values = {values}></AnalyticsWrapper>}
           </StudentWrapper>
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

const TabNavigator = (props) => <ScormViewComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));
