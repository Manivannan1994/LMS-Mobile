import React, { Component,lazy } from 'react';
import axios from 'axios';
import '../../styles/_editcontentStyle.scss';
import $ from 'jquery'
// import { MoreInfo } from '../icons/Icons';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withTranslation } from 'react-i18next';
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { ArrowLeft} from 'react-feather';
import SimpleReactValidator from 'simple-react-validator';
import _ from 'lodash';
import {loadItems} from '../../store/actions/ContentActions';
const Button  = lazy(() =>
 import('../button/Button')
 );
const InputBox  = lazy(() =>
import('../input-box/InputBox')
);
const LmsEditor  = lazy(() =>
import('../lms-editor/LmsEditor')
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);

let values;
class EditContentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      pageName: '',
      data: {},
      vSts:'D'   //View Status(published or not)
   
    }
    //For validation and mandatory fields check
    this.validator = new SimpleReactValidator({autoForceUpdate: this});
  }
  componentDidMount() {
    $('#myModal-page').modal('hide');
    if (this.props.location && this.props.location.search) {
      values = queryString.parse(this.props.location.search);
    }
    if(values && values.id && this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
      const oReq={
         contntId:values.id,
      }
      oReq.projct={
        title:1,
        page:1,
        vSts:1
      }
      //Get the Page details by id
      HTTPService.post('/lms-content/get-cntn-det-for-list-or-edit',oReq,null,(err,data)=>{
          if(data && data.output){
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_DOCS_FOUND"){
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            }else if(data.output.data && !_.isEmpty(data.output.data)){
              this.setState({
                pageName:data.output.data.title,
                data: data.output.data.page && data.output.data.page.html ? data.output.data.page.html : '',
                vSts:data.output.data.vSts
              });
            }else if(data.output.data && _.isEmpty(data.output.data)){
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            }
          }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
          } 
      })   
    }
  }

  //creating a page item
  addSubChapterPage = (view) => {
    //If all the fileds are valid then only allowed to save
    if (this.validator.allValid()) {
      if(this.props.location && this.props.location.state && !_.isEmpty(this.props.location.state)){
        let oReq = {
          tCntId: this.props.location.state.TPID,
          PrID: this.props.location.state.PrID,
          CrID: this.props.location.state.CrID,
          AcYr: this.props.location.state.AcYr,
          DeptID: this.props.location.state.DeptID,
          SemID: this.props.location.state.SemID,
          SecID: this.props.location.state.SecID,
          chapId: values.chapId,
          sChpId: values.subId,
          subjId: this.props.location.state.subId,
          title: this.state.pageName,
          vSts:view,
          type: 'PAGE',
          seqNo: this.props.location.state.seqNo,
          _id:values.id
        }
        if(this.state.data && !_.isEmpty(this.state.data )){
          oReq.page={
            html: this.state.data
          };
        }
        
        let pageUrl;
        if(view === "F"){
          pageUrl = '/teaching-content/publish-subchapter-items';
        }else{
          pageUrl = '/teaching-content/create-or-edit-subchapter-items';
        }
        HTTPService.post(pageUrl,oReq,null,(err,data)=>{
          if(data && data.output){
            if(data.output.errors && data.output.errors.code && data.output.errors.code === "NO_CONTENT_DETAILS_FOUND"){
              this.setState({
                pageName: '',
                data:{}
              });
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            }else if(data.output.data && !_.isEmpty(data.output.data)){
              if(values && values.id && values.id.length){
                messageUtil.showSuccess('PAGE_UPDATED_SUCCESSFULLY',true);
              }else{
                messageUtil.showSuccess('PAGE_ADDED_SUCCESSFULLY',true);
              }
              this.props.history.push({pathname:"/home-page/page-content",search:`?id=${data.output.data._id}&chapId=${values.chapId}&subId=${ values.subId}`,state:this.props.location.state});
            }else if(data.output.data && _.isEmpty(data.output.data)) {
              this.setState({
                pageName: '',
                data:{}
              });
              messageUtil.showInfo("NO_PAGE_FOUND", true);
            } 
          }else{
            messageUtil.showError("UNKNOWN_ERROR", false);
          } 
        })
        if(this.props?.location?.state?.isEnableAiChat) {
          const textData = this?.state?.data?.replace(/<[^>]*>/g, '');
          if(textData) {
            try {
              let oReqQuiz = {
                document: textData,
                id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-quiz`,
                level: "easy",
                num_questions: 10
              };
    
              let oReqFlash = {
                document: textData,
                id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-flashcard`,
                num_cards: 10
              };
    
              let oReqSnippet = {
                document: textData,
                id: `${this.props.location.state.InId}${this.props.location.state.DeptID}${this.props.location.state.subId}${values.chapId}${values.subId}-snippets`,
              }
              const pageUrlQuiz = '/camu_lms/quiz';
              const pageUrlFlash = '/camu_lms/flipcards';
              const pageUrlSnippet = '/camu_lms/snippets';
            
              // For Quiz API
              axios.post(pageUrlQuiz, oReqQuiz);
              // For FlashCard API
              axios.post(pageUrlFlash, oReqFlash);
              // For Snippets API
              axios.post(pageUrlSnippet, oReqSnippet);
    
            } catch (error) {
              console.log('Error is: ', error);
            }
          }
        }    
      } else {
        console.log("NO_REQUEST_FOUND");
      }
    } else {
      this.validator.showMessages();
    }
    
  }
  

  render() {
    return (
      <div>
      <div className="edit-module_container">
         <div className="edit-module_header">
            <div className="row m-0">
               <div className="col-6 p-0">
                  <div className="page-input_title">
                     <div className="page-title_icon" onClick={()=>this.props.history.go(-1)}>
                        {/* <Book iconStyle="svg-icon_small icon-primary"/> */}
                        <ArrowLeft className="svg-icon_default icon-dark icon-pointer"/>
                     </div>
                     <div className="page-input_details">
                        <label for="fname" className="form-lable"><span className="mandatory-field">* </span>{this.props.t("translate:EDITCONTENTCOMPONENT_PAGE_NAME")}</label>
                        <InputBox  
                          className="input-block" 
                          placeholder='Page name' name="Last Name"
                         value={this.state.pageName}
                          onChange={(event) => this.setState({ ...this.state, pageName: event.target.value })}
                          />
                          {this.validator.message('title', this.state.pageName, 'required|string',{ className: 'text-empty_content' })}
                     </div>
                  </div>
               </div>
               <div className="col-6 p-0">
                  <div className="publish-btn">
                          {/* <p className="published-view_label">
                          {this.state.vSts === 'D' ?
                            this.props.t("translate:UNPUBLISHED_LABEL")
                          :
                            this.props.t("translate:PUBLISHED_LABEL")
                          } 
                          </p> */}
                              <div>
                                 {this.state.vSts === 'D'?
                                <p className="unpublished-view_label" >{this.props.t("translate:UNPUBLISHED_LABEL")}</p>
                                :
                                 <p className="published-view_label" >{this.props.t("translate:PUBLISHED_LABEL")}</p>
                                 }
                                </div>
                      <UIPerWrapper perCode={["rp_can_pub_lms_content"]}><div className="save-publish_btn">
                        <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=> this.addSubChapterPage("F")}>{this.props.t("translate:SAVE_&_PUBLISH")}</Button>
                      </div></UIPerWrapper>
                      <UIPerWrapper perCode={["rp_can_create_or_edit_lms_content"]}><div className="save-page_btn">
                        <Button theme="btn-rounded default" clicked={()=> this.addSubChapterPage("D")}>{this.props.t("translate:SAVE")}</Button>
                      </div></UIPerWrapper>
                     {/* <i class="views-option">
                        <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                     </i> */}
                  </div>
               </div>
            </div>
         </div>
         <div className="text-editor">
            <p className="edit-box_heading">{this.props.t("translate:Content")}</p>
            <LmsEditor  placeholder={"Enter description"}
            value={this.state.data} onChange={(html) => this.setState({ ...this.state, data: html })}
            />
            {this.validator.message('content', this.state.data, 'required|string',{ className: 'text-empty_content' })}
         </div>
      </div>
   </div>
    );
  }
}
const mapStateToProps = (state) => ({
  ...state.contentReducer
})
const mapDispatchToProps = {
  loadItems
}

const TabNavigator = (props) => <EditContentComponent {...props} />

const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);
