import React, { Component, lazy } from 'react';
import '../../styles/_detailscontentStyle.scss';
import {  Upload } from '../icons/Icons';
import $ from 'jquery';
import { connect } from 'react-redux'
import { AlertTriangle, Clock, PlusCircle } from 'react-feather';
import { withTranslation } from "react-i18next";
import { getTeachContentBySubjSelection, addChapter, updateFields, getOvrDueAsgnmnts, resetContentFields, loadItems } from '../../store/actions/ContentActions'
import { getSubjByEntprsDtls, getStaffClasses } from '../../store/actions/DashboardActions'
import { withRouter } from 'react-router-dom'
import NoRecord from '../error-page/Datanotfound';
import "react-responsive-modal/styles.css";
import { filterArray } from '../../utils/filter-util';
import helper from '../../utils/helper';
import nodata from '../../assets/images/nodata.png';
import _ from 'lodash';
import UserSession from '../../utils/UserSession';
import archive_empty_img from '../../assets/images/archive-empty.svg';

const Searchbox = lazy(() =>
   import('../searchbox/Searchbox')
);
const ChapterList = lazy(() =>
   import('../chapter-list/ChapterList')
);
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const StaffWrapper = lazy(() =>
   import('../staff-wrapper/StaffWrapper')
);
const StudentWrapper = lazy(() =>
   import('../student-wrapper/StudentWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
const CourseHeaderComponent = lazy(() =>
   import("../course-header/CourseHeader")
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
class DetailsComponent extends Component {
   constructor(props) {
      super(props);
      this.selcDtls = {};
      this.rslvData = {};
      this.state = {
         modalOpen: false,
         chapterName: '',
         chapterSearch: "",
         // editMode:false
      };
   }


   componentDidMount() {
      $(document).ready(function () {
         $("#sidebarCollapse").on('click', function () {
            $("#sidebar").toggleClass('active');
         });
      });

      // Set View/Edit mode in the local storage
      if(!helper.localStorageGet('editMode')){
         helper.localStorageSet("editMode",false)
      }else{
         // this.setState({editMode:helper.localStorageGet('editMode')});
         this.props.updateFields('crsEditMode', helper.localStorageGet('editMode'))
      }
      
      
      if (this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state) && this.props.session) {
         //this.props.getTheSlectionBySubject(this.props.location.state);
         this.selcDtls = {
            CrID: this.props.location.state.CrID,
            DeptID: this.props.location.state.DeptID,
            InId: this.props.location.state.InId,
            PrID: this.props.location.state.PrID,
            SemID: this.props.location.state.SemID,
            AcYr :this.props.location.state.AcYr,
            SecID :this.props.location.state.SecID,
            SubjId: this.props.location.state.subId,
            staffId: this.props.session.mappedid,
            isFE: this.props.session.fe ? true : false,
            isAllSubject: false,
            OutCmBsdEdu: this.props.OutCmBsdEdu,
            isFrmLms: true
         }
         // this.rslvData={
         //    AcYrNm:this.props.location.state.AcYrNm,
         //    SemName:this.props.location.state.SemName,
         //    CrName:this.props.location.state.CrName,
         //    SecName:this.props.location.state.SecName
         // }
         // let subId = this.props.location.state.subId
         if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content 
            if (this.props.session && this.props.session.utype === "student") {
               this.props.getOvrDueAsgnmnts(this.props.location.state);
            }
            this.props.getTeachContentBySubjSelection(this.selcDtls);
         }
      }
   }

   componentWillUnmount(){
      this.props.resetContentFields();
   }
   //To Open The Chapter Modal
   chapterModal = (key) => {
      if (key) {
         this.setState({ modalOpen: true });
      } else {
         this.setState({ modalOpen: false });
      }
   }
   //adding the chapter
   addChapterHandler = (view) => {
      if (this.state.chapterName && this.state.chapterName.length > 0 && this.props.teachContent && this.props.teachContent.length > 0) {
         let oReq = {};
         oReq = {
            TPID: this.props.teachContent && this.props.teachContent[0] && this.props.teachContent[0].TPID ? this.props.teachContent[0].TPID : '',
            SubjId: this.props.teachContent[0].SubjId,
            isread: true,
            Chapter: [
               {
                  ChapName: this.state.chapterName,
                  SubChapter: [],
                  vSts:view
               }
            ]
         }
         this.props.addChapter(oReq, this.selcDtls);
         this.setState({ ...this.state, chapterName: '' })
         this.chapterModal(false);
      }

   }
   // filter for chapter
   searchingHandling = (event) => {
      this.setState({ chapterSearch: event.target.value });
      if (event.target.value) {
         this.props.updateFields('chapterArray', filterArray(event.target.value.toLowerCase(), this.props.chapterArrayCopy, ['ChapName']))
      } else {
         this.props.updateFields('chapterArray', this.props.chapterArrayCopy)
      }

   }
   // Collapse all chapter and subchapter
   collapseAll = () => {
      $('#accordion .collapse').collapse('hide');
      localStorage.removeItem('chapId');
      localStorage.removeItem('subId');
      this.props.updateFields('isExpItm', false);
   }

   // expand all the chapters and subchapters
   expandAll = () => {
      // this.props.updateFields('isExpItm', true);
      this.props.loadItems(null, null, this.props.location.state, null, null, null, true, 'isExpAll');
   }

   //Staff view/edit Handler
   editViewHandler = (event) => {
      this.props.updateFields('isToggle', false);
      if (event.target.checked === true) {
         let editModeToolTip = helper.localStorageGet('editToolTip');
         if(_.isEmpty(editModeToolTip) ||  !editModeToolTip){
            editModeToolTip = {};
         }
         if(this.props.session.mappedid){
            if((!editModeToolTip[this.props.session.mappedid])||(editModeToolTip[this.props.session.mappedid] && !editModeToolTip[this.props.session.mappedid].isTTibViewed)){
               editModeToolTip[this.props.session.mappedid] = {isTTibViewed:true};
               helper.localStorageSet('editToolTip',editModeToolTip);
            }
         }
         helper.localStorageSet("editMode", true);
         // this.setState({ editMode: helper.localStorageGet('editMode') });
         this.props.updateFields('crsEditMode', helper.localStorageGet('editMode'))
      } else {
         helper.localStorageSet("editMode", false);
         // this.setState({ editMode: helper.localStorageGet('editMode') });
         this.props.updateFields('crsEditMode', helper.localStorageGet('editMode'))
      }
   }

   // Go to assignment screen
   goToAssgnmnt = () => {
      this.props.history.push({ pathname: '/home-page/assignment-list', state: this.props.location.state })
   }

   render() {
      const isArchCrsEnable = UserSession.getArchCrsDtls();
      return (
         <div>
            {this.props.location.state.fromTable && (
               <div className="warning-message_container">
                  <AlertTriangle className="svg-icon_small  icon-alert"/>
                  <p className="warning-cont_label m-0">{this.props.t("translate:VIEW_ONLY_MODE.")}</p>
               </div>
            )}
            <div className="content-container">
            <div >
               <CourseHeaderComponent
                  title={this.props.t("translate:COURSE_CONTENT")} toolKit={true} editMode={this.props.crsEditMode}
                  content={this.props.t("translate:COURSEHEADER_COMPONENT_SET_UP_A_COURSE_ADD_COURSE")}
                  collapseAll={() => this.collapseAll()}
                  expandAll={() => this.expandAll()}
                  isExpItm = {this.props.isExpItm}
                  editViewHandler={(event) => this.editViewHandler(event)}
                  isTooltipShowHandle = {true}
               />
            </div>
            <StudentArchiveContentWrapper>
            <div className="chapters-list wrapper">
               {/* <div id="sidebar">
            <div class="sidebar-header">
               <div class="close" data-dismiss="modal" aria-label="Close">
                  <Cross iconStyle="svg-icon_small" />
               </div>
               <p class="modal-title right-model_heading" id="myModalLabel">Item name goes here</p>
            </div>
            <div className="sidebar-buttons">
               <Button theme="btn-rounded positive-btn" > <Select iconStyle="svg-icon_small" /> &nbsp;Published</Button>
               <Button theme="btn-rounded btn-outline btn-left" >View Submissions</Button>
               <Button theme="btn-rounded default btn-left">
               Grade
               </Button>
               </div>
               <div className="sidebar-description">
                  <p className="description_heading">Description</p>
                  <p className="description_data">We all speak different languages.
                  Use the audio or video record buttons in the editor to record a short message of friendship
               </p>
                  <p className="description_more">see more... </p>
                  <div class="student-rating_box">
                     <div className="row m-0">
                        <div className="col-3 p-0">
                           <div class="rating__box">
                           </div>
                        </div>
                        <div className="col-3 p-0">
                           <div class="rating__box divide-cont">
                              <p className="point-table">45 <span>of</span> 56</p>
                              <p className="point-name">Submitted</p>
                           </div>
                        </div>
                     </div>
                     <div className="col-3 p-0">
                        <div class="rating__box divide-cont">
                           <p className="point-table">
                              <Useradd iconStyle="icon-positive svg-icon_small icon-center" />
                              35
                           </p>
                              <p className="point-name">Graded</p>
                           </div>
                        </div>
                     
                     <div className="col-3 p-0">
                        <div class="rating__box">
                           <p className="point-table">
                              <UserRemove iconStyle="icon-secondary svg-icon_small icon-center" />
                              12
                           </p>
                              <p className="point-name">Need Grading</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div> */}

               <div className="module-list_cont">
                  <div className="cont-list_box">
                     <div className="course-list_search">
                        <div class="row">
                           <div class="col-5">
                              <div className="course-cont_search">
                                 <Searchbox
                                    value={this.state.chapterSearch}
                                    placeholder={this.props.t("translate:SEARCH_CHAPTER")}
                                    onChange={(event) =>
                                       this.searchingHandling(event)
                                    }
                                    searchBoxTheme="search-default search-box_default search-outline" />
                              </div>
                           </div>
                           <div class="col-7">
                              <div className="chapter-details">
                                 {/* <StudentWrapper> */}
                                    <div className="chapter-date">
                                    <StaffWrapper>
                                       {this.props.isAutoSavehide && <p className="auto-save_cont"><Upload iconStyle="svg-icon_extra-small icon-space" />{this.props.t("translate:CHANGES_AUTOSAVED")}</p>}
                                    </StaffWrapper>
                                    <StudentWrapper>
                                       {/* <StudentArchiveContentWrapper> */}
                                       {this.props.ovrDuCnt && <p className="over-due_student" onClick={() => this.goToAssgnmnt()}><Clock className="svg-icon_extra-small icon-alert icon-space" />{this.props.ovrDuCnt} {this.props.t("translate:OVER_DUE")}</p>}
                                       {/* </StudentArchiveContentWrapper> */}
                                    </StudentWrapper>
                                    </div>
                                 {/* </StudentWrapper> */}
                                 {this.props && this.props.chapterArray && this.props.chapterArray.length !== 0 && 
                                 <div className="chapter-info" >

                                    {/* <StudentArchiveContentWrapper> */}
                                    <p className="chapter-info_label">{this.props.oChapTotal.totalChapCout} {this.props.t("translate:CHAPTERS")} <span className="chapter-separator"></span> {this.props.oChapTotal.totalSubCount} {this.props.t("translate:SUBCHAP")}</p>
                                    {/* </StudentArchiveContentWrapper> */}
                                  {!this.props.location.state?.isDisabledContent &&  <StaffWrapper>
                                    <UIPerWrapper perCode={["rp_can_create_or_edit_lms_chap_subchap"]}>
                                       {this.props.crsEditMode &&
                                          <p className="chapter-info_add" onClick={() => this.chapterModal(true)}><PlusCircle className="icon-space" />{this.props.t("translate:ADD_CHAPTER")}</p>
                                       }
                                    </UIPerWrapper>

                                       </StaffWrapper>
                                 }
                                 </div>}
                              </div>
                           </div>
                        </div>
                     </div>
                     {/* {teachContent && teachConten t[0] && teachContent[0].Chapter && teachContent[0].Chapter.length>0 ? <ChapterList/> : <NodataComponent/>} */}
                     {this.props.chapterArray && this.props.chapterArray.length > 0 ?
                        <StudentArchiveContentWrapper>
                           <ChapterList editMode={this.props.crsEditMode} isExpItm = {this.props.isExpItm}/>
                        </StudentArchiveContentWrapper>
                        :
                        this.state.chapterSearch && this.state.chapterSearch.length ?
                           <NoRecord courseContentEmpty={true} clicked={()=>this.searchingHandling({target:{value:''}})}/>
                           :
                           <NoRecord img={nodata} editMode={this.props.crsEditMode} clicked={() => this.chapterModal(true)} imgSize="no-data_img-default" courseContent={true} />
                     }
                  </div>
               </div>
               {this.state.modalOpen && <LmsModal open={this.state.modalOpen} onClose={() => this.chapterModal(false)} value={this.state.chapterName} onChange={(event) => this.setState({ ...this.state, chapterName: event.target.value })} modalTitle={this.props.t("translate:ADD_CHAPTER")} btnName='chapter' addModal={true} onClick={()=>this.addChapterHandler("D")} advanModeChap={true} />}
            </div>
            </StudentArchiveContentWrapper>
            {isArchCrsEnable && !_.isEmpty(isArchCrsEnable) && UserSession.archiveCourse && !UserSession.archiveCourse.canViewCnt() &&
               <NoRecord img={archive_empty_img} imgSize="no-data_img-small" archivedEmptyContent={true} emtyCntTxt="ARCHIVE_COURSE_CONTENT" />
            }
         </div>
         </div>
      )
   }
}
const mapStateToProps = (state) => ({
   ...state.dashboardReducer,
   ...state.contentReducer,
   ...state.headerReducer
})
const mapDispatchToProps = {
   getTeachContentBySubjSelection,
   getSubjByEntprsDtls,
   getStaffClasses,
   // getTheSlectionBySubject,
   addChapter,
   updateFields,
   getOvrDueAsgnmnts,
   resetContentFields,
   loadItems
}


const TabNavigator = (props) => <DetailsComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components))
