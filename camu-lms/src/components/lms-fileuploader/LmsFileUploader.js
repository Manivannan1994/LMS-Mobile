//  import React, { Component } from 'react';
import React, { lazy } from "react";
// import React, { useState } from "react";
import Dropzone from 'react-dropzone';
// import Button from '../button/Button';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { initializeFileUpload, initializeGooleFileUpload ,removeImg, updateFields, initGoogleDriveAuthentication } from '../../store/actions/FileUploadAction';
import { Folder, Upload } from 'react-feather';
import  { useEffect,useRef } from 'react';
import { Plus } from "react-feather";
import "../../styles/lmsFileUploaderStyle.scss";

const Button = lazy(() =>
    import('../button/Button')
);
const FileUrl = lazy(() =>
    import('../fileurl/FileUrl')
);
// import { Children } from "react";

const LmsFileUploader = (props) => {
    let inputRef = useRef(null);
    let containerRef = useRef(null)
    useEffect(() => {
        // do google drive authentication
        props.initGoogleDriveAuthentication();
    }, [])
    // google drive picker

    const client_Id = props.gDriveAuth.id;
    const developer_Key = props.gDriveAuth.devKey;
    const app_Id = props.gDriveAuth.app_Id;
    var multiselect ="";
    if(props.multiple){
        multiselect = "multiselectEnabled";
    }else{
        multiselect = "multiselectDisabled";
    }
    useEffect(() => {
        const SCOPE = "https://www.googleapis.com/auth/drive.file";
        const gapiLoaded = () => window.gapi.load('picker', gisLoaded(), intializePicker);
        function intializePicker() {
          window.pickerInited = true;
        }
        function gisLoaded() {
          const google = window.google;
          window.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: client_Id,
            scope: SCOPE,
            // callback: "",
          });
          window.gisInited = true;
        }
    
        const script = document.createElement('script');
    
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.defer = true;
        script.onload = gapiLoaded;
    
        document.body.appendChild(script);
    
    
        return () => {
          document.body.removeChild(script);
        };
    }, [client_Id]);
      /**
   *  Sign in the user upon button click.
   */
    function handleAuthClick() {
        window.tokenClient.callback = async (response) => {
          if (response.error !== undefined) {
            throw (response);
          }
          window.accessToken = response.access_token;
          await createPicker();
        };
    
        if (window.accessToken === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          window.tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          window.tokenClient.requestAccessToken({prompt: ''});
        }
    }
  
    function createPicker() {
        // const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        const view = new window.google.picker.DocsView()
            .setIncludeFolders(true) 
            // .setMimeTypes([])
            // .setMimeTypes(['application/vnd.ms-excel',
            // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            // 'text/xml',
            // 'application/vnd.oasis.opendocument.spreadsheet',
            // 'text/plain',
            // 'text/plain',
            // 'application/pdf',
            // 'application/x-httpd-php',
            // 'image/jpeg',
            // 'image/png',
            // 'image/gif',
            // 'image/bmp',
            // 'text/plain',
            // 'application/msword',
            // 'text/js',
            // 'application/x-shockwave-flash',
            // 'audio/mpeg',
            // 'application/zip',
            // 'application/rar',
            // 'application/tar',
            // 'application/arj',
            // 'application/cab',
            // 'text/html',
            // 'text/html',
            // 'application/octet-stream',
            // 'application/vnd.google-apps.folder'])
            // .setSelectFolderEnabled(true);
        const picker = new window.google.picker.PickerBuilder()
            .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
            .enableFeature(multiselect)
            .setDeveloperKey(developer_Key)
            .setAppId(app_Id)
            .setOAuthToken(window.accessToken)
            .addView(view)
            .addView(new window.google.picker.DocsUploadView())
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
    }
    function pickerCallback(data) {
        if (data.action === window.google.picker.Action.PICKED) {
            if(data && data.docs.length > 0){
                data.docs.map(item => 
                    item.fileTy= "GD"
                );
                props.initializeGooleFileUpload({files:data.docs, "multiple":props.multiple});
            }
        }
    }

    /** File upload progress function
    @api {private}
    @param {fileName, fileKey, keyPairValues, progress}
    @param {function} callback
    **/
    var tempFileUploadProgressDet = [];
    function onFileUploadProgress(fileName, fileKey, keyPairValues, progress) {
        var uplodedAttachmentStatus = {};
        var alreadyExistFileKey = false;
        var alreadyExistFileKeyPosition;
        //init attachment status
        if (!uplodedAttachmentStatus[fileKey]) {
            uplodedAttachmentStatus[fileKey] = {};
            if (fileKey && tempFileUploadProgressDet && tempFileUploadProgressDet.length) {
                for (var fileAry = 0; fileAry < tempFileUploadProgressDet.length; fileAry++) {
                    if (tempFileUploadProgressDet[fileAry].atchId === fileKey) {
                        alreadyExistFileKey = true;
                        alreadyExistFileKeyPosition = fileAry;
                        break;
                    }
                }
            }
            if (!alreadyExistFileKey) {
                tempFileUploadProgressDet.push({
                    name: fileName,
                    atchId: fileKey,
                    "t": "c",
                    fileTy:"LOCL"
                });
            }
        }

        //set progress
        if (progress && progress["total"] === progress["loaded"]) {
            uplodedAttachmentStatus[fileKey].percentageLoaded = 100;
            uplodedAttachmentStatus[fileKey].isLoaded = true;
        } else {
            uplodedAttachmentStatus[fileKey].isLoaded = false;
            uplodedAttachmentStatus[fileKey].percentageLoaded = Math.round(100 * progress["loaded"] / progress["total"]);
        }

        // Total percentage loaded
        var percentageLoaded = 0;
        var total = 0;
        for (var filekey in uplodedAttachmentStatus) {
            percentageLoaded += uplodedAttachmentStatus[filekey].percentageLoaded;
            total++;
        }
        if (percentageLoaded > 0) {
            if (alreadyExistFileKey) {
                tempFileUploadProgressDet[alreadyExistFileKeyPosition].percentageLoaded = percentageLoaded / total;
            } else {
                if (tempFileUploadProgressDet && tempFileUploadProgressDet[tempFileUploadProgressDet.length - 1]) {
                    tempFileUploadProgressDet[tempFileUploadProgressDet.length - 1].percentageLoaded = percentageLoaded / total;
                }
            }
        }
        props.updateFields('attachments', []);
        props.updateFields('attachments', tempFileUploadProgressDet);
    }

    const addImgHandler = () => {
        if(props.isFileUplod){
            inputRef.current.click()
            containerRef.current.setAttribute("data-toggle", "")
            props.isConfiqBtn(true)
        }
        }
    return (
        <div>
            <div onChange={()=> props.onChange()}>
                <Dropzone onDrop={acceptedFiles =>{
                        props.onDropChange()
                        props.initializeFileUpload({ "files": acceptedFiles, "attachmentFor": props.isFromScorm ? "CAMU_LMS_SCORM":"CAMU_ATTACHMENT", "forModule": "ASSIGNMENT", onFileUploadProgress: onFileUploadProgress, "multiple": props.multiple,"isFromScorm": props.isFromScorm,"isFromOth" : props.isFromOth })
                    } 
                } multiple={props.multiple} accept={!props.accept ? '.pdf,.xls,.xlsx,.doc,.docx,.png,.jpeg,.jpg,.csv,.pptx,.ppt' : props.accept }>
                    {({ getRootProps, getInputProps }) => (
                        <section>
                            <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                {props.children}
                            </div>
                        </section>
                    )}
                </Dropzone>
            </div>
            { (props.btnEnable || props.forParag) &&
                <div class="dropdown">
                    <div id="up-button" data-toggle="dropdown" onClick={addImgHandler} ref={containerRef}>
                        {   props.addImage &&
                            <Button theme="btn-rounded btn-outline"> <Plus/> {props.addImage ?? props.t("translate:ASSIGNMENTCONTENTCOMPONENT_CHOOSE_FILE")}</Button> 
                        }
                        {
                            props.forParag && 
                            <p className="upload_file-content">{ props.t("translate:CHANGE_IMAGE")}</p>
                        }
                        {
                            (!props.addImage && !props.forParag) &&
                            <Button theme="btn-rounded btn-outline" >{ props.t("translate:ASSIGNMENTCONTENTCOMPONENT_CHOOSE_FILE")}</Button>
                        }   
                    </div>
                    <div className="dropdown-menu external-file_modal" style={{width:"300px",padding:"15px"}}>
                        <div className="external-file_uploader">
                            <p className="form_add_label">{props.t("translate:ADD_FROM")}</p>
                            <div className="external-form_list">
                                <div onClick={()=>props.onFileChange()} >
                                    <Dropzone onDrop={acceptedFiles =>
                                        props.initializeFileUpload({ "files": acceptedFiles, "attachmentFor": props.isFromScorm ? "CAMU_LMS_SCORM":"CAMU_ATTACHMENT", "forModule": "ASSIGNMENT", onFileUploadProgress: onFileUploadProgress, "multiple": props.multiple,"isFromScorm": props.isFromScorm,"isFromOth" : props.isFromOth})
                                            // } multiple={props.multiple} accept='image/png'>
                                            } multiple={props.multiple} accept={ !props.accept ? '.pdf,.xls,.xlsx,.doc,.docx,.png,.jpeg,.jpg,.csv,.pptx,.ppt' : props.accept }>
                                        {({ getRootProps, getInputProps }) => (
                                            <section>
                                                <div {...getRootProps()}>
                                                    {props.isFileUplod ? 
                                                    <input {...getInputProps()} ref={inputRef} /> 
                                                    : <input {...getInputProps()}/>}
                                                    
                                                    <p className="external-form_list">
                                                        <span>
                                                            <Upload className="svg-icon_extra-small icon-secondary" />
                                                        </span>
                                                        {props.t("translate:UPLOAD_FROM_COMPUTER")}
                                                    </p>
                                                </div>
                                            </section>
                                        )}
                                    </Dropzone>
                                </div>
                            </div>
                            {/* <p className="external-form_list">
                                <span>
                                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_13955_105113)">
                                            <path d="M9.15184 4.44325L9.15207 4.44239L14.1903 7.58291L17.1925 6.26817L17.1926 6.26871C17.8027 5.99425 18.4604 5.85298 19.125 5.85366C19.2357 5.85366 19.3452 5.85889 19.4541 5.86645C19.0931 4.4018 18.3312 3.07778 17.2608 2.05528C16.1904 1.03278 14.8576 0.35583 13.4245 0.106689C11.9914 -0.142451 10.5196 0.0469451 9.18794 0.651863C7.8563 1.25678 6.72216 2.25117 5.92334 3.51421C5.949 3.51387 5.97428 3.51219 6 3.51219C7.11349 3.51062 8.20521 3.83312 9.15184 4.44325Z" fill="#0364B8" />
                                            <path d="M9.15207 4.44238L9.15184 4.44324C8.20521 3.83311 7.11348 3.51061 6 3.51218C5.97427 3.51218 5.94896 3.51386 5.92333 3.5142C4.8335 3.52824 3.76796 3.85106 2.84119 4.44797C1.91443 5.04487 1.16149 5.89331 0.663278 6.90209C0.165069 7.91086 -0.0595727 9.04185 0.0134948 10.1735C0.0865623 11.3052 0.454576 12.3947 1.07799 13.3251L5.52099 11.3794L7.49605 10.5145L11.8937 8.58863L14.1903 7.5829L9.15207 4.44238Z" fill="#0078D4" />
                                            <path d="M19.454 5.86646C19.3451 5.8589 19.2356 5.85367 19.1249 5.85367C18.4603 5.853 17.8026 5.99426 17.1925 6.26872L17.1924 6.26819L14.1902 7.58293L15.0608 8.12558L17.9145 9.9044L19.1595 10.6805L23.4168 13.3342C23.8036 12.5869 24.0041 11.7505 23.9998 10.9017C23.9956 10.0529 23.7867 9.21875 23.3924 8.47569C22.9981 7.73263 22.4309 7.1044 21.7428 6.64855C21.0548 6.1927 20.2678 5.9238 19.454 5.86647V5.86646Z" fill="#1490DF" />
                                            <path d="M19.1595 10.6805L17.9145 9.90438L15.0608 8.12557L14.1902 7.58292L11.8936 8.58864L7.49595 10.5145L5.52088 11.3794L1.07788 13.3251C1.63 14.1512 2.36604 14.8259 3.22314 15.2917C4.08025 15.7575 5.03294 16.0005 5.99988 16H19.1249C20.0049 16.0003 20.8686 15.7526 21.6242 15.2832C22.3799 14.8139 22.9993 14.1404 23.4168 13.3342L19.1595 10.6805Z" fill="#28A8EA" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_13955_105113">
                                                <rect width="24" height="16" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </span>
                                {props.t("translate:ONE_DRIVE")}
                            </p> */}
                             <p onClick={() => props.onBrowseFile?.()} className="external-form_list" data-toggle="modal" data-target="#scorm-browse">
                            <span>
                                 <Folder className="svg-icon_extra-small icon-secondary" />
                             </span>
                            {props.t("translate:BROWSE_FILE")}
                            </p>
                            <p onClick={() => props.onGogleFileChng()} className="external-form_list">
                                <div onClick={() => handleAuthClick()}>
                                    <span>
                                        <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.81444 17.141L2.87287 18.846C3.09281 19.205 3.40894 19.4871 3.78009 19.6922C4.84322 18.4336 5.58309 17.4678 6.00009 16.7948C6.42319 16.1118 6.94322 15.0434 7.56019 13.5897C5.89744 13.3855 4.63744 13.2835 3.78019 13.2835C2.95734 13.2835 1.69734 13.3855 0 13.5897C0 13.9871 0.109969 14.3845 0.329906 14.7436L1.81444 17.141Z" fill="#0066DA" />
                                            <path d="M20.2202 19.6922C20.5914 19.4871 20.9075 19.205 21.1274 18.8461L21.5673 18.141L23.6705 14.7436C23.8863 14.3923 24 13.9946 24.0003 13.5897C22.2931 13.3855 21.0354 13.2835 20.2271 13.2835C19.3584 13.2835 18.1007 13.3855 16.4539 13.5897C17.0635 15.0513 17.5767 16.1198 17.9934 16.7948C18.4137 17.4758 19.1559 18.4416 20.2202 19.6922Z" fill="#EA4335" />
                                            <path d="M12.0001 6.41022C13.2301 5.02475 14.0778 3.95634 14.543 3.20515C14.9178 2.60025 15.3302 1.63441 15.7802 0.307697C15.409 0.102566 14.9829 0 14.543 0H9.4571C9.01722 0 8.59122 0.115419 8.21997 0.307697C8.79241 1.82931 9.27822 2.91223 9.67722 3.5564C10.1182 4.26832 10.8925 5.21957 12.0001 6.41022Z" fill="#00832D" />
                                            <path d="M16.4401 13.5898H7.56027L3.78027 19.6923C4.15134 19.8974 4.57743 20 5.01731 20H18.9831C19.4229 20 19.8491 19.8846 20.2202 19.6922L16.4402 13.5898H16.4401Z" fill="#2684FC" />
                                            <path d="M12.0001 6.41018L8.22009 0.307739C7.84884 0.512871 7.53272 0.79486 7.31278 1.15388L0.329906 12.4358C0.114012 12.7871 0.000285232 13.1848 0 13.5897H7.56019L12.0002 6.41018H12.0001Z" fill="#00AC47" />
                                            <path d="M20.179 6.79491L16.6875 1.15388C16.4676 0.794861 16.1514 0.512871 15.7802 0.307739L12.0002 6.41026L16.4401 13.5898H23.9866C23.9866 13.1923 23.8766 12.795 23.6567 12.4359L20.179 6.79491Z" fill="#FFBA00" />
                                        </svg>
                                    </span>
                                    {props.t("translate:GOOGLE_DRIVE")}
                                </div>
                            </p>
                            {/* <p className="external-form_list">
                                <span>
                                    <svg width="24" height="21" viewBox="0 0 24 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_13954_105111)">
                                            <path d="M5.99953 0L0 3.82228L5.99953 7.64466L12 3.82228L5.99953 0ZM18 0L12 3.82266L18 7.64531L24.0001 3.82266L18 0ZM0 11.4676L5.99953 15.29L12 11.4676L5.99953 7.64531L0 11.4676ZM18 7.64531L12 11.468L18 15.2905L24 11.468L18 7.64531ZM6 16.5723L12.0005 20.3947L18 16.5723L12.0005 12.75L6 16.5723Z" fill="#0061FF" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_13954_105111">
                                                <rect width="24" height="20.4375" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </span>
                                {props.t("translate:DROPBOX")}
                            </p> */}
                        </div>
                        <div className="external-link_file">
                            <p className="add-file_label">{props.t("translate:ADD_FILE_LINK")}</p>
                            <div className="file-url_input">
                                <FileUrl onChange={(event)=>props.urlChange(event)} value={props.urlValue} URLTheme="url-uploader_default" />
                                {
                                    !props.urlValid && <span className="text-empty_content">{props.t("translate:NOT_A_VALID_URL")}</span>
                                }
                            </div>
                            <Button theme="btn-rounded btn-outline" clicked={() => props.linkAttach()}>{props.t("translate:ATTACH")}</Button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
const mapStateToProps = (state) => ({

    ...state.fileUploadReducer,
})
const mapDispatchToProps = {
    initializeFileUpload,
    initializeGooleFileUpload,
    initGoogleDriveAuthentication,
    removeImg,
    updateFields
}
const TabNavigator = (props) => <LmsFileUploader {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)
export default withTranslation()(Components);
