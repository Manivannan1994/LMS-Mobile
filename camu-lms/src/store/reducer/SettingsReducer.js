export const UPDATE_SETTINGS_DETAILS = 'UPDATE_SETTINGS_DETAILS';

const inintialState = {
    lmsTyp:'',
    sCnfId:'',   // Subject configuration id
    aChapNms:[],  // Chapter names
    aGrdSystem: [],
    aGrdSysCpy : [],
    oGradScheme : {}
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_SETTINGS_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;