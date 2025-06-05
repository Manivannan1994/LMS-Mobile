import React, { Component, lazy } from 'react';
import '../../styles/_confirmationalertStyle.scss';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import{Trash2} from 'react-feather';
import { withTranslation } from 'react-i18next';

const Button = lazy(()=>
import('../button/Button')
);
const ConfirmationAlert = (props) => {
    return(
    <div>
          <Modal open={props.open} onClose={props.onClose} >
      <div className="model-content_box">
         <div className="model-content_header">
            <h5 className="model-header_content">{props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_PAGE")}</h5>
         </div>
         <div className="model-content_content">
            <p className="confirmation-text">{props.t("translate:CONFIRMATION_ALERTCOMPONENT_ARE_YOU_SURE_YOU_WANT_TO_DELETE")}</p>
         </div>
         <div className="model-content_footer">
            <Button theme="btn-rounded secondary-btn btn-outline">{props.t("translate:CONFIRMATION_ALERTCOMPONENT_CANCEL")}</Button>
            <Button theme="btn-rounded delete-btn btn-left">
            <Trash2 className="svg-icon_small icon-white icon-space" />{props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE")}
            </Button>
         </div>
      </div>
   </Modal>
    </div>
    )
};
// export default ConfirmationAlert; /
export default withTranslation()(ConfirmationAlert);
