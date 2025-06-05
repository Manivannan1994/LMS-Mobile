import React, { Component ,lazy} from 'react';
import '../../styles/_courseSettingStyle.scss';
import Button from '../button/Button';
import RadioButton from '../radio-button/RadioButton';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { saveSubConfiq, getSubConfiq, getGradeSystem, updateCrseSetFields, getArchiveCrsDtls } from '../../store/actions/SettingsActions';
import { MinusCircle, Plus, Trash2, Info, Search} from 'react-feather';
import LmsCommonService from '../../service/lms-service';
import _ from 'lodash';
import CourseImgColorSetting from '../courseImg-color-settings/CourseImgColorSetting';
import {lmsDateFormat} from '../../utils/helper';

const ModelBarComponent = lazy(() => import('../modelbar/Modelbar'));
const CheckBox = lazy(()=>
import('../checkbox/CheckBox')
);
const InputBox = lazy(()=>
import('../input-box/InputBox')
);
const LmsSelectDropDown = lazy(()=>
    import('../lms-selectdropdown/LmsSelectDropDown')
);

const TotPerc = 100;    // Total percentage
let aGrdCtDumy = [];

class CourseSettingComponent extends Component {
    constructor(props) {
       
        super(props);
        this.errMsgGrdRef = React.createRef();
        this.state = {
            courProg: 'FF', //Course progression
            isConfiq: false,
            isGrdCtSel : true,
            isGrdScSel : true,
            isUnGrdSel : false,
            aCategory : [],         // Grade categories
            aSelGrdSch : [],        // Selected grade scheme
            remPerc : 100,
            shwAdCt : true,
            aGrdCat : [],
            imgUrl : "",            // image Url
            bgClr:"",               // BackGround Color
            // isArchiCrs :false,   // If its archive course or not 
            archiveCrsDtls:{},  // Archive course details
            isAvCrs:false,     // Is archive course enable or not 
            isCntVw:false,     // Is content view
            isGrdVw:false,     // Is grade view
            isConVw:false      // Is conversation view
        }
    }
    componentDidMount() {
        this.props.updateCrseSetFields('oGradScheme', {});
        this.getConfigDetails();
        this.getArchiveCrsDtls();
    }

    // Get archive course details
    getArchiveCrsDtls = () =>{
        let oReq = {
            InId: this.props.location.state.InId,
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            AcYr: this.props.location.state.AcYr,
            DeptID: this.props.location.state.DeptID,
            SemID: this.props.location.state.SemID,
            isFE: this.props.session.fe ? true : false,
            oProj:{
                StDt:1,
                EnDt:1
            }
        };
        this.props.getArchiveCrsDtls(oReq,this.archiveCrs);
    }
    // set Image url from CourseImgColorSetting
    setImgUrl = (imgUrl) => {
        this.setState({...this.state, imgUrl:imgUrl , isAprUpd : false})
    }

    // set Color code from CourseImgColorSetting
    setClrCode = (bgColor) => {
        this.setState({...this.state, bgClr:bgColor , isAprUpd : false})
    }

    // set the button enable
    isConfiqBtn = (blnVlu, remImg) => {
        this.setState({...this.state, isConfiq:blnVlu, isAprUpd : false, imgUrl : (remImg ? '' : this.state.imgUrl)})
    }

    // Get config details

    getConfigDetails = () => {
        // Get grade systems
        const oGradSyReq = {
            PrID: this.props.location.state.PrID,
            CrID: this.props.location.state.CrID,
            SemID: this.props.location.state.SemID
        };
        this.props.getGradeSystem(oGradSyReq, null);

        //get the domain values
        const oDomainCodes = {
            codes: ['ASSGNMNT_CAT'],
        };
        // Set domain code values
        LmsCommonService.getDomainByCode(oDomainCodes, (err, data) => {
            if (data && data.length) {
                for (let cd = data.length - 1; cd >= 0; cd--) {
                    if (data[cd].code === "ASSGNMNT_CAT" && data[cd].ccodes && data[cd].ccodes.length) {
                        aGrdCtDumy = [{
                            grdCat: data[cd].ccodes[0].code,
                            wghtge: ''
                        }];
                        this.setState({ aCategory: data[cd].ccodes });
                        break;
                    }
                }
            }
            // Get subject configuration
            let oReq = {
                InId: this.props.location.state.InId,
                PrID: this.props.location.state.PrID,
                CrID: this.props.location.state.CrID,
                AcYr: this.props.location.state.AcYr,
                DeptID: this.props.location.state.DeptID,
                SemID: this.props.location.state.SemID,
                SecID: this.props.location.state.SecID,
                subjId: this.props.location.state.subId,
            }
            this.props.getSubConfiq(oReq, null, this.updateCoutProg);
        });
    }
    // calculate percentage for assignment categories

    calculatePercentage = (aGrdCat) => {
        let perTaken = 0;
        let remPerCpy = 0;
        for(let cat = aGrdCat.length - 1; cat >= 0; cat--){
            if(aGrdCat[cat].wghtge !== '' && aGrdCat[cat].wghtge !== null && !isNaN(aGrdCat[cat].wghtge)){
                perTaken += parseFloat(aGrdCat[cat].wghtge);
            }
        }
        remPerCpy = TotPerc-perTaken;
        if(remPerCpy != null && !isNaN(remPerCpy)){
            return remPerCpy;
        }
    }

    // update checkbox for liner form or free from
    updateCoutProg = (oSubCnfg) => {
        // Calculate total percentage taken
        let remnPerc = 0;
        if(oSubCnfg.aGrdCat && oSubCnfg.aGrdCat.length){
            remnPerc = this.calculatePercentage(oSubCnfg.aGrdCat);
        }else{
            remnPerc = this.state.remPerc;
        }
        this.setState({ ...this.state, 
            courProg: oSubCnfg.lmsTyp,
            aGrdCat : oSubCnfg.aGrdCat,
            isGrdCtSel : (oSubCnfg.aGrdCat && oSubCnfg.aGrdCat.length > 0) ? false : true,
            isGrdScSel : oSubCnfg.grdSys ? false : true,
            isUnGrdSel : oSubCnfg.isUnGr,
            remPerc : remnPerc,
            isAprUpd : true,
            imgUrl:oSubCnfg.imgUrl,
            bgClr:oSubCnfg.bgClr,
            isAvCrs: (oSubCnfg.oAvCrsDls && oSubCnfg.oAvCrsDls.isAvCrs) ? oSubCnfg.oAvCrsDls.isAvCrs : false,
            isCntVw: (oSubCnfg.oAvCrsDls && oSubCnfg.oAvCrsDls.isCntVw) ? oSubCnfg.oAvCrsDls.isCntVw : false,
            isGrdVw: (oSubCnfg.oAvCrsDls && oSubCnfg.oAvCrsDls.isGrdVw) ? oSubCnfg.oAvCrsDls.isGrdVw : false,
            isConVw: (oSubCnfg.oAvCrsDls && oSubCnfg.oAvCrsDls.isConVw) ? oSubCnfg.oAvCrsDls.isConVw : false,
        });
        if(oSubCnfg.grdSys) {
            if(this.props.aGrdSystem && this.props.aGrdSystem.length){
                for(let grd = this.props.aGrdSystem.length - 1; grd >= 0; grd--){
                    if(this.props.aGrdSystem[grd]._id+'' === oSubCnfg.grdSys){
                        this.props.updateCrseSetFields('oGradScheme', this.props.aGrdSystem[grd]);
                        break;
                    }
                }
            }
        }
    }

    // submit subject confiq  
    subjConfiq = () => {
        // Check mandatory fields and total percentage should be 0
        if(this.state.aGrdCat && this.state.aGrdCat.length){
            const aGrdCatCpy = [...this.state.aGrdCat];
            let isManEx = false;
            let totWght = 0;
            for(let grd = aGrdCatCpy.length - 1; grd >= 0; grd--){
                aGrdCatCpy[grd].isCatReq = false;
                if(!aGrdCatCpy[grd].grdCat){
                    aGrdCatCpy[grd].isCatReq = true;
                    isManEx = true;
                }
                let wgth = parseFloat(aGrdCatCpy[grd].wghtge);
                aGrdCatCpy[grd].isNumReq = false;
                if(wgth == null || isNaN(wgth)){
                    aGrdCatCpy[grd].isNumReq = true;
                    isManEx = true;
                    // Scroll error msg
                    if( aGrdCatCpy[grd].isNumReq &&  this.errMsgGrdRef.current){
                        this.errMsgGrdRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                }
                if(wgth != null && !isNaN(wgth)){
                    totWght += wgth;
                }
            }
            if(isManEx || (totWght < TotPerc || totWght > TotPerc)){
                this.setState({...this.state, aGrdCat : aGrdCatCpy, remErr : (totWght < TotPerc || totWght > TotPerc) ? true : false});
                return;
            }
        }
        if (this.props.oGradScheme && _.isEmpty(this.props.oGradScheme) && !this.state.isGrdScSel) {
            this.setState({ isGrdScSel: true });
        }
        if (this.state.isConfiq) {
            let oReq = {
                InId: this.props.location.state.InId,
                PrID: this.props.location.state.PrID,
                CrID: this.props.location.state.CrID,
                AcYr: this.props.location.state.AcYr,
                DeptID: this.props.location.state.DeptID,
                SemID: this.props.location.state.SemID,
                SecID: this.props.location.state.SecID,
                subjId: this.props.location.state.subId,
                lmsTyp: this.state.courProg,
                aGrdCat : this.state.aGrdCat,
                isUnGr : this.state.isUnGrdSel,
                grdSys : ((this.props.oGradScheme && this.props.oGradScheme._id) ? this.props.oGradScheme._id : ''),
                imgUrl : this.state.imgUrl,
                bgColor : this.state.bgClr
            }
            if (this.state.isAvCrs) {
                oReq.oAvCrsDls = {
                    isAvCrs:this.state.isAvCrs,
                    isCntVw: this.state.isCntVw,
                    isGrdVw: this.state.isGrdVw,
                    isConVw: this.state.isConVw
                }
            } else {
                oReq.oAvCrsDls = {
                    isAvCrs:this.state.isAvCrs,
                    isCntVw: false,
                    isGrdVw: false,
                    isConVw: false,
                };
            }
            this.props.saveSubConfiq(oReq, this.upadteIsConfiq);
        }
    }

    // change button disble
    upadteIsConfiq = (value) => {
        this.setState({ ...this.state, isConfiq: value });
    }

    // Course grade change
    crsGrdHandler = (event) => {
        let aGrdCatDum = [];
        if(aGrdCtDumy && aGrdCtDumy.length){
            aGrdCatDum = [...aGrdCtDumy];
        }
        if(event.target.checked){
            this.setState({isGrdCtSel : false, aGrdCat : aGrdCatDum, isConfiq : true});
        }else{
            this.setState({isGrdCtSel : true, aGrdCat : [], isConfiq : true});
        }
    }

    // Grade scheme change 
    grdSchmHandler = (event) => {
        if(event.target.checked){
            this.setState({isGrdScSel : false, isConfiq : true});
        }else{
            this.setState({isGrdScSel : true, isConfiq : true});
            this.props.updateCrseSetFields('oGradScheme', {});
        }
    }

    // Un grade item change
    unGrdItmHandler = (event) => {
        if(event.target.checked){
            this.setState({isUnGrdSel : true, isConfiq : true});
        }else{
            this.setState({isUnGrdSel : false, isConfiq : true});
        }
    }

    // Add grade category
    addGradeCatgry = () => {
        let aGrdCatsCpy = [];
        const oGradeCat = {
            grdCat : '',  // Grade category
            wghtge : ''   // Grade weightage
        };
        let codeEx = false;
        let shwAdCat = true;
        if(this.state.aGrdCat && this.state.aGrdCat.length){
            aGrdCatsCpy = [...this.state.aGrdCat];
            if(this.state.aCategory && this.state.aCategory.length){
                for(let dpCat = this.state.aCategory.length - 1; dpCat >= 0; dpCat--){
                    for(let cat = this.state.aGrdCat.length - 1; cat >= 0; cat--){
                        if(this.state.aCategory[dpCat].code === this.state.aGrdCat[cat].grdCat){
                            break;
                        }else if(cat === 0){
                            codeEx = true;
                            oGradeCat.grdCat = this.state.aCategory[dpCat].code;
                        }
                    }
                }
            }
        }
        if(codeEx){
            aGrdCatsCpy.push(oGradeCat);
            if(this.state.aCategory.length === aGrdCatsCpy.length){
                shwAdCat = false;
            }
            this.setState({ ...this.state, aGrdCat : aGrdCatsCpy, shwAdCt : shwAdCat, isConfiq : true});
        }
    }

    // Grade category change
    grdCategoryChange = (event, index) => {
        const aGrdCatsCpy = [...this.state.aGrdCat];
        let grdAlrSl = false;
        if(this.state.aGrdCat && this.state.aGrdCat.length){
            for(let grd = this.state.aGrdCat.length - 1; grd >=0; grd--){
                if(this.state.aGrdCat[grd].grdCat === event.target.value){
                    grdAlrSl = true;
                    break;
                }
            }
        }
        // Do not change the grade category if it is already
        if(!grdAlrSl){
            aGrdCatsCpy[index].grdCat = event.target.value;
            aGrdCatsCpy[index].wghtge = '';
            this.setState({ ...this.state, aGrdCat : aGrdCatsCpy , isConfiq : true});
        }
    }

    // Weightage change
    weightageChange = (event, index) => {
        const aGrdCatsCpy = [...this.state.aGrdCat];
        aGrdCatsCpy[index].wghtge = event.target.value;
        let remnPerc = this.calculatePercentage(aGrdCatsCpy);
        this.setState({ ...this.state, aGrdCat : aGrdCatsCpy, remPerc : remnPerc , isConfiq : true});
    }

    // Delete grade category
    deleteGradCat = (index) => {
        if(this.state.aGrdCat && this.state.aGrdCat.length > 1){
            const aGrdCatsCpy = [...this.state.aGrdCat];
            aGrdCatsCpy.splice(index, 1);
            let remnPerc = this.calculatePercentage(aGrdCatsCpy);
            let shwAdCat = false;
            if(this.state.aCategory && this.state.aCategory.length && this.state.aCategory.length !== aGrdCatsCpy.length){
                shwAdCat = true;
            }
            this.setState({ ...this.state, aGrdCat : aGrdCatsCpy, remPerc : remnPerc, shwAdCt :  (shwAdCat ? shwAdCat : true), isConfiq : true}); 
        }
    }

    // Delete grade scheme
    
    deleteGradeScheme = () => {
        this.props.updateCrseSetFields('oGradScheme', {});
        this.setState({...this.state,isConfiq:true});
    }
   
    // Discard changes for create and edit

    discardChanges = () => {
        this.setState({
            courProg: 'FF',
            isConfiq: false,
            isGrdCtSel: true,
            isGrdScSel: true,
            isUnGrdSel: false,
            aCategory: [],
            aSelGrdSch: [],
            remPerc: 100,
            shwAdCt: true,
            aGrdCat: [],
            imgUrl : "",
            bgClr:"",
            archiveCrsDtls:{},
            isAvCrs:false,
            isCntVw:false,
            isGrdVw:false,
            isConVw:false

        })

        this.getConfigDetails();
        this.getArchiveCrsDtls();
    }
    // Set Archive course
    archiveCrs = (archiveCrsDtls) => {
        if (archiveCrsDtls) {
            this.setState({ ...this.state, isArchiCrs: true, archiveCrsDtls: archiveCrsDtls });
        }
    }
    // Archive course checkbox handler
    archiveHandler = (event) =>{
        if (event.target.checked) {
            this.setState({ ...this.state, isAvCrs: true, isCntVw: true, isConVw: true, isGrdVw: true, isConfiq: true });
        } else {
            this.setState({ ...this.state, isAvCrs: false, isCntVw: false, isConVw: false, isGrdVw: false, isConfiq: true });
        }
    }
    render() {
        return (
            <div>
                <div className="course-setting_container">
                    <div className="course-setting_cont">  
                     <div className="row m-0">
                        <div className="col-5 p-0">
                            <p className="course-setting_header">{this.props.t("translate:CUR_SETTING")}</p>
                            <p className="course-setting_content">{this.props.t("translate:INTERACT_COURSE_SETTING")}</p>
                        </div>
                        <div className="col-7 p-0">
                            <div className="course-setting">
                                <div className="course-setting_form">
                                    <p className="course-form_header">{this.props.t("translate:COURSE_PRG")}</p>
                                    <p className="course-form_content">{this.props.t("translate:NAVIGATE_COURSE_SEETTING")}</p>
                                </div>
                                <div className="course-setting_select">
                                    <div className="course-setting_list">
                                        <RadioButton className="radio-btn" name="courProg" value="LR" checked={this.state.courProg === "LR"} onChange={(event) =>
                                            this.setState({ ...this.state, courProg: event.target.value, isConfiq: true })
                                        } />
                                        <div className="course-setting_label">
                                            <p className="course-label_header">{this.props.t("translate:LINEAR")}</p>
                                            <p className="course-label_cont">{this.props.t("translate:STEP_SEQUENCE_SETTING")}</p>
                                        </div>
                                    </div>
                                    <div className="course-setting_list">
                                        <RadioButton className="radio-btn" name="courProg" value="FF" checked={this.state.courProg === "FF"} onChange={(event) =>
                                            this.setState({ ...this.state, courProg: event.target.value, isConfiq: true })
                                        } />
                                        <div className="course-setting_label">
                                            <p className="course-label_header">{this.props.t("translate:FREE_FRM")}</p>
                                            <p className="course-label_cont">
                                                {this.props.t("translate:WITH_OUT_STEP_SEQUENCE_SETTING")}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grade-course_scheme">
                                <div className="grade-course_select">
                                <div className="grade-setting_form">
                                    {this.state.archiveCrsDtls &&  this.state.archiveCrsDtls.EnDt  && <p className="course-form_header">{this.props.t("translate:ARCHIVE_THIS_COURSE")}({this.props.t("translate:AFTER")} {lmsDateFormat(this.state.archiveCrsDtls.EnDt)})</p>}
                                    <p className="course-form_content">{this.props.t("translate:ARCHIVE_MAIN_CONTENT")}</p>
                                </div>
                                <CheckBox className="check-box" onChange={(event)=> this.archiveHandler(event)} checked={this.state.isAvCrs}/>
                                </div>
                                {this.state.isAvCrs &&
                                 <div className="select-cont_archive">
                                     <div className="select-cont_check">
                                     <CheckBox className="check-box" onChange={(event)=> this.setState({...this.state,isCntVw:event.target.checked,isConfiq:true})} checked={this.state.isCntVw}/> <span>{this.props.t("translate:CAN_VIEW_CONTENT")}</span>
                                     </div>
                                     <div className="select-cont_check"> 
                                     <CheckBox className="check-box" onChange={(event)=> this.setState({...this.state,isGrdVw:event.target.checked,isConfiq:true})} checked={this.state.isGrdVw}/> <span>{this.props.t("translate:CAN_VIEW_GRADE")}</span>
                                     </div>
                                     <div className="select-cont_check">
                                     <CheckBox className="check-box" onChange={(event)=> this.setState({...this.state,isConVw:event.target.checked,isConfiq:true})} checked={this.state.isConVw}/> <span>{this.props.t("translate:CAN_VIEW_CONVER")}</span>
                                     </div>
                                 </div>
                                }
                            </div>
                        </div>
                    </div>       
                </div>

                <div className="grade-setting_cont"  ref={this.errMsgGrdRef}>
                    <div className="row m-0">
                        <div className="col-5 p-0">
                            <p className="course-setting_header">{this.props.t("translate:GRADE_SETTINGS")}</p>
                            <p className="course-setting_content">{this.props.t("translate:GRADE_INFO")}</p>

                            <div style={{marginTop:"260px"}}>
                                <p className="course-setting_header">{this.props.t("translate:CUSTOMIZE APPEARANCE")}</p>
                                <p className="course-setting_content">{this.props.t("translate:CONTROL_STUD_INTRACT_WITH_COURSE")}</p>
                            </div>
                        </div>
                        <div className="col-7 p-0">
                            <div className="grade-course_setting">
                                <div className="grade-course_select">
                                <div className="grade-setting_form">
                                    <p className="course-form_header">{this.props.t("translate:GRADE_CAT_INFO")}</p>
                                    <p className="course-form_content">{this.props.t("translate:GRADE_CONFIG_INFO")}</p>
                                </div>
                                <CheckBox className="check-box" onChange={(event)=> this.crsGrdHandler(event)} checked={!this.state.isGrdCtSel}/>
                                </div>
                                {
                                    !this.state.isGrdCtSel && 
                                    <div className="grade-category_select">
                                        <div className="grade-category_heading">
                                            <div className="row">
                                                <div className="col-7">
                                                    <p className="grade-input_head"> {this.props.t("translate:GRADE_CATEGORY")}</p>
                                                </div>
                                                <div className="col-3">
                                                    <p className="grade-input_head"> {this.props.t("translate:WEIGHTAGE")}</p>
                                                </div>
                                                <div className="col-2">
                                                </div>
                                            </div>
                                        </div>

                                        
                                        <div>
                                                {
                                                    this.state.aGrdCat && this.state.aGrdCat.length > 0 &&
                                                    (
                                                        this.state.aGrdCat.map((oGrdCat, grdIndx) => {
                                                            return(
                                                                <div className="grade-category_input" >
                                                                    <div className="row">
                                                                        <div className="col-7">
                                                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" value={oGrdCat.grdCat} defaultDisabled={false} 
                                                                            onChange={(event) => this.grdCategoryChange(event, grdIndx)} dropDown={this.state.aCategory} keyTag="code" nameTag="text"/>
                                                                            {
                                                                                oGrdCat.isCatReq &&
                                                                                <p className="required-label_grade">{this.props.t("translate:REQUIRED")}</p>
                                                                            }
                                                                        </div>
                                                                        <div className="col-3">
                                                                            <InputBox className="input-block" value = {oGrdCat.wghtge} onChange = {(event) => this.weightageChange(event, grdIndx)}/>
                                                                            {
                                                                                oGrdCat.isNumReq &&
                                                                                <p className="required-label_grade">{this.props.t("translate:ENTER_NUMBER")}</p>
                                                                            }
                                                                        </div>
                                                                        <div className="col-2">
                                                                            <div className="grade-category_remove">
                                                                            <MinusCircle className="svg-icon_small icon-dark icon-pointer" onClick={(event) => this.deleteGradCat(grdIndx)}/>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    )
                                                }
                                        </div>
                                        <div className="add-category_group">
                                            {
                                                this.state.aGrdCat && this.state.aGrdCat.length > 0 &&
                                                <div className="row">
                                                    <div className='col-7'>
                                                        <p className="add-cat_grade">
                                                        {
                                                            this.state.shwAdCt &&
                                                            <span className="add-grade_category" onClick={() => this.addGradeCatgry()}>
                                                                <span>
                                                                    <Plus className="svg-icon_small icon-primary icon-pointer" />
                                                                </span>
                                                                {this.props.t("translate:ADD_GRADE_CATEGORY")}
                                                            </span>
                                                        }
                                                        </p>
                                                    </div>
                                                    <div className='col-5'>
                                                        <p className = {this.state.remPerc === 0 ? "add_cat_remain" : "add_cat_remain_over"}>
                                                            <span>
                                                                {this.props.t("translate:REMAINING")} {this.state.remPerc}%
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>


         




                            <div className="grade-course_scheme">
                                <div className="grade-course_select">
                                <div className="grade-setting_form">
                                    <p className="course-form_header">{this.props.t("translate:ENABLE_GRADE_SCHEME")}</p>
                                    <p className="course-form_content">{this.props.t("translate:GRADE_SCHEME_INSTRUCTION")}</p>
                                </div>
                                <CheckBox className="check-box" onChange={(event)=> this.grdSchmHandler(event)} checked={!this.state.isGrdScSel}/>
                                </div>
                                {
                                    !this.state.isGrdScSel && 
                                    <div>
                                        {
                                            (this.props.oGradScheme && _.isEmpty(this.props.oGradScheme)) ? 
                                            <div className="specific-student">
                                                <div className="grade-lists">
                                                    <div className="no-gradscheme">
                                                        <p className="grade-notfound">
                                                            <span>
                                                            <Info className="svg-icon_small icon-primary" />
                                                            </span>
                                                            {this.props.t("translate:NO_GRADE_SCHEME")}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="add-grade_scheme" data-toggle="modal" data-target="#gradeSystem-page">
                                                    <p className="grade-add">
                                                        <span>
                                                            <Search className="svg-icon_small icon-primary" />
                                                        </span>
                                                        {this.props.t("translate:FIND_GRADE_SCHEME")}
                                                    </p>
                                                </div>
                                            </div>
                                            :
                                            <div className="grade-category_table">
                                                <div className="category-table_heading">
                                                    <p className="category-inst_name">{this.props.oGradScheme.GrdSysNm}</p>
                                                    <Trash2 className="svg-icon_small icon-default icon-pointer" onClick={() => this.deleteGradeScheme()}/>
                                                </div>
                                                <table className="grading-scheme_table">
                                                    <tr className="grade-head_table">
                                                        <th>{this.props.t("translate:GRADE")}</th>
                                                        <th>{this.props.t("translate:RANGE")}</th>
                                                        <th></th>
                                                    </tr>
                                                    {
                                                        (this.props.oGradScheme.GrdConfig && this.props.oGradScheme.GrdConfig.length > 0) ?
                                                        (
                                                            this.props.oGradScheme.GrdConfig.map((oGrdCn) => {
                                                                return (
                                                                    <tr className="grade-range_table">
                                                                        <td>{oGrdCn.grdNm}</td>
                                                                        <td>{oGrdCn.MaxMrk}%</td>
                                                                        <td>to {oGrdCn.MinMrk}%</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        )
                                                        :
                                                        ''
                                                    }
                                                </table>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <div className="grade-course_scheme">
                                <div className="grade-course_select">
                                <div className="grade-setting_form">
                                    <p className="course-form_header">{this.props.t("translate:TREAT_UNGRADE_ITEM")}</p>
                                    <p className="course-form_content">{this.props.t("translate:TREAT_UNGRADE_INFO")}</p>
                                </div>
                                <CheckBox className="check-box" onChange={(event)=> this.unGrdItmHandler(event)} checked={this.state.isUnGrdSel}/>
                                </div>
                            </div>

                          

                            <div className="grade-course_scheme">
                                <CourseImgColorSetting
                                imgUrl={this.state.imgUrl}
                                setImgUrl={this.setImgUrl}     // set imgUrl from child
                                setClrCode={this.setClrCode}   // set colorCode from child
                                isConfiqBtn={this.isConfiqBtn}
                                bgColor={this.state.bgClr}
                                orgClr={this.props.location.state.bgClr}
                                isAprUpd = {this.state.isAprUpd}
                                crsContent={this.props.location.state.subNa}
                                secNm={this.props.location.state.SecName}
                                />
                        </div>

                        </div>
                    </div>
                    </div>
                    {/* Commenting this since it has no functionality refer 33608 */}
                    {/* <div className="grade-setting_cont">
                        <div className="row m-0">
                            <div className="col-5 p-0">
                                <p className="course-setting_header">Notification settings</p>
                                <p className="course-setting_content">Control how students interact with the course</p>
                            </div>
                            <div className="col-7 p-0">
                                <div className="notification-course_scheme">
                                    <div className="grade-course_select">
                                    <div className="grade-setting_form">
                                        <p className="course-form_header">Enable Notifications for this course</p>
                                        <p className="course-form_content">You can easily enable or disable all notifications for each course. These changes only affect this course and your account.</p>
                                    </div>
                                    <CheckBox className="check-box"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}


                   {!this.props.location.state?.isDisabledContent &&
                    <div className="course-setting_btn">
                    <Button theme= "btn-rounded secondary-btn btn-right" clicked={()=> this.discardChanges()}> {this.props.t("translate:DISCARD_BTN")}</Button>
                    <Button theme={this.state.isConfiq ? "btn-rounded default" : "btn-rounded btn-disable"} clicked={() => {
                        this.subjConfiq()}}>{this.props.t("translate:SAVE_CHG")}</Button>
                        {/* <Button theme="btn-rounded btn-disable" clicked={() => this.subjConfiq()}>{this.props.t("translate:SAVE_CHG")}</Button> */}

                    </div>
                   }
                </div>
                <ModelBarComponent />
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    ...state.settingsReducer,
    ...state.headerReducer
})
const mapDispatchToProps = {
    saveSubConfiq,
    getSubConfiq,
    getGradeSystem,
    updateCrseSetFields,
    getArchiveCrsDtls
}


const TabNavigator = (props) => <CourseSettingComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(withRouter(Components))


