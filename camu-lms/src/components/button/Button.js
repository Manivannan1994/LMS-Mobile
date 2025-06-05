import React from "react";
import '../../styles/_buttonStyle.scss';


const Button = (props) => {
  return <button className={props.theme} onClick={props.clicked} disabled={props.defaultDisabled}>{props.children}</button>;
};

export default Button;