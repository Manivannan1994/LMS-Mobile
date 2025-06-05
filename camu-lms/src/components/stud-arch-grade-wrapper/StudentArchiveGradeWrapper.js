import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const StudentArchiveGradeWrapper = (props) => {
    let isCanView = UserSession.archiveCourse && UserSession.archiveCourse.canViewGrd();
    if (props.isGradeView) {
        isCanView = false;
    }
    return (
        <Fragment>
            {isCanView && props.children}
        </Fragment>
    )
}

export default StudentArchiveGradeWrapper;