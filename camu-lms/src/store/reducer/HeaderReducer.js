export const UPDATE_HEADER_FIELDS = 'UPDATE_HEADER_FIELDS'

const inintialState = {
    session:{},
    ptrkSts : 'N',
    OutCmBsdEdu:false,
    headerPage: false,
    isArcCrsFrStaff :false
}

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_HEADER_FIELDS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer