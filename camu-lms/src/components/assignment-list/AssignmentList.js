import React, { Component,lazy } from 'react';
import '../../styles/_assignmentlistStyle.scss';
import { withTranslation } from "react-i18next";
import '../../styles/_iconStyle.scss';
import { MoreVertical,Edit,Trash2, Slash,CheckCircle} from 'react-feather';
// import { SelectOption } from '../icons/Icons';
import '../../styles/_iconStyle.scss';
import HTTPService from "../../utils/http-util";
import { connect } from 'react-redux';
import messageUtil from '../../utils/message-util';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { filterArray } from '../../utils/filter-util';
import { lmsDateAndTimeFormat} from '../../utils/helper';
import no_grade_book from '../../assets/images/grade-empty.svg';

const Searchbox = lazy(() =>
import('../searchbox/Searchbox')
);
const LmsModal = lazy(() =>
import("../modal/LmsModal")
);
const Courseheader = lazy(() =>
import('../course-header/CourseHeader')
);
const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
class AssignmentListComponent extends Component {
   constructor(props) {
      super(props);
      this.existState={};
      this.state = {
         asgmtData: [],
         dltAsmntId:'',
         dltAsmntKey:false,
         dltAsmntNm:'',
         searchValue:'',
        asgmtDataCopy:[]
      };
   }

   componentDidMount() {
      this.existState=this.props.location.state;
      this.getAsgmntDetOnLoad();
   }

   //get assignment details onload function
   getAsgmntDetOnLoad = () => {
      if(this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
        
            const oReq = {
               PrID: this.props.location.state.PrID,
               CrID: this.props.location.state.CrID,
               DeptID: this.props.location.state.DeptID,
               SemID: this.props.location.state.SemID,
               AcYr: this.props.location.state.AcYr,
               SecID: this.props.location.state.SecID,
               type: 'ASGMNT',
               subjId:this.props.location.state.subId,
               projct: {
                  'title': 1,
                  'vSts':1,
                  'asgmnt.asDuDt': 1,
                  "sChpId": 1,
                  "seqNo" : 1

               }
            }
         //get assignment details
         HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit', oReq, null, (err, data) => {
            if(data && data.output ){
               if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
                 // messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               }else if(data.output.data && !_.isEmpty(data.output.data)){
                  this.setState({ asgmtData: data.output.data,asgmtDataCopy:data.output.data })
               }else if(data.output.data && _.isEmpty(data.output.data)){
                 // messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               }
            }else{
               messageUtil.showError("UNKNOWN_ERROR", false);
            }
            
         })
      }else{
         console.log("NO_REQUEST_FOUND");
      }
   }


   //To delete assignment
   deleteAsgmnt=(asgmntId)=>{
      HTTPService.post('/teaching-content/deactive-subchapter-items', {id:asgmntId}, null, (err,response) => {
         if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "UPDATED_SUCCESS") {
            this.delteAsgnmntModalAction(false);
            this.getAsgmntDetOnLoad();
            messageUtil.showSuccess("ASSIGNMENT_DELETED_SUCCESSFULLY",true);
         }else if(response && response.output && response.output.data && response.output.data.code && response.output.data.code === "NO_DOCS_FOUND"){
            messageUtil.showInfo("ASSIGNMENT_NOT_DELETED", true);
         }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
         }
     })
   }

   delteAsgnmntModalAction=(modelShowKey,asmntId,asmntTitle)=>{
      if(modelShowKey){
         this.setState({ dltAsmntKey: modelShowKey,dltAsmntId: asmntId,dltAsmntNm: asmntTitle });
      }else{
         this.setState({ dltAsmntKey: false,dltAsmntId: '',dltAsmntNm: '' });
      }
      
   }
// assignment search 
    searchHandling = (event) => {
    this.setState({searchValue:event.target.value });
    if (this.state.searchValue) {
    this.setState({asgmtData:filterArray(event.target.value, this.state.asgmtDataCopy, ['title'])})
    } 
   else {
   this.setState({asgmtData: this.state.asgmtDataCopy})
   }
  }

   render() {
      return (
         <div >
            <div className="assignment-heading">
               <Courseheader 
                title={this.props.t("translate:ASSIGNMENTLISTCOMPONENT_ASSIGNMENTS")}
                content={this.props.t("translate:ASSIGNMENTLISTCOMPONENT_THE EASIEST WAY") }
                moreVertical={true}
                />
            </div>
            
            <div className="assignment-selection">
               <div className="assignment-search">
                  <div class="row m-0">
                     <div class="col-6 p-0">
                        <div className="cont-search-box">
                           <Searchbox placeholder={this.props.t("translate:SEARCH")}
                           value={this.state.searchValue}
                           onChange={(event) =>
                           this.searchHandling(event)
                             }
                           searchBoxTheme="search-default search-box_default search-outline" />
                        </div>
                     </div>
                     <div class="col-6 p-0">
                        <div className="assignment-option_list">
                           {/* <div className="assignment-view_option">
                              <List className="svg-icon_small icon-dark" />
                              <Grid className="svg-icon_small icon-dark left-icon" />
                           </div> */}
                        </div>
                     </div>
                  </div>
               </div>
               {this.state.asgmtData && this.state.asgmtData.length > 0 ?
               <div>
                  {this.state.asgmtData.map((asgmtItems, index) => {
                     return(
                     <div className="assignment-lists">
                        <div className="assignment-titles" onClick={()=>this.props.history.push({pathname:'/home-page/assignment-view',search:`?id=${asgmtItems._id}&assgnmntView=${true}`,state:this.existState})}>
                           <p className="assignment_heading">{asgmtItems.title}</p>
                          {/* <p className="assignment_content"> {this.props.t("translate:STUD_ASMNT_DUE")}: {asgmtItems.asgmnt && asgmtItems.asgmnt.asDuDt ? lmsDateAndTimeFormat(asgmtItems.asgmnt.asDuDt) : '-'} </p> */}
                           <p className="assignment_content"> {asgmtItems.sChpName}  {this.props.t("translate:STUD_ASMNT_DUE")}:{asgmtItems.asgmnt && asgmtItems.asgmnt.asDuDt ? lmsDateAndTimeFormat(asgmtItems.asgmnt.asDuDt) : '-'} </p> 
                         {/* <p className="assignment_content"> {asgmtItems.sChpName}</p>  */}
                        </div>
                        <div className="assignment-options">
                           <UIPerWrapper perCode={["rp_can_pub_lms_content"]}>{ asgmtItems && asgmtItems.vSts && asgmtItems.vSts ==='F' ? 
                              <span className="tooltip--bottom" data-tooltip="Published">
                           {/* <SelectOption iconStyle="svg-icon_default icon-positive" />  */}
                           <CheckCircle className="svg-icon_small icon-positive" />
                           </span>
                           : 
                           <span className="tooltip--bottom" data-tooltip="Unpublished">
                           <Slash className="svg-icon_small icon-default " />
                           </span>
                           }</UIPerWrapper>
                           {!this.props.location.state?.isDisabledContent &&  
                              <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                                 <MoreVertical className="svg-icon_small icon-dark left-icon icon-pointer" />
                              </div>
                           }
                           <div class="dropdown-menu edit-chapter_cont">
                              <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div class="dropdown-item user-info_contents" onClick={()=>this.props.history.push({pathname:'/home-page/assignment',search:`?id=${asgmtItems._id}&assgnmntView=${true}`,state:this.existState})}>
                                 <Edit className="svg-icon_light  icon-default" />
                                 <span className="option-list_dropdown">{this.props.t("translate:ASSIGNMENTLISTCOMPONENT_EDIT")}</span>
                              </div></UIPerWrapper>
                              {/* <a class="dropdown-item user-info_contents">
                                 <Book className="svg-icon_light  icon-default" />
                                 <span className="option-list_dropdown">{this.props.t("translate:ASSIGNMENTLISTCOMPONENT_DUPLICATE")}</span>
                              </a> */}
                              <UIPerWrapper perCode={["rp_can_delete_lms_content"]}><div class="dropdown-item user-info_contents"
                              onClick={()=>
                                 //Open Confirmation Modal for assigment delete
                                 this.delteAsgnmntModalAction(true,asgmtItems._id,asgmtItems.title)
                              }>
                                 <Trash2 className="svg-icon_light icon-error" />
                                 <span className="option-list_dropdown delete-chap_cont">{this.props.t("translate:DELETE")}</span>
                              </div></UIPerWrapper>
                           </div>
                        </div>
                     </div>
                  )})}
               </div>
               : <NoRecord img={no_grade_book} imgSize="no-data_img-default" noAsgmntCnt={true}/>}
            </div>
            
         {this.state.dltAsmntKey && <LmsModal open={this.state.dltAsmntKey} onClose={()=>this.delteAsgnmntModalAction(false)}  value={this.state.dltAsmntNm} modalTitle={this.props.t("translate:DELETE_ASSIGNMENTS")} btnName='item' confirmModal={true} onClick={()=>this.deleteAsgmnt(this.state.dltAsmntId)}/>}
         </div>
         )
      }
}

const mapStateToProps = (state) => ({
   ...state.contentReducer,
})

const TabNavigator = (props) => <AssignmentListComponent {...props} />

const Components = connect(mapStateToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));


// export default withTranslation()(AssignmentListComponent);
