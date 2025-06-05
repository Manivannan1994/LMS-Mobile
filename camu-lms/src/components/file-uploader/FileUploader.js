import React, { Component,lazy } from 'react';
import '../../styles/_fileuploaderStyle.scss';
// import Button from '../button/Button';
import { MoreInfo, PdfFile, Trash} from '../icons/Icons';
// import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import { downloadS3Files, initializeFileUpload, removeImg, updateFields } from '../../store/actions/FileUploadAction';
import $ from 'jquery';
import { withRouter } from 'react-router-dom'
import queryString from 'query-string';
import { withTranslation } from 'react-i18next';
import HTTPService from "../../utils/http-util";
import _ from "lodash";
import { ArrowLeft, Image ,Upload, Link2, Info} from 'react-feather';
import messageUtil from '../../utils/message-util';
import { isValidURL } from '../../utils/helper';
import FileLoader from '../file-loader/FileLoader';
import SimpleReactValidator from 'simple-react-validator';
import CheckBox from '../checkbox/CheckBox';
import { getUploadedScormFiles } from '../../store/actions/ScormFileAction';
const ModelBarComponent = lazy(() => import("../modelbar/Modelbar"));
const InputBox  = lazy(() =>
import('../input-box/InputBox')
);
const Button  = lazy(() =>
import('../button/Button')
);
const LmsFileUploader  = lazy(() =>
import('../lms-fileuploader/LmsFileUploader')
);
const FileUrl  = lazy(() =>
import('../fileurl/FileUrl')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const ComputerUploadPreview  = lazy(() =>
   import('../ComputerUploadPreview/ComputerUploadPreview')
   );
   
class FileUploadComponent extends Component {
   constructor(props) {
      super(props);
      this.values = undefined;
      this.state = {
         fileNm: '',
         filedata: {},
         link: '',
         errMsgFile:false,
         urlvalid: true,
         vSts:'D',          //View Status(published or not)
         fileTy:'',
         isConfirm: false,
         showChooseFile: false,
         showExistingFile: true, 
         isView:false 
      }
      //For validation and mandatory fields check
      this.validator = new SimpleReactValidator({autoForceUpdate: this});
   }
   componentDidMount() {
      $('#myModal-page').modal('hide');
      if (this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length) {
         this.props.removeImg();
      }
      if (this.props.location && this.props.location.search) {
         this.values = queryString.parse(this.props.location.search);
         if (this.values && this.values.id && this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)) {
            const oReq = {
               contntId: this.values.id,
               // InId: this.props.location.state.InId
            }
            oReq.projct = {
               title: 1,
               isView:1,
               file: 1,
               vSts:1
            }
            //Get the file details by id
            HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit', oReq, null, (err, data) => {
               if (data && data.output) {
                  // this.props.attachments[0].name=data.output.data.file.name;
                  if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND") {
                     messageUtil.showInfo("NO_FILE_FOUND", true);
                  }else if(data.output.data && !_.isEmpty(data.output.data)){
                     this.props.attachments.push(data.output.data.file);
                     setTimeout(() => {
                        this.setState({
                           fileNm: data.output.data.title,
                           isView:data.output.data.isView,
                           filedata: data.output.data.file,
                           vSts:data.output.data.vSts,
                           link:data.output.data.file && data.output.data.file.link ? data.output.data.file.link :"",
                           fileTy:data.output.data.file && data.output.data.file.fileTy ? data.output.data.file.fileTy :""
                        });
                     }, 100);
                  } else if (data.output.data && _.isEmpty(data.output.data)) {
                     messageUtil.showInfo("NO_FILE_FOUND", true);
                  }
               } else {
                  messageUtil.showError("UNKNOWN_ERROR", false);
               }
            })
         }
      }
   }
//check box function to view the file access
lockUntilHandler = (event) => {
   // Toggle the state of the checkbox
   this.setState({
     isView: event.target.checked, // The checked value from the checkbox
   });
 };
   //creating a file item against the subchapter
   addSubChapterFile = (view) => {
      //If all the fileds are valid then only allowed to save
      if (this.validator.allValid()) {
         if (this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)) {
            let oReq = {
               tCntId: this.props.location.state.TPID,
               PrID: this.props.location.state.PrID,
               CrID: this.props.location.state.CrID,
               AcYr: this.props.location.state.AcYr,
               DeptID: this.props.location.state.DeptID,
               SemID: this.props.location.state.SemID,
               SecID: this.props.location.state.SecID,
               chapId: this.values.chapId,
               sChpId: this.values.subId,
               subjId: this.props.location.state.subId,
               title: this.state.fileNm,
               isView: this.state.isView,
               // link:this.state.link,
               vSts: view,
               file: {
                  name: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name? this.props.attachments[0].name : this.state.filedata && this.state.filedata.name,
                  url: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].url? this.props.attachments[0].url : this.state.filedata && this.state.filedata.url,
                  link: this.state.link,
                  embedUrl: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].embedUrl? this.props.attachments[0].embedUrl : this.state.filedata && this.state.filedata.embedUrl,
                  fileTy: this.props.attachments && this.props.attachments[0] && this.props.attachments[0].fileTy? this.props.attachments[0].fileTy : (this.state.fileTy || this.state.filedata.fileTy),
                  ...(('isDwldPm' in this.state.filedata) ? { isDwldPm: this.state.filedata.isDwldPm } : {}),
                  ...('_id' in this.state.filedata ? { fileId: this.state.filedata._id } : {})
               },
               type: 'FILE',
               seqNo:this.props.location.state.seqNo,
               _id: this.values.id
            }
            if(oReq.file && oReq.file.embedUrl && oReq.file.fileTy && oReq.file.fileTy === "LOCL"){
               oReq.file.embedUrl = ""; 
            }
            // Check for file or url link is empty  undefined
            if ((oReq.file && oReq.file.name === undefined  || oReq.file.url === undefined) && (oReq.file.link === '')) {
               this.setState({ ...this.state, errMsgFile: true });
               return
            }
            let fileUrl;
            if(view === "F"){
               fileUrl = '/teaching-content/publish-subchapter-items';
            }else{
               fileUrl = '/teaching-content/create-or-edit-subchapter-items';
            }
            HTTPService.post(fileUrl, oReq, null, (err, data) => {
               if (data && data.output) {
                  if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONTENT_DETAILS_FOUND") {
                     this.setState({
                        fileNm: '',
                        filedata: {}
                     });
                     messageUtil.showInfo("NO_FILE_FOUND", true);
                  } else if (data.output.data && !_.isEmpty(data.output.data)) {
                     if(this.values && this.values.id && this.values.id.length){
                        messageUtil.showSuccess('FILE_UPDATED_SUCCESSFULLY',true);
                     }else{
                        messageUtil.showSuccess('FILE_ADDED_SUCCESSFULLY',true);
                     }
                     this.props.history.push({ pathname: "/home-page/files-view", search: `?id=${data.output.data._id}&chapId=${this.values.chapId}&subId=${this.values.subId}`, state: this.props.location.state });
                  } else if (data.output.data && _.isEmpty(data.output.data)) {
                     this.setState({
                        fileNm: '',
                        filedata: {}
                     });
                     messageUtil.showInfo("NO_FILE_FOUND", true);
                  }
               } else {
                  messageUtil.showError("UNKNOWN_ERROR", false);
               }
            })
         } else {
            console.log('NO_REQUEST_FOUND');
         }
      } else {
         this.validator.showMessages();
      }
   }
   // file url
   urlChanging = (event) => {
      let valid = isValidURL(event.target.value);
      this.setState({ ...this.state, link: event.target.value });
      // this.fileData = event.target.value;
      this.setState({ urlvalid: valid });
      this.props.removeImg();
   }
   fileUploadChange = (event)=>{
      this.setState({  link:'', showExistingFile: true, errMsgFile: false})
      this.props.removeImg();
   }
   fileDropUploadChange = (event) => {
      this.setState({  link:''})
      this.props.removeImg();
   }
  
   // Remove files data 
   removeFile = () => {
      this.props.removeImg();
      this.setState({ ...this.state, filedata: {}, showChooseFile: true });
   }
   googleFileUploadChange = (event)=>{
      this.setState({  link:''})
      this.props.removeImg();
   }
   linkAttach = ()=>{
      this.fileData = this.state.link;
      this.setState({ ...this.state, fileTy: "LNK", filedata:{}});
   }
   removeFileLink = () => {
      this.setState({ ...this.state, fileTy: "" , link: ""});
   } 

   handleDiscardClick = () => {
      this.setState({ isConfirm: true });
    }

    enableUploadFile = () => {
      this.props.removeImg();
      this.setState({ isConfirm: false, showChooseFile: true, filedata: {}, showExistingFile: false });
    }
    handleDownload = async () => {
      const fileData = this.props.attachments[0];
   
      if (fileData && (fileData.fileGetURL || fileData.url)) {
        try {
         //  const response = await fetch(fileData.fileGetURL);
         //  const blob = await response.blob();
         //  const link = document.createElement('a');
         //  link.href = URL.createObjectURL(blob);
         //  link.setAttribute('download', fileData.orgFileNm || 'downloaded_file');
         //  document.body.appendChild(link);
         //  link.click();
         //  document.body.removeChild(link);
         downloadS3Files({name: fileData.name , url: fileData.fileGetURL || fileData.url})
        } catch (error) {
          console.error("Error downloading file:", error);
        }
      } else {
        console.error("File URL is missing!");
      }
    };
    
   render() {
      return (
         <div>
            <div className="edit-module_container">
               <div className="edit-module_header">
                  <div className="row m-0">
                     <div className="col-6 p-0">
                        <div className="page-input_title">
                           <div className="page-title_icon" onClick={() => this.props.history.go(-1)}>
                              {/* <Paperclip iconStyle="svg-icon_small icon-primary"/> */}
                              <ArrowLeft className="svg-icon_default icon-dark icon-pointer"/>
                           </div>
                           <div className="page-input_details">
                              <label for="fname" className="form-lable"><span className="mandatory-field">* </span>{this.props.t("translate:FILE_TITLE")}</label>
                              <InputBox className="input-block" placeholder="Enter Title"
                                 value={this.state.fileNm}
                                 onChange={(event) => this.setState({ ...this.state, fileNm: event.target.value })}
                              />
                              {this.validator.message('title', this.state.fileNm, 'required|string',{ className: 'text-empty_content' })}
                           </div>
                        </div>
                     </div>
                     <div className="col-6 p-0">
                        <div className="publish-btn">
                               <div>
                                 {this.state.vSts === 'D'?
                                <p className="unpublished-view_label" >{this.props.t("translate:UNPUBLISHED_LABEL")}</p>
                                :
                                 <p className="published-view_label" >{this.props.t("translate:PUBLISHED_LABEL")}</p>
                                 }
                                </div>
                           <UIPerWrapper perCode={["rp_can_pub_lms_content"]}><div className="save-publish_btn">
                              <Button theme="btn-rounded btn-outline" clicked={() => this.addSubChapterFile("F")} >{this.props.t("translate:SAVE_&_PUBLISH")}</Button>
                           </div></UIPerWrapper>
                           <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div className="save-page_btn">
                              <Button theme="btn-rounded default" clicked={() => this.addSubChapterFile("D")}>{this.props.t("translate:SAVE")}</Button>
                           </div></UIPerWrapper>
                           {/* <i class="views-option_file">
                              <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                           </i> */}
                        </div>
                     </div>
                  </div>
               </div>
               <div className="file-upload_content">
                  <div class="justify-content-end row">
                     <div class="d-flex justify-content-between mb-4 col-12">
                        <p class="uploaded-files">{this.props.t("translate:UPLOAD_FILE")}</p>
                     </div>
                        {this.state.isConfirm &&  (
                           <LmsModal 
                              open={this.state.isConfirm} 
                              onClose={() => this.setState({ isConfirm: false })} 
                              modalTitle={`${this.props.t("translate:OVER_WRITE_CHANGES")}?`} 
                              btnName='overwrite' 
                              overwriteBtn={true} 
                              onClick={() => this.enableUploadFile()} 
                           />
                        )}
                     <div className='col-8'>
                        <div class="file-upload_box">
                           <p className="uploaded-files pb-3">{this.props.t("translate:SINGLE_ATTACHMENT")}</p> 
                           <div class="file-upload">
                              <div class="row m-0">                              
                                 <div class="col-8 p-0">
                                 <LmsFileUploader onChange={()=> this.fileUploadChange()} onDropChange={()=> this.fileDropUploadChange()} multiple={false}>
                                    <p class="drag-files">{this.props.t("translate:Drag_File")}</p>
                                 </LmsFileUploader>
                                 </div>
                                 <div class="col-4 p-0">
                                    <div class="file-selection">
                                       <span class="option-file">OR</span>
                                       {this.props.attachments.length ? (
                                            <Button 
                                            theme="btn-rounded btn-outline" clicked={()=> this.handleDiscardClick()}
                                            >
                                            {this.props.t("translate:CHOOSE_FILE")}
                                            </Button>
                                            ) : (
                                            <LmsFileUploader multiple={false} urlValue={this.state.link} urlChange={(event) => this.urlChanging(event)} urlValid={this.state.urlvalid} 
                                            onBrowseFile={() => {this.props.getUploadedScormFiles({ ...this.props, fileType: 'OTH' }); this.fileUploadChange()}}
                                            linkAttach={() => this.linkAttach()} onFileChange={() => this.fileUploadChange()} btnEnable={true} onGogleFileChng={() => this.googleFileUploadChange()}
                                            />
                                        )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                           {this.state.showExistingFile && (this.props.attachments && this.props.attachments[0] && this.props.attachments[0].name && this.props.attachments[0].name.length ?
                              <div class="uploaded-filename">
                                 <div class="uploaded-files_name ">
                                    {(this.props.attachments[0] && this.props.attachments[0].name) && (this.props.attachments[0].name.split('.')[1] === 'png' || this.props.attachments[0].name.split('.')[1] === 'jpeg ' || this.props.attachments[0].name.split('.')[1] === 'jpg' || this.props.attachments[0].name.split('.')[1] === 'gif') ?
                                       <Image className="svg-icon_small icon-dark" />
                                       : <PdfFile iconStyle="svg-icon_small icon-dark" />}

                                    <div class="file-select_name">
                                       <a href={this.props.attachments[0].url} target="_blank">
                                          <span class="file-option">{this.props.attachments[0].name}</span>
                                       </a>
                                       {this.props.attachments[0].fileTy && this.props.attachments[0].fileTy==="LOCL" &&
                                          <p class="file-select_path">{this.props.t("translate:COMPUTER")}</p>
                                       }
                                       {this.props.attachments[0].fileTy && this.props.attachments[0].fileTy==="GD" &&
                                          <p class="file-select_path">{this.props.t("translate:GOOGLE_DRIVE")}</p>
                                       }
                                    </div>

                                 </div>
                                 {  this.props.attachments[0].percentageLoaded && this.props.attachments[0].percentageLoaded !== 100 ? 
                                    <FileLoader value={this.props.attachments[0].percentageLoaded}></FileLoader>
                                 :
                                 <div className="more-options" >
                                 {/* <p className="reload-content">Failed to upload <Reloader iconStyle="svg-icon_small icon-space_right"/></p> */}
                                   {/* <FileLoader /> */}
                                    <div class="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                       <MoreInfo iconStyle="svg-icon_small icon-pointer icon-default" />
                                    </div>
                                    <div class="dropdown-menu img-edit_option">
                                       <div class="dropdown-item user-info_contents" onClick={()=> this.removeFile()}>
                                          <Trash iconStyle="svg-icon_light icon-default right-icon" />
                                          <span className="option-list_dropdown">{this.props.t("translate:REMOVE")}</span>
                                       </div>
                                    </div>
                                 </div>   }
                              </div> : this.state.filedata && this.state.filedata.name && this.state.filedata.name.length ?
                                 <div class="uploaded-filename">
                                    <div class="uploaded-files_name ">
                                       {(this.state.filedata.name.split('.')[1] === 'png' || this.state.filedata.name.split('.')[1] === 'jpg' || this.state.filedata.name.split('.')[1] === 'gif' || this.state.filedata.name.split('.')[1] === 'jpeg') ?
                                          <Image className="svg-icon_small icon-dark" />
                                          : <PdfFile iconStyle="svg-icon_small icon-dark" />}
                                       <div class="file-select_name">
                                          <a href={this.state.filedata.url} target="_blank">
                                             <span class="file-option">{this.state.filedata.name}</span>
                                          </a>
                                          {this.state.filedata.fileTy && this.state.filedata.fileTy==="LOCL" &&
                                             <p class="file-select_path">{this.props.t("translate:COMPUTER")}</p>
                                          }
                                          {this.state.filedata.fileTy && this.state.filedata.fileTy==="GD" &&
                                             <p class="file-select_path">{this.props.t("translate:GOOGLE_DRIVE")}</p>
                                          }
                                       </div>

                                    </div>
                                    <div className="more-options" >
                                       <div class="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                          <MoreInfo iconStyle="svg-icon_small icon-pointer" />
                                       </div>
                                       <div class="dropdown-menu img-edit_option">
                                          <div class="dropdown-item user-info_contents" onClick={() => this.removeFile()}>
                                             <Trash iconStyle="svg-icon_light icon-default right-icon" />
                                             <span className="option-list_dropdown">{this.props.t("translate:REMOVE")}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </div> : null
                           )}
                           <div>
                              <ComputerUploadPreview fileData={this.props.attachments[0]} isPerview={true} pervWidth={"100%"} pervHeight={"500px"} Downloadfile={()=>this.handleDownload()} removeFile={() => this.removeFile()}/>
                           </div>
                           {!('isDwldPm' in this.state.filedata) && (
                              <div className="check-box-wrapper">
                                 <CheckBox 
                                    className="check-box" 
                                    checked={this.state.isView} 
                                    onChange={(event) => this.lockUntilHandler(event)} 
                                 />
                                 <span className="check-box-text">
                                    {this.props.t("translate:DOWNLOAD_RESTRICTION")}
                                 </span>
                              </div>
                           )}
                           {this.state.fileTy && this.state.fileTy==="LNK" && this.state.link &&
                              <div class="uploaded-filename">
                                 <div class="uploaded-files_name ">
                                    <div className="file-download_icon">
                                       <Link2 className="svg-icon_small icon-default" />
                                    </div>
                                    <div class="file-select_name">
                                       <a href={this.state.link} target="_blank" rel="noreferrer">
                                          <span class="file-option">{this.state.link}</span>
                                       </a>
                                       <p class="file-select_path">{this.props.t("translate:LINK")}</p>
                                    </div>
                                 </div>
                                 <div className="more-options" >
                                    <div class="files-option" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                       <MoreInfo iconStyle="svg-icon_small icon-pointer" />
                                    </div>
                                    <div class="dropdown-menu img-edit_option">
                                       <div class="dropdown-item user-info_contents" onClick={() => this.removeFileLink()}>
                                          <Trash iconStyle="svg-icon_light icon-default right-icon" />
                                          <span className="option-list_dropdown">Remove</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           }
                        </div>
                        {/*  */}
                        
                        <div>
                           {this.state.errMsgFile && <p className="text-error_content">{this.props.t("translate:UPLOAD_FILE_OR_URL")}</p>}
                        </div>
                        {/*  */}
                     </div>
                  </div>
               </div>
            </div>
            <ModelBarComponent setSelectedScorm={(file) => {
               this.setState({ filedata: { ...file, name: file.fileNm, url: file.url, fileTy: file.type } });
               this.props.updateFields('attachments', [{ ...file, name: file.fileNm, url: file.url, fileTy: file.type }])
            }} />
         </div>
      );
   }
}
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.fileUploadReducer
})
const mapDispatchToProps = {
   initializeFileUpload,
   removeImg,
   updateFields,
   getUploadedScormFiles
}
const TabNavigator = (props) => <FileUploadComponent {...props} />
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));





