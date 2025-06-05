export const GET_PART_GROUP = 'GET_PART_GROUP';
export const UPDATE_PART_GROUP = 'UPDATE_PART_GROUP'
const inintialState = {
    participantGroups:[]
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case GET_PART_GROUP:
            return { ...state, [action.key]: action.value }
        case UPDATE_PART_GROUP:
            return {...state, [action.key]: [...state.participantGroups, action.value]}
        default:
            return state
    }
}

export default reducer;