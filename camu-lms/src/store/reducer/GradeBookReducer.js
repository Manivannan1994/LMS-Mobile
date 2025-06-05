export const UPDATE_GRADE_BOOK_DETAILS = 'UPDATE_GRADE_BOOK_DETAILS';

const inintialState = {
    oGrdBookItems : {},
    aGradStudents :[],
    aGradStudentsCpy :[],
    studAsgnmntContDetls :{},
    oStudDtls:{},
    oAsgnmntDtls:[],
    oStudDtlsCpy:{},
    aStudAssignmnts:[],
    oPostAllDtls:{},
    aStudents : [],
    aGradePages : [],
    oStudFinGrad : {},
    oLstSubDet : {},
    showDwnldState : true,
    selectGradeDwnld : {},
    aAsgnmCats : []
};

const reducer = (state = inintialState, action) => {
    switch (action.type) {
        case UPDATE_GRADE_BOOK_DETAILS:
            return { ...state, [action.key]: action.value }
        default:
            return state
    }
}

export default reducer;