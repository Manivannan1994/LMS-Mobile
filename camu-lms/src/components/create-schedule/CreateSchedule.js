import React, { Component, lazy } from 'react';
import '../../styles/_createscheduleStyle.scss';
// import Button from '../button/Button';
const Button  = lazy(() =>
 import('../button/Button')
 );


 class CreateScheduleComponent extends Component {
   render() {
      return (
         <div>
         <div className="create-schedule">
            <div className="schedule-details">
               <label for="fname" className="event-names">Event name</label>
               <input type="text" className="schedule-form" placeholder="Enter Event name"/>
            </div>
            <p className="add-description">Add description</p>
            <div className="schedule-time">
               <div className="row">
                  <div className="col-4">
                     <div className="schedule-details">
                        <label for="fname" className="event-names">Date</label>
                        <input type="text" className="schedule-form" />
                     </div>
                  </div>
                  <div className="col-4">
                     <div className="schedule-details">
                        <label for="fname" className="event-names">From</label>
                        <input type="text" className="schedule-form" />
                     </div>
                  </div>
                  <div className="col-4">
                     <div className="schedule-details">
                        <label for="fname" className="event-names">To</label>
                        <input type="text" className="schedule-form"/>
                     </div>
                  </div>
               </div>
            </div>
            <p className="add-location">Location</p>
            <div className="meeting-locations">
               <Button theme="btn-rounded button-lite btn-right">On premise</Button>
               <Button theme="btn-rounded button-lite btn-right">Zoom</Button>
               <Button theme="btn-rounded default btn-right">Custom online</Button>
            </div>
            <div className="meeting-urls">
               <label for="fname" className="meeting_url">Meeting URL</label>
               <input type="text" className="meeting_link"/>
            </div>
            <div className="schedule-date">
               <div className="schedule-assign">
                  <p className="schedule__name">Assign to specific students</p>
                  <p className="schedule__details">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
               </div>
               <div className="schedule-select">
                  <input type="checkbox" />
               </div>
            </div>
            <div className="schedule-date">
               <div className="schedule-assign">
                  <p className="schedule__name">Send email and calendar invitations to participants</p>
                  <p className="schedule__details">Keep this selected if you're creating events before inviting learners to the platform.</p>
               </div>
               <div className="schedule-select">
                  <input type="checkbox" />
               </div>
            </div>
            <div className="schedule-date">
               <div className="schedule-assign">
                  <p className="schedule__name">Send a reminder 10 minutes prior to the event</p>
                  <p className="schedule__details">Participant will receive the event link to join via email.</p>
               </div>
               <div className="schedule-select">
                  <input type="checkbox" />
               </div>
            </div>
         </div>
      </div>
      )
   }
}

export default (CreateScheduleComponent);