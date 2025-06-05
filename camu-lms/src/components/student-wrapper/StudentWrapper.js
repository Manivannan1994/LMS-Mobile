/*
Wrapper to place student related functions will be hided for staff login
Common pattern for student specific functionalities
*/
import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const StudentWrapper = (props) => {
    return (
        <Fragment>
            {UserSession.isStudent()&&props.children}
        </Fragment>
    )
}

export default StudentWrapper;  