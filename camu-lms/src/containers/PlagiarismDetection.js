import React, { lazy, useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { withRouter, useHistory, useLocation } from 'react-router-dom';
import { Plus, Edit, Info, Trash2 } from "react-feather";
import '../styles/_plagiarism.scss';
import "../styles/_commonLmsStyle.scss";
import InputBox from '../components/input-box/InputBox';
import HTTPService from "../utils/http-util";
import messageUtil from '../utils/message-util';
import Usersession from '../utils/UserSession';
import { filterArray } from '../utils/filter-util';
import { getSessionDtls } from '../store/actions/HeaderAction';
import { connect } from 'react-redux';

import { useTranslation } from "react-i18next";

const Button = lazy(() => import("../../src/components/button/Button"));
const Searchbox = lazy(() => import("../../src/components/searchbox/Searchbox"));
const LmsModal = lazy(() => import('../components/modal/LmsModal'));


const PlagiarismDetectionComponent = (props) => {

  const history = useHistory();
  const location = useLocation();
  const [toolMdl, setToolMdl] = useState(false);
  const [toolSearch, setToolSearch] = useState('')
  const [addLTI, setAddLTI] = useState(false);
  // const [status, setstatus] = useState("Pending");
  const [activate, setActivate] = useState(true);
  const [infoModal, setinfoModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [publickKey, setPublickKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [aExternalTool, setAllExternalTool] = useState([]);
  const [oDeleteTool, setDeleteToolDetails] = useState({});
  const [oInfoTool, setInfoToolDetails] = useState({});
  const currentSessionUser = Usersession.getSession();
  const [aFilterTool, setFilterTool] = useState([]);  //Filter tools
  const [filterToolURL, setFilterToolURL] = useState('');  //Filter tools
  const [IsCartigaeURLReg, setCartigaeURLReg] = useState(false);  //Filter tools

  // const [isShowToolList, setShowToolList] = useState(true);  //Filter tools
  const { t } = useTranslation()
  // Go to Manual Config page
  const goToManualConfig = (isEdit, toolDetails) => {
    if (isEdit) {
      history.push({ pathname: "/externaltoolpage-file", state: toolDetails });
    } else {
      history.push({ pathname: "/externaltoolpage-file", state: {} });
    }
  }
  // Setting Status
  // const handleActivate = () => {
  //   setstatus("Active");
  //   setActivate(false);
  // }
  // Showing config of tools
  const showInfoModal = () => {
    setinfoModal(true)
  };
  // Confirmation of delete config tools
  const showDeleteModal = () => {
    setDeleteModal(true);
  };

  const openIdConfig = () => {
    const oReq = (filterToolURL && IsCartigaeURLReg) ? { toolPublickKey: publickKey, toolPrivateKey: privateKey, toolURL: filterToolURL, InId: currentSessionUser?.InId, mappedid: currentSessionUser?.mappedid } :
      { InId: currentSessionUser?.InId, toolURL: filterToolURL, mappedid: currentSessionUser?.mappedid };
    HTTPService.post('/lms/openid-config-tool-reg', oReq, null, (err, response) => {
      if (response && response.output) {
        if (response.output.data) {
          messageUtil.showSuccessWithoutTrans(response.output.data, true);
          getExternalTools();
          setCartigaeURLReg(false);
          setAddLTI(true);
        } else {
          messageUtil.showError("UNKNOWN_ERROR", true);
        }
      } else {
        if (err?.data?.output?.errors?.message) {
          messageUtil.showErrorWithoutTrans(err?.data?.output?.errors?.message, true);
        } else if (err?.data?.output?.errors) {
          messageUtil.showErrorWithoutTrans(err?.data?.output?.errors, true);
        } else {
          messageUtil.showError("UNKNOWN_ERROR", true);
        }
      }
    });
  }

  const getExternalTools = () => {
    const oReq = {};
    HTTPService.post('/lms/get-external-tool', oReq, null, (err, response) => {
      if (response?.output?.data?.length) {
        setAllExternalTool(response?.output?.data);
      } else {
        setAllExternalTool([]);
        messageUtil.showInfo("NO_RECORDS_FOUND!", true);
      }
    });
  }

  const deleteTool = (toolDtls) => {
    const oReq = { id: toolDtls._id };
    HTTPService.post('/lms/delete-external-tool', oReq, null, (err, response) => {
      if (response?.output?.data?.code === "DELETED_SUCCESSFULLY") {
        getExternalTools();
        messageUtil.showSuccess("TOOL_DELETED_SUCCESSFULLY", true);
        setDeleteModal(false);
      } else {
        messageUtil.showError("UNKNOWN_ERROR", true);
      }
    });
  }


  useEffect(() => {
    if (currentSessionUser?.InId) {
      getExternalTools();
    }
  }, [currentSessionUser?.InId]);


  useEffect(() => {
    props.getSessionDtls(() => { });
  }, []);

  // search the scorm file
  useEffect(() => {
    if (aExternalTool) {
      if (toolSearch) {
        searchingHandling(toolSearch)
      } else {
        setFilterTool(aExternalTool)
      }
    }
  }, [aExternalTool]);

  // search function for scorm file
  const searchingHandling = (event) => {
    setToolSearch(event);
    if (event) {
      setFilterTool(filterArray(event, aExternalTool, ['toolNm']))
    } else {
      setFilterTool(aExternalTool)
    }
  }

  return (
    <div className="page-container">
      <div className="cont-nav">
        <div className="page-header">
          <h6>{props.t("translate:MANAGE_TOOLS")}</h6>
          <p>{props.t("translate:MANAGE_TOOLS_DESC")}</p>
        </div>
        {!addLTI ? (
          <Button theme="btn-rounded default "
            clicked={() => setToolMdl(true)}
          >
            <Plus className="svg-icon_small icon-white " />
            <span>{props.t("translate:NEW_TOOLS")}</span>
          </Button>) :
          <></>}
      </div>
      <div className="plagiarism-cont">
        <div className="plagiarism-form_container">
          <div className="d-flex justify-content-end p-3">
            {!addLTI ? (
              <div className="plagiarism-search">
                <Searchbox placeholder={props.t("translate:SEARCH")} searchBoxTheme="search-default search-box_default search-outline" value={toolSearch}
                  onChange={(e) => { if (e) { searchingHandling(e.target.value) } }} />
              </div>
            ) : <></>}
          </div>
          {(addLTI && filterToolURL && IsCartigaeURLReg) && (
            <div>
              <div className="row">
                <div className="col-6">
                  <div className="input-details">
                    <label for="fname" className="form-lable">{props.t("translate:PUBLIC_KEY")}</label>
                    <InputBox className="input-block"
                      value={publickKey}
                      onChange={(e) => setPublickKey(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="input-details">
                    <label for="fname" className="form-lable">{props.t("translate:PRIVATE_KEY")}</label>
                    <InputBox className="input-block"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="config-btns">
                <Button theme="btn-rounded default"
                  clicked={() => openIdConfig()}>
                  <span>{props.t("translate:SAVE")}</span>
                </Button>
                <Button theme="btn-rounded secondary-btn btn-outline"
                  clicked={() => setAddLTI(false)}>
                  <span>{props.t("translate:CANCEL")}</span>
                </Button>
              </div>
            </div>
          )}
          {(!addLTI && aFilterTool?.length > 0) ? (
            <>
              <div className="plagiarism-card_container">
                {aFilterTool.map((tool, index) => (
                  <div>
                    <div className="plagiarism-top-content">
                      <div>
                        <div className="option-stack">
                          <a onClick={() => {
                            showInfoModal();
                            setInfoToolDetails(tool);
                          }}>
                            <Info />
                          </a>
                          <a onClick={() => {
                            goToManualConfig(true, tool);
                          }}>
                            <Edit />
                          </a>
                          <a onClick={() => {
                            showDeleteModal();
                            setDeleteToolDetails(tool);
                          }}>
                            <Trash2 />
                          </a>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center align-items-center">
                        <p>{tool.toolNm}</p>
                      </div>
                    </div>
                    <div className="plagiarism-bottom-content">
                      <p className="tool-desc">{tool.toolDes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : <></>}
        </div>
        {toolMdl && (
          <LmsModal
            open={toolMdl}
            modalTitle={props.t("translate:ADD_TOOL")}
            toolMdl={true}
            setFilterToolURL={setFilterToolURL}
            filterToolURL={filterToolURL}
            onClose={() => { setToolMdl(false); setFilterToolURL(''); }}
            aCustomBtns={[
              {
                name: props.t("translate:Add LTI advantage"),
                className: "primary",
                onClick: () => {
                  setAddLTI(true);
                  setToolMdl(false);
                  setCartigaeURLReg(false);
                  if (filterToolURL && filterToolURL === "https://api.identific.com/lti/cartridge") {
                    setCartigaeURLReg(true);
                  } else {
                    openIdConfig();
                  }
                }
              },
              {
                name: "CONFIGURE_MANNUALLY",
                onClick: () => {
                  goToManualConfig(false, {})
                },
                className: "secondary-btn btn-outline",

              }
            ]}
          />
        )}
        {infoModal && (
          <LmsModal
            open={infoModal}
            modalTitle={t("translate:TOOL_CONFIGURATION_DETAILS")}
            infoModal={true}
            onClose={() => setinfoModal(false)}
          >
            <div className="plagiarism-form_container">
              {/* The Tool config details has to be loop through this  */}
              <p className="mb-2">
                <span className="info-label">{props.t("translate:CLIENT_ID")}</span>
                <span className="info-content">{oInfoTool?.clndid}</span>
              </p>
            </div>
          </LmsModal>
        )}
        {deleteModal && (
          <LmsModal
            open={deleteModal}
            modalTitle={t("translate:DELETE")}
            deleteModal={true}
            onClose={() => setDeleteModal(false)}
            aCustomBtns={[
              {
                name: "Delete",
                className: "primary",
                onClick: () => {
                  deleteTool(oDeleteTool);
                }
              },
              {
                name: "Cancel",
                onClick: () => {
                  setDeleteModal(false)
                },
                className: "secondary-btn btn-outline",

              }
            ]}>
            <p className="delete-config">
              {props.t("translate:ARE_SURE_WANT_TO_DELETE_THE_TOOL")}
            </p>
          </LmsModal>
        )}
      </div>
    </div>
  );
};

const mapDispatchToProps = {
  getSessionDtls
};

const TabNavigator = (props) => <PlagiarismDetectionComponent {...props} />;
const Components = connect(() => ({}), mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
