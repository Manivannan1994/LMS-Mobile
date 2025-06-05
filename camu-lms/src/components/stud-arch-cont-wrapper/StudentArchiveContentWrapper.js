import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const StudentArchiveContentWrapper = (props) => {
    let isCanView= UserSession.archiveCourse &&  UserSession.archiveCourse.canViewCnt();
    if(props.isContentView){
        isCanView = false;
    }
    return (
        <Fragment>
            {isCanView && props.children}
        </Fragment>
    )
}

export default StudentArchiveContentWrapper;