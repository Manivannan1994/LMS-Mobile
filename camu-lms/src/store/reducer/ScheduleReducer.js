export const UPDATE_SCHEDULE_DETAILS = 'UPDATE_SCHEDULE_DETAILS';

const inintialState = {
    aSchedules : [],
    onMeeting  : {}    //Online meeting vendor details
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_SCHEDULE_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;