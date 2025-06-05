import React, { lazy, useState,useEffect } from "react";
import "../styles/_schudlepageStyle.scss";
import "../styles/_scormFile.scss";
import "../styles/_assigmnetcontentStyle.scss";
import Table from "../components/table/Table";
import Button from "../components/button/Button";
import { Plus, File, MoreVertical, X } from "react-feather";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import CourseHeader from "../components/course-header/CourseHeader";
import HeaderComponent from "../components/header/Header";
import ModelBarComponent from "../components/modelbar/Modelbar";
import { useSelector,useDispatch } from 'react-redux'
import {getScormFile,saveScormFile ,editScormFile ,getScormLog } from '../store/actions/ScormFileAction';
import {lmsDateFormat, lmsTimeFormat} from '../utils/helper';
import moment from 'moment';
import messageUtil from '../utils/message-util';
import UserSession from '../utils/UserSession';
import { filterArray } from '../utils/filter-util';
import { updateFields } from "../store/actions/FileUploadAction";

const LmsModal = lazy(() => import("../components/modal/LmsModal"));
const Searchbox = lazy(() => import("../components/searchbox/Searchbox"));

const ScormPageComponent = (props) => {
  const [scormDelete, setScormDelete] = useState(false);   //Scorm delete Modal
  const [scormRename, setScormRename] = useState(false);   //Scorm rename modal
  const [scormActive, setScormActive] = useState(false);   //Scorm active modal confirmation
  const [scormFileUpload, setscormFileUpload] = useState('');  //Scorm file uploaded modal
  const [groupSearch, setGroupsearch] = useState('')   //Group searcj
  const dispatch = useDispatch();  //Disapatch
  const aScormFiles = useSelector(state => state?.ScormFileReducer?.scormFiles);  //Scorm files
  const [allScormFiles, setAllScormFiles] = useState([]);
  const [aFilterScorm, setFilteredScorm] = useState([]);  //Filter scorms
  const [errMsgFile,setErrorFile] = useState(false);  //Error Message filers
  const [scormNm ,setScormNm] = useState("") //Scorm Name
  const [selectedScorm ,setSelectedScorm] = useState(null)  // Selected Scorm
  const [selectedScormFile, setSelectedScormFile] = useState(null)  // Selected Scorm File
  const aAttachments = useSelector(state => state?.fileUploadReducer?.attachments);  //Scorm attachments
  const aScormLogs = useSelector(state => state?.ScormFileReducer?.aActivity);  //Scorm logs
  const [activeTab, setActiveTab] = useState("DETAIL"); // Default active tab

  //Handle tab click
  const handleTabClick = (tabName, file) => {
    setActiveTab(tabName);  // Set active tab
    setSelectedScorm(file._id)
    setSelectedScormFile(file); // Store selected file

    // Dispatch API call based on the tab selected
    if (tabName === "DETAIL") {
      dispatch(getScormFile({ scormId: file._id }));
    } else if (tabName === "USER_ACTIVITY") {
      dispatch(getScormLog({ scormId: file._id }));  
    }
  };

  // onload get scorm file data
  useEffect(() => {
    dispatch(getScormFile());
  }, [])

  // setting the required data
  useEffect(() => {
    setAllScormFiles(aScormFiles?.map(fl => {
      let fileType;
      const aFileNames = fl.fileNm.split('.');
      if (aFileNames.length > 1) {
        fileType = aFileNames.pop();
        fl.fileName = aFileNames.join('');
      }

      if (fileType) {
        fl.fileType = fileType;
      }

      return fl;
    }) || [])
  }, [aScormFiles]);

  // throw error for if file is not attached
  useEffect(() => {
    if (aAttachments && aAttachments.length) {
      setErrorFile(false)
    }
  }, [aAttachments]);

  // search the scorm file
  useEffect(() =>{
    if(allScormFiles){
      if(groupSearch){
        searchingHandling(groupSearch)
      } else{
        setFilteredScorm(allScormFiles)
      }
    }
  }, [allScormFiles]);

  // search function for scorm file
  const searchingHandling = (event) => {
    setGroupsearch(event);
    if (event) {
      setFilteredScorm(filterArray(event, allScormFiles, ['fileNm', "scormNms"], {
        scormNms: "tag" 
      }))
    } else {
      setFilteredScorm(allScormFiles)
    }
 }

 // save other files
  const saveOthOrSrmFile = (data) => {
    if(!aAttachments[0]?.presignedPutURL){
      setErrorFile(true);
      return;
    }

    if (aAttachments?.length && aAttachments[0]?.url && ['SRM', 'OTH'].includes(scormFileUpload)) {
      const oReqObj = {
        ...(data ?? {}),
        fileID: aAttachments[0]?.fileID,
        fileName: aAttachments[0]?.orgFileNm,
        url: aAttachments[0]?.url,
        presignUrl: aAttachments[0]?.presignedPutURL,
        type: scormFileUpload,
        fileSize: aAttachments[0]?.fileSize,
        ...(data?.entFilNm ? { eFile: data.entFilNm } : {}),
      };

      try {
        dispatch(saveScormFile(oReqObj));
        setscormFileUpload('')
        dispatch(updateFields('attachments', []));
      } catch (error) {
        messageUtil.showError("UNKNOWN_ERROR", false);
      }
    }
  }

  // table for showing scorm data
  const getParticipantTableColumns = [
    {
      id: "fileNm",
      Header: props.t("translate:ITEM"),
      accessor: "fileNm",
      sortType: "basic",
      size: "10%",
      Cell: ({ row }) => {
        return (
        <div className="d-flex gap-1">
          <File className="svg-icon_light icon-default scorm-icon" />
          <div>
            <h6>{row.original.fileNm}</h6>
            <p className="m-0">
              <span className="scorm-subheading">{row.original.type === "SRM" ?  props.t("translate:SCORM") : props.t("translate:FILE")}</span>
              {!row.original.isActive && <span className="scorm-warning">{props.t("translate:INACTIVE")}</span>}
              {row.original.scormNms?.length ? row.original.scormNms.map((val)=>
                <span className="scorm-sub_head">{val.tag}</span>).filter((val, ind)=>ind < 3) : <></>}
                {row.original?.scormNms?.length > 3 ? (
                  <span
                    className="tooltip--scorm-file scorm-sub_head"
                    data-tooltip={row.original.scormNms
                      .filter((_, index) => index >=3)
                      .map((tagNm) => tagNm.tag)
                      .join("\n")}
                  >
                    {`+${row.original.scormNms.length - 3} ${props.t(
                      "translate:MORE"
                    )}`}
                  </span>
                ) : null}
            </p>
          </div>
        </div>
      )},
    },
    {
      id: "CrAt",
      Header: props.t("translate:UPLOADED_ON"),
      accessor: (row) => moment(row.CrAt).unix(),
      sortType: "basic",
      size: "6%",
      Cell: ({ row }) => (
        <div>
          <h6>{row.original.CrAt ? lmsDateFormat(row.original.CrAt) : "-"}</h6>
          <p className="m-0">
            <span className="sub-data"> {row.original.CrAt ? lmsTimeFormat(row.original.CrAt) : "-"}</span>
            <span className="sub-data"> {row.original.staffNm ? row.original.staffNm : "-"}</span>
          </p>
        </div>
      ),
    },
    {
      id: "isPub",
      Header: props.t("translate:AVAILABILITY"),
      accessor: "",
      sortType: "basic",
      size: "8%",
      Cell: ({ row }) => {
        return (
          <>
            {row.original.isPub ? (
              <h6>
              {props.t("translate:Public")}
              </h6>
            ) : row.original?.subjectNms?.length ? (
              <div className="d-flex">
                <h6>{row.original.subjectNms[0].displayNm + " "}</h6> 
                {row.original?.subjectNms?.length > 1 ? (
                  <span
                    className="tooltip--scorm-file scorm-sub_head"
                    data-tooltip={row.original.subjectNms
                      .filter((_, index) => index !== 0)
                      .map((subNm) => subNm.displayNm)
                      .join("\n")}
                  >
                    {`+${row.original.subjectNms.length - 1} ${props.t(
                      "translate:MORE"
                    )}`}
                  </span>
                ) : null}
              </div>
            ) : (
              ""
            )}
          </>
        );
      } 
    },
    {
      id: "",
      Header: props.t("translate:SIZE"),
      accessor: "",
      sortType: "basic",
      size: "3%",
      Cell: ({ row }) => (
        <div className="d-flex gap-1">
          <h6>{row.original.size ? row.original.size: "-"}</h6>
          <div className="view-option_cont">
            <div
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              className="option-dropdown"
            >
              <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
            </div>
            <div className="dropdown-menu">
              <div
                  className="dropdown-item user-info_contents"
                  data-toggle="modal"
                  data-target="#scorm-manage"
                  onClick={() => {dispatch(getScormFile({scormId : row.original._id})); setscormFileUpload(row.original.type)}}
              >
                  <span className="sub-data" >{props.t("translate:MANAGE")}</span>
              </div>
              <div
                className="dropdown-item user-info_contents"
                onClick={() => {setSelectedScorm( row.original._id); setSelectedScormFile(row.original); setScormNm(row.original.fileName); setScormRename(true)}}
              >
                <span className="sub-data">{props.t("translate:RENAME")}</span>
              </div>
              <div
                  className="dropdown-item user-info_contents"
                  onClick={() => {setSelectedScorm( row.original._id); setSelectedScormFile(row.original); setScormDelete(true)}}
              >
                  <span className="sub-data">{props.t("translate:DELETE")}</span>
              </div>
              <div
                className="dropdown-item user-info_contents"
                onClick={() => {setSelectedScorm(row.original._id); setSelectedScormFile(row.original); setScormActive(true)}}
              >
                <span className="sub-data">{props.t("translate:" + (row.original.isActive ? 'DEACTIVATE' : 'ACTIVATE'))}</span>
                </div>
              <div
                className="dropdown-item user-info_contents"
                data-toggle="modal"
                data-target="#scorm-detail"
                onClick={() => handleTabClick("DETAIL", row.original)}
              >
                <span className="sub-data">{props.t("translate:DETAIL")}</span>
              </div>
              <div
                className="dropdown-item user-info_contents"
                data-target="#scorm-detail"
                data-toggle="modal"
                onClick={() => handleTabClick("USER_ACTIVITY", row.original)}
              >
                <span className="sub-data">
                  {props.t("translate:USER_ACTIVITY")}
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  //File upload change
 const fileUploadChange = (event)=>{
   setErrorFile(false);
 }

const editScormFileHandler = async () => {
  if (!selectedScorm) return;
  if(scormRename && !scormNm){
    return;
  }

  const oReqObj = { scormId: selectedScorm, type: selectedScormFile?.type };

  if (scormRename && scormNm) {
    Object.assign(oReqObj, { isEdit: true, scormNm: `${scormNm}.${selectedScormFile?.fileNm?.split('.')?.pop()}` });
  }

  if (scormDelete) {
    oReqObj.isDelete = true;
  }

  if (scormRename) setScormRename(false);
  if (scormDelete) setScormDelete(false);

  try {
    dispatch(editScormFile(oReqObj, () => dispatch(getScormFile())));
    setScormNm('');
    // await dispatch(getScormFile()); // Now fetch updated SCORM data
  } catch (error) {
    messageUtil.showError("UNKNOWN_ERROR", false);
  }
};

const updateScromFile = () => {
  try {
    const oReqObj = {
      isEdit: true,
      scormId: selectedScorm,
      isActive: !selectedScormFile.isActive,
    };

    dispatch(editScormFile(oReqObj, () => {
      dispatch(getScormFile());
      setScormActive(false);
      setSelectedScorm(null);
      setSelectedScormFile(null);
    }));
  } catch (error) {
    messageUtil.showError("UNKNOWN_ERROR", false);    
  }
}


  return (
    <>
      <div className="fixed-header">
        <HeaderComponent />
      </div>
      <div className="schedule-content_box schedule-content_list">
        <CourseHeader
          title={props.t("translate:FILES")}
        />
        <div className="d-flex px-4 mt-5 mb-5 justify-content-between">
          <div className="col-6 p-0">
            <div className="cont-search-box">
              <Searchbox
                placeholder={props.t('translate:SEARCH_BY_FILE_NAME_TAGS')}
                searchBoxTheme="search-default search-box_default search-outline"
                value={groupSearch}
                onChange={(e) =>{ if(e){searchingHandling(e.target.value)}}}
              />
            </div>
          </div>
          <div className="col-6 p-0 d-flex justify-content-end">
            <div
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                className="option-dropdown"
              >
                <Button theme="btn-rounded default position-relative" >
                  <Plus className="svg-icon_small icon-white" />
                  {props.t("translate:ADD")}
                </Button>
            </div>
          <div className="dropdown-menu file-upload_dropdown" >
              <div
                className="dropdown-item user-info_contents" data-toggle="modal"
                data-target="#scorm-singleFile" onClick={() => setscormFileUpload('OTH')}
              >
                <span className="sub-data">{props.t("translate:FILE")}</span>
            </div>
              <div
                className="dropdown-item user-info_contents" data-toggle="modal"
                data-target="#scorm-singleFile" onClick={() => setscormFileUpload('SRM')}
            >
                <span className="sub-data">{props.t("translate:SCORM_FILE")}</span>
            </div>
          </div>
          </div>
        </div>
            {aFilterScorm.length > 0 ? (
        <div className="scorm-table">
          <Table
            data={aFilterScorm}
            columns={getParticipantTableColumns}
            defaultSortBy="name"
            sortDesc={false}
          />
        </div>
        ) : (
           <p className="scorm-label_empty">{props.t("translate:NO_FILES_FOUND")}</p>
        )}
        {scormDelete && (
          <LmsModal
            open={scormDelete}
            selectedScormFile = {selectedScormFile?.fileNm}
            editScormFileHandler = {editScormFileHandler}
            modalTitle="Delete"
            scormDelete={true}
            onClose={() => setScormDelete(false)}
          />
        )}
        {scormRename && (
          <LmsModal
            open={scormRename}
            setScormNm = {setScormNm}
            editScormFileHandler = {editScormFileHandler}
            scormNm = {scormNm}
            modalTitle="Rename"
            scormRename={true}
            onClose={() => {setScormRename(false); setScormNm('')}}
          />
        )}
        {scormActive && (
          <LmsModal
            open={scormActive}
            editScormFileHandler={updateScromFile}
            modalTitle={props.t("translate:" + (selectedScormFile.isActive ? 'DEACTIVATE' : 'ACTIVATE'))}
            scormActive={true}
            onClose={() => {setSelectedScorm(null); setScormActive(false); setSelectedScormFile(null)}}
          />
        )}
        <ModelBarComponent activeTab={activeTab} selectedScormFile ={selectedScormFile} fileUpldTyp={scormFileUpload} saveFileUpload={saveOthOrSrmFile} errMsgFile={errMsgFile} setErrorFile={setErrorFile} selectedScorm ={selectedScorm} handleTabClick ={handleTabClick} aScormLogs={aScormLogs} />
      </div>
    </>
  );
};

export default withTranslation()(withRouter(ScormPageComponent));
