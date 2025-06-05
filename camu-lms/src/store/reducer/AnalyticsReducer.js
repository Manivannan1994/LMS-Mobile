export const UPDATE_ANALYTICS_FIELDS = ' UPDATE_ANALYTICS_FIELDS';

const inintialState = {
    vwLogId : '' //Content status _id
   
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case  UPDATE_ANALYTICS_FIELDS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;