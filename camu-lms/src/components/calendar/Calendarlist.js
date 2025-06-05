import React ,{ Component } from 'react';
import '../../styles/_calenderlistStyle.scss';
import { Map, RightArrow } from '../icons/Icons';
import '../../styles/_iconStyle.scss';


export class CalendarListComponent extends Component{
    render(){
        return(
         <div>
         <div className="calender-list">
      
            <h6 className="calendar-day">20 <span className="calender_date">Mon (Today)</span></h6>
            <div className="calender-header">
               <p>04:00 PM - 05:00 PM</p>
               <p>3 DUES</p>
            </div>
            <div className="calender-datalist">
               <div className="calender-sub_name">
            <p className="sub-name_content">SUB349355 -  Fundamentals of Artificial Intelligence and Machine learning</p>
            <p className="sub-name_lists">Post Graduate <span class="dots-icon"></span> Term 1 <span class="dots-icon"></span> 2020 - 2021 <span class="dots-icon"></span>PROGCODE21</p>
            </div> 
               <div className="calender-activity">
                  <div class="row m-0">
                     <div class="col-6 p-0">
                        <p className="calender-activity_name">LESSON PLAN</p>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Thermal dynamics</p>
                              <span>26 May - 02 Jun 2020</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                     </div>
                     <div class="col-6 p-0">
                        <p className="calender-activity_name">ASSIGNMENT DUE</p>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Graphic analogue</p>
                              <span>Today due date</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="calender-datalist">
            <div className="calender-sub_name">
            <p className="sub-name_content">SUB349355 -  Fundamentals of Artificial Intelligence and Machine learning</p>
            <p className="sub-name_lists">Post Graduate <span class="dots-icon"></span> Term 1 <span class="dots-icon"></span> 2020 - 2021 <span class="dots-icon"></span>PROGCODE21</p>
            </div>
               <div className="calender-activity">
                  <div class="row m-0">
                     <div class="col-6 p-0">
                        <p className="calender-activity_name">LESSON PLAN</p>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Thermal dynamics</p>
                              <span>26 May - 02 Jun 2020</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                     </div>
                     {/* <div class="col-4 p-0">
                        <p className="calender-activity_name">Activities</p>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Quiz</p>
                              <span>Some quiz title goes here</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                     </div> */}
                     <div class="col-6 p-0">
                        <p className="calender-activity_name">ASSIGNMENT DUE</p>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Graphic analogue</p>
                              <span>Today due date</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                        <div className="calender-activity_list">
                           <div className="activity-list_name">
                              <p>Some assignment</p>
                              <span>Today due date</span>
                           </div>
                           <RightArrow iconStyle="svg-icon_default icon-dark"/>
                        </div>
                        <p className="more-data">+2 more</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="calender-schedule">
               <div className="activity-list_name">
                  <p>Some title goes here </p>
                  <span>consectetur adipiscing elit. Egestas ornare morbi lacus, nullam in tellus metus eget a. Id quam vulputate blandit pellentesque mi</span>
               </div>
               <p className="calender-activity_location"> <Map iconStyle="svg-icon_extra-small icon-dark"/> &nbsp;Valli prayer hall</p>
            </div>
         </div>
      </div>
        )
    }
}