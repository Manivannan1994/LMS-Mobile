import React from "react";
import LmsModal from "../modal/LmsModal";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { deletePartGroupStudent } from "../../store/actions/ParticipantsAction";

const RemoveGroupStudentModal = ({ showModal, setShowModal, studToRemove, setStudToRemove, oCommonPayload }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleRemoveStudent = () => {
    if (studToRemove && studToRemove?._id) {
      dispatch(deletePartGroupStudent(studToRemove?._id, oCommonPayload));
    }
    setShowModal(!showModal)
    setStudToRemove('')
  };

  return (
    <LmsModal
      open={showModal}
      onClose={() => {
        setShowModal(!showModal);
        setStudToRemove('')
      }}
      modalTitle={t("translate:PARTICIPANT_GROUP_DELETE_GROUP")}
      aCustomBtns={[
        {
          name: "CANCEL",
          onClick: () => {
            setShowModal(!showModal);
            setStudToRemove('')
          },
          className: "secondary-btn btn-outline",
        },
        {
          name: "DELETE",
          onClick: () => {
            handleRemoveStudent()
          },
          className: "btn-danger",
        },
      ]}
    >
      <label for="fname" className="form-lable">
       Are you sure you want to remove ‘{studToRemove?.FNa}’ from ‘{studToRemove?.groupName}’ The student will no longer be part of the submission made by the rest of the group. That might change the completion state of the learner you are trying to remove. Removing a student from a group doesn't automatically remove their contribution from previously submitted group assignments. Are you sure you want to do this?
      </label>
    </LmsModal>
  );
};

export default RemoveGroupStudentModal;
