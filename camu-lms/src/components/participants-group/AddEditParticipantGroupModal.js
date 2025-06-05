import React from "react";
import LmsModal from "../modal/LmsModal";
import InputBox from "../input-box/InputBox";
import { useTranslation } from "react-i18next";
const AddParticipantGroupModal = ({
  showAddGroup,
  setShowAddGroup,
  handleCreateParticipantGroup,
  setGroupNameValue,
  groupNameValue,
  isEdit,
  setIsEdit,
  handleUpdateGroup,
  selectedGroup,
  setSelectedGroup,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <LmsModal
        open={showAddGroup}
        onClose={() => {
          setShowAddGroup(!showAddGroup);
          if (isEdit) {
            setSelectedGroup({});
            setGroupNameValue("");
            setIsEdit(false);
          }
        }}
        modalTitle={
          isEdit
            ? t("translate:PARTICIPANT_GROUP_EDIT_GROUP")
            : t("translate:NEW_GROUP")
        }
        aCustomBtns={[
          {
            name: "CANCEL",
            onClick: () => {
              setShowAddGroup(!showAddGroup);
              if (isEdit) {
                setSelectedGroup({});
                setGroupNameValue("");
                setIsEdit(false);
              }
            },
            className: "secondary-btn btn-outline",
          },
          {
            name: "SAVE",
            onClick: () => {
              isEdit ? handleUpdateGroup() : handleCreateParticipantGroup();
            },
            className: "primary",
            disabled: isEdit
              ? !groupNameValue || !selectedGroup?._id
              : !groupNameValue,
          },
        ]}
      >
        <div className="form-group">
          <div className="input-details">
            <label for="fname" className="form-lable">
              {t("translate:PARTICIPANT_GROUP_NAME")}
            </label>
            <InputBox
              className="input-block"
              value={groupNameValue}
              onChange={(e) => {
                setGroupNameValue(e.target.value);
              }}
            />
          </div>
        </div>
      </LmsModal>
    </>
  );
};

export default AddParticipantGroupModal;
