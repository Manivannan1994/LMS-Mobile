import React, { lazy, useEffect, useState } from "react";
import "../../styles/_participantsListStyle.scss";
import { useTranslation } from "react-i18next";
import { Plus, MoreVertical, AlertCircle } from "react-feather";
import Searchbox from "../searchbox/Searchbox";
import Accordion from "../accordion/Accordion";
import { useLocation } from "react-router-dom";
import {
  createParticipantGroup,
  getAllParticipantGroups,
  deleteParticipantGroup,
  updatePartGroup,
  deletePartGroupStudent,
} from "../../store/actions/ParticipantsAction";
import { useDispatch, useSelector } from "react-redux";
import AddEditParticipantGroupModal from "./AddEditParticipantGroupModal";
import DeleteParticipantGroupModal from "./DeleteParticipantGroupModal";
import Table from "../table/Table";
import AddGroupStudentModal from "./AddGroupStudentModal";
import { generateHexDecCode, lmsDateFormat } from "../../utils/helper";
import StudentNameComponent from "../student-name/StudentName";
import RemoveGroupStudentModal from "./RemoveGroupStudentModal";

const Button = lazy(() => import("../button/Button"));

const ParticipantsGroup = ({ componentProp, aStudents, gradebookState }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useDispatch();
  const CurrentState = useSelector((state) => state.ParticipantReducer);
  const AppState = location.state;
  const AppSession = componentProp?.session;
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [groupNameValue, setGroupNameValue] = useState("");
  const [openIndex, setOpenIndex] = useState([]);
  const [aParticipantGroups, setParticipantGroups] = useState([]);
  const [aParticipantGroupsCopy, setParticipantGroupsCopy] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [aStudentList, setStudentList] = useState([]);
  const [aStudentListCopy, setStudentListCopy] = useState([]);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [aOutOfGrpStuds, setOutOfGrpStuds] = useState([]);
  const [grpSearch, setGrpSearch] = useState('');
  const [showRemoveStudModal, setShowRemoveStudModal] = useState(false);
  const [studToRemove, setStudToRemove] = useState('')

  const oCommonPayload = {
    PrID: AppState?.PrID,
    CrID: AppState?.CrID,
    DeptID: AppState?.DeptID,
    SemID: AppState?.SemID,
    AcYr: AppState?.AcYr,
    SecID: AppState?.SecID,
    SubjId: AppState?.subId,
  };
  const toggleAccordion = (index) => {
    if (openIndex.some((i) => i === index)) {
      setOpenIndex(openIndex.filter((i) => i !== index));
    } else {
      setOpenIndex([...openIndex, index]);
    }
  };

  const handleGetParticipantGroups = () => {
    dispatch(getAllParticipantGroups(oCommonPayload));
  };

  const handleCreateParticipantGroup = () => {
    const oPayload = {
      PrID: AppState.PrID,
      CrID: AppState.CrID,
      DeptID: AppState.DeptID,
      SemID: AppState.SemID,
      AcYr: AppState.AcYr,
      SecID: AppState.SecID,
      SubjId: AppState.subId,
      groupName: groupNameValue,
    };
    dispatch(createParticipantGroup(oPayload));
    setShowAddGroup(!showAddGroup);
    setGroupNameValue("");
    handleGetParticipantGroups();
  };

  const handleDeleteGroup = () => {
    dispatch(deleteParticipantGroup(selectedGroup?._id, oCommonPayload));
    setShowDeleteGroup(!showDeleteGroup);
    setSelectedGroup({});
  };

  const handleUpdateGroup = () => {
    const oPayload = {
      groupName: groupNameValue,
    };
    dispatch(updatePartGroup(selectedGroup?._id, oPayload, oCommonPayload));
    setShowAddGroup(!showAddGroup);
    setSelectedGroup({});
    setGroupNameValue("");
    setIsEdit(!isEdit);
  };

  useEffect(() => {
    handleGetParticipantGroups();
    //eslint-disable-next-line
  }, []);

  const handleResolveStudents = (students, groups) => {
    const tempStudents = JSON.parse(JSON.stringify(students));
    const tempGroups = groups;
    tempGroups.map((grp) => {
      if (grp.students.length) {
        grp.students = grp.students.map((stud) => {
          const currentStud = tempStudents.find((t) => t.StuID === stud.studId);
          if (currentStud) {
            currentStud.isAdded = true;
            currentStud.groupName = grp?.groupName;
            return { ...stud};
          } else {
            return { ...stud, isAdded: false, groupName: "" };
          }
        });
        return grp;
      }
    });
    setParticipantGroups(tempGroups.sort((a,b) => a.groupName.localeCompare(b.groupName)));
    setParticipantGroupsCopy(tempGroups.sort((a,b) => a.groupName.localeCompare(b.groupName)))
    setStudentList(tempStudents);
    setStudentListCopy(tempStudents.map((s => ({...s,studName:`${s?.FNa} ${s?.LNa}`}))));
  };


  useEffect(() => {
    if (aStudents.length && CurrentState?.participantGroups.length) {
      handleResolveStudents(aStudents, CurrentState?.participantGroups);
    } else {
      setParticipantGroups(CurrentState?.participantGroups);
      setParticipantGroupsCopy(CurrentState?.participantGroups)
    }
  }, [aStudents, CurrentState]);

  useEffect(() => {
    if (aStudentListCopy && aStudentListCopy?.length) {
      setOutOfGrpStuds(aStudentListCopy.filter((s) => !s?.isAdded));
    }
  }, [aStudentListCopy]);

  
  const checkForSubmissionCountForGrp = (groupId, grpStudents) => {
    const studentIds =
      grpStudents && grpStudents?.length
        ? grpStudents.map((s) => s.studId)
        : [];

    const filterByGrpId = (array, targetGrpId) => {
      return array.filter((item) =>
      item.asgmnt?.grpIds && item.asgmnt?.grpIds.some((grp) => grp.grpId === targetGrpId)
      );
    };

    const hasSubmittedStudents = (filteredArray) => {
      return filteredArray.some((item) =>item?.vSts === 'F');
    };

    if (
      gradebookState &&
      gradebookState.length &&
      groupId
    ) {
      const filteredData = filterByGrpId(gradebookState, groupId);
      if (filteredData && filteredData.length) {
        console.log('filteredData', filteredData)
        const hasSubmissions = hasSubmittedStudents(filteredData);
        console.log("hasSubmissions",groupId, hasSubmissions)
        return hasSubmissions;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  const handleReturnSubmissionState = (grpId) => {
    if(grpId){
      const currentGrp = aParticipantGroups.find((g) => g._id === grpId)
      if(currentGrp && currentGrp?.students && currentGrp?.students?.length){
        return checkForSubmissionCountForGrp(grpId, currentGrp?.students)
      } else{
        return false
      }
    }else{
      return false;
    }
  }

  const groupStudentTableColumns = React.useMemo(
    () => [
      {
        id: "name",
        Header: t("translate:FULL_NAME"),
        accessor: "FNa",
        sortType: "basic",
        Cell: ({ row }) => {
          return (
            <>
              {row.original.FNa} {row.original.LNa}
            </>
          );
        },
      },
      {
        id: "AplnNum",
        Header: t("translate:ROLL_NO"),
        accessor: (row) => row.AplnNum || "-",
        sortType: "basic",
      },
      {
        id: "CnEmail",
        Header: t("translate:EMAIL"),
        accessor: (row) => row.CnEmail || "-",
      },
      {
        id: "CrAt",
        Header: t("translate:PARTICIPANT_GROUP_STUDENT_ADDED_ON"),
        accessor: (row) => (row?.CrAt ? lmsDateFormat(row?.CrAt) : ""),
        canSort: false,
      },
      {
        id: "action",
        Header: " ",
        canSort: false,
        accessor: (row ) => 
         !handleReturnSubmissionState(row?.grpId) ?
           !location.state?.isDisabledContent ?
            <div className="view-option_cont d-flex">
              <div
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                className="option-dropdown ml-auto"
              >
                <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
              </div>
              <div class="dropdown-menu view-options_cont_participant">
                <div
                  class="dropdown-item user-info_contents text-danger"
                  onClick={() => {
                    setShowRemoveStudModal(!showRemoveStudModal)
                    setStudToRemove(row)
                    // handleRemoveStudent(row);
                  }}
                >
                  {t("translate:PARTICIPANT_GROUP_REMOVE_STUDENT")}
                </div>
              </div>
            </div>
          : <></>
          :<></>
        },
    ],
    [selectedGroup, aStudentList, [...aParticipantGroups]]
  );

 
  useEffect(() => {
    if (grpSearch) {
      setParticipantGroups(
		aParticipantGroupsCopy.filter((g) => 
			g?.groupName?.toLowerCase().replace(/\s+/g, '').includes(grpSearch.toLowerCase().replace(/\s+/g, ''))
		)
      );
    } else {
      setParticipantGroups(aParticipantGroupsCopy);
    }
  }, [grpSearch]);

  return (
    <>
      <div className="student-participants_search">
        <div class="row m-1 mb-2 justify-content-between">
          <div class="col-6 p-0">
            <div className="cont-search-box">
              <Searchbox
                placeholder="Search"
                searchBoxTheme="search-default search-box_default search-outline"
                value={grpSearch}
                onChange={(e) => {
                  setGrpSearch(e.target.value);
                }}
              />
            </div>
          </div>
          <div class="col-6 p-0">
            <div class="d-flex m-0">
              {!location.state?.isDisabledContent &&
              <div className="ms-auto" style={{ marginLeft: "auto" }}>
                <Button
                  theme="btn-rounded default"
                  clicked={() => {
                    setShowAddGroup(!showAddGroup);
                  }}
                >
                  <Plus className="svg-icon_small icon-white" />
                  {t("translate:NEW_GROUP")}
                </Button>{" "}
              </div>
              }
              {/* <div className="mt-2">
                <div className="view-option_cont">
                  <div
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    className="option-dropdown"
                  >
                    <i class="header-options">
                      <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
                    </i>
                  </div>
                  <div class="dropdown-menu view-options_cont">
                    <div
                      class="dropdown-item user-info_contents"
                      onClick={() => {}}
                    >
                      <span className="view-options_dropdown">
                        {t("translate:IMPORT_CONTENT")}
                      </span>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
        <div className="groups_container">
          {!!aOutOfGrpStuds?.length && !!aParticipantGroups?.length && (
            <div className="d-flex students_left_container my-2 pt-2 pl-2">
              <AlertCircle className="svg-icon_small icon-primary" />
              <label for="fname" className="form-lable ml-1">
                {aOutOfGrpStuds?.length}{" "}
                {t("translate:PARTICIPANT_GROUP_STUDENTS_WASNT_ADDED")}
              </label>
              <div className="view-option_cont">
                <div
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  className="option-dropdown"
                >
                  <p className="group-info-label-link ml-1">View Students</p>
                </div>
                <div class="dropdown-menu view-options_cont_studs">
                  {aOutOfGrpStuds.map((stud) => (
                    <div class="dropdown-item user-info_contents">
                      <span className="view-options_dropdown">
                        <StudentNameComponent
                          className="student-name_icon"
                          fName={stud?.FNa.substring(0, 1)}
                          clrCode={generateHexDecCode(stud?.studId)}
                        />{" "}
                        {stud?.AplnNum} - {stud?.FNa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!!aParticipantGroups.length ? (
            aParticipantGroups.map((item, i) => (
              <Accordion
                title={
                  <div className="row h-100">
                    <div className="col-3 ">
                      <div className="group-name">{item?.groupName}</div>
                    </div>
                    <div className="col-3 group-label ">
                      {item?.students?.length ? item?.students?.length : 0}{" "}
                      members
                    </div>
                    <div className="col-4 group-stud-names ">
                      {item?.students?.length && aStudents?.length ? (
                        `${item?.students
                          .map((s) => s?.FNa + " " + s?.LNa)
                          .splice(0, 4)
                          .join(", ")} ${
                          item.students.length > 4
                            ? ` +${item?.students.length - 4} more`
                            : ""
                        }`
                      ) : (
                        <></>
                      )}
                    </div>
                    {!location.state?.isDisabledContent &&
                    <div className="col-2 ">
                      <div className="d-flex flex-row">
                        <div className="ml-auto">
                          {!checkForSubmissionCountForGrp(
                            item?._id,
                            item?.students
                          ) && (
                            <Plus
                              onClick={() => {
                                setSelectedGroup(item);
                                setShowAddStudents(!showAddStudents);
                                setStudentList(aStudentListCopy)
                              }}
                              className="svg-icon_small icon-dark icon-pointer"
                            />
                          )}
                        </div>

                        <div className="ml-2">
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
                            <div class="dropdown-menu view-options_cont">
                              <div
                                class="dropdown-item user-info_contents"
                                onClick={() => {
                                  setIsEdit(!isEdit);
                                  setSelectedGroup(item);
                                  setGroupNameValue(item?.groupName);
                                  setShowAddGroup(!showAddGroup);
                                }}
                              >
                                <span className="view-options_dropdown">
                                  {t("translate:PARTICIPANT_GROUP_EDIT_GROUP")}
                                </span>
                              </div>
                              <div
                                hidden={checkForSubmissionCountForGrp(
                                  item?._id,
                                  item?.students
                                )}
                                class="dropdown-item user-info_contents"
                                onClick={() => {
                                  setSelectedGroup(item);
                                  setShowDeleteGroup(!showDeleteGroup);
                                }}
                              >
                                <span className="view-options_dropdown text-danger">
                                  {t(
                                    "translate:PARTICIPANT_GROUP_DELETE_GROUP"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                }
                  </div>
                }
                key={item?._id}
                index={i}
                content={
                  item?.students.length ? (
                    <Table
                      data={item?.students}
                      columns={groupStudentTableColumns}
                      defaultSortBy="name"
                      sortDesc={false}
                      disablePagination={true}
                    />
                  ) : (
                    <div className="p-1 group-alert-box">
                      <div className="group-alert-info pl-1">
                        <AlertCircle className="svg-icon_small icon-primary" />
                        <span className="group-alert_label">
                          {t("translate:PARTICIPANT_GROUP_NO_STUDENTS_YET")}
                        </span>
                      </div>
                    </div>
                  )
                }
                openIndex={openIndex}
                toggle={toggleAccordion}
              />
            ))
          ) : (
            <div className="participant-empty_cont">
              <p>{t("translate:PARTICIPANT_GROUP_EMPTY")}</p>
            </div>
          )}
        </div>
      </div>

      <AddEditParticipantGroupModal
        showAddGroup={showAddGroup}
        setShowAddGroup={setShowAddGroup}
        setGroupNameValue={setGroupNameValue}
        groupNameValue={groupNameValue}
        handleCreateParticipantGroup={handleCreateParticipantGroup}
        setIsEdit={setIsEdit}
        isEdit={isEdit}
        handleUpdateGroup={handleUpdateGroup}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />
      <DeleteParticipantGroupModal
        setShowDeleteGroup={setShowDeleteGroup}
        showDeleteGroup={showDeleteGroup}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        handleDeleteGroup={handleDeleteGroup}
      />
      <AddGroupStudentModal
        aStudentListCopy={aStudentListCopy}
        setStudentList={setStudentList}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        aStudentList={aStudentList}
        showAddStudents={showAddStudents}
        setShowAddStudents={setShowAddStudents}
        aParticipantGroups={aParticipantGroups}
        oCommonPayload={oCommonPayload}
      />
      <RemoveGroupStudentModal
        studToRemove={studToRemove}
        setStudToRemove={setStudToRemove}
        showModal={showRemoveStudModal}
        setShowModal={setShowRemoveStudModal}
        oCommonPayload={oCommonPayload}
      />
    </>
  );
};

export default ParticipantsGroup;
