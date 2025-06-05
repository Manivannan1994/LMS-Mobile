import React from 'react';
import '../../styles/_checkboxStyle.scss';

const CheckBox = (props) => {
    return ( 
            <input type="checkbox" id={props.id} name={props.name}  className={props.className} disabled={props.defaultDisabled}
            value={props.value} onChange={props.onChange} placeholder={props.placeholder} checked={props.checked}/> 
     );
}
 
export default CheckBox;

