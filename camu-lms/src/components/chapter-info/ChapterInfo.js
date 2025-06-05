import React, { Component, lazy } from 'react';
import '../../styles/_chapterInfoStyle.scss';
import { X } from 'react-feather';
import Button from '../button/Button';
import '../../styles/_filesviewStyle.scss';
import '../../styles/_commonLmsStyle.scss';
// import { getChapterInfo } from '../../store/actions/ContentActions';
import { withTranslation } from "react-i18next";
import { connect } from 'react-redux';
import queryString from 'query-string';
import { getChapterInfo,chpSubChpPblshUnPblsh } from '../../store/actions/ContentActions';
import {updateFields} from '../../store/actions/ContentActions'
import { lmsDateFormat } from '../../utils/helper';
import StudentWrapper from '../student-wrapper/StudentWrapper';
// import _ from "lodash";


const ConversationComponent = lazy(() =>
   import('../conversation/Conversation')
);
const Snippet = lazy(() =>
   import('../snippets/Snippet')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const StudentArchiveConversationWrapper = lazy(() =>
   import('../stud-arch-conver-wrapper/StudentArchiveConversationWrapper')
);

class ChapterInfoComponent extends Component {
   constructor(props) {
      super(props);
      this.state = {
         isLoadConv: false,
         lkUnDt: '',
         isHide: true,
         activeTab: this?.props?.location?.state?.activeState || 'overview',
      }
   }

   componentDidMount() {
      this.values = queryString.parse(this.props.location.search);
      if (this.values && (this.values.chapId || this.values.subId)) {
         let oReq = {
            chapId: this.values.chapId,
            sChpId: this.values.subId,  
         }
         this.props.getChapterInfo(oReq)
      }
   }

   svePublish=(view,index)=>{
      let oReq ={       
         vSts:view,
         chapId: this.values.chapId,
         sChpId: this.values.subId
         
      }
    this.props.chpSubChpPblshUnPblsh(oReq,this.props.chapOrSubChapInfo);
  
   }
   // Navigation for course content
   navigationToContent = () =>{
      if (this.values && this.values.chapId && this.values.subId) {
         this.props.history.push({ pathname: "/home-page/content-page", search: `?chapId=${this.values.chapId}&subId=${this.values.subId}&chapIndex=${this.values.chapIndex}`, state: this.props.location.state ,chapInfo:{isChapInfo:true}})
      } else {
         this.props.history.push({ pathname: "/home-page/content-page", search: `?chapId=${this.values.chapId}`, state: this.props.location.state })
      }

   }

   handleSnippet = () => {
      this.setState({ isLoadConv: false, isHide: false });
      this.setActiveTab('snippets');
   }

   setActiveTab = (tab) => {
      this.setState({ activeTab: tab });
  }

   render() {
      
      const { isLoadConv, activeTab } = this.state;

      return (
         <div>
            <div className="chapter-info_box">
               <div className="chapter-info_options">
                  <div className="hide-content_view" onClick={() => this.navigationToContent()}>
                     <X className="svg-icon_small icon-dark icon-pointer" />
                  </div>
               </div>
               <div className="chapter-container_box">
                  <div className="chapter-view_header">
                     <p className="chapter-view_label">{this.props.t("translate:LEARNERS_ACCESS_ITEM")}</p>
                     {/* <div>
                     <Button theme="btn-rounded btn-transparent"> {this.props.t("translate:UNPUBLISHED")} </Button>
                     </div> */}
                     {!this.props.location.state?.isDisabledContent &&
                     <div>
                        <UIPerWrapper perCode={["rp_can_pub_lms_chap_subchap"]}>{(this.props.chapOrSubChapInfo.vSts && this.props.chapOrSubChapInfo.vSts === "F") ?
                           <Button theme="btn-rounded btn-transparent" clicked={()=>this.svePublish('D')}> {this.props.t("translate:UNPUBLISHED")}</Button>                        
                           :
                           <Button theme="btn-rounded btn-transparent"  clicked={() => this.svePublish("F")}> {this.props.t("translate:PUBLISHED")}</Button>
                        }</UIPerWrapper>
                     </div>
                     }
                  </div>
                  <div className="chapter-viewer_cont">
                     <div className="chapter-info_cont">
                        {this.values && !this.values.subId && this.props.chapOrSubChapInfo && this.props.chapOrSubChapInfo.chpName ?
                           (<p className="chap-heading_label">{this.props.chapOrSubChapInfo.chpName}</p>) :
                           <span>
                              {
                                 this.props.chapOrSubChapInfo && this.props.chapOrSubChapInfo.chapNm ? (<p className="sub-heading_label">{this.props.chapOrSubChapInfo.chapNm}</p>) : ''
                              }
                           </span>
                        }
                        <p className="chap-heading_label">{this.props.chapOrSubChapInfo.subChapNm} </p>
                        {this.props.chapOrSubChapInfo && this.props.chapOrSubChapInfo.totalReq > 0 &&
                           <p className="sub-chapter_information"><span className="stud-label_default">{this.props.t("translate:COMPLETE")} {this.props.chapOrSubChapInfo.totalReq} {this.props.t("translate:ITEMS")}</span></p>
                        }
                        {this.values && !this.values.subId && this.props.chapOrSubChapInfo && this.props.chapOrSubChapInfo.preReqst && <p className="chapter-con_label"><span className="stud-label_default">{this.props.t("translate:PREREQUISITES")}</span>{this.props.chapOrSubChapInfo.preReqst}</p>}
                        {/* <p className="chapter-con_label"><span className="stud-label_default">PREREQUISITES</span>{this.props.chapterInfo.chapName}</p> */}
                     </div>
                     {/* ...............................tabs selection code......................  */}
                     <div class="project-tab">
                        <div class="chapter-option_tabs">
                           <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                              <a class={`nav-item nav-link ${activeTab === 'overview' ? 'active' : ''}`} id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true" onClick={() => this.setState({ isLoadConv: false, isHide: true }, () => {this.setActiveTab('overview'); })}>{this.props.t("translate:OVER_VIEW")}</a>
                              <StudentArchiveConversationWrapper>
                              <a class={`nav-item nav-link ${activeTab === 'conversation' ? 'active' : ''}`} id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={() => this.setState({ isLoadConv: true, isHide: false }, () => {this.setActiveTab('conversation'); }) }>{this.props.t("translate:CONVERSATION")}</a>
                              </StudentArchiveConversationWrapper>
                              {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Notes</a>
                                  <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Activity log</a> */}
                              <StudentWrapper>
                              {this.values?.subId && this?.props?.location?.state?.isEnableAiChat && (
                                 <a class={`nav-item nav-link ${activeTab === 'snippets' ? 'active' : ''}`} id="nav-profile-tab" data-toggle="tab" href="#tab-4" role="tab" aria-selected="false" onClick={() => this.handleSnippet()}>{this.props.t("translate:SNIPPET")}</a>
                              )}
                              </StudentWrapper>
                           </div>
                        </div>
                        <div class={`tab-content chapter-tabs_container${activeTab === 'snippets' ? '_snippet' : ''}`} id="nav-tabContent">
                           <div class={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`} id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                              <div className="chapter-deu_info">
                                 {
                                    this.props.chapOrSubChapInfo && this.props.chapOrSubChapInfo.lkUnDt &&
                                    <div className="row m-0">
                                       <div className="col-2 p-0">
                                          {/* lkUnDt */}
                                          <p className="chapter-lock_info"> <span class="chapter-dots_icon"></span>{this.props.t("translate:LOCK_UNTIL")}</p>
                                       </div>
                                       <div className="col-10 p-0">
                                          {/* Dec 12, 2021, 8:00 AM */}
                                          <p className="chapter-lock_date">{lmsDateFormat(this.props.chapOrSubChapInfo.lkUnDt)}</p>
                                       </div>
                                    </div>
                                 }
                              </div>
                           </div>
                           {this.values && this.values.ischap ?
                              <div class={`tab-pane fade ${activeTab === 'conversation' ? 'show active' : ''}`} id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                 {isLoadConv && <ConversationComponent type='CHAP' chapId={this.values.chapId} title={this.props.chapOrSubChapInfo.chpName} />}
                              </div>
                              : <div class={`tab-pane fade ${activeTab === 'conversation' ? 'show active' : ''}`} id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                 {isLoadConv && <ConversationComponent type='SUBCHAP' sChpId={this.values.subId} title={this.props.chapOrSubChapInfo.subChapNm} />}
                              </div>
                           }
                           <div class={`tab-pane fade ${activeTab === 'notes' ? 'show active' : ''}`} id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                              <p>{this.props.t("translate:NOTES_CONTENT")}</p>
                           </div>
                           <StudentWrapper>
                           {this.values?.subId && this?.props?.location?.state?.isEnableAiChat && (
                              <div class={`tab-pane fade ${activeTab === 'snippets' ? 'show active' : ''}`} id="tab-4" role="tabpanel" aria-labelledby="nav-profile-tab">
                                 <Snippet />
                              </div>
                           )}
                           </StudentWrapper>
                           {this.props.chapOrSubChapInfo && !this.props.chapOrSubChapInfo.lkUnDt && ((this?.props?.location?.state?.isEnableAiChat && activeTab !=='snippets') || !this?.props?.location?.state?.isEnableAiChat) && this.state.isHide &&
                              <div className="chapter-content_empty">
                                 <p className="chapter-empty_label">{this.props.t("translate:No_INFORMATION")}</p>
                              </div>
                           }
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   // ...state.headerReducer
})
const mapDispatchToProps = {
   getChapterInfo,
   chpSubChpPblshUnPblsh,
   updateFields
}

const TabNavigator = (props) => <ChapterInfoComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);

