import React from 'react';
import '../../styles/_inputboxStyle.scss';

const NumberBox = (props) => {
    return (
        <div>
            <input type="number" id={props.id} name={props.name} min={props.min} max={props.max} className={props.className} placeholder={props.placeholder}  
            value={props.value} onChange={props.onChange} onBlur = {props.onBlur} disabled={props.defaultDisabled} onKeyPress={props.onKeyPress}/>
        </div>
    );
}

export default NumberBox;