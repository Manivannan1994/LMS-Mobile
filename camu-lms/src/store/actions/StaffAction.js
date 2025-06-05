import { UPDATE_STAFFS } from '../reducer/StaffReducer'
import HTTPService from "../../utils/http-util";

export const updateCrseSetFields = (key, value) => ({
    key,
    value,
    type: UPDATE_STAFFS
});



export const getStaffsforsubjct = (oReq) =>(dispatch) =>{
    HTTPService.post("/lms/chat-group/staffs/list", oReq, null, (err, response) => {
       if(response && response.output){
        dispatch(updateCrseSetFields('substaff', response.output.data))
       }else{
        dispatch(updateCrseSetFields('substaff', null))
       }
    })
}