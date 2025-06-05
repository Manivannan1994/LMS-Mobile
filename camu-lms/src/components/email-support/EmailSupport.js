import React from 'react';
import '../../styles/_emailSupportStyle.scss';
import { AlertTriangle } from 'react-feather';
import Button from '../button/Button';

const EmailSupport = (props) => {
    return (
        <div>
        <div className="mail-support_container">
           <div className="support-cont_box">
              <AlertTriangle className="svg-icon_small  icon-alert"/>
              <div className="support-content">
                 <p className="email-cont_label">Hello User, you need to activate your account (emailsupport@gmail.com) <span>Change email</span></p>
                 <p className="email-cont_label">Need help? <span>Contact support</span></p>
              </div>
           </div>
           <Button theme="btn-rounded secondary-btn btn-outline" >Resend email</Button>
        </div>
     </div>
    );
}

export default EmailSupport;   