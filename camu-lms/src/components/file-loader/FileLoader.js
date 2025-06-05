import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../../styles/_fileLoaderStyle.scss';

const FileLoader = (props) => {
 
    return (
        <div>
            <div className="file-loader_cont">
             <CircularProgressbar value={props.value} strokeWidth={12} />
            </div>            
        </div>
    );
}

export default FileLoader;