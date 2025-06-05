import React, { Component,lazy } from 'react';
import '../../styles/_courseheaderStyle.scss';
import { withTranslation } from "react-i18next";
import '../../styles/_iconStyle.scss';
import Button from '../button/Button';
import { ChevronDown, Edit, Eye,MoreVertical} from 'react-feather';
import { updateFields } from '../../store/actions/ContentActions'
import ToggleSwitch from '../toggle-switch/ToggleSwitch';
import { connect } from 'react-redux';
import UserSession from '../../utils/UserSession';
import helper from '../../utils/helper';
// import { Edit} from '../icons/Icons';

import { withRouter} from 'react-router-dom'
// import StaffWrapper from '../staff-wrapper/StaffWrapper';

const StaffWrapper = lazy(() =>
import('../staff-wrapper/StaffWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
class CourseHeaderComponent extends Component {

   constructor(props) {
      super(props);
      this.session = UserSession.getSession();
      this.increment = 0;
   }
   // It is show toolTip or not show
   isTooltipShow = () => {
      let editModeToolTip = helper.localStorageGet('editToolTip');
      if (this.increment !== undefined && this.session !== undefined) {
         this.increment = undefined;
         if (this.session && this.session.mappedid && editModeToolTip
            && editModeToolTip[this.session.mappedid] && editModeToolTip[this.session.mappedid].isTTibViewed) {
            this.props.updateFields('isToggle', false);
         }
      } else if (typeof this.increment === 'number') {
         this.increment++;
      }
   }
   render() {
      // Control unwanted rendering
      if(UserSession && UserSession.isStaff() && this.props.isTooltipShowHandle){
         this.isTooltipShow();
      }
      return (
               <div className="cont-nav">
                     <div className="course-name">
                        <h6>{this.props.title}</h6>
                        <StaffWrapper>
                           <p>{this.props.content}</p>
                        </StaffWrapper>
                     </div>
                     {this.props.toolKit &&
                        <div className="manual-setting">
                           {/* <StaffWrapper> */}
                              {/* {this.props.editMode ?
                                 <Button theme="btn-rounded secondary-btn btn-right" clicked={()=>this.props.editViewHandler('false')}>
                                    <Edit className="svg-icon_small icon-space_left" />
                                    {this.props.t("translate:EDITING")}
                                    <ChevronDown className="svg-icon_small icon-space_right" />
                                 </Button>
                                 :
                                 <Button theme="btn-rounded secondary-btn btn-right" clicked={()=>this.props.editViewHandler('true')}>
                                    <Eye className="svg-icon_small icon-space_left" />
                                    Viewing
                                    <ChevronDown className="svg-icon_small icon-space_right" />
                                 </Button>
                        
                              } */}
                           {/* </StaffWrapper> */}
                        
                           {this.props.toolKit && !this.props.isExpItm && this.props.contentReducer && this.props.contentReducer.chapterArray.length !== 0 && <Button theme="btn-rounded secondary-btn" clicked={()=>this.props.expandAll()}> {this.props.t("translate:EXPAND_ALL")}</Button>}
                           <StudentArchiveContentWrapper>
                           {this.props.toolKit && this.props.isExpItm && this.props.contentReducer && this.props.contentReducer.chapterArray.length !== 0 && <Button theme="btn-rounded secondary-btn" clicked={()=>this.props.collapseAll()}> {this.props.t("translate:COLLAPSE_ALL")}</Button>}
                           </StudentArchiveContentWrapper>
                           {!this.props.location.state?.isDisabledContent &&
                           <>
                           <StaffWrapper>
                              { this.props.contentReducer && this.props.contentReducer.chapterArray.length !== 0  &&
                              <div className="toggle-btn_cont">
                              <ToggleSwitch onChange={(event)=> !this.props.location.state?.fromTable && this.props.editViewHandler(event)} checked={this.props.editMode}></ToggleSwitch> <span className="switch-mode_label">{this.props.t("translate:EDIT_MODE")}</span>
                              {!this.props.location.state?.fromTable && this.props.contentReducer.isToggle && 
                              <div className="toggle-switch_tooltip">
                                 <p className="toggle-switch_label">{this.props.t("translate:TURN_EDIT_MODE_ON_TO_ADD_CONTENT")}</p>
                              </div>
                              }
                              </div>}
                           </StaffWrapper>
                            
                        
                        
                           {/* <i class="header-options">
                              <MoreVertical className="svg-icon_small icon-dark " />
                           </i> */}
                           <StaffWrapper>
                             {this.props.toolKit && 
                              <div className="view-option_cont">
                                 <div id="dropdownMenuButton" data-toggle={!this.props.location.state?.fromTable && 'dropdown'} aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                    <i class="header-options">
                                       <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
                                    </i>
                                 </div>
                                 <div class="dropdown-menu view-options_cont">
                                    {/* <div class="dropdown-item user-info_contents">
                                       <span className="view-options_dropdown">Export content</span>
                                    </div> */}
                                    <div class="dropdown-item user-info_contents" onClick={()=>this.props.history.push({pathname:"/home-page/import-content",state:this.props.location.state})}>
                                       <span className="view-options_dropdown">{this.props.t("translate:IMPORT_CONTENT")}</span>
                                    </div>
                                 </div>
                              </div>}
                              </StaffWrapper>
                              </>
                           }
                        </div>
                     }
                     <StaffWrapper>
                        {this.props.moreVertical &&
                        <div className="manual-setting">
                           
                           {/* <Button theme="btn-rounded default ">
                              <Plus className="svg-icon_small icon-white " />
                              {this.props.t("translate:ASSIGNMENTLISTCOMPONENT_NEW_ASSIGNMENT")}
                           </Button> */}
                     
                        
                           {/* <i class="header-options">
                              <MoreVertical className="svg-icon_small icon-dark" />
                           </i> */}
                        </div>
                        }
                     </StaffWrapper>
                     
                  </div>
      )
   }
}
const mapStateToProps = (state) => ({
   contentReducer:state.contentReducer
})
const mapDispatchToProps = {
   updateFields,
}
const TabNavigator = (props) => <CourseHeaderComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));
