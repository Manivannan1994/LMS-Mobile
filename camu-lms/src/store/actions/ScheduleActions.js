import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import UserSession from '../../utils/UserSession';
import { UPDATE_SCHEDULE_DETAILS } from '../reducer/ScheduleReducer';
import LmsCommonService from '../../service/lms-service';
import helper from '../../utils/helper';
import { localStorageGet } from '../../utils/helper';
import moment from "moment";
export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_SCHEDULE_DETAILS
});
let loggedInStaffId =  UserSession.getSession() && UserSession.getSession().mappedid;

// Get timetable schedules based on date range for staff
export const getTTSchedules = (state, locstate, isCrsWse) => (dispatch) => {
    let oTTReq = {
        StartDt   : state.start,                          // "2021-07-15"
        EndDt     : state.end,                            // "2021-07-30"
        isCrsWse  : isCrsWse,   
        aDates    : state.aDates,
        getSchLMS : true
    };

    // Get subject wise schedules

    if(isCrsWse && locstate) {
        oTTReq.PrID   = locstate.PrID;
        oTTReq.CrID   = locstate.CrID;
        oTTReq.DeptID = locstate.DeptID;
        oTTReq.SemID  = locstate.SemID;
        oTTReq.SecID  = locstate.SecID;
        oTTReq.AcYr   = locstate.AcYr;
        oTTReq.subjId = locstate.subId;
    };
    if(localStorageGet('utype') ==="Staff"){
        HTTPService.post('/Schedule/get-schdl-with-tp-assgn', oTTReq, null, (err, data) => {
            dispatch(updateFields('aSchedules', []));
            dispatch(updateFields('onMeeting', {}));
            // Success
            if(data && data.output && data.output.data && data.output.data.code && data.output.data.code === "200" && data.output.data.txtCode){   // Handles API level information and errors.
                dispatch(updateFields('aSchedules', []));
            }else if(data && data.output && data.output.data &&  data.output.data.aSchedules && data.output.data.aSchedules.length){
                dispatch(updateFields('onMeeting', data.output.data.onMeeting));
                dispatch(updateFields('aSchedules', data.output.data.aSchedules));
            }else if(data && data.output && data.output.data && data.output.data.aSchedules && data.output.data.aSchedules.length === 0){
                messageUtil.showInfo("NO_SCHEDULES_FOUND", true);
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        });
    }else{
        oTTReq.StuID = locstate?.StuID || '';
        oTTReq.usrTime = moment().format('DD-MM-YYYY, hh:mm A');
        oTTReq.isStudentView = true;
        HTTPService.post('/lms/get-stud-schdl-with-tp-assgn', oTTReq, null, (err, data) => {
            dispatch(updateFields('aSchedules', []));
            dispatch(updateFields('onMeeting', {}));
            // Success
            if(data && data.output && data.output.data && data.output.data.code && data.output.data.code === "200" && data.output.data.txtCode){   // Handles API level information and errors.
                dispatch(updateFields('aSchedules', []));
            }else if(data && data.output && data.output.data &&  data.output.data.aSchedules && data.output.data.aSchedules.length){
                if(data.output.data.aSchedules[0]?.isPending){
                    messageUtil.showInfo("FINALISED_SCHDL_OR_TT_CURRENTLY_PROCESSING", false);
                }
                dispatch(updateFields('onMeeting', data.output.data.onMeeting));
                dispatch(updateFields('aSchedules', data.output.data.aSchedules));
            }else if(data && data.output && data.output.data && data.output.data.aSchedules && data.output.data.aSchedules.length === 0){
                messageUtil.showInfo("NO_SCHEDULES_FOUND", true);
            }else{
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        });
    }  
}

/** To init create meeting 
 @api {public}
@param {object} oSchedule
@param {function} updateMeetingDtls
**/
export const createOnlineMeeting = (oSchedule,updateMeetingDtls) => (dispatch) =>{
    HTTPService.post('/online-meeting/create', oSchedule, null, (err, data) => {
        if(data && data.output){
            if(data.output.data && data.output.data.data){ 
                let meeting = data.output.data.data;
                meeting.attnId = data.output.data.attnId;
                meeting.meetingId = data.output.data._id;
                messageUtil.showSuccess("ONLINE_MEET_SCHEDULED", true);
                updateMeetingDtls(meeting);
            }
        }else{
            messageUtil.showError("ONLINE_MEET_NOT_SCHEDULED",false); 
        } 
    });
}

/** To start the meeting 
@api {public}
@param {object} vendor
@param {object} oMeetingData
**/
export const startOnlineMeeting = (vendor,oMeetingData) =>(dispatch) =>{
    HTTPService.post('/online-meeting/start', {"meetingId": oMeetingData.meetingId}, null, (err, data) => {
        if(data && data.output){
            if(data.output.data){
                switch (vendor) {
                  case "ZOOM": //lauch zoom meeting
                    window.open(oMeetingData.start_url, "_blank");
                    break;
                  case "MS_TEAM": //launch MS_TEAM
                    window.open(oMeetingData.join_url, "_blank");
                    break;
                  case "CUSTOM": //launch Custom URL
                    window.open(oMeetingData.join_url, "_blank");
                    break;
                  default:
                    break;
                }
            }
        }else{
            messageUtil.showInfo("CANT_START_ONLINE_MEETING", true); 
        }
    });
}
/** To Launch the student meeting
@api {public}
@param {object} oMeeting
**/
export const launchMeeting = (oMeeting)=> (dispatch) =>{
    window.open(oMeeting.join_url,'_blank');
}

/** To record the student attendance
@api {public}
@param {object} oAttnReq
@param {object} oMeetingData
@param {function} updateAttendance
**/
export const recordOnlineAttendance = (oAttnReq, oMeetingData, updateAttendance, isOnBkCls) => {
    return async (dispatch) => {
      return new Promise((resolve, reject) => {
        HTTPService.post('/lms/online-meeting/record-attendance', oAttnReq, null, (err, data) => {
  
          if (data && data.output && data.output.data) {
            const outputData = data.output.data;
            
            if (outputData.code === "SUCCESS") {
              messageUtil.showSuccess("ONLINE_ATTENDANCE_RECORDED", true);
              setTimeout(() => {
                updateAttendance(true, oMeetingData);
                resolve({ success: true });
              }, 2000);
            } else if (!outputData.isMeetingStarted) {
              messageUtil.showError("ONLINE_CLASS_NOT_YET_STARTED", true);
              updateAttendance(false, oMeetingData);
              resolve({ success: false, isStarted: false });
            } else {
              if (!isOnBkCls) {
                messageUtil.showError("ONLINE_ATTENDANCE_NOT_RECORDED", true);
              }
              updateAttendance(false, oMeetingData);
              resolve({ success: false, isStarted: true });
            }
          } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
            reject();
          }
        });
      });
    };
  };
  

/** To cancel Online meeting 
  @api {public}
  @param {object} oMeetData
  @param {function} updateCancelMeeting
**/
export const cancelOnlineMeeting = (meetingId,token,updateCancelMeeting) => (dispatch)=>{
    const oMeetData={
        "InId": UserSession.getSession().InId,
        "FacID": UserSession.getSession().mappedid,
        "meetingId": meetingId,
        "t": token
    };
    HTTPService.post('/online-meeting/cancel', oMeetData, null, (err, data) => {
        if(data && data.output && data.output.data && data.output.data.code === "SUCCESS"){
            messageUtil.showSuccess("ONLINE_MEET_CANCELLED", true);
            updateCancelMeeting();
        }else{
            messageUtil.showError("CANT_CANCEL_MEETING", false);
        }
    });    
}

/** To get custom URL 
  @api {public}
  @param {object} oCustmObj
  @param {function} updateCustmUrl
**/
export const getStfCustmUrl =(oCustmObj,updateCustmUrl) =>(dispatch)=>{
    HTTPService.post('/staff/get-staff-custom-url', oCustmObj, null, (err, data) => {
        if(data && data.output && data.output.data ){
            updateCustmUrl(data.output.data);
        }
    });   
}

/** To get microsoft token
@api {public}
@param {function} callback
**/
export const getMSToken =(callback)=> {
    const token=helper.localStorageGet('ms_t');
    //Token already available from the local storage
    if(token && token[loggedInStaffId]){
        callback(null, token[loggedInStaffId].objectId, token[loggedInStaffId].t);
    }else{
        //Initialize microsoft authentication library
        initMicrosoftAuthentication((err, data)=>{
            if(err || !data){
                callback(err, null, null);
            }else{
                callback(err, data.objectId, data.t);
            }
        });
    }
}

/** To do microsoft authentication
@api {public}
@param {function} callback
**/
export const initMicrosoftAuthentication=((callback)=>{
    // Get the microsoft client id
    getAuthenticationConfig("ms", (err, config)=> {
        if (config) {
            LmsCommonService.doAuthAndAcquireToken(config["msAuth"]["id"], (err, data)=>{
                if (data && data.t) {
                    let msToken={};
                    msToken[loggedInStaffId]=data;
                    if(msToken[loggedInStaffId]){
                        helper.localStorageSet("ms_t",msToken);
                    }
                    callback(null, msToken[loggedInStaffId])
                } else {
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }
            });
        } //error is already handled in getAuthenticationConfig
    });
});

/** To schedule ms_team meeting
    @api {public}
    @param {object} oScheduleEnterprise
    @param {function} updateMeetingDtls
**/
export const scheduleMSMeeting =(oScheduleEnterprise, updateMeetingDtls)=>(dispatch) => {
    //Get the token from the microsoft
        getMSToken((err, objectId, token)=> {
          if (token) {
            oScheduleEnterprise.meetingReq = {
              vendor: "MS_TEAM",
              objectId: objectId,
              t: token,
            };
            dispatch(
              createOnlineMeeting(oScheduleEnterprise, updateMeetingDtls)
            );
          } else {
            messageUtil.showError("CANT_GET_MS_TOKEN", false);
          }
        });
}

/** To get external auth config
    @api {public}
    @param {string} authSrc
    @param {function} callback
  **/
export const getAuthenticationConfig =(authSrc,callback)=>{
    LmsCommonService.getAuthConfig(
      {
        authSrc: authSrc,
      },
      (err, data) => {
        if (data && data.config) {
          callback(null, data.config);
        } else {
          callback("error", null);
        }
      }
    );
}

/** Cancel ms_team meeting
@api {public}
@param {string} meetingId
@param {function} updateCancelMeeting
**/
export const cancelMSMeeting = (meetingId,updateCancelMeeting)=>(dispatch)=> {
    //Get the token from the microsoft
    getMSToken((err, objectId, token)=>{
        if(token){
            dispatch(cancelOnlineMeeting(meetingId,token,updateCancelMeeting));
        }else{
            messageUtil.showError("CANT_GET_MS_TOKEN", false);
        }
    });
}


/** To book virtual class
@api {public}
@param {string} bookingReq
@param {function} bookingRes
**/
export const bookVirtualClass = (schdl)=>(dispatch)=> {
    const oBookReq = {
        stuId: UserSession.getSession().stuId || '',
        slotId: schdl?._id,
        startTime: schdl?.start,
        usrTime   : moment(),
        endTime: schdl?.end
    };
    HTTPService.post('/virtualClass/register-new-student', oBookReq, null, (err, docs) => {
        if (docs?.output?.data?.code) {
            messageUtil.showSuccess(`${docs?.output?.data?.code}`, true);
        } else if(docs?.output?.errors?.code){
            messageUtil.showWarning(`${docs?.output?.errors?.code}`, true); 
        } else {
            messageUtil.showError("UNKNOWN_ERROR", false);
        }
    });    
};

export const submitStudFeedback = (feedbackValues)=>(dispatch)=> {
    if (feedbackValues) {
        const oFeedbackReq = {
            InId: feedbackValues?.InId || UserSession.getSession().InId || '',
            vcId: feedbackValues?.vcId,
            StuID: feedbackValues?.StuID || UserSession.getSession().stuId || '',
            FdbkAttr: feedbackValues?.FdbkAttr,
            Nm: feedbackValues?.Nm,
            atrTyp: feedbackValues?.atrTyp,
            _id: feedbackValues?._id
        };
        HTTPService.post('/lms/save-vc-stud-feedback', oFeedbackReq, {}, (docs, err) => {
            if (docs) {
            messageUtil.showSuccess("FEEDBACK_SUBMITTED_SUCCESSFULLY", true);
            } else {
            messageUtil.showError("UNKNOWN_ERROR", true);
            }
        });
    } else {
    messageUtil.showInfo("NO_FEEDBACK_ADDED", true);
    }
};

export const getFeedbackDetails = (fdBckId, updateFeedbackData, vcId)=>(dispatch)=> {
    if (fdBckId) {
        HTTPService.get('/feedbk/getfdbkAttr/' + fdBckId, null, (err, docs) => {
            if (docs?.output?.data?.length) {
                const oFBdoc = docs.output.data[0];
                oFBdoc.FdbkAttr.forEach((item) => {
                    const aRmrks = item?.Rat?.map((ratItem) => ratItem.Rmks);
                    item.newRmkArr = aRmrks;
                });
                updateFeedbackData({
                    vcId: vcId,
                    StuID: UserSession.getSession()?.stuId || '',
                    StrRate: oFBdoc.StrRate,
                    atrTyp: oFBdoc.atrTyp,
                    FdbkAttr: oFBdoc.FdbkAttr,
                    Nm: oFBdoc.Nm
                });
            }
        });
    }
};