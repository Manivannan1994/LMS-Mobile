import React, { Component, lazy } from 'react';
//import { DownArrow } from '../components/icons/Icons';
import '../styles/_iconStyle.scss';
import '../styles/_dashbordpageStyle.scss';
import '../styles/_dropdownStyle.scss';
import '../styles/_commonLmsStyle.scss';
import { FooterComponent } from '../components/footer/Footer';
import SearchBox from '../components/searchbox/Searchbox';
import HeaderComponent from '../components/header/Header';
import { connect } from 'react-redux'
import { updateFields, getSubjByEntprsDtls, getStaffClasses, getSubjByEntprsDtlPrmsn } from '../store/actions/DashboardActions';
import { withRouter } from 'react-router-dom';
import { getSessionDtls } from '../store/actions/HeaderAction';
import { withTranslation } from "react-i18next";
import SubjectContent from '../components/subject-content/SubjectContent';
import { filterArray } from '../utils/filter-util';
import _ from "lodash";
import { localStorageSet,localStorageGet } from '../utils/helper';
import nodata from '../assets/images/nodata-dashboard.png';
import NoRecord from '../components/error-page/Datanotfound';
import AnalyticsService from '../service/analytics-service';
import {crateAndUpdateCntSts, updateCntViewLog} from '../store/actions/AnalyticsAction';
import UserSession from '../utils/UserSession';
import ReactSelect from '../components/react-select/ReactSelect';
import FilterView from './FilterView';
const AnalyticsWrapper = lazy(() =>
   import('../components/analytics-wrapper/AnalyticsWrapper')
);
const StudentWrapper = lazy(() =>
   import('../components/student-wrapper/StudentWrapper')
);

class DashboardPage extends Component {
   constructor(props) {
      super(props);
      this.getStaffCls=true;
      this.state = {
         value: '',
         searchValue:'',
         isAdminOrHOD: false,
         selectedFilterData: null
      };
      AnalyticsService.setCurrPage('DSHBRD_PG');
   }
   // Set the header values
   componentDidMount() {
      // get dashboard detail in localStorage 
      let eachLocalVal;
      let selectedValue;

      if(this.props.session && this.props.session.mappedid){
         selectedValue = localStorageGet('userPref')?.[this.props.session.mappedid]?.crsDashboardData;
         if (selectedValue) {
            if (this.state.isAdminOrHOD) {
               eachLocalVal = `${selectedValue.AcYrNm}, ${selectedValue.SemName}`;
            } else {
               if(selectedValue.PrCode && selectedValue.CrCode && selectedValue.AcYrNm && selectedValue.SemName){
                  eachLocalVal = `${selectedValue.PrCode}, ${selectedValue.CrCode}, ${selectedValue.AcYrNm}, ${selectedValue.SemName}`;
               }else if(selectedValue.CrCode && selectedValue.acyrNm && selectedValue.semNm){
                  eachLocalVal = `${selectedValue.CrCode}, ${selectedValue.acyrNm}, ${selectedValue.semNm}`;
               }
            }
         }
      }
      this.props.acYr.forEach((item, index) => {
         let grpKey;
         if (this.state.isAdminOrHOD) {
            grpKey = `${item.AcYrNm}, ${item.SemName}`;
         } else {
            if (item.PrCode && item.CrCode && item.AcYrNm && item.SemName) {
               grpKey = `${item.PrCode}, ${item.CrCode}, ${item.AcYrNm}, ${item.SemName}`;
            }else if(item.CrCode && item.acyrNm && item.semNm){
               grpKey = `${item.CrCode}, ${item.acyrNm}, ${item.semNm}`;
            }
         }

         if (grpKey && selectedValue && eachLocalVal && eachLocalVal === grpKey) {
            this.setState({ ...this.state, value: eachLocalVal });
         }
      })
      //this.props.getStaffClasses();
   }

   // Trigger function when session updates
   componentDidUpdate(prevProps) {
      // Check if session has changed
      if (prevProps.session !== this.props.session) {
         this.setState({ isAdminOrHOD: UserSession.isGotPerm(['rp_admin_2o_lms']) || UserSession.isGotPerm(['rp_hod_lms_view']) });
      }
   }

   //load the subjects respective to the selection details
   handleChange = (event) => {
      let dashboardData = localStorageGet('userPref');
      this.props.acYr.forEach((item) => {
         let grpKey;
         if (item.PrCode && item.CrCode && item.AcYrNm && item.SemName) {
            if (this.state.isAdminOrHOD) {
               grpKey = `${item.AcYrNm}, ${item.SemName}`;
            } else {
               grpKey = `${item.PrCode}, ${item.CrCode}, ${item.AcYrNm}, ${item.SemName}`;
            }
         }else if(item.CrCode && item.acyrNm && item.semNm){
            grpKey = `${item.CrCode}, ${item.acyrNm}, ${item.semNm}`;
         }

         if(event.label && grpKey && event.label === grpKey){
           // set the dashbord details in localstorage
            if(_.isEmpty(dashboardData) ||  !dashboardData){
               dashboardData = {};
            }
            if(this.props.session.mappedid){
               if(!dashboardData[this.props.session.mappedid]){
                  dashboardData[this.props.session.mappedid] = {crsDashboardData:{}};
               }
               dashboardData[this.props.session.mappedid].crsDashboardData = item;
            }
            localStorageSet('userPref',dashboardData);
            this.setState({ ...this.state, value: event.label, selectedFilterData: event.data }, () => {
               if (this.state.isAdminOrHOD) {
                  this.props.getSubjByEntprsDtlPrmsn(item, this.props.session);
               } else {
                  this.props.getSubjByEntprsDtls(item, this.props.session);
               }
            });
         }
      })
   };

   // trigger on table item click
   handleSubjectClick = (item) => {
      this.props.history.push({
         pathname: '/home-page/content-page', 
         state: {
            ...item,
            InId: this.props.selcDtls.InId,
            subId: item.SubjId,
            subNa: item.SubjNm,
            SecID: item.SecID,
            SecName: item.SecNm,
            StaffId: item.StaffId,
            DeptID: item.DeptID,
            PrID: item.PrID ? item.PrID : this.props.selcDtls.PrID,
            CrID: item.CrID ? item.CrID : this.props.selcDtls.CrID,
            SemID: item.SemID ? item.SemID : this.props.selcDtls.SemID,
            SemName: item.SemNm ? item.SemNm : this.props.selcDtls.SemName,
            AcYrNm: item.AcYrNm ? item.AcYrNm : this.props.selcDtls.AcYrNm,
            CrName: item.CrNm ? item.CrNm : this.props.selcDtls.CrName,
            AcYr: item.AcYr ? item.AcYr : this.props.selcDtls.AcYr,
            isDisabledContent: this.state.selectedFilterData?.isCurSem === false ? true : false,
            isEnableAiChat: this.props.session?.isEnableAiChat,
            fromTable: UserSession.isGotPerm(['rp_admin_2o_lms']) ? false : (!(this.props.session.mappedid === item.StaffId) && true)   // enable edit for current login
         }, 
         itemObj: item
      });

   }

// filter for course
searchHandling = (event) => {
   this.setState({searchValue:event.target.value });
   if (this.state.searchValue) {
      this.props.updateFields('subjects',filterArray(event.target.value.toLowerCase().replace(/\s/g, ""), this.props.subjectsCopy, ['SubjNm','Code']))
   } else {
      this.props.updateFields('subjects',this.props.subjectsCopy)
   }
}
   //Get the staff classes after receiving the session details
   componentWillReceiveProps(NextToProps){
      //Calls only once
      if (!_.isEmpty(NextToProps.session) && this.getStaffCls) {
         this.getStaffCls=false;
         NextToProps.session.isDashBrdDispchAcYr = true; // is dash board dispatch academic year
         this.props.getStaffClasses(NextToProps.session);
      }

   }
   render() {
      const { acYr, subjects, selcDtls, session, OutCmBsdEdu } = this.props;
      const aSelctCtrlData = [];  // select control data
      const localstorageData = localStorageGet('userPref')?.[session.mappedid]?.crsDashboardData;
      let curntIndex = 0;      // current data
      if(UserSession.isStaff() &&  acYr && acYr.length > 0 && session && session.mappedid){   // staff slection
         acYr.forEach((item,index) => {
            let grpKey;
            let eachLocStrge;
            if (item.PrCode && item.CrCode && item.AcYrNm && item.SemName) {
               if (this.state.isAdminOrHOD) {
                  grpKey = `${item.AcYrNm}, ${item.SemName}`;
               } else {
                  grpKey = `${item.PrCode}, ${item.CrCode}, ${item.AcYrNm}, ${item.SemName}`;
               }
               if(localstorageData){
                  eachLocStrge = this.state.isAdminOrHOD ? 
                  `${localstorageData.AcYrNm}, ${localstorageData.SemName}` :
                  `${localstorageData.PrCode}, ${localstorageData.CrCode}, ${localstorageData.AcYrNm}, ${localstorageData.SemName}`;
               }
            }
            aSelctCtrlData.push({value:item._id,label:grpKey, data:item});
            if((grpKey && this.state.value && this.state.value === grpKey) || (grpKey && eachLocStrge && eachLocStrge === grpKey)){
               curntIndex = index;
            }
         });
      }
      if(UserSession.isStudent() &&  acYr && acYr.length > 0 && session && session.mappedid){   // student slection
         acYr.forEach((item,index) => {
            let grpKey;
            let eachLocStrge;
            if (item.CrCode && item.acyrNm && item.semNm) {
               grpKey = `${item.CrCode}, ${item.acyrNm}, ${item.semNm}`;
               if(localstorageData){
                  eachLocStrge = `${localstorageData.CrCode}, ${localstorageData.acyrNm}, ${localstorageData.semNm}`;
               }
            }
            aSelctCtrlData.push({value:item._id,label:grpKey, data:item});
            if((grpKey && this.state.value && this.state.value === grpKey) || (grpKey && eachLocStrge && eachLocStrge === grpKey)){
               curntIndex = index;
            }
         });
      }

      return (
         <div>
            <div>
               <div className="dashboard-nav">
                  <div className="fixed-header">
                     <HeaderComponent />
                  </div>
                  <div className="dashboard-contents">
                     <div className="dashboard-search_cont">
                        <div class="row m-0">
                           <div class="col-6 p-0">
                              <div className="cont-search-box">
                                 <SearchBox
                                    value={this.state.searchValue}
                                    placeholder={this.props.t("translate:SEARCH_COURSES")}
                                    onChange={(event) =>
                                       this.searchHandling(event)
                                    }
                                    searchBoxTheme="search-default search-box_default search-outline" />

                              </div>
                           </div>
                           <div class="col-6 p-0">
                              <div className="selector-course">
                              { aSelctCtrlData && aSelctCtrlData.length > 0 && 
                                 <ReactSelect data={aSelctCtrlData} curntIndex={curntIndex} onChange={(event)=>this.handleChange(event)}>
                                    
                                 </ReactSelect>
                              }
                              </div>
                              {/* <span className="filter-cont">
                        {this.props.t("translate:Filter")}
                        </span> */}
                           </div>
                        </div>
                     </div>
                     <div className="dept-lists">
                        {subjects && subjects.length ? (
                           <>
                              {this.state.isAdminOrHOD ? (
                                 <FilterView subject={subjects} onClickRow={this.handleSubjectClick} />
                              ) : (
                                 <SubjectContent
                                    session={session}
                                    subject={subjects}
                                    OutCmBsdEdu={OutCmBsdEdu}
                                    enterPriseDtls={selcDtls}
                                    isStaff={UserSession.isStaff()}
                                    semConfigDetls={aSelctCtrlData[curntIndex]}
                                    clicked={() => this.props.getTeachContentBySubjSelection}
                                 />
                              )}
                           </>
                        ) : (
                           <>
                              {this.state.searchValue && this.state.searchValue.length ? (
                                 <NoRecord clicked={() => this.searchHandling({ target: { value: "" } })} courseContentEmpty={true} />
                              ) : (
                                 <NoRecord img={nodata} imgSize="no-data_img-default" dashboardContent={true} />
                              )}
                           </>
                        )}
                     </div>
                  </div>
                  <FooterComponent />
               </div>
            </div>
            <StudentWrapper>
               {session && <AnalyticsWrapper></AnalyticsWrapper>}
            </StudentWrapper>
         </div>

      )
   }
}
const mapStateToProps = (state) => ({
   ...state.headerReducer,
   ...state.dashboardReducer,
   ...state.fileUploadReducer
})

const mapDispatchToProps = {
   getSessionDtls,
   updateFields,
   getSubjByEntprsDtls,
   getSubjByEntprsDtlPrmsn,
   getStaffClasses,
   crateAndUpdateCntSts,
   updateCntViewLog
}
const TabNavigator = (props) => <DashboardPage {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components));

