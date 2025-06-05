import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { UPDATE_REPORT_DETAILS } from '../reducer/ReportsReducer';

export const updateReportFields = (key, value) => ({
    key,
    value,
    type: UPDATE_REPORT_DETAILS
});


// DOWNLOAD ENGAGEMENT TRACKING REPORT

export const dwnldEngageTrackRep = (oEngageReq, callback) => () => {
    HTTPService.postResTypBlob('/lms/dwnld-engage-track-rep', oEngageReq, null, (err, data) => {
        callback(err, data);
    });
}

// DOWNLOAD FAILED STUDENTS REPORT

export const dwnldFailedGrade = (oFaildGrd, callback) => () => {
    HTTPService.postResTypBlob('/lms/dwnld-failed-stud-rep', oFaildGrd, null, (err, data) => {
        callback(err, data);
    });
}

// DOWNLOAD  STUDENTS INTRACTION REPORT

export const dwnldIntractReport = (oIntrReq, callback) => () => {
    HTTPService.postResTypBlob('/lms/dwnld-course-interact-rep', oIntrReq, null, (err, data) => {
        callback(err, data);
    });
}
// Create Report Queue for LMS engagement data report

export const createReportQueue = (oFaildGrd, callback) => () => {
    HTTPService.post('/lms/dwnld-engage-stud-rep', oFaildGrd, null, (err, data) => {
        if (data && data.output && data.output.data && data.output.data.code && data.output.data.code === "SUCCESS") {
            messageUtil.showInfo("REQ_INFO", true, "REQ_DESC");
            callback(true);
        }else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    }); 
}

// Get Report Queues

export const getReportQueues = (oReqRepQue, callback) => () => {
    HTTPService.post('/lms/get-lms-reports', oReqRepQue, null, (err, data) => {
        if (data && data.output && data.output.data && data.output.data) {
            callback(data.output.data);
        }else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    }); 
}