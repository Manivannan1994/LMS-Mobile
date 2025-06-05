import { useState } from "react";
import { withTranslation } from "react-i18next";
import "../../styles/_passwordResetStyle.scss";
import SvgLogo from "../../assets/images/camusvglogo.svg";
import WaveImg from "../../assets/images/waveimg.svg";
import Button from "../../components/button/Button";
import InputBox from "../../components/input-box/InputBox";
import { connect } from "react-redux";
import { doLMSPassWordReset } from "../../store/actions/LoginAction";
import ReactDatePicker from "../../components/date-picker/DatePicker";
import { GoogleIcon, MicrosoftIcon } from "../../components/icons/Icons";

const PasswordResetComponent = (props) => {
    const [userName,setUserName] = useState('');
    const [validUser,setValidUser] = useState(false);
  return (
    <div>
      <div className="password-container">
        <div class="product-logo">
          <img src={SvgLogo} alt="camu-logo" class="product-logo_img" />
        </div>
        <div className="password-view_box">
          <p className="reset-password_label">{props.t("translate:RESET_PASSWORD")}</p>
          <p className="reset-cont_label">{props.t("translate:RESET_DESC")}</p>
          <div className="password-input_box">
            <div className="input-box_cont">
              <p className="input-label_cont">{props.t("translate:USER_NAME")}</p>
              <InputBox className="input-block " onChange={(eve)=>setUserName(eve.target.value)}></InputBox>
              {validUser && <span class="text-empty_content">Enter valid username</span>}
            </div>
            <Button theme="btn-rounded default btn-block" clicked={() => {
                if(userName && userName.length>0){
                    props.doLMSPassWordReset(userName)
                }else{
                    setValidUser(true)
                }
            }}>
            {props.t("translate:SENT_RESET_INSTRUCTION")}
            </Button>
            <p className="all-login_cont">
              <span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.6663 8H3.33301"
                    stroke="#0D9BE1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M7.99967 12.6668L3.33301 8.00016L7.99967 3.3335"
                    stroke="#0D9BE1"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {props.t("translate:LOGIN_OPTIONS")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
    ...state.LoginReducer,
});
  
const mapDispatchToProps = {
    doLMSPassWordReset
};

const TabNavigator = (props) => <PasswordResetComponent {...props} />;

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(Components);


