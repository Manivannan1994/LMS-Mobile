import React, { Component, lazy} from 'react';
import '../../styles/_studentAssignmentListStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import messageUtil from '../../utils/message-util';
import HTTPService from '../../utils/http-util';
import moment from 'moment';
import _ from 'lodash';
import { lmsDateAndTimeFormat} from '../../utils/helper';
import { withTranslation } from 'react-i18next';
import { filterArray } from '../../utils/filter-util';
import InfiniteScroll from "../infinite-scroll/InfiniteScroll";
import no_grade_book from '../../assets/images/grade-empty.svg';
import AnalyticsService from '../../service/analytics-service';
import UserSession from '../../utils/UserSession';
import archive_empty_img from '../../assets/images/archive-empty.svg';
const StudentArchiveContentWrapper = lazy(() =>
   import('../stud-arch-cont-wrapper/StudentArchiveContentWrapper')
);
const Searchbox = lazy(() =>
import('../searchbox/Searchbox')
);
const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);
const AnalyticsWrapper = lazy(() =>
   import('../analytics-wrapper/AnalyticsWrapper')
);
class StudentAssignmentListComponent extends Component {
   constructor(props) {
      super(props);
      this.skip = 0;
      this.todo = true;
      this.aPastAsgmntData = [];
      this.state = {
         curntWeekAsgnmnt: [],
         curntWeekAsgnmntCopy: [],
         overDueAsgnmnt: [],
         overDueAsgnmntCopy: [],
         upComingAsgnmnt: [],
         upComingAsgnmntCopy: [],
         searchValue: '',
         pastAsgmts: [],
         pastAsgmtsCopy: [],
         asgmntDudt: {},
         weekStart: '',
         weekEnd: '',
         curYear : '',
         oGrpGrads:{}

      };
   }
   componentDidMount() {
      AnalyticsService.setCurrPage('STUD_ASGN_LST');
      if (UserSession.archiveCourse && UserSession.archiveCourse.canViewCnt()) { // For course archive content
         this.getAsgmntDetOnLoad(false);
      }
   }

   //Calls when the scroll touches the bottom
   scrollToBottom = () => {
      this.skip += 10;
      this.getAsgmntDetOnLoad(true, 10, this.skip);
   }



   //get students assignment details onload function
   getAsgmntDetOnLoad = (allPastWork, limit, skip) => {
      if (this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)) {
         const oReq = {
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            DeptID: this.props.location.state.DeptID,
            SemID: this.props.location.state.SemID,
            AcYr: this.props.location.state.AcYr,
            SecID: this.props.location.state.SecID,
            type: 'ASGMNT',
            subjId: this.props.location.state.subId,
            TPID : this.props.location.state.TPID,
            allPastWork: allPastWork,
            skip: 0,
            projct: {
               title: 1,
               "asgmnt.asDuDt":1,
               "asgmnt.grdCnf":1,
               "asgmnt.mxMrk":1,
               chapId : 1,
               sChpId : 1,
               seqNo : 1
            }
         }
         //Set the limit & skip for get the students past assignments records based on the window scroll
         if (limit) {
            oReq.limit = limit;
         }
         if (skip) {
            oReq.skip = skip;
         }

         //get assignment details
         HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit', oReq, null, (err, data) => {
            if (data && data.output) {
               if (data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND" && this.todo) {
                  //messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               } else if (data.output.data && !_.isEmpty(data.output.data)) {
                  //limit presents then concatenate the assignment data
                  if (limit) {
                     data.output.data.forEach(asgmntItem => {
                        this.aPastAsgmntData.push(asgmntItem);
                     })
                     this.setState({ pastAsgmts: this.aPastAsgmntData });
                     this.setState({ pastAsgmtsCopy: this.aPastAsgmntData });
                  } else {
                     this.aPastAsgmntData = [];
                     const weekStart = moment(data.output.data.weekStart).format('MMM DD');
                     const weekEnd = moment(data.output.data.weekEnd).format('MMM DD');
                     const curYear = moment(data.output.data.weekStart).format('YYYY');
                     // this.setState({ curntWeekAsgnmnt:data.output.data.curntWeekAsgnmnt,overDueAsgnmnt:data.output.data.overDueAsgnmnt, upComingAsgnmnt: data.output.data.upComingAsgnmnt,weekStart:weekStart,weekEnd:weekEnd});
                     this.setState({
                        curntWeekAsgnmnt: data.output.data.curntWeekAsgnmnt,
                        overDueAsgnmnt: data.output.data.overDueAsgnmnt,
                        upComingAsgnmnt: data.output.data.upComingAsgnmnt,
                        overDueAsgnmntCopy: data.output.data.overDueAsgnmnt,
                        curntWeekAsgnmntCopy: data.output.data.curntWeekAsgnmnt,
                        upComingAsgnmntCopy: data.output.data.upComingAsgnmnt,
                        oGrpGrads:data.output.data.oGrpGrads,
                        weekStart: weekStart, weekEnd: weekEnd, curYear : curYear
                     });
                  }
               } else if (data.output.data && _.isEmpty(data.output.data) && this.todo) {
                  //messageUtil.showInfo("NO_ASSIGNMENT_FOUND", true);
               }
            } else {
               messageUtil.showError("UNKNOWN_ERROR", false);
            }

         })
      } else {
         console.log("NO_REQUEST_FOUND");
      }
   }

   searchHandling = (event,pastData) => {
      this.setState({ searchValue: event.target.value });
      if (event.target.value) {
         if(pastData){
            if (this.state.pastAsgmtsCopy && this.state.pastAsgmtsCopy.length) {
               this.setState({ pastAsgmts: filterArray(event.target.value, this.state.pastAsgmtsCopy, ['title']) })
            }
         }else{
            if (this.state.curntWeekAsgnmntCopy && this.state.curntWeekAsgnmntCopy.length) {
               this.setState({ curntWeekAsgnmnt: filterArray(event.target.value, this.state.curntWeekAsgnmntCopy, ['title']) })
            }
            if (this.state.overDueAsgnmntCopy && this.state.overDueAsgnmntCopy.length) {
               this.setState({ overDueAsgnmnt: filterArray(event.target.value, this.state.overDueAsgnmntCopy, ['title']) })
            }
            if (this.state.upComingAsgnmntCopy && this.state.upComingAsgnmntCopy.length) {
               this.setState({ upComingAsgnmnt: filterArray(event.target.value, this.state.upComingAsgnmntCopy, ['title']) })
            }
         }
      } else {
         this.setState({ curntWeekAsgnmnt: this.state.curntWeekAsgnmntCopy })
         this.setState({ upComingAsgnmnt: this.state.upComingAsgnmntCopy })
         this.setState({ overDueAsgnmnt: this.state.overDueAsgnmntCopy })
         if(pastData){
            this.setState({ pastAsgmts: this.state.pastAsgmtsCopy })
         }
      }
   }

   render() {
      const {curntWeekAsgnmnt,upComingAsgnmnt,overDueAsgnmnt}=this.state;
      const isArchCrsEnable = UserSession.getArchCrsDtls();
      return (
         <div>
            <div className="assignment-heading">
               <div className="cont-nav">
                  <div className="course-name">
                     <h6>{this.props.t("translate:STUD_ASMNT_ASSIGNMENT")}</h6>
                     <p>{this.props.t("translate:ASSIGNMENTLISTCOMPONENT_THE EASIEST WAY")}</p>
                  </div>
                  <div className="manual-setting">
                     {/* 
                     <Button theme="btn-rounded default ">
                        <Plus className="svg-icon_small icon-white " />
                        New Discussion
                     </Button>
                     */}
                     {/* <i class="header-options">
                        <MoreVertical className="svg-icon_small icon-dark" />
                     </i> */}
                  </div>
               </div>
            </div>
            <StudentArchiveContentWrapper>
            <div class="project-tab">
               <div class="student-assignment">
                  <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                     <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true" onClick={() => {
                        this.todo = true;
                        this.getAsgmntDetOnLoad(false);
                        this.setState({ searchValue: '' });
                     }}>{this.props.t("translate:TODO")}</a>
                     <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" onClick={() => {
                        this.todo = false;
                        this.skip = 0;
                        this.getAsgmntDetOnLoad(true, 10, 0);
                        this.setState({ searchValue: '' });
                     }}>{this.props.t("translate:ALL_PAST_WORKS")}
                     </a>
                  </div>
               </div>
               <div class="tab-content student-assignment_tab" id="nav-tabContent">
                  <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                  
                     <div className="student-assignment_list">
                        <div className="assignment-search_box">
                           <Searchbox
                              value={this.state.searchValue}
                              onChange={(event) =>
                                 this.searchHandling(event)
                              }

                              placeholder="search" searchBoxTheme="search-default search-box_default search-outline" />
                        </div>
                        {(curntWeekAsgnmnt && curntWeekAsgnmnt.length>0) || (upComingAsgnmnt && upComingAsgnmnt.length>0) || (overDueAsgnmnt && overDueAsgnmnt.length>0) ?
                        <div>
                        {this.state.overDueAsgnmnt && this.state.overDueAsgnmnt.length > 0 &&
                           <p className="assignment-due_info">{this.props.t("translate:OVER_DUE")}</p>   
                        }
                        {this.state.overDueAsgnmnt && this.state.overDueAsgnmnt.length > 0 && this.state.overDueAsgnmnt.map((overDueAsgnmntItems) => {
                           //   const asDuDt = moment(overDueAsgnmntItems.asgmnt.asDuDt).format('MMM DD, hh:mm A');
                           let date = lmsDateAndTimeFormat(overDueAsgnmntItems.asgmnt.asDuDt)

                           return (
                              <div>
                                 <div className="student-assignment_content">
                                    {/* <p className="assignment-due_info">Overdue</p> */}
                                    <div className={overDueAsgnmntItems.isHide?"stud-assignment_list--hide":"stud-assignment_list"} onClick={() => {!overDueAsgnmntItems.isHide && this.props.history.push({ pathname: '/home-page/assignment-view', search: `?id=${overDueAsgnmntItems._id}&assgnmntView=${true}`, state: this.props.location.state })}}>
                                       <div className={overDueAsgnmntItems.isHide?"assignment-due--hide":"assignment-due"}>
                                          <p className={overDueAsgnmntItems.isHide?"assignment-due_title--hide":"assignment-due_title"}>{overDueAsgnmntItems.title}</p>
                                          <p className="assignment-due_cont"><span className="assign-dues">{this.props.t("translate:STUD_ASMNT_OVERDUE")}</span> <span className="assign-dot"></span> <span className="assignment-due">Due  {date}</span></p>
                                       </div>
                                       <div className="assignment-conversation">
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                        {this.state.curntWeekAsgnmnt && this.state.curntWeekAsgnmnt.length > 0 &&
                           <p className="assignment-due_info">{this.state.weekStart} - {this.state.weekEnd}, {this.state.curYear} {this.props.t("translate:THIS_WEEK")}</p>
                        }
                        {this.state.curntWeekAsgnmnt && this.state.curntWeekAsgnmnt.length > 0 && this.state.curntWeekAsgnmnt.map((curntWeekAsgnmntItems) => {
                           //   const asDuDt = moment(curntWeekAsgnmntItems.asgmnt.asDuDt).format('MMM DD, hh:mm A');
                           let date = lmsDateAndTimeFormat(curntWeekAsgnmntItems.asgmnt.asDuDt)
                           
                           return (
                              <div>
                                 <div className="student-assignment_content" onClick={() => {!curntWeekAsgnmntItems.isHide && this.props.history.push({ pathname: '/home-page/assignment-view', search: `?id=${curntWeekAsgnmntItems._id}&assgnmntView=${true}`, state: this.props.location.state })}}>
                                    <div className={curntWeekAsgnmntItems.isHide?"stud-assignment_list--hide":"stud-assignment_list"}>
                                       <div className={curntWeekAsgnmntItems.isHide?"assignment-due--hide":"assignment-due"}>
                                          <p className={curntWeekAsgnmntItems.isHide?"assignment-due_title--hide":"assignment-due_title"}>{curntWeekAsgnmntItems.title}</p>
                                          {(curntWeekAsgnmntItems.grdSts && curntWeekAsgnmntItems.grdSts === 'GRD') ?
                                             (<p className="assignment-due_cont"><span className="assign-grad">{this.props.t("translate:STUD_ASMNT_GRADED")}</span>
                                                <span className="assign-dot"></span> <span className="assignment-due">
                                                   {/* 45/100 points */}
                                                   {curntWeekAsgnmntItems.asgmnt.grdCnf && curntWeekAsgnmntItems.asgmnt.grdCnf ==='POINT'?
                                                  <span>
                                                 {curntWeekAsgnmntItems.mark}/{curntWeekAsgnmntItems.asgmnt.mxMrk} {this.props.t("translate:STUD_ASMNT_POINTS")} </span> 
                                                 :                                            
                                                    <span>
                                                      { 
                                                      curntWeekAsgnmntItems.grad && this.state.oGrpGrads && this.state.oGrpGrads[curntWeekAsgnmntItems.grad] && this.state.oGrpGrads[curntWeekAsgnmntItems.grad].length > 0 ? this.state.oGrpGrads[curntWeekAsgnmntItems.grad][0].GrdNm:''
                                                      } {this.props.t("translate:STUD_ASMNT_GRADE")}
                                                    </span>                     
                                                  }
                                                  {/* {curntWeekAsgnmntItems.mark}/{curntWeekAsgnmntItems.asgmnt.mxMrk} points                                                                                                 */}
                                                    </span></p>)                                                 
                                             :(<p className="assignment-due_cont">
                                                {curntWeekAsgnmntItems.asgmSts && curntWeekAsgnmntItems.asgmSts === 'SUB' ?
                                                   <span className="assign-submit">{this.props.t("translate:STUD_ASMNT_SUBMITTED")}</span>
                                                   : curntWeekAsgnmntItems.asgmSts === 'missed' ? <span className="assign-missed">{this.props.t("translate:MISSED")}</span>
                                                   : curntWeekAsgnmntItems.grdSts === 'GRD' ? <span className="assign-grad">{this.props.t("translate:STUD_ASMNT_GRADED")}</span> : null
                                                }
                                                {curntWeekAsgnmntItems.asgmSts && curntWeekAsgnmntItems.asgmSts !== 'NS' &&
                                                   <span className="assign-dot"></span>
                                                }
                                                <span className="assignment-due">{this.props.t("translate:STUD_ASMNT_DUE")}  {date}</span></p>)}
                                          {/* {curntWeekAsgnmntItems.mxMrk} */}


                                       </div>

                                       <div className="assignment-conversation">
                                       </div>
                                    </div>
                                    {/* <div className="stud-assignment_list">
                                       <div className="assignment-due">
                                          <p className="assignment-due_title">Assignment title goes here</p> 
                                          <p className="assignment-due_cont"><span className="assign-grad">GRADED</span> <span className="assign-dot"></span> <span className="assignment-due">45/100 points</span></p>
                                       </div>
                                       <div className="assignment-conversation">
                                          <MessageCircle className="svg-icon_small icon-primary" />
                                       </div>
                                    </div> */}
                                    {/* <div className="stud-assignment_list">
                                       <div className="assignment-due">
                                          <p className="assignment-due_title">Assignment title goes here</p>
                                          <p className="assignment-due_cont"><span className="assign-grad">EXTENSION</span> <span className="assign-dot"></span> <span className="assignment-due">Due Jul 02, 09:00AM</span></p>
                                       </div>
                                       <div className="assignment-conversation">
                                       </div>
                                    </div> */}

                                 </div>

                              </div>

                           )
                        })}

                        {this.state.upComingAsgnmnt && this.state.upComingAsgnmnt.length > 0 &&
                           <p className="assignment-due_info">{this.props.t("translate:UPCOMING")}</p>
                        }
                        {this.state.upComingAsgnmnt && this.state.upComingAsgnmnt.length > 0 && this.state.upComingAsgnmnt.map((upComingAsgnmntItems) => {
                           //   const asDuDt = moment(upComingAsgnmntItems.asgmnt.asDuDt).format('MMM DD, YYYY, hh:mm A')   
                           let date = lmsDateAndTimeFormat(upComingAsgnmntItems.asgmnt.asDuDt)

                           return (
                              <div>
                                 <div className="student-assignment_content">
                                    <div className={upComingAsgnmntItems.isHide?"stud-assignment_list--hide":"stud-assignment_list"}>
                                       <div className={upComingAsgnmntItems.isHide?"assignment-due--hide":"assignment-due"} onClick={() => {!upComingAsgnmntItems.isHide && this.props.history.push({ pathname: '/home-page/assignment-view', search: `?id=${upComingAsgnmntItems._id}&assgnmntView=${true}`, state: this.props.location.state })}}>
                                          <p className={upComingAsgnmntItems.isHide?"assignment-due_title--hide":"assignment-due_title"}>{upComingAsgnmntItems.title}</p>
                                          {(upComingAsgnmntItems.grdSts && upComingAsgnmntItems.grdSts === 'GRD') ?
                                             (<p className="assignment-due_cont"><span className="assign-grad">{this.props.t("translate:STUD_ASMNT_GRADED")}</span>
                                                <span className="assign-dot"></span> <span className="assignment-due">
                                                   {upComingAsgnmntItems.asgmnt.grdCnf && upComingAsgnmntItems.asgmnt.grdCnf === 'POINT'?
                                                 <span>
                                                {upComingAsgnmntItems.mark}/{upComingAsgnmntItems.asgmnt.mxMrk} {this.props.t("translate:STUD_ASMNT_POINTS")}</span>
                                                 :                            
                                                   <span>
                                                     { 
                                                     upComingAsgnmntItems.grad && this.state.oGrpGrads && this.state.oGrpGrads[upComingAsgnmntItems.grad] && this.state.oGrpGrads[upComingAsgnmntItems.grad].length > 0 ? this.state.oGrpGrads[upComingAsgnmntItems.grad][0].GrdNm:''
                                                     } {this.props.t("translate:STUD_ASMNT_GRADE")}
                                                   </span>                                                  
                                                 }
                                                 {/* {upComingAsgnmntItems.mark}/{upComingAsgnmntItems.asgmnt.mxMrk} points                                                                                                 */}
                                                 </span></p>)
                                    
                                        : (<p className="assignment-due_cont">
                                                {upComingAsgnmntItems.grdSts && upComingAsgnmntItems.grdSts === 'GRD' ?
                                                   <span className="assign-grad">{this.props.t("translate:STUD_ASMNT_GRADED")}</span> :
                                                   upComingAsgnmntItems.asgmSts && upComingAsgnmntItems.asgmSts === 'SUB' ?
                                                      <span className="assign-submit">{this.props.t("translate:STUD_ASMNT_SUBMITTED")}</span> : null
                                                }
                                                {upComingAsgnmntItems.asgmSts && upComingAsgnmntItems.asgmSts !== 'NS' &&
                                                   <span className="assign-dot"></span>
                                                }
                                                <span className="assignment-due">{this.props.t("translate:STUD_ASMNT_DUE")}  {date}</span>
                                          </p>)}
                                       </div>
                                       <div className="assignment-conversation">
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )
                        })}
                        </div>
                        : <NoRecord img={no_grade_book} imgSize="no-data_img-default" noAsgmntCnt={true}/>
                        }

                     </div>
                     
                  </div>
                 
                  <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                     {/* listen for when you have scrolled to the bottom   */}
                     {!this.todo && 
                        <InfiniteScroll
                           dataLength={this.state.pastAsgmts.length}
                           next={this.scrollToBottom}
                           hasMore={true}
                        ></InfiniteScroll>
                     }
                        <div className="student-assignment_list">
                           <div className="assignment-search_box">
                              <Searchbox 
                              value={this.state.searchValue}
                              onChange={(event) =>
                                 this.searchHandling(event,true)
                              }
                              placeholder="search" searchBoxTheme="search-default search-box_default search-outline" />
                           </div>
                           {this.state.pastAsgmts && this.state.pastAsgmts.length > 0 ?
                           <div className="student-assignment_content">
                              {/* <p className="assignment-due_info">Jun 30 - Jul 24, 2020</p> */}
                              {this.state.pastAsgmts && this.state.pastAsgmts.length > 0 && this.state.pastAsgmts.map((pastAsgmtItem) => {
                                 const date = lmsDateAndTimeFormat(pastAsgmtItem.asgmnt.asDuDt);
                                 return (
                                    <div>
                                       <div className={pastAsgmtItem.isHide?"stud-assignment_list--hide":"stud-assignment_list"}>
                                          <div className={pastAsgmtItem.isHide?"assignment-due--hide":"assignment-due"} onClick={() => {!pastAsgmtItem.isHide && this.props.history.push({ pathname: '/home-page/assignment-view', search: `?id=${pastAsgmtItem._id}&pastAsgmnt=${true}`, state: this.props.location.state })}}>
                                             <p className={pastAsgmtItem.isHide?"assignment-due_title--hide":"assignment-due_title"}>{pastAsgmtItem.title}</p>
                                             
                                             {( pastAsgmtItem.grdSts && pastAsgmtItem.grdSts === 'GRD') ? 
                                             (<p className="assignment-due_cont"><span className="assign-grad">{this.props.t("translate:STUD_ASMNT_GRADED")}</span>
                                             <span className="assign-dot"></span> <span className="assignment-due">
                                                {pastAsgmtItem.asgmnt.grdCnf && pastAsgmtItem.asgmnt.grdCnf ==='POINT'?
                                             
                                             <span>
                                             {pastAsgmtItem.mark}/{pastAsgmtItem.asgmnt.mxMrk} {this.props.t("translate:STUD_ASMNT_POINTS")}</span>
                                             :                            
                                                <span>
                                                { 
                                                pastAsgmtItem.grad && this.state.oGrpGrads && this.state.oGrpGrads[pastAsgmtItem.grad] && this.state.oGrpGrads[pastAsgmtItem.grad].length > 0 ? this.state.oGrpGrads[pastAsgmtItem.grad][0].GrdNm:''
                                                } {this.props.t("translate:STUD_ASMNT_GRADE")}
                                                </span>                                                  
                                             }
                                             </span></p>)
                                          : (<p className="assignment-due_cont">
                                                {pastAsgmtItem.asgmSts && pastAsgmtItem.asgmSts === 'SUB' &&
                                                   <span className="assign-submit">{this.props.t("translate:STUD_ASMNT_SUBMITTED")}</span>
                                                }
                                                {pastAsgmtItem.asgmSts && pastAsgmtItem.asgmSts === 'NS' &&
                                                   <span className="assign-missed">{this.props.t("translate:MISSED")}</span>
                                                }
                                                <span className="assign-dot"></span>
                                                <span className="assignment-due">{this.props.t("translate:STUD_ASMNT_DUE")} {date}</span>
                                             </p>)
                                             }
                                          </div>
                                          <div className="assignment-conversation">
                                          </div>
                                       </div>
                                    </div>
                                 )
                              })}
                           </div>
                           : <NoRecord img={no_grade_book} imgSize="no-data_img-default" noAsgmntCnt={true}/>}
                        </div>
                  </div>
               </div>
            </div>
            </StudentArchiveContentWrapper>
            {isArchCrsEnable && !_.isEmpty(isArchCrsEnable) && UserSession.archiveCourse &&  !UserSession.archiveCourse.canViewCnt() &&
               <NoRecord img={archive_empty_img} imgSize="no-data_img-small" archivedEmptyContent={true} emtyCntTxt="ARCHIVE_ASSIGNMENT" />
            }
            <AnalyticsWrapper></AnalyticsWrapper>
         </div>
      )
   }

}

export default withTranslation()(StudentAssignmentListComponent);