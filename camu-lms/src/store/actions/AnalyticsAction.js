import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { UPDATE_ANALYTICS_FIELDS } from '../reducer/AnalyticsReducer';
import AnalyticsService from '../../service/analytics-service';
import UserSession from "../../utils/UserSession";

export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_ANALYTICS_FIELDS
});

//Create and update the Content status
export const crateAndUpdateCntSts = () => () => {
    const curPgDet = AnalyticsService.getCurrPageDetails();
    if(curPgDet.pgNm){
        const oCntVw = {
            type : 'PAGE',
            pgNm : curPgDet.pgNm
        };
        if(curPgDet.cntId){
            oCntVw.cntId = curPgDet.cntId;
        }
        if(curPgDet.subId){
            oCntVw.subId = curPgDet.subId;
            oCntVw.AcYr = curPgDet.AcYr;
            oCntVw.SemID = curPgDet.SemID;
        }
        HTTPService.post('/lms/crt-cnt-status', oCntVw, null, (err, data) => {
            if (data && data.output) {
                if (data.output.data) {
                    AnalyticsService.setLogId(data.output.data);
                }
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        });
    }
}

// Update the out time for content view log when leaves the page/file/assignment
export const updateCntViewLog = (oLogCntRq) => (dispatch) => {
    const curPgDet = AnalyticsService.getCurrPageDetails();
    const oCntVwLg = {};
    if(UserSession.isStudent()){
        if(curPgDet && curPgDet.oLogDet){
            if(curPgDet.oLogDet.aLogIds && curPgDet.oLogDet.aLogIds.length){
                oCntVwLg.aLogIds = curPgDet.oLogDet.aLogIds;
            }else{
                oCntVwLg.vwLogId = curPgDet.oLogDet.logId;
            }
        }
        HTTPService.post('/lms/update-content-log', oCntVwLg, null, (err, data) => {
            if (data && data.output) {
                // Create new log from navigating contents from footer
                if(oLogCntRq && oLogCntRq.isEnCurCrtNwLg){
                    AnalyticsService.setCurrPage(oLogCntRq.currPage);
                    AnalyticsService.setCntId(oLogCntRq.id);
                    if(oLogCntRq.subId){
                        AnalyticsService.setSubId(oLogCntRq.subId, oLogCntRq.AcYr, oLogCntRq.SemID);
                    }
                    dispatch(crateAndUpdateCntSts());
                }
                // Success
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        });
    }
}

