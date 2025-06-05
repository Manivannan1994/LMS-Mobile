import React from "react";
import '../../styles/_studentNameStyle.scss';
// import student_img from '../../assets/images/stud-img.png';


const StudentNameComponent = (props) => {
    return(
            
                    <div className={props.className} style={{background:props.clrCode}}>
                        {props.fName}
                    </div>
                 
    )
};
export default StudentNameComponent;  