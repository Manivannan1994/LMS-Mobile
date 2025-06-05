import React, { useState } from 'react';
import { Download, XCircle, Eye,X } from 'react-feather';
import '../../styles/_filesviewStyle.scss';
import PdfImage from '../../assets/images/pdfplaceholder.jpg'

const ComputerUploadPreview = ({ fileData, Downloadfile, removeFile }) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (!fileData || !fileData.name) return null;

    const fileExtension = fileData.name.split('.').pop().toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif'].includes(fileExtension);
    const isPDF = fileExtension === 'pdf';
    const isSupportedFile = isImage || isPDF;

    if (!isSupportedFile) return null;

    return (
        <div>
            {/* Image Preview */}
            {isImage && (
                <div className='position-relative fileUpload_img-container'>
                    {/* Download Icon */}
                    <div className="img-upload_options">
                        {(fileData.isDwldPm ?? true) && fileData.url && (
                            <span class="border-3">
                            <Download className="svg-icon_small icon-dark" onClick={Downloadfile} />
                            </span>
                        )}
                    </div>

                    {/* Cancel Icon */}
                    <div className='img-cancel_option'>
                        <XCircle className="svg-icon_small icon-pointer icon-default" onClick={removeFile} />
                    </div>

                    {/* Image Preview */}
                    {fileData.url && (
                        <img src={fileData.url} className="file-uploading" alt="file-img" />
                    )}
                </div>
            )}

            {/* PDF Preview */}
            {isPDF && (
               <div className="fileUpload_pdf-container">
               {/* Image */}
               <img src={PdfImage} alt="pdf icon" className="pdf-thumbnail" />
           
               {/* Cancel Icon (Top Right) */}
               <div className="pdf-cancel_option">
                   <XCircle className="svg-icon_small icon-pointer icon-default" onClick={removeFile} />
               </div>
               {/* Icons Container (Absolute Center) */}
               <div className="pdf-icons-container">
                   {/* Download Icon */}
                   {(fileData.isDwldPm ?? true) && fileData.url && (
                    <span class="border-3">
                       <Download className="icon-dark pdf-icon" onClick={Downloadfile} />
                       </span>
                   )}
                   {/* View Icon */}
                   <span class="border-3">
                   <Eye className="icon-pointer icon-dark pdf-icon" onClick={() => setIsDrawerOpen(true)} />
                   </span>
               </div>
           
           </div>
           
            )}

            {/* Custom Drawer */}
            <div className={`pdf-drawer ${isDrawerOpen ? 'open' : ''}`}>
                <div className="pdf-drawer-header">
                    <X className="close-icon" onClick={() => setIsDrawerOpen(false)} />
                    <span className="drawer-title">Preview</span>
                </div>
                <iframe src={(fileData.isDwldPm ?? true) ? fileData.url : `${fileData.url}#toolbar=0`} className="pdf-viewer" title="PDF Preview"></iframe>
            </div>

            {/* Overlay (to close drawer when clicked outside) */}
            {isDrawerOpen && <div className="overlay" onClick={() => setIsDrawerOpen(false)}></div>}
        </div>
    );
};

export default ComputerUploadPreview;
