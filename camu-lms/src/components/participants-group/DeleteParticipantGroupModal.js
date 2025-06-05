import React from "react";
import LmsModal from "../modal/LmsModal";
import { useTranslation } from "react-i18next";

const DeleteParticipantGroupModal = ({showDeleteGroup, setShowDeleteGroup, setSelectedGroup, selectedGroup, handleDeleteGroup}) => {
    const {t} = useTranslation()
  return (
    <>
      <LmsModal
        open={showDeleteGroup}
        onClose={() => {
            setShowDeleteGroup(!showDeleteGroup)
            setSelectedGroup({})
        }}
        modalTitle={t("translate:PARTICIPANT_GROUP_DELETE_GROUP")}
        aCustomBtns={[
          {
            name: "CANCEL",
            onClick: () => {
                setShowDeleteGroup(!showDeleteGroup)
                setSelectedGroup({})
            },
            className: "secondary-btn btn-outline",
          },
          {
            name: "DELETE",
            onClick: () => {
                handleDeleteGroup()
            },
            className: "btn-danger",
            disabled: !selectedGroup?._id
          },
        ]}
      >
            <label for="fname" className="form-lable">
              {t("translate:MODAL_CONFIRMATION")} {selectedGroup?.groupName} ?
            </label>
      </LmsModal>
    </>
  );
};

export default DeleteParticipantGroupModal;
