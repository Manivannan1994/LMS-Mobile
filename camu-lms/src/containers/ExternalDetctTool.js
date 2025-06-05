import React, { lazy, useState, useRef, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { withRouter, useHistory, useLocation } from 'react-router-dom';
import '../styles/_plagiarism.scss';
import "../styles/_commonLmsStyle.scss";
import InputBox from '../components/input-box/InputBox';
import TextArea from "../components/text-area/TextArea";
import LmsSelectDropDown from '../components/lms-selectdropdown/LmsSelectDropDown';
import HTTPService from "../utils/http-util";
import messageUtil from '../utils/message-util';
import SimpleReactValidator from 'simple-react-validator';

const Button = lazy(() => import("../../src/components/button/Button"));


const ExternalToolPage = (props) => {
  const history = useHistory();
  const location = useLocation();
  const oEditExternalTool = location.state;
  const [tool, setTool] = useState('');
  const [oExternalTool, setExternalTool] = useState({toolNm:'',toolURL:'',toolDes:'',tliVern:'LTI 1.0/1.1',tlCnKey:'',tlSeKey:'',pbKyst:'',cstmPar:'',intLgn:'',redrURL:''});
  const aToolVersion = [{key:"LTI 1.0/1.1",Name:"LTI 1.0/1.1"},{key:"LTI 1.3",Name:"LTI 1.3"}];
  const [, forceUpdate]  = useState();
   //For validation and mandatory fields check
   const validator = useRef(new SimpleReactValidator());
  // Go to Manual Config page
  const goToPlagiarismPage = () => {
    history.push({ pathname: "/plagiarismdetectioncomponent-file", state: location.state });
  }

   useEffect(()=> {
     if(oEditExternalTool){
      setExternalTool(oEditExternalTool);
     }
   },[oEditExternalTool])

  const externalToolRegisteration = () => {
    const oReq = {
      ...oExternalTool
    };

    // For validate all required fields
    const formValid = validator.current.allValid();
    if (formValid) {
      HTTPService.post('/lms/external-tool-reg', oReq, null, (err, response) => {
        if (response && response.output) {
          if (response.output.data) {
            messageUtil.showSuccess("TOOL_SAVED_SUCCESSFULLY", true);
            goToPlagiarismPage(); 
          }else {
            messageUtil.showError("NO_DOCS_FOUND", true); 
          }
        } else {
          messageUtil.showError("UNKNOWN_ERROR", true);
        }
      });
    }else {
      validator.current.showMessages();
      forceUpdate(1);
    }
  }


  return (
    <div className="page-container">
      <div className="cont-nav">
        <div className="page-header">
          <h6>{props.t("translate:EXTERNAL_TOOL_CONFIG")}</h6>
        </div>
      </div>
      <div className="plagiarism-cont">
        <div className="plagiarism-form_container">
          <div className="row">
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:TOOL_NAME")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.toolNm}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, toolNm: e?.target?.value }))}
                />
                {validator.current.message('title', tool , 'required|string',{ className: 'text-empty_content' })}
              </div>
            </div>
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:TOOL_URL")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.toolURL}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, toolURL: e?.target?.value }))}
                />
                {validator.current.message('title', oExternalTool.toolURL , 'required|string',{ className: 'text-empty_content' })}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:TOOL_DESC")}</label>
                <TextArea className="text-area_table" 
                  value={oExternalTool.toolDes}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, toolDes: e?.target?.value }))}
                />
              </div>
            </div>
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:LTI_VERSION")}</label>
                <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={oExternalTool.tliVern} defaultDisabled={false}
                  onChange={(e) => {setExternalTool((prev) => ({ ...prev, tliVern: e?.target?.value }))}}
                  dropDown={aToolVersion} keyTag="key" nameTag="Name"/>
                  {validator.current.message('title', oExternalTool.tliVern , 'required|string',{ className: 'text-empty_content' })}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:CONSUMER_KEY")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.tlCnKey}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, tlCnKey: e?.target?.value }))}
                />
              </div>
            </div>
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:SHARED_SECRET")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.tlSeKey}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, tlSeKey: e?.target?.value }))}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:PUBLIC_KEYSET")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.pbKyst}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, pbKyst: e?.target?.value }))}
                />
              </div>
            </div>
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:CUSTOM_PARAMETERS")}</label>
                <TextArea className="text-area_table" 
                  value={oExternalTool.cstmPar}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, cstmPar: e?.target?.value }))}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:INITIATE_LOGIN_URL")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.intLgn}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, intLgn: e?.target?.value }))}
                />
              </div>
            </div>
            <div className="col-6">
              <div className="input-details">
                <label for="fname" className="form-lable">{props.t("translate:REDIRECTION_URI(s)")}</label>
                <InputBox className="input-block"
                  value={oExternalTool.redrURL}
                  onChange={(e) => setExternalTool((prev) => ({ ...prev, redrURL: e?.target?.value }))}
                />
              </div>
            </div>
          </div>
          <div className="config-btns">
            <Button theme="btn-rounded default" clicked={() => externalToolRegisteration()}>
              <span>{props.t("translate:SAVE")}</span>
            </Button>
            <Button theme="btn-rounded secondary-btn btn-outline"
              clicked={() => goToPlagiarismPage()}>
              <span>{props.t("translate:CANCEL")}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default withTranslation()(withRouter(ExternalToolPage));
