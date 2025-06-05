import React, { lazy, useEffect, useState } from 'react';
import '../../styles/_importContentStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { ArrowLeft, Info } from 'react-feather';
// import ProgressBar from '../progressbar/Progressbar';
import ReactSelect from '../../components/react-select/ReactSelect';
import LmsCommonService from '../../service/lms-service';
import { connect } from 'react-redux'
import { withTranslation } from "react-i18next";
// import UserSession from '../../utils/UserSession';
import { getSubjByEntprsDtls, getStaffClasses, updateFields } from '../../store/actions/DashboardActions';
import { useHistory, useLocation } from 'react-router-dom';
import { addImportDtls, getAllImpDtls, getChapterSubchapter } from '../../store/actions/ContentActions';
import _ from "lodash";
import {lmsNonUTCDateAndTimeFormat} from '../../utils/helper';


const Button = lazy(() =>
   import('../button/Button')
);
const LmsSelectDropDown = lazy(() =>
   import('../lms-selectdropdown/LmsSelectDropDown')
);
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);

const ImportContentComponent = (props) => {
   const [aCode, setAcode] = useState([]);
   const [aSelctData, setSelData] = useState([]);
   const [selValue, setValue] = useState({});
   const [selCourse, setSelCourse] = useState({});
   const [aCourse, setCourse] = useState([]);
   const [impType,setImType] = useState('');
   const [isAlImrt,setAlImrt] = useState(false);
   const [isAlImtDrk,setAlImDrk] = useState(false);
   const location = useLocation();
   const history = useHistory();
   const [aChapterList, setChapterList] = useState([]);  // to store chapter list
   const [aSubChapterList, setSubChapterList] = useState([]);  // to store sub chapter list
   const [isOpenCnfrmMdl, setIsOpenCnfrmMdl] = useState(false);   // to show the confirmation modal while doing the chapter, sub-chapter level import
   
   // For intial load
   useEffect(() => {
      setTimeout(() => { // For clear intial load
         props.updateFields("acYr", []);
         props.updateFields("subjects", []);
         setSelData([]);
         setCourse([]);
      }, 100);
      getImportDtls();
      getAllImpDtls();
   },// eslint-disable-next-line 
      []);

   // Callback for academic year details
   useEffect(() => {
      if (props.acYr && props.acYr.length > 0 && props.session && props.session.mappedid) {
         let aSelctCtrlData = [];
         let oGrpSel = '';
         props.acYr.forEach((item, index) => {
            if (item.PrCode && item.CrCode && item.AcYrNm && item.SemName) {
               oGrpSel = `${item.PrCode}, ${item.CrCode}, ${item.AcYrNm}, ${item.SemName}`;
               aSelctCtrlData.push({ value: item._id, label: oGrpSel });
            }
         });
         setSelData(aSelctCtrlData);
      }
   },// eslint-disable-next-line 
      [props.acYr]);

   // Callback for course details
   useEffect(() => {
      if (props.subjects && props.subjects.length > 0) {
         let aSelctCtrlData = [];
         props.subjects.forEach((oSubj, index) => {
            let parts = [];

            if (oSubj.deptCd) parts.push(oSubj.deptCd);
            if (oSubj.SecNm) parts.push(oSubj.SecNm);
          
            if (oSubj.Code && oSubj.SubjNm) {
              parts.push(`${oSubj.Code} - ${oSubj.SubjNm}`);
            } else if (oSubj.SubjNm) {
              parts.push(oSubj.SubjNm);
            } else if (oSubj.Code) {
              parts.push(oSubj.Code);
            }
          
            const oGrpCours = parts.join(', ');
          
            aSelctCtrlData.push({
              value: oSubj.SubjId,
              label: oGrpCours,
              matchIndex: index
            });
            // if (oSubj.Code && oSubj.SubjNm && oSubj.SecNm && oSubj.deptCd) {
            //    oGrpCours = oSubj.deptCd + ", " + oSubj.SecNm + ", " + oSubj.Code + " - " + oSubj.SubjNm;

            // }
            // aSelctCtrlData.push({ value: oSubj.SubjId, label: oGrpCours,matchIndex:index});
         });
         setCourse(aSelctCtrlData);
      }

   }, [props.subjects]);

   // Callback for select course and select acadamic year for the button active
   useEffect(() => {
      if (selCourse && !_.isEmpty(selCourse) && selValue && !_.isEmpty(selValue)) {
         setAlImrt(true);
         setAlImDrk(true);
      } else {
         setAlImrt(false);
         setAlImDrk(false);
      }
   }, [selCourse, selValue]);

   // Get Import details for the academic year details and course details
   const getImportDtls = () => {
      let oDomainCodes = {
         codes: ['LMS_CONTENT_CREATION'],
      };
      LmsCommonService.getDomainByCode(oDomainCodes, (err, response) => {
         if (response && response.length) {
            for (let cd = response.length - 1; cd >= 0; cd--) {
               if (response[cd].code === "LMS_CONTENT_CREATION" && response[cd].ccodes && response[cd].ccodes.length) {
                  setAcode(response[cd].ccodes);
               }
            }
         }
      });
   }

   const getAllImpDtls = () => {
      if (location.state && !_.isEmpty(location.state)) {
         let oReq = {
            "InId": location.state.InId,
            "SubjId": location.state.subId,
            "StaffId": props.session.mappedid,
            "Type": "LMS_CONTENT_CREATION"
         }
         props.getAllImpDtls(oReq);
      }
   }

   // Handling for academic year
   const handleChange = (event) => {
      setCourse([]);
      setSelCourse({});
      props.acYr.forEach((item, index) => {
         if (event.value === item._id) {
            setValue(item);
            props.getSubjByEntprsDtls(item, props.session);
         }
      })
   };

   // Handling for course drop down
   const courseHandler = (event) => {
   // Handling for import type
      if(event && props.subjects && props.subjects.length > 0 && props.subjects[event.matchIndex] && props.subjects[event.matchIndex].SubjId && props.subjects[event.matchIndex].SubjId === event.value){
         setSelCourse(props.subjects[event.matchIndex]);
         setChapterList([]);

         /* Payload to get chapter and subchapter against to the subject */
         const oPayload = {
            "InId": props.selcDtls.InId,
            "PrID": props.selcDtls.PrID,
            "CrID": props.selcDtls.CrID,
            "SemID": props.selcDtls.SemID,
            "SecID": props.subjects[event.matchIndex].SecID,
            "AcYr": props.selcDtls.AcYr,
            "DeptID": props.subjects[event.matchIndex].deptId,
            "SubjId": event.value
         };

         getChapterSubchapter({...oPayload}, (err, oRes) => {
            if(oRes && oRes.aChapters){
               setChapterList([...oRes.aChapters]);
            }
            if(oRes && oRes.aSubChapters){
               setSubChapterList([...oRes.aSubChapters]);
            }
         });
      }
   }

   /* While changing on chapter */
   const handleChangeChapter = (event) => {
      setSelCourse((prevState) => ({
         ...prevState,
         chapId: event.value,
         sbChpIds: []
      }));
   };

   /* While changing on sub chapter */
   const handleChangeSubChapter = (event) => {
      setSelCourse((prevState) => ({
         ...prevState,
         sbChpIds: [...event.map((item) => item.value)]
      }));
   };

   // Handling for import type
   const importTyHandler = (event) => {
      if (event.target.value) {
         setImType(event.target.value);
         props.session.isImpOldSem = true; // is import old semester
         props.session.isFmImpt = true;
         props.getStaffClasses(props.session);
      }
   }
   // Add import course content package
   const importPackage = (frmModal) => {
      if(selCourse.chapId && !frmModal){
         setIsOpenCnfrmMdl(true);
      }else{
         if (selCourse && !_.isEmpty(selCourse) && selValue && !_.isEmpty(selValue)
         && location.state && !_.isEmpty(location.state)) {
            let oReq = {
               staffId: props.session.mappedid,
               Data: [
                  {
                     "oCpyTo": {
                        "AcYr": location.state.AcYr,
                        "CrID": location.state.CrID,
                        "DeptID": location.state.DeptID,
                        "InId": location.state.InId,
                        "PrID": location.state.PrID,
                        "SecID": location.state.SecID,
                        "SemID": location.state.SemID,
                        "SubjId": location.state.subId,
                     },
                     "oCpyFrm": {
                        "AcYr": props.selcDtls.AcYr,
                        "CrID": props.selcDtls.CrID,
                        "DeptID": selCourse.deptId,
                        "InId": props.selcDtls.InId,
                        "PrID": props.selcDtls.PrID,
                        "SecID": selCourse.SecID,
                        "SemID": props.selcDtls.SemID,
                        "SubjId": selCourse.SubjId,
                        "chapId": selCourse.chapId,
                        "sbChpIds": selCourse.sbChpIds
                     },
                     "impType" :impType
                  },
               ],
            }
            props.addImportDtls(oReq,callbackFrImport);
         }
      }
   }
   // Callback for after create import course 
   const callbackFrImport = (isSucess) => {
      if (isSucess) {
         setAlImrt(false);
         setCourse([]);
         setSelData([]);
         props.updateFields("acYr", []);
         props.updateFields("subjects", []);
         setImType('');
         getAllImpDtls(); 
         setChapterList([]);
         setSubChapterList([]);
         setIsOpenCnfrmMdl(false);
      }
   }
  // Call every 2 mins for import details
   useEffect(() => {
      let setApicl = setInterval(() => {
         getAllImpDtls();
      }, 1000 * 60 * 2);
      return () => {
         clearInterval(setApicl);
      }
   }, []);

   const aCustomBtns = [
      {
         name: 'CANCEL',
         className: 'secondary-btn',
         onClick: () => {
            setIsOpenCnfrmMdl(false);
         }
      },
      {
         name: 'PROCEED',
         onClick: () => {
            importPackage(true);
         }
      }
   ]

   return (
      <div>
         <div className="export-container">
            <div className="export-header_box">
               <div className="export-header" onClick={()=>history.push({pathname:'/home-page/content-page',state:location.state})}>
                  <ArrowLeft className="svg-icon_large icon-dark icon-pointer" />
                  <p className="export-head_label">{props.t("translate:IMPORT_CONTENT")}</p>
               </div>
            </div>
            <div className="export-container_box">
               <div className="import-type_select">
                  <div className="import-type_course">
                     <p className="import-type_label">{props.t("translate:IMPORT_TYPE")}</p>
                     <LmsSelectDropDown className="dropdown-border drop-down_arrow" dropDown={aCode} keyTag="code" nameTag="text" value={impType} onChange={(event)=>importTyHandler(event)} isNtDefltSel={true}/>
                  </div>
                  <div className="import-course_range">
                  {aSelctData && aSelctData.length > 0 &&
                     <div className="import-type_course">
                        <p className="select-course_label">{props.t("translate:SELECT_FRM_PROGRAM")}</p>
                        <ReactSelect data={aSelctData} onChange={(event) => handleChange(event)} />
                        {/* <LmsSelectDropDown className="dropdown-border drop-down_arrow" /> */}
                     </div>}
                    {aCourse && aCourse.length>0 &&
                     <div className="import-type_course">
                        <p className="select-course_label">{props.t("translate:SELECT_FRM_COURSE")}</p>
                        <ReactSelect data={aCourse} onChange={(event) => courseHandler(event)} />
                        {/* <LmsSelectDropDown className="dropdown-border drop-down_arrow" /> */}
                     </div>}
                     {aChapterList && aChapterList.length>0 &&
                        <div className="import-type_course">
                           <p className="select-course_label">{props.t("translate:SELECT_CHAPTER")}</p>
                           <ReactSelect data={aChapterList} onChange={handleChangeChapter}/>
                        </div>
                     }
                     {aSubChapterList && aSubChapterList.length>0 &&
                        <div className="import-type_course">
                           <p className="select-course_label">{props.t("translate:SELECT_SUB_CHAPTER")}</p>
                           <ReactSelect data={[...aSubChapterList.filter((item) => {
                              return ( item.chapId === selCourse.chapId && item.StFl === 'A' )
                           })]} isMulti={true} onChange={handleChangeSubChapter}/>
                        </div>
                     }
                  </div>
               </div>
               {/* <div className="export-start_box">
                 <div className="export-cont_box">
                    <div className="start-import">
                       <p className="start-export_label">Import file</p>
                       <p className="start-cont_label">You are about to import a course from a file. The file should be a .zip. To add individual content (.doc, .ppt, .jpg, etc.), add it as a file in course content.</p>
                    </div>
                    <div className="select-file_import">
                       <p className="drop-file_label">Drag 'n' drop some files here</p>
                       <p className="drop-choose_label">OR</p>
                       <Button theme="btn-rounded default">Choose a file</Button>
                    </div>
                    <div className="course-file_import">
                       <p className="file-import_label">Coursename-10-07-2022,10:22PM.zip</p>
                       <Trash2 className=" svg-icon_small icon-default icon-pointer" />
                    </div> 
                 </div>
              </div> */}
               {/* <div className="progress-view_box">
                 <ProgressBar studentProgressBar={true} widthprog={30} progressBarTheme="progress-bar_content " />
                 <p className="progress-view_label">The export process has started. This can take awhile for large courses. You can wait or leave the page and come back again.</p>
              </div>
              <div className="import-alert_error">
                 <div className="progress-error_cont">
                    <AlertTriangle className="svg-icon_small icon-alert"/>
                    <p className="error-report_cont">Importing the same course content more than once will overwrite any existing content in the course.</p>
                 </div>
              </div>
              <div className="progress-view_error">
                 <div className="progress-error_cont">
                    <AlertOctagon className="svg-icon_small icon-error"/>
                    <p className="error-report_cont">There may be an issue with the course package. Note that no files from your package have been imported at this point.</p>
                 </div>
              </div> */}
               <div className="import-view_btn">
                 {!isAlImtDrk && <Button theme="btn-rounded lite_dark-btn" >{props.t("translate:IMPORT")}</Button>}
                 {isAlImrt && <Button theme="btn-rounded default" clicked={() => importPackage()}>{props.t("translate:IMPORT")}</Button>}
               </div>
               {props.aContDup && props.aContDup.length>0 &&
               <div className="recent-exports_table">
                  <p className="exports-table_label">{props.t("translate:RECENT_EXPORTS")}</p>
                  <div className="exports-table_box">
                     <table class="table table-cont student-grades_table import-table_cont">
                     <thead class="thead-list">
                           <tr>
                              <th class="sortable import-table_head">{props.t("translate:IMPORT_TYPE")}</th>
                              <th class="sortable import-table_head">{props.t("translate:SOURCE")}</th>
                              <th class="sortable import-table_head">{props.t("translate:IMPORTED_ON")}</th>
                              <th class="sortable import-table_head">{props.t("translate:STATUS")}</th>
                           </tr>
                        </thead>
                        {props.aContDup && props.aContDup.length > 0 && props.aContDup.map((oContDup) => {
                           return (
                              <tbody>
                                 <tr>
                                    <td >{oContDup.impTypeNm}</td>
                                    {oContDup.subName && <td><p className="import-course_label" title={oContDup.subName}>{oContDup.deptNm}, {oContDup.secNm}, {oContDup.subCode} - {oContDup.subName}</p></td>}
                                    {oContDup.Status === "Completed" || oContDup.Status === "Error" ? <td >{lmsNonUTCDateAndTimeFormat(oContDup.CrAt)}</td> : 
                                    <td>-</td>}
                                    <td >
                                       {oContDup.Status === "Pending" ? <p className="running-import_status">{props.t("translate:RUNNING")}</p> :
                                          oContDup.Status === "Completed" ? <p className="completed-import_status">{props.t("translate:COMPLETED")}</p> : 
                                          oContDup.Status === "InProgress" ? <p className="in-progress_status">{props.t("translate:PENDING")}</p> :
                                          oContDup.Status === "Error" ?  <div className="filed-cont_info">
                                          <p className="error-import_status">{props.t("translate:FAILED")}</p>
                                          <div className="tooltip--bottom_filed" data-tooltip={props.t("translate:NO_CONTENT_WAS_IMPORT")}>
                                          <Info className="svg-icon_light icon-dark icon-pointer"/>
                                          </div>
                                          </div> : '-'
                                       }   
                                    </td>
                                 </tr>
                              </tbody>
                           )
                        })}
                     </table>
                  </div>
               </div>}
            </div>
         </div>
         {isOpenCnfrmMdl && <LmsModal open={isOpenCnfrmMdl} onClose={() => setIsOpenCnfrmMdl(false)} modalTitle={props.t("translate:IMPORT_CONFIRMATION_HEADER")} customContents={'IMPORT_CONFIRMATION_CONTENTS'}  aCustomBtns={aCustomBtns} />}
      </div>
   )

}
const mapStateToProps = (state) => ({
   ...state.headerReducer,
   ...state.dashboardReducer,
   ...state.contentReducer,
})

const mapDispatchToProps = {
   getSubjByEntprsDtls,
   getStaffClasses,
   addImportDtls,
   getAllImpDtls,
   updateFields
}
const TabNavigator = (props) => <ImportContentComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);