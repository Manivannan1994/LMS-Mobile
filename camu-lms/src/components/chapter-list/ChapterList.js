import React, { useState, useEffect, lazy, useRef } from "react";
import '../../styles/_chapterlistStyle.scss';
import { MoveOption, SelectView, HideView, CirCompIcon } from '../icons/Icons';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { withTranslation } from "react-i18next";
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import { FileText, Paperclip, Columns, Slash, CheckCircle, Info, Play, Watch, Trash2, Plus, MoreVertical, Edit, Package } from 'react-feather';
import '../../styles/_iconStyle.scss';
import Button from '../button/Button';
import ProgressBar from '../progressbar/Progressbar';
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { getSubChapName, loadItems, getTeachContentBySubjSelection, addChapter, addSubChapter, lmsContentSorting, updateFields, studentContentProgress, changesAutoSave, getChapterInfo, chpSubChpPblshUnPblsh, duplicateContent } from '../../store/actions/ContentActions';
import { contItmsPblshUnPblsh } from '../../store/actions/ContentActions';
import $ from 'jquery';
import "react-responsive-modal/styles.css";
// import { Modal } from "react-responsive-modal";
// import LmsModal from "../modal/LmsModal";
import _ from 'lodash';
// import StaffWrapper from '../staff-wrapper/StaffWrapper';
import UserSession from '../../utils/UserSession';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { lmsDateAndTimeFormat, lmsNonUTCDateAndTimeFormat, isSubtractOneDay } from '../../utils/helper';
import { useTranslation } from "react-i18next";
import QuizIcon from '../../assets//images/Quiz.svg';
import FlashIcon from '../../assets/images/Flash_Card.svg';
import ShortIcon from '../../assets/images/Short_Snippets.svg';
import { ChevronRight } from 'react-feather';


const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const StaffWrapper = lazy(() =>
   import('../staff-wrapper/StaffWrapper')
);
const StudentWrapper = lazy(() =>
   import('../student-wrapper/StudentWrapper')
);
const UIPerWrapper = lazy(() =>
   import('../ui-per-wrapper/UIPerWrapper')
);

let values;
const ChapterList = (props) => {
   const { t } = useTranslation();
   let subChapItemLoad = true;
   const [dltId, setDtleId] = useState('');
   const [chapModal, setChapModalOpen] = useState(false);
   const [subChapModal, setSubChapModalOpen] = useState(false);
   const [chapterName, setChapter] = useState('');
   const [chapId, setChapId] = useState('');
   const [subChapId, setSubChapterId] = useState('');
   const [subChapName, setSubChapName] = useState('');
   const [chapDelModel, setChapDelModel] = useState(false);
   const [subChapDelModel, setsubChapDelModel] = useState(false);
   const [itemDelModel, setitemDelModel] = useState(false);
   const [subChapterId, setsubChapterId] = useState(null); // intial value subchapter autoclose
   const [itemName, setItemName] = useState('');
   const [edit, setMode] = useState(false);
   const [oldTitle, setOldTitle] = useState('');
   const [isChapInfo, setChapInfo] = useState('');
   const [duration, setDuration] = useState('');
   const [modalErr, setModalErr] = useState(false);
   const [isNaNumErr, setNamnumErr] = useState(false); // For duration number check
   const history = useHistory();
   const location = useLocation();
   let exitState = location.state;
   const subChapref = useRef(null);

   // Update existing state value with Teaching Plan ID
   if (props.teachContent && props.teachContent.length && exitState && !_.isEmpty(exitState)) {
      Object.assign(exitState, { TPID: props.teachContent[0].TPID, teachCntId: props.teachContent[0]._id });
   }
   values = queryString.parse(location.search);
   //To Open Chapter Modal
   const chapterModal = (key, chapName, chapId, mode) => {
      if (key) {
         setChapModalOpen(true);
         setChapter(chapName);
         setChapId(chapId);
         if (mode) {
            setMode(mode);
         }
      } else {
         setMode(false);
         setChapModalOpen(false);
      }
   };
   //To Open SubChapter Modal
   const subChapterModal = (key, subChapName, subChapId, mode, duration) => {
      if (key) {
         setSubChapModalOpen(true);
         setSubChapName(subChapName);
         setSubChapterId(subChapId);
         setDuration(duration);
         if (mode) {
            setMode(mode);
         }

      } else {
         setMode(false);
         setSubChapModalOpen(false);
      }

   };

   const handleChapInfo = (chapId) => {
      exitState = {
         ...exitState,
         activeState: '',
         showSnippet: ''
      };
      history.push({ pathname: '/home-page/chapter-info', search: `?&chapId=${chapId}`, state: exitState });
   }

   const handleSubChapInfo = (chapId, subChapId ) => {
      exitState = {
         ...exitState,
         activeState: '',
         showSnippet: ''
      };
      history.push({ pathname: '/home-page/chapter-info', search: `?chapId=${chapId}&subchapId=${subChapId}`, state: exitState })
   }

   const handleChapInfoAno = (chapId) => {
      exitState = {
         ...exitState,
         activeState: '',
         showSnippet: ''
      };
      history.push({ pathname: '/home-page/chapter-info', search: `?chapId=${chapId}`, state: exitState })
   }

   const handleSubChapQuickClick = (chapId, subChapId, tab ) => {
      exitState = {
         ...exitState,
         activeState: 'snippets',
         showSnippet: tab
      };
      history.push({ pathname: '/home-page/chapter-info', search: `?chapId=${chapId}&subchapId=${subChapId}`, state: exitState })
   }

   //Load the student course progression details
   useEffect(() => {
      if (UserSession.isStudent() && exitState && exitState.TPID && exitState.subId) {
         const oCntPrgReq = {
            subjId: exitState.subId,
            TPID: exitState.TPID,
            isFrmStud: true
         };
         props.studentContentProgress(oCntPrgReq);
      }
      // Check to accordition open in chapter and subchapter
      if (localStorage.getItem('chapId')) {
         let chapterArr = props.chapterArray;
         if (chapterArr && chapterArr.length) {
            for (let index = 0; index < chapterArr.length; index++) {
               if (chapterArr[index]._id === localStorage.getItem('chapId')) {
                  $(`#id${index}`).collapse('show');
               }
            }
         }
      }
      // Check to accordition open in subchapter for contents
      if (localStorage.getItem('chapId') && localStorage.getItem('subId')) {
         let chapId = localStorage.getItem('chapId');
         let subId = localStorage.getItem('subId');
         $(`#id${values.chapIndex}`).collapse('show');
         // props.loadItems(chapId, subId, exitState, null, null, true, true);
         if ((props && props.isExpItm) || (location && location.itemObj && location.itemObj.isExpItm === "true")) {  // Expand chapters, sub chapters and contents
            // props.updateFields('isExpItm', true);
            props.loadItems(null, subId, exitState, null, null, null, true, 'isExpAll', 'frmCnt');
         } else {
            props.loadItems(chapId, subId, exitState, null, null, true, true, '', 'frmCnt');
         }
      }
   }, []);

   // Chapter name handler
   const chapNameHandler = (event) => {
      setChapter(event.target.value);
   }
   // SubChapter name handler
   const subChapNameHandler = (event) => {
      setSubChapName(event.target.value);
   }
   //adding the chapter
   const addChapterHandler = (view) => {
      const oReq = {
         TPID: props.teachContent && props.teachContent[0] && props.teachContent[0].TPID ? props.teachContent[0].TPID : '',
         SubjId: props.teachContent[0].SubjId,
         isread: true,
         chapId: chapId,
         Chapter: [
            {
               ChapName: chapterName,
               vSts: view
            }
         ]
      }
      if (chapId && chapId.length > 0) {
         oReq.oldTitle = oldTitle;
      }
      const selcDtls = {
         CrID: exitState.CrID,
         DeptID: exitState.DeptID,
         InId: exitState.InId,
         PrID: exitState.PrID,
         SemID: exitState.SemID,
         SubjId: exitState.subId,
         AcYr: exitState.AcYr,
         SecID: exitState.SecID,
         staffId: props.session.mappedid,
         isFE: props.session.fe ? true : false,
         isAllSubject: false,
         OutCmBsdEdu: props.OutCmBsdEdu,
         isFrmLms: true
      }
      props.addChapter(oReq, selcDtls);
      setChapter('');
      setChapId('');
      chapterModal(false);
   }
   //adding the subchapter
   const addSubChapterHandler = (view) => {
      if (subChapName && subChapName.length > 0 && duration && !isNaN(duration)) {
         setModalErr(false);
         setNamnumErr(false);
         const oReq = {
            TPID: props.teachContent && props.teachContent[0] && props.teachContent[0].TPID ? props.teachContent[0].TPID : '',
            SubjId: props.teachContent && props.teachContent[0] && props.teachContent[0].SubjId ? props.teachContent[0].SubjId : '',
            chapId: values.chapId,
            SubChapter: [{
               Name: subChapName,
               ScNo: values.ScNo,
               Dur: parseInt(duration),
               vSts: view
            }],
            subChapter: true,
            sChpId: subChapId
         }
         if (subChapId && subChapId.length > 0) {
            oReq.oldTitle = oldTitle;
         }
         const selcDtls = {
            CrID: exitState.CrID,
            DeptID: exitState.DeptID,
            InId: exitState.InId,
            PrID: exitState.PrID,
            SemID: exitState.SemID,
            SubjId: exitState.subId,
            AcYr: exitState.AcYr,
            SecID: exitState.SecID,
            staffId: props.session.mappedid,
            isFE: props.session.fe ? true : false,
            isAllSubject: false,
            OutCmBsdEdu: props.OutCmBsdEdu,
            isFrmLms: true
         }
         props.addSubChapter(oReq, selcDtls);
         //this.props.history.go(-1)
         setSubChapName('');
         setSubChapterId('');
         setDuration('');
         subChapterModal(false);
      } else {
         if (duration === undefined || !duration) {
            setModalErr(true);
            return;
         }
         // Check is number only
         if (isNaN(duration)) {
            setNamnumErr(true);
            return;
         }
      }

   }
   //Edit SupChapter Item(Page/File/Assignment)
   const editSubchapItem = (itemId, type, chapId, subId) => {
      if (type === "PAGE") {
         history.push({ pathname: '/home-page/pages', search: `?id=${itemId}&chapId=${chapId}&subId=${subId}`, state: exitState });
      } else if (type === "FILE") {
         history.push({ pathname: '/home-page/files-upload', search: `?id=${itemId}&chapId=${chapId}&subId=${subId}`, state: exitState });
      } else if (type === "ASGMNT") {
         history.push({ pathname: '/home-page/assignment', search: `?id=${itemId}&chapId=${chapId}&subId=${subId}`, state: exitState });
      } else if (type === "QUIZ") {
         history.push({ pathname: '/home-page/quiz-creation', search: `?id=${itemId}&chapId=${chapId}&subId=${subId}`, state: exitState });
      } else if (type === "SCORM") {
         history.push({ pathname: '/home-page/scorm-addfile', search: `?id=${itemId}&chapId=${chapId}&subId=${subId}`, state: exitState });
      }
   }

   // Duplicate content
   const duplicateContent = (oContentData) => {
      const oReqCnt = {
         cntId : oContentData._id,
      }
      let loadParams = {};
      // Check to accordition open in subchapter for contents
      if (localStorage.getItem('chapId') && localStorage.getItem('subId')) {
         let chapId = localStorage.getItem('chapId');
         let subId = localStorage.getItem('subId');
         if ((props && props.isExpItm) || (location && location.itemObj && location.itemObj.isExpItm === "true")) {  // Expand chapters, sub chapters and contents
            loadParams = {chapId : null, subId : subId, stateValues : exitState, type : null, finalChk : null, isItem : null, isReqNm : true, isFrmKey : 'isExpAll', frmKey : 'frmCnt'};
         } else {
            loadParams = {chapId : chapId, subId : subId, stateValues : exitState, type : null, finalChk : null, isItem : true, isReqNm : true, isFrmKey : '', frmKey : 'frmCnt'};
         }
      }
      props.duplicateContent(oReqCnt, loadParams);
   }

   //To delete SupChapter Item(Page/File/Assignment)
   const deleteSupChapItem = (itemId) => {
      HTTPService.post('/teaching-content/deactive-subchapter-items', { id: itemId }, null, function (err, response) {
         if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "UPDATED_SUCCESS") {
            props.loadItems(values.chapId, values.subId, exitState);
            // Nodification for content delete
            props.changesAutoSave();
            // messageUtil.showSuccess("CONTENT_SUBCHAPTER_ITEM_DELETE",true);
         } else if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "NO_DOCS_FOUND") {
            messageUtil.showInfo("CONTENT_ITEM_NOT_DELETE", true);
         } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
         }
      });
      itemModalAction(false);
   }
   //To delete teaching content chapter
   const deleteChapter = (dlteId) => {
      const oReq = {
         TPID: props.teachContent[0].TPID,
         SubjId: props.teachContent[0].SubjId,
         Chapid: dlteId,
         isFrmLms: true
      }
      HTTPService.post('/teach-content-definition/delete-chap-frm-lms', oReq, null, (err, data) => {
         if (data && data.output) {
            if (data.output.data && data.output.data.length > 0) {
               // Nodification for chapter delete
               props.changesAutoSave();
               // messageUtil.showSuccess("CONTENT_CHAPTER_DELETE",true); 
               const selcDtls = {
                  CrID: exitState.CrID,
                  DeptID: exitState.DeptID,
                  InId: exitState.InId,
                  PrID: exitState.PrID,
                  SemID: exitState.SemID,
                  SubjId: exitState.subId,
                  AcYr: exitState.AcYr,
                  SecID: exitState.SecID,
                  staffId: props.session.mappedid,
                  isFE: props.session.fe ? true : false,
                  isAllSubject: false,
                  OutCmBsdEdu: props.OutCmBsdEdu,
                  isFrmLms: true
               }
               // const rslvData={
               //    AcYrNm:exitState.AcYrNm,
               //    SemName:exitState.SemName,
               //    CrName:exitState.CrName,
               //    SecName:exitState.SecName
               // }
               props.getTeachContentBySubjSelection(selcDtls);
            } else {
               messageUtil.showInfo("CHAPTER_NOT_DELETED", true);
            }
         } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
         }

      });
      chapModalAction(false);
   }
   //To delete teaching content sub chapter
   const deleteSubChapter = (chapId, subChapId) => {
      const oReq = {
         TPID: props.teachContent[0].TPID,
         SubjId: props.teachContent[0].SubjId,
         Chapid: chapId,
         SubChapId: subChapId,
         isFrmLms: true
      }
      HTTPService.post('/teach-content-definition/delete-sub-chap-frm-lms', oReq, null, (err, data) => {
         if (data && data.output) {
            if (data.output.data && data.output.data.length > 0) {
               // Nodification for subchapter delete
               props.changesAutoSave();
               // messageUtil.showSuccess("CONTENT_SUB_CHAPTER_DELETE",true); 
               const selcDtls = {
                  CrID: exitState.CrID,
                  DeptID: exitState.DeptID,
                  InId: exitState.InId,
                  PrID: exitState.PrID,
                  SemID: exitState.SemID,
                  SubjId: exitState.subId,
                  AcYr: exitState.AcYr,
                  SecID: exitState.SecID,
                  staffId: props.session.mappedid,
                  isFE: props.session.fe ? true : false,
                  isAllSubject: false,
                  OutCmBsdEdu: props.OutCmBsdEdu,
                  isFrmLms: true
               }
               // const rslvData={
               //    AcYrNm:exitState.AcYrNm,
               //    SemName:exitState.SemName,
               //    CrName:exitState.CrName,
               //    SecName:exitState.SecName
               // }
               props.getTeachContentBySubjSelection(selcDtls);
            } else {
               messageUtil.showInfo("SUB_CHAP_NOT_DELETED", true);
            }
         } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
         }

      });
      subChapModalAction(false);
   }


   // Confirmation modal open and close for chapter delete
   const chapModalAction = (key, id, chapNm) => {
      if (key) {
         setDtleId(id);
         setChapDelModel(key);
         setChapter(chapNm);

      } else {
         setDtleId('');
         setChapter('');
         setChapDelModel(key);
      }
   };

   // Confirmation modal open and close for sub chapter delete
   const subChapModalAction = (key, id, subChapId, subChapNm) => {
      if (key) {
         setDtleId(id);
         setsubChapDelModel(key);
         setSubChapterId(subChapId);
         setSubChapName(subChapNm);
      } else {
         setDtleId('');
         setsubChapDelModel(key);
         setSubChapterId('');
         setSubChapName('');
      }
   };

   // Confirmation modal open and close for item delete
   const itemModalAction = (key, id, itemNm) => {
      if (key) {
         setDtleId(id);
         setitemDelModel(key);
         setItemName(itemNm);
      } else {
         setDtleId('');
         setitemDelModel(key);
         setSubChapterId('');
         setItemName('');
      }
   };
   //Maintain SeqNo in the state
   if (props.itemLength && !isNaN(props.itemLength)) {
      Object.assign(exitState, { seqNo: props.itemLength });
   }

   // Reordering elements for chapter
   const chapterHandler = (result) => {
      if (UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"])) {
         let oReq = {
            TPID: location.state.TPID,
            subjId: location.state.subId,
            chapId: result.draggableId,
            chap: true,
            subchap: true,
            oldIndex: result && result.source && result.source.index + 1,
            newIndex: result && result.destination && result.destination.index + 1
         }
         const chapterArrCpy = [...props.chapterArray];
         const [reorderedItem] = chapterArrCpy.splice(result.source.index, 1);
         chapterArrCpy.splice(result && result.destination && result.destination.index, 0, reorderedItem);
         if (oReq.oldIndex && oReq.newIndex && oReq.oldIndex !== oReq.newIndex) {
            let oSelDtls = {
               CrID: location.state.CrID,
               DeptID: location.state.DeptID,
               InId: location.state.InId,
               PrID: location.state.PrID,
               SemID: location.state.SemID,
               AcYr: location.state.AcYr,
               SecID: location.state.SecID,
               SubjId: location.state.subId,
               staffId: props.session.mappedid,
               isFE: props.session.fe ? true : false,
               isAllSubject: false,
               OutCmBsdEdu: props.OutCmBsdEdu,
               isFrmLms: true
            }
            props.lmsContentSorting(oReq, oSelDtls);
            props.updateFields('chapterArray', chapterArrCpy);
         }
      }
   }

   // Reordering elements for subchapter 
   const subchapHandler = (result, id) => {
      if (UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"])) {
         let oReq = {
            TPID: location.state.TPID,
            subjId: location.state.subId,
            chapId: id,
            subChapId: result.draggableId,
            subchap: true,
            oldIndex: result && result.source && result.source.index + 1,
            newIndex: result && result.destination && result.destination.index + 1
         }
         // Matching source and destination id for not moving the subchapter across chapters only allowed to swap within the chapters
         if (props.chapterArray && props.chapterArray.length && result.source.droppableId === result.destination.droppableId) {
            for (let chp = props.chapterArray.length - 1; chp >= 0; chp--) {
               if (id === props.chapterArray[chp]._id) {
                  if (oReq.oldIndex && oReq.newIndex && oReq.oldIndex !== oReq.newIndex) {
                     const [reorderedItem] = props.chapterArray[chp].SubChapter.splice(result.source.index, 1);
                     props.chapterArray[chp].SubChapter.splice(result && result.destination && result.destination.index, 0, reorderedItem);
                     props.lmsContentSorting(oReq);
                  }
                  break;
               }
            }
         }
      }
   }
   // Reordering elements for subchapter items
   const itemHandler = (result) => {
      if (UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"])) {
         let oReq = {
            // chapId: chapId,
            // subChapId: subChapId,
            subjId: location.state.subId,
            CrID: exitState.CrID,
            DeptID: exitState.DeptID,
            PrID: exitState.PrID,
            SemID: exitState.SemID,
            AcYr: exitState.AcYr,
            SecID: exitState.SecID,
            cntId: result.draggableId,
            items: true,
            oldIndex: result && result.source && result.source.index + 1,
            newIndex: result && result.destination && result.destination.index + 1
         }
         if (!result.destination) {
            return;
         }
         let aCntNtExInRq = true;
         let indVl = {
            frCpIn: 0,
            frSbIn: 0,
            toCpIn: 0,
            toSbIn: 0,
         };
         if (props.chapterArray && props.chapterArray.length) {
            // Get the source destination indexes and ids
            props.chapterArray.forEach((chapElement, chpInx) => {
               chapElement.SubChapter.forEach((subchapElement, sbIndx) => {
                  if (result.source.droppableId === subchapElement._id) {
                     indVl.frCpIn = chpInx;
                     indVl.frSbIn = sbIndx;
                     oReq.frmChapId = chapElement._id;
                     oReq.frmSubChapId = subchapElement._id;
                  }
                  if (result.destination.droppableId === subchapElement._id) {
                     indVl.toCpIn = chpInx;
                     indVl.toSbIn = sbIndx;
                     oReq.toChapId = chapElement._id;
                     oReq.toSubChapId = subchapElement._id;
                  }
               })
            })
            if (oReq.frmChapId === oReq.toChapId && oReq.frmSubChapId === oReq.toSubChapId && result.source.index === result.destination.index) {
               // Moving the same item but to restric the route call
               return;
            }
            // Set starting sequence no
            if (result && result.source && (result.source.index || result.source.index === 0)) {
               if (props.chapterArray && props.chapterArray[indVl.frCpIn] && props.chapterArray[indVl.frCpIn].SubChapter && props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn] && props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aContents[result.source.index]) {
                  if(props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aReqmnts && props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aReqmnts.length){
                     if((props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aReqmnts.indexOf(result.draggableId) !== -1) && oReq.frmSubChapId !== oReq.toSubChapId){
                        aCntNtExInRq = false;
                     }
                  }
                  oReq.startSeq = props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aContents[result.source.index].seqNo;
               }
            }
            // Not allow to move the content if it is mapped in requirement and can be moved within the sub chapter but not outside
            if(!aCntNtExInRq){
               messageUtil.showWarning("CONTENT_CANNOT_BE_DRAGGED", true);
               return;
            }
            // Get the first or last sequence no between chapters and sub chapters
            let nxtChpInd = indVl.toCpIn;
            let nxtsbChpInd = indVl.toSbIn;
            let getFirstInd = false;   // return last or first index
            const getChapForSeqNo = (key, callback) => {
               if(!key){
                  if(indVl.frCpIn > indVl.toCpIn){ // Previous
                     nxtsbChpInd += 1;
                     getFirstInd = true;
                  }else{
                     nxtsbChpInd -= 1; // Next
                     getFirstInd = false;
                  }
               }
               if(props.chapterArray[nxtChpInd] && props.chapterArray[nxtChpInd].SubChapter && props.chapterArray[nxtChpInd].SubChapter[nxtsbChpInd] && 
                  props.chapterArray[nxtChpInd].SubChapter[nxtsbChpInd].aContents && props.chapterArray[nxtChpInd].SubChapter[nxtsbChpInd].aContents.length){
                     const aSeqContents = [...props.chapterArray[nxtChpInd].SubChapter[nxtsbChpInd].aContents];
                     let finInd = undefined;
                  if(!getFirstInd){
                     finInd = aSeqContents[aSeqContents.length-1].seqNo;
                  }else{
                     finInd = aSeqContents[0].seqNo;
                  }
                  callback(finInd); // return the sequence no
               }else{
                  getFirstInd = false;
                  // Checking for next or previous subchapter for cotents exists
                  if(props.chapterArray[nxtChpInd].SubChapter && props.chapterArray[nxtChpInd].SubChapter.length && 
                     nxtsbChpInd >= 0 && nxtsbChpInd <= props.chapterArray[nxtChpInd].SubChapter.length-1){
                     return getChapForSeqNo(null, callback);   // Recursive callback function
                  }else{
                     // Checking for next or previous chapter for cotents exists
                     if(indVl.frCpIn > indVl.toCpIn){ // Previous
                        nxtChpInd += 1;
                        nxtsbChpInd = 0;
                        getFirstInd = true;
                     }else{
                        nxtChpInd -= 1; // Next
                        nxtsbChpInd = props.chapterArray[nxtChpInd].SubChapter.length-1;
                     }
                     return getChapForSeqNo('frmChap', callback);
                  }
               }
               
            }
            // Get last or first sequnce no from within the sub chapters
            let nxtSbInd = indVl.toSbIn;
            const getFirstSeqNoOfSubChp = (callback) => {
               let getFirstInd = false;
               if(indVl.frSbIn > nxtSbInd){  // Previous
                  getFirstInd = true;
                  nxtSbInd +=1;
               }else{   // Next
                  nxtSbInd -=1;
               }
               if(props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd] && props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd].aContents && props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd].aContents.length){
                  let finSeqNo = undefined;
                  if(!getFirstInd){
                     finSeqNo = props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd].aContents[props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd].aContents.length - 1].seqNo;
                  }else{
                     finSeqNo = props.chapterArray[indVl.toCpIn].SubChapter[nxtSbInd].aContents[0].seqNo;
                  }
                  callback(finSeqNo);
               }else{
                  // Check content exists in next sub chapters within the same chapter
                  return getFirstSeqNoOfSubChp(callback);
               }
            }

            // Find the ending sequnce no.
            function getEndSeqNo(){
               // Within the chapter with no contents
               if(oReq.frmChapId === oReq.toChapId){
                  getFirstSeqNoOfSubChp((lastSeqNo) => {
                     oReq.endSeq = lastSeqNo;
                  });
               }else{
                  // check between chapters and sub chapters
                  getChapForSeqNo(null, (lstSeqNo) => {
                     oReq.endSeq = lstSeqNo;
                  });
               }
            }
            // Set Ending sequence no
            if (result && result.destination && (result.destination.index || result.destination.index === 0) &&
               (props.chapterArray && props.chapterArray[indVl.toCpIn] && props.chapterArray[indVl.toCpIn].SubChapter && props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn])) {
                  if(props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents && props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents.length){
                     // if Put the item in last index then get the next sequnce no
                     if (result.destination.index === props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents.length) {
                        oReq.endSeq = props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents[props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents.length - 1].seqNo;
                        if (oReq.startSeq > oReq.endSeq) {
                           oReq.endSeq += 1;
                        }
                     } else {
                        // if Put the item in first index then get the previous sequnce no
                        if (props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents[result.destination.index]) {
                           if (result.destination.index === 0) {
                              oReq.endSeq = props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents[result.destination.index].seqNo;
                              if (oReq.startSeq < oReq.endSeq && result.source.droppableId !== result.destination.droppableId) {
                                 oReq.endSeq -= 1;
                              }
                           } else {
                              // If put the item in between the indexes
                              oReq.endSeq = props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents[result.destination.index].seqNo;
                           }
                        }
                     }
                  }else{
                     getEndSeqNo();
                  }
            }
            const [reorderedItem] = props.chapterArray[indVl.frCpIn].SubChapter[indVl.frSbIn].aContents.splice(result.source.index, 1);
            props.chapterArray[indVl.toCpIn].SubChapter[indVl.toSbIn].aContents.splice(result && result.destination && result.destination.index, 0, reorderedItem);
            props.lmsContentSorting(oReq, (docs) => {
               if(docs && docs.aDocs && docs.aDocs.length){
                  const oGrpUpdCnts = _.groupBy(docs.aDocs, '_id');
                  const aChptrCpy = [...props.chapterArray];
                  // Set the updated sequence no for contents
                  for(let chp = aChptrCpy.length - 1; chp >= 0; chp--){
                     if(aChptrCpy[chp].SubChapter && aChptrCpy[chp].SubChapter.length){
                        for(let sbCp = aChptrCpy[chp].SubChapter.length - 1; sbCp >= 0; sbCp--){
                           if(aChptrCpy[chp].SubChapter[sbCp].aContents && aChptrCpy[chp].SubChapter[sbCp].aContents.length){
                              for(let cnt = aChptrCpy[chp].SubChapter[sbCp].aContents.length - 1; cnt >= 0; cnt--){
                                 if(oGrpUpdCnts[aChptrCpy[chp].SubChapter[sbCp].aContents[cnt]._id] && oGrpUpdCnts[aChptrCpy[chp].SubChapter[sbCp].aContents[cnt]._id].length){
                                    aChptrCpy[chp].SubChapter[sbCp].aContents[cnt].seqNo = oGrpUpdCnts[aChptrCpy[chp].SubChapter[sbCp].aContents[cnt]._id][0].seqNo;
                                 }
                              }
                           }
                        }
                     }
                  }
                  props.updateFields('chapterArray', aChptrCpy);
               }
            });
         }
      }
   }

   // Re-ordering element handlers on drag end

   const onDragEndHandler = (result) => {
      if (result.type === "chapterDrag") {
         chapterHandler(result);
      } else if (result.type === "subChapterDrag") {
         subchapHandler(result, result.source.droppableId);
      } else if (result.type === "contentDrag") {
         itemHandler(result);
      }
   }

   //Resume Student Content Navigation
   const resumeCntHandler = () => {
      if (props.studProgsDtls.type === "PAGE") {
         history.push({ pathname: "/home-page/page-content", search: `?id=${props.studProgsDtls._id}&chapId=${props.studProgsDtls.chapId}&subId=${props.studProgsDtls.sChpId}`, state: exitState });
      } else if (props.studProgsDtls.type === "FILE") {
         history.push({ pathname: "/home-page/files-view", search: `?id=${props.studProgsDtls._id}&chapId=${props.studProgsDtls.chapId}&subId=${props.studProgsDtls.sChpId}`, state: exitState });
      } else if (props.studProgsDtls.type === "ASGMNT") {
         history.push({ pathname: "/home-page/assignment-view", search: `?id=${props.studProgsDtls._id}&chapId=${props.studProgsDtls.chapId}&subId=${props.studProgsDtls.sChpId}`, state: exitState });
      }
   }


   // chapter and subchapter publsh unpublsh
   const svePublish = (vSts, chapId, sChpId, chapIndex, eachSubChapIndex) => {
      if (props && props.editMode) {
         let oReq = {
            chapId: chapId,
            chapIndex: chapIndex,
            chapList: true,
            vSts: vSts
         }
         if (sChpId) {
            oReq.sChpId = sChpId
            oReq.SubChapIndex = eachSubChapIndex;
         }
         props.chpSubChpPblshUnPblsh(oReq);
      }
   }

   // content items publish unpublish
   const publishContent = (vSts, subChpItm, chpIdx, subChpIdx, subItmIdx) => {
      if (props && props.editMode) {
         let oReq = {
            _id: subChpItm,
            vSts: vSts,
            chpIdx: chpIdx,
            subChpIdx: subChpIdx,
            subItmIdx: subItmIdx
         }
         props.contItmsPblshUnPblsh(oReq);
      }
   }
   // Subchapter accortion handler
   const subChapAccrdionHandler = (event, chapId, subChapId, subChapItemLoad) => {
      let currentTarget = event.currentTarget.ariaExpanded;
      if (subChapItemLoad) {
         if (currentTarget === null || currentTarget === "false") {
            props.loadItems(chapId, subChapId, exitState, null, null, null, true);
         }
      }
   };

   return (
      <div>
         <StudentWrapper>
            {props.studProgsDtls && !_.isEmpty(props.studProgsDtls) &&
               <div className="chapter-progress_box">
                  {props.studProgsDtls.progsPrcnt && props.studProgsDtls.progsPrcnt === "100%" ?
                     <div className="chapter-progress_complete">
                        <p className="file-loader_icon"><CheckCircle className="svg-icon_default  icon-positive" /> </p>
                        <p className="file-complete_label">{props.t("translate:SUBJECT_COMPLETED")}</p>
                     </div>
                     :
                     <div className="chapter-progress_cont">
                        <p className="file-loader_icon">
                           {props.studProgsDtls.type === "PAGE" ?
                              <FileText className="svg-icon_default  icon-primary" />
                              : props.studProgsDtls.type === "FILE" ?
                                 <Paperclip className="svg-icon_default  icon-primary" />
                                 : props.studProgsDtls.type === "ASGMNT" ?
                                    <Columns className="svg-icon_default  icon-primary" />
                                    : null
                           }
                        </p>
                        <p className="file-loader_heading">{props.studProgsDtls.title}</p>
                        <p className="file-loader_label"> {props.studProgsDtls.subChapNm}</p>
                        <p className="file-loader_btn"><Button theme="btn-rounded default" clicked={() => resumeCntHandler()}> <Play className="svg-icon_small icon-space_left" />{props.t("translate:RESUME_PAGE")}</Button> </p>
                     </div>
                  }
                  <div className="chapter-progress">
                     <div className="chapter-progress_value">
                        <p className="progress-label">{props.t("translate:MY_PROGRESS")}</p>
                        <p className="progress-label">{props.studProgsDtls.progsPrcnt}</p>
                     </div>
                     <ProgressBar studentProgressBar={true} widthprog={props.studProgsDtls.progsPrcnt} progressBarTheme="progress-bar_content " className={UserSession.getArchCrsDtls() && !_.isEmpty(UserSession.getArchCrsDtls() ) ? "progress-bar_student--archived" : "progress-bar_student" }/>
                  </div>
               </div>
            }
         </StudentWrapper>
         <DragDropContext onDragEnd={onDragEndHandler}>
            {/* onDragEnd={chapterHandler} */}
            <Droppable droppableId="droppable" type={`chapterDrag`}>
               {(provided) => (
                  <div class="panel-group" id="accordion" {...provided.droppableProps} ref={provided.innerRef}>
                     {props.chapterArray.map((eachChap, i) => {
                        // eachContent.Chapter.map((eachChap, i) => [
                        return (
                           <Draggable key={eachChap._id} draggableId={eachChap._id} index={i}>
                              {(provided) => (
                                 <div>
                                    <div className="panel-header" ref={UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"]) ? provided.innerRef : null} {...provided.draggableProps} {...provided.dragHandleProps} >
                                       <div class="panel panel-default student-info_cont" onClick={() => {
                                          setChapInfo(eachChap._id);
                                          // localStorage.removeItem('chapId');
                                          localStorage.setItem('chapId', eachChap._id);
                                          localStorage.removeItem('subId');
                                       }
                                       }>

                                          <div class="row m-0" >
                                             <div class="col p-0">
                                                <div className="chapter-list_content">
                                                   <StaffWrapper>
                                                      <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>
                                                         {props.editMode && <span  {...provided.dragHandleProps}><MoveOption iconStyle="svg-icon_small icon-default icon-grab right-icon" /></span>}
                                                      </UIPerWrapper>
                                                   </StaffWrapper>
                                                   <div class="panel-heading select-box">
                                                      <button class="panel-title toggle-btn" data-toggle="collapse" tabIndex="0" data-target={`#id${JSON.stringify(i)}`} >
                                                         <div className="panel-body ">
                                                            <div class="row m-0">
                                                               <div class="col-12 p-0">
                                                                  <p className="panel-name">
                                                                     {/* {props.t("translate:Chapter")} {i + 1} : */}
                                                                     {eachChap.ChapName}</p>
                                                                     {(eachChap.preReqNm && eachChap.lkUnDt) ? <p className="stud-chapter_label"><span className="stud-label_default">{props.t("translate:PREREQUISITES")}</span> {eachChap.preReqNm} <span> {isSubtractOneDay(eachChap.lkUnDt)}</span> </p> : 
                                                                        eachChap.preReqNm ? <p className="stud-chapter_label"><span className="stud-label_default">{props.t("translate:PREREQUISITES")}</span> {eachChap.preReqNm} </p> : 
                                                                        eachChap.lkUnDt ? (<p className="stud-chapter_label"><span> {isSubtractOneDay(eachChap.lkUnDt)}</span> </p>) : ''
                                                                     } 
                                                               </div>
                                                            </div>
                                                         </div>
                                                      </button>
                                                   </div>
                                                </div>
                                             </div>
                                             <div class="col-auto p-0">
                                                <div class="content-editors" onClick={() =>
                                                   history.push({ search: `?ischap=${true}&chapId=${eachChap._id}&ScNo=${eachChap.SubChapter.length + 1}`, state: exitState })
                                                }>
                                                   {!location.state?.isDisabledContent &&
                                                   <StaffWrapper>
                                                      <div className={isChapInfo === eachChap._id ? "stud-info_view" : "stud-chapter_info"}>
                                                         {/* stff addchap */}
                                                         <span className="tooltip--bottom" data-tooltip="More info">
                                                            <Info className="svg-icon_small icon-default icon-pointer"
                                                               onClick={() => handleChapInfo(eachChap._id)}
                                                            />
                                                         </span>
                                                      </div>

                                                      <UIPerWrapper perCode={["rp_can_pub_lms_chap_subchap"]}>{eachChap && eachChap.vSts && eachChap.vSts === 'F' ?
                                                         <span className="tooltip--bottom" data-tooltip="Published">
                                                            {/* <Select iconStyle="svg-icon_small icon-default " /> */}
                                                            <CheckCircle onClick={() => svePublish("D", eachChap._id, null, i, null)} className="svg-icon_extra-small icon-positive left-icon icon-pointer" />
                                                         </span>
                                                         :
                                                         <span className="tooltip--bottom" data-tooltip="Unpublished">
                                                            <Slash onClick={() => svePublish("F", eachChap._id, null, i, null)} className="svg-icon_extra-small icon-default left-icon icon-pointer" />
                                                         </span>
                                                      }</UIPerWrapper>

                                                      <UIPerWrapper perCode={["rp_can_create_or_edit_lms_chap_subchap"]}>{props.editMode &&
                                                         <span onClick={() => subChapterModal(true)} className="tooltip--bottom" data-tooltip="Add subchapter">
                                                            <Plus className="svg-icon_small icon-default icon-pointer left-icon" />
                                                         </span>
                                                      }</UIPerWrapper>
                                                      {props.editMode && !location.state?.isDisabledContent &&
                                                         <div className="more-options" >
                                                            <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                                               <MoreVertical className="svg-icon_small icon-default left-icon icon-pointer" />
                                                            </div>
                                                            <div class="dropdown-menu edit-chapter_cont">
                                                               <UIPerWrapper perCode={["rp_can_create_or_edit_lms_chap_subchap"]}><div class="dropdown-item user-info_contents" onClick={() => {
                                                                  setOldTitle(eachChap.ChapName);
                                                                  chapterModal(true, eachChap.ChapName, eachChap._id, true)
                                                               }}>
                                                                  <Edit className="svg-icon_light  icon-default" />
                                                                  <span className="option-list_dropdown">{props.t("translate:CHAPTERLISTCOMPONENT_EDIT")}</span>
                                                               </div></UIPerWrapper>
                                                               {/* <div class="dropdown-item user-info_contents">
                                    <Book iconStyle="svg-icon_light  icon-default"/>
                                    <span className="option-list_dropdown">{props.t("translate:CHAPTERLISTCOMPONENT_DUPLICATE")}</span> 
                                 </div> */}
                                                               <UIPerWrapper perCode={["rp_can_delete_lms_chap_subchap"]}><div class="dropdown-item user-info_contents" onClick={() =>
                                                                  //Open Confirmation Modal for chapter delete 
                                                                  chapModalAction(true, eachChap._id, eachChap.ChapName)
                                                               }>
                                                                  <Trash2 className="svg-icon_light icon-error" />
                                                                  <span className="option-list_dropdown delete-chap_cont">{props.t("translate:CHAPTERLISTCOMPONENT_DELETE")}</span>
                                                               </div></UIPerWrapper>
                                                            </div>
                                                         </div>
                                                      }
                                                   </StaffWrapper>
                                                    }
                                                   <StudentWrapper>
                                                      <div className="stud-chapter_info">
                                                         <Info className="svg-icon_small icon-default icon-pointer"
                                                            onClick={() => handleChapInfoAno(eachChap._id)} />
                                                      </div>
                                                   </StudentWrapper>
                                                   
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                       {/* subchapter position */}
                                       {/* <DragDropContext onDragEnd={(result)=>subchapHandler(result,eachChap._id)}> */}
                                       <Droppable droppableId={eachChap._id} type={`subChapterDrag`}>
                                          {(provided) => (
                                             <div id={`id${JSON.stringify(i)}`} class="panel-collapse collapse" {...provided.droppableProps} ref={provided.innerRef}>
                                                {eachChap.SubChapter.map((eachSubChap, eachSubChapIndex) => {
                                                   // Create reference for each sub chapter user for scroll to last viewed subchapter
                                                   const ref = React.createRef();
                                                   const handleClick = () => {
                                                      if (ref && ref.current) {
                                                         ref.current.style.position = 'relative';
                                                         ref.current.style.bottom = '200px';
                                                         ref.current.scrollIntoView({
                                                            behavior: 'smooth',
                                                            block: 'start'
                                                         });
                                                      }
                                                   }
                                                   return (
                                                      <Draggable key={eachSubChap._id} draggableId={eachSubChap._id} index={eachSubChapIndex}>
                                                         {(provided) => (
                                                            <div>
                                                               <div ref={UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"]) ? provided.innerRef : null} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => {
                                                                  setsubChapterId(eachSubChap._id)  // set subchapter autoclose
                                                                  if (subChapItemLoad) {
                                                                     props.getSubChapName(eachSubChap.Name);
                                                                     history.push({ search: `?chapId=${eachChap._id}&subId=${eachSubChap._id}&chapIndex=${i}`, state: exitState });
                                                                     //  props.loadItems(eachChap._id,eachSubChap._id,exitState,null,null,null,true);
                                                                  }
                                                               }}>
                                                                  <div id={'sbChpScrl' + eachSubChap._id} ref={ref} onClick={() => handleClick()}></div>
                                                                  <div class={eachSubChap._id === subChapterId ? "panel-body cont-border" : "panel-body cont-inbox"} onClick={() => {
                                                                     localStorage.setItem('chapId', eachChap._id);
                                                                     localStorage.setItem('subId', eachSubChap._id);
                                                                  }}>
                                                                     <div class="panel panel-default panel-sub_content student-info_cont">
                                                                        <div class="row m-0 panel-sub_lists">
                                                                           <div class="col p-0">
                                                                              <div className="subchapter-list_content">
                                                                                 <StaffWrapper>
                                                                                    <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>
                                                                                       {props.editMode && <span {...provided.dragHandleProps}> <MoveOption iconStyle="svg-icon_small icon-default icon-grab right-icon" /> </span>}
                                                                                    </UIPerWrapper>
                                                                                 </StaffWrapper>
                                                                                 <div class="panel-heading sub-chapter_content">
                                                                                    <button class="panel-title toggle-btn" data-toggle="collapse" data-target={`#id${eachSubChap._id}`} ref={subChapref} onClick={(event) => subChapAccrdionHandler(event, eachChap._id, eachSubChap._id, subChapItemLoad)} >
                                                                                       <div class="panel-body sub-chapter_name">
                                                                                          <div class="m-0">
                                                                                             <div class="p-0">
                                                                                                <p className="sub-chap_name">
                                                                                                   {/* {props.t("translate:CHAPTERLISTCOMPONENT_SUB_CHAPTER")}{eachSubChapIndex + 1} :  */}
                                                                                                   {eachSubChap.Name}</p>
                                                                                                {/* <p className="panel-content">{eachSubChap.Name}</p> */}
                                                                                                {eachSubChap.reqCount && <p className="stud-chapter_label"><span className="stud-label_default">{props.t("translate:COMPLETE")} {eachSubChap.reqCount} {props.t("translate:ITEMS")}</span> {eachSubChap.lkUnDt && <span> {props.t("translate:AVAILABLE_FROM")} {lmsDateAndTimeFormat(eachSubChap.lkUnDt)} </span>} </p>}

                                                                                                <ul class="list-cont_date">
                                                                                                   {/* <li>Dec 30, 2020</li> */}
                                                                                                   {/* <li>3 pts</li> */}
                                                                                                </ul>
                                                                                             </div>
                                                                                          </div>
                                                                                       </div>
                                                                                    </button>
                                                                                 </div>
                                                                              </div>
                                                                           </div>
                                                                           {!location.state?.isDisabledContent &&
                                                                           <StaffWrapper>
                                                                              <div class="col-auto p-0">
                                                                                 <div className="select-cont_box" >
                                                                                    <div className="stud-chapter_info">
                                                                                       {/* Show subchap info */}
                                                                                       <Info className="svg-icon_small icon-default icon-pointer"
                                                                                          onClick={() => handleSubChapInfo(eachChap._id, eachSubChap._id)} />
                                                                                    </div>
                                                                                    <UIPerWrapper perCode={['rp_can_pub_lms_chap_subchap']}>{eachSubChap && eachSubChap.vSts && eachSubChap.vSts === 'F' ?
                                                                                       <span className="tooltip--bottom" data-tooltip="Published">
                                                                                          {/* <Select iconStyle="svg-icon_small icon-default " /> */}
                                                                                          <CheckCircle className="svg-icon_extra-small icon-positive left-icon icon-pointer" onClick={() => svePublish("D", eachChap._id, eachSubChap._id, i, eachSubChapIndex)} />
                                                                                       </span>
                                                                                       :
                                                                                       <span className="tooltip--bottom" data-tooltip="Unpublished">
                                                                                          <Slash className="svg-icon_extra-small icon-default left-icon icon-pointer" onClick={() => svePublish("F", eachChap._id, eachSubChap._id, i, eachSubChapIndex)} />
                                                                                       </span>
                                                                                    }</UIPerWrapper>
                                                                                    <span >
                                                                                       {/* <Select iconStyle="svg-icon_small icon-default" /> */}
                                                                                       <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>{props.editMode &&
                                                                                          <span className="tooltip--bottom" data-tooltip="Add Item" data-toggle="modal" data-target="#myModal-page" onClick={() => {
                                                                                             history.push({ search: `?chapId=${eachChap._id}&subId=${eachSubChap._id}`, state: exitState })
                                                                                          }}>
                                                                                             <Plus className="svg-icon_small icon-default left-icon icon-pointer" />
                                                                                          </span>
                                                                                       }</UIPerWrapper>
                                                                                       {props.editMode &&
                                                                                          <div data-toggle="dropdown" id="dropdownMenuButton" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                                                                             <MoreVertical className="svg-icon_small icon-default left-icon icon-pointer" />
                                                                                          </div>
                                                                                       }
                                                                                       {props.editMode &&
                                                                                          <div class="dropdown-menu edit-chapter_cont">
                                                                                             <UIPerWrapper perCode={["rp_can_create_or_edit_lms_chap_subchap"]}><div class="dropdown-item user-info_contents" onClick={() => {
                                                                                                setOldTitle(eachSubChap.Name);
                                                                                                subChapterModal(true, eachSubChap.Name, eachSubChap._id, true, eachSubChap.Dur)
                                                                                             }}>
                                                                                                <Edit className="svg-icon_light  icon-default" />
                                                                                                <span className="option-list_dropdown" >{props.t("translate:EDIT")}</span>
                                                                                             </div></UIPerWrapper>
                                                                                             <UIPerWrapper perCode={["rp_can_delete_lms_chap_subchap"]}><div class="dropdown-item user-info_contents" onClick={() =>
                                                                                                //Open Confirmation Modal for sub chapter delete 
                                                                                                subChapModalAction(true, eachChap._id, eachSubChap._id, eachSubChap.Name)
                                                                                             }>
                                                                                                <Trash2 className="svg-icon_light icon-error" />
                                                                                                <span className="option-list_dropdown delete-chap_cont">{props.t("translate:DELETE")}</span>
                                                                                             </div></UIPerWrapper>
                                                                                          </div>
                                                                                       }
                                                                                    </span>
                                                                                 </div>
                                                                              </div>
                                                                           </StaffWrapper>
                                                                           }
                                                                           <StudentWrapper>
                                                                              <div className="stud-chapter_info">
                                                                                 {/* subchap */}
                                                                                 <Info className="svg-icon_small icon-default icon-pointer"
                                                                                    onClick={() => handleSubChapInfo(eachChap._id, eachSubChap._id)} />
                                                                              </div>
                                                                           </StudentWrapper>
                                                                        </div>
                                                                        {/* Items postions */}
                                                                        {/* <DragDropContext onDragEnd={(result)=>itemHandler(result,eachChap._id,eachSubChap._id)}> */}
                                                                        <Droppable droppableId={eachSubChap._id} type={`contentDrag`}>
                                                                           {(provided) => (
                                                                              <div id={`id${eachSubChap._id}`} class="panel-collapse collapse"  {...provided.droppableProps} ref={provided.innerRef}>
                                                                              <StudentWrapper>
                                                                              {props?.session?.isEnableAiChat && (
                                                                              <div className="quick-continer">
                                                                                 <div 
                                                                                    className="quick-view"
                                                                                    onClick={() => handleSubChapQuickClick(eachChap._id, eachSubChap._id, 'quiz')}
                                                                                 >
                                                                                    <div className="quick-flex">
                                                                                       <img src={QuizIcon} alt="Try Quiz" />
                                                                                       <p>{t('translate:TRY_QUIZ')}</p>
                                                                                    </div>
                                                                                       <div className="quick-next">
                                                                                       <ChevronRight />
                                                                                    </div>
                                                                                 </div>
                                                                                 <div 
                                                                                    className="quick-view"
                                                                                    onClick={() => handleSubChapQuickClick(eachChap._id, eachSubChap._id, 'flashCard')}
                                                                                 >
                                                                                    <div className="quick-flex">
                                                                                       <img src={FlashIcon} alt="Try Flash cards" />
                                                                                       <p>{t('translate:TRY_FLASH')}</p>
                                                                                    </div>
                                                                                    <div className="quick-next">
                                                                                       <ChevronRight />
                                                                                    </div>
                                                                                 </div>
                                                                                 <div 
                                                                                    className="quick-view"
                                                                                    onClick={() => handleSubChapQuickClick(eachChap._id, eachSubChap._id, 'shortSnippets')}
                                                                                 >
                                                                                    <div className="quick-flex">
                                                                                       <img src={ShortIcon} alt="Short Snippets" />
                                                                                       <p>{t('translate:TRY_SHORTSNIPPETS')}</p>
                                                                                    </div>
                                                                                    <div className="quick-next">
                                                                                       <ChevronRight />
                                                                                    </div>
                                                                                 </div>
                                                                              </div>
                                                                              )}
                                                                              </StudentWrapper>
                                                                                 {(eachSubChap.aContents && eachSubChap.aContents.length) ? (eachSubChap.aContents.map((subChapItemData, index) => {
                                                                                    return (
                                                                                       <Draggable key={subChapItemData._id} draggableId={subChapItemData._id} index={index} >
                                                                                          {(provided) => (
                                                                                             <div>
                                                                                                <div class="list-cont_inbox" ref={UserSession.isStaff() && props.editMode && UserSession.isGotPerm(["rp_can_create_or_edit_lms_content"]) ? provided.innerRef : null} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                                                   <div className="item-lists">
                                                                                                      <div class="row m-0">
                                                                                                         <div class="col-10 p-0">
                                                                                                            <div className="subchapter-list_items">
                                                                                                               <StaffWrapper>
                                                                                                                  <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}>
                                                                                                                     {props.editMode && <span {...provided.dragHandleProps}><MoveOption iconStyle="svg-icon_small icon-default icon-grab right-icon" /></span>}
                                                                                                                  </UIPerWrapper>
                                                                                                               </StaffWrapper>
                                                                                                               <StudentWrapper>
                                                                                                                  {subChapItemData.isHide ?
                                                                                                                     <div className="tooltip-suchapter_items" data-tooltip="You dont currently have access to this content">
                                                                                                                        <HideView iconStyle="svg-icon_small icon-default " />
                                                                                                                     </div>
                                                                                                                     : subChapItemData.isCompleted ?
                                                                                                                        <div className="tooltip-suchapter_items" data-tooltip="This item was marked completed">
                                                                                                                           <SelectView iconStyle="svg-icon_small icon-default " />
                                                                                                                        </div> :
                                                                                                                        <div className="tooltip-suchapter_items" data-tooltip="This item is not yet completed">
                                                                                                                           <CirCompIcon iconStyle="svg-icon_small icon-default " />
                                                                                                                        </div>
                                                                                                                  }

                                                                                                               </StudentWrapper>



                                                                                                               <div className="panel-list_items" onClick={() => {
                                                                                                                  subChapItemLoad = false;
                                                                                                                  //Set the subchapter name for footer show
                                                                                                                  //Object.assign(exitState,{subChapNm:eachSubChap.Name});
                                                                                                                  if (subChapItemData.type === "PAGE" && !subChapItemData.isHide) {
                                                                                                                     history.push({ pathname: "/home-page/page-content", search: `?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}&isItem=${true}&isExpItm=${props.isExpItm}&chapIndex=${i}`, state: exitState });
                                                                                                                  } else if (subChapItemData.type === "FILE" && !subChapItemData.isHide) {
                                                                                                                     history.push({ pathname: "/home-page/files-view", search: `?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}&isItem=${true}&isExpItm=${props.isExpItm}&chapIndex=${i}`, state: exitState });
                                                                                                                  } else if (subChapItemData.type === "ASGMNT" && !subChapItemData.isHide) {
                                                                                                                     //{UserSession.isStaff() ?
                                                                                                                     history.push({ pathname: "/home-page/assignment-view", search: `?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}&isItem=${true}&isExpItm=${props.isExpItm}&chapIndex=${i}`, state: exitState })
                                                                                                                     //    :history.push({pathname:"/home-page/assignment-view",search:`?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}`,state:exitState})
                                                                                                                     // }
                                                                                                                  } else if (subChapItemData.type === "QUIZ" && !subChapItemData.isHide) {
                                                                                                                     history.push({ pathname: "/home-page/quiz-content", search: `?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}&isItem=${true}&isExpItm=${props.isExpItm}&chapIndex=${i}&asmntId=${subChapItemData.asmnId}`, state: exitState });

                                                                                                                  }
                                                                                                                else if (subChapItemData.type === "SCORM" && !subChapItemData.isHide) {
                                                                                                                  history.push({ pathname: "/home-page/scorm-view", search: `?id=${subChapItemData._id}&chapId=${eachChap._id}&subId=${eachSubChap._id}&isItem=${true}&isExpItm=${props.isExpItm}&chapIndex=${i}`, state: exitState });

                                                                                                               }
                                                                                                               }}>
                                                                                                                  <div>
                                                                                                                     {subChapItemData.type === 'PAGE' ?
                                                                                                                        <FileText className={UserSession.isStaff() ? "svg-icon_default icon-dark" : subChapItemData.isHide ? "svg-icon_default icon-disable" : "svg-icon_default icon-dark"} />
                                                                                                                        : subChapItemData.type === 'FILE' ?
                                                                                                                           <Paperclip className={UserSession.isStaff() ? "svg-icon_default icon-dark" : subChapItemData.isHide ? "svg-icon_default icon-disable" : "svg-icon_default icon-dark"} />
                                                                                                                           : subChapItemData.type === 'ASGMNT' ?
                                                                                                                              <Columns className={UserSession.isStaff() ? "svg-icon_default icon-dark" : subChapItemData.isHide ? "svg-icon_default icon-disable" : "svg-icon_default icon-dark"} />
                                                                                                                              : subChapItemData.type === 'QUIZ' ?
                                                                                                                                 <Watch className={UserSession.isStaff() ? "svg-icon_default icon-dark" : subChapItemData.isHide ? "svg-icon_default icon-disable" : "svg-icon_default icon-dark"} />
                                                                                                                                 :subChapItemData.type === 'SCORM' ?
                                                                                                                                 <Package className={UserSession.isStaff() ? "svg-icon_default icon-dark" : subChapItemData.isHide ? "svg-icon_default icon-disable" : "svg-icon_default icon-dark"} />
                                                                                                                                 : null}
                                                                                                                  </div>
                                                                                                                  <div className={UserSession.isStaff() ? "list__date" : subChapItemData.isHide ? "list-name_hide" : "list__date"}>
                                                                                                                     <p className="sub-chapter_label">{subChapItemData.title}</p>
                                                                                                                     {(subChapItemData.type === 'PAGE' || subChapItemData.type === 'FILE') && subChapItemData.reqNm && <p className="req-item_label">{subChapItemData.reqNm}</p>}
                                                                                                                     {subChapItemData.type === 'ASGMNT' &&
                                                                                                                        <ul class="list-cont_date">
                                                                                                                           <StaffWrapper>
                                                                                                                              {subChapItemData.asgmnt && subChapItemData.asgmnt.asDuDt && <li>{lmsDateAndTimeFormat(subChapItemData.asgmnt.asDuDt)}</li>}
                                                                                                                              {subChapItemData.asgmnt && subChapItemData.asgmnt.mxMrk &&
                                                                                                                                 <li>{subChapItemData.asgmnt.mxMrk} pts</li>
                                                                                                                              }
                                                                                                                           </StaffWrapper>
                                                                                                                           {subChapItemData.reqNm &&
                                                                                                                              <li>{subChapItemData.reqNm} {subChapItemData.score}</li>
                                                                                                                           }
                                                                                                                        </ul>
                                                                                                                     }
                                                                                                                     {subChapItemData.type === 'QUIZ' &&
                                                                                                                        <ul class="list-cont_date">
                                                                                                                           <StaffWrapper>
                                                                                                                              {subChapItemData.quiz && subChapItemData.quiz.qzDuDt && <li>{lmsDateAndTimeFormat(subChapItemData.quiz.qzDuDt)}</li>}
                                                                                                                              {/* {subChapItemData.asgmnt && subChapItemData.asgmnt.mxMrk && 
                                    <li>{subChapItemData.asgmnt.mxMrk} pts</li>
                                 } */}
                                                                                                                           </StaffWrapper>
                                                                                                                           {subChapItemData.reqNm &&
                                                                                                                              //  <li>{subChapItemData.reqNm} {subChapItemData.score}</li>
                                                                                                                              <li>{subChapItemData.reqNm}</li>
                                                                                                                           }
                                                                                                                        </ul>
                                                                                                                     }
                                                                                                                     <StudentWrapper>
                                                                                                                        <p className="item-label_submit">
                                                                                                                           {/* <span className="item-extension_cont">COMPLETE ALL ITEMS</span>
                              <span className="dots-separates"></span> Not available unless: You complete Data structure basics | Dec 30, 2020 */}
                                                                                                                           {subChapItemData.grdSts && subChapItemData.grdSts === 'GRD' ?
                                                                                                                              <span className="assign-grad">{props.t("translate:STUD_ASMNT_GRADED")}</span> :
                                                                                                                              subChapItemData.asgmSts && subChapItemData.asgmSts === 'SUB' ?
                                                                                                                                 <span className="assign-submit">{props.t("translate:STUD_ASMNT_SUBMITTED")}</span> :
                                                                                                                                 subChapItemData.asgmSts === 'missed' ?
                                                                                                                                    <span className="assign-missed">{props.t("translate:MISSED")}</span> : null
                                                                                                                           }
                                                                                                                           {subChapItemData.asgmSts && subChapItemData.asgmSts !== 'NS' && subChapItemData.asgmSts !== 'subLate' &&
                                                                                                                              <span className="dots-separates"></span>
                                                                                                                           }
                                                                                                                           {subChapItemData.grdSts && subChapItemData.grdSts === 'GRD' ?
                                                                                                                              subChapItemData.asgmnt && subChapItemData.asgmnt.grdCnf && subChapItemData.asgmnt.grdCnf === "POINT" ?
                                                                                                                                 (
                                                                                                                                    <span className="assignment-due">
                                                                                                                                       {subChapItemData.mark}/{subChapItemData.asgmnt.mxMrk} {props.t("translate:STUD_ASMNT_POINTS")}
                                                                                                                                    </span>
                                                                                                                                 ) :
                                                                                                                                 (
                                                                                                                                    <span className="assignment-due">
                                                                                                                                       {subChapItemData.GrdNm} {props.t("translate:STUD_ASMNT_GRADE")}
                                                                                                                                    </span>
                                                                                                                                 )
                                                                                                                              : subChapItemData.aSubDt ?
                                                                                                                                 <span className="assignment-due">{lmsNonUTCDateAndTimeFormat(subChapItemData.aSubDt)}</span>
                                                                                                                                 : subChapItemData.asgmnt && subChapItemData.asgmnt.asDuDt ?
                                                                                                                                    <span className="assignment-due">{props.t("translate:STUD_ASMNT_DUE")}  {lmsDateAndTimeFormat(subChapItemData.asgmnt.asDuDt)}</span> : null
                                                                                                                           }
                                                                                                                        </p>
                                                                                                                     </StudentWrapper>
                                                                                                                  </div>
                                                                                                               </div>
                                                                                                            </div>
                                                                                                         </div>
                                                                                                         {!location.state?.isDisabledContent &&
                                                                                                         <StaffWrapper>
                                                                                                            <div class="col-2 p-0">
                                                                                                               <span className="selected_list">
                                                                                                                  <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{subChapItemData && subChapItemData.vSts && subChapItemData.vSts === 'F' ?
                                                                                                                     <span className="tooltip--bottom" data-tooltip="Published" onClick={() => publishContent('D', subChapItemData._id, i, eachSubChapIndex, index)}>
                                                                                                                        {/* <Select iconStyle="svg-icon_small icon-default " /> */}
                                                                                                                        <CheckCircle className="svg-icon_extra-small icon-positive icon-pointer" />
                                                                                                                     </span>
                                                                                                                     :
                                                                                                                     <span className="tooltip--bottom" data-tooltip="Unpublished" onClick={() => publishContent('F', subChapItemData._id, i, eachSubChapIndex, index)}>
                                                                                                                        <Slash className="svg-icon_extra-small icon-default icon-pointer" />
                                                                                                                     </span>
                                                                                                                  }</UIPerWrapper>
                                                                                                                  {props.editMode &&
                                                                                                                     <div className="more-options" >
                                                                                                                        <div data-toggle="dropdown" id="dropdownMenuButton" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                                                                                                           <MoreVertical className="svg-icon_small icon-default left-icon icon-pointer" />
                                                                                                                        </div>
                                                                                                                        <div class="dropdown-menu edit-chapter_cont">
                                                                                                                           <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div class="dropdown-item user-info_contents" onClick={() => {
                                                                                                                              if (subChapItemData.type) {
                                                                                                                                 subChapItemLoad = false;
                                                                                                                                 editSubchapItem(subChapItemData._id, subChapItemData.type, eachChap._id, eachSubChap._id);
                                                                                                                              }
                                                                                                                           }
                                                                                                                           }>
                                                                                                                              <Edit className="svg-icon_light  icon-default" />
                                                                                                                              <span className="option-list_dropdown" >{props.t("translate:EDIT")}</span>
                                                                                                                           </div></UIPerWrapper>
                                                                                                                           {
                                                                                                                              //DUPLICATE PAGE OPTION
                                                                                                                              subChapItemData.type && subChapItemData.type === 'PAGE' &&
                                                                                                                              <div class="dropdown-item user-info_contents" onClick={() => duplicateContent(subChapItemData)}>
                                                                                                                                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                                                                    <g clip-path="url(#clip0_23115_7720)">
                                                                                                                                    <path d="M13.3333 6H7.33333C6.59695 6 6 6.59695 6 7.33333V13.3333C6 14.0697 6.59695 14.6667 7.33333 14.6667H13.3333C14.0697 14.6667 14.6667 14.0697 14.6667 13.3333V7.33333C14.6667 6.59695 14.0697 6 13.3333 6Z" stroke="#091E42" stroke-linecap="round" stroke-linejoin="round"/>
                                                                                                                                    <path d="M3.33331 9.99992H2.66665C2.31302 9.99992 1.97389 9.85944 1.72384 9.60939C1.47379 9.35935 1.33331 9.02021 1.33331 8.66659V2.66659C1.33331 2.31296 1.47379 1.97382 1.72384 1.72378C1.97389 1.47373 2.31302 1.33325 2.66665 1.33325H8.66665C9.02027 1.33325 9.35941 1.47373 9.60946 1.72378C9.8595 1.97382 9.99998 2.31296 9.99998 2.66659V3.33325" stroke="#091E42" stroke-linecap="round" stroke-linejoin="round"/>
                                                                                                                                    </g>
                                                                                                                                    <defs>
                                                                                                                                    <clipPath id="clip0_23115_7720">
                                                                                                                                    <rect width="16" height="16" fill="white"/>
                                                                                                                                    </clipPath>
                                                                                                                                    </defs>
                                                                                                                                 </svg>
                                                                                                                                 <span className="option-list_dropdown">{props.t("translate:DUPLICATE_CONTENT")}</span>
                                                                                                                              </div>
                                                                                                                           }
                                                                                                                           <UIPerWrapper perCode={["rp_can_delete_lms_content"]}><div class="dropdown-item user-info_contents" onClick={() =>
                                                                                                                              //Open Confirmation Modal for item delect 
                                                                                                                              itemModalAction(true, subChapItemData._id, subChapItemData.title)
                                                                                                                           }>
                                                                                                                              <Trash2 className="svg-icon_light icon-error" />
                                                                                                                              <span className="option-list_dropdown delete-chap_cont">{props.t("translate:DELETE")}</span>
                                                                                                                           </div></UIPerWrapper>
                                                                                                                        </div>
                                                                                                                     </div>
                                                                                                                  }
                                                                                                               </span>
                                                                                                            </div>
                                                                                                         </StaffWrapper>
                                                                                                      }
                                                                                                      </div>
                                                                                                   </div>
                                                                                                </div>
                                                                                                {provided.placeholder}
                                                                                             </div>
                                                                                          )}
                                                                                       </Draggable>
                                                                                    )
                                                                                 })) : 
                                                                                 <div className="no-cont_height">
                                                                                 </div>}
                                                                                 {provided.placeholder}
                                                                              </div>
                                                                           )}
                                                                        </Droppable>
                                                                        {/* </DragDropContext>     */}
                                                                     </div>
                                                                  </div>
                                                               </div>
                                                               {provided.placeholder}
                                                            </div>
                                                         )}
                                                      </Draggable>
                                                   )
                                                })}
                                                {provided.placeholder}
                                             </div>
                                          )}
                                       </Droppable>
                                       {/* </DragDropContext> */}
                                    </div>
                                    {provided.placeholder}
                                 </div>
                              )}
                           </Draggable>
                        )
                     })
                     }
                     {provided.placeholder}
                  </div>
               )}
            </Droppable>
         </DragDropContext>
         {/* Add chapter model */}
         {chapModal && <LmsModal open={chapModal} onClose={() => chapterModal(false)} value={chapterName} onChange={(event) => chapNameHandler(event)} modalTitle={props.t("translate:ADD_CHAPTER")} btnName='chapter' editMode={edit} chapId={chapId} addModal={true} onClick={() => addChapterHandler('D')} advanModeChap={true} />}
         {/* Add sub chapter model */}
         {subChapModal && <LmsModal open={subChapModal} onClose={() => subChapterModal(false)} value={subChapName} duration={duration} modalErr={modalErr} durationChange={(event) => setDuration(event.target.value)} onChange={(event) => subChapNameHandler(event)} modalTitle={props.t("translate:ADD_SUB_CHAPTER")} btnName='subChapter' chapId={values.chapId} subChapId={subChapId} ScNo={values.ScNo} editMode={edit} addModal={true} onClick={() => addSubChapterHandler('D')} advanModeSub={true} isChkNum={isNaNumErr} />}
         {/* Confirmation model for chapter delete */}
         {chapDelModel && <LmsModal open={chapDelModel} onClose={() => chapModalAction(false)} value={chapterName} modalTitle={props.t("translate:CHAPTER_CONFIRM_DELETE")} btnName='chapter' confirmModal={true} onClick={() => deleteChapter(dltId)} />}
         {/* Confirmation model for sub chapter delete */}
         {subChapDelModel && <LmsModal open={subChapDelModel} onClose={() => subChapModalAction(false)} value={subChapName} modalTitle={props.t("translate:SUB_CHAPTER_CONFIRM_DELETE")} btnName='subChapter' confirmModal={true} onClick={() => deleteSubChapter(dltId, subChapId)} />}
         {/* Confirmation model for item delete */}
         {itemDelModel && <LmsModal open={itemDelModel} onClose={() => itemModalAction(false)} value={itemName} modalTitle={props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={() => deleteSupChapItem(dltId)} />}
      </div>

   )
}
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.headerReducer
})
const mapDispatchToProps = {
   getSubChapName,
   loadItems,
   getTeachContentBySubjSelection,
   addChapter,
   addSubChapter,
   lmsContentSorting,
   updateFields,
   studentContentProgress,
   changesAutoSave,
   getChapterInfo,
   chpSubChpPblshUnPblsh,
   contItmsPblshUnPblsh,
   duplicateContent
}
// export default connect(mapStateToProps, mapDispatchToProps)(ChapterList)
const TabNavigator = (props) => <ChapterList {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);