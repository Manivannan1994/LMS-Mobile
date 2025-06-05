import React, { lazy } from "react";
import '../../styles/_confirmationalertStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import Button from '../button/Button';
import { Trash2, AlertOctagon } from 'react-feather';
import InputBox from '../input-box/InputBox';
import { withTranslation } from "react-i18next";
import { useHistory,useLocation,withRouter } from "react-router-dom";
import NumberBox from '../numberBox/NumberBox';
import { connect,useSelector } from 'react-redux';
import Table from '../../components/table/Table';
import _ from 'lodash';
import '../../styles/_modelbarStyle.scss';

const ScormPlayer = lazy(() =>
   import('../scorm-player/ScormPlayer.js')
);

const LmsModal = (props) => {
   const history=useHistory();
   const location=useLocation();
   let exitState=location.state;
   //Assign the modal title in the location state
   if(props.value && props.value.length>0){
      location.state = location.state || {}; 
      Object.assign(location.state,{modalTitle:props.value});
   }
   // Set TPID id in state 
   if (props.teachContent && props.teachContent.length && exitState && !_.isEmpty(exitState)) {
      Object.assign(exitState, { TPID: props.teachContent[0].TPID, teachCntId: props.teachContent[0]._id });
   }

   const fileUploadChange = (event)=>{   //File upload changes from the scorm files
      props.setErrorFile(false);
   }


 const aScormAttachements = useSelector(state => state?.fileUploadReducer?.attachments);

   return(
      <div>
         <Modal open={props.open} onClose={props.onClose} center={props.center} classNames={{ modal: `custom-modal-${props.size}` }} >  
            <div className="model-content_box">
               <div className="model-content_header">
                  <h5 className="model-header_content">{props.modalTitle}</h5>
               </div>
               <div className="model-content_content">
                  {props?.children && props.children}
                  {props.confirmModal && props.btnName === 'chapter' && 
                     <p className="confirmation-text"> {props.t("translate:THE_CHAPTER")} '{props.value}' {props.t("translate:DELETE_CHAPTER")} </p>
                  }
                  {props.confirmModal && props.btnName === 'subChapter' && 
                     <p className="confirmation-text"> {props.t("translate:THE_SUBCHAPTER")} '{props.value}' {props.t("translate:DELETE_SUBCHAPTER")}</p>
                  }
                  {props.confirmModal &&  props.btnName === 'item' &&
                  <div>
                     <p className="confirmation-text">{props.t("translate:MODAL_CONFIRMATION")} '{props.value}' ?</p>
                     {
                        // For rubrics deletion
                        props.rubDel && 
                        <p className="confirmation-text">{props.t("translate:RUB_DEL_CONTENT")}</p>
                     }
                  </div>
                  }
                   {props.btnName === 'discard' &&
                     <p className="confirmation-text">{props.t("translate:DISCARD_MSG")}</p>
                  }

                  {props.btnName === 'overwrite' &&
                     <p className="confirmation-text">{props.t("translate:DO_YOU_WANT_TO_OVER_WRITE_THE_FILE")}</p>
                  }

                  {props.addModal &&
                     <div>
                        <div className=" form-group">
                           <div className="input-details">
                              <label for="fname" className="form-lable">{props.t("translate:TITLE")}</label>
                              <InputBox className="input-block" placeholder={
                                 props.btnName === 'chapter' ? props.t("translate:ENTER_CHAPTER")
                                 : props.btnName === 'subChapter' ? props.t("translate:ENTER_SUB_CHAPTER"): null
                              }
                                 value={props.value}
                                 onChange={props.onChange}
                              />
                           </div>
                        </div>
                        {
                           props.btnName === 'subChapter' &&
                           <div className=" form-group">
                              <div className="input-details">
                                 <label for="fname" className="form-lable">{props.t("translate:DURATION")}</label>
                                 <div className="time-duration_box">
                                 <NumberBox className="input-modal" value={props.duration}  onChange={props.durationChange}/>
                                 <span className="min-to_label">{props.t("translate:SUBCHAP_MINUTES")} </span>
                                 </div> 
                                 {props.modalErr && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:FIELD_REQUIRED")}</p>}
                                 {props.isChkNum && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:ONLY_NUMBER")}</p>} 
                              </div>
                           </div>
                        }
                     </div>
                  }
                   {props.rubricsModal &&
                   <div>
                     <div className=" form-group">
                        <div className="input-details">
                           <label for="fname" className="form-lable">{props.t("translate:INFOCONTENT_DESCRIPTION")}</label>
                           <InputBox className="input-block"  value={props.value1} onChange={props.descOnChange}/>
                           {props.isCrtEnt && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:FIELD_REQUIRED")}</p>}
                        </div>
                     </div>
                     <div className=" form-group">
                        <div className="input-details">
                           <label for="fname" className="form-lable">{props.t("translate:LONG_DESC")}</label>
                           <InputBox className="input-block"  value={props.value2} onChange={props.longDescOnChange}/>
                        </div>
                     </div>
                     </div>
                      }
                      {/* Rubrics Rating modal */}
                  {props.rubRatModal &&
                     <div>
                        {/* <div className=" form-group">
                           <div className="input-details">
                              <label for="fname" className="form-lable">Rating Score</label>
                              <InputBox className="input-block" value={props.value1} onChange={props.ratPntChange} />
                           </div>
                        </div> */}
                        <div className=" form-group">
                           <div className="input-details">
                              <label for="fname" className="form-lable">{props.t("translate:RATING_SCORE")}</label>
                              {props.range ?
                                 (<div className="rating-range_box">
                                 <NumberBox className="input-modal" value={props.value3} onChange={props.mxPntChng} />
                                 <span className="range-to_label">{props.t("translate:TO_GREATER")}</span>
                                 <NumberBox className="input-modal" value={props.value2} onChange={props.mnPntChng} />
                                 <span className="range-to_label">{props.t("translate:PTS")} </span>
                                 </div>)
                                 :
                                 (
                                    <div className="rating-range_box">
                                       <NumberBox className="input-modal" value={props.value1} onChange={props.ratPntChange} />
                                       <span className="range-to_label">{props.t("translate:PTS")}</span>
                                    </div>
                                 )
                              }
                              {props.isRtPnEnt && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:FIELD_REQUIRED")}</p>}
                           </div>
                        </div>
                        <div className=" form-group">
                           <div className="input-details">
                              <label for="fname" className="form-lable">{props.t("translate:RATING_TITLE")}</label>
                              <InputBox className="input-block" value={props.value4} onChange={props.rtDescChng} />
                              {props.isRtTtEn && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:FIELD_REQUIRED")}</p>}
                           </div>
                        </div>
                        <div className=" form-group">
                           <div className="input-details">
                              <label for="fname" className="form-lable">{props.t("translate:RATING_DESC")}</label>
                              <InputBox className="input-block" value={props.value5} onChange={props.rtLngDescChng} />
                           </div>
                        </div>
                     </div>
                  }
                  { props.shwEdtRbMdl && 
                     <div>
                        <label for="fname" className="form-lable">{props.t("translate:EDIT_RUBRIC_CONSRAINT")}</label>
                     </div>
                  }
                  { props.customContents &&
                     <p className="confirmation-text"> {props.t(`translate:${props.customContents}`)} </p>
                  }
                  { props.scormDelete &&
                    <p className="confirmation-text">  {props.t(`translate:MODAL_CONFIRMATION`)}  {props.selectedScormFile} {'?'}</p>
                  }
                  {props.scormActive &&
                    <p className="confirmation-text">{props.t(`translate:STATUS_MODAL_CONFIRMATION`).replace('{sts}', props.modalTitle)}</p>
                  }
                  { props.scormRename &&
                     <><label for="fname" className="form-lable">
                     {props.t("translate:NAME")}
                   </label>
                   <InputBox className="input-block" value={props.scormNm} onChange={(event) => {props.setScormNm(event.target.value)}}/></>
                  }
                  { props.fileView &&
                    <div style={{height: '100%'}}>
                     <ScormPlayer scormUrl ={props?.scormUrl}>  
                     </ScormPlayer>
                    </div>
                  }
                  {props.canShowFeedbackModal && (
                     <div>
                     {/* <label htmlFor="fname" className="form-label">{props.t("translate:YES")}</label> */}
                     {props.feedbackData.length ? (
                        <div className="table-list_container feedback-table">
                         <Table
                           data={props.feedbackData}
                           columns={props.feedbackColumns}
                           defaultSortBy='name'
                           sortDesc={false}
                           disablePagination={true}
                           />
                        </div>
                     ) : (
                        <p>{props.t("translate:NO_FEEDBACK_AVAILABLE")}</p>
                     )}
                     </div>
                  )}
                  { props.isTeachingRmrkModel && 
                     <div>
                        <p className="tch_remarks-label">{props.tchRmrk}</p>
                     </div>
                  }
                  { props.toolMdl &&
                     <div className=" form-group">
                        <div className="input-details">
                           <label for="fname" className="form-lable">{props.t("translate:TOOL_URL")}</label>
                           <InputBox className="input-block" value={props.filterToolURL} onChange={(event) => {props.setFilterToolURL(event.target.value)}} />
                        </div>
                     </div>
                  }
               </div>
               {props.isRtPnMax && <p className="req-filed_label"><span><AlertOctagon className="svg-icon_extra-small icon-error icon-space" /></span>{props.t("translate:SHOULD_BE_MORE_THAN_MINIMUM_POINTS")}</p>}
               {/* {props.isAnalytics &&  
                      <div className="table-tab_container">
                           <div class="table-modal_box">
                              <div class="student-table_tab">
                                 <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                                    <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">Assigned <span className="tabs-notification">12</span> </a>
                                    <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" >Viewed <span className="tabs-notification">12</span> </a>
                                    <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Submitted <span className="tabs-notification">12</span> </a>
                                    <a class="nav-item nav-link" id="nav-home-tab" data-toggle="tab" href="#tab-4" role="tab" aria-selected="false">Submitted late <span className="tabs-notification">12</span> </a>
                                    <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-5" role="tab" aria-selected="false" >Missed <span className="tabs-notification">12</span> </a>
                                 </div>
                              </div>
                              <div class="tab-content student-rating" id="nav-tabContent">
                                 <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                                    <table class="table table-cont student-grades_table table-stud_header">
                                       <thead class="thead-list">
                                          <tr>
                                             <th class="sortable">Full name</th>
                                             <th class="sortable">Assigned date</th>
                                          </tr>
                                       </thead>
                                       <tbody>
                                          <tr>
                                             <td >Michael Thompson</td>
                                             <td >Jan 27, 6:30pm</td>
                                          </tr>
                                          <tr>
                                             <td >Michael Thompson</td>
                                             <td >Jan 27, 6:30pm</td>
                                          </tr>
                                          <tr>
                                             <td >Michael Thompson</td>
                                             <td >Jan 27, 6:30pm</td>
                                          </tr>
                                          <tr>
                                             <td >Michael Thompson</td>
                                             <td >Jan 27, 6:30pm</td>
                                          </tr>
                                          <tr>
                                             <td >Michael Thompson</td>
                                             <td >Jan 27, 6:30pm</td>
                                          </tr>
                                       </tbody>
                                    </table>
                                 </div>
                                 <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                    <p>content 1</p>
                                 </div>
                                 <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                                    <p>content 2</p>
                                 </div>
                              </div>
                           </div>
                        </div>} */}

          
               <div className="model-content_footer">
                  {props.advanModeChap && !props.editMode && <Button theme="btn-rounded secondary-btn btn-outline"clicked={()=>history.push({pathname:'/home-page/prerequest-form',state:location.state,search:`?isChap=${true}`})}>{props.t("translate:ADV_SETTING")}</Button>}
                  {props.advanModeChap && props.editMode && <Button theme="btn-rounded secondary-btn btn-outline"clicked={()=>history.push({pathname:'/home-page/prerequest-form',state:location.state,search:`?isChap=${true}&chapId=${props.chapId}`})}>{props.t("translate:ADV_SETTING")}</Button>}
                  {props.advanModeSub && !props.editMode && <Button theme="btn-rounded secondary-btn btn-outline"clicked={()=>history.push({pathname:'/home-page/prerequest-form',state:location.state,search:`?isSubchap=${true}&ScNo=${props.ScNo}&chapId=${props.chapId}`})}>{props.t("translate:ADV_SETTING")}</Button>}
                  {props.advanModeSub && props.editMode && <Button theme="btn-rounded secondary-btn btn-outline"clicked={()=>history.push({pathname:'/home-page/prerequest-form',state:location.state,search:`?isSubchap=${true}&subChapId=${props.subChapId}&chapId=${props.chapId}`})}>{props.t("translate:ADV_SETTING")}</Button>}

                  {props.discardBtn && 
                   <Button theme="btn-rounded secondary-btn btn-outline" clicked={props.onClose}>{props.t("translate:NO")}</Button>
                  }
                  {props.discardBtn && 
                   <Button theme="btn-rounded secondary-btn btn-outline btn-left" clicked={props.onClick}>{props.t("translate:YES_DISCARD")}</Button>
                  }
                  {props.overwriteBtn && 
                   <Button theme="btn-rounded secondary-btn btn-outline" clicked={props.onClose}>{props.t("translate:NO")}</Button>
                  }
                  {props.overwriteBtn && 
                   <Button theme="btn-rounded secondary-btn btn-outline btn-left" clicked={props.onClick}>{props.t("translate:YES_OVER_WRITE")}</Button>
                  }
                  {props.confirmModal &&
                     <Button theme="btn-rounded delete-btn btn-left" clicked={props.onClick}>
                        <Trash2 className="svg-icon_small icon-white icon-space" /> {props.t("translate:DELETE")}
                     </Button>
                  }
                  {props.addModal &&
                     <Button theme="btn-rounded default btn-left" clicked={props.onClick}>
                        <div>
                           {props.editMode ? props.t("translate:SAVE"):props.btnName === 'chapter'? props.t("translate:ADD_CHAPTER") :props.t("translate:ADD_SUB_CHAPTER")}
                        </div>
                     </Button>
                  }
                  {props.rubricsModal &&
                   <Button theme="btn-rounded default btn-left" clicked={props.onClick}> {props.critEdit ? props.t("translate:UPDATE_CRITERION") : props.t("translate:CREATE_CRITERION")}</Button>
                  }
                  {props.rubRatModal &&
                   <Button theme="btn-rounded default btn-left" clicked={props.onClick}>{props.ratingsEdit ? props.t("translate:UPDATE_RATING") : props.t("translate:CREATE_RATING")}</Button>
                  }
                  {props.shwEdtRbMdl &&
                      <Button theme="btn-rounded default btn-left" clicked={props.onClick}>{props.t("translate:PROCEED")}</Button>
                  }
                  {props.aCustomBtns && props.aCustomBtns.map((eachBtn) => (
                     <Button theme={`btn-rounded default btn-left ${eachBtn.className}`} defaultDisabled={eachBtn?.disabled} clicked={eachBtn.onClick}>{props.t(`translate:${eachBtn.name}`)}</Button>
                  ))}
                  { (props.scormDelete || props.scormActive) &&
                      <> <Button theme="btn-rounded secondary-btn btn-left" clicked={props.onClose}>{props.t("translate:CANCEL")}</Button>
                       <Button theme="btn-rounded btn-danger btn-left" clicked={props.editScormFileHandler}>{props.t("translate:" + (props.scormActive ? "PROCEED" : "DELETE"))}</Button></>
                  }
                  { props.scormRename &&
                     <> <Button theme="btn-rounded secondary-btn btn-left" clicked={props.onClose}>{props.t("translate:CANCEL")}</Button>
                       <Button theme="btn-rounded default btn-left" clicked={props.editScormFileHandler}>{props.t("translate:SAVE")}</Button></>
                  }
                  {props.canShowFeedbackModal &&
                      <Button theme="btn-rounded default btn-left" clicked={props.onClick} defaultDisabled={props?.disabled}>{props.t("translate:SUBMIT")}</Button>
                  }
                  {props.isTeachingRmrkModel &&
                     <Button theme="btn-rounded default btn-left" clicked={props.onClose}>{props.t("translate:OK")}</Button>
                  }
                  {/* { props.scormFileUpload &&
                       <Button theme="btn-rounded default btn-left" defaultDisabled={!props?.scormFile} clicked={props.onClick}>{props.t("translate:SUBMIT")}</Button>
                  } */}
                   </div>
            </div> 
         </Modal>
      </div>
   )
};
const mapStateToProps = (state) => ({
   ...state.dashboardReducer,
   ...state.contentReducer,
   ...state.headerReducer
})
const mapDispatchToProps = {
}

const TabNavigator = (props) => <LmsModal {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));

