
import React from "react";
import '../../styles/_alertStyle.scss';

const Alert = (props) => {
  return <div className={props.alertTheme}>
            {props.children} 
         </div>;
};
 
export default Alert ;
