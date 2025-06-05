export const UPDATE_STAFFS = 'UPDATE_STAFFS';

const inintialState = {

    substaff:[]
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_STAFFS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;