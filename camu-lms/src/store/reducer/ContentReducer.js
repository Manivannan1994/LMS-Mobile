export const UPDATE_CONTENT_FIELDS = 'UPDATE_CONTENT_FIELDS';
export const RESET_INITIAL_STATE = 'RESET_INITIAL_STATE';
const inintialState = {
    itemLength:1,
    subChapItems: [],
    slecSubChapNm:{},
    teachContent: [],
    getAllItems:true,
    enterPriseDtls:{},
    reslvDtls:{},
    // modalErr:'',
    assignMntStuds:[],
    subjSelecDtls:{},
    chapterArray:[],
    chapterArrayCopy:[],
    ovrDuCnt : '',
    oChapTotal:{},
    studProgsDtls:{},
    chapOrSubChapInfo:{},
    isAutoSavehide:false,
    aAsesmnts:[],
    oContDtls:{},
    oQusPaper:{},
    oAsgnRubrc : {},
    aAsesmntsCpy:[],
    aContDup:[],
    isToggle:true,
    crsEditMode:false,
    isExpItm : false
}

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_CONTENT_FIELDS:
            return { ...state, [action.key]: action.value };
        case RESET_INITIAL_STATE:
            return {  ...inintialState, };
        default:
            return state
    }
}

export default reducer