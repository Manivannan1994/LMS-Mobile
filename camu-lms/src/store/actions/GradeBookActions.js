import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import queryString from 'query-string';
import _ from "lodash";
import { UPDATE_GRADE_BOOK_DETAILS } from '../reducer/GradeBookReducer';

export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_GRADE_BOOK_DETAILS
});


// Get grade book item such as assignments, discussions, attendances

export const getGradeBookItems = (oGrdBook) => (dispatch) => {
   
    HTTPService.post('/lms/get-grade-book-items', oGrdBook, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data){
            dispatch(updateFields('oGrdBookItems', data.output.data));
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

// Get the assignment details   

export const getAssgnmntDetails = (oAsgnmnt) => (dispatch) => {
   
    HTTPService.post('/lms/get-asgnmnt-dtls', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data){
            dispatch(updateFields('oAsgnmntDtls', data.output.data));
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

// Get the assignment details

export const getAssgnStuds = (oAsgnmnt) => (dispatch) => {
   
    HTTPService.post('/lms/get-asgnmnt-stud-dtls', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data && data.output.data){
            dispatch(updateFields('aStudents', data.output.data.aStudents));
            dispatch(updateFields('aGradePages', data.output.data.aPages));
            dispatch(updateFields('totStudCount', data.output.data.totStudCount));
            dispatch(getAssgnmntDetails(oAsgnmnt));   
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}


export const resolveAssgnStuds = (oAsgnmnt) => {
    return new Promise((resolve, reject) => {
      HTTPService.post('/lms/get-asgnmnt-stud-dtls', oAsgnmnt, null, (err, data) => {
        if (data && data.output && data.output.data) {
          resolve(data.output.data?.aStudents); // Resolve the promise with the desired data
        } else {
          messageUtil.showError("UNKNOWN_ERROR", true);
          reject(new Error('UNKNOWN_ERROR')); // Reject the promise with an error
        }
      });
    });
  }
  
// Update the student assignment

export const updateStudentAssignment = (oAsgnmnt, oAsgnReq, oStdAsRq,pageDtls) => (dispatch) => {

    HTTPService.post('/lms/upd-stud-asgnmnt', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data && data.output.data){
            if(oAsgnReq.stAsvw){
                dispatch(getStudsForAssignment(oAsgnReq, oStdAsRq));
            }else if(oAsgnReq === 'studView'){
                dispatch(getAssgnmntDetailsForGrading(oStdAsRq,pageDtls,oAsgnmnt.stuAsgmtSr,oAsgnmnt.asmCtg));
            }else{
                // Call from student grade list
                dispatch(getAssgnStuds(oAsgnReq));
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

// Update the student assignment

export const updatemultpleStudAsgnmnt = (oAsgnmnt, oAsgnReq, oStudDtlRq, pageDtls, callback) => (dispatch) => {
    HTTPService.post('/lms/upd-mul-stud-asgnmnts', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output){
            if(data.output.data && data.output.data.code && data.output.data.code === "SUCCESS"){
                // call from student assignment view
                if(oAsgnReq.stAsvw){
                    dispatch(getStudsForAssignment(oAsgnReq, oStudDtlRq));
                }else if(oAsgnReq === 'studView'){
                    dispatch(getAssgnmntDetailsForGrading(oStudDtlRq,pageDtls,oAsgnmnt.stuAsgmtSr,oAsgnmnt.asmCtg));
                }else if(oAsgnmnt.isFrmRb){ // From rubrics grade
                    callback(true);
                }else {
                    // Call from student grade list
                    dispatch(getAssgnStuds(oAsgnReq));
                }
            }else{
                messageUtil.showError("UNKNOWN_ERROR", true);
            }
        }else{
            // messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

// Get the Students Based on Enterprise Selection

export const getTheGradingStuds=(enterpriseDtls,studSrchKywrd)=>(dispatch) =>{
    //Assign Student search keyword
    if(studSrchKywrd && studSrchKywrd.length>0){
        enterpriseDtls.studSrchKywrd=studSrchKywrd;
    }
    HTTPService.post('/stuHWassignment',enterpriseDtls,null,(err,data)=>{
        if(data && data.output && data.output.data && data.output.data.students && data.output.data.students.length>0){
           dispatch(updateFields('aGradStudentsCpy',data.output.data.students));
           dispatch(updateFields('aGradStudents',data.output.data.students));
           //dispatch(updateFields('aGradePages', data.output.data.aPages));
        }else if(((data && data.output && data.output.data && data.output.data.message) || (data.output.data.students && data.output.data.students.length === 0))){
            dispatch(updateFields('aGradStudents',[]));
        }else{
           messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
  

}
// Get assignments for student

export const getStudsForAssignment = (oAsgnmnt,oStudDtlRq) => (dispatch) => {
    HTTPService.post('/lms/get-asgnmnt-studs', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data && data.output.data){
                dispatch(getStudAsgnmntContentDetails(oStudDtlRq))
            dispatch(updateFields('oStudDtls',data.output.data));
            dispatch(updateFields('oStudDtlsCpy',data.output.data));
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}
// Get assignment content details

export const getStudAsgnmntContentDetails = (oAsgnmnt) => (dispatch) => {
    HTTPService.post('/lms/get-stud-asgnmnt', oAsgnmnt, null, (err, data) => {
        // Success
        if(data && data.output && data.output.data && data.output.data){
            dispatch(updateFields('studAsgnmntContDetls',data.output.data));
        }else{
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

//Get the students assignments for grading
export const getAssgnmntDetailsForGrading=(locationVal,pageDtls,asgmntSrchKywrd, asmCtg) => (dispatch)=> {
   
    if (locationVal && locationVal.state && !_.isEmpty(locationVal.state) && locationVal.search && !_.isEmpty(locationVal.search)) {
        const urlValues = queryString.parse(locationVal.search);
        const oReq = {
           PrID: locationVal.state.PrID,
           CrID: locationVal.state.CrID,
           DeptID:locationVal.state.DeptID,
           SemID:locationVal.state.SemID,
           AcYr: locationVal.state.AcYr,
           SecID: locationVal.state.SecID,
           type: 'ASGMNT',
           subjId: locationVal.state.subId,
           studId: urlValues.stuId,
           projct  : {"asgmnt.asDuDt" : 1, "title" : 1,"asgmnt.grdCnf" : 1, "asgmnt.grdSys" : 1, "asgmnt.mxMrk" : 1, "asgmnt.asmCtg" : 1, "asgmnt.isGroup":1, "asgmnt.grpIds":1}
        }
        if(pageDtls && pageDtls.pageSize && pageDtls.pageNo){
            oReq.pageSize=pageDtls.pageSize;
            oReq.pageNo=pageDtls.pageNo;
        }
        if(asgmntSrchKywrd && asgmntSrchKywrd.length>0){
            oReq.asgmntSrchKywrd=asgmntSrchKywrd;
        }

        if(asmCtg && asmCtg.length>0){
            oReq.asmCtg=asmCtg;
        }

        //get assignment details
        HTTPService.post('/lms/get-studs-asgnmnt', oReq, null, (err, data) => {
            if (data && data.output) {
                // dispatch(updateFields('aStudAssignmnts',[]));
                // dispatch(updateFields('oPostAllDtls',{}));
                // dispatch(updateFields('oStudFinGrad',{}));
                if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_STUDS_FOUND") {
                    messageUtil.showInfo("NO_STUDS_FOUND", true);
                }else if (((data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND") || (data.output.data && _.isEmpty(data.output.data)))) {
                    dispatch(updateFields('aStudAssignmnts',[]));
                    // messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
                } else if (data.output.data && !_.isEmpty(data.output.data)){
                    dispatch(updateFields('oStudDtls',data.output.data.studDtls));
                    dispatch(updateFields('aStudAssignmnts',data.output.data.contentAssignData));
                    dispatch(updateFields('oPostAllDtls',data.output.data.postAllDtls));
                    dispatch(updateFields('oStudFinGrad',data.output.data.oStudFinGrad));
                    dispatch(updateFields('aGradePages', data.output.data.aPages));
                    dispatch(updateFields('GrdPercent', data.output.data.GrdPercent));
                } 
            } else {
              messageUtil.showError("UNKNOWN_ERROR", false);
            }
        })
    } else {
        console.log("NO_REQUEST_FOUND");
    }
}

// Publish transcript from LMS

export const publshTrnscrptLMS = (oPublsTrns, callback) => (dispatch) => {
    HTTPService.post('/lms/publsh-trncrpt', oPublsTrns, null, (err, data) => {
        callback(err, data);
    });
}

// Download grades for assignemnts

export const dwnldGradAsgnmnt = (oPublsTrns, callback) => () => {
    HTTPService.postResTypBlob('/lms/dwnld-grades', oPublsTrns, null, (err, data) => {
        callback(err, data);
    });
}

// Download assignment submissions

export const dwnlAssgnmntSubmsn = (oDwlndAsgn) => (dispatch) => {
    HTTPService.post('/lms/dwnld-asgnmnt-submsn', oDwlndAsgn, null, (err, data) => {
        if(data && data.output && data.output.data && data.output.data.code && data.output.data.code == "SUCCESS"){
            dispatch(getLastDwnldSubmsn(oDwlndAsgn)); 
            dispatch(updateFields('showDwnldState',true));
        }else if(data && data.output && data.output.data && data.output.data.code && data.output.data.code == "PENDING_ALREADY_EXISTS"){
           messageUtil.showInfo('PENDING_ALREADY_EXISTS', true);
        }else{
           messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get Last Record of download assignment submissions

export const getLastDwnldSubmsn = (oLastHist) => (dispatch) => {
    HTTPService.post('/lms/get-last-asgnmnt-submsn', oLastHist, null, (err, data) => {
        const oLstSubm = {};
        if (data && data.output && data.output.data && data.output.data.length) {
            let statePend = false;
            let hisStateSus = true;
            if (data.output.data[0].Status == "P") {
                statePend = true;
            } else {
                if (data.output.data[0].Status == "E") {
                    hisStateSus = false;
                }
            }
            oLstSubm.showHisState = true;
            oLstSubm.hisStatSuc = hisStateSus;
            oLstSubm.hisStatPend = statePend;
            oLstSubm.dwnldUrl = data.output.data[0].url;
        } else if(data && data.output && data.output.data && data.output.data.length == 0) {
            oLstSubm.showHisState = false;
        }
        dispatch(updateFields('oLstSubDet', oLstSubm));
    });
}

// Upload Grade using excel

export const uploadGradeForAsgmnt=(oAsgnmntXl,updatcbk)=>(dispatch)=>{
    HTTPService.post('/lms/upload-asgnmnt-grade', oAsgnmntXl,{'Content-Type': 'multipart/form-data'},updatcbk);
}

