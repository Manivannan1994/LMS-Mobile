import React, { useEffect, useState, lazy } from 'react';
import '../../styles/_participantsListStyle.scss';
import '../../styles/_commonLmsStyle.scss';
// import Button from '../button/Button';  
// import InputBox from '../input-box/InputBox';
import Searchbox from '../searchbox/Searchbox';
import '../../styles/_commonLmsStyle.scss';
// import LmsSelectDropDown from '../lms-selectdropdown/LmsSelectDropDown'
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect, useSelector } from 'react-redux';
import {getTheGradingStuds as getStudDtls ,updateFields} from '../../store/actions/GradeBookActions';
import { studentContentProgress } from '../../store/actions/ContentActions';
import {lmsDateAndTimeFormat} from '../../utils/helper';
import ProgressBar from '../progressbar/Progressbar';
import { filterArray } from '../../utils/filter-util';
import Table from '../table/Table';
import moment from 'moment';
import ParticipantsGroup from '../participants-group/Participantsgroup';
import { getGradeBookItems } from '../../store/actions/GradeBookActions';
import { useDispatch } from 'react-redux';
import { resolveAssgnStuds } from '../../store/actions/GradeBookActions';
import messageUtil from '../../utils/message-util';

 const ParticipantsListComponent =(props)=>{
     const location = useLocation();
     const [studNme, setStudNme] = useState('');
     const [resolvedStudents, setResolvedStudents] = useState([]);
     const participantState = useSelector((state) => state.ParticipantReducer);
     const dispatch = useDispatch()
     const gradebookState = useSelector((state) => state.gradeBookReducer)
     const gradeBookList = gradebookState?.oGrdBookItems?.aGrdBkItems

     useEffect(() => {
         props.updateFields("aGradStudents", []);
         getStudentDtls();
     },// eslint-disable-next-line 
     []);
    
    const particpantTableColumns = React.useMemo(
        () => [
            {
                id: "name",
                Header: props.t("translate:FULL_NAME"),
                accessor: "FNa",
                sortType: "basic",
                Cell: ({ row }) => {
                    return (
                      <>{row.original.FNa} {row.original.LNa}</>
                    );
                }
            },
            {
                id: "AplnNum",
                Header: props.t("translate:ROLL_NO"),
                accessor: (row) => row.AplnNum || "-",
                sortType: "basic"
                
            },
            {
                id: "CnEmail",
                Header: props.t("translate:EMAIL"),
                accessor: (row) => row.CnEmail || "-",
            },
            {
                id: "lsAccss",
                Header: props.t("translate:LAST_ACCESS"),
                accessor: (row) => moment(row.lsAccss).unix(),
                Cell: ({ row }) => {
                    return (
                        <>{row.original.lsAccss ? lmsDateAndTimeFormat(row.original.lsAccss) : "-"}</>
                    )
                }
            },
            {
                id: "progsPrcnt",
                Header: props.t("translate:PROGRESS"),
                accessor: "progsPrcnt",
                Cell: ({ row }) => {
                    return (
                        <div className="stud-progress_stus">
                            <div className="stud-progress">
                                <ProgressBar studentProgressBar={true} widthprog={row.original.progsPrcnt} progressBarTheme="progress-bar_content " className="progress-bar_student"/>
                            </div>
                            <p className="stud-progress_labal">{row.original.progsPrcnt}</p>
                        </div>
                    );
                }
            }
        ],
        []
    );

     // Get student details
     const getStudentDtls = (pageValues) => {
         const oReq = {
             "SecID": location.state.SecID,
             "AcYr": location.state.AcYr,
             "InId": location.state.InId,
             "DeptID": location.state.DeptID,
             "PrID": location.state.PrID,
             "CrID": location.state.CrID,
             "SemID": location.state.SemID,
             "SubID": location.state.subId,
             "getStuds": true,
             "OID": location.state.InId,
             "StaffID": location.state.StaffId,
             "isFE": props.session.fe,
             "TPID": location.state.TPID,
             "isLms": true,
             "isFrmLms": true
         }
         // For pagination 
         if (pageValues && pageValues.pageSize && pageValues.pageNo) {
             oReq.pageSize = pageValues.pageSize;
             oReq.pageNo = pageValues.pageNo;
             oReq.calOvGr = true;
         }
         props.getStudDtls(oReq);
     }
     
     // Student search handler
     const searchingHandling = (event) => {
         setStudNme(event.target.value);
         if (event.target.value) {
             props.updateFields('aGradStudents', filterArray(event.target.value, props.aGradStudentsCpy, ['FNa']));
         } else {
             props.updateFields('aGradStudents', props.aGradStudentsCpy);
         }
     }

     useEffect(() => {
      dispatch(getGradeBookItems(location.state))
     },[])

     const propcessStudents = async (data) => {
       try {
         const oReq = {
           SecID: location.state?.SecID,
           AcYr: location.state?.AcYr,
           InId: location.state?.InId,
           DeptID: location.state?.DeptID,
           PrID: location.state?.PrID,
           CrID: location.state?.CrID,
           SemID: location.state?.SemID,
           subId: location.state?.subId,
         };
         const promises = data.map(async(item) =>{
           item.assignStuds = await resolveAssgnStuds({ asgnmntId: item._id, ...oReq })
           return item;
         }
         );
         const results = await Promise.all(promises);
         setResolvedStudents(results);
       } catch (err) {
         messageUtil.showError(err, true);
       }
     };

     useEffect(() => {
       if (gradeBookList?.length) {
         propcessStudents(gradeBookList);
       }
     }, [gradeBookList]);


     return (
       <div>
         <div className="participants-heading">
           <div className="cont-nav">
             <div className="course-name">
               <h6>
                 {props.t("translate:ASSIGNMENTVIEWCOMPONENT_PARTICIPANTS")}
               </h6>
               <p>{props.t("translate:PARTICIPANT_DESC")}</p>
             </div>
           </div>
         </div>
         {/* <div className="participants-course"> */}
         {/* <div className="row m-0">
                    <div className="col-6 p-0">
                        <div className="course-cont_box">
                            <div className="course-link_box">
                            <p className="course-link_label">Course link</p>
                            <Button theme="btn-rounded positive-btn ">
                            Enabled link sharing
                            </Button>
                            </div>
                            <div className="url-link_box">
                            <div className="url-link_cont">
                                <p className="url-cont_label">Learner can join this course via this link</p>
                                <InputBox className="input-block " placeholder="kdm.camu.in/pianoessentials"></InputBox>
                            </div>
                            <Button theme="btn-rounded btn-outline btn-left">  Copy link </Button>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 p-0">
                        <div className="email-invite">
                            <p className="course-link_label">Invite via Email</p>
                            <div className="invite-email_cont">
                            <p className="url-cont_label">Invite learners, instructors or assistants via email</p>
                            <Button theme="btn-rounded btn-outline"> Invite Learner</Button>
                            <Button theme="btn-rounded btn-outline btn-left"> Invite Teacher </Button>
                            </div>
                        </div>
                    </div>
                </div> */}
         {/* </div> */}
         <div className="participants-content">
           {/* ...............................tabs selection code......................  */}
           <div class="project-tab">
             <div class="participants-content_tab">
               <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                 <a
                   class="nav-item nav-link active"
                   id="nav-home-tab"
                   data-toggle="tab"
                   href="#tab-1"
                   role="tab"
                   aria-selected="true"
                 >
                   {props.t("translate:ENROLLED")} <span class="badge bg-badge border rounded">{props?.aGradStudents?.length || 0}</span>
                 </a>
                 <a
                   class="nav-item nav-link"
                   id="nav-home-tab"
                   data-toggle="tab"
                   href="#tab-2"
                   role="tab"
                   aria-selected="true"
                 >
                   {props.t("translate:GROUPS")} <span class="badge bg-badge border rounded">{participantState?.participantGroups?.length || 0}</span>
                 </a>
                 {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false">Pending</a> */}
                 {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Groups</a> */}
               </div>
             </div>
             <div
               class="tab-content participants-tabs_cont"
               id="nav-tabContent"
             >
               <div
                 class="tab-pane fade show active"
                 id="tab-1"
                 role="tabpanel"
                 aria-labelledby="nav-home-tab"
               >
                 <div className="student-participants_search">
                   <div class="row m-0">
                     <div class="col-6 p-0">
                       <div className="cont-search-box">
                         <Searchbox
                           placeholder="Search"
                           searchBoxTheme="search-default search-box_default search-outline"
                           value={studNme}
                           onChange={(event) => searchingHandling(event)}
                         />
                       </div>
                     </div>
                   </div>
                 </div>
                 {props.aGradStudents && props.aGradStudents.length > 0 ? (
                   <div className="student-grades_table">
                     <Table
                       data={props.aGradStudents}
                       columns={particpantTableColumns}
                       defaultSortBy="name"
                       sortDesc={false}
                     />
                   </div>
                 ) : (
                   <div className="participant-empty_cont">
                     <p>{props.t("translate:EMPTY_PARTICIPANT")}</p>
                   </div>
                 )}
               </div>
               <div
                 class="tab-pane fade"
                 id="tab-2"
                 role="tabpanel"
                 aria-labelledby="nav-home-tab"
               >
                 <ParticipantsGroup gradebookState={resolvedStudents} aStudents={props.aGradStudents} componentProp={props} />
               </div>
             </div>
           </div>
         </div>
       </div>
     );

}

const mapStateToProps = (state) => ({
    ...state.contentReducer,
    ...state.headerReducer,
    ...state.gradeBookReducer
 })
 const mapDispatchToProps = {
    getStudDtls,
    updateFields,
    studentContentProgress
 }
 const TabNavigator = (props) => <ParticipantsListComponent {...props} />
 const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)
 export default withTranslation()(Components);
 
