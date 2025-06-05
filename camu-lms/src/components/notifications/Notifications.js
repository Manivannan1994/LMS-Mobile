import React, {lazy, useState, useEffect } from 'react';
import '../../styles/_notificationsStyle.scss';
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import messageUtil from '../../utils/message-util';
import { getNotifications } from "../../store/actions/NotificationAction";
import { connect } from "react-redux";
import {lmsDateAndTimeFormat} from '../../utils/helper';
// import { ChevronDown, Check } from 'react-feather';
// const Button = lazy(() => import("../button/Button"));
const Searchbox = lazy(() => import("../searchbox/Searchbox"));
const InfiniteScroll = lazy(() =>
  import("../infinite-scroll/InfiniteScroll")
);
// const LmsSelectDropDown = lazy(() => import("../lms-selectdropdown/LmsSelectDropDown"));

const NotificationsComponent = (props) => {
  const location = useLocation();
  const [skip, setSkip] = useState(0);
  // const [ srchKey, setSearch ] = useState('');

  const [aNotifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications();
  },[]);

  const notificationCallback = (status, data) => {
    if (data && data.output && data.output.data) {
        if(data.output.data.length){
          setNotifications(aNotifications => [...aNotifications, ...data.output.data]);
        }
    } else {
      messageUtil.showError("UNKNOWN_ERROR", false);
    }
  }

  // const searchHandler = (event) => {
  //   setSearch(event.target.value);
  //   setTimeout(() => {
  //     if(srchKey && srchKey.length > 1){
  //       getNotifications();
  //     }
  //   }, 100);
  // }

  // Get the Notifications
  const getNotifications = () => {
    const oReq = {
      PrID: location.state.PrID,
      CrID: location.state.CrID,
      DeptID: location.state.DeptID,
      SemID: location.state.SemID,
      AcYr: location.state.AcYr,
      SecID:location.state.SecID,
      SubID: location.state.subId,
      count: 10
    };
    setSkip(skip+10);
    oReq.dataSkip = skip;
    props.getNotifications(oReq, notificationCallback);
  }
  return (

    <div>
      <div className="notification-list_box">
        <div className="notification-heading">
          <div className="notification-nav">
            <div className="notification-name">
              <h6>Notifications</h6>
              {/* <p> Get alert from conversations</p> */}
            </div>
          </div>
        </div>
        {
          (aNotifications && aNotifications.length > 0) ? 
          <div class="project-tab">
            <div class="student-grade_tabs">
              <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                <a class="nav-item nav-link active" id="nav-contact-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">All</a>
                {/* <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" >Activity</a> */}
                {/* <a class="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#tab-3" role="tab"  aria-selected="false">Updates</a> */}
              </div>
            </div>
            <div class="tab-content student-grade_content" id="nav-tabContent">
              <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                <div className="notification-selection">
                  {/* <div className="notification-search ">
                    <div class="row m-0">
                      <div class="col-6 p-0">
                        <div className="cont-search-box">
                          <Searchbox
                            placeholder={props.t("translate:SEARCH")}
                            searchBoxTheme="search-default search-box_default search-outline"
                            value={srchKey}
                            onChange={ (event) => searchHandler(event)}
                          />
                        </div>
                      </div>
                      <div class="col-6 p-0">
                        <div className="notification-select">
                          <p className="read-mark-label">
                            <Check className="svg-icon_small icon-secondary" />
                            Mark all as read
                          </p>
                          <LmsSelectDropDown className="dropdown-default drop-down_arrow">
                            <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                          </LmsSelectDropDown>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  <InfiniteScroll
                    dataLength={aNotifications.length}
                    next={getNotifications}
                    hasMore={true}
                  >
                    {
                      aNotifications.map((oNotify) => {
                      return(
                        <div className="notification-list_cont">
                          <div className="notification-box">
                            <div className="notification-indicate">
                              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 9" fill="none">
                                <circle cx="4" cy="4.5" r="4" fill="#0D9BE1" />
                              </svg>
                            </div>
                            <div className="notification-details">
                              <p className="notification-details_label">
                                {
                                  oNotify.dwnldAsgSub &&
                                  <div>
                                    {
                                      oNotify.Status === "C" && 
                                      <div>
                                        <span>{oNotify.asgnNm} </span>  {props.t("translate:ASSIGNMENT_SUBMISSION_SUCCESS")}
                                     
                                      </div>
                                    }
                                    {
                                      oNotify.Status === "E" && 
                                      <div>
                                        {props.t("translate:SORRY")} <span>{oNotify.asgnNm}</span> {props.t("translate:ASSIGNMENT_SUBMISSION_ERROR")}
                                      </div>
                                    }
                                  </div>
                                }
                                {
                                  oNotify.isTrnscrt &&
                                  <div>
                                    {
                                      oNotify.Status === "C" && 
                                      <div> 
                                           <span>
                                      {props.t("translate:TRANSCRIPT")}
                                    </span>   
                                   
                                    {props.t("translate:TRANSCRIPT_SUCCESS")}
                                    </div>

                                   
                                    }
                                    {
                                      oNotify.Status === "E" && 
                                      <div> {props.t("translate:SORRY")}<span> {props.t("translate:TRANSCRIPT_ERROR")}</span>{props.t("translate:PLEASE_TRY_AGAIN")}</div>
                                    }
                                  </div>
                                }
                              </p>
                              <p className="notification-details_time">{lmsDateAndTimeFormat(oNotify.CrAt)}</p>
                            </div>
                          </div>
                          <div>
                                          {
                                            oNotify.url && 
                                            <a href={oNotify.url} className="notification-file_download">
                                              {props.t("translate:DOWNLOAD")}
                                            </a>
                                          }
                                      </div>
                        </div>
                      )
                    })
                    }
                  </InfiniteScroll>
                </div>
              </div>


              {/* <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                  <div className="notification-selection">
                                      <div className="notification-search ">
                                        <div class="row m-0">
                                            <div class="col-6 p-0">
                                              <div className="cont-search-box">
                                                  <Searchbox
                                                    placeholder={props.t("translate:SEARCH")}
                                                    searchBoxTheme="search-default search-box_default search-outline"
                                                    />
                                              </div>
                                            </div>
                                            <div class="col-6 p-0">
                                              <div className="notification-select">
                                                  <p className="read-mark-label">
                                                    <Check className="svg-icon_small icon-secondary"/>
                                                    Mark all as read
                                                  </p>
                                                  <LmsSelectDropDown className="dropdown-default drop-down_arrow">
                                                    <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                                                  </LmsSelectDropDown>
                                              </div>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="notification-list_cont">
                                        <p className="label-notification">New</p>
                                        <div className="notification-box">
                                            <div className="notification-indicate">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 9" fill="none">
                                                  <circle cx="4" cy="4.5" r="4" fill="#0D9BE1"/>
                                              </svg>
                                            </div>
                                            <div className="notification-details">
                                              <p className="notification-details_label">Lucy and 2 others, added a comment on Assignment name goes here</p>
                                              <p className="notification-details_time">About 5 mins ago</p>
                                            </div>
                                        </div>
                                      </div>
                                  </div>
                                </div> */}


              {/* <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-contact-tab">
                                  <div className="notification-selection">
                                      <div className="notification-search ">
                                        <div class="row m-0">
                                            <div class="col-6 p-0">
                                              <div className="cont-search-box">
                                                  <Searchbox
                                                    placeholder={props.t("translate:SEARCH")}
                                                    searchBoxTheme="search-default search-box_default search-outline"
                                                    />
                                              </div>
                                            </div>
                                            <div class="col-6 p-0">
                                              <div className="notification-select">
                                                  <p className="read-mark-label">
                                                    <Check className="svg-icon_small icon-secondary"/>
                                                    Mark all as read
                                                  </p>
                                                  <LmsSelectDropDown className="dropdown-default drop-down_arrow">
                                                    <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                                                  </LmsSelectDropDown>
                                              </div>
                                            </div>
                                        </div>
                                      </div>
                                      <div className="notification-list_cont">
                                        <p className="label-notification">New</p>
                                        <div className="notification-box">
                                            <div className="notification-indicate">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 9" fill="none">
                                                  <circle cx="4" cy="4.5" r="4" fill="#0D9BE1"/>
                                              </svg>
                                            </div>
                                            <div className="notification-details">
                                              <p className="notification-details_label">Lucy and 2 others, added a comment on Assignment name goes here</p>
                                              <p className="notification-details_time">About 5 mins ago</p>
                                            </div>
                                        </div>
                                        <div className="notification-box">
                                            <div className="notification-indicate">
                                              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 9" fill="none">
                                                  <circle cx="4" cy="4.5" r="4" fill="#0D9BE1"/>
  q                                            </svg>
                                            </div>
                                            <div className="notification-details">
                                              <p className="notification-details_label">Lucy and 2 others, added a comment on Assignment name goes here</p>
                                              <p className="notification-details_time">About 5 mins ago</p>
                                            </div>
                                        </div>
                                      </div>
                                  </div>
                                </div> */}
            </div>
          </div>
          : 
          <div className="notification-list_empty">
            <p className="notification-label_empty">{props.t("translate:EMPTY_NOTIFICATIONS")}</p>
          </div>
        }
        
      </div>
    </div>
  )
}


const mapStateToProps = (state) => ({
  ...state.NotificationReducer
});
const mapDispatchToProps = {
  getNotifications
};

const TabNavigator = (props) => <NotificationsComponent {...props} />;
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);
export default withTranslation()(Components);
