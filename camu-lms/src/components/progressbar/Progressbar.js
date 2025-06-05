import React from "react";
import '../../styles/_progressbarStyle.scss';

const ProgressBar = (props) => {
  return <div>
    {props.studentProgressBar?
    <div class="progress-student">
      <div class={props.className ? props.className  : "progress-bar_student" }  style={{width:props.widthprog}}></div>
      </div>:
      <div className={props.progressBarTheme} ></div>}
  </div>
};

export default ProgressBar;