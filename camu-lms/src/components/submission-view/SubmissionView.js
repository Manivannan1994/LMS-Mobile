import React, { lazy } from 'react';
import '../../styles/_submissionViewStyle.scss';
import {Download, Edit2, File,Link,} from 'react-feather';
// import LmsEditor from '../lms-editor/LmsEditor';
// import bookImg from '../../assets/images/bookImg.png';
import { useLocation, useHistory } from 'react-router-dom';
import _ from 'lodash';
import queryString from 'query-string';
import UserSession from '../../utils/UserSession';
import { downloadS3Files } from '../../store/actions/FileUploadAction';

const LmsEditorView = lazy(()=>
import('../lms-editor-view/LmsEditorView')
);
const Button = lazy(()=>
import('../button/Button')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
const SubmissionViewComponent = (props) => {
    let values;
    const location = useLocation();
    const history = useHistory();
    const currentStudId = UserSession.getSession()?.stuId
    const isArchCrsEnable = UserSession.getArchCrsDtls();
    if (location.search && !_.isEmpty(location.search)) {
        values = queryString.parse(location.search);
    }

    return (
        <div>
            <div className="submission-view_container">
                <div className="submission-container_box">
                    <div className="submission-edit">
                        <p className="submission-view_header">Your Submission</p>
                        {/* check this is comes from past assignments then hide edit action */}
                        {props.pastAsgmnt && props.pastAsgmnt === "false" && (!props.grdSts || props.grdSts !== "GRD") && (props.hideEdit === false) &&
                            <StudentArchiveContentWrapper isContentView={((_.isEmpty(isArchCrsEnable)) || (isArchCrsEnable.oAvCrsDls && isArchCrsEnable.oAvCrsDls.isCntVw)) ? false : true}>
                                {currentStudId === props?.asgmntStudId &&
                                <Button theme="btn-rounded secondary-btn" clicked={() => history.push({ pathname: '/home-page/assignment-submission', search: `?cntId=${values && values.cntId}&fromView=${true}`, state: location.state })} >
                                    <Edit2 className="svg-icon_small icon-dark icon-space_left" />
                                    Edit
                                </Button>
                                }
                            </StudentArchiveContentWrapper>
                        }
                    </div>

                

                    {props.studAsgmntData && props.studAsgmntData.text && props.studAsgmntData.text.html && props.studAsgmntData.text.html.length &&
                        <div className="submission-content">
                            <p className="submission-content_label">
                                <div><LmsEditorView contentData={props.studAsgmntData.text.html} /></div>
                            </p>
                        </div>
                    }
                    { props.studAsgmntData  && props.studAsgmntData.file && props.studAsgmntData.file.url &&  props.studAsgmntData.file.name &&  props.studAsgmntData.file.name.split('.')[1]==='png' &&
                        <div className="submission-image">
                            <img src={props.studAsgmntData.file.url} className="subject-img" alt="file-img"/>
                            <div className="submission-img_download">
                            <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: props.studAsgmntData.file.name , url: props.studAsgmntData.file.url})}}>
                                <Download className="svg-icon_small icon-primary" />
                            </span>
                            </div>
                        </div>         
                    }
                    {props.studAsgmntData && props.studAsgmntData.file && props.studAsgmntData.file.url && props.studAsgmntData.file.url.length && props.studAsgmntData.file.name && props.studAsgmntData.file.name.length &&
                        // <div className="submission-files_container">
                        //     <div className="submission-files">
                        //         <div className="submission-files_name">
                        //             <p>
                        //                 <File className="svg-icon_small icon-default" />
                        //                 <span><a href={props.studAsgmntData.file.url}>{props.studAsgmntData.file.name}</a></span>
                        //             </p>
                        //         </div>
                        //         <div className="submission-files_download">
                        //             <a href={props.studAsgmntData.file.url}>
                        //                 <Download className="svg-icon_small icon-primary" />
                        //             </a>
                        //         </div>
                        //     </div>
                        // </div>


                                <div className="submission-files_container">
                                <div className="submission-files">
                                    <div className="submission-files_name">
                                        <div className="row m-0">
                                            <div className="col-auto p-0">
                                                <div className="file-upload_icons">
                                                <File className="svg-icon_small icon-default" />
                                                </div>
                                            </div>
                                            <div className="col-11 p-0">
                                            {/* <p className="submission-cont_name"> 
                                                <span>
                                                    <a href={props.studAsgmntData.file.url}>{props.studAsgmntData.file.name}</a>
                                                </span> 
                                            </p> */}
                                            <p className="assignment-cont_name">
                                                <span onClick={() => {downloadS3Files({name: props.studAsgmntData.file.name , url: props.studAsgmntData.file.url})}}>
                                                {props.studAsgmntData.file.name}
                                                </span>
                                            </p>
                                                </div>
                                                <div className="col p-0">
                                                <div className="submission-files_download">
                                                <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: props.studAsgmntData.file.name , url: props.studAsgmntData.file.url})}}>
                                                    <Download className="svg-icon_small icon-primary" />
                                                    </span>
                                                </div>
                                                </div>
                                        </div>     
                                    </div>                      
                                </div>
                                </div>






                    }
                    {props.studAsgmntData && props.studAsgmntData.url && props.studAsgmntData.url.length &&
                        // <div className="submission-url">
                        //     <div className="submission-url_name">
                        //     <a target='_blank' href={props.studAsgmntData.url}>
                        //         <p>
                        //             <Link className="svg-icon_small icon-default" />
                        //             <span>{props.studAsgmntData.url}</span>
                        //         </p>
                        //     </a>
                        //     </div>
                        // </div>

                            <div className="submission-url">
                            <div className="submission-url_name">
                                <div className="row m-0">
                                    <div className="col-auto p-0">
                                        <div className="link-download_icon">
                                        <Link className="svg-icon_small icon-default" />
                                        </div>
                                
                                    </div>
                                    <div className="col-11 p-0">
                                    <a target='_blank' href={props.studAsgmntData.url}>
                                        <p className="link-url_label"> 
                                            <span>{props.studAsgmntData.url}</span>
                                        </p>
                                    </a>
                                        </div>
                                </div>
                            </div>
                            </div>



                    }
                </div>
            </div>
        </div>
    )

}

export default SubmissionViewComponent;