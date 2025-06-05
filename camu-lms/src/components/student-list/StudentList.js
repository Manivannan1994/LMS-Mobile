import React from "react";
import '../../styles/_studentlistStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import student_img from '../../assets/images/stud-img.png';


const StudentList = (props) => {
    return(
<div>
   <p className="arrange-letter">A</p>
   <div className="studs-list">
      <div class="row m-0">
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
      </div>
   </div>
   <p className="arrange-letter">B</p>
   <div className="studs-list">
      <div class="row m-0">
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
         <div class="col-6 p-0">
            <div className="student-data">
               <div className="select-stud">
                  <input type="checkbox" className="stud-checkbox" id="exampleCheck1"/>
               </div>
               <div className="student-img">
                  <img src={student_img} alt="img"/>
               </div>
               <div className="student-details">
                  <p className="std-name">Leens Kirsha</p>
                  <p className="std-id">UCSA2345566</p>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
    )
};
export default StudentList;  