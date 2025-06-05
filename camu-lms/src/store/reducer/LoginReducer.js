
export const UPDATE_LOGIN_DETAILS = 'UPDATE_LOGIN_DETAILS';
const inintialState = {

}
const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_LOGIN_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer