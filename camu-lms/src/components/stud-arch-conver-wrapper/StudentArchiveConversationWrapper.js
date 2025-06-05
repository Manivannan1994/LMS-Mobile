import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const StudentArchiveConversationWrapper = (props) => {
    let isCanView = UserSession.archiveCourse && UserSession.archiveCourse.canViewConversation();
    if (props.isConVersationView) {
        isCanView = false;
    }
    return (
        <Fragment>
            {isCanView && props.children}
        </Fragment>
    )
}

export default StudentArchiveConversationWrapper;