/* Reducer File For S3 File Upload */
import * as actionType from '../actions/FileUploadAction';

const initialState = {
    "attachments": [],
    "gDriveAuth":{}
}

const reducer = (state = initialState , action) => {
    switch (action.type) {
        case actionType.INITIALIZE_FILE_UPLOAD:
            return { ...state, [action.key]: action.value }

        default:
            return state
    }
}

export default reducer