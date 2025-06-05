/** Contains LMS Common Services
**/
// 'use strict'

import HTTPService from '../utils/http-util';
import * as Msal from 'msal';
import sjcl from 'sjcl';

let msalInstance = null;

class LmsCommonService {
  constructor() {
    this.ServData = {//cache variable
      domainCodes:[]
    };
  }

  //To get the domain values by code
  getDomainByCode(oDomain, callback) {
    const domainListToReturn = []; 
    //check the domain present in cache if found remove it from the oDomain.codes
    if(this.ServData["domainCodes"].length> 0){
      this.ServData["domainCodes"].forEach((domain)=>{
        const domainIndex = oDomain.codes.indexOf(domain.code);
        if(domainIndex >=0){
          oDomain.codes.splice(domainIndex,1);
          domainListToReturn.push(domain);
        }
      });
    }
    //make request only oDomain.codes length >0
    if(oDomain.codes.length>0){
      HTTPService.post("/lms/get-domain-codes", oDomain, null, (err, response) => {
        if (response && response.output) {
          if (response.output.data && response.output.data.length) {
            //respond only codes in oDomain.codes
            response.output.data.forEach((domain) => {
              this.ServData["domainCodes"].push(domain);//add to cache
              if (oDomain.codes.indexOf(domain.code) >= 0) {
                domainListToReturn.push(domain);
              }
            });
          }
        }
        callback(null, domainListToReturn);
      });
    }else{
      callback(null, domainListToReturn);
    }
  }

  // get grading system
  getGradingSystem(oGrad, callback) {
    if (this.ServData["aGradSys"] && this.ServData["aGradSys"].length) {
      callback(null, this.ServData["aGradSys"]);
    } else {
      HTTPService.post("/grdSystem/getByInId", oGrad, null, (err, response) => {
        if (response && response.output) {
          if (response.output.data && response.output.data.length) {
            this.ServData["aGradSys"] = response.output.data;
          }
        }
        callback(null, this.ServData["aGradSys"]);
      });
    }
  }
  // To get external auth config
  getAuthConfig(data, callback) {
    HTTPService.post(
      "/external/auth/get_external_auth_config",
      data,
      null,
      callback
    );
  }
  /** Initialize ms auth API
  @api {public}
  @param {string} clientId
  @param {function} callback
  **/
  init(clientId, callback) {
    msalInstance = new Msal.UserAgentApplication({
      auth: {
        clientId: clientId,
      },
    });
    callback();
  }

  //returns MS auth instance
  getAuthInstance() {
    return msalInstance;
  }

  /** Get the token from the microsoft authentication instance
  @api {public}
  @param {string} clientId
  @param {function} callback
  **/
  doAuthAndAcquireToken(clientId, callback) {
    let serviceInstance = this;
    serviceInstance.init(clientId, function () {
      let loginRequest = {
        scopes: ["user.read", "OnlineMeetings.ReadWrite"], // optional Array<string>
      };
      serviceInstance
        .getAuthInstance()
        .loginPopup(loginRequest)
        .then(function (response) {
          let tokenRequest = {
            scopes: ["user.read", "OnlineMeetings.ReadWrite"],
          };
          serviceInstance
            .getAuthInstance()
            .acquireTokenSilent(tokenRequest)
            .then(function (response) {
              if (response.accessToken) {
                callback(null, {
                  objectId: response.idToken.objectId,
                  t: response.accessToken,
                });
              } else {
                callback("Error", null);
              }
            })
            .catch(function (err) {
              callback(err, null);
            });
        })
        .catch(function (err) {
          callback(err, null);
        });
    });
  }
  
  /*
  LMS Login Encryption Process
 */
  LmsLoginProcess=(u,p)=>{
          let str = JSON.stringify({u:u,p:p});
          let _gpival = this.getCookie('xbyr');
          let c = JSON.parse(sjcl.encrypt(_gpival,str));            
          let value={
              name:c.ct,
              pwd:c.iv,
              head:c.salt,
              dtype:'W'
          }
          document.cookie =  "_pf$="+JSON.stringify(_gpival)+";path=/";
          return value;
  }

  //Get the cookie based on the name
  getCookie = (cookieName) =>{
    var re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');
    var sMatch = (' '+document.cookie).match(re);
    if (cookieName && sMatch) 
    return sMatch[1] || '';
  }

  /* 
    Session Logged out service
    This API used to trigger empty API call for to add the session time 
  */
  sessionFlashPingPong() {
    var timeOutForPingPongApi = 15*60*1000;      //15 min
    if(this.timerId){
      clearTimeout(this.timerId);
    }
    function sessionPingPongFun(){
      HTTPService.get(
        "/session/session-flash-ping-pong"
      );
    }
    this.timerId = setTimeout(sessionPingPongFun, timeOutForPingPongApi);
  };
}
 
export default new LmsCommonService();


