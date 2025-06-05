import React ,{ Component } from 'react';
import { DownArrow, LeftArrow, RightArrow } from '../components/Icons';
import '../styles/_assigmentpageStyle.scss';
import user from '../assets/images/user.png'


export class AssignmentPageComponent extends Component{
    render(){
        return(
            <div>
            <div className="assignment-page_header">
               <div class="row m-0">
                  <div class="col-6 p-0">
                     <p class="task-name">Mark parts of the body for a standing monkey</p>
                  </div>
                  <div class="col-4 p-0">
                     <div class="student-badge">
                        <div class="forward-btn">
                           <LeftArrow  iconStyle="svg-icon_small icon-white" />
                        </div>
                        <div class="student-info">
                           <img src={user} alt="img"/>
                           <p class="stud-name">
                              Michael Thompson 
                              <span>
                                 <DownArrow  iconStyle="svg-icon_small icon-white" />
                              </span>
                           </p>
                        </div>
                        <div class="forward-btn">
                           <RightArrow  iconStyle="svg-icon_small icon-white" />
                        </div>
                     </div>
                  </div>
                  <div class="col-2 p-0">
                     <div class="mark-status">
                        <p>21 <span>of</span> 56</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
        )
    }
}