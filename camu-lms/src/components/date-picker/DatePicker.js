import React from 'react';
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
 import '../../styles/_datepickerStyle.scss';


const ReactDatePicker = (props) => {
    return (
        <div className="react-date_format">
            <Datetime closeOnSelect={props.closeOnSelect || false} isValidDate={props.isValidDate} className={props.className} inputProps={{placeholder:"DD-MMM-YYYY"}}   timeFormat={props.timeFormat} value={props.value}  selected={props.selected} dateFormat={props.dateFormat}  onChange={props.onChange} disabled={props.disabled}/>
        </div>
    );
}

export default ReactDatePicker;