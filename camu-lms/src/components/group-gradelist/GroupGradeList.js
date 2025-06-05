import React, { Component, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import '../../styles/_studentGradeList.scss';
import '../../styles/_commonLmsStyle.scss';
import Table from '../table/Table';
import no_grade_book from '../../assets/images/grade-empty.svg';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { generateHexDecCode, lmsDateAndTimeFormat } from '../../utils/helper';
import { useLocation, useHistory } from 'react-router-dom';
import { getAllParticipantGroups } from '../../store/actions/ParticipantsAction';
import { X, Edit, ChevronDown } from 'react-feather';
import StudentNameComponent from '../student-name/StudentName';
import CheckBox from '../checkbox/CheckBox';
import { updateStudentAssignment } from '../../store/actions/GradeBookActions';
import { updateGroupContent } from '../../store/actions/ContentActions';
import messageUtil from '../../utils/message-util';
import {MessageAdd, MessageSelect, MessageHide, MessagePost } from '../icons/Icons';

const SearchBox = lazy(() =>
import('../searchbox/Searchbox')
);

const Button = lazy(()=>
import('../button/Button')
);
const InputBox = lazy(()=>
import('../input-box/InputBox')
);
const SelectControl = lazy(()=>
import('../select-control/SelectControl')
);
const TextArea = lazy(()=>
import('../text-area/TextArea')
);
const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);

const GroupGradeList = ({ actTab, gradeType }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory()
  const AppState = location?.state;
  const dispatch = useDispatch();
  const gradeState = useSelector((state) => state.gradeBookReducer);
  const participantState = useSelector((state) => state.ParticipantReducer);
  const [aGroupsAndStuds, setGroupsAndStudents] = useState([]);
  const [aGroupsAndStudsOg, setGroupsAndStudentsOg] = useState([]);
  const [aGroupsAndStudsCopy, setGroupsAndStudentsCopy] = useState([]);

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
    asgnmntId: gradeState?.oAsgnmntDtls?._id,
  };

  const goToNextPage = (grp) => {
    const curretstud = grp?.groupStudents.find(stud => (stud?.aSts === 'SUB' && Object.keys(stud?.sAsgmt)?.length))
    history.push({
        pathname: '/home-page/assgnmnt-grad-view', 
        state: AppState, 
        search:`?asCnId=${gradeState?.oAsgnmntDtls?._id}&studId=${curretstud?.studId}&isStud=${true}&actTab=${null}&isGrp=${true}&grpId=${grp?._id}`
    })
}

  const updateAsignmentContent = (contentId, grpId, status) => {
    const oContentPayload = {
      contentId: contentId,
      grpId: grpId,
      status: status,
    };
    dispatch(updateGroupContent(oContentPayload, oAssignmentPayload));
  };

  //remove grading for students when user clicks individual grading, to reset student grad
  const handleRemoveGrading = (index) => {
    const aCopyStuds = aGroupsAndStuds[index]?.groupStudents;
    if (aCopyStuds && aCopyStuds.length) {
      aCopyStuds.forEach((student, index) => {
        student.grad = "";
        student.mrkGrd = "";
        saveMark(student);
      });
    }
  }

  const handleIndvGrading = (grpIndx, status) => {
    handleRemoveGrading(grpIndx)
    const auxilaryGrpDetails = [...aGroupsAndStuds];
    const tempGrp = auxilaryGrpDetails.find((d, i) => i === grpIndx);
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
    setGroupsAndStudents(auxilaryGrpDetails.sort((a,b) => a.groupName.localeCompare(b.groupName)));
    if (gradeState?.oAsgnmntDtls && tempGrp) {
      updateAsignmentContent(
        gradeState?.oAsgnmntDtls?._id,
        tempGrp?._id,
        status
      );
    }
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
      const invalidMsg = t("translate:INVALID_POINTS")
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
            invalidMsg +
              " 0 - " +
              gradeState?.oAsgnmntDtls?.mxMrk;
            messageUtil.showWarning(invMsg, true, true);
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
    dispatch(updateStudentAssignment(oSaveRq, oAssignmentPayload, "studGrad"));
  };

  const handlePostStudMark = (id) => {
    if (id) {
      const oPostPayload = {
        _id: id,
        pstMrk: true,
      };
      dispatch(updateStudentAssignment(oPostPayload, oAssignmentPayload, "studGrad"));
    }
  };

  const handlePostGroupMarks = (index) => {
    const aGrpStuds = aGroupsAndStuds[index]?.groupStudents;
    if(aGrpStuds && aGrpStuds?.length){
      aGrpStuds.forEach((stud) =>
    handlePostStudMark(stud?._id))
    }

  }

  // handle multiple grade change **only applicable for groups
  const handleGradeChangeGrpSelect = (event, index) => {
    const aCopyStuds = aGroupsAndStuds[index]?.groupStudents;
    const grades = gradeState?.oAsgnmntDtls?.aGrades;

    const matchedGrade = grades.find((grd) => event.target.value === grd.Grade);

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
  };

  const handleSetGrpMarks = (value, grpId) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        s.mrkGrd = value
        return s
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  }

  const handleSaveMarkForGrp = (grpId) => {
   const currentGroup  = aGroupsAndStudsCopy.find((d) => d._id === grpId)
   if(currentGroup && currentGroup?.groupStudents.length){
    currentGroup?.groupStudents.forEach((stud) => {
      saveMark(stud)
    })
   }
  }

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

  const handleGetStudInpuValue = (student, key, isStud) => {
    const currentGroup = aGroupsAndStudsCopy.find((g) => g._id === student?.grpId)
    const currentStud = currentGroup?.groupStudents.find((s) => s.studId === student.studId)
    if(currentStud && currentStud[key] && !isStud){
      return currentStud[key]
    }
    if(isStud && student){
      return currentStud
    }
  }

  const handleGetGrpInputVal = (grpId, key, isStuds) => {
    const currentGroup = aGroupsAndStudsCopy.find((g) => g._id === grpId);
    if (isStuds && currentGroup?.groupStudents.length) {
      if (currentGroup?.groupStudents[0]?.[key]) {
        return currentGroup?.groupStudents[0]?.[key];
      }
    }
    if (currentGroup && currentGroup[key] && !isStuds) {
      return currentGroup[key];
    }
  };

  const handleShowStudentFeedback = (student, event, status) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === student?.grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        if (s?.studId === student?.studId) {
          if(event === 'show'){
            s.showFdBk = status;
          }
          if(event === 'edit'){
            s.editFdBk = status;
          }
        }
        return s;
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  }

  const handleShowGroupFeedback = (group, event, status) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === group?._id);
    if (tempGroup) {
      if (event === "show") {
        tempGroup.showFdBk = status;
      }
      if (event === "edit") {
        tempGroup.editFdBk = status;
      }

      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  };

  const handleGetCurrentGroup = (group) => {
    const oCurrentCopy = aGroupsAndStudsCopy.find(g => g._id === group._id)
    if(oCurrentCopy){
      return oCurrentCopy
    }else{
      return ''
    }
  }

  const handleStudentFeedbackChange = (event, student) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === student?.grpId);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
        if (s?.studId === student?.studId) {
          s.fdBk = event
        }
        return s;
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  }

  const handleGroupFeedbackChange = (event, group) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === group?._id);
    if (
      tempGroup &&
      tempGroup?.groupStudents &&
      tempGroup?.groupStudents.length
    ) {
      tempGroup.groupStudents.map((s) => {
          s.fdBk = event
        return s;
      });
      setGroupsAndStudentsCopy(auxilaryGroupData);
    }
  }

  const handlePostFeedback = (student) => {
    const oFeedBkPayload = {
      _id: student?._id,
      pstFdBk: true,
      fdBk: student?.fdBk,
    };
    dispatch(
      updateStudentAssignment(oFeedBkPayload, oAssignmentPayload, "studGrad")
    );
  };

  const handlePostGroupFeedback = (group) => {
    const auxilaryGroupData = [...aGroupsAndStudsCopy];
    const tempGroup = auxilaryGroupData.find((d) => d._id === group?._id);
    if(tempGroup?.groupStudents && tempGroup?.groupStudents.length){
      tempGroup.groupStudents.forEach((stud) =>{
        handlePostFeedback(stud)
      })
    }
  }

  const groupTableColumns = useMemo(() => [
    {
      id: "groupName",
      Header: t("translate:GROUP_NAME"),
      accessor: "groupName",
      sortType: "basic",
      Cell: ({ row }) => {
        return (
          <div className="stud-grad_list" onClick={() => {
            goToNextPage(row?.original)
          }}>
            <span className="stud-grad_name">{row.original.groupName}</span>
          </div>
        );
      },
    },
    {
      id: "students",
      Header: t("translate:STUDENTS"),
      accessor: "LNa",
      sortType: "basic",
      Cell: ({ row }) => (
        <div className="stud-grad_list" onClick={() => {}}>
          {row.original?.students?.length || 0}
        </div>
      ),
    },
    // {
    //     id: "AplnNum",
    //     Header: t("translate:ROLL_NO"),
    //     accessor: "AplnNum",
    //     sortType: "basic",
    //     Cell: ({ row }) => {
    //         return (
    //             <div className="stud-grad_list">
    //                 <span className="stud-grad_name_unimp">{row.original.AplnNum}</span>
    //             </div>
    //         );
    //     },
    // },
    {
      id: "grdSts",
      Header: t("translate:STATUS"),
      accessor: (row) =>
        {},
      sortType: "basic",
      Cell: ({ row }) => {
        return (
          <>
            {row.original?.groupStudents &&
            row.original?.groupStudents.length ? (
              row.original?.groupStudents.every((s) => s?.grdSts === "GRD") ? (
                <span className="grad-sub_content">
                  {t("translate:GRADED")}
                </span>
              ) : row.original?.groupStudents.some((s) => s.aSts === "SUB") ? (
                <span className="grad-sub_content">
                  {t("translate:SUBMITTED")}
                </span>
              ) : (
                <span className="grad-sub_content">
                  {t("translate:NOT_YET_SUBMITTED")}
                </span>
              )
            ) : (
              <span className="grad-sub_content">
                {t("translate:NOT_YET_SUBMITTED")}
              </span>
            )}
          </>
        );
      },
    },
    {
      id: "MoAt",
      Header: t("translate:LAST_MODIFIED"),
      accessor: (row) => moment(row.MoAt).unix(),
      Cell: ({ row }) => {
        return (
          <>
            {row.original.MoAt ? lmsDateAndTimeFormat(row.original.MoAt) : "-"}
          </>
        );
      },
      sortType: "basic",
    },
    {
      id: "gradeindiv",
      Header: t("translate:PARTICIPANT_GROUP_GRADE_INDIVIDUALY"),
      accessor: (row) => moment(row.MoAt).unix(),
      Cell: ({ row }) => {
        return (
          <>
            {!location.state?.isDisabledContent &&
            <CheckBox
              className="check-box"
              onChange={(event) => {
                handleIndvGrading(row.index, event.target.checked);
              }}
              checked={row.original?.indvGrd}
            />
           }
          </>
        );
      },
    },
    {
      id: "mrkGrd",
      Header: ({ row }) => {
        return (
          <>
            {gradeState?.oAsgnmntDtls &&
            gradeState?.oAsgnmntDtls.grdCnf &&
            gradeState?.oAsgnmntDtls.grdCnf === "POINT" ? (
              <>/{gradeState?.oAsgnmntDtls.mxMrk}</>
            ) : (
              ""
            )}
            {gradeState?.oAsgnmntDtls &&
            gradeState?.oAsgnmntDtls.grdCnf &&
            gradeState?.oAsgnmntDtls.grdCnf !== "POINT" ? (
              <>{gradeState?.oAsgnmntDtls.GrdSysNm}</>
            ) : (
              ""
            )}
          </>
        );
      },
      accessor: "mrkGrd",
      Cell: ({ row, column, onCellEdit }) => {
        const onChange = (e) => {
          onCellEdit(row.index, column.id);
          // this.setMark(e, row.index);
        };
        return (
          !location.state?.isDisabledContent ?
          <>
           {row?.original?.indvGrd ? "" :
            <div className="edit-marks">
              <InputBox
                className="input-table"
                value={handleGetGrpInputVal(row.original?._id, "mrkGrd", true)}
                onChange={(e) => handleSetGrpMarks(e.target.value, row.original._id)}
                onBlur={() => {handleSaveMarkForGrp(row.original?._id)}}
                defaultDisabled={row.original.isDrop}
              />
              {!row.original.isDrop &&
              gradeState?.oAsgnmntDtls &&
              gradeState?.oAsgnmntDtls.grdCnf &&
              gradeState?.oAsgnmntDtls.grdCnf !== "POINT" ? (
                <div className="stud-grade_lists">
                  <SelectControl
                    dropdownTheme="dropdown-round drop-down_round"
                    data={gradeState?.oAsgnmntDtls.aGrades}
                    onChange={(e) => {
                      onCellEdit(row.index, column.id);
                      handleGradeChangeGrpSelect(e, row.index);
                    }}
                  >
                    <ChevronDown className="svg-icon_small close-icon-network" />
                  </SelectControl>
                </div>
              ) : (
                ""
              )}
              {row.original?.groupStudents.every(s=> s?.grdSts !== "GRD") &&
              row.original?.groupStudents.every(s=> (s?.mrkGrd))
                ? (
                <div>
                  <Button
                    theme={!row.original?.groupStudents.every(s=> s?.grdSts) ? "btn-disable btn-rounded secondary-btn btn-left" : "btn-rounded secondary-btn btn-left"}
                    clicked={() => {
                      handlePostGroupMarks(row?.index)
                    }}
                    defaultDisabled={row.original.isDrop || !row.original?.groupStudents.every(s=> s?.grdSts)}
                  >
                    {t("translate:POST")}
                  </Button>
                </div>
              ) : (
               ""
              )}
              {row.original?.groupStudents.every(s=> s?.grdSts === "GRD") ? (
                <div className="post-align_content">
                  <p className="posted-info_label">{t("translate:POSTED")}</p>
                </div>
              ) : (
                ""
              )}
            </div>
          }
          </>
          : <>
          <div className="edit-marks">
              <InputBox
                className="input-table"
                value={handleGetGrpInputVal(row.original?._id, "mrkGrd", true)}
                defaultDisabled={true}
              />
            </div>
          </>
        );
      },
    },
    {
      id: "fdBk",
      Header: t("translate:FEEDBACK_CAP"),
      accessor: "fdBk",
      sortType: "basic",
      disableSortBy: true,
      Cell: ({ row }) => {
        const currentOriginal = handleGetCurrentGroup(
          row.original
        );
        const currentFeedback = currentOriginal?.groupStudents.find(d => d.fdBk)
        return !row.original?.indvGrd ? (
          <>
            <div>
              {(row.original.editFdBk || row.original.showFdBk) && (
                <div className="message-discussion_icon">
                  <MessageSelect iconStyle="svg-icon_small icon-dark icon-pointer" />
                </div>
              )}
              {currentOriginal?.groupStudents.some(f => f?.fdBk) &&
                !currentOriginal.showFdBk &&
                !currentOriginal.editFdBk && (
                  <div
                    onClick={() => {
                      handleShowGroupFeedback(row.original, "show", true);
                    }}
                  >
                    <div className="message-discussion_icon">
                      <MessagePost iconStyle="svg-icon_small icon-dark icon-pointer" />
                    </div>
                  </div>
                )}
              {
                currentOriginal?.groupStudents.every(f => !f?.fdBk) &&
                !currentOriginal?.showFdBk &&
                !currentOriginal?.editFdBk && (
                  !location.state?.isDisabledContent ?
                  <div
                    onClick={() => {
                      handleShowGroupFeedback(row.original, "edit", true);
                    }}
                  >
                    <div className="message-discussion_icon">
                      <MessageAdd iconStyle="svg-icon_small icon-dark icon-pointer" />
                    </div>
                  </div> : <></>
                )}
                
            </div>
            <div>
              {row.original.editFdBk && (
                <div
                  class="dropdown-menu feedback-content"
                  style={{
                    display: row.original.editFdBk ? "block" : "none",
                  }}
                >
                  <p className="feedback-label">
                    {t("translate:FEEDBACK_FOR_STUDENTS")}
                  </p>
                  <TextArea
                    className="text-area_table"
                    value={currentFeedback?.fdBk}
                    onChange={(e) => {
                      handleGroupFeedbackChange(
                        e.target.value,
                        row.original
                      );
                    }}
                    defaultDisabled={location.state?.isDisabledContent}
                  />
                  <div className="feedback-buttons">
                    <Button
                      theme="btn-rounded secondary-btn"
                      clicked={() => {
                        handleShowGroupFeedback(
                          row.original,
                          "edit",
                          false
                        );
                      }}
                    >
                      {t("translate:CANCEL")}
                    </Button>
                    {!location.state?.isDisabledContent &&
                    <Button
                      theme="btn-rounded default btn-left"
                      clicked={(e) => {
                        handlePostGroupFeedback(row?.original);
                        handleShowGroupFeedback(
                          row.original,
                          "edit",
                          false
                        );
                      }}
                    >
                      {t("translate:POST_FEEDBACK")}
                    </Button>
                    }
                  </div>
                </div>
              )}
              {row.original.showFdBk && (
                <div
                  class="dropdown-menu feedback-content_edit"
                  style={{
                    display: row.original.showFdBk ? "block" : "none",
                  }}
                >
                  <div className="edit-feedback_dismiss">
                    <p className="feedback-label_edit">
                      {t("translate:FEEDBACK_FOR_STUDENTS")}
                    </p>
                    <div
                      onClick={() => {
                        handleShowGroupFeedback(
                          row.original,
                          "show",
                          false
                        );
                      }}
                    >
                      <X className="svg-icon_small icon-dark icon-pointer" />
                    </div>
                  </div>

                  <div className="stud-feedback_edit">
                    <div className="stud-feedback_info">
                    <p className="edit-info_label">{currentFeedback?.fdBk}</p>
                    </div>
                    <div className='ml-auto' >
                    {!row.original.isDrop && !location.state?.isDisabledContent ? (
                      <Edit
                        onClick={() => {
                          handleShowGroupFeedback(
                            row.original,
                            "edit",
                            true
                          );
                          handleShowGroupFeedback(
                            row.original,
                            "show",
                            false
                          );
                        }}
                        className="svg-icon_small icon-dark icon-pointer"
                      />
                    ): <></>}
                    </div>
                  </div>
                  <p className="edit-info_date">
                    {currentFeedback?.fdBkOn
                      ? lmsDateAndTimeFormat(currentFeedback.fdBkOn)
                      : ""}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          ""
        );
      },
    },
  ],[aGroupsAndStuds])

  const studentTableColumns = useMemo(
    () => [
      {
        id: "PhotoImgID",
        Header: "",
        accessor: "PhotoImgID",
        sortType: "basic",
        disableSortBy: true,
        Cell: ({ row }) => {
          return (
            <div className="stud-grad_list">
              <div className="d-flex align-items-baseline">
                {row.original.PhotoImgID &&
                row.original.PhotoImgID.length > 0 ? (
                  <img
                    src={"/Image/getImage/" + row.original.PhotoImgID}
                    className="stud-img_list"
                    alt="img"
                  />
                ) : (
                  row.original &&
                  row.original.FNa && (
                    <StudentNameComponent
                      className="student-name_icon"
                      fName={row.original.FNa.substring(0, 1)}
                      clrCode={generateHexDecCode(row.original.studId)}
                    />
                  )
                )}
                {row.original.FNa} {row.original.LNa} 
              </div>
            </div>
          );
        },
      },
      {
        id: "FNa",
        Header: t("translate:STUDENTS"),
        accessor: "FNa",
        sortType: "basic",
        Cell: ({ row }) => "",
      },
      // {
      //   id: "FNa1",
      //   Header: t("translate:STATUS"),
      //   accessor: "FNa",
      //   sortType: "basic",
      //   Cell: ({ row }) => "",
      // },
      // {
      //   id: "FNa2",
      //   Header: t("translate:LAST_MODIFIED"),
      //   accessor: "FNa",
      //   sortType: "basic",
      //   Cell: ({ row }) => "",
      // },
      // {
      //   id: "FNa3",
      //   Header: t("translate:LAST_MODIFIED"),
      //   accessor: "FNa",
      //   sortType: "basic",
      //   Cell: ({ row }) => "",
      // },
      {
        id: "FNa4",
        Header: t("translate:LAST_MODIFIED"),
        accessor: "FNa",
        sortType: "basic",
        Cell: ({ row }) => "",
      },
      {
        id: "FNa5",
        Header: t("translate:LAST_MODIFIED"),
        accessor: "FNa",
        sortType: "basic",
        Cell: ({ row }) => "",
      },
      {
        id: "mrkGrd",
        Header: ({ row }) => {
          return (
            <>
              {gradeState?.oAsgnmntDtls &&
              gradeState?.oAsgnmntDtls.grdCnf &&
              gradeState?.oAsgnmntDtls.grdCnf === "POINT" ? (
                <>/{gradeState?.oAsgnmntDtls.mxMrk}</>
              ) : (
                ""
              )}
              {gradeState?.oAsgnmntDtls &&
              gradeState?.oAsgnmntDtls.grdCnf &&
              gradeState?.oAsgnmntDtls.grdCnf !== "POINT" ? (
                <>{gradeState?.oAsgnmntDtls.GrdSysNm}</>
              ) : (
                ""
              )}
            </>
          );
        },
        accessor: "mrkGrd",
        Cell: ({ row, column, onCellEdit }) => {
          if (row?.original?.indvGrd) {
            return !location.state?.isDisabledContent ? (
              <>
                <div className="edit-marks">
                  <InputBox
                    className="input-table"
                    value={handleGetStudInpuValue(row.original, "mrkGrd")}
                    onChange={(e) => {
                      handleSetStudentMarks(e.target?.value, row.original);
                    }}
                    onBlur={() => {
                      saveMark(
                        handleGetStudInpuValue(row.original, null, true)
                      );
                    }}
                    defaultDisabled={row.original.isDrop}
                  />
                  {!row.original.isDrop &&
                  gradeState?.oAsgnmntDtls &&
                  gradeState?.oAsgnmntDtls.grdCnf &&
                  gradeState?.oAsgnmntDtls.grdCnf !== "POINT" ? (
                    <div className="stud-grade_lists">
                      <SelectControl
                        dropdownTheme="dropdown-round drop-down_round"
                        data={gradeState?.oAsgnmntDtls.aGrades}
                        onChange={(e) => {
                          handleStudentGradeChange(e, row?.original);
                        }}
                      >
                        <ChevronDown className="svg-icon_small close-icon-network" />
                      </SelectControl>
                    </div>
                  ) : (
                    ""
                  )}
                  {/* {(gradeState?.oAsgnmntDtls && gradeState?.oAsgnmntDtls.grdCnf && gradeState?.oAsgnmntDtls.grdCnf === "POINT" && gradeState?.oAsgnmntDtls.mxMrk) && <span className="grad-sub_content">/{gradeState?.oAsgnmntDtls.mxMrk}</span>} */}
                  {(!row.original.grdSts ||
                    (row.original.grdSts && row.original.grdSts !== "GRD")) &&
                  (row.original.mrkGrd ||
                    row.original.mrkGrd === "0" ||
                    row.original.mrkGrd === 0) ? (
                    <div>
                      <Button
                        theme={(!row.original.grdSts ||
                          row.original.grdSts === "GRD") ? "btn-disable btn-rounded secondary-btn btn-left" : "btn-rounded secondary-btn btn-left"}
                        clicked={() => {
                          handlePostStudMark(row.original?._id);
                        }}
                        defaultDisabled={row.original.isDrop || !row.original.grdSts ||
                          row.original.grdSts === "GRD"}
                      >
                        {t("translate:POST")}
                      </Button>
                    </div>
                  ) : (
                    ""
                  )}
                  {!row.original.isDrop &&
                  row.original.grdSts &&
                  row.original.grdSts === "GRD" ? (
                    <div className="post-align_content">
                      {/* <Edit2 className="svg-icon_small icon-dark icon-space_right" /> */}
                      <p className="posted-info_label">
                        {t("translate:POSTED")}
                      </p>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="edit-marks">
                  <InputBox
                    className="input-table"
                    value={handleGetStudInpuValue(row.original, "mrkGrd")}
                    defaultDisabled={true}
                  />
                </div>
              </>
            );
          } else {
            return "";
          }
        },
      },
      {
        id: "fdBk",
        Header: t("translate:FEEDBACK_CAP"),
        accessor: "fdBk",
        sortType: "basic",
        disableSortBy: true,
        Cell: ({ row }) => {
          const currentOriginal = handleGetStudInpuValue(
            row.original,
            null,
            true
          );
          return row.original?.indvGrd ? (
            <>
              <div>
                {(row.original.editFdBk || row.original.showFdBk) && (
                  <div className="message-discussion_icon">
                    <MessageSelect iconStyle="svg-icon_small icon-dark icon-pointer" />
                  </div>
                )}
                {row.original.fdBk &&
                  !currentOriginal.showFdBk &&
                  !currentOriginal.editFdBk && (
                    <div
                      onClick={() => {
                        handleShowStudentFeedback(row.original, "show", true);
                      }}
                    >
                      <div className="message-discussion_icon">
                        <MessagePost iconStyle="svg-icon_small icon-dark icon-pointer" />
                      </div>
                    </div>
                  )}
                {!row.original.isDrop &&
                  !row.original.fdBk &&
                  !currentOriginal.showFdBk &&
                  !currentOriginal.editFdBk && (
                    <div
                      onClick={() => {
                        handleShowStudentFeedback(row.original, "edit", true);
                      }}
                    >
                      <div className="message-discussion_icon">
                        <MessageAdd iconStyle="svg-icon_small icon-dark icon-pointer" />
                      </div>
                    </div>
                  )}
                {row.original.isDrop &&
                  !row.original.fdBk &&
                  !currentOriginal.showFdBk &&
                  !currentOriginal.editFdBk && (
                    <div>
                      <div className="message-discussion_icon">
                        <MessageHide iconStyle="svg-icon_small icon-dark" />
                      </div>
                    </div>
                  )}
              </div>
              <div>
                {row.original.editFdBk && (
                  <div
                    class="dropdown-menu feedback-content"
                    style={{
                      display: row.original.editFdBk ? "block" : "none",
                    }}
                  >
                    <p className="feedback-label">
                      {t("translate:FEEDBACK_FOR_STUDENT")}
                    </p>
                    <TextArea
                      className="text-area_table"
                      value={handleGetStudInpuValue(row.original, "fdBk")}
                      onChange={(e) => {
                        handleStudentFeedbackChange(
                          e.target.value,
                          row.original
                        );
                      }}
                    />
                    <div className="feedback-buttons">
                      <Button
                        theme="btn-rounded secondary-btn"
                        clicked={() => {
                          handleShowStudentFeedback(
                            row.original,
                            "edit",
                            false
                          );
                        }}
                      >
                        {t("translate:CANCEL")}
                      </Button>
                      <Button
                        theme="btn-rounded default btn-left"
                        clicked={(e) => {
                          handlePostFeedback(currentOriginal);
                          handleShowStudentFeedback(
                            row.original,
                            "edit",
                            false
                          );
                        }}
                      >
                        {t("translate:POST_FEEDBACK")}
                      </Button>
                    </div>
                  </div>
                )}
                {row.original.showFdBk && (
                  <div
                    class="dropdown-menu feedback-content_edit"
                    style={{
                      display: row.original.showFdBk ? "block" : "none",
                    }}
                  >
                    <div className="edit-feedback_dismiss">
                      <p className="feedback-label_edit">
                        {t("translate:FEEDBACK_FOR_STUDENT")}
                      </p>
                      <div
                        onClick={() => {
                          handleShowStudentFeedback(
                            row.original,
                            "show",
                            false
                          );
                        }}
                      >
                        <X className="svg-icon_small icon-dark icon-pointer" />
                      </div>
                    </div>

                    <div className="stud-feedback_edit">
                      <div className="stud-feedback_info">
                        {row.original.PhotoImgID &&
                        row.original.PhotoImgID.length > 0 ? (
                          <img
                            src={"/Image/getImage/" + row.original.PhotoImgID}
                            className="stud-img_list"
                            alt="img"
                          />
                        ) : (
                          <StudentNameComponent
                            className="student-name_icon"
                            fName={row.original.FNa.substring(0, 1)}
                            clrCode={generateHexDecCode(row.original.studId)}
                          />
                        )}
                        <p className="edit-stud_name">{row.original.studNm}</p>
                      </div>
                      {!row.original.isDrop && !location.state?.isDisabledContent ? (
                        <Edit
                          onClick={() => {
                            handleShowStudentFeedback(
                              row.original,
                              "edit",
                              true
                            );
                            handleShowStudentFeedback(
                              row.original,
                              "show",
                              false
                            );
                          }}
                          className="svg-icon_small icon-dark icon-pointer"
                        />
                      ): <></>}
                    </div>
                    <p className="edit-info_label">{row.original.fdBk}</p>
                    <p className="edit-info_date">
                      {row.original.fdBkOn
                        ? lmsDateAndTimeFormat(row.original.fdBkOn)
                        : ""}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            ""
          );
        },
      },
    ],
    [aGroupsAndStuds]
  );

  useEffect(() => {
    dispatch(getAllParticipantGroups(oCommonPayload));
  }, []);

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
                  grpId: grpstud?._id
                });
              }
            });
            grpstud.groupStudents = grpAsgnmtStuds;
          }
          return grpstud;
        });

        // setGroupsAndStudents([...resolvedGrpStuds]);
        setGroupsAndStudentsCopy(resolvedGrpStuds);
        setGroupsAndStudentsOg(resolvedGrpStuds.sort((a,b) => a.groupName.localeCompare(b.groupName)))
      } else {
        setGroupsAndStudents([]);
        setGroupsAndStudentsCopy([])
      }
    }
  }, [participantState?.participantGroups, gradeState?.oAsgnmntDtls?.grpIds]);

  useEffect(() => {
    console.log("gradeType", gradeType)
    if(gradeType === 'ALL'){
      setGroupsAndStudents(aGroupsAndStudsOg.sort((a,b) => b.groupName.localeCompare(a.groupName)))
    }
    if(gradeType === 'GRD'){
      setGroupsAndStudents(aGroupsAndStudsOg.filter((grp) => {
        if(grp?.groupStudents && grp.groupStudents.length){
          console.log('grp.students', grp.groupStudents)
          if(grp.groupStudents.every(s => s?.grdSts === 'GRD')){
            return grp
          }
        }
      }))
    }
    if(gradeType === 'NG'){
      setGroupsAndStudents(aGroupsAndStudsOg.filter((grp) => {
        if(grp?.groupStudents && grp.groupStudents.length){
          if(grp.groupStudents.some(s => s?.grdSts !== 'GRD')){
            return grp
          }
        }
      }))
    }
  },[gradeType, aGroupsAndStudsOg]);
 

  return (
    <div>
      <div className="student-grade_container">
        <div className="student-table_search">
          {gradeState.totStudCount > 0 && (
            <div class="row m-0">
              <div class="col-6 p-0">
                <div className="cont-search-box">
                  <SearchBox
                    searchBoxTheme="search-default search-box_default search-outline"
                    placeholder="Search"
                    value={""}
                    onChange={(event) => {}}
                  />
                </div>
              </div>
              <div class="col-6 p-0">
                {gradeState.oAsgnmntDtls &&
                gradeState.oAsgnmntDtls?.toPstCnt ? (
                  <div className="grade-post">
                    <div onClick={() => {}}>
                      <Button theme="btn-rounded secondary-btn">
                        <span>
                          {t("translate:POST_ALL")}{" "}
                          {gradeState.oAsgnmntDtls?.toPstCnt}{" "}
                          {t("translate:POST_ALL_GRADES")}
                        </span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          )}
        </div>
        {
        gradeState?.aStudents &&
        gradeState?.aStudents.length > 0 &&
        gradeState.oAsgnmntDtls?.isGroup &&
        aGroupsAndStuds.length ? (
          <div className="table-list_container">
            <Table
              data={aGroupsAndStuds}
              columns={groupTableColumns}
              isNested={true}
              t={t}
              nestedColumns={studentTableColumns}
              nestedKey="groupStudents"
              defaultSortBy="studNm"
              disablePagination={true}
            />
          </div>
        ) : (
          <NoRecord
            img={no_grade_book}
            imgSize="no-data_img-default"
            gradAsgnContent={actTab}
          />
        )}
      </div>
    </div>
  );
}


export default GroupGradeList;