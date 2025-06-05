import React, { lazy } from "react";
import { File, Download, Link2, Image, ExternalLink } from "react-feather";
import { PdfFile } from "../icons/Icons";
import "../../styles/_filesviewStyle.scss";
import { downloadS3Files } from '../../store/actions/FileUploadAction';
const GoogleDocsPreivew = lazy(() =>
  import("../google-docs-preivew/GoogleDocsPreivew")
);
const Preview = (props) => {
  const downloadFile = async () => {
    const fileData = props.fileData;
    if (fileData && fileData.url) {
      try {
        downloadS3Files(fileData);
      } catch (error) {
        console.error("Error downloading file:", error);
        // Retry the download after 2 seconds if the error is a network issue
        setTimeout(() => {
          downloadFile();
        }, 2000);
      }
    } else {
      console.error("File URL is missing!");
    }
  };

  return (
    <div>
      {!props.isMultiple && (
        <div>
          {props.fileData &&
          props.fileData.name &&
          (props.fileData.name.split(".")[1] === "png" ||
            props.fileData.name.split(".")[1] === "jpg" ||
            props.fileData.name.split(".")[1] === "jpeg" ||
            props.fileData.name.split(".")[1] === "gif") ? (
            <div>
              <div className="img-file_upload">
                <p className="file-uploader_name">{props.fileData.name}</p>
                <div className="img-upload_option">
                  {props.isView === false && (props.fileData.isDwldPm ?? true) && (
                    <i className="img-download_icon">
                      {props.fileData &&
                        !props.fileData.embedUrl &&
                        props.fileData.url && (
                          <span
                            onClick={() =>
                              downloadFile(
                                props.fileData.url,
                                props.fileData.name
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <Download className="svg-icon_small icon-dark" />
                          </span>
                        )}

                      {props.fileData &&
                        props.fileData.embedUrl &&
                        props.fileData.url && (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={props.fileData.url}
                          >
                            <ExternalLink className="svg-icon_small icon-dark icon-pointer" />
                          </a>
                        )}
                    </i>
                  )}
                </div>
              </div>
              {props.fileData &&
                !props.fileData.embedUrl &&
                props.fileData.url && (
                  <img
                    src={props.fileData.url}
                    className="file-uploading_img"
                    alt="file-img"
                  />
                )}
            </div>
          ) : props.fileData && !props.fileData.link ? (
            <div className="d-flex flex-column">
              <div className="file-uploader_cont mb-5">
                <div className="file-download">
                  <File className="svg-icon_small icon-dark" />
                  {props.fileData && props.fileData.name && (
                    <p className="file-uploader_name">{props.fileData.name}</p>
                  )}
                </div>
                <div className="img-upload_option">
                  {props.isView === false && (props.fileData.isDwldPm ?? true) && (
                    <i className="img-download_icon">
                      {props.fileData &&
                        !props.fileData.embedUrl &&
                        props.fileData.url && (
                          <span
                            onClick={() =>
                              downloadFile(
                                props.fileData.url,
                                props.fileData.name
                              )
                            }
                            style={{ cursor: "pointer" }}
                          >
                            <Download className="svg-icon_small icon-dark" />
                          </span>
                        )}

                      {props.fileData &&
                        props.fileData.embedUrl &&
                        props.fileData.url && (
                          <i>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href={props.fileData.url}
                            >
                              <ExternalLink className="svg-icon_small icon-dark icon-pointer" />
                            </a>
                          </i>
                        )}
                    </i>
                  )}
                </div>
              </div>
              <div className="d-flex w-100 justify-content-center">
                {props.fileData &&
                  props.fileData.url &&
                  /\.(pdf|jpg|jpeg|png|gif|bmp|svg)$/i.test(
                    props.fileData.name
                  ) && (
                    <iframe
                      src={`${props.fileData.url}#toolbar=0`}
                      width="100%"
                      height="800px"
                      style={{ border: "none" }}
                      title={`Preview of ${props.fileData.name}`}
                    ></iframe>
                  )}
              </div>
            </div>
          ) : null}
          {props.fileData && props.fileData.link && (
            <div className="file-url_name">
              <div className="row m-0">
                <div className="col-auto p-0">
                  <div className="file-download_icon">
                    <Link2 className="svg-icon_small icon-default" />
                  </div>
                </div>
                <div className="col-11 p-0">
                  <a
                    target="_blank"
                    href={props.fileData.link}
                    rel="noreferrer"
                  >
                    <p className="file-url_label">
                      {" "}
                      <span>{props.fileData.link}</span>{" "}
                    </p>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {props.isMultiple && (
        <div>
          {props.fileData &&
            props.fileData[0] &&
            !props.fileData[0].link &&
            props.fileData.length > 0 &&
            props.fileData.map((oAtcmt, index) => {
              return (
                <div className="assign-pdf">
                  {oAtcmt.atcNme &&
                  oAtcmt.atcNme.length &&
                  (oAtcmt.atcNme.split(".")[1] === "png" ||
                    oAtcmt.atcNme.split(".")[1] === "jpg" ||
                    oAtcmt.atcNme.split(".")[1] === "gif") ? (
                    <Image className="svg-icon_small icon-dark" />
                  ) : (
                    <PdfFile iconStyle="svg-icon_small" />
                  )}
                  {!props.fileData[0].embedUrl && (
                    <p className="pdf__filename">
                      <a href={oAtcmt.atcUrl}>{oAtcmt.atcNme}</a>
                    </p>
                  )}
                  {props.fileData[0].embedUrl && (
                    <p className="pdf__filename">
                      <a target="_blank" href={oAtcmt.atcUrl}>
                        {oAtcmt.atcNme}
                      </a>
                    </p>
                  )}
                </div>
              );
            })}
          {props.fileData && props.fileData[0] && props.fileData[0].link && (
            <div className="file-url_name">
              <div className="row m-0">
                <div className="col-auto p-0">
                  <div className="file-download_icon">
                    <Link2 className="svg-icon_small icon-default" />
                  </div>
                </div>
                <div className="col-11 p-0">
                  <a
                    target="_blank"
                    href={props.fileData[0].link}
                    rel="noreferrer"
                  >
                    <p className="file-url_label">
                      {" "}
                      <span>{props.fileData[0].link}</span>{" "}
                    </p>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {props.fileData && props.fileData.embedUrl && props.isPerview && (
        <div>
          <GoogleDocsPreivew
            embedUrl={props.fileData.embedUrl}
            width={props.pervWidth}
            height={props.pervHeight}
          ></GoogleDocsPreivew>
        </div>
      )}
    </div>
  );
};

export default Preview;
