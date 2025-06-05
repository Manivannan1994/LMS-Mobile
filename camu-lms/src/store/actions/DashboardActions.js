import HTTPService from "../../utils/http-util";
import {UPDATE_DASHBOARD_FIELDS} from '../reducer/DashboardReducer';
import {UPDATE_HEADER_FIELDS} from '../reducer/HeaderReducer';
import UserSession from '../../utils/UserSession';
import messageUtil from '../../utils/message-util';
import { localStorageGet, localStorageSet } from "../../utils/helper";
import _ from "lodash";
import { store } from "../Store";


//export const UPDATE_DASHBOARD_FIELDS = 'UPDATE_DASHBOARD_FIELDS'
// let selectionDtls = [];
export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_DASHBOARD_FIELDS
})
export const updateheaderFields = (key, value) => ({
    key,
    value,
    type: UPDATE_HEADER_FIELDS
})

//get the Staff subjects from the subject staff mapping
export const getStaffClasses = (session) => (dispatch) => {
    if (session) {
        if(UserSession.isStaff()){
            let isLmsOldSem = session.isImpOldSem ? session.isImpOldSem : true; // is import old semester
            let isDispatchAcYr = session.isDashBrdDispchAcYr ? session.isDashBrdDispchAcYr : false; // is dispatch dasboard academic year
            let isLmsImpt = session.isFmImpt ? session.isFmImpt : false;
            HTTPService.get('/lms/get-subjects-by-staff/' + session.mappedid + '/' + session.InId + '/' + isLmsOldSem + '/' + true + '/'+ isLmsImpt,null,(err,response)=>{
                if(response && response.output && response.output.data && response.output.data.length>0){
                    if(store.getState().dashboardReducer.acYr && store.getState().dashboardReducer.acYr.length > 0 && isDispatchAcYr){
                        dispatch(updateFields('acYr', response.output.data));
                    }else{
                        if(store.getState().dashboardReducer.acYr && store.getState().dashboardReducer.acYr.length === 0){
                            dispatch(updateFields('acYr', response.output.data));
                        }
                    }
                    let dashboardData = localStorageGet('userPref');
                    // set the dashbord details in localstorage
                    if(_.isEmpty(dashboardData) || !dashboardData){
                        dashboardData = {};
                    }
                    if(session.mappedid){
                        if(!dashboardData[session.mappedid]){
                            dashboardData[session.mappedid] = {crsDashboardData:response.output.data[0]};
                        }
                    }
                    localStorageSet('userPref',dashboardData);
                    setTimeout(() => {
                        if (UserSession.isGotPerm(['rp_admin_2o_lms']) || UserSession.isGotPerm(['rp_hod_lms_view'])) {
                            dispatch(getSubjByEntprsDtlPrmsn(dashboardData[session.mappedid].crsDashboardData,session));
                        } else {
                            dispatch(getSubjByEntprsDtls(dashboardData[session.mappedid].crsDashboardData,session));
                        }
                    }, 100);
                }else if(response && response.output && response.output.data && response.output.data.length === 0){
                    dispatch(updateFields('acYr', response.output.data));
                    messageUtil.showInfo("NO_CLASS_FOUND", true);
                }else if(response && response.output && response.output.errors && response.output.errors.length > 0 && response.output.errors[0] && response.output.errors[0].id && response.output.errors[0].id==="SEM_CONFIG_DETLS_NOT_FOUND"){
                    messageUtil.showInfo("SEM_OR_SUB_DETLS_NOT_FOUND", true);
                }else{
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }   
            });
        }else if(UserSession.isStudent()){
            HTTPService.post('/lms/get-stu-prog-det',{},{},(err,response)=>{
                if(response && response.output){
                    if(response.output.data && response.output.data.length>0){
                            let dashboardData = localStorageGet('userPref');
                            response.output.data.forEach((item)=>{
                                item.SemID = item.semRstd;
                                // eslint-disable-next-line 
                                item.SecID = item.SecID;
                                item.SemName = item.semNm;
                                item.SecNm = item.secNm;
                                item.AcYrNm = item.acyrNm;
                                item.SecName = item.secNm;
                                if(session.fe && (item.AcYr === session.CurAcYr) && (item.SemID === session.CurSemID)){
                                    if(_.isEmpty(dashboardData) ||  !dashboardData){
                                        dashboardData = {};
                                    }
                                    if(session.mappedid){
                                        if(!dashboardData[session.mappedid]){
                                            dashboardData[session.mappedid] = {crsDashboardData:item};
                                        }
                                    }
                                    localStorageSet('userPref',dashboardData);
                                }
                            });
                            dispatch(updateFields('acYr', response.output.data));
                            // Only set if its not match the current details
                            if(_.isEmpty(dashboardData) ||  !dashboardData){
                                dashboardData = {};
                            }
                            if(session.mappedid){
                                if(!dashboardData[session.mappedid]){
                                    dashboardData[session.mappedid] = {crsDashboardData:response.output.data[0]};
                                }
                            }
                            localStorageSet('userPref',dashboardData);
                            setTimeout(() => {
                                dispatch(getSubjByEntprsDtls(dashboardData[session.mappedid].crsDashboardData,session));
                            }, 100);
                    }else if(response.output.data && response.output.data.length === 0){
                        dispatch(updateFields('acYr', []));
                        messageUtil.showInfo("NO_CLASS_FOUND", true);
                    }else if(response.output.errors && response.output.errors.code && response.output.errors.code==="PROG_NOT_FOUND"){
                        messageUtil.showInfo("PROG_NOT_FOUND", true);
                    }else{
                        messageUtil.showError("UNKNOWN_ERROR", false);
                    }
                }else {
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }
            });
        }
        
    }else{
       dispatch(updateheaderFields('headerPage', false))
    }
}

export const getSubjByEntprsDtls = (selection,session) => (dispatch) => {
    if (selection) {
        // selectionDtls = selection;
        dispatch(updateFields('selcDtls', selection));
        if(UserSession.isStaff()){//get subject for staff
            selection.isFrmLms = true;
            selection.isAllSubj = 'No';
            selection.Origins = "AsgmtTracker";
            selection.StaffId = session.mappedid;
            HTTPService.post('/SubjectStaffMap/searchforstaffsubject', selection,null,function(err,response){
                if( response && response.output){
                    if(response.output.data){
                        // From assignment content for rubrics loading based on subjects
                        if(selection.isFrmAsgn){
                            const oGrpBySubj = {};
                            if(response.output.data && response.output.data.length){
                                for(let sb = response.output.data.length - 1; sb >= 0; sb--){
                                    if(!oGrpBySubj[response.output.data[sb].SubjId]){
                                        oGrpBySubj[response.output.data[sb].SubjId] = {
                                            SubjId : response.output.data[sb].SubjId,
                                            text : response.output.data[sb].text
                                        };
                                    }
                                }
                            }
                            const aStfSubs = Object.values(oGrpBySubj);
                            dispatch(updateFields('aStfSubs', aStfSubs));
                        }else{
                            dispatch(updateFields('subjects', response.output.data));
                            dispatch(updateFields('subjectsCopy', response.output.data));
                            if(response.output.data.length === 0){
                                messageUtil.showInfo("NO_SUBJECTS_FOUND", true);
                            }
                        }
                    }else if(response.output.errors && response.output.errors.code && response.output.errors.code==="NO_SUBJ_FOUND"){
                        messageUtil.showInfo("SEM_OR_SUB_DETLS_NOT_FOUND", true);
                    }
                }else {
                    messageUtil.showError("UNKNOWN_ERROR", false);
                }
            });
        }else if(UserSession.isStudent()){//get subjects for student
            selection.isFrmLms = true;
            selection.isAllSubj = 'No';
            selection.Origins = "AsgmtTracker";
            selection.studId = UserSession.getSession().mappedid;

            HTTPService.post('/lms/get-stu-sub-det', selection,null,function(err,response){
                if( response && response.output){
                    if(response.output.data){
                        if(response.output.data.length>0){
                            response.output.data.forEach((item)=>{
                                item.SemID = selection.semRstd;
                                item.SemName = selection.semNm;
                                item.Code = item.subDes;
                                item.SubjNm = item.subNm;
                                item.SubjId = item.subjId;
                                item.text = item.subDes +" - "+item.SubjNm;
                                if(!UserSession.getSession().fe){//if fixed then set student department
                                    item.deptId = selection.DeptID;
                                    item.deptCd = selection.deptCd;
                                    item.SecID = selection.SecID;
                                    item.SecNm = selection.secNm;
                                }
                            });
                        }
                        dispatch(updateFields('subjects', response.output.data));
                        dispatch(updateFields('subjectsCopy', response.output.data));
                        if(response.output.data.length === 0){
                            messageUtil.showInfo("NO_SUBJECTS_FOUND", true);
                        }
                    }else {
                        messageUtil.showError("UNKNOWN_ERROR", false);
                    }
                }
            });
        }
    }
}

export const getSubjByEntprsDtlPrmsn = (selection, session) => (dispatch) => {
    try {
        if (selection) {
            dispatch(updateFields('selcDtls', selection));
            if (UserSession.isStaff()) {
                selection.isFrmLms = true;
                selection.isAllSubj = 'No';
                selection.Origins = "AsgmtTracker";
                selection.StaffId = session.mappedid;
                HTTPService.post('/SubjectStaffMap/getStaffSubjectsByPermission', selection, null, function (err, response) {
                    if (response && response.output) {
                        if (response.output.data) {
                            dispatch(updateFields('subjects', response.output.data));
                            dispatch(updateFields('subjectsCopy', response.output.data));
                            if (response.output.data.length === 0) {
                                messageUtil.showInfo("NO_SUBJECTS_FOUND", true);
                            }
                        }
                    } else {
                        messageUtil.showError("UNKNOWN_ERROR", false);
                    }
                });
            }
        }
    } catch (e) {
        messageUtil.showError("UNKNOWN_ERROR", false);
    }
}
