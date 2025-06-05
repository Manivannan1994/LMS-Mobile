import React, { useEffect, useState } from "react";
import { Download, File, Link, ChevronDown, ChevronLeft, ChevronRight, Edit, ArrowLeft } from 'react-feather';
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useHistory } from 'react-router-dom';
import SearchBox from "../searchbox/Searchbox";
import LmsSelectDropDown from "../lms-selectdropdown/LmsSelectDropDown";
import { useTranslation } from "react-i18next";
import { generateHexDecCode, lmsDateAndTimeFormat, lmsNonUTCDateAndTimeFormat } from "../../utils/helper";
import SelectControl from "../select-control/SelectControl";
import InputBox from "../input-box/InputBox";
import Button from "../button/Button";
import TextArea from "../text-area/TextArea";
import { getAssgnStuds, updateStudentAssignment } from "../../store/actions/GradeBookActions";
import { getAllParticipantGroups } from "../../store/actions/ParticipantsAction";
import messageUtil from "../../utils/message-util";
import StudentNameComponent from "../student-name/StudentName";
import { updateGroupContent } from "../../store/actions/ContentActions";
import GroupGradeConfrmationModal from "./GroupGradingModal";
import IndividualGradeConfrmationModal from "./IndividualGradingModal";

const GroupsAndStudentView = ({ groupId, contentId, aGradSts, studDtls }) => {
    const {t} = useTranslation()
    const dispatch = useDispatch()
    const location = useLocation()
    const history = useHistory();
    const AppState = location?.state;
    const gradeState = useSelector((state) => state.gradeBookReducer);
    const participantState = useSelector((state) => state.ParticipantReducer);
    const [aGroupsAndStuds, setGroupsAndStudents] = useState([]);
    const [aGroupsAndStudsCopy, setGroupsAndStudentsCopy] = useState([]);
    const [aGroupsAndStudentFilterCopy, setGroupsStudentFilterCopy] = useState([]);
    const [aGroupsAndStudentFiltered, setGroupsStudentsFiltered] = useState([])
    const [currentSelectedGroup, setSelectedGroup] = useState({});
    const [showGroupList, setShowGroupList] = useState(false);
    const [editGroupFeedback, setEditGroupFeedbackChange] = useState(false);
    const [filterType, setFilterType] = useState('');
    const [showGroupGradingModal, setShowGroupGradingModal] = useState(false);
    const [showIndividualGradingModal, setShowIndividualGradingModal] = useState(false);

    const oCommonPayload = {
        PrID: AppState?.PrID,
        CrID: AppState?.CrID,
        DeptID: AppState?.DeptID,
        SemID: AppState?.SemID,
        AcYr: AppState?.AcYr,
        SecID: AppState?.SecID,
        SubjId: AppState?.subId,
      };
    
      const oAssignmentPayload = {
        AcYr: AppState.AcYr,
        InId: AppState.InId,
        DeptID: AppState.DeptID,
        PrID: AppState.PrID,
        CrID: AppState.CrID,
        SemID: AppState.SemID,
        SecID: AppState.SecID,
        subId: AppState.subId,
        asgnmntId: contentId,
      };

      const saveMark = (stud) => {
        const oStudMarks = { ...stud };
        // Number check for grade config
        if (
          gradeState?.oAsgnmntDtls?.grdCnf &&
          gradeState?.oAsgnmntDtls?.grdCnf === "GRD"
        ) {
          if (oStudMarks.mrkGrd) {
            if (!isNaN(oStudMarks.mrkGrd)) {
              // Compares the mark with max mark
              if (oStudMarks.mrkGrd > gradeState?.oAsgnmntDtls?.mxMrk) {
                messageUtil.showWarning("EXCEEDS_MAX_MARK", true);
                return;
              }
              const mrkTk =
                (parseFloat(oStudMarks.mrkGrd) *
                  parseFloat(
                    gradeState?.oAsgnmntDtls?.aGradeSystem[0].GrdPercent
                  )) /
                parseFloat(gradeState?.oAsgnmntDtls?.mxMrk);
              if (
                gradeState?.oAsgnmntDtls?.aGrades &&
                gradeState?.oAsgnmntDtls?.aGrades.length
              ) {
                let mrkVal = parseFloat(mrkTk);
                let matchedGrade = gradeState?.oAsgnmntDtls?.aGrades.find(
                  (grd) => mrkVal >= grd.MinMrk && mrkVal <= grd.MaxMrk
                );
                if (matchedGrade) {
                  oStudMarks.grad = matchedGrade.Grade;
                  oStudMarks.mrkGrd = matchedGrade.GradeNm;
                } else {
                  messageUtil.showWarning("INVALID_GRADE", true);
                  return;
                }
              }
            } else {
              // letters check for grade config
              if (
                oStudMarks.mrkGrd &&
                gradeState?.oAsgnmntDtls?.aGrades &&
                gradeState?.oAsgnmntDtls?.aGrades.length
              ) {
                let matchedGrade = gradeState?.oAsgnmntDtls?.aGrades.find(
                  (grd) => oStudMarks.mrkGrd === grd.GradeNm
                );

                if (matchedGrade) {
                  oStudMarks.grad = matchedGrade.Grade;
                  oStudMarks.mark = "";
                } else {
                  messageUtil.showWarning("INVALID_GRADE", true);
                  return;
                }
              }
            }
          } else {
            oStudMarks.grad = "";
            oStudMarks.mrkGrd = "";
            oStudMarks.mark = "";
          }
        } else {
          // Marks entered within max range
          if (
            gradeState?.oAsgnmntDtls?.mxMrk !== undefined &&
            gradeState?.oAsgnmntDtls?.mxMrk !== null &&
            !isNaN(gradeState?.oAsgnmntDtls?.mxMrk)
          ) {
            let mrkVal = parseFloat(oStudMarks.mrkGrd);
            if (oStudMarks.mrkGrd !== undefined && oStudMarks.mrkGrd !== "") {
              // Check the mark exceeds the maximum mark
              if (mrkVal < 0 || mrkVal > gradeState?.oAsgnmntDtls?.mxMrk) {
                let invMsg =
                  t("translate:INVALID_POINTS") +
                  " 0 - " +
                  gradeState?.oAsgnmntDtls?.mxMrk;
                messageUtil.showWarning(invMsg, true);
                return;
              } else {
                oStudMarks.mark = oStudMarks.mrkGrd;
              }
            } else {
              oStudMarks.mark = oStudMarks.mrkGrd;
            }
          }
        }
        const oSaveRq = oStudMarks;
        oSaveRq.savMark = true;
        if (oStudMarks.grdSts === "GRD") {
          oSaveRq.notFinlz = true;
        }
        dispatch(
          updateStudentAssignment(oSaveRq, oAssignmentPayload, "studGrad")
        );
      };


       // handle multiple grade change **only applicable for groups
  const handleGradeChangeGrpSelect = (event) => {
    if (currentSelectedGroup) {
      const currentGroup = aGroupsAndStudsCopy.find(
        (g) => g._id === currentSelectedGroup?._id
      );
      const aCopyStuds = currentGroup?.groupStudents;
      const grades = gradeState?.oAsgnmntDtls?.aGrades;

      const matchedGrade = grades.find(
        (grd) => event.target.value === grd.Grade
      );

      if (grades && grades.length && aCopyStuds && aCopyStuds.length) {
        aCopyStuds.forEach((student) => {
          student.grad = "";
          student.mrkGrd = "";
          if (matchedGrade) {
            student.grad = matchedGrade.Grade;
            student.mrkGrd = matchedGrade.GradeNm;
          }
          saveMark(student);
        });
      }
    }
  };

  const handleStudentGradeChange = (event, student) => {
    const grades = gradeState?.oAsgnmntDtls?.aGrades;
    const matchedGrade = grades.find((grd) => event.target.value === grd.Grade);
    if (matchedGrade) {
      student.grad = matchedGrade.Grade;
      student.mrkGrd = matchedGrade.GradeNm;
    }else{
      student.grad = "";
      student.mrkGrd = "";
    }
    saveMark(student);
  }

  const handleSetGrpMarks = (value) => {
    const grpId = currentSelectedGroup?._id
    if(!grpId){
        return;
    }
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        s.mrkGrd = value || ''
        return s
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  }

  const handleSetStudentMarks = (value, student) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === student?.grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        if (s?.studId === student?.studId) {
          s.mrkGrd = value;
        }
        return s;
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  };

  const handleSetStudentKeyData = (key, value, student) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === student?.grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        if (s?.studId === student?.studId) {
          s[key] = value;
        }
        return s;
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  };

  const handleSaveMarkForGrp = () => {
    const grpId = currentSelectedGroup?._id
    if(!grpId){
        return;
    }
   const currentGroup  = aGroupsAndStudsCopy.find((d) => d._id === grpId)
   if(currentGroup && currentGroup?.groupStudents.length){
    currentGroup?.groupStudents.forEach((stud) => {
      saveMark(stud)
    })
   }
  }

  const handleSaveMarkForStud = (stud) => {
    const grpId = currentSelectedGroup?._id
    if(!grpId){
        return;
    }
   const currentGroup  = aGroupsAndStudsCopy.find((d) => d._id === grpId)
   if(currentGroup && currentGroup?.groupStudents.length){
    const studentToSave = currentGroup?.groupStudents.find((s) => s?.studId === stud?.studId)
    if(studentToSave){
      saveMark(studentToSave)
    }
   }
  }

  const handlePostStudMark = (id) => {
    if (id) {
      const oPostPayload = {
        _id: id,
        pstMrk: true,
      };
      dispatch(updateStudentAssignment(oPostPayload, oAssignmentPayload, "studGrad"));
    }
  };

  const handlePostGroupMarks = () => {
    if (currentSelectedGroup) {
      const currentGroup = aGroupsAndStudsCopy.find(
        (g) => g._id === currentSelectedGroup?._id
      );
      const aGrpStuds = currentGroup?.groupStudents;
      if (aGrpStuds && aGrpStuds?.length) {
        aGrpStuds.forEach((stud) => handlePostStudMark(stud?._id));
      }
    }
  };

  const handlePostFeedback = (student) => {
    const oFeedBkPayload = {
      _id: student?._id,
      pstFdBk: true,
      fdBk: student?.fdBk,
    };
    dispatch(
      updateStudentAssignment(oFeedBkPayload, oAssignmentPayload, "studGrad")
    );

    handleSetStudentKeyData('fdBkedited', false, student)
    handleSetStudentKeyData('editFdBk', false, student)
  };

  const handlePostGroupFeedback = (group) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === group?._id);
    if(tempGroup?.groupStudents && tempGroup?.groupStudents.length){
      tempGroup.groupStudents.forEach((stud) =>{
        handlePostFeedback(stud)
      })
    }
    setEditGroupFeedbackChange(false)
  }


    
    useEffect(() => {
        if (
          participantState?.participantGroups &&
          participantState?.participantGroups.length &&
          gradeState?.oAsgnmntDtls?.grpIds &&
          gradeState?.oAsgnmntDtls?.grpIds.length &&
          gradeState?.aStudents &&
          gradeState?.aStudents.length
        ) {
          const auxilaryGroupData = gradeState?.oAsgnmntDtls?.grpIds.map((d) => ({
            ...participantState?.participantGroups.find(
              (grp) => grp._id === d.grpId
            ),
            indvGrd: d?.indvGrd,
          }));
          if (auxilaryGroupData && auxilaryGroupData?.length) {
            const resolvedGrpStuds = auxilaryGroupData.map((grpstud) => {
              if (grpstud?.students && grpstud?.students.length) {
                const grpAsgnmtStuds = [];
                grpstud.students.forEach((eachStud) => {
                  const currentStud = gradeState?.aStudents.find(
                    (grdstud) => grdstud.studId === eachStud?.studId
                  );
                  if (currentStud) {
                    grpAsgnmtStuds.push({
                      ...currentStud,
                      indvGrd: grpstud?.indvGrd,
                      grpId: grpstud?._id,
                      editFdBk: false
                    });
                  }
                });
                grpstud.groupStudents = grpAsgnmtStuds;
              }
              return grpstud;
            });
    
            setGroupsAndStudents([...resolvedGrpStuds]);
            setGroupsAndStudentsCopy(resolvedGrpStuds);
          } else {
            setGroupsAndStudents([]);
            setGroupsAndStudentsCopy([])
          }
        }
      }, [participantState?.participantGroups, gradeState?.oAsgnmntDtls?.grpIds, groupId]);

    useEffect(() => {
    if (groupId && aGroupsAndStuds?.length) {
        setSelectedGroup(aGroupsAndStuds.find((g) => g._id === groupId));
    }
    }, [groupId, aGroupsAndStuds, participantState?.participantGroups]);

    //calling this because reducer states are gone when refreshing this page so trying to call the data again
    useEffect(() => {
        if(!aGroupsAndStuds.length){
            dispatch(getAllParticipantGroups(oCommonPayload))
            dispatch(getAssgnStuds(oAssignmentPayload))
        }
    },[])

   const handleGroupChange = (direction) => {
    const currentIndedx = aGroupsAndStuds.findIndex((d) => d._id === currentSelectedGroup?._id)
    const newIndex = direction === 'left' ? currentIndedx-1 : currentIndedx+1
    if(newIndex < 0 || newIndex > aGroupsAndStuds.length-1){
        return false
    }else{
        const currentGroup = aGroupsAndStuds[newIndex]
        const curretstud = currentGroup?.groupStudents.find(stud => stud?.aSts === 'SUB')
        const studId = curretstud && curretstud?.studId ? curretstud?.studId : currentGroup?.groupStudents?.[0]?.studId
        history.push({
            pathname: '/home-page/assgnmnt-grad-view', 
            state: AppState, 
            search:`?asCnId=${gradeState?.oAsgnmntDtls?._id}&studId=${studId}&isStud=${true}&actTab=${null}&isGrp=${true}&grpId=${currentGroup?._id}`
        })
    }
   }

   const handleGroupSelect = (group) => {
       const currentGroup = group
        const curretstud = currentGroup?.groupStudents.find(stud => stud?.aSts === 'SUB')
        const studId = curretstud && curretstud?.studId ? curretstud?.studId : currentGroup?.groupStudents[0]?.studId
        history.push({
            pathname: '/home-page/assgnmnt-grad-view', 
            state: AppState, 
            search:`?asCnId=${gradeState?.oAsgnmntDtls?._id}&studId=${studId}&isStud=${true}&actTab=${null}&isGrp=${true}&grpId=${currentGroup?._id}`
        })
        setShowGroupList(!showGroupList)
   }


   const handleGetGroupGrade = () => {
    if(currentSelectedGroup){
        const copyGroup = aGroupsAndStudsCopy.find(d => d._id === currentSelectedGroup?._id)
        if(copyGroup?.groupStudents.length){
            const currentStud = copyGroup.groupStudents.find((d) => d.mrkGrd)
            return currentStud?.mrkGrd
        }else{
            return ''
        }
    }else{
        return ''
    }
   }

   const handleGetStudentGrade = (student) => {
    if(currentSelectedGroup){
      const copyGroup = aGroupsAndStudsCopy.find(d => d._id === currentSelectedGroup?._id)
      if(copyGroup?.groupStudents.length){
          const currentStud = copyGroup.groupStudents.find((d) => d?.studId === student?.studId)
          return currentStud?.mrkGrd
      }else{
          return ''
      }
  }else{
      return ''
  }
   }
   const handleGetKeyDataForGroup = (key) => {
    if(currentSelectedGroup){
        const copyGroup = aGroupsAndStudsCopy.find(d => d._id === currentSelectedGroup?._id)
        if(copyGroup?.groupStudents.length){
            const currentKeyData = copyGroup?.groupStudents.find((s) => s[key] )
            return currentKeyData && currentKeyData[key] ? currentKeyData[key] : ''
        }
    }
   }

   const handleGetKeyDataForStud = (key, stud, isStud) => {
    if (currentSelectedGroup) {
      const copyGroup = aGroupsAndStudsCopy.find(
        (d) => d._id === currentSelectedGroup?._id
      );
      if (copyGroup?.groupStudents.length && !isStud) {
        const currentKeyData = copyGroup?.groupStudents.find(
          (s) => s?.studId === stud?.studId
        );
        return currentKeyData && currentKeyData[key] ? currentKeyData[key] : "";
      } else if(isStud && copyGroup?.groupStudents.length){
        const currentKeyData = copyGroup?.groupStudents.find(
          (s) => s?.studId === stud?.studId
        );
        return currentKeyData ? currentKeyData : {}
      } else {
        return "";
      }
    } else {
      return "";
    }
   }


   const handleCheckFeedbackForGroup = () => {
     if (currentSelectedGroup) {
       const copyGroup = aGroupsAndStuds.find(
         (d) => d._id === currentSelectedGroup?._id
       );
       if (copyGroup?.groupStudents.length) {
        return copyGroup?.groupStudents.every((s) => s.fdBk)
       }
     }
   };

   const handleFeedbackChangeForGroup = (value, group) => {
     const auxilaryGroupData = [...aGroupsAndStudsCopy];
     const currentGroup = auxilaryGroupData.find((g) => g._id === group._id);
     if (currentGroup && currentGroup?.groupStudents?.length) {
       currentGroup.groupStudents.forEach((stud) => {
         handleSetStudentKeyData("fdBk", value, stud);
       });
     }
   };



   const updateAsignmentContent = (contentId, grpId, status) => {
     const oContentPayload = {
       contentId: contentId,
       grpId: grpId,
       status: status,
     };
     dispatch(updateGroupContent(oContentPayload, oAssignmentPayload));
   };

   //remove grading for students when user clicks individual grading, to reset student grad
  const handleRemoveGrading = (grp) => {
    const tempGrp = aGroupsAndStuds.find((d, i) => d._id === grp._id);
    const aCopyStuds = tempGrp?.groupStudents;
    if (aCopyStuds && aCopyStuds.length) {
      aCopyStuds.forEach((student, index) => {
        student.grad = "";
        student.mrkGrd = "";
        student.fdBk= ''
        saveMark(student);
        handlePostFeedback(student);
      });
    }
  }

   const handleIndvGrading = (grp, status) => {
    handleRemoveGrading(grp)
    const auxilaryGrpDetails = [...aGroupsAndStuds];
    const tempGrp = auxilaryGrpDetails.find((d, i) => d._id === grp._id);
    if (tempGrp) {
      tempGrp.indvGrd = status;
      if (tempGrp?.groupStudents && tempGrp?.groupStudents.length) {
        const tempStuds = tempGrp.groupStudents.map((d) => ({
          ...d,
          indvGrd: status,
        }));
        tempGrp.groupStudents = tempStuds;
      }
    }
    setGroupsAndStudents(auxilaryGrpDetails);
    if (gradeState?.oAsgnmntDtls && tempGrp) {
      updateAsignmentContent(
        gradeState?.oAsgnmntDtls?._id,
        tempGrp?._id,
        status
      );
    }
    dispatch(getAssgnStuds(oAssignmentPayload))

  };


  useEffect(() => {
    if (aGroupsAndStuds.length && gradeState?.oStudDtls?.studs?.length) {
      const resolvedStudData = gradeState?.oStudDtls?.studs;
      const resolvedGroupStudents = aGroupsAndStuds.map((gp) => {
        if (gp?.groupStudents?.length) {
          const updatedGroupStudents = gp.groupStudents.map((stud) => {
            const resolvedData = resolvedStudData.find(
              (st) => st.studId === stud.studId
            );
            if (resolvedData) {
              return { ...stud, ...resolvedData };
            } else {
              return stud;
            }
          });
          return { ...gp, groupStudents: updatedGroupStudents };
        }
        return gp;
      });
      setGroupsStudentFilterCopy(resolvedGroupStudents);
      setGroupsStudentsFiltered(resolvedGroupStudents)
    }
    
  }, [aGroupsAndStuds, gradeState?.oStudDtls]);

  
const handleFilterGrades = (type) => {
  setFilterType(type)
  if (type && aGroupsAndStudentFilterCopy?.length) {
    const conditions = {
      "GRD": (student) => student?.isGrded,
      "UNGRD": (student) => student?.isUnGrded,
      "MISS": (student) => student?.ismised,
      "ALL" : (student) => student
    };

    const condition = conditions[type];
    if (condition) {
      const filteredArray = aGroupsAndStudentFilterCopy.filter(
        (group) =>
          Array.isArray(group.groupStudents) && // Check if groupstudents is present and is an array
          group.groupStudents.length > 0 && // Check if groupstudents has length
          group.groupStudents.every(condition) // Check based on the condition for the type
      );
      setGroupsStudentsFiltered(filteredArray);
    }
  }
};

const handleSearch = (searchText) => {
  if(searchText && aGroupsAndStudentFilterCopy?.length){
    setGroupsStudentsFiltered(aGroupsAndStudentFilterCopy.filter((g => g?.groupName.includes(searchText))))
  }
}

  return (
    <div className="col-4 p-0">
      <div className="student-list_dropdown">
        <ChevronLeft
          className="svg-icon_small icon-default icon-pointer"
          onClick={() => {
            handleGroupChange("left");
          }}
        />
        <div
          className="student-name_lists"
          onClick={() => setShowGroupList(!showGroupList)}
        >
          {currentSelectedGroup && currentSelectedGroup?.groupName && (
            <p className="student-names_list">
              {currentSelectedGroup?.groupName}
            </p>
          )}
          <ChevronDown className="svg-icon_small icon-default icon-pointer" />
        </div>
        <ChevronRight
          className="svg-icon_small icon-default icon-pointer"
          onClick={() => {
            handleGroupChange("right");
          }}
        />
      </div>
      {/* {!this.state.showStudDtls &&
        this.state.grdStFil &&
        this.state.grdStFil !== "ALL" && (
          <div className="show-filter_label">
            <span>
              <span>
                Showing only{" "}
                {this.state.stsVal && <span>{this.state.stsVal}</span>}
              </span>
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              onClick={() => this.goToAll()}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 3L3 9"
                stroke="#091E42"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 3L9 9"
                stroke="#091E42"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        )} */}

      {/* .................................group-list design................ */}
      {showGroupList && (
        <div className="overall-stud_list">
          <div className="stud-search_list">
            <SearchBox
              searchBoxTheme="search-default search-box_default search-outline"
              placeholder="search"
              // value={}
              onChange={(event) => {
                handleSearch(event?.target?.value)
              }}
            />
            <div className="filter-stud_list">
              {aGroupsAndStudentFiltered && aGroupsAndStudentFiltered.length > 0 ? (
                <p className="total-stud_label">
                  Total {aGroupsAndStudentFiltered.length} groups
                </p>
              ) : (
                <p> </p>
              )}
              <LmsSelectDropDown
                className="dropdown-transparent drop-down_arrow"
                value={filterType}
                defaultDisabled={false}
                dropDown={aGradSts}
                keyTag="code"
                nameTag="text"
                onChange={(event) => {
                  handleFilterGrades(event?.target.value)
                }}
              />
            </div>
          </div>

          {aGroupsAndStudentFiltered &&
            aGroupsAndStudentFiltered.length > 0 &&
            aGroupsAndStudentFiltered.map((grpItem, grpIndex) => {
              return (
                <div>
                  <div className="stud-grade_list">
                    <div className="stud-list_grade">
                      <div
                        className="stud-profile_list"
                        onClick={() => {
                          handleGroupSelect(grpItem);
                        }}
                      >
                        {grpItem?.groupName && (
                          <p className="stud-names_label">
                            {grpItem?.groupName}
                          </p>
                        )}
                      </div>
                      {grpItem?.groupStudents?.length && grpItem?.groupStudents?.every(s => s.isGrded) ? (
                        <p className="stud-grade_label">
                          {t("translate:GRADED")}
                        </p>
                      ) : grpItem?.groupStudents?.length && grpItem?.groupStudents?.some(s => s?.ismised) ? (
                        <p className="stud-missed_label">
                          {t("translate:MISSED_GRD_VIEW")}
                        </p>
                      ) : (
                        <p className="stud-upgrade_label">
                          {t("translate:UNGRADED")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
      

      {studDtls && !currentSelectedGroup?.indvGrd ? (
        <div className="assignment-submission_details">
         {!showGroupList &&
          <div>
          {studDtls && studDtls?.aSubDt ? (
            <p className="submit-date_label">
              {t("translate:SUBMITTED_ON")}:{" "}
              <span className="date-view_label">
                {lmsNonUTCDateAndTimeFormat(studDtls.aSubDt)}
              </span>
              {studDtls?.isLateSub && (
                <span className="late-submission_label">Late</span>
              )}
            </p>
          ) : (
            ""
          )}
          {!currentSelectedGroup?.indvGrd && (
            !location?.state?.isDisabledContent ?
            <div className="grade-assign_view">
              <p className="assign-grade_value">{t("translate:GRADE_CAP")}</p>
              <InputBox
                className="input-table"
                value={handleGetGroupGrade()}
                onChange={(event) => handleSetGrpMarks(event.target.value)}
                defaultDisabled={false}
                onBlur={() => {
                  handleSaveMarkForGrp();
                }}
              />
              {gradeState?.oAsgnmntDtls &&
              gradeState?.oAsgnmntDtls?.grdCnf &&
              gradeState?.oAsgnmntDtls?.grdCnf === "GRD" ? (
                <div className="stud-grade_lists">
                  <SelectControl
                    dropdownTheme="dropdown-round drop-down_round"
                    data={gradeState?.oAsgnmntDtls?.aGrades}
                    onChange={(event) => {
                      handleGradeChangeGrpSelect(event);
                    }}
                  >
                    <ChevronDown className="svg-icon_small close-icon-network" />
                  </SelectControl>
                </div>
              ) : (
                gradeState?.oAsgnmntDtls &&
                gradeState?.oAsgnmntDtls?.mxMrk && (
                  <p className="grade-max_mark">
                    / {gradeState?.oAsgnmntDtls?.mxMrk}
                  </p>
                )
              )}
              {currentSelectedGroup?.groupStudents?.length &&
              currentSelectedGroup?.groupStudents.every(
                (stud) => stud?.grdSts !== "GRD"
              ) &&
              currentSelectedGroup?.groupStudents.every(
                (stud) => stud?.mrkGrd
              ) ? (
                <Button
                  theme="btn-rounded secondary-btn btn-left"
                  clicked={() => {
                    handlePostGroupMarks();
                  }}
                  defaultDisabled={false}
                >
                  {t("translate:POST")}
                </Button>
              ) : (
                ""
              )}
              {currentSelectedGroup?.groupStudents &&
              currentSelectedGroup?.groupStudents.every(
                (stud) => stud.grdSts === "GRD"
              ) ? (
                <div className="post-align_content">
                  <p className="posted-info_label">{t("translate:POSTED")}</p>
                </div>
              ) : (
                ""
              )}
            </div>
            :<>
            <div className="grade-assign_view">
              <p className="assign-grade_value">{t("translate:GRADE_CAP")}</p>
              <InputBox
                className="input-table"
                value={handleGetGroupGrade()}
                defaultDisabled={true}
              />
              </div>
              </>
          )}

          {((!currentSelectedGroup?.indvGrd && !handleCheckFeedbackForGroup()) || editGroupFeedback) && (
            !location?.state?.isDisabledContent ?
            <div className="submission-comments_cont">
              <p className="submission-comments_label">
                {t("translate:FEEDBACK_FOR_STUDENT")}
              </p>
              <TextArea
                className="text-area_default "
                placeholder="Add feedback"
                value={handleGetKeyDataForGroup("fdBk")}
                defaultDisabled={false}
                onChange={(event) => {
                  handleFeedbackChangeForGroup(event.target.value, currentSelectedGroup)
                  setEditGroupFeedbackChange(true);
                }}
              />
              {editGroupFeedback && (
                <div className="submission-comments_btn">
                  <Button
                    theme="btn-rounded secondary-btn"
                    clicked={() => {
                      setEditGroupFeedbackChange(false);
                    }}
                  >
                    {t("translate:CANCEL")}
                  </Button>
                  <Button
                    theme="btn-rounded default btn-left"
                    clicked={() => {
                      handlePostGroupFeedback(currentSelectedGroup)}
                    }
                  >
                    {t("translate:POST_FEEDBACK")}
                  </Button>
                </div>
              )}
            </div>
            :<>
              </>
          )}
          {!currentSelectedGroup?.indvGrd && handleCheckFeedbackForGroup() && !editGroupFeedback && (
            <div className="stud-feedback_container">
              <p className="submission-comments_label">
                {t("translate:FEEDBACK_FOR_STUDENTS")}
              </p>

              <div className="stud-feedback_edit">
                {/* <div className="stud-feedback_info">
                  {this.state.oStuds && this.state.oStuds.studNmRlNo && (
                    <p className="edit-stud_name">
                      {this.state.oStuds.studNmRlNo}
                    </p>
                  )}
                </div> */}
                {handleGetKeyDataForGroup("fdBk") && (
                  !location.state?.isDisabledContent ?
                  <Edit
                    className="svg-icon_extra-small icon-dark icon-pointer ml-auto"
                    onClick={() => setEditGroupFeedbackChange(true)}
                  />:<></>
                )}
              </div>
              {handleGetKeyDataForGroup("fdBk") && (
                <p className="edit-info_label">
                  {handleGetKeyDataForGroup("fdBk")}
                </p>
              )}
              <p className="edit-info_date">
                {handleGetKeyDataForGroup("fdBkOn")
                  ? lmsDateAndTimeFormat(handleGetKeyDataForGroup("fdBkOn"))
                  : ""}
              </p>
              <hr />
            </div>
          )}

          <div className="stud-feedback_container">
            <p className="group-details_label">
              {t("translate:PARTICIPANT_GROUP_STUDENTS_IN_GROUP")}
            </p>
            <p className="group-info-label">
              {t("translate:PARTICIPANT_GROUP_ALL_STUDENTS_GET_SAME_POINTS")}
            </p>
            {!location?.state?.isDisabledContent &&
            <p
              onClick={() => setShowIndividualGradingModal(!showIndividualGradingModal)}
              className="group-info-label-link"
            >
              {t("translate:PARTICIPANT_GROUP_GRADE_INDIVIDUALLY")}
            </p>
            }

            <div className="group-students-list">
              {currentSelectedGroup?.groupStudents?.length &&
                currentSelectedGroup.groupStudents.map((gstuds) => (
                  <div className="stud-feedback_info mb-2">
                    {gstuds?.PhotoImgID && gstuds?.PhotoImgID.length > 0 ? (
                      <img
                        src={"/Image/getImage/" + gstuds?.PhotoImgID}
                        className="edits-img_feedback"
                        alt="img"
                      />
                    ) : (
                      gstuds?.FNa && (
                        <StudentNameComponent
                          className="student-name_icon"
                          fName={gstuds?.FNa.substring(0, 1)}
                          clrCode={generateHexDecCode(gstuds?.studId)}
                        />
                      )
                    )}
                    {gstuds?.FNa && (
                      <p className="edit-stud_name">
                        {gstuds?.AplnNum} - {gstuds?.FNa}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
          </div>}
        </div>
      ) : (
        !showGroupList && (
        <div className="assignment-submission_details_group">
            <div className="stud-feedback_container my-2">
              <p className="group-info-label">
                {t(
                  "translate:PARTICIPANT_GROUP_ALL_STUDENTS_GRADE_INDIVIDUALLY"
                )}
              </p>
              <p
                onClick={() => setShowGroupGradingModal(!showGroupGradingModal)}
                className="group-info-label-link"
              >
                {t("translate:PARTICIPANT_GROUP_GRADE_GROUP_WISE")}
              </p>
            </div>
            <div
              style={{
                minHeight: "70vh",
                maxHeight: "70vh",
                overflowY: "scroll",
                padding: "5px",
              }}
            >
              {currentSelectedGroup?.indvGrd &&
                currentSelectedGroup?.groupStudents &&
                currentSelectedGroup?.groupStudents.length &&
                currentSelectedGroup?.groupStudents.map((gpstudent) => (
                  <div>
                    <div className="stud-feedback_info">
                      {gpstudent?.PhotoImgID &&
                      gpstudent?.PhotoImgID.length > 0 ? (
                        <img
                          src={"/Image/getImage/" + gpstudent?.PhotoImgID}
                          className="edits-img_feedback"
                          alt="img"
                        />
                      ) : (
                        gpstudent?.FNa && (
                          <StudentNameComponent
                            className="student-name_icon"
                            fName={gpstudent?.FNa.substring(0, 1)}
                            clrCode={generateHexDecCode(gpstudent?.studId)}
                          />
                        )
                      )}
                      {gpstudent?.FNa && (
                        <p className="edit-stud_name">
                          {gpstudent?.AplnNum} - {gpstudent?.FNa}
                        </p>
                      )}
                    </div>
                    <div className="grade-assign_view">
                      <p className="assign-grade_value">
                        {t("translate:GRADE_CAP")}
                      </p>
                      <InputBox
                        className="input-table"
                        value={handleGetStudentGrade(gpstudent)}
                        onChange={(event) =>
                          handleSetStudentMarks(event.target.value, gpstudent)
                        }
                        defaultDisabled={false}
                        onBlur={() => {
                          handleSaveMarkForStud(gpstudent);
                        }}
                      />
                      {gradeState?.oAsgnmntDtls &&
                      gradeState?.oAsgnmntDtls?.grdCnf &&
                      gradeState?.oAsgnmntDtls?.grdCnf === "GRD" ? (
                        <div className="stud-grade_lists">
                          <SelectControl
                            dropdownTheme="dropdown-round drop-down_round"
                            data={gradeState?.oAsgnmntDtls?.aGrades}
                            onChange={(event) => {
                              handleStudentGradeChange(event, gpstudent);
                            }}
                          >
                            <ChevronDown className="svg-icon_small close-icon-network" />
                          </SelectControl>
                        </div>
                      ) : (
                        gradeState?.oAsgnmntDtls &&
                        gradeState?.oAsgnmntDtls?.mxMrk && (
                          <p className="grade-max_mark">
                            / {gradeState?.oAsgnmntDtls?.mxMrk}
                          </p>
                        )
                      )}
                      {gpstudent.grdSts !== "GRD" && gpstudent?.mrkGrd ? (
                        <Button
                          theme="btn-rounded secondary-btn btn-left"
                          clicked={() => {
                            handlePostStudMark(gpstudent?._id);
                          }}
                          defaultDisabled={false}
                        >
                          {t("translate:POST")}
                        </Button>
                      ) : (
                        ""
                      )}
                      {gpstudent.grdSts === "GRD" ? (
                        <div className="post-align_content">
                          <p className="posted-info_label">
                            {t("translate:POSTED")}
                          </p>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                    {gpstudent?.fdBk && !gpstudent?.editFdBk && (
                      <div className="stud-feedback_container">
                        <p className="submission-comments_label">
                          {t("translate:FEEDBACK_FOR_STUDENT")}
                        </p>
                        <div className="stud-feedback_edit">
                          {!gpstudent.isDrop && gpstudent?.fdBk && (
                            <Edit
                              className="svg-icon_extra-small icon-dark icon-pointer ml-auto"
                              onClick={() => {
                                handleSetStudentKeyData(
                                  "editFdBk",
                                  true,
                                  gpstudent
                                );
                              }}
                            />
                          )}
                        </div>
                        {gpstudent?.fdBk && (
                          <p className="edit-info_label">{gpstudent.fdBk}</p>
                        )}
                        <p className="edit-info_date">
                          {gpstudent?.fdBkOn
                            ? lmsDateAndTimeFormat(gpstudent.fdBkOn)
                            : ""}
                        </p>
                      </div>
                    )}
                    {(!gpstudent?.fdBk ||
                      handleGetKeyDataForStud("editFdBk", gpstudent)) && (
                      <div className="submission-comments_cont">
                        <p className="submission-comments_label">
                          {t("translate:FEEDBACK_FOR_STUDENT")}
                        </p>
                        <TextArea
                          className="text-area_default "
                          placeholder="Add feedback"
                          value={handleGetKeyDataForStud("fdBk", gpstudent)}
                          defaultDisabled={false}
                          onChange={(event) => {
                            handleSetStudentKeyData(
                              "fdBk",
                              event.target.value,
                              gpstudent
                            );
                            handleSetStudentKeyData(
                              "fdBkedited",
                              true,
                              gpstudent
                            );
                            handleSetStudentKeyData(
                              "editFdBk",
                              true,
                              gpstudent
                            );
                          }}
                        />
                        {handleGetKeyDataForStud("fdBkedited", gpstudent) && (
                          <div className="submission-comments_btn">
                            <Button
                              theme="btn-rounded secondary-btn"
                              clicked={() => {
                                handleSetStudentKeyData(
                                  "fdBkedited",
                                  false,
                                  gpstudent
                                );
                                handleSetStudentKeyData(
                                  "editFdBk",
                                  false,
                                  gpstudent
                                );
                              }}
                            >
                              {t("translate:CANCEL")}
                            </Button>
                            <Button
                              theme="btn-rounded default btn-left"
                              clicked={() => {
                                handlePostFeedback(
                                  handleGetKeyDataForStud(null, gpstudent, true)
                                );
                              }}
                            >
                              {t("translate:POST_FEEDBACK")}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <hr />
                  </div>
                ))}
            </div>
          
        </div>
      )
      )}
      <GroupGradeConfrmationModal handleSwitch={() => handleIndvGrading(currentSelectedGroup, false)} showGroupGradingModal={showGroupGradingModal} setShowGroupGradingModal={setShowGroupGradingModal} />
      <IndividualGradeConfrmationModal handleSwitch={() => handleIndvGrading(currentSelectedGroup, true)} showIndividualGradingModal={showIndividualGradingModal} setShowIndividualGradingModal={setShowIndividualGradingModal} />
    </div>
  );
};

export default GroupsAndStudentView;
