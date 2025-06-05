export const UPDATE_DASHBOARD_FIELDS = 'UPDATE_DASHBOARD_FIELDS';
const intialState = {
    acYr: [],
    subjects: [],
    selcDtls:{},
    subjectsCopy:[]
}

const reducer = (state = intialState, action) => {
    switch (action.type) {
        case UPDATE_DASHBOARD_FIELDS:
            return { ...state, [action.key]: action.value }

        default:
            return state
    }
}

export default reducer