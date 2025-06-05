/** Util to show toast message
**/

import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import i18next from "i18next";
import '../styles/_toasterStyle.scss';
import '../styles/_iconStyle.scss';
import { Info,CheckCircle,AlertOctagon,AlertTriangle } from 'react-feather';



class MessageService {
    constructor() {
        this.autoCloseDuration = 5000;
    }

    /** To show success message
    @api {public}
    @param {String} messageID
    @param {boolean} shouldAutoClose
    **/
    showSuccess(messageID, shouldAutoClose) {
        toast(<p className="toaster-heading"><span className="toaster-icons_success"><CheckCircle iconStyle="svg-icon_small"/></span>{i18next.t(`translate:${messageID}`)}</p>, {
            className: 'success-background',
            position: "bottom-right",
            autoClose: shouldAutoClose?this.autoCloseDuration:false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    /** To show error message
    @api {public}
    @param {String} messageID
    @param {boolean} shouldAutoClose
    **/
    showError(messageID, shouldAutoClose) {
        toast(<p className="toaster-heading"><span className="toaster-icons_error"><AlertOctagon iconStyle="svg-icon_small"/></span>{i18next.t(`translate:${messageID}`)}</p>, {
            className: 'error-background',
            position: "bottom-right",
            autoClose: shouldAutoClose?this.autoCloseDuration:false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            
        });
    };

    /** To show info message
    @api {public}
    @param {String} messageID
    @param {boolean} shouldAutoClose
    **/
    showInfo(messageID, shouldAutoClose, messageDesc) {
        toast(
        <p className="toaster-heading">
            <span className="toaster-icons_info">
                <Info iconStyle="svg-icon_small"/>
            </span> 
            {i18next.t(`translate:${messageID}`)}
            {
                // Information with message description
                messageDesc && 
                <p className="toaster-content_info">
                    {i18next.t(`translate:${messageDesc}`)}
                </p>
            }
            
        </p>, {
            className: 'information-background',
            position: "bottom-right",
            autoClose: shouldAutoClose?this.autoCloseDuration:false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    /** To show warning message
    @api {public}
    @param {String} messageID
    @param {boolean} shouldAutoClose
    **/
    showWarning(messageID, shouldAutoClose, isNotTranslate) {
        toast(<p className="toaster-heading"><span className="toaster-icons_warning"><AlertTriangle iconStyle="svg-icon_small"/></span>{isNotTranslate ? messageID : i18next.t(`translate:${messageID}`)}</p>, {
            className: 'warning-background',
            position: "bottom-right",
            autoClose: shouldAutoClose?this.autoCloseDuration:false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    /** To show error message
    @api {public}
    @param {String} messageID
    @param {boolelan} shouldAutoClose
    **/
    showErrorWithoutTrans(messageText, shouldAutoClose) {
      toast(
        <p className="toaster-heading">
          <span className="toaster-icons_error">
            <AlertOctagon iconStyle="svg-icon_small" />
          </span>
          {messageText}
        </p>,
        {
          className: 'error-background',
          position: "bottom-right",
          autoClose: shouldAutoClose ? this.autoCloseDuration : false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }

    /** To show success message
    @api {public}
    @param {String} messageID
    @param {boolean} shouldAutoClose
    **/
    showSuccessWithoutTrans(messageID, shouldAutoClose) {
        toast(<p className="toaster-heading">
          <span className="toaster-icons_success">
            <AlertOctagon iconStyle="svg-icon_small" />
          </span>
          {messageID}
        </p>, {
            className: 'success-background',
            position: "bottom-right",
            autoClose: shouldAutoClose?this.autoCloseDuration:false,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };
}

export default new MessageService();

