import React from "react";
import '../../styles/_inputboxStyle.scss';

const InputBox = (props) => {
    return(
    <div>
          <input type="text" id={props.id} name={props.name} className={props.className} value={props.value} onChange={props.onChange} onBlur = {props.onBlur} placeholder={props.placeholder} disabled={props.defaultDisabled} onFocus={props.onFocus} ref={props.refer}></input>
    </div>
    )
};
export default InputBox;  