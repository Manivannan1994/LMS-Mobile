import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { UPDATE_RUBRICS_DETAILS } from '../reducer/RubricsReducer';
export const updateRubrcFields = (key, value) => ({
    key,
    value,
    type : UPDATE_RUBRICS_DETAILS
});


/**********************************
    Create or update rubrics
    @api {public}
    @param {object} oRubrics
***********************************/
export const createOrUpdateRubrics = (oRubrics, callback) => (dispatch) =>{
    let rubUrl;
    if(oRubrics.actn === 'D'){
        rubUrl = '/lms/delete-rubrcs';
    }else{
        rubUrl = '/lms/crt-or-upd-rubrcs';
    }
    HTTPService.post(rubUrl, oRubrics, null, (err, data) => {
        if(data && data.output){
            if(data.output.data && data.output.data.code && data.output.data.code === 'SUCCESS'){
                if(oRubrics && oRubrics._id && oRubrics._id.length){
                    messageUtil.showSuccess('RUBRIC_UPDATED_SUCCESSFULLY',true);
                    callback(true, data.output.data);
                }else{
                    // dispatch(updateRubrcFields('oAsgnRubrcs', data.output.data));
                    messageUtil.showSuccess('RUBRIC_ADDED_SUCCESSFULLY',true);
                    callback(true, data.output.data);
                }
            }else if(data.output.data && data.output.data.code && data.output.data.code === 'DEL_SUC'){
                messageUtil.showSuccess("RUBRIC_DELETED_SUCCESSFULLY", false);
                callback(true);
            }else if(data.output.errors.code === "TITLE_DUP_FOUND"){
                dispatch(updateRubrcFields('isDupli', true));
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}

/**********************************
    Get the rubrics
    @api {public}
    @param {object} oRubrics
***********************************/
export const getRubrics = (oRubrics, callback) => (dispatch) =>{
    HTTPService.post('/lms/get-rubrics', oRubrics, null, (err, data) => {
        if(data && data.output){
            if(data.output.data && data.output.data.length){
                dispatch(updateRubrcFields('isDupli', false));
                // From rubrics edit
                if(oRubrics._id && oRubrics.isFrEdt){
                    callback(true, data.output.data);
                }else{
                    dispatch(updateRubrcFields('aRubrics', data.output.data));
                    if(oRubrics.isFrVw || oRubrics.isFrLst){
                        callback(true, data.output.data);
                    }
                }
                if(oRubrics.isFrEdRb){
                    callback(data.output.data[0].isAlDup);
                }
            }else if(data.output.data && data.output.data.length === 0){
                // Empty state
                dispatch(updateRubrcFields('aRubrics', []));
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });
}