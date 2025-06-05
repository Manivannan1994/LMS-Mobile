import React from "react";
import LmsModal from "../modal/LmsModal";
import { useTranslation } from "react-i18next";

const GroupGradeConfrmationModal = ({showGroupGradingModal, setShowGroupGradingModal, handleSwitch}) => {
    const {t} = useTranslation()
  return (
    <>
      <LmsModal
        open={showGroupGradingModal}
        onClose={() => {
            setShowGroupGradingModal(!showGroupGradingModal)
        }}
        modalTitle={t("translate:PARTICIPANT_GROUP_SWITCH_GROUP")}
        aCustomBtns={[
          {
            name: "PROCEED",
            onClick: () => {
                handleSwitch()
                setShowGroupGradingModal(!showGroupGradingModal)
            },
            className: "btn-primary"
          },
        ]}
      >
            <label for="fname" className="form-lable">
            {t('translate:PARTICIPANT_GROUP_GROUP_CONFIRMATION')}
            </label>
      </LmsModal>
    </>
  );
};

export default GroupGradeConfrmationModal;
