// 'use strict'

import HTTPService from "../../utils/http-util";
import {UPDATE_CONTENT_FIELDS} from '../reducer/ContentReducer';
import {UPDATE_HEADER_FIELDS} from '../reducer/HeaderReducer';
import UserSession from '../../utils/UserSession';
import messageUtil from '../../utils/message-util';
import _ from 'lodash';
import helper from '../../utils/helper';

export const updateFields = (key, value) => ({
    key,
    value,
    type: UPDATE_HEADER_FIELDS
})
export const updateFieldsInContent = (key, value) => ({
       key,
       value,
       type: UPDATE_CONTENT_FIELDS
})

export const getSessionDtls = (callback) => (dispatch) => {
    HTTPService.get('/get-session-dtls',{},function(err,response){
        if(response && response.output){
            if(response.output.data && !_.isEmpty(response.output.data)){
                if(response.output.data.session && response.output.data.session.utype && response.output.data.session.utype === "student"){
                    callback(true);
                }else{
                    callback(false);
                }
                storePortalBackURL(response.output.data.session);
                UserSession.setSession(response.output.data.session);
                dispatch(updateFields('session', response.output.data.session));
		        dispatch(updateFields('OutCmBsdEdu', response.output.data.OutCmBsdEdu));
		        dispatch(updateFields('ptrkSts', response.output.data.ptrkSts));
            }else {
                dispatch(updateFields('session', {}));
		        dispatch(updateFields('OutCmBsdEdu', false));
		        dispatch(updateFields('ptrkSts', 'N'));
                messageUtil.showInfo("NO_SESSION_FOUND", true);
            }
        }else {
            messageUtil.showError("UNKNOWN_ERROR", false); 
        }
    })
}


//logout from the App
export const logout_LMS = () =>(dispatch)=> {
    if(UserSession.isStudent() && helper.localStorageGet("portal_back_url")){
        window.location.assign(decodeURIComponent(helper.localStorageGet("portal_back_url")));
    }else{
        if((UserSession.isStaff()) ||(UserSession.getSession() && UserSession.getSession().utype && UserSession.getSession().utype==="a")){//staff portal home page
            //!!!!Should keep PERSIST_KEYS synced with Camu logout function. 
            // The PERSIST_KEYS is used for when logout the LMS  user preference will not clear in the local storage. 
            let iSReactScreen = localStorage.getItem('isReact');
            const PERSIST_KEYS = {policyDates:"policyDates",billObj:"billObj",billItemObj:"billItemObj",billItemCats:"billItemCats",
            receiptRep:"receiptRep",camuAltLogs:"camuAltLogs",specFldObj:"specFldObj",cookiesNtfctn:"cookiesNtfctn",shwMrWidgtAlrt:"shwMrWidgtAlrt",
            auth:"auth",userPref:"userPref",_visitedInId:"_visitedInId",editToolTip:"editToolTip","intAppsTlTip":1,"camuPersist":1}; 
            Object.keys(localStorage).forEach(function(key) { 
                if(PERSIST_KEYS && !PERSIST_KEYS[key]){
                    localStorage.removeItem(key);
                }
            });
            sessionStorage.clear(); // To clear the session storage
            HTTPService.get('/logout',{},function(err,docs){
                //It will trigger the login page (Refer App.js)
                dispatch(updateFields('session', {}));
                if (iSReactScreen === 'true' || iSReactScreen === true) {
                    window.location =  `${process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : (window.location.origin + '/v2')}/`
                } else {
                    window.location =  `${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (window.location.origin)}/`
                }
            })
        }
    }
    
}

/* should be used only in dev. mode */
export const devLogin = (userName, pwd, callback) => (dispatch)=>{
    HTTPService.post('/login.do',{
        name:userName,
        pwd:pwd
    },{},function(err,docs){
    	console.log("Dev login success");
        callback();
        dispatch(updateFields('login', true));
    });
}

/* 
To auth the student
 */
export const authenticateStudent = (token, callback) => (dispatch)=>{
    HTTPService.post('/lms/auth',{
        token:token
    },{},function(err,data){
        if(data && data.code==="SUCCESS"){
            callback(null,data);
            dispatch(updateFields('login', true));
        }else{
            logout_LMS();
        }
    });
}

/* To store the portal back url */
function storePortalBackURL(session){
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    if(params["portal_back_url"] && params["portal_back_url"].length>0){//student
       helper.localStorageSet("portal_back_url",params["portal_back_url"]);
       let URL = helper.removeURLParameter(window.location.href,"portal_back_url");
       URL = helper.removeURLParameter(URL,"auth-token");

       window.history.pushState(null, null, URL);
       if (params["isReact"]) {
         helper.localStorageSet(
           "isReact",
           params["isReact"] === "true" ? true : false
         );
        }
    }
 }

// Get subject confiq details 
export const getArCrsSubConfiq = (oReq, callback) => (dispatch) => {
    HTTPService.post('/lms/get-active-archive-course-details', oReq, null, (err, response) => {
        if (response && response.output) {
            if (response.output.data && response.output.data.oAvCrsDls && response.output.data.oAvCrsDls.isAvCrs) {
                if(UserSession.isStudent()){
                    UserSession.setArchCrsDtls(response.output.data);
                    dispatch(updateFields('isArcCrsFrStaff', true));
                }else if(UserSession.isStaff()){
                    dispatch(updateFields('isArcCrsFrStaff', true));
                }
            } else if (!_.isEmpty(response.output.data)) {
                UserSession.setArchCrsDtls({});
                dispatch(updateFields('isArcCrsFrStaff', false));
            }else {
                UserSession.setArchCrsDtls({});
                dispatch(updateFields('isArcCrsFrStaff', false)); 
            }
        } else {
           messageUtil.showError("UNKNOWN_ERROR", true);
        }
    });
}