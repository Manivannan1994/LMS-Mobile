export const UPDATE_W_TOKEN = 'UPDATE_W_TOKEN';

const inintialState = {

    fireToken: null,
    permStat: false
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_W_TOKEN:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;