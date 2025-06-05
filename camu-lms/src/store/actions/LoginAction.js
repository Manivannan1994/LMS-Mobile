import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { UPDATE_LOGIN_DETAILS } from '../reducer/LoginReducer';
import LmsCommonService from '../../service/lms-service';
export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_LOGIN_DETAILS
});

/** LMS Login process
@api {public}
@param {object} loginDtls
**/
export const doLMSLogin = () => (dispatch) =>{
    let encripted=LmsCommonService.LmsLoginProcess('zuld@rediffmail.com','camu@123');
    let hd = encripted.head;
    delete encripted.head;
    HTTPService.post('/login.do', encripted, {'Accecpt-Browser': hd}, (err, data) => {
        if(data && data.output){
            if(data.output.data && data.output.data.data){ 
                
            }
        }else{
            
        } 
    });
}

/**
 * Do LMS Password Reset Process
 * @api {public}
 * @param {string} userName
 */
export const doLMSPassWordReset = (userName) => (dispatch) => {
    console.log("password reset happensssss",userName)
    HTTPService.post('/forgotpassword', {u: userName},null, (err, data) => {
        if (data && data.output && data.output.data && data.output.data.state) {
            if (data.output.data.state === 1) {
                messageUtil.showSuccess("PASSWORD_RESET_SUCCESSFULLY", true);
            } else if (data.output.data.state === 2) {
                messageUtil.showInfo("ENTER_VALID_USERNAME", true);
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        } else if (data.output.errors.length > 0) {
            messageUtil.showError("UNKNOWN_ERROR", false);
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });

}