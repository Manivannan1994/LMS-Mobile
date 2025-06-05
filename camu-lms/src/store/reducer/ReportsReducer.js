export const UPDATE_REPORT_DETAILS = 'UPDATE_REPORT_DETAILS';

const inintialState = {
    aLMSReports : []
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_REPORT_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;