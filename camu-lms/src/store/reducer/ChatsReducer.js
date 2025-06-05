export const UPDATE_CHATS_DETAIL = 'UPDATE_CHATS_DETAIL';

const inintialState = {

    chatGroups:[],
    chatMessages:[],
    chatUsers:[],
    currenGroup:null
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_CHATS_DETAIL:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;