import HTTPService from "../../utils/http-util";
import { GET_PART_GROUP, UPDATE_PART_GROUP } from "../reducer/ParticipantReducer";
import messageUtil from "../../utils/message-util";
export const updateParticipantGroup = (key, value) => ({
    key,
    value,
    type: UPDATE_PART_GROUP
});

export const getParticipantGroup = (key, value) => ({
  key,
  value,
  type: GET_PART_GROUP
});



export const createParticipantGroup = (oReq) => (dispatch) => {
  HTTPService.post(
    "/lms/participants/group/create",
    oReq,
    null,
    (err, response) => {
      if (response && response?.output && response?.output?.data) {
        dispatch(getAllParticipantGroups(oReq))
        messageUtil.showSuccess("PARTICIPANT_GROUP_CREATED_SUCCESSFULLY", true);
    } else if (err && err?.data) {
        if (
          err?.data?.output &&
          err?.data?.output?.data &&
          err?.data?.output?.data?.code
        ) {
          if (err?.data?.output?.data?.code === "DUPLICATE") {
            messageUtil.showWarning("PARTICIPANT_GROUP_NAME_EXISTS");
          }
        }
      }else{
        messageUtil.showError("UNKNOWN_ERROR", false);
      }
    }
  );
};


export const getAllParticipantGroups = (oReq) => (dispatch) => {
    HTTPService.post(
      "/lms/participants/group/list",
      oReq,
      null,
      (err, response) => {
        if (response && response?.output) {
            dispatch(getParticipantGroup('participantGroups', response?.output?.data))
      } else if (err && err?.data) {
          if (
            err?.data?.output &&
            err?.data?.output?.data &&
            err?.data?.output?.data?.code
          ) {
            if (err?.data?.output?.data?.code === "DUPLICATE") {
              messageUtil.showWarning("PARTICIPANT_GROUP_NAME_EXISTS");
            }
          }
        }else{
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
      }
    );
  };
  

  export const deleteParticipantGroup = (id,oReq) => (dispatch) => {
    HTTPService.post(
      `/lms/participants/group/remove/${id}`,
      {},
      null,
      (err, response) => {
        if (response && response?.output && response?.output?.data && response?.output?.data?.code) {
          dispatch(getAllParticipantGroups(oReq))
          messageUtil.showSuccess("PARTICIPANT_GROUP_DELETED_SUCCESSFULLY", true);
      } else if (err) {
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
      }
    );
  };

  export const updatePartGroup = (id,payload,oReq) => (dispatch) => {
    HTTPService.post(
      `/lms/participants/group/update/${id}`,
      payload,
      null,
      (err, response) => {
        if (response && response?.output && response?.output?.data) {
          dispatch(getAllParticipantGroups(oReq))
          messageUtil.showSuccess("PARTICIPANT_GROUP_UPDATED_SUCCESSFULLY", true);
      } else if (err) {
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
      }
    );
  };


  export const addGroupStudent = (payload) => (dispatch) => {
    HTTPService.post(
      '/lms/participants/group-student/create',
      payload,
      null,
      (err, response) => {
        if (response && response?.output && response?.output?.data) {
          dispatch(getAllParticipantGroups(payload))
          messageUtil.showSuccess("PARTICIPANT_GROUP_ADD_STUDENT_SUCCESS", true);
      } else if (err) {
        if (
          err?.data?.output &&
          err?.data?.output?.data &&
          err?.data?.output?.data?.code
        ) {
          if (err?.data?.output?.data?.code === "DUPLICATE") {
            messageUtil.showWarning("PARTICIPANT_GROUP_STUDENT_ADDED_ALREADY");
          }
        }else{
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
        }
      }
    );
  };

  export const deletePartGroupStudent = (id,oReq) => (dispatch) => {
    HTTPService.post(
      `/lms/participants/group-student/remove/${id}`,
      {},
      null,
      (err, response) => {
        if (response && response?.output && response?.output?.data && response?.output?.data?.code) {
          dispatch(getAllParticipantGroups(oReq))
          messageUtil.showSuccess("PARTICIPANT_GROUP_REMOVE_STUDENT_SUCCESS", true);
      } else if (err) {
          messageUtil.showError("UNKNOWN_ERROR", false);
        }
      }
    );
  };
  