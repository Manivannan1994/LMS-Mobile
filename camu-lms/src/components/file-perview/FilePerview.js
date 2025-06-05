import React, { lazy } from 'react';
import { File, Download, Link2, Slash, MoreVertical, Trash2, Image,ExternalLink } from 'react-feather';
import { PdfFile, UserRemove, Useradd, Trash } from '../icons/Icons';
import '../../styles/_filesviewStyle.scss';
import { downloadS3Files } from '../../store/actions/FileUploadAction';

const GoogleDocsPreivew = lazy(() =>
    import('../google-docs-preivew/GoogleDocsPreivew')
);
const FilePerview = (props) => {
    return (
        <div>
            {!props.isMultiple &&
                <div>
                    {(props.fileData && props.fileData.name) && (props.fileData.name.split('.')[1] === 'png' || props.fileData.name.split('.')[1] === 'jpg' || props.fileData.name.split('.')[1] === 'jpeg' || props.fileData.name.split('.')[1] === 'gif') ?
                        <div>
                            <div className="img-file_upload">
                                <p className="file-uploader_name">{props.fileData.name}</p>
                                <div className="img-upload_option">
                                {props.isView === true && (
    <i className="img-download_icon">
        {props.fileData && !props.fileData.embedUrl && props.fileData.url && (
            <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: props.fileData.name , url: props.fileData.url})}}>
                <Download className="svg-icon_small icon-dark" />
            </span>
        )}

        {props.fileData && props.fileData.embedUrl && props.fileData.url && (
            <a target="_blank" rel="noopener noreferrer" href={props.fileData.url}>
                <ExternalLink className="svg-icon_small icon-dark icon-pointer" />
            </a>
        )}
    </i>
)}


                                </div>
                            </div>
                            {props.fileData && !props.fileData.embedUrl && props.fileData.url &&
                                <img src={props.fileData.url} className="file-uploading_img" alt="file-img" />
                            }
                        </div>
                        : props.fileData && !props.fileData.link ?
                            <div className="file-uploader_cont">
                                <div className="file-download">
                                    <File className="svg-icon_small icon-dark" />
                                    {props.fileData && props.fileData.name && <p className="file-uploader_name">{props.fileData.name}</p>}
                                </div>
                                <div className="img-upload_option">
                                {props.isView && (
    <i className="img-download_icon">
        {props.fileData && !props.fileData.embedUrl && props.fileData.url && (
            <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({name: props.fileData.name , url: props.fileData.url})}}>
                <Download className="svg-icon_small icon-dark" />
            </span>
        )}

        {props.fileData && props.fileData.embedUrl && props.fileData.url && (
            <i>
                <a target="_blank" rel="noopener noreferrer" href={props.fileData.url}>
                    <ExternalLink className="svg-icon_small icon-dark icon-pointer" />
                </a>
            </i>
        )}
    </i>
)}

                                </div>
                            </div> : null
                    }
                    {props.fileData && props.fileData.link &&
                        <div className="file-url_name">
                            <div className="row m-0">
                                <div className="col-auto p-0">
                                    <div className="file-download_icon">
                                        <Link2 className="svg-icon_small icon-default" />
                                    </div>

                                </div>
                                <div className="col-11 p-0">
                                    <a target='_blank' href={props.fileData.link} rel="noreferrer">
                                        <p className="file-url_label"> <span>{props.fileData.link}</span> </p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
            {props.isMultiple &&
                <div>
                    {props.fileData && props.fileData[0] && !(props.fileData[0].link) && props.fileData.length > 0 && props.fileData.map((oAtcmt, index) => {
                        return (
                            <div className="assign-pdf">
                                {(oAtcmt.atcNme && oAtcmt.atcNme.length) && (oAtcmt.atcNme.split('.')[1] === 'png' || oAtcmt.atcNme.split('.')[1] === 'jpg' || oAtcmt.atcNme.split('.')[1] === 'gif') ?
                                    <Image className="svg-icon_small icon-dark" />
                                    :
                                    <PdfFile iconStyle="svg-icon_small" />
                                }
                                {!props.fileData[0].embedUrl &&
                                    <p className="pdf__filename"><span style={{ cursor: "pointer" }} onClick={() => {
                                        if (oAtcmt.atcNme.includes('.pdf') && !(oAtcmt.isDwldPm ?? true)) {
                                            return;
                                        }
                                        downloadS3Files({name: oAtcmt.atcNme , url: oAtcmt.atcUrl});
                                    }}>{oAtcmt.atcNme}</span></p>
                                }
                                {props.fileData[0].embedUrl &&
                                    <p className="pdf__filename"><a target='_blank' href={oAtcmt.atcNme.includes('.pdf') ? ((oAtcmt.isDwldPm ?? true) ? oAtcmt.atcUrl : `${oAtcmt.atcUrl}#toolbar=0`) : oAtcmt.atcUrl}>{oAtcmt.atcNme}</a></p>
                                }
                            </div>
                        )
                    })}
                    {props.fileData && props.fileData[0] && props.fileData[0].link &&
                        // <div>
                        //     <div >
                        //         <a target='_blank' href={props.fileData[0].link} rel="noreferrer">
                        //             <p className="file-url_label"> <span>{props.fileData[0].link}</span> </p>
                        //         </a>
                        //     </div>
                        // </div>

                        <div className="file-url_name">
                            <div className="row m-0">
                                <div className="col-auto p-0">
                                    <div className="file-download_icon">
                                        <Link2 className="svg-icon_small icon-default" />
                                    </div>
                                </div>
                                <div className="col-11 p-0">
                                    <a target='_blank' href={props.fileData[0].link} rel="noreferrer">
                                    <p className="file-url_label"> <span>{props.fileData[0].link}</span> </p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            }
            {props.fileData && props.fileData.embedUrl && props.isPerview &&
                <div>
                    <GoogleDocsPreivew embedUrl={props.fileData.embedUrl}
                        width={props.pervWidth}
                        height={props.pervHeight}
                    ></GoogleDocsPreivew>
                </div>
            }
        </div>
    );
}

export default FilePerview;