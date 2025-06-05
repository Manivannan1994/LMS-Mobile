import React from 'react';
import '../../styles/_toggleSwitchStyle.scss';

const ToggleSwitch = (props) => {
    return (
        <div>
            <label class="switch">
            <input type="checkbox" class="toggle-input" onChange={props.onChange} checked={props.checked}/>
            <span class="slider round"></span>
            </label>
        </div>
    );
}

export default ToggleSwitch;