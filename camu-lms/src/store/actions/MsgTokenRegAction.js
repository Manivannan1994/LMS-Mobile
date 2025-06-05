import { UPDATE_W_TOKEN } from '../reducer/MsgTokenRegReducer'
import HTTPService from "../../utils/http-util";

export const updateCrseSetFields = (key, value) => ({
    key,
    value,
    type: UPDATE_W_TOKEN
});



export const sendWToken = (oReq) =>(dispatch) =>{
    HTTPService.post("/lms/register-message-token", oReq, null, (err, response) => {
       if(response && response.output){
        dispatch(updateCrseSetFields('fireToken', oReq.token))
       }else{
        dispatch(updateCrseSetFields('fireToken', null))
       }
    })
}


export const updateNotifyPerm = (Stat) => (dispatch) => {
    dispatch(updateCrseSetFields('permStat', Stat))
}