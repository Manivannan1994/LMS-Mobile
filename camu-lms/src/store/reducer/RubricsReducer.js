export const UPDATE_RUBRICS_DETAILS = 'UPDATE_RUBRICS_DETAILS';

const inintialState = {
    aRubrics : [],
    isDupli  : false
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_RUBRICS_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;