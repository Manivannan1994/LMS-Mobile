import React from 'react';
import '../../styles/_textAreaStyle.scss';

const TextArea = (props) => {
    return (
        <div>
            <textarea className={props.className} onChange={props.onChange} placeholder={props.placeholder} value={props.value} rows={props.rows} style={props.customStyle ?? {}} disabled={props.defaultDisabled}></textarea>
        </div>
    );
}

export default TextArea;