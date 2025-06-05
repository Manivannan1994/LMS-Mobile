// import { store } from '../../index';
import { store } from '../Store'
import HTTPService from "../../utils/http-util";
import $ from 'jquery';
// import { toastInformation, toastSuccess, toastWarning } from '../../components/toaster/Toaster';
import messageUtil from '../../utils/message-util';
import _ from "lodash";
import { UPDATE_CONTENT_FIELDS, RESET_INITIAL_STATE } from '../reducer/ContentReducer';
import { UPDATE_HEADER_FIELDS } from '../reducer/HeaderReducer';
import { getAssgnStuds } from './GradeBookActions';

export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_CONTENT_FIELDS
});
export const updateHeaderFields = (key, value) => ({
    key,
    value,
    type: UPDATE_HEADER_FIELDS
});

export const resetContentFields = () => ({
    type: RESET_INITIAL_STATE
});

//To get the selected subchapter name
export const getSubChapName = (subchapterNm) => (dispatch) => {
    dispatch(updateFields('getAllItems', false));
    dispatch(updateFields('slecSubChapNm', subchapterNm ? subchapterNm : ''));

}

//Load the Items against the chapter and subchapter
export const loadItems = (chapId, subId, stateValues, type, finalChk, isItem, isReqNm, isFrmKey, frmKey) => (dispatch) => {
    if (stateValues && !_.isEmpty(stateValues)) {
        const oReq = {
            tCntId: stateValues.TPID,
            subjId: stateValues.subId,
            PrID: stateValues.PrID,
            CrID: stateValues.CrID,
            AcYr: stateValues.AcYr,
            DeptID: stateValues.DeptID,
            SemID: stateValues.SemID,
            SecID: stateValues.SecID,
            getReqNm:isReqNm ? true : undefined
        }
        if (chapId && chapId.length > 0 && subId && subId.length > 0) {
            oReq.chapId = chapId;
            oReq.sChpId = subId;
        }
        if(isFrmKey === 'isExpAll'){
            oReq.isExpAll = true;
        }
        //check  for assignment item or quiz 
        if (type === "ASGMNT") {
            oReq.type = 'ASGMNT';
        }
        if (type === "QUIZ"){
            oReq.type = 'QUIZ';
        }
        if(type === "SCORM"){
            oReq.type = 'SCORM';
        }
        // set sub chapter id to scroll down to the particular sub chapter in content page
        const oScrlDtls = {};
        if(subId && frmKey && frmKey === "frmCnt"){
            oScrlDtls.subChapId = subId;
        }
        HTTPService.post('/teaching-content/get-subchapter-items', oReq, null, function (err, response) {
            if (response && response.output) {
                if (response.output.errors && response.output.errors.code && response.output.errors.code === "NO_DOCS_FOUND") {
                    dispatch(updateFields('subChapItems', []));
                    dispatch(updateFields('itemLength', 1));
                    //messageUtil.showInfo("NO_DOCS_FOUND", true);
                } else if (response.output.data && response.output.data.aContents) {
                    let oGrpByChp = {};
                    // Expand all functionality
                    if(isFrmKey && isFrmKey === 'isExpAll'){
                        const aChapCnts = response.output.data.aContents;
                        for(let chp = aChapCnts.length - 1; chp >= 0; chp--){
                            let chpKey = aChapCnts[chp].chapId+'-'+aChapCnts[chp].sChpId;
                            if(!oGrpByChp[chpKey]){
                                oGrpByChp[chpKey] = [];
                            }
                            oGrpByChp[chpKey].push(aChapCnts[chp]);
                        }
                    }
                    const scno = response.output.data.aContents.length + 1;
                    dispatch(updateFields('itemLength', scno));
                    // set data for items in chapter
                    let chapterArr = store.getState().contentReducer.chapterArray;
                    outerLoop:
                    for (let index = 0; index < chapterArr.length; index++) {
                        if ((chapId && chapterArr[index]._id === chapId) || (isFrmKey === 'isExpAll')) {
                            for (let subChap = 0; subChap < chapterArr[index].SubChapter.length; subChap++) {
                                if ((!isFrmKey && subId && chapterArr[index].SubChapter[subChap]._id === subId) || (isFrmKey === 'isExpAll')) {
                                    if(isFrmKey === 'isExpAll'){
                                        let chpSbKey = chapterArr[index]._id+'-'+chapterArr[index].SubChapter[subChap]._id;
                                        if(oGrpByChp[chpSbKey] && oGrpByChp[chpSbKey].length){
                                            chapterArr[index].SubChapter[subChap].aContents = _.sortBy(oGrpByChp[chpSbKey], 'seqNo');
                                        }
                                        // Subchapter accordion open 
                                        $(`#id${index}`).collapse('show');
                                        // Subchapter contents open
                                        $(`#id${chapterArr[index].SubChapter[subChap]._id}`).collapse('show');
                                    }else{
                                        chapterArr[index].SubChapter[subChap].aContents = response.output.data.aContents;
                                        if (isItem && chapterArr[index].SubChapter[subChap].aContents.length) {
                                            // Subchapter accordion open 
                                           $(`#id${index}`).collapse('show');
                                           // Subchapter contents open
                                           $(`#id${chapterArr[index].SubChapter[subChap]._id}`).collapse('show');
                                            setTimeout(() => {
                                               dispatch(updateFields('chapterArray', chapterArr));
                                            }, 100);
                                        }
                                        break outerLoop;
                                    }
                                    
                                }
                            }
                        }
                    }
                    if(isFrmKey === 'isExpAll'){
                        setTimeout(() => {
                            dispatch(updateFields('chapterArray', chapterArr));
                            dispatch(updateFields('isExpItm', true));
                        }, 100);
                    }
                    setTimeout(() => {
                        // Scroll to the last viewed sub chapter
                        if(oScrlDtls && oScrlDtls.subChapId && oScrlDtls.subChapId.length){
                            document.getElementById('sbChpScrl'+oScrlDtls.subChapId).click();
                        }
                    },500);
                    //show only the finalized records in the subchapter requirement
                    if (finalChk) {
                        let aContents = [];
                        response.output.data.aContents.forEach(content => {
                            if (content.vSts === 'F') {
                                aContents.push(content);
                            }
                        })
                        dispatch(updateFields('subChapItems', aContents));
                    } else {
                        dispatch(updateFields('subChapItems', response.output.data.aContents));
                    }
                }
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        })
    } else {
        console.log("NO_REQUEST_FOUND")
    }
}


//Get the teaching content based on the selected subject
export const getTeachContentBySubjSelection = (selectionDtls) => (dispatch) => {
    dispatch(updateHeaderFields('headerPage', true));
    //dispatch(updateFields('reslvDtls', reslvData));
    //dispatch(updateFields('enterPriseDtls', enterPriseDtls));
    // selectionDtls.SubjId = subId;
    // selectionDtls.isFE = session.fe ? true : false;
    // selectionDtls.isAllSubject = false;
    // selectionDtls.OutCmBsdEdu = OutCmBsdEdu;
    // selectionDtls.staffId = session.mappedid;
    // selectionDtls.isFrmLms = true;
    if (selectionDtls) {
        HTTPService.post('/TeachContentDefinition/searchbyteachcriteria/', selectionDtls, null, function (err, response) {
            if (response && response.output) {
                if (response.output.data && response.output.data.length > 0) {
                    dispatch(updateFields('teachContent', response.output.data));
                    let totalChapCout = 0;
                    let totalSubCount = 0;
                    // Chapter count
                    totalChapCout = response.output.data[0].Chapter.length;
                    response.output.data[0].Chapter.forEach((eachChapter) => {
                        // Subchapter count
                        totalSubCount = totalSubCount + eachChapter.SubChapter.length;
                        eachChapter.SubChapter.forEach((eachSubchapter) => {
                            eachSubchapter['aContents'] = []
                        });
                    });
                    dispatch(updateFields('oChapTotal', { totalChapCout, totalSubCount }));
                    dispatch(updateFields('chapterArray', response.output.data[0].Chapter));
                    dispatch(updateFields('chapterArrayCopy', response.output.data[0].Chapter));
                } else if (response.output.data && response.output.data.length === 0) {
                    //messageUtil.showInfo("NO_CONTENTS_FOUND", true);
                    dispatch(updateFields('teachContent', []));
                    dispatch(updateFields('chapterArray', []));
                    dispatch(updateFields('chapterArrayCopy', []));
                }
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        })
    }
}
//adding the chapter
export const addChapter = (oReq, selcDtls) => (dispatch) => {
    HTTPService.post('/teach-content-definition/createchapandsubchap', oReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && !_.isEmpty(data.output.data)) {
                dispatch(getTeachContentBySubjSelection(selcDtls));
                // Nodification for add chapter
                dispatch(changesAutoSave());
                $('#basicmodal1').modal('hide');
            } else if (data.output.errors && data.output.errors.code && data.output.errors.code.length > 0) {
                if (data.output.errors.code === "CHAP_ALREADY_FOUND") {
                    messageUtil.showWarning('CHAPTER_ALREADY_FOUND', false);
                } else if (data.output.errors.code === "NO_DOCS_FOUND") {
                    messageUtil.showInfo("NO_RECORDS_FOUND!", false);
                }
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}


//adding the subchapter
export const addSubChapter = (oReq, selcDtls) => (dispatch) => {
    HTTPService.post('/teach-content-definition/createchapandsubchap', oReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && !_.isEmpty(data.output.data)) {
                dispatch(getTeachContentBySubjSelection(selcDtls));
                // Nodification for add subchapter
                dispatch(changesAutoSave());
                $('#basicmodal2').modal('hide');
            } else if (data.output.errors && data.output.errors.code && data.output.errors.code.length > 0) {
                if (data.output.errors.code === "SUBCHAP_ALREADY_FOUND") {
                    messageUtil.showWarning('SUBCHAP_ALREADY_EXIST', false);
                } else if (data.output.errors.code === "NO_DOCS_FOUND") {
                    messageUtil.showInfo("NO_RECORDS_FOUND!", false);
                }
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}
//Get the assignemnt Specific student Selection
export const getSpcAssignMntStudnts = (students) => (dispatch) => {
    if (students && students.length > 0) {
        students.forEach((stud) => {
            if (stud.checked) {
                stud.studId = stud.StuID;
                stud.StFl = 'A';
            } else {
                stud.studId = stud.StuID;
                stud.StFl = 'D';
            }
        });
        dispatch(updateFields('assignMntStuds', students));
    }else{
        dispatch(updateFields('assignMntStuds', []));
    }
}

//Content Sorting 
export const lmsContentSorting = (oReq,selcDtls) => (dispatch) => {
    HTTPService.post('/lms/content-sorting', oReq, null, function (err, data) {
        if (data && data.output && data.output.data) {
            if (oReq.chap) {
                dispatch(getTeachContentBySubjSelection(selcDtls));
            }else if(oReq.items){
                // selcDtls - Callback for items
                selcDtls(data.output.data);
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}

//Update mark as done by student from Page/File/Assignment
export const updateMarkAsDone = (oMrkReq, markAsDoneClbk) => (dispatch) => {
    HTTPService.post('/lms/update-cnt-status', oMrkReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && !_.isEmpty(data.output.data)) {
                //Callback function
                markAsDoneClbk(true);
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get the overdue assignments

export const getOvrDueAsgnmnts = (oAsgReq) => (dispatch) => {
    const oReq = {
        subjId: oAsgReq.subId,
        PrID: oAsgReq.PrID,
        CrID: oAsgReq.CrID,
        AcYr: oAsgReq.AcYr,
        DeptID: oAsgReq.DeptID,
        SemID: oAsgReq.SemID,
        SecID: oAsgReq.SecID
    };
    HTTPService.post('/lms/get-ovrdue-asgnmnts', oReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && data.output.data.ovrDuCnt != null && !isNaN(data.output.data.ovrDuCnt) && data.output.data.ovrDuCnt > 0) {
                dispatch(updateFields('ovrDuCnt', data.output.data.ovrDuCnt));
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

//Student content progression details
export const studentContentProgress = (oCntPrgReq) => (dispatch) => {
    HTTPService.post('/lms/stud-cnt-progress', oCntPrgReq, null, function (err, data) {
        if (data && data.output) {
            dispatch(updateFields('studProgsDtls', {}));
            if (data.output.data && data.output.data.length > 0) {
                dispatch(updateFields('studProgsDtls', data.output.data[0]));
            } else if (data.output.errors && data.output.errors.code && data.output.errors.code.length > 0) {
                if ((data.output.errors.code === "NO_CONTENT_FOUND") || (data.output.errors.code === "NO_CONTENT_STS_FOUND")) {
                    dispatch(updateFields('studProgsDtls', {}));
                }
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Chapter & sub chapter info page
export const getChapterInfo = (oReq) => (dispatch) => {
    HTTPService.post('/lms/chapter-info', oReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && !_.isEmpty(data.output.data)) {
                dispatch(updateFields('chapOrSubChapInfo', data.output.data));
            } else if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND") {
                dispatch(updateFields('chapOrSubChapInfo', {}));
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Show and hide nodification for changes auto save
export const changesAutoSave = () => (dispatch) => {
    dispatch(updateFields('isAutoSavehide', true));
    setTimeout(() => {
        dispatch(updateFields('isAutoSavehide', false));
    }, 5000);
}

// Delete subchapers items or contents
export const deleteItems = (conId, callback) => (dispatch) => {
    HTTPService.post('/teaching-content/deactive-subchapter-items', { id: conId }, null, function (err, response) {
        if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "UPDATED_SUCCESS") {
            callback(true); //  callback for navigation to course
            messageUtil.showSuccess("CONTENT_SUBCHAPTER_ITEM_DELETE", true);
        } else if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "NO_DOCS_FOUND") {
            messageUtil.showInfo("CONTENT_ITEM_NOT_DELETE", true);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get assignment analytics info
export const getAsgnAnalytics = (oReq, callback) => (dispatch) => {
    HTTPService.post('/lms/get-assgn-anlytcs', oReq, null, function (err, response) {
        if (response && response.output && response.output.data) {
            callback(response.output.data);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get quiz details
// export const getQuizDtls = (oReq) => (dispatch) => { 
//     HTTPService.post('/lms/get-schdl-asesmnts', oReq, null,  (err, response) => {
//         if (response && response.output && response.output.data.length) {
//             dispatch(updateFields('aAsesmnts', response.output.data));
//         } else if (response && response.output && response.output.data && response.output.data.length===0) {
//             dispatch(updateFields('aAsesmnts',[]));
//         } else {
//             // messageUtil.showError("UNKNOWN_ERROR", false);
//         }
//     });
// }

// Add or edit the quiz details

export const addQuiz = (oReq,chapId,subchapId,callback) => (dispatch) =>{
    let quizUrl;
    if(oReq.vSts === "F"){
        quizUrl = '/teaching-content/publish-subchapter-items';
    }else{
        quizUrl = '/teaching-content/create-or-edit-subchapter-items';
    }
    HTTPService.post(quizUrl,oReq , null ,(err, response) =>{
        if(response && response.output){
            if(response.output.data){
                if(oReq && oReq._id && oReq._id.length){
                    messageUtil.showSuccess('QUIZ_UPDATED_SUCCESSFULLY',true);
                 }else{
                    messageUtil.showSuccess('QUIZ_ADDED_SUCCESSFULLY',true);
                 }
                callback(true,response.output.data._id,response.output.data.asmnId);
                // dispatch(loadItems(chapId,subchapId,oReq,null,null,true));
            }else if(response.output.errors && response.output.errors.code && response.output.errors.msg){
                messageUtil.showInfo(response.output.errors.msg, false);
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}


// Get contets details by id

export const getContById = (initialCall,oReq,callback,footerUpdate) => (dispatch) =>{
    HTTPService.post('/teaching-content/get-subchapter-items',oReq , null ,(err, response) =>{
        if(response && response.output && response.output.data){
            if(response.output.data.aContents && response.output.data.aContents.length){
                dispatch(updateFields('oContDtls',response.output.data.aContents[0]));
                // Callback for set vstus value 
                callback(response.output.data.aContents[0].vSts);
            }else if(response.output.data.aContents && response.output.data.aContents.length === 0){
                dispatch(updateFields('oContDtls',{}));
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        } // Check for footer changes
        if(initialCall){
            footerUpdate(true);
        }
    })
}

// Get question paper details

export const getQuestion = (oReq) => (dispatch) =>{
    oReq.isFrLMS = true;
    HTTPService.post('/SchdulAssessment/fetchQuesPaperDefs/',oReq , null ,(err, response) =>{
        if(response && response.output && response.output.data){
            if(response.output.data && response.output.data.length){
                dispatch(updateFields('aAsesmnts',response.output.data));
                // Copy for filter search
                dispatch(updateFields('aAsesmntsCpy',response.output.data));
            }else if(response.output.data && response.output.data.length === 0){
                dispatch(updateFields('aAsesmnts',[]));
                dispatch(updateFields('aAsesmntsCpy',[]));
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}


// chapter or subchapter publish unpublish
export const chpSubChpPblshUnPblsh = (oReq, chapOrSubChapInfo) => (dispatch) => {
    HTTPService.post('/lms/chap-subchap-pblsh-unpblsh', oReq, null, function (err, data) {
        if (data && data.output && data.output.data && data.output.data.code && data.output.data.code === "SUCCESS") {
            if (oReq.chapList) {
                let chapterArr = store.getState().contentReducer.chapterArray;
                if (oReq.sChpId) {
                    chapterArr[oReq.chapIndex].SubChapter[oReq.SubChapIndex].vSts = oReq.vSts;
                } else {
                    chapterArr[oReq.chapIndex].vSts = oReq.vSts;
                }
                dispatch(updateFields('chapterArray', chapterArr));
            } else {
                chapOrSubChapInfo.vSts = oReq.vSts;
                dispatch(updateFields('chapOrSubChapInfo', chapOrSubChapInfo));
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    })
}

//  content items publish or unpublish
export const contItmsPblshUnPblsh = (oReq) => (dispatch) => {
    HTTPService.post('/lms/cntnt-items', oReq, null, function (err, data) {
        if (data && data.output) {
            if (data.output.data && data.output.data.code && data.output.data.code === "SUCCESS") {
                let chapterArr = store.getState().contentReducer.chapterArray;
                chapterArr[oReq.chpIdx].SubChapter[oReq.subChpIdx].aContents[oReq.subItmIdx].vSts = oReq.vSts;
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Import the course details
export const addImportDtls = (oReq,callback) => (dispatch) => {
    HTTPService.post('/lms/save-dup-cntnts-batch', oReq, null, (err, response) => {
        if (response && response.output && response.output.data) {
            if(response.output.data === "PortalQueue for LMS_CONTENT_CREATION is successfully created !"){
                callback(true); // callback for import content create
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}
// Get all import details
export const getAllImpDtls = (oReq) => (dispatch) => {
    HTTPService.post('/lms/get-dup-cntnts-data', oReq, null, (err, response) => {
        if (response.output && response.output.data && response.output.data.length > 0) {
                dispatch(updateFields('aContDup', response.output.data));
        }else if(response.output && response.output.errors && response.output.errors.code){
            if(response.output.errors.code === "NO_DOCS_FOUND"){
                dispatch(updateFields('aContDup', []));
            }else if(response.output.errors.code === "RESLVE_DATA_NOT_FOUND"){
                dispatch(updateFields('aContDup', []));
                messageUtil.showInfo("RESLVE_DATA_NOT_FOUND",true);
            }else if(response.output.errors.code === "IMPORT-TYPE-NOT-FOUND"){
                dispatch(updateFields('aContDup', []));
                messageUtil.showInfo("IMPORT-TYPE-NOT-FOUND",true);
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Duplicate content
export const duplicateContent = (oReq, loadReq) => (dispatch) => {
    HTTPService.post('/lms/duplicate-content', oReq, null, (err, response) => {
        if (response && response.output && response.output.data) {
            dispatch(loadItems(loadReq.chapId, loadReq.subId, loadReq.stateValues, loadReq.type, loadReq.finalChk, loadReq.isItem, loadReq.isReqNm, loadReq.isFrmKey, loadReq.frmKey));
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

/* Get chapter and sub chapter aginst to the subject id */
export const getChapterSubchapter = (oReq, callback) => {
    HTTPService.post('/teaching-content/get-chapter-subchapter', oReq, null, (err, response) => {
        if (response && response.output && response.output.data) {
            callback(null, response.output.data);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
};


export const updateGroupContent = (oReq, gradReq) => (dispatch) => {
    HTTPService.post('/lms/content/group/update', oReq, null, (err, response) => {
        if (response && response.output && response.output.data) {
          dispatch(getAssgnStuds(gradReq))
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}