/*
Wrapper to place staff related functions will be hided for student login
All the elements specific to staff should be enclosed by this component
*/
import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const StaffWrapper = (props) => {
    return (
        <Fragment>
            {UserSession.isStaff()&&props.children}
        </Fragment>
    )
}

export default StaffWrapper;  
 

