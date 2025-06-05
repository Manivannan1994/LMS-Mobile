import HTTPService from "../../utils/http-util";
import { UPDATE_NOTIFICATION_DETAILS } from '../reducer/NotificationReducer';
export const updateNotificationFields = (key, value) => ({
    key,
    value,
    type : UPDATE_NOTIFICATION_DETAILS
});

/**********************************
    Get the notifications
    @api {public}
    @param {object} oNotification
***********************************/
export const getNotifications = (oNotification, callback) => (dispatch) =>{
    HTTPService.post('/lms/get-notifications', oNotification, null, (err, data) => {
        callback(err, data);
    });
}