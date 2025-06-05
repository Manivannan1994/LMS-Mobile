import React from 'react';
import '../../styles/_radioButtonStyle.scss';

const RadioButton = (props) => {
    return (
        <div>
            <input type="radio" id={props.id} name={props.name} className={props.className}
                value={props.value} checked={props.checked} disabled={props.defaultDisabled}
                onChange={props.onChange} placeholder={props.placeholder}
            />
        </div>
    );
}

export default RadioButton;

