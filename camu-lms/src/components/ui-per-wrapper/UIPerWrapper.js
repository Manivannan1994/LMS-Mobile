/*
Wrapper to place UI permission related functions will be hided for staff login
All the elements specific to staff should be enclosed by this component
*/
import {Fragment} from "react";

import UserSession from '../../utils/UserSession';

export const UIPerWrapper = (props) => {
    return (
        <Fragment>
            {UserSession.isGotPerm(props.perCode)&&props.children}
        </Fragment>
    )
}

export default UIPerWrapper;  