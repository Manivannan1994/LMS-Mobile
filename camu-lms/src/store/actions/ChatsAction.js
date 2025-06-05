import { UPDATE_CHATS_DETAIL } from '../reducer/ChatsReducer';
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';

export const updateCrseSetFields = (key, value) => ({
    key,
    value,
    type: UPDATE_CHATS_DETAIL
});





export const getChatGroups = (oReq) =>(dispatch) =>{
    HTTPService.post('/lms/chat-group/list', oReq, null, (err, response) => {
       if(response && response.output){
        dispatch(updateCrseSetFields('chatGroups', response.output.data))
       }else{
        dispatch(updateCrseSetFields('chatGroups', []))
       }
    })
}


export const getChatMessages = (oReq, chtMsgs) =>(dispatch) =>{
    HTTPService.post('/lms/chat-group/messages/list', oReq, null, (err, response) => {
       if(response && response.output){
        if(chtMsgs && chtMsgs.length > 0){
             dispatch(updateCrseSetFields('chatMessages', [...chtMsgs,...response.output.data]))
        }else{
        dispatch(updateCrseSetFields('chatMessages', response.output.data))
        }
       }
    })
}


export const getChatUsersOfGroup = (oReq) =>(dispatch) =>{
    HTTPService.post('/lms/chat-group/users/list', oReq, null, (err, response) => {
       if(response && response.output){
        dispatch(updateCrseSetFields('chatUsers', response.output.data))
       }
    })
}

export const sendMessage = (oReq) =>(dispatch) =>{
    HTTPService.post('/lms/chat-group/message/create', oReq, null, (err, response) => {
        if (response && response.output) {
            return null
        } else {
            messageUtil.showError("UNKNOWN_ERROR", true);
        }
    })
}



export const createNewGroup = (oReq) =>(dispatch) =>{
    HTTPService.post('/lms/chat-group/create', oReq, null, (err, response) => {
       if(response && response.output){
        dispatch(getChatGroups(oReq))
       }
    })
}