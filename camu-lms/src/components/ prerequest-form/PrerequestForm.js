import React, { Component } from 'react';
import '../../styles/_preRequestFormStyle.scss';
import InputBox from '../input-box/InputBox';
import Button from '../button/Button';
import { ArrowLeft, Info, Plus } from 'react-feather';
import { MinusCircle } from '../icons/Icons';
import CheckBox from '../checkbox/CheckBox';
import LmsSelectDropDown from '../lms-selectdropdown/LmsSelectDropDown';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import { getSubConfiq,getChapNames,saveSequenceConfig} from '../../store/actions/SettingsActions';
import {updateFields} from '../../store/actions/ContentActions'
import {loadItems} from '../../store/actions/ContentActions';
import queryString from 'query-string';
import _ from 'lodash';
import SimpleReactValidator from 'simple-react-validator';
import LmsCommonService from '../../service/lms-service';
import LmsGrpDrpDown from '../lms-grpdrp-down/LmsGrpDrpDown';
import ReactDatePicker from '../date-picker/DatePicker';
class PrerequestForm extends Component {
    constructor(props) {
        super(props);
        this.values = {}
        this.content = ''
        this.scoreIndex= null
        this.oldTitle='';
        this.ccCodes=[];          //Domain code values
        this.state = {
            aPreReq:[],           //prerequisites data  
            title:'',               //Chapter Title
            lkUtDt:'',              //Lock until date
            alwCon:false,            //Allow Conversation
            aCategory:[],
            isLock:false,
            isRequre:false,
            isPreReq:false,
            category:'',
            aReq:[],             //requirement data
            isAddReq:true,
            isAddPreReq:true,     //Add Prerequisites
            score:'',
            isScore:false,
            isMxmrk:true,
            isSave:true,
            vSts:'D'              //View Status(published or not)
        }
        //For validation and mandatory fields check
        this.validator = new SimpleReactValidator({autoForceUpdate: this});
    }
    componentDidMount() {
        this.values = queryString.parse(this.props.location.search);
        let oReq = {
            InId: this.props.location.state.InId,
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            AcYr: this.props.location.state.AcYr,
            DeptID: this.props.location.state.DeptID,
            SemID: this.props.location.state.SemID,
            SecID: this.props.location.state.SecID,
            subjId: this.props.location.state.subId,
            preReq: true
        }
        //Get the Subject configuration
        this.props.getSubConfiq(oReq,this.values,null,this.updateSeqConfig);
        //Load The Chapter Names
        if(this.values && this.values.isChap){
            if (this.props.location.state?.teachCntId) {
                this.props.getChapNames(this.values.chapId,this.props.location.state.teachCntId);
            }
             //If Chap and subchap id presents then only assign the Title
            if(this.values.chapId){
                this.setState({title:this.props.location.state.modalTitle});
            } 
        }
            // Load Subchapter Items
            // If edit subchapter with items
            if(this.values && this.values.chapId && this.values.isSubchap && this.values.subChapId){
                let oReq = {
                    TPID: this.props.location.state.TPID,
                    subId: this.props.location.state.subId,
                    PrID: this.props.location.state.PrID,
                    CrID: this.props.location.state.CrID,
                    AcYr: this.props.location.state.AcYr,
                    DeptID: this.props.location.state.DeptID,
                    SemID: this.props.location.state.SemID,
                    SecID: this.props.location.state.SecID
                }
                this.props.loadItems(this.values.chapId,this.values.subChapId,oReq,null,'finalize');
                this.setState({title:this.props.location.state.modalTitle});
                // Get domain codes for items confiq
                let oDomainCodes = {
                    codes: ['LMS_REQUIREMENT_CONFIG'],
                };
                LmsCommonService.getDomainByCode(oDomainCodes, (err, response) => {
                    if (response && response.length) {
                        for (let cd = response.length - 1; cd >= 0; cd--) {
                            if (response[cd].code === "LMS_REQUIREMENT_CONFIG" && response[cd].ccodes && response[cd].ccodes.length) {
                                this.ccCodes=response[cd].ccodes;
                                this.setState({ aCategory: response[cd].ccodes });

                                //To set the dropdown only if requirment dropdown is already added 
                                if(this.state.aReq && this.state.aReq.length >0 ){
                                    this.state.aReq.forEach((req, index)=>{
                                        this.checkForDomain(req.cntId,index);
                                    });
                                }
                            }
                        }
                    }
                });
            } else if (this.values && this.values.isSubchap && !this.values.subChapId) {
                this.props.updateFields('subChapItems', []);
            }
            //If subChap id presents then only assign the Subchapter name
            // if(this.values && this.values.isSubchap && this.values.subChapId){
            //     this.setState({title:this.props.location.state.modalTitle});
            // }
        // }
    }
    //update the chapter/subchapter sequence configuration details
    updateSeqConfig=(seqData)=>{
        if(seqData && !_.isEmpty(seqData)){
            this.setState({...this.state,alwCon:seqData.alwCon,vSts:seqData.vSts});
            if(seqData.lkUnDt && seqData.lkUnDt.length>0){
                this.setState({...this.state,lkUtDt:new Date(seqData.lkUnDt),isLock:true});
                if(this.props.subChapItems.length<=this.state.aReq.length){
                    this.setState({...this.state,isAddReq:false});
                }
                if (this.props.aChapNms.length <= this.state.aPreReq.length) {
                    this.setState({ ...this.state, isAddPreReq: false });
                }
            }
            if(seqData.preReq && seqData.preReq.length>0){
                this.setState({...this.state,aPreReq:seqData.preReq,isPreReq:true}); 
                if (this.props.aChapNms.length <= this.state.aPreReq.length) {
                    this.setState({ ...this.state, isAddPreReq: false });
                }
            }
            if(seqData.req && seqData.req.length>0){
                seqData.req.forEach(element => {
                    if(element.type === "SA"){
                        element.isScore = true
                    }
                    this.props.subChapItems.forEach(items => {
                        if (items._id === element.cntId) {
                            if (items.type === 'ASGMNT') {
                                element.aCategory = this.state.aCategory
                            } 
                            else {
                                const aCategoryCpy = [...this.state.aCategory]
                                for (let i = aCategoryCpy.length - 1; i >= 0; i--) {
                                    if ((items.type === 'FILE' || items.type === 'PAGE') && (aCategoryCpy[i].code === "SUB" || aCategoryCpy[i].code === "SA")) {
                                        aCategoryCpy.splice(i, 1);
                                        element.aCategory = aCategoryCpy
                                    }
                                     // For quiz view items and quiz submit
                                    if (items.type === 'QUIZ') {
                                        if (aCategoryCpy[i].code === "MD" || aCategoryCpy[i].code === "SA") {
                                            aCategoryCpy.splice(i, 1);
                                            element.aCategory = aCategoryCpy
                                        }
                                    }
                                }
                            }
                            if(element.type === "SA"){
                                element.mxMrk = items.asgmnt.mxMrk 
                            }
                        }
                    })
                })
                this.setState({ ...this.state, aReq: seqData.req, isRequre: true });
                if(this.props.subChapItems.length<=this.state.aReq.length){
                    this.setState({...this.state,isAddReq:false});
                }
            }
        }
    }

    //Save the sequence configuration against the chapter & subchapter
    saveSequenceConfig=(view)=>{
        //If all the fileds are valid then only allowed to save
        if (this.validator.allValid()) {
            const oSeqReq={
                InId:this.props.location.state.InId,
                lmsTyp:this.props.lmsTyp ? this.props.lmsTyp : 'FF',
                alwCon:this.state.alwCon, 
                TPID: this.props.location.state.TPID ?  this.props.location.state.TPID  : '',
                SubjId:this.props.location.state.subId,
                isread: true
            }
            if(this.values && this.values.isChap){
                oSeqReq.Chapter = [
                    {
                        ChapName: this.state.title,
                        vSts:view
                    }
                ]
            }
            if(this.values.chapId && this.values.chapId.length>0){
                oSeqReq.oldTitle = this.props.location.state.modalTitle;
                oSeqReq.chapId = this.values.chapId;
            }
            //Lock until date
            if(this.state.lkUtDt && this.state.isLock){
                oSeqReq.lkUnDt=this.state.lkUtDt; 
            }else if((!this.state.isLock && this.values)&& (this.values.chapId || this.values.subChapId)){
                oSeqReq.lkUnDt='';
            }
            //Check the subject configuration id
            if(this.props.sCnfId && this.props.sCnfId.length>0){
                oSeqReq.sCnfId=this.props.sCnfId;
            }else{
                oSeqReq.PrID=this.props.location.state.PrID;
                oSeqReq.CrID=this.props.location.state.CrID;
                oSeqReq.AcYr=this.props.location.state.AcYr;
                oSeqReq.DeptID=this.props.location.state.DeptID;
                oSeqReq.SemID=this.props.location.state.SemID;
                oSeqReq.SecID=this.props.location.state.SecID;
                oSeqReq.subjId=this.props.location.state.subId;
            }
            //Assign the prerequisites or requirements
            if(this.values && this.values.isChap){
                if(this.state.isPreReq){
                    oSeqReq.preReq=this.state.aPreReq;
                }else{
                    oSeqReq.preReq=[];
                }
            }else if(this.values && this.values.isSubchap){
                if(this.state.isRequre){
                    oSeqReq.reqmnt=this.state.aReq;
                }else{
                    oSeqReq.reqmnt=[];
                }   
            }
            // Request sent for subchapter 
            if (this.values && this.values.isSubchap) {
                oSeqReq.SubChapter = [{
                    Name: this.state.title,
                    ScNo: this.values.ScNo ? this.values.ScNo : null,
                    Dur: 0,
                    vSts:view
                }];
                oSeqReq.subChapter = true;
                oSeqReq.chapId = this.values.chapId
            }
            if (this.values && this.values.subChapId) {
    
                oSeqReq.sChpId = this.values.subChapId;
            }
            if(this.values.chapId && this.values.chapId.length>0){
                oSeqReq.chapId = this.values.chapId;
            }
            // Allow to save mark only in score atlest 
            if(this.state.isSave){
                this.props.saveSequenceConfig(oSeqReq);
            }
        } else {
            this.validator.showMessages();
        }
    }

    //Load the domain codes based on the content items type
    checkForDomain = (selectItem, itemIndex) => {
        this.props.subChapItems.filter(element => {
            if (element._id === selectItem) {
                if (element.type === 'ASGMNT') {
                    // this.state.aReq[itemIndex].aCategory = this.state.aCategory;
                    // this.setState({ ...this.state, aReq: this.state.aReq });
                    this.setState(state => {
                        return state.aReq[itemIndex].aCategory = state.aCategory
                    });
                } 
                else {
                    const aCategoryCpy = [...this.state.aCategory]
                    for (let i = aCategoryCpy.length - 1; i >= 0; i--) {
                        if ( (element.type === 'PAGE' || element.type === 'FILE') &&  (aCategoryCpy[i].code === "SUB" || aCategoryCpy[i].code === "SA")) {
                            aCategoryCpy.splice(i, 1);
                        }
                         // For quiz view items and quiz submit
                        if(element.type === 'QUIZ'){
                            if(aCategoryCpy[i].code === "MD" || aCategoryCpy[i].code === "SA"){
                                aCategoryCpy.splice(i, 1);
                            }
                        }
                    }
                    // this.state.aReq[itemIndex].aCategory = aCategoryCpy;
                    // this.setState({ ...this.state, aReq: this.state.aReq });
                    this.setState((state) => {
                        return state.aReq[itemIndex].aCategory = aCategoryCpy
                    });
                }
            }
            return this.props.subChapItems;
        });
    }

    // Adding requriment for subchapter
    addRequriment =(index)=>{
        // Check duplicate requriment
        if (this.state.aReq.length === 0) {
            this.state.aReq.push({
                cntId: this.props.subChapItems[0] && this.props.subChapItems[0]._id,
                type: this.props.subChapItems[0] && this.props.subChapItems[0]._id && 'VW',
                mxMrk:this.props.subChapItems[0] && this.props.subChapItems[0].asgmnt && this.props.subChapItems[0].asgmnt.mxMrk 
            });
        } else {
            for (let i = 0; i < this.props.subChapItems.length; i++) {
                let rqMat = false;
                for (let rq = 0; rq < this.state.aReq.length; rq++) {
                    if (this.state.aReq[rq].cntId === this.props.subChapItems[i]._id) {
                        rqMat = true;
                        break;
                    }
                }
                if (!rqMat) {
                    this.state.aReq.push({
                        cntId: this.props.subChapItems[i] && this.props.subChapItems[i]._id,
                        type: this.props.subChapItems[0] && this.props.subChapItems[0]._id && 'VW',
                        mxMrk:this.props.subChapItems[i] && this.props.subChapItems[i].asgmnt && this.props.subChapItems[i].asgmnt.mxMrk 
                    });
                    break;
                }
            }
        }
        if(this.props.subChapItems[index] && this.props.subChapItems[index].type && this.props.subChapItems[index].type ==='ASGMNT'){
            // this.state.aReq[index].aCategory = this.state.aCategory;
            // this.setState({ ...this.state, aReq: this.state.aReq });
            this.setState(state => {
                return state.aReq[index].aCategory = state.aCategory
            });
        }
        else{
            const aCategoryCpy = [...this.state.aCategory]
            for (let i = aCategoryCpy.length - 1; i >= 0; i--) {
                if ((this.props.subChapItems[index].type === 'PAGE' || this.props.subChapItems[index].type === 'FILE') &&  (aCategoryCpy[i].code === "SUB" || aCategoryCpy[i].code === "SA")) {
                    aCategoryCpy.splice(i, 1);
                }
                // For quiz view items and quiz submit
                if(this.props.subChapItems[index].type === 'QUIZ'){
                    if(aCategoryCpy[i].code === "MD" || aCategoryCpy[i].code === "SA"){
                    aCategoryCpy.splice(i, 1);
                    }
                }
            }
            // this.state.aReq[index].aCategory = aCategoryCpy;
            // this.setState({ ...this.state, aReq: this.state.aReq });
            this.setState((state) => {
                return state.aReq[index].aCategory = aCategoryCpy
            });
        }
        //Validate for duplicate requirement   
        if (this.props.subChapItems.length <= this.state.aReq.length) {
            this.setState({ ...this.state, isAddReq: false });
        }
    }

    //Adding Prerequisites
    addPreRequisite = (index) => {
        this.state.aPreReq.push({ chapId: this.props.aChapNms[index] && this.props.aChapNms[index]._id });
        this.setState({ aPreReq: this.state.aPreReq });  
        //Validate for duplicate prerequisites  
        if(this.props.aChapNms.length === this.state.aPreReq.length){
            this.setState({ ...this.state, isAddPreReq: false });
        }
    }
    // check score existing and save to mark  in  score atlest 
    checkScrExisting = (mxMrk) => {
        let isMaxMrk = true;
        let isSave =true;
        if (mxMrk < this.state.score) {
            isMaxMrk = false;
            isSave = false;
        }
        this.setState({ ...this.state, isMxmrk: isMaxMrk,isSave:isSave });
    }
    //  grpContents
    grpContents  = () => {
        let oContent = _.groupBy(this.props.subChapItems, 'type');
        return oContent
    }
    // Lock until handler
    lockUntilHandler=(event)=>{
        this.setState({...this.state,isLock:event.target.checked});
        if(event.target.checked && !this.state.lkUtDt && this.state.lkUtDt === ''){
            this.setState({lkUtDt: new Date()});
        }
    }

    render() {
        const {aPreReq,title,aReq,isMxmrk,vSts}=this.state;
        return (
            <div>
                <div className="liner-form_header">
                    <div className="row m-0">
                        <div className="col-6 p-0">
                            <div className="page-input_title">
                                <div className="page-title_icon">
                                    <ArrowLeft className="svg-icon_default icon-dark icon-pointer" onClick={() => this.props.history.push({ pathname: '/home-page/content-page', state: this.props.location.state })} />
                                </div>
                                <div className="page-input_details">
                                    {this.values && this.values.isSubchap && <label for="fname" className="form-lable">{this.props.t("translate:SUBCHAP_TITLE")}</label>}
                                    {this.values && this.values.isChap && <label for="fname" className="form-lable">{this.props.t("translate:CHAP_TITLE")}</label>}
                                    <InputBox className="form-control title-content" placeholder={this.values && this.values.isChap ?'Chapter Title':'Sub Chapter Title'}  value={title} onChange={(event)=>this.setState({...this.state,title:event.target.value})}/>
                                    {this.validator.message('title',title, 'required|string',{ className: 'text-empty_content' })}
                                </div>
                            </div>
                        </div>
                        <div className="col-6 p-0">
                            <div className="publish-btn">
                               <div>
                                 {vSts === 'D' ?
                                <p className="unpublished-view_label" >{this.props.t("translate:UNPUBLISHED_LABEL")}</p>
                                :
                                 <p className="published-view_label" >{this.props.t("translate:PUBLISHED_LABEL")}</p>
                                 }
                                </div>
                                <div className="save-page_btn">
                                    <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>this.saveSequenceConfig('F')}>{this.props.t("translate:SAVE")} & {this.props.t("translate:PUBLISH")}</Button>
                                </div>
                                <div className="save-page_btn">
                                    <Button theme="btn-rounded default" clicked={()=>this.saveSequenceConfig('D')} >{this.props.t("translate:SAVE")}</Button>
                                </div>
                                {/* <i class="views-option">
                        <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
                        </i> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="course-setting_container">
                    <div className="row m-0">
                        <div className="col-4 p-0">
                            <p className="course-setting_header">{this.props.t("translate:ASSIGNMENTCONTENTCOMPONENT_DETAILS_INFORMATION")}</p>
                            <p className="course-setting_content">{this.props.t("translate:PRE_REQ_CONDITION")}</p>
                        </div>
                        <div className="col-8 p-0">
                            <div className="course-setting">
                                <div className="course-setting_cont">
                                    <div className="row m-0">
                                        <div className="col-10 p-0">
                                            <div className="course-setting_label">
                                                <p className="course-form_header">{this.props.t("translate:LOCK_UNTIL")}</p>
                                                <p className="course-form_content">{this.props.t("translate:LOCK_DATE_PRE_REQ")}</p>
                                            </div>
                                        </div>
                                        <div className="col-2 p-0">
                                            <div className="course-form_select">
                                                <CheckBox className="check-box"  checked={this.state.isLock} onChange={(event)=>this.lockUntilHandler(event)}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {this.state.isLock &&
                                <div className="course-setting_select">
                                    {/* <ReactDatePicker type='date' datePickerTheme="date-picker calendar_icon" dateFrmt="dd-MMM-yyyy h:mm aa" showTimeInput={true}  selected={this.state.lkUtDt} onChange={(event)=>{ */}
                                  <ReactDatePicker closeOnSelect={true}  type='date'  className="date-picker calendar_icon"  dateFormat="DD-MMM-YYYY"   value={this.state.lkUtDt} onChange={(event)=>{
                                        if(event){
                                            this.setState({lkUtDt:event})
                                        }else{
                                            this.setState({lkUtDt:new Date()})
                                        } 
                                    }}/>
                                    {/* <ReactDatePicker type='date' datePickerTheme="date-picker calendar_icon" dateFrmt="dd-MMM-yyyy" selected={this.state.lkUtDt} onChange={(event)=>this.setState({lkUtDt:event})}/> */}
                                </div>}
                            </div>
                            {this.values && this.values.isSubchap && 
                                <div className="course-setting">
                                    <div className="course-setting_cont">
                                        <div className="row m-0">
                                            <div className="col-10 p-0">
                                                <div className="course-setting_label">
                                                    <p className="course-form_header">{this.props.t("translate:REQUIRE")}</p>
                                                    {/* <p className="course-form_content">{this.props.t("translate:ARRANG_ELEME_PRE_REQ")}</p> */}
                                                </div>
                                            </div>
                                            <div className="col-2 p-0">
                                                <div className="course-form_select">
                                                    <CheckBox className="check-box" checked={this.state.isRequre} onChange={(event)=>{
                                                        this.setState({...this.state,isRequre:event.target.checked})
                                                        if (event.target.checked && aReq.length === 0 && this.props.subChapItems && this.props.subChapItems.length>0) {
                                                            this.addRequriment(aReq.length);
                                                        }
                                                    }}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* subchapter items and domain code load */}
                                    {this.state.isRequre && 
                                    <div className="course-setting_select">
                                        { this.props.subChapItems && this.props.subChapItems.length>0 ?
                                        <div>
                                        <p className="requirement-label">{this.props.t("translate:REQ_STUD_PRE_REQ")}</p>
                                        <div className="requirement-list">
                                            {aReq && aReq.length>0 && aReq.map((oSubchap,index)=>{
                                                return( 
                                                
                                                <div className="select-dropdown_list">
                                                <div className="row m-0">
                                                    <div className="col-5 p-0">
                                                        <LmsGrpDrpDown className="dropdown-select drop-down_arrow"
                                                        value={oSubchap.cntId} defaultDisabled={false}
                                                        onChange={(event) => {
                                                            let isDup = true  // check for duplicate
                                                            for (let i = 0; i < this.state.aReq.length; i++) {
                                                                if (this.state.aReq[i].cntId === event.target.value) {
                                                                    isDup = false
                                                                    break;
                                                                }
                                                            }
                                                            if (isDup) {
                                                                oSubchap.cntId = event.target.value;
                                                                this.setState({ ...this.state, aReq: aReq });
                                                                this.checkForDomain(event.target.value, index);
                                                            }
                                                        }}
                                                        oContent={this.grpContents()} keyTag="_id" nameTag="title" 
                                                        />
                                                    </div>
                                                    
                                                 
                                                   <div className="col-4 p-0">
                                                        <LmsSelectDropDown className="dropdown-select drop-down_arrow"
                                                         items   value={oSubchap.type} defaultDisabled={false}
                                                            onChange={(event) => {
                                                                oSubchap.type =event.target.value;
                                                                // If it is score atlest set true in mark filed
                                                                if(event.target.value ==='SA'){  
                                                                    oSubchap.isScore = true
                                                                }else{
                                                                  oSubchap.isScore = false
                                                                }
                                                                this.setState({ ...this.state,category:event.target.value,aReq: aReq });
                                                            }}
                                                            dropDown={oSubchap.aCategory} keyTag="code" nameTag="text"
                                                        />
                                                    </div> 
                                                    { oSubchap.isScore &&
                                                    <div className="col-2 p-0">
                                                        <div className="mark-select_box">
                                                            <InputBox className={isMxmrk ?'input-score':'input-score_error'} 
                                                              value={oSubchap.score} onChange={(event)=>
                                                                {
                                                                 oSubchap.score = event.target.value
                                                                 this.setState({...this.state,score:oSubchap.score})}}
                                                                 onBlur={()=>this.checkScrExisting(oSubchap.mxMrk)}
                                                              />
                                                            <span >/{oSubchap.mxMrk}</span>
                                                        </div>
                                                    </div>}
                                                    <div className="col p-0">
                                                        <div className="remove-cont-list" onClick={()=>
                                                        {
                                                            aReq.splice(index,1);
                                                            this.setState({ ...this.state, aReq: aReq });
                                                            if(!(this.props.subChapItems.length<=this.state.aReq.length)){
                                                                this.setState({...this.state,isAddReq:true});
                                                            }
                                                        }
                                                        }>
                                                            {index > 0 && <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer"/>}
                                                        </div>
                                                    </div>
                                                </div>
                                                </div>
                                                )
                                            })}
                                        </div>
                                        </div>:
                                        <div className="no-items">
                                        <p className="no_item-found"><span> <Info className="svg-icon_small icon-primary" /></span>{this.props.t("translate:NO_ITEMS")}</p>
                                        </div>}
                                        {this.state.isAddReq && this.props.subChapItems && this.props.subChapItems.length>0 &&
                                          <p className="add-requirement_label" onClick={()=>
                                            this.addRequriment(aReq.length)
                                            }>
                                            <span>
                                                <Plus className="svg-icon_small icon-primary icon-pointer" />
                                            </span>
                                            {this.props.t("translate:ADD_REQUEST")}
                                        </p>}
                                    </div>}
                                </div>
                            }
                            {/*      */}
                            {this.props.lmsTyp && this.props.lmsTyp === 'FF' && this.values.isChap &&
                                <div className="course-setting">
                                    <div className="course-setting_cont">
                                        <div className="row m-0">
                                            <div className="col-10 p-0">
                                                <div className="course-setting_label">
                                                    <p className="course-form_header">{this.props.t("translate:PRE_REQUEST")}</p>
                                                    {/* <p className="course-form_content">{this.props.t("translate:ARRANG_ELEME_PRE_REQ")}</p> */}
                                                </div>
                                            </div>
                                            <div className="col-2 p-0">
                                                <div className="course-form_select">
                                                    <CheckBox className="check-box" checked={this.state.isPreReq} onChange={(event)=>{
                                                        this.setState({...this.state,isPreReq:event.target.checked})
                                                        if(event.target.checked && aPreReq.length === 0 && this.props.aChapNms && this.props.aChapNms.length>0){
                                                            aPreReq.push({ chapId: this.props.aChapNms[0] && this.props.aChapNms[0]._id });
                                                            this.setState({ aPreReq: aPreReq }, () => {
                                                                if (this.props.aChapNms.length === this.state.aPreReq.length) {
                                                                    this.setState({ ...this.state, isAddPreReq: false });
                                                                }
                                                            });
                                                        }
                                                        }}/>
                                                </div>
                                            </div>  
                                        </div>
                                    </div>
                                    {this.state.isPreReq && 
                                    <div className="course-setting_select">
                                        {this.props.aChapNms && this.props.aChapNms.length >0 ?
                                            (<div className="requirement-list">
                                                {/* Add multiple prerequisites */}
                                                {aPreReq && aPreReq.length>0 && aPreReq.map((oChap,index)=>
                                                    {
                                                        return(
                                                            <div className="select-dropdown_list">
                                                            <div className="row m-0">
                                                                <div className="col-8 p-0">
                                                                    <LmsSelectDropDown className="dropdown-select drop-down_arrow"
                                                                        value={oChap.chapId} defaultDisabled={false}
                                                                        onChange={(event) => {
                                                                            oChap.chapId=event.target.value;
                                                                            this.setState({ ...this.state, aPreReq: aPreReq});
                                                                        }}
                                                                        dropDown={this.props.aChapNms} keyTag="_id" nameTag="ChapName"
                                                                    />
                                                                </div>
                                                                <div className="col-4 p-0" onClick={()=>{
                                                                    aPreReq.splice(index,1);
                                                                    this.setState({ ...this.state, aPreReq: aPreReq })
                                                                    if (!(this.props.aChapNms.length <= this.state.aPreReq.length)) {
                                                                        this.setState({ ...this.state, isAddPreReq: true });
                                                                    }
                                                                    }}>
                                                                    {index > 0 && <div className="remove-cont-list">
                                                                        <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                                                    </div> }
                                                                </div>
                                                            </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>)
                                            :
                                            (<div className="no-items">
                                            <p className="no_item-found"><span> <Info className="svg-icon_small icon-primary" /></span>{this.props.t("translate:NO_ITEMS")}</p>
                                            </div>)
                                        }
                                        {this.state.isAddPreReq && this.props.aChapNms && this.props.aChapNms.length>0 &&
                                            <p className="add-requirement_label" onClick={()=>{
                                                this.addPreRequisite(aPreReq.length);
                                            }}>
                                                <span>
                                                    <Plus className="svg-icon_small icon-primary icon-pointer" />
                                                </span>
                                                {this.props.t("translate:ADD_PRE_REQUEST")}
                                            </p>
                                        }
                                    </div>
                                    }
                                </div>}
                            {/* <div className="course-setting">
                                <div className="row m-0">
                                    <div className="col-10 p-0">
                                        <div className="course-setting_label">
                                            <p className="course-form_header">{this.props.t("translate:ALLOW_CONVERSATION")}</p>
                                            <p className="course-form_content">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                                        </div>
                                    </div>
                                    <div className="col-2 p-0">
                                        <div className="course-form_select">
                                            <CheckBox className="check-box" onChange={(event)=>this.setState({alwCon:event.target.checked})} checked={this.state.alwCon}/>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    ...state.settingsReducer,
    ...state.contentReducer
})
const mapDispatchToProps = {
    getSubConfiq,
    getChapNames,
    saveSequenceConfig,
    loadItems,
    updateFields
}


const TabNavigator = (props) => <PrerequestForm {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components))
