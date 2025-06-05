// import React from 'react';

// const TimePicker = (props) => {
//     return (
//         <div>
//             <input type='time' value={props.value} onChange={props.onChange} disabled={props.defaultDisabled} />
//         </div>
//     );
// }

// export default TimePicker;




import React from 'react';
 import DatePicker from "react-datepicker";
 import '../../styles/_timePickerStyle.scss';

const ReactTimePicker = (props) => {
    return (
        <div className="react-time_format">
            <DatePicker className={props.timePickerTheme} placeholderText="hh-mm" selected={props.selected} dateFormat={props.dateFrmt} showTimeInput={props.showTime} onChange={props.onChange} disabled={props.disabled}/>
        </div>
    );
}

export default ReactTimePicker;