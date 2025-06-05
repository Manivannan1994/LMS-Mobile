import React, { Component } from 'react';
import '../../styles/_discussionsListStyle.scss';
import {Option} from '../icons/Icons';
import { MoreVertical} from 'react-feather';
// import $ from 'jquery';


export class DiscussionsListComponent extends Component{

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


   <div class="project-tab">
            <div class="discussion_tab">
               <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                  <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab"  aria-selected="true">Active</a>
                  <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false">Closed</a>
               </div>
            </div>
            <div class="tab-content" id="nav-tabContent">
               <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
               <div className="chapters-list wrapper">
   <div className="module-list_cont">
      <div className="list-cont">
    
         <div className="list-cont_box"  id="sidebarCollapse">
            <div class="row m-0">
               <div class="col-10 p-0">
                  <div className="message-chapter">
                     {/* <img src={user} className="user-img" /> */}
                     <div className="message-cont">
                        <h6>
                        Little Things That Matter In The  Tiny Connectors
                        </h6>
                        <ul class="list-cont_date">
                           <li>Last posted at Jan 27 at 6:30pm </li>
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
               <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                  <p>content 2</p>
               </div>
            
            </div>
         </div>


</div>
    )
}
}