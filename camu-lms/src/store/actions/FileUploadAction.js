/* Action File For S3 File Upload */


import HTTPService from "../../utils/http-util";
import MessageService from '../../utils/message-util';
import { store } from '../Store';
import LmsCommonService from '../../service/lms-service';

export const INITIALIZE_FILE_UPLOAD = "INITIALIZE_FILE_UPLOAD";

/* Dynamic action data setting */
export const updateFields = (key, value) => ({
    key,
    value,
    type: INITIALIZE_FILE_UPLOAD
});


/** To upload file to s3
@api {public}
@param {object} uploadRequest
**/
export const initializeFileUpload = (uploadRequest) => (dispatch) => {
 // For multiple attechment to store preview data
    let preAttachment =store.getState().fileUploadReducer.attachments;
    if(uploadRequest.files && uploadRequest.files.length){
        for (var fls = uploadRequest.files.length - 1; fls >= 0; fls--) {
            if(uploadRequest.files[fls].name){
                var uploadFleNme = uploadRequest.files[fls].name.split('.');
                if(uploadFleNme && uploadFleNme.length>2){
                    MessageService.showError("FILE_CANNOT_UPLOAD_INITIALIZE_ERROR", false);
                    return;
                }
            }
        }
        //dispatch(updateFields('attachments', [{"test":"1"}]))
        uploadFilesToS3(uploadRequest, (err, data)=>{
            let attachmentsCpy = [...preAttachment, ...data];
            if(uploadRequest.multiple){
                dispatch(updateFields('attachments', attachmentsCpy));
            }else{
                dispatch(updateFields('attachments', data));
            }
        });
           
    }else{
        if(!uploadRequest.multiple){
            MessageService.showInfo("SINGLE_FILE_UPLOAD_INITIALIZE_ERROR", false);
        }else{
            MessageService.showError("FILE_UPLOAD_INITIALIZE_ERROR", false);
        }
    }
}

/** To get init and upload file to S3
@api {private}
@param {object} oReq
@param {object} oReq
@param {function} callback
**/

function uploadFilesToS3(uploadRequest, callback) {
    //intialize file upload
    const uploadInitReq = {"files":[],"attachmentFor": uploadRequest.attachmentFor,"moduleName" : uploadRequest.forModule};
    if(uploadRequest?.isFromScorm){
        uploadInitReq.isFromScorm = uploadRequest.isFromScorm
    }
    for (let i = 0; i < uploadRequest.files.length; i++) {
      uploadInitReq.files.push({
        name: uploadRequest.files[i].name,
        fileSize : uploadRequest.files[i].size
      });
    }
    HTTPService.post('/centralreportstore/initialize_file_upload', uploadInitReq, null, (err, data)=>{
        if(data && data.output && data.output.data && data.output.data && data.output.data.attachments.length){
            processAllFiles(uploadRequest.files, data.output.data.attachments, null, uploadRequest.onFileUploadProgress, ()=>{//error handling yet to be done
                MessageService.showSuccess("FILE_UPLOAD_SUCCESS", true);
                callback(null, data.output.data.attachments);
            });
            
        }else{
            MessageService.showError("FILE_UPLOAD_INITIALIZE_ERROR", false);
        }
    });
}

/*Process all files and uploads each file asyncronusly*/
function processAllFiles(files, attachments, keyPairValue, onFileUploadProgress, callback) {
    const allUploadPromises=[];
    attachments.forEach(function(attachment, index){
      for (var i = files.length - 1; i >= 0; i--) {
        if(files[i].name === attachment.orgFileNm){
          allUploadPromises.push(uploadSingleFileToS3(files[i], attachment, keyPairValue, onFileUploadProgress));
          break;
        }
      }
    });
    Promise.all(allUploadPromises).then(function () {
      callback();
    });
  }

/*Uploads single file to s3*/
function uploadSingleFileToS3(file, attachment, keyPairValue, onFileUploadProgress){
    var s3NewPromise = new Promise((resolve, reject)=>{
        //fake progress
        if (typeof onFileUploadProgress == "function") {
            onFileUploadProgress(attachment.name, attachment.fileKey, keyPairValue, { total: 100, loaded: Math.random() * 100 });
        }
        HTTPService.putFile(attachment.presignedPutURL, file, { "Content-Type": file.type, ACL: "private" }, (err, data)=>{
            if(err){
                reject(err);
            }else{
                attachment.url = attachment.fileGetURL;
                attachment.keyPairValue = keyPairValue;
                attachment.fileTy = "LOCL";
                //fake progress
                if (typeof onFileUploadProgress == "function") {
                    onFileUploadProgress(attachment.name, attachment.fileKey, keyPairValue, { total: 100, loaded: 100 });
                }
                resolve(data);
            }
        });
    });
    return s3NewPromise;
    
}
// remove image or data from file reducer
export const removeImg=()=>(dispatch)=>{
    dispatch(updateFields('attachments', []));

}

/** To do google drive authentication
@api {public}
@param {function} callback
**/
export const initGoogleDriveAuthentication = (uploadRequest) => (dispatch) => {
    // Get the google drive client id and developer key
    getAuthenticationConfig("gDrive", (err, config)=> {
        if (config && config.gDriveAuth) {
            dispatch(updateFields('gDriveAuth', config.gDriveAuth));
        }else {
            MessageService.showError("GOOGLE_DRIVE_AUTHENTICATION_FAILED", false);
        }
    });
};

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

/** To select file to google drive
@api {public}
@param {object} uploadRequest
**/
export const initializeGooleFileUpload = (uploadRequest) => (dispatch) => {
    let preAttachment =store.getState().fileUploadReducer.attachments;
    if(uploadRequest.files && uploadRequest.files.length){
        let attachmentsCpy = [...preAttachment, ...uploadRequest.files];
        if(uploadRequest.multiple){
            dispatch(updateFields('attachments', attachmentsCpy));
        }else{
            dispatch(updateFields('attachments', uploadRequest.files));
        }
        MessageService.showSuccess("FILE_UPLOAD_SUCCESS", true);
    }else{
        if(!uploadRequest.multiple){
            MessageService.showInfo("SINGLE_FILE_UPLOAD_INITIALIZE_ERROR", false);
        }else{
            MessageService.showError("FILE_UPLOAD_INITIALIZE_ERROR", false);
        }
    }
}


export const downloadS3Files = (uploadRequest) => {
    const DEFAULT_FILE_NAME = 'downloaded_file';

    HTTPService.post('/lms/centralreportstore/initialize-FileDownload', uploadRequest, null, (statusCode, response) => {
        if (response.output?.errors) {
            MessageService.showError("UNKNOWN_ERROR", false);
            return;
        }

        const { data = {} } = response.output;
        const { ContentType: contentType, presignedUrl = '' } = data;

        const fileName = uploadRequest.name || DEFAULT_FILE_NAME;

        handleFile( fileName, presignedUrl, contentType ?? '', uploadRequest.mode ?? 'download');
    });
};

/**
 * download file in same page
 * @param {*} fileName 
 * @param {*} presignedUrl 
 */
const downloadFile = (fileName, presignedUrl) => {
    const link = document.createElement('a');
    link.href = presignedUrl;
    link.download = fileName || 'downloaded_file';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Handles file download/preview from a presigned URL
 * @param {string} presignedUrl - The generated presigned URL
 * @param {string} [mode='download'] - 'download' or 'preview'
 * @param {string} filename - Custom filename for download
 * @param {string} fileType - MIME type (helps with preview)
 */
const handleFile = async (fileName, presignedUrl, fileType, mode = 'download') => {
    try {
      if (mode === 'download') {
        downloadFile(fileName, presignedUrl);
      } else {
        // Preview logic
        if (fileType.startsWith('image/')) {
          window.open(presignedUrl, '_blank');
        } else if (fileType === 'application/pdf') {
          // iOS devices often lack PDF preview
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            MessageService.showWarning("PREVIEW_NOT_SUPPORTED_DOWNLOADING_INSTEAD",true);
            downloadFile(fileName, presignedUrl);
          } else {
            window.open(presignedUrl, '_blank');
          }
        } else if (
          fileType.startsWith('text/') || 
          fileType === 'application/json' ||
          fileType.includes('video/')
        ) {
          window.open(presignedUrl, '_blank');
        } else {
          MessageService.showWarning("PREVIEW_NOT_AVAILABLE_DOWNLOADING_INSTEAD",true);
          downloadFile(fileName, presignedUrl);
        }
      }
    } catch (err) {
      MessageService.showError(
        mode === 'download' ? "FILE_DOWNLOAD_ERROR" : "FILE_PREVIEW_ERROR", 
        false
      );
    }
};
