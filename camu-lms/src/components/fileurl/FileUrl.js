import React from 'react';
import '../../styles/_fileUrlStyle.scss';

const FileUrl = (props) => {
    return (
        <div>
             <input type="url" value={props.value} onChange={props.onChange} className={props.URLTheme}  placeholder="File URL" />
        </div>
    );
}

export default FileUrl;   