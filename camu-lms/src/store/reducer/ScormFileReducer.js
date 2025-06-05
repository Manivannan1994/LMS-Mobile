export const GET_SCORM_FILE = 'GET_SCORM_FILE';
export const UPDATE_SCORM_DETAILS = 'UPDATE_SCORM_DETAILS';
export const GET_ONE_SCORM_FILE = 'GET_ONE_SCORM_FILE';
export const GET_SCORM_ATTCHMENTS = 'GET_SCORM_ATTCHMENTS';
export const SET_SCORM_COOKIE = 'SET_SCORM_COOKIE';
export const GET_SCORM_LOG = 'GET_SCORM_LOG';


const inintialState = {
    scormFiles:[],
    uploadedScormFiles: [],
    editScormFile: {},
    scormUrl: {},
    aActivity :[]
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {

        case GET_SCORM_FILE:
            return { ...state, [action.key]: action.value };
        case UPDATE_SCORM_DETAILS:
            return {
                ...state,
                uploadedScormFiles: action.payload
            };
        case GET_ONE_SCORM_FILE: 
            return { ...state, [action.key]: action.value };
        case GET_SCORM_ATTCHMENTS: 
            return { ...state, [action.key]: action.value };
        case SET_SCORM_COOKIE: 
            return { ...state, [action.key]: action.value };
        case GET_SCORM_LOG: 
            return { ...state, [action.key]: action.value };
        default:
            return state
    }
}

export default reducer;