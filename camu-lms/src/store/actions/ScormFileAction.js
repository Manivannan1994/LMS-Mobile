import { GET_SCORM_FILE, UPDATE_SCORM_DETAILS, GET_ONE_SCORM_FILE,SET_SCORM_COOKIE , GET_SCORM_LOG } from '../reducer/ScormFileReducer'
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import _ from 'lodash';

export const updateFields = (key, value) => ({
    key,
    value,
    type: GET_SCORM_FILE
});

export const editScormFiles = (key, value) => ({
    key,
    value,
    type: GET_ONE_SCORM_FILE
})

export const setScormCookie = (key, value) => ({
    key,
    value,
    type: SET_SCORM_COOKIE
})

export const updateScormFields = (payload) => ({
    payload,
    type: UPDATE_SCORM_DETAILS
});

export const updateScormLog = (key, value) => ({
    key,
    value,
    type: GET_SCORM_LOG
});
/**
 * save the Scrom file in S3
 * @api {public}
 * @param {string} userName
 */
export const saveScormFile = (oReq, callback) =>(dispatch) => {
     HTTPService.post('/lms/saveScromFile', oReq, null, (err, data) => {
        if (data && data.output && data.output.data) {
            if(oReq.scormId){
                if (callback) {
                    callback();
                }
                messageUtil.showSuccess("FILE_UPDATED_SUCCESSFULLY", true);
            } else{
                dispatch(getScormFile(oReq))
                messageUtil.showSuccess("SAVED_SUCCESSFULLY", true);
            }
        } else if (data?.output?.errors?.code ==="NO_FILE_UPLOADED") {
            messageUtil.showError("NO_SCORM_FILE_FOUND", false);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

/**
 * Get the Scrom file in S3
 * @api {public}
 * @param {string} userName
 */
export const getScormFile = (oReq)  => (dispatch) =>  {
    HTTPService.post('/lms/getScromFile', oReq, null, (err, data) => {
        if (data && data.output && data.output.data) {
            if(oReq?.scormId && data.output.data[0]){
                dispatch(editScormFiles('editScormFile', data.output.data[0]))
            } else {
                dispatch(updateFields('scormFiles', data.output.data))
            }
        } else if (data?.output?.errors?.code === "NO_DATA_FOUND") {
            dispatch(updateFields('scormFiles', []))
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

//Generate CloudFront Cookies
export const generateClouldFrontCookies = (oReq)  => (dispatch) =>  {
    HTTPService.post('/lms/generate-cloudFront-cookie', oReq, null, (err, data) => {
       if (data && data.output && data.output.data) {
        dispatch(setScormCookie('scormUrl', data.output.data))
       } else if (data?.output?.errors) {
           messageUtil.showError("UNKNOWN_ERROR", false);
       } else {
           messageUtil.showError("UNKNOWN_ERROR", false);
       }
   });

}


//Get uploaded scorm files
export const getUploadedScormFiles =  (props) => (dispatch) =>{
    const oReq ={
      InId :props.location.state.InId,
      subjId: props.location.state.subId,
      type: props.fileType
    }
    HTTPService.post('/lms/get-scorm-details-by-sub', oReq, null, (err,data)=>{
      if(data && data.output){
        if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
          messageUtil.showInfo("NO_PAGE_FOUND", true);
        }else if(Array.isArray(data.output.data)){
            dispatch(updateScormFields(data.output.data));
        }else {
          messageUtil.showInfo("NO_PAGE_FOUND", true);
        }
      }else{
        messageUtil.showError("UNKNOWN_ERROR", false);
      } 
  })  
}


//Edit Scorm
export const editScormFile =  (oReqObj, callback) => (dispatch) =>{
    HTTPService.post('/lms/edit-Scorm-file', oReqObj, null, (err,data)=>{
      if (data && data.output){
        if (data?.output?.data?.matchedCount === 1 || data?.output?.data?.nModified === 1) {
            if(oReqObj.isDelete){
                messageUtil.showSuccess("DELETED_SUCCESSFULLY", true);
            }else{
                messageUtil.showSuccess("UPDATED_SUCCESSFULLY", true);
            }

        } else if (data.output.errors && data.output.errors.code) {
            messageUtil.showInfo(data.output.errors.code, true);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
      } else {
        messageUtil.showError("UNKNOWN_ERROR", false);
      } 
      
      if (typeof callback === 'function') {
        callback();
      }
  })  
}


/**
 * Get the Scrom file in S3
 * @api {public}
 * @param {string} userName
 */
export const getScormLog = (oReq)  => (dispatch) =>  {
    HTTPService.post('/lms/getScromLog', oReq, null, (err, data) => {
        if (data && data.output && data.output.data) {
           dispatch(updateScormLog('aActivity', data.output.data))
        } else if (data?.output?.errors?.code ==="NO_DATA_FOUND") {
            messageUtil.showError("NO_DATA_FOUND", false);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });

}


