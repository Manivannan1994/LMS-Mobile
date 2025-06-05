import { UPDATE_SETTINGS_DETAILS } from '../reducer/SettingsReducer'
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import moment from 'moment';

export const updateCrseSetFields = (key, value) => ({
    key,
    value,
    type: UPDATE_SETTINGS_DETAILS
});


// Save subject confiq
export const saveSubConfiq = (oReq,callback) => (dispatch) => {
    HTTPService.post('/lms/save-subject-config', oReq, null, (err, response) => {
        if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "SUCCESS") {
            messageUtil.showSuccess("Settings successfully saved", true);
            callback(false);  // Callback for button disble
        } else {
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

// Get subject confiq details 
export const getSubConfiq = (oReq, urlValues,callback,seqClbk) => (dispatch) => {
    HTTPService.post('/lms/get-subject-config', oReq, null, (err, response) => {
        if (response && response.output) {
            if (response.output.data && response.output.data.length > 0) {
                //If the URL values exists then only get the Sequence configurations
                if(oReq.preReq){
                    if((urlValues.isChap && urlValues.chapId) || (urlValues.subChapId && urlValues.isSubchap)){
                        dispatch(getSequenceConfig(response.output.data[0]._id, urlValues,seqClbk));
                    }
                }
                // let lmsTyp = response.output.data[0].lmsTyp;
                dispatch(updateCrseSetFields('lmsTyp', response.output.data[0].lmsTyp));
                dispatch(updateCrseSetFields('sCnfId', response.output.data[0]._id));
                dispatch(updateCrseSetFields('imgUrl', response.output.data[0].imgUrl));
                dispatch(updateCrseSetFields('bgClr', response.output.data[0].bgClr));
                callback(response.output.data[0]);
            } else if (response.output.data.length === 0) {
                dispatch(updateCrseSetFields('lmsTyp', 'FF'));
                dispatch(updateCrseSetFields('sCnfId', ''));
            }
        } else {
           // messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}

//Get the chapter names before the selected chapter
export const getChapNames = (chapId,teachCntId) => (dispatch) => {

    HTTPService.get('/QuesBank/fetchChapNames/'+ teachCntId + '/' + true ,null,(err,data)=>{
        if(data && data.output){
            if (data.output.data && data.output.data[0] && data.output.data[0].Chapter) {
                let aChapNms=[];
                //get the chap names before the selected chapter
                for(let chap=0;chap<data.output.data[0].Chapter.length;chap++){
                    if(data.output.data[0].Chapter[chap]._id===chapId){
                        break;
                    }else{
                        aChapNms.push(data.output.data[0].Chapter[chap]);
                    }
                }
                dispatch(updateCrseSetFields('aChapNms',aChapNms));
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });

}
//Save the Sequence configuration against the chapter and subchapter
export const saveSequenceConfig = (oSeqReq) => (dispatch) => {
    HTTPService.post('/lms/save-sequence-config', oSeqReq, null, (err, response) => {
        if (response && response.output) {
            if (response.output.data && response.output.data.code && response.output.data.code === 'SUCCESS') {
                messageUtil.showSuccess("SAVED_SUCCESS", true);
            }else if(response.output.data && response.output.data.code && response.output.data.code === 'CHAP_ALREADY_FOUND'){
                messageUtil.showWarning('CHAPTER_ALREADY_FOUND', false);
            }else if(response.output.data && response.output.data.code && response.output.data.code === 'SUBCHAP_ALREADY_FOUND'){
                messageUtil.showWarning('SUBCHAP_ALREADY_EXIST', false);
            }else if(response.output.data && response.output.data.code && response.output.data.code === 'NO_SUB_CONFG_FOUND'){
                messageUtil.showInfo('NO_SUBJ_CONFIG_FOUND', false);
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

//Get the Sequence configuration against the chapter and subchapter
export const getSequenceConfig = (sCnfId,urlValues,seqClbk) => (dispatch) => {
    const oSeqReq={
        sCnfId:sCnfId,
        projct:{
            lkUnDt:1,
            preReq:1,
            alwCon:1,
            req:1
        }
    }
    if(urlValues && urlValues.chapId && urlValues.isChap){
        oSeqReq.chapIds=[urlValues.chapId];
    }
    if(urlValues && urlValues.subChapId && urlValues.isSubchap){
        oSeqReq.sChpId=urlValues.subChapId;
    }

    HTTPService.post('/lms/get-sequence-config', oSeqReq, null, (err, response) => {
        if (response && response.output) {
            if(response.output.data && response.output.data.length>0){
                seqClbk(response.output.data[0]); //callback to prerequisite 
            }  
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get grade systems

export const getGradeSystem = (oGradeReq, callback) => (dispatch) => {
    HTTPService.post('/lms/get-grade-system', oGradeReq, null, (err, data) => {
        if (data && data.output) {
            if(data.output.data && data.output.data.length > 0){
                dispatch(updateCrseSetFields('aGrdSystem', data.output.data));
                dispatch(updateCrseSetFields('aGrdSysCpy', data.output.data));
            }else if(data.output.data && data.output.data.length === 0){
                dispatch(updateCrseSetFields('aGrdSystem', []));
                dispatch(updateCrseSetFields('aGrdSysCpy', []));
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

// Get course archive details

export const getArchiveCrsDtls = (oReq, callback) => (dispatch) => {
    HTTPService.post('/lms/get-archive-course-details', oReq, null, (err, data) => {
        if (data && data.output) {
            if (data.output.data && data.output.data.length > 0) {
                let curntDate = moment().unix();
                if (data.output.data[0] && data.output.data[0].StDt && data.output.data[0].EnDt) {
                    if ((moment(data.output.data[0].StDt).unix() <= curntDate) && (moment(data.output.data[0].EnDt).unix() >= curntDate)) {
                        callback(data.output.data[0]);
                    } else {
                        callback(data.output.data[0]);
                    }
                }
            } else if (data.output.data && data.output.data.length === 0) {
                callback({});
            }
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}