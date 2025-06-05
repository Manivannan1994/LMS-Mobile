import React from "react";
import LmsModal from "../modal/LmsModal";
import InputBox from "../input-box/InputBox";
import { useTranslation } from "react-i18next";
import Searchbox from "../searchbox/Searchbox";
import Table from "../table/Table";
import { addGroupStudent } from "../../store/actions/ParticipantsAction";
import { useDispatch } from "react-redux";

const AddGroupStudentModal = ({
  setSelectedGroup,
  selectedGroup,
  aStudentList,
  aStudentListCopy,
  setStudentList,
  showAddStudents,
  setShowAddStudents,
  aParticipantGroups,
  oCommonPayload
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleSearch = (searchkey) => {
    if(searchkey){
      setStudentList(
          aStudentListCopy.filter(
          (stud) =>
            stud?.FNa.toLowerCase().includes(searchkey.toLowerCase()) ||
            stud?.studName.toLowerCase().includes(searchkey.toLowerCase()) ||
            stud?.AplnNum.toLowerCase().includes(searchkey.toLowerCase())
        )
      );
    }else{
      setStudentList(aStudentListCopy)
    }
  };


  const handleAddStudent = (studId) => {
    const oPayload = {
      grpId: selectedGroup?._id,
      studId: studId,
      ...oCommonPayload
    };
    if(oPayload?.grpId && oPayload?.studId){
    dispatch(addGroupStudent(oPayload));
    }
  };


  const particpantTableColumns = React.useMemo(
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
        id: "btn",
        Header: " ",
        accessor: (row) => (
            !row?.isAdded ? 
          <p onClick={() => handleAddStudent(row?.StuID)} className="icon-pointer text-primary"> {t("translate:ADD")}</p>
          : <div className='group-label'>
            {t('translate:PARTICIPANT_GROUP_ADDED')}<br/>
            {row?.groupName}
          </div>
        ),
        canSort: false,
      },
    ],
    [selectedGroup, aStudentList, aParticipantGroups, showAddStudents]
  );

  return (
    <>
      <LmsModal
        open={showAddStudents}
        onClose={() => {
          setShowAddStudents(!showAddStudents);
          setSelectedGroup({});
        }}
        modalTitle={`${t("translate:PARTICIPANT_GROUP_ADD_STUDENT")} ${
          selectedGroup?.groupName
        }`}
        // aCustomBtns={[
        //   {
        //     name: "CANCEL",
        //     onClick: () => {
        //         setShowDeleteGroup(!showDeleteGroup)
        //         setSelectedGroup({})
        //     },
        //     className: "secondary-btn btn-outline",
        //   },
        //   {
        //     name: "DELETE",
        //     onClick: () => {
        //         handleDeleteGroup()
        //     },
        //     className: "btn-danger",
        //     disabled: !selectedGroup?._id
        //   },
        // ]}
      >
        <div className="student-participants_search">
          <div class="row m-0">
            <div className="cont-search-box-participant">
              <Searchbox
                placeholder="Search"
                searchBoxTheme="search-default search-box_default search-outline"
                onChange={(event) => {
                  handleSearch(event.target.value);
                }}
              />
            </div>
          </div>
        </div>
        {/* student table  */}
        {!!aStudentList.length && (
          <div className="participants-group-students m-1">
            <Table
              data={aStudentList}
              columns={particpantTableColumns}
              defaultSortBy="name"
              sortDesc={false}
              disablePagination={true}
            />
          </div>
        )}
      </LmsModal>
    </>
  );
};

export default AddGroupStudentModal;
