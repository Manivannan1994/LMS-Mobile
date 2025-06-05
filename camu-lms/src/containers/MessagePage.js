import React, { Component } from 'react';
import '../styles/_messageStyle.scss';
import user from '../assets/images/user.png'
import { Option} from '../components/icons/Icons';

import { MoreVertical} from 'react-feather';
import $ from 'jquery';
export class MessageComponent extends Component{

componentDidMount() {
        $(document).ready(function() {
          $("#sidebarCollapse").on('click',function() {
            $("#sidebar").toggleClass('active');
          });
        });
      }



render(){
    return(
       <div>
      <div className="assignment-heading">
      <div className="cont-nav">
         <div className="course-name">
            <h6>Discussions</h6>
            <p>The easiest way to have a group conversation</p>
         </div>
         <div className="manual-setting">
            {/* <Button theme="btn-rounded default ">
               <Plus className="svg-icon_small icon-white " />
               New Discussion
            </Button> */}
            <i class="header-options">
               <MoreVertical className="svg-icon_small icon-dark" />
            </i>
         </div>
      </div>
   </div>

<div className="chapters-list wrapper">
   {/* <div id="sidebar">
      <div class="sidebar-header">
         <div class="close" data-dismiss="modal"  aria-label="Close">
            <Cross iconStyle="svg-icon_small"/>
         </div>
         <p class="modal-title right-model_heading" id="myModalLabel">Leena Krisha</p>
      </div>
      <div class="message-container">
         <div className="message-right">
            <img src={user} className="user-message" />
            <div class="message-blue">
               <p class="message-content">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventor.</p>
               <div class="message-timestamp-left">16.04</div>
            </div>
         </div>
         <div className="message-right">
            <div class="message-orange">
               <p class="message-content-right">I agree that your message is awesome!</p>
               <div class="message-timestamp-right">16.04</div>
            </div>
            <img src={user} className="user-message-right" />
         </div>
      </div>
      <div className="cont-send_box">
         <div className="sender-box">
            <div class="row m-0">
               <div class="col-10 p-0">
                  <div className="message-write">
                     <Emoji iconStyle="svg-icon_small"/>
                     <input placeholder="Write a message..." className="msg-content"></input>
                  </div>
               </div>
               <div class="col-2 p-0">
                  <div className="message-attached">
                     <div className="attached-ion">
                        <Attached iconStyle="svg-icon_small"/>
                     </div>
                     <div className="mic-icon">
                        <Mic iconStyle="svg-icon_small icon-dark"/>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div> */}



   <div className="module-list_cont">
      <div className="list-cont">
         {/* <div class="row">
            <div class="col-6">
               <div className="cont-search-box">
                  <div className="has-search">
                     <Search  iconStyle="svg-icon_small icon-left icon-default"/>
                     <input type="text" className="form-control cont-search_box" placeholder="Search" />
                  </div>
               </div>
            </div>
            <div class="col-6">
            </div>
         </div> */}
         <div className="list-cont_box"  id="sidebarCollapse">
            <div class="row m-0">
               <div class="col-10 p-0">
                  <div className="message-chapter">
                     <img src={user} className="user-img" alt="user-img"/>
                     <div className="message-cont">
                        <h6>
                           Chapter title goes here
                        </h6>
                        <ul class="list-cont_date">
                           <li>Thanks😁 I was very pleased zfsfsfsdf </li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div class="col-2 p-0 option-list">
                  <span>
                     <Option iconStyle="svg-icon_small icon-default"/>
                  </span>
               </div>
            </div>
         </div>
         <div className="list-cont_box">
         <div class="row m-0">
         <div class="col-10 p-0">
         <div className="message-chapter">
         <img src={user} className="user-img" alt="img" />
         <div className="message-cont">
         <h6>
         Leens Kirsha
         </h6>
         <ul class="list-cont_date">
         <li>You: Good to go Leena!</li>
         </ul>
         </div>
         </div>
         </div>  
         <div class="col-2 p-0 option-list">
         <span>
         <Option iconStyle="svg-icon_small icon-default"/>
         </span>
         </div>
         </div>
         </div>
         <div className="list-cont_box">
         <div class="row m-0">
         <div class="col-10 p-0">
         <div className="message-chapter">
         <img src={user} className="user-img" alt="img"/>
         <div className="message-cont">
         <h6>
         John Doe
         </h6>
         <ul class="list-cont_date">
         <li>You: Good to go Leena!</li>
         </ul>
         </div>
         </div>
         </div>  
         <div class="col-2 p-0 option-list">
         <span>
         <Option iconStyle="svg-icon_small icon-default"/>
         </span>
         </div>
         </div>
         </div>
      </div>
   </div>
</div>
</div>
    )
}
}