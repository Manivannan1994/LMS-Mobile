import React ,{ Component, lazy } from 'react';
import '../../styles/_contentviewStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import {Edit,Cross} from '../icons/Icons';
import { connect } from 'react-redux';
import {Link} from 'react-router-dom'
import { withTranslation } from 'react-i18next';
import _ from "lodash";
import SlideFooter from '../slide-footer/SlideFooter';
import queryString from 'query-string';
import {MoreVertical, Slash, Trash2} from 'react-feather';
import HTTPService from "../../utils/http-util";
import {loadItems,getSubChapName,updateMarkAsDone,deleteItems} from '../../store/actions/ContentActions';
import { updateCntViewLog } from '../../store/actions/AnalyticsAction';
import StaffWrapper from '../staff-wrapper/StaffWrapper';
import messageUtil from '../../utils/message-util';
import AnalyticsService from '../../service/analytics-service';
import UserSession from '../../utils/UserSession';

const Button = lazy(() =>
import('../button/Button')
);
const LmsEditorView = lazy(() =>
import('../lms-editor-view/LmsEditorView')
);
const ConversationComponent = lazy(() =>
import('../conversation/Conversation')
);
const StudentWrapper = lazy(() =>
import('../student-wrapper/StudentWrapper')
);
const StudentArchiveConversationWrapper = lazy(() =>
   import('../stud-arch-conver-wrapper/StudentArchiveConversationWrapper')
);
const AnalyticsWrapper = lazy(() =>
import('../analytics-wrapper/AnalyticsWrapper')
);
const LmsModal = lazy(() =>
import("../modal/LmsModal")
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
class ContentViewComponent extends Component{
    constructor(props) {
        super(props);
        this.pageId=undefined;
        this.values=undefined;
        this.state = {
            title:'',
            pageData:'',
            vSts:'',
            isLoadConv:false,
            subChapNm:'',
            markAsDone:undefined,
            pageDelModel:false
        };
     }
   componentDidMount(){
      AnalyticsService.setCurrPage('PAGE_VW');
      this.values = queryString.parse(this.props.location.search);
      if (UserSession.archiveCourse &&  UserSession.archiveCourse.canViewCnt()) { // For course archive content
         this.getPageDetails('initialCall');
      } 
   }

  // Publish and unpublish
  publishContent = (publishKey)=>{
   let oReq ={
      _id:this.values.id,
      vSts:publishKey
   }

   HTTPService.post('/teaching-content/publish-subchapter-items', oReq, null, (err, data) => {
      if (data && data.output) {
         if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONTENT_DETAILS_FOUND") {
            messageUtil.showInfo("NO_FILE_FOUND", true);
         } else if (data.output.data && !_.isEmpty(data.output.data)) {
            this.setState({vSts:data.output.data.vSts});
         } else if (data.output.data && _.isEmpty(data.output.data)) {
            messageUtil.showInfo("NO_FILE_FOUND", true);
         }
      } else {
         messageUtil.showError("UNKNOWN_ERROR", false);
      }
   });
}
   
   //To get the page details by using id
   getPageDetails=(initLoad,pageId)=>{
      let oReq={};
      if(pageId){
         this.pageId=pageId;
         oReq = {
            _id: pageId,
            sChpId: this.values.subId
         }
      }else if(this.props.location.search && !_.isEmpty(this.props.location.search)){
         this.values = queryString.parse(this.props.location.search);
         if(this.values && this.values.id){
            this.pageId=this.values.id;
            oReq = {
               _id: this.values.id,
               sChpId: this.values.subId
            }
         }
      }
 
      HTTPService.post('/teaching-content/get-subchapter-items', oReq, null,(err, response)=>{
            if (response && response.output) {
               if(response.output.errors && response.output.errors.code && response.output.errors.code === "NO_DOCS_FOUND"){
                  messageUtil.showInfo("NO_PAGE_FOUND", true);
               }else if (response.output.data && response.output.data.aContents && response.output.data.aContents.length>0) {
                  this.setState({
                     title:response.output.data.aContents[0].title,
                     pageData:response.output.data.aContents[0].page?.html,
                     vSts:response.output.data.aContents[0].vSts,
                     subChapNm:response.output.data.aContents[0].subChapNm,
                     markAsDone:response.output.data.aContents[0].markAsDone
                  });
               }else if(response.output.data && response.output.data.length === 0){
                  messageUtil.showInfo("NO_PAGE_FOUND", true);
               }
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
            if(initLoad){
               this.props.loadItems(this.values.chapId,this.values.subId,this.props.location.state,false);
               this.props.getSubChapName(this.state.subChapNm);
            } 
      })
      
   }
   //Page view from the footer navigation
   contentFooterChange=(pageId,type, currPage)=>{
      this.values.id = pageId;
      // if(type === 'PAGE'){
         if(UserSession.isStudent()){
            const chckCurPage = AnalyticsService.getCurrPageDetails();
            // Only create if the same content is continued while navigation coz it will not re-render component
            if(chckCurPage && (currPage !== chckCurPage.pgNm)){
               return;
            }
            const oLog = {
               isEnCurCrtNwLg : true,  // End current log for current content and create new for next or prev content
               currPage : currPage,
               id : pageId
            };
            if(this.props.location && this.props.location.state && this.props.location.state.subId){
               oLog.subId = this.props.location.state.subId;
               oLog.AcYr = this.props.location.state.AcYr;
               oLog.SemID = this.props.location.state.SemID;
            }
            this.props.updateCntViewLog(oLog);
         }
         this.getPageDetails(null,pageId);
      // }
   }

   //Complete mark as done by student
   markAsDone=()=>{
      if(this.values && this.values.id && this.values.id.length){
         const oMrkReq={
            cntId:this.values.id
         }
         this.props.updateMarkAsDone(oMrkReq,this.markAsDoneClbk);
      }
   }
   //Mark as done callback
   markAsDoneClbk=(status)=>{
      this.setState({markAsDone:status});
   }
   // Delete Pages in page view
   deletePage =()=>{
      this.props.deleteItems(this.values.id,this.navigateCours);
   }
   // Navigate to Course page
   navigateCours = (isNavi)=>{  // is Navigation value boolean
      if(isNavi){
       this.setState({...this.state,pageDelModel:false});
       this.props.history.push({pathname:'/home-page/content-page',state:this.props.location.state,itemObj:this.values});
      }

   }
   render(){
      const { pageData, title, vSts, isLoadConv, markAsDone, pageDelModel } = this.state;
      const isArchCrsEnable = UserSession.getArchCrsDtls();
      return(
         <div>
            <div className="page-content_container">
         <div className="content-view_options">
            {/* <div className="hide-content_view" onClick={()=>this.props.history.go(-1)}> */}
            <div className="hide-content_view" onClick={()=>this.props.history.push({pathname:'/home-page/content-page',state:this.props.location.state,itemObj:this.values})}>
               <Cross iconStyle="svg-icon_small icon-dark icon-pointer"/>
            </div>
            
           {!this.props.location?.state.isDisabledContent && <StaffWrapper>
               <div className="view-options">
                  {/* <More iconStyle="svg-icon_small icon-dark"/> */}
                  <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><Link to={{pathname:'/home-page/pages',search:`?id=${this.pageId}&chapId=${this.values &&this.values.chapId}&subId=${this.values && this.values.subId}`,state:this.props.location.state}}>
                     <Edit iconStyle="svg-icon_small icon-dark"/>
                  </Link></UIPerWrapper>

                        <UIPerWrapper perCode={["rp_can_delete_lms_content"]}><div className="more-options" >
                            <div  id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                           <MoreVertical className="svg-icon_small icon-dark icon-pointer left-icon"/>
                           </div>
                           <div class="dropdown-menu edit-chapter_cont">
                              {/* <div class="dropdown-item user-info_contents"  >
                                 <X className="svg-icon_light  icon-default"/>
                                 <span className="option-list_dropdown">Discard changes</span>
                              </div> */}
  
                              <div class="dropdown-item user-info_contents" onClick={()=>this.setState({...this.state,pageDelModel:true})}>
                                 <Trash2 className="svg-icon_light  icon-error"/>
                                 <span className="option-list_dropdown delete-option_btn">{this.props.t("translate:CHAPTERLISTCOMPONENT_DELETE")}</span>
                              </div>
                           </div>
                        </div></UIPerWrapper>
               </div>
                  




            </StaffWrapper>
   }
         </div>
         <div className="page-content_box">
         {!this.props.location?.state.isDisabledContent &&
         <StaffWrapper>
            <div>
            <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{vSts && vSts === 'F' ? 
               <div className="content-view_header">
               <p className="content-header_label">{this.props.t("translate:LEARNERS_ACCESS_ITEM")}</p>
               <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>this.publishContent('D')}>
               {this.props.t("translate:UNPUBLISHED")}  
               </Button>
               </div>
               :
               <div className="content-view_header">
                  <p className="content-header_label"> <Slash className="svg-icon_small icon-dark icon-space_left" />{this.props.t("translate:LEARNERS_CANT_ACCESS_ITEM")}</p>
                  <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>this.publishContent('F')}>
                           {this.props.t("translate:PUBLISHED")} 
                  </Button>
               </div>
            }</UIPerWrapper>
            </div>   
         </StaffWrapper>
   }
           <div className="page-view_header">
               <div className="page-header_name">
                  {this.props.slecSubChapNm && this.props.slecSubChapNm.length>0 &&
                  <p className="page-chap_name">{this.props.slecSubChapNm}</p>
                  }
                  <p className="page-title_name">{title}</p>
               </div>
               <StudentWrapper>
                  <StudentArchiveContentWrapper isContentView={_.isEmpty(isArchCrsEnable) ? false : true}>
                  <div className="stud-assignment_btn">
                     {/* check whether the student completed the mark as done or not */}
                     {markAsDone ? 
                           <Button theme="btn-rounded positive-btn btn-left">{this.props.t("translate:COMPLETED")}</Button> 
                           : !markAsDone && markAsDone !== undefined ?
                           <Button theme="btn-rounded secondary-btn btn-outline btn-left" clicked={() => this.markAsDone()}>{this.props.t("translate:MARK_AS_COMPLETED")}</Button>
                           :null
                     }
                  </div>
                  </StudentArchiveContentWrapper>
               </StudentWrapper>
            </div>
 
         <div class="project-tab">
            <div class="page-option_tabs">
               <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                  <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab"  aria-selected="true"onClick={()=>this.setState({isLoadConv:false})}>Content</a>
                  <StudentArchiveConversationWrapper>
                  {!this.props.location?.state.isDisabledContent &&
                     <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={()=>this.setState({isLoadConv:true})}>Conversations</a>
                  }
                  </StudentArchiveConversationWrapper>
                  {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Notes</a>
                  <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Activity log</a> */}

               </div>
            </div>
            <div class="tab-content page-tabs_container" id="nav-tabContent">
               <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
               <div className="page-content_viewer">
            {/* <p className="cont-header_text">{title}</p> */}
            <p  className="cont-text">
            {/* <div>{ ReactHtmlParser(pageData) }</div> */}
            <div><LmsEditorView contentData={pageData}/></div>
            </p>
         </div>
               </div>
               <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
              <div className="file_conversation_cont">
                 {isLoadConv && <ConversationComponent type='PAGE' title={title}/>} 
                 </div> 
             
               </div>
               <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                  <p>{this.props.t("translate:NOTES_CONTENT")}</p>
               </div>
            </div>
         </div>
             
         </div>
         </div>
         {/* students analytics wrapper */}
      {pageData &&  title && !_.isEmpty(pageData) && !_.isEmpty(title) && this.pageId && <SlideFooter sliderClbk={(pageId,type,currPage)=>this.contentFooterChange(pageId,type,currPage)} sliderData={this.props.subChapItems} selectedId={this.pageId} urlData={this.values} subChapNm={this.props.slecSubChapNm}/>}
      <StudentWrapper>
         {this.values && <AnalyticsWrapper values = {this.values}></AnalyticsWrapper>}
      </StudentWrapper>
      {pageDelModel && <LmsModal open={pageDelModel}  onClose={()=>this.setState({...this.state,pageDelModel:false})}  value={title} modalTitle={this.props.t("translate:CONFIRMATION_ALERTCOMPONENT_DELETE_ITEM")} btnName='item' confirmModal={true} onClick={() => this.deletePage()} />}
      </div>
      )
   }
}
const mapStateToProps = (state) => ({
   ...state.contentReducer
})
const mapDispatchToProps={
   loadItems,
   getSubChapName,
   updateMarkAsDone,
   deleteItems,
   updateCntViewLog
}
const TabNavigator = (props) => <ContentViewComponent {...props} />

const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components)
//export default withTranslation()(withRouter(ContentViewComponent));
