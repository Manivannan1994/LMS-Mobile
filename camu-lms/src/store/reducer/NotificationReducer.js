export const UPDATE_NOTIFICATION_DETAILS = 'UPDATE_NOTIFICATION_DETAILS';

const inintialState = {
    aNotifications : []
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_NOTIFICATION_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;