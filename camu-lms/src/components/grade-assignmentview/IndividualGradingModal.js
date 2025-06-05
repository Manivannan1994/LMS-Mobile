import React from "react";
import LmsModal from "../modal/LmsModal";
import { useTranslation } from "react-i18next";

const IndividualGradeConfrmationModal = ({showIndividualGradingModal, setShowIndividualGradingModal, handleSwitch}) => {
    const {t} = useTranslation()
  return (
    <>
      <LmsModal
        open={showIndividualGradingModal}
        onClose={() => {
            setShowIndividualGradingModal(!showIndividualGradingModal)
        }}
        modalTitle={t("translate:PARTICIPANT_GROUP_SWITCH_INDIVIDUAL")}
        aCustomBtns={[
          {
            name: "PROCEED",
            onClick: () => {
                handleSwitch()
                setShowIndividualGradingModal(!showIndividualGradingModal)
            },
            className: "btn-primary"
          },
        ]}
      >
            <label for="fname" className="form-lable">
              {t('translate:PARTICIPANT_GROUP_INDIVIDUAL_CONFIRMATION')}
            </label>
      </LmsModal>
    </>
  );
};

export default IndividualGradeConfrmationModal;
