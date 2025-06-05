/** Contains HTTP UTIL functions
**/
// 'use strict'

import axios from 'axios';
import { trackPromise} from 'react-promise-tracker';
import lmsCommonService from '../service/lms-service';
import i18next from "i18next";

// Function to disable page interactions while loading
const disablePageOnLoading = () => {
  document.body.classList.add('disable-page-onloading'); 
};

// Function to remove page disabled state after loading
const removePageDisabledAfterLoaded = () => {
  document.body.classList.remove('disable-page-onloading'); 
};


class HTTPService {
  constructor() {
    let service = axios.create({
      withCredentials: true,
      headers: { csrf: 'token' },
      baseURL: (process.env.NODE_ENV === 'development') ? "http://localhost:3000" : "/"
    });
    this.loadedDomainCodes = {};
    this.numberOfAjaxCAllPending = 0; 

    // Add request interceptor
    service.interceptors.request.use(
      (config) => {
        this.numberOfAjaxCAllPending++;
        if (this.numberOfAjaxCAllPending === 1) {
          disablePageOnLoading();
        }
        return config;
      },
      (error) => {
        this.numberOfAjaxCAllPending--;
        if (this.numberOfAjaxCAllPending === 0) {
          removePageDisabledAfterLoaded();
        }
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    service.interceptors.response.use(
      (response) => {
        this.numberOfAjaxCAllPending--;
        if (this.numberOfAjaxCAllPending === 0) {
          removePageDisabledAfterLoaded();
        }
        lmsCommonService.sessionFlashPingPong();
        return response;
      },
      (error) => {
        this.numberOfAjaxCAllPending--;
        if (this.numberOfAjaxCAllPending === 0) {
          removePageDisabledAfterLoaded();
        }
        this.handleError(error);
        return Promise.reject(error);
      }
    );

    this.service = service;
  }


  handleError = (error) => {
    switch (error.response.status) {
      case 401:
        this.redirectTo(document, '/')
        break;
      case 404:
        this.redirectTo(document, '/404')
        break;
      case 403:
        alert(i18next.t(`translate:ERROR_403_MESSAGE`))
        this.redirectTo(document, '/')
        break;
      default:
        //this.redirectTo(document, '/500')
        break;
    }
  }

  redirectTo = (document, path) => {
    document.location = path
  }
  
  get(path, header, callback) {
    trackPromise(
      this.service.get(path,{
        headers: header
      }).then(
        (response) => callback(response.status, response.data)
      ).catch(
        (error) => {
          callback(error.response);
        }
      )
    );
  }

  patch(path, payload, header, callback) {
    trackPromise(this.service.request({
      method: 'PATCH',
      url: path,
      responseType: 'json',
      data: payload,
      headers: header
    }).then((response) => callback(response.status, response.data))
      .catch(
        (error) => {
          callback(error.response);
        }
      )
    )
  }

  post(path, payload, header, callback) {
    trackPromise(
      this.service.request({
        method: 'POST',
        url: path,
        responseType: 'json',
        data: payload,
        headers: header
      }).then((response) => callback(response.status, response.data))
      .catch(
        (error) => {
          callback(error.response);
        }
      )
    );
  }

  postResTypBlob(path, payload, header, callback) {
    trackPromise(
      this.service.request({
        method: 'POST',
        url: path,
        data: payload,
        headers: {
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }).then((response) => callback(response.status, response.data))
      .catch(
        (error) => {
          callback(error.response);
        }
      )
    );
  }

  //To get the domain values by code
  getDomainByCode(code,callback){
    if(this.loadedDomainCodes['code']){
      callback(null,this.loadedDomainCodes['code']);
    }else{
      axios.get('/domain/' + code)
      .then(response => {
        if (response && response.data && response.data.output){
          if(response.data.output.data && response.data.output.data.ccodes && response.data.output.data.ccodes.length>0){
            this.loadedDomainCodes['code'] =  response.data.output.data.ccodes;
          }
        }
        callback(null,this.loadedDomainCodes['code']);
      })
    }
  }

  /**
  To upload file to S3, axios put is failing so fetch is used
  @api {public}
  **/
  putFile(path, payload, header, callback) {

    // Add custom headers
    const headers = new Headers();
    if (header) {
      for (const key in header) {
        headers.append(key, header[key]);
      }
    }
    trackPromise(
      fetch(path, {
        method: "PUT",
        body: payload,
        headers: headers,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          callback(null, { code: response.status });
        })
        .catch((error) => {
          // Handle errors
          console.error("Error:", error);
          callback(error, null);
        })
    );
  }

}

export default new HTTPService();
