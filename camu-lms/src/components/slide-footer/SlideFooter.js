// import React, { useState } from 'react';
import React, { useEffect } from 'react';
import '../../styles/_slidefooterStyle.scss';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import {ArrowRight,ArrowLeft} from 'react-feather';
import { updateFields } from '../../store/actions/AnalyticsAction';
// import { connect } from 'react-redux';
import {useHistory} from 'react-router-dom';
import _ from "lodash";

const SlideFooterComponent = (props) => {
   let prevItem={},nextItem={}; //Footer next and prev data
   const history=useHistory();
   let isExpItm = false;
   let existState=history.location.state; //get state values from history
   if(props.sliderData && props.sliderData.length){
      //Match the selected item with the sliderdata
      props.sliderData.filter((item,index)=>{
         if(props.selectedId===item._id){
            prevItem=props.sliderData[index-1];
            nextItem=props.sliderData[index+1];
         }  
         return props.sliderData;
      })
   }
   if(props.urlData && props.urlData.isExpItm && props.urlData.isExpItm === "true"){
      isExpItm = true;
   }



  
   return (
      <div>
            <div className="slider-footer">
            <div className="row m-0">
               {prevItem && !_.isEmpty(prevItem) && !prevItem.isHide ?
                  (<div className="col-6 p-0" onClick={()=>
                     {  
                        //Based on the item type navigates to the respective component
                        if(prevItem.type === "PAGE"){
                           prevItem.currPage = 'PAGE_VW';
                           Object.assign(existState,{pageId:prevItem._id});
                           history.push({pathname:"/home-page/page-content",search:`?id=${prevItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState}); 
                           //props.sliderClbk(prevItem._id);
                        }else if(prevItem.type === "FILE"){
                           prevItem.currPage = 'FILE_VW';
                           Object.assign(existState,{fileId:prevItem._id});
                           history.push({pathname:"/home-page/files-view",search:`?id=${prevItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                          // props.sliderClbk(prevItem._id);
                        }else if(prevItem.type === "ASGMNT"){
                           prevItem.currPage = 'ASGN_VW';
                           Object.assign(existState,{asgmntId:prevItem._id});
                           //Check this is comes from assignment list or content view
                           if(props.urlData && props.urlData.assgnmntView){
                              history.push({pathname:"/home-page/assignment-view",search:`?id=${prevItem._id}&assgnmntView=${props.urlData.assgnmntView}`,state:existState});
                              //props.sliderClbk(prevItem._id);
                           }else{
                              history.push({pathname:"/home-page/assignment-view",search:`?id=${prevItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                              //props.sliderClbk(prevItem._id);
                           }   
                        }else if(prevItem.type === "QUIZ"){
                           prevItem.currPage = 'QUIZ_VW';
                           Object.assign(existState,{asgmntId:prevItem._id});
                            //Check this is comes from quiz list or content view
                           if(props.urlData && props.urlData.quizView){
                              history.push({pathname:"/home-page/quiz-content",search:`?id=${prevItem._id}&quizView=${props.urlData.quizView}`,state:existState});
                           }else{
                              history.push({pathname:"/home-page/quiz-content",search:`?id=${prevItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                           }
                        } else if(prevItem.type === "SCORM"){
                           prevItem.currPage = 'SCORM_VW';
                           Object.assign(existState,{scormId:prevItem._id});
                           if(props.urlData && props.urlData.scormView){
                              history.push({pathname:"/home-page/scorm-view",search:`?id=${prevItem._id}&scormView=${props.urlData.scormView}`,state:existState});
                           }else{
                              history.push({pathname:"/home-page/scorm-view",search:`?id=${prevItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                           }
                        }
                        props.sliderClbk(prevItem._id,prevItem.type,prevItem.currPage);
                     }
                  }>
                     <div className="move-forward">
                        <div className="forward-icon">
                           <ArrowLeft className="svg-icon_small icon-pointer" />
                        </div>
                        <div className="current-chapter">
                           <p className="subchapter__name">{props.subChapNm}</p>
                           <p className="subchapter__items">{prevItem.title}</p>
                        </div>
                     </div>
                  </div>):
                  (<div className="col-6 p-0">
                     {prevItem && prevItem.title &&
                     <div className="move-forward">
                        <div className="forward-icon">
                           <ArrowLeft className="svg-icon_small icon-disable" />
                        </div>
                        <div className="current-chapter">
                           <p className="subchapter-name_disable">{props.subChapNm}</p>
                           <p className="subchapter-items_disable">{prevItem.title}</p>
                        </div>
                     </div>
                     }
                  </div>)
               }
               {nextItem && !_.isEmpty(nextItem) && !nextItem.isHide ?
                  (<div className="col-6 p-0" onClick={()=>
                     {
                        //Based on the item type navigates to respective component
                        if(nextItem.type === "PAGE"){
                           nextItem.currPage = 'PAGE_VW';
                           Object.assign(existState,{pageId:nextItem._id});
                           history.push({pathname:"/home-page/page-content",search:`?id=${nextItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState}); 
                           // props.sliderClbk(nextItem._id);
                        }else if(nextItem.type === "FILE"){
                           nextItem.currPage = 'FILE_VW';
                           Object.assign(existState,{fileId:nextItem._id});
                           history.push({pathname:"/home-page/files-view",search:`?id=${nextItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                           // props.sliderClbk(nextItem._id);
                        }else if(nextItem.type === "ASGMNT"){
                           nextItem.currPage = 'ASGN_VW';
                           Object.assign(existState,{asgmntId:nextItem._id});
                           //Check this is comes from assignment list or content view
                           if(props.urlData && props.urlData.assgnmntView){
                              history.push({pathname:"/home-page/assignment-view",search:`?id=${nextItem._id}&assgnmntView=${props.urlData.assgnmntView}`,state:existState});
                              // props.sliderClbk(nextItem._id);
                           }else{
                              history.push({pathname:"/home-page/assignment-view",search:`?id=${nextItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                              // props.sliderClbk(nextItem._id);
                           }
                           
                        }else if(nextItem.type === "QUIZ"){
                           nextItem.currPage = 'QUIZ_VW';
                           Object.assign(existState,{asgmntId:nextItem._id});
                            //Check this is comes from quiz list or content view
                           if(props.urlData && props.urlData.quizView){
                              history.push({pathname:"/home-page/quiz-content",search:`?id=${nextItem._id}&quizView=${props.urlData.quizView}`,state:existState});
                           }else{
                              history.push({pathname:"/home-page/quiz-content",search:`?id=${nextItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                           }
                        }else if(nextItem.type === "SCORM"){
                           nextItem.currPage = 'SCORM_VW';
                           Object.assign(existState,{scormId:nextItem._id});
                            //Check this is comes from quiz list or content view
                           if(props.urlData && props.urlData.scormView){
                              history.push({pathname:"/home-page/scorm-view",search:`?id=${nextItem._id}&scormView=${props.urlData.scormView}`,state:existState});
                           }else{
                              history.push({pathname:"/home-page/scorm-view",search:`?id=${nextItem._id}&chapId=${props.urlData && props.urlData.chapId}&subId=${props.urlData && props.urlData.subId}&isItem=${true}&isExpItm=${isExpItm}`,state:existState});
                           }
                        }
                        props.sliderClbk(nextItem._id,nextItem.type,nextItem.currPage);
                     }
                  }>
                     <div className="move-backward">
                        <div className="next-chapter">
                           <p className="subchapter__name">{props.subChapNm}</p>
                           <p className="subchapter__items">{nextItem.title}</p>
                        </div>
                        <div className="forward-icon">
                           <ArrowRight className="svg-icon_small icon-pointer" />
                        </div>
                     </div>
                  </div>):
                  (
                  <div className="col-6 p-0">
                  {nextItem && nextItem.title &&
                  <div className="move-backward">
                     <div className="current-chapter_disable">
                     {/* <span className="tooltip-slide_right" data-tooltip="You dont currently have access to this content"> */}
                        <p className="subchapter-name_disable">{props.subChapNm}</p>
                        <p className="subchapter-items_disable">{nextItem.title}</p>
                     {/* </span> */}
                     </div>
                     <div className="forward-icon">
                        <ArrowRight className="svg-icon_small icon-disable" />
                     </div>
                  </div>
                  }
               </div>)
               }
            </div>
         </div>
      </div>
   ) 
}

const mapStateToProps = (state) => ({
   ...state.analyticsReducer
})
const mapDispatchToProps={
   updateFields
};

const TabNavigator = (props) => <SlideFooterComponent {...props} />

const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);

// export default withTranslation()(SlideFooterComponent);
