import React, { lazy, useEffect, useState,useRef } from "react";
import { withTranslation } from "react-i18next";
import { MoreVertical, Plus,X, ArrowLeft, Edit2, Trash, AlertCircle, AlertOctagon } from "react-feather";
import "../../styles/_commonLmsStyle.scss";
import "../../styles/_rubricsEditStyle.scss";
import { useHistory, useLocation } from "react-router-dom";
import { getRubrics, createOrUpdateRubrics } from "../../store/actions/RubricsActions";
import { connect } from "react-redux";
import SimpleReactValidator from 'simple-react-validator';
import queryString from 'query-string';
import _ from 'lodash';
const Button = lazy(() => import("../button/Button"));
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);
const InputBox = lazy(() => import("../input-box/InputBox"));
const CheckBox = lazy(() => import("../checkbox/CheckBox"));
const oDumCrt = {
   crtNm : 'Description of criterion',
   aRtngs : [
      {
         rtNm : 'Full Marks',
         rtPnt   : 5,
      },
      {
         rtNm : 'No Marks',
         rtPnt   : 0,
      }
   ],
   isRang:false,
   maxPnt : 5
};
const oDumRng = {
   aRtngs : [
      {
         rtNm : 'Full Marks',
         min : 0,
         max : 5
      },
      {
         rtNm : 'No Marks',
         max : 0,
         min : 0
      }
   ],
   isRang:true,
   maxPnt : 5
   
};
let shwRatBanTnfo = false;       // Rating Information
let shwRatBanErr = false;        // Rating Error

const RubricsEditComponent = (props) => {

   const history                                 = useHistory();
   const location                                = useLocation();
   const [ aCriterion, setCriterion ]            = useState([]);
   const [ rubricsModal , setRubricsModal ]      = useState(false);        // Criteria modal
   const [ rubRatModal, setRubrRatModal ]        = useState(false);        // Rating modal
   const [ title, setTitle ]                     = useState('');
   const [critDesc, setCritDesc]                 = useState('');
   const [critLongDesc, setCritLongDesc]         = useState('');
   const [ rtPnt, setRatPoint ]                  = useState('');
   const [ minPnt, setMinPoint ]                 = useState('');
   const [ maxPnt, setMaxPoint ]                 = useState('');
   const [ ratDesc, setRatDesc ]                 = useState('');
   const [ rtLngDesc, setRtLngDesc ]             = useState('');
   const [ crtIdx, setCritIndx ]                 = useState('');
   const [ rtgIdx, setRtgIndx ]                  = useState('');
   const [range,setRange]                        = useState(false);
   const [critEdit,setCriterionEdit]             = useState(false);
   const [ratingsEdit,setRatingsEdit]            = useState(false);
   const [critEditIndx,setCriterionEditIndx]     = useState('');
   const [isDisCard,setToDiscard]                = useState(false);
   const [isNavRub,setToNaviRub]                 = useState(false);
   const [, forceUpdate]                         = useState();
   const [totPnt,setOverAllTotal]                = useState(0);
   const [ shwBanr, setShwBanr]                   = useState(false);
   const [ isCrtEnt, setCrtErr]                  = useState(false);
   const [ isRtTtEn, setRtTtlEr]                  = useState(false);
   const [ isRtPnEnt, setRtPnErr]                  = useState(false);
   const [ isAlwDup, setAlwDup]                  = useState(false);
   const [isDupli , setDupli]                    = useState(false);
   const [ isRtPnMax, setRtPnMaxErr]             = useState(false);
   let oSrchVal                                  = queryString.parse(location.search);

   //For validation and mandatory fields check
   const validator = useRef(new SimpleReactValidator());

   useEffect(() => {
      if((oSrchVal && oSrchVal.id && !props.shwNwRbrcsMod) || props.rbrcId){
         if(props.rbrcId){
            shwRatBanTnfo = true;
            setShwBanr(true);
         }
         getRubrics();
      }else{
         // New rubrics
         aCriterion.push({...oDumCrt});
         setCriterion([...aCriterion]);
         setOverAllTotal(oDumCrt.maxPnt);
      }
   },// eslint-disable-next-line
   []);

   const loadCriterion = (isLoad, aRubrcsEdt) => {
      if(isLoad){
         setOverAllTotal(aRubrcsEdt[0].totPnt);
         setAlwDup(aRubrcsEdt[0].isAlDup);
         if(props.rbrcId && aRubrcsEdt[0].isAlDup){
            setTitle(props.title)
         }else{
            setTitle(aRubrcsEdt[0].title);
         }
         if(aRubrcsEdt && aRubrcsEdt.length && aRubrcsEdt[0].aCrtrn && aRubrcsEdt[0].aCrtrn.length){
            setCriterion([...aRubrcsEdt[0].aCrtrn]);
         }
      }
   }

   // Get rubrics in edit
   const getRubrics = () => {
      if((oSrchVal && oSrchVal.id) || props.rbrcId){
         let rubId = undefined;
         let crtDup = false;
         // From assignment edit rubrics
         if(props.rbrcId){
            shwRatBanErr = false;
            rubId = props.rbrcId;
            crtDup = true;
         }else{
            // From rubrics list edit
            rubId = oSrchVal.id;
         }
         const oReq = {
           _id : rubId,
           isFrEdt : true,
           crtDup : crtDup,
           asgnId : props.asgnId,
           oProj : { title : 1, aCrtrn : 1}
        };
         props.getRubrics(oReq, loadCriterion);
       }
   }

   // Add new criteria
   const addNewCriteria = () => {
      if(critDesc && critDesc.length>0){
         if(!critEdit){
            const oDumCrt = {
               crtNm : critDesc,
               crtDsc: critLongDesc,
               aRtngs : [
                  {
                     rtNm : 'Full Marks',
                     rtPnt   : 5,
                  },
                  {
                     rtNm : 'No Marks',
                     rtPnt   : 0,
                  }
               ],
               isRang:false,
               maxPnt : 5
            };
            setRange(false);
            aCriterion.push({...oDumCrt});
            setOverAllTotal(totPnt+5);
            setCriterion([...aCriterion]);
            setRubricsModal(false);
         } else if (isDupli) { // Set duplicate  
            let ODuplCnt = {
               crtNm: critDesc,
               crtDsc: critLongDesc,
               aRtngs: aCriterion[critEditIndx].aRtngs,
               isRang: aCriterion[critEditIndx].isRang,
               maxPnt: aCriterion[critEditIndx].maxPnt
            }
            ODuplCnt = JSON.parse(JSON.stringify(ODuplCnt));
            ODuplCnt.aRtngs.forEach(element => {
               delete element._id
            });
            aCriterion.push({ ...ODuplCnt });
            setCriterion([...aCriterion]);
            setOverAllTotal(totPnt + aCriterion[critEditIndx].maxPnt);
            setRange(false);
            setCritDesc('');
            setCritLongDesc('');
            setRubricsModal(false);
            setCriterionEdit(false);
            updatePoints();
         }else{
            setRange(false);
            aCriterion[critEditIndx].crtNm=critDesc;
            aCriterion[critEditIndx].crtDsc=critLongDesc;
            setCriterion([...aCriterion]);
            setCritDesc('');
            setCritLongDesc('');
            setRubricsModal(false);
            setCriterionEdit(false);
         }
      } else{
         setCrtErr(true);
      }
   }

   // Delete the criteria
   const deleteCriteria = (index) => {
      if(aCriterion && aCriterion.length > 1){
         aCriterion.splice(index,1);
         setCriterion([...aCriterion]);
      }
      updatePoints();
   }

   //Edit Updates
   const editUpdates= () =>{
      setRatingsEdit(false);
      setRubrRatModal(false);
      setRtgIndx('');
      setCritIndx('');
      setRtLngDesc('');
      setRatDesc('');
      setMaxPoint('');
      setMinPoint('');
      setRatPoint('');
   }

   // Add new rating in criteria
   const addNewRating = () => {
      // let aCrtCopy = JSON.parse(JSON.stringify([...aCriterion])); 
      let aCrtCopy = [...aCriterion];
      setRtPnErr(false);
      setRtPnMaxErr(false);
      if(ratingsEdit){
         // Check rating title is entered
         if(ratDesc && ratDesc.length > 0){
            aCrtCopy[crtIdx].aRtngs[rtgIdx].rtNm=ratDesc;
         }else{
            setRtTtlEr(true);
            return;
         }
         aCrtCopy[crtIdx].aRtngs[rtgIdx].rtDes=rtLngDesc;
        
         if(aCriterion[crtIdx].isRang && minPnt !== null && !isNaN(minPnt) && maxPnt !== null && !isNaN(maxPnt)){
            if(aCriterion[crtIdx].isRang && (minPnt === '' || isNaN(minPnt) ||  maxPnt === '' || isNaN(maxPnt))){
               setRtPnErr(true);
               return;
            }
            if(Number(maxPnt) <= Number(minPnt)){
               setRtPnMaxErr(true);
               return;
            }
            setRange(true);
            aCrtCopy[crtIdx].aRtngs[rtgIdx].min=minPnt;
            aCrtCopy[crtIdx].aRtngs[rtgIdx].max=maxPnt;
            aCrtCopy[crtIdx].aRtngs = _.sortBy(aCrtCopy[crtIdx].aRtngs, (oRtng) => {
               return parseFloat(oRtng.max);
            });
            aCrtCopy[crtIdx].aRtngs = aCrtCopy[crtIdx].aRtngs.reverse();
            setCriterion(aCrtCopy);
            editUpdates();
            updatePoints();
         }else if(rtPnt !== null && !isNaN(rtPnt)){
            if(isNaN(rtPnt) || rtPnt === ''){
               setRtPnErr(true);
               return;
            }
            setRange(false);
            aCrtCopy[crtIdx].aRtngs[rtgIdx].rtPnt=rtPnt;
            // aCrtCopy[crtIdx].aRtngs = _.orderBy(aCrtCopy[crtIdx].aRtngs,'rtPnt', 'desc');
            aCrtCopy[crtIdx].aRtngs = _.sortBy(aCrtCopy[crtIdx].aRtngs, (oRtng) => {
               return parseFloat(oRtng.rtPnt);
            });
            aCrtCopy[crtIdx].aRtngs = aCrtCopy[crtIdx].aRtngs.reverse();
            setCriterion(aCrtCopy);
            editUpdates();
            updatePoints();
         }
         // aCrtCopy[crtIdx].aRtngs = _.orderBy(aCrtCopy[crtIdx].aRtngs,'max', 'desc');
         
      }else{
         let oDumRating = {};
         oDumRating.rtDes = rtLngDesc;
         if(aCriterion[crtIdx].isRang && !isNaN(minPnt) && !isNaN(maxPnt)){
            // let isDupFound = false;
            // aCrtCopy[crtIdx].aRtngs.forEach(eachRow => {
            //    if (eachRow.max == maxPnt && eachRow.min == minPnt && isDupFound == false) {
            //       isDupFound = true;
            //    }
            // });
            // // aRatings.forEach(each)

            // if (isDupFound) {
            //    console.log("duplicate max, min found");
            //    return
            // }
            setRange(true);
            oDumRating.min=Number(minPnt);
            oDumRating.max=Number(maxPnt);
            if(aCriterion[crtIdx].isRang && (minPnt === '' || isNaN(minPnt) ||  maxPnt === '' || isNaN(maxPnt))){
               setRtPnErr(true);
               return;
            }
            if(Number(maxPnt) <= Number(minPnt)){
               setRtPnMaxErr(true);
               return;
            }
            if (ratDesc && ratDesc.length > 0) {
               oDumRating.rtNm = ratDesc;
            } else {
               setRtTtlEr(true);
               return;
            }
            let aRatings = [...aCrtCopy[crtIdx].aRtngs];
            aRatings.splice(rtgIdx+1, 0, oDumRating);
            // sort by max point
            // aRatings = _.orderBy(aRatings,'max', 'desc');
            aRatings = _.sortBy(aRatings, (oRtng) => {
               return parseFloat(oRtng.max);
            });
            aRatings = aRatings.reverse();
            aCrtCopy[crtIdx].aRtngs = [...aRatings];
            setCriterion(aCrtCopy);
            editUpdates();
            updatePoints();
         }else if(rtPnt !== null && !isNaN(rtPnt)){
            setRange(false);
            if(isNaN(rtPnt) || rtPnt === ''){
               setRtPnErr(true);
               return;
            }
            if (ratDesc && ratDesc.length > 0) {
               oDumRating.rtNm = ratDesc;
            } else {
               setRtTtlEr(true);
               return;
            }
            oDumRating.rtPnt=rtPnt;
            let aRatings = [...aCrtCopy[crtIdx].aRtngs];
            aRatings.splice(rtgIdx+1, 0, oDumRating);
              // sort by rtPnt points
            // aRatings = _.orderBy(aRatings,'rtPnt', 'desc');
            aRatings = _.sortBy(aRatings, (oRtng) => {
               return parseFloat(oRtng.rtPnt);
            });
            aRatings = aRatings.reverse();
            aCrtCopy[crtIdx].aRtngs = [...aRatings];
            setCriterion(aCrtCopy);
            editUpdates();
            updatePoints();
         }
      }
      
   }

   const updatePoints = () =>{
      let aCrtCopy = [...aCriterion];
      let totPnt = 0;     //Overall total points
      for(let crt=aCrtCopy.length - 1;crt>=0;crt--){
         let maxPnt=0;
         for(let rat=aCrtCopy[crt].aRtngs.length -1;rat>=0;rat--){
            if(aCrtCopy[crt].isRang && aCrtCopy[crt].aRtngs[rat].max>maxPnt){
               maxPnt=aCrtCopy[crt].aRtngs[rat].max;
            }else if(aCrtCopy[crt].aRtngs[rat].rtPnt>maxPnt){
               maxPnt=aCrtCopy[crt].aRtngs[rat].rtPnt;
            }
         }
         totPnt += parseFloat(maxPnt);
         aCrtCopy[crt].maxPnt = maxPnt;
      }
      setOverAllTotal(totPnt);
   }

   // Delete rating in criteria
   const deleteRating = (crtIndx, rtIndx) => {
      if(aCriterion && aCriterion.length && aCriterion[crtIndx] && aCriterion[crtIndx].aRtngs && aCriterion[crtIndx].aRtngs.length > 2){
         aCriterion[crtIndx].aRtngs.splice(rtIndx,1);
         setCriterion([...aCriterion]);
      }
      updatePoints();
   }

   // Navigation to rubrics list
   const backToRubList = (isNav, oAsgnRubrcs) => {
      if (isNav) {
         if(props.rbrcId || props.shwNwRbrcsMod){
            if(oAsgnRubrcs){
               props.rubricsVwCallback(oAsgnRubrcs);
            }
         }else{
            history.push({ pathname: "/home-page/rubrics-list", state: location.state });
         }
      }
   }

   // Save or update rubrics
   const saveorUpdateRubrics = () => {
      // To check the maximum point in assignment equals the total point in rubrics when it is created from assignment
      if(props.rbrcId){
         if(props.mxMrk !== null && !isNaN(props.mxMrk) && totPnt !== null && !isNaN(totPnt) && totPnt !== props.mxMrk){
            setShwBanr(false);
            setTimeout(() => {
               // shwRatBanTnfo = false;
               // shwRatBanErr = true;
               setShwBanr(true);
            },5);
            // return;
         }
      }
      // For validate all required fields
      const formValid = validator.current.allValid();
      if (formValid) {
         let oReq = {};
         // Update only from edit in rubrics list
         if((oSrchVal && oSrchVal.id && !props.shwNwRbrcsMod && !props.rbrcId) || (props.rbrcId && !isAlwDup)){
            oReq = {
               _id : props.rbrcId ? props.rbrcId : oSrchVal.id,
               title : title,
               aCrtrn : aCriterion,
               actn : 'U'
            };
         } 
         if(location && location.state){
            oReq.title  = title
            oReq.aCrtrn = aCriterion
            oReq.PrID   = location.state.PrID
            oReq.CrID   = location.state.CrID
            oReq.DeptID = location.state.DeptID
            oReq.SemID  = location.state.SemID
            oReq.AcYr   = location.state.AcYr
            oReq.SubID  = location.state.subId
         }
         props.createOrUpdateRubrics(oReq, backToRubList);
      }else {
         validator.current.showMessages();
         forceUpdate(1);
      }
   }

   // Discard changes for create and edit 
   const discardChanges = () => {
      // If you press back icon to navigate when you click discard
      if(isNavRub){
         setToNaviRub(false);
         if(props.rbrcId || props.shwNwRbrcsMod){
            props.rubricsVwCallback('Cancel');
         }else{
            goToRubricsList();
         }
      }
      setTitle('');
      setCriterion([oDumCrt]);
      // Set dummy total for edit
      setOverAllTotal(5);
      setToDiscard(false);
      // Navigation for rubrics view 
      if(location.pathname ==="/home-page/rubrics-edit" && oSrchVal && oSrchVal.id){
         history.push({pathname:"/home-page/rubrics-view",search:`?id=${oSrchVal.id}`, state: location.state});
      }else if(location.pathname ==="/home-page/rubrics-edit") { // Navigation for rubrics list
         goToRubricsList();
      }
   }

   // Go to rubrics list
   const goToRubricsList = () => {
      history.push({pathname:"/home-page/rubrics-list", state: location.state});
   }

   // Edit Rating
   const editRating = (oRating,crIndx,rtIndx) => {
      setCrtErr(false);
      setRtTtlEr(false);
      setRtPnErr(false);
      setRtPnMaxErr(false);
      if(aCriterion[crIndx].isRang){
         setRange(true);
         setMaxPoint(oRating.max);
         setMinPoint(oRating.min);
      }else{
         setRange(false);
         setRatPoint(oRating.rtPnt);
      }
      setRubrRatModal(true);
      setRatingsEdit(true);
      setRtLngDesc(oRating.rtDes);
      setRatDesc(oRating.rtNm);
      setRtgIndx(rtIndx);
      setCritIndx(crIndx);
      
   }
   //Enable Range
   const enableRange =(crIndx,range)=>{
      let aCrtCopy = [...aCriterion];
      if(!range){
         setRange(true);
         aCrtCopy[crIndx].aRtngs=[...oDumRng.aRtngs];
         aCrtCopy[crIndx].maxPnt=oDumRng.maxPnt;
         aCrtCopy[crIndx].isRang = true; 
         setCriterion(aCrtCopy);
         updatePoints();
      }else{
         setRange(false);
         aCrtCopy[crIndx].aRtngs=[...oDumCrt.aRtngs];
         aCrtCopy[crIndx].maxPnt=oDumCrt.maxPnt;
         aCrtCopy[crIndx].isRang = false;
         setCriterion(aCrtCopy); 
         updatePoints();
      }
      
   }

   //Add Ratings
   const addRatings = (isRang,crtIndx, rtIndx) => {
      setCrtErr(false);
      setRtTtlEr(false);
      setRtPnErr(false);
      setRtPnMaxErr(false);
      setRange(isRang);
      if(isRang){
         setMaxPoint('');
         setMinPoint('');
      }else{
         setRatPoint('');
      }
      setRtLngDesc('');
      setRatDesc('');
      setRubrRatModal(true);
      setRtgIndx(rtIndx);
      setCritIndx(crtIndx);
      setRatingsEdit(false);
   }

   // const add duplicate criteria

   const addDuplicateCrt = (dupCrtInd) => {
      let oDupCrt = {
         crtNm : aCriterion[dupCrtInd].crtNm,
         crtDsc: aCriterion[dupCrtInd].crtDsc,
      };
      setRange(false);
      setCriterionEdit(true);
      setCritDesc(oDupCrt.crtNm);
      setCritLongDesc(oDupCrt.crtDsc);
      setCriterionEditIndx(dupCrtInd);
      setRubricsModal(true);
      setDupli(true);
   }
   // Max point change
   const mxPntChng = (event) => {
      let value = event.target.value.replace('-', '');
      setMaxPoint(value);
   }
   // Min point change
   const minPntChng = (event) => {
      let value = event.target.value.replace('-', '');
      setMinPoint(value);
   }
   // Rate point change
   const ratPntChng = (event) => {
      let value = event.target.value.replace('-', '');
      setRatPoint(value)
   }

   return (
      <div className="rubrics-view_box">
         <div className="rubrics-module_header">
            {
               (props.shwNwRbrcsMod || props.shwEdtCompMod) &&
               <div className="rubrics-fullviewmodal_close">
                  <X className="svg-icon_default icon-default icon-pointer" onClick={()=> {
                     setToDiscard(true); 
                     setToNaviRub(true);
                  }}/> 
               </div>
            }
            <div className="row m-0">
               <div className="col-6 p-0">
               {/* style={{marginLeft : (!props.shwNwRbrcsMod && !props.shwEdtCompMod) && "0px !important"}} */}
                  <div className="rubrics-input_title">
                        {
                           !props.shwNwRbrcsMod && !props.shwEdtCompMod && 
                           <div className="page-title_icon">
                                 <ArrowLeft className="svg-icon_default icon-dark icon-pointer" onClick={()=> {
                                    setToDiscard(true); 
                                    setToNaviRub(true);
                                 }}/>
                           </div>
                        }
                     <div className="rubrics-input_details" style={{marginLeft : (props.shwNwRbrcsMod || props.shwEdtCompMod) && "0px"}}>
                        <label for="fname" className="form-cont_label">
                           {/* <span className="mandatory-field">* </span> */}
                           {props.t("translate:RUBRICS_TITLE")}
                        </label>
                        <InputBox className="input-block" value = {title} placeholder={props.t("translate:RUBRICS_TITLE")} onChange = {(event) => setTitle(event.target.value)}></InputBox>
                        {validator.current.message('title', title, 'required|string',{ className: 'text-empty_content' })}
                        {props.isDupli && <div className="rubric-exit_label"><span><AlertOctagon  className="svg-icon_extra-small"/></span> {props.t("translate:RUBRIC_DUPLICATE")}</div>}          
                     </div>
                  </div>
               </div>
               <div className="col-6 p-0">
                  <div className="rubrics-publish_btn">
                     <UIPerWrapper perCode={["rp_can_create_or_edit_lms_rubric"]}><div className="save-page_btn">
                        <Button theme="btn-rounded default" clicked = {() => saveorUpdateRubrics()}>{props.t("translate:SAVE")}</Button>
                     </div></UIPerWrapper>
                     {location.pathname === "/home-page/rubrics-edit" && 
                     <div className="option-mode_content">
                        <div
                           id="dropdownMenuButton"
                           data-toggle="dropdown"
                           aria-haspopup="true"
                           aria-expanded="false"
                           className="option-dropdown"
                        >
                           <i class="views-option">
                              <MoreVertical className="svg-icon_small icon-dark icon-pointer" />
                           </i>
                        </div>
                        <div class="dropdown-menu edit-rubrics_cont">
                           <div class="dropdown-item user-info_contents" onClick={()=>setToDiscard(true)}>
                              <X className="svg-icon_light  icon-default" />
                              <span className="option-list_dropdown">{props.t("translate:DISCARD")}</span>
                           </div>
                        </div>
                     </div>}
                     {/* 
               <i class="views-option">
                  <MoreInfo iconStyle="svg-icon_small icon-default icon-pointer" />
               </i>
               */}
                  </div>
               </div>
            </div>
         </div>
         <div className="rubrics-edit_content" style={{ padding : (props.shwNwRbrcsMod || props.shwEdtCompMod) && " 0px 24px 24px "}}>
            {
               shwBanr && shwRatBanTnfo &&
               <div className="rubrics-alert_box">
                  <div className="rubrics-alert_cont">
                     <div className="rubrics-alert_info">
                     <AlertCircle className="svg-icon_small icon-primary"/>   <p className="rubrics-alert_label">{props.t("translate:ASSGN_RATING_ERROR")} {props.mxMrk} {props.t("translate:STUD_ASMNT_POINTS")}</p>
                     </div>
                        <X className="svg-icon_extra-small icon-default icon-pointer" onClick={() => setShwBanr(false)}/>
                  </div>
               </div>
            }
            {
               shwBanr && shwRatBanErr &&
               <div className="rubrics-alert_box">
                  <div className="rubrics-warn_cont">
                     <div className="rubrics-alert_info">
                     <AlertOctagon className="svg-icon_small icon-error"/>   <p className="rubrics-alert_label">{props.t("translate:ASSGN_RATING_ERROR")} {props.mxMrk} {props.t("translate:STUD_ASMNT_POINTS")}</p>
                     </div>
                        <X className="svg-icon_extra-small icon-default icon-pointer" onClick={() => setShwBanr(false)}/>
                  </div>
               </div>
            }
            <div className="box-edit_rubrics">
               <table class="table rubrics-full-table">
                  <thead class="thead-light_box">
                     <tr>
                        <th className="rubrics-thead">{props.t("translate:CRITERIA")}</th>
                        <th className="rubrics-thead">{props.t("translate:RATINGS")}</th>
                        <th className="rubrics-thead">{props.t("translate:POINTS")}</th>
                     </tr>
                  </thead>
                  {aCriterion && aCriterion.length > 0 && 
                     <tbody>
                        {(
                           aCriterion.map((oCriteria, crtIndx) => {
                              return (
                                 <tr>
                                    <td className="range-select_option">
                                       <div className="range-option_view">
                                          <p className="range-option_label" onClick={()=>{
                                                enableRange(crtIndx,oCriteria.isRang);
                                          }}>
                                          {props.t("translate:RANGE")}
                                             <span>
                                                <CheckBox className="check-box_small" value={oCriteria.isRang} checked={oCriteria.isRang}/>
                                             </span>
                                          </p>
                                          <div className="range-option_icon">
                                             <Trash className="svg-icon_light icon-secondary icon-pointer icon-space_left" onClick={() => deleteCriteria(crtIndx)} />
                                             <Edit2 className="svg-icon_light icon-secondary icon-pointer" onClick={() => {
                                                setCriterionEdit(true);
                                                setCritDesc(oCriteria.crtNm);
                                                setCritLongDesc(oCriteria.crtDsc);
                                                setCriterionEditIndx(crtIndx);
                                                setRubricsModal(true);
                                                setDupli(false);
                                             }} />
                                          </div>
                                       </div>
                                       <p className="criteria-head_label">{oCriteria.crtNm}</p>
                                       <p className="criteria-cont_label">
                                          {oCriteria.crtDsc}
                                       </p>
                                    </td>

                                    <td className="rating-point_table">

                                       <table class="table rubrics-inner-table">
                                          <tbody>
                                             <tr>
                                                {(
                                                   oCriteria.aRtngs.map((oRating, rtIndx) => {
                                                      return (
                                                         <td className="range-add_points">
                                                            <div className="range-option_view">
                                                               {!isNaN(oRating.rtPnt) && <p className="point-view_value">{oRating.rtPnt} {props.t("translate:PTS")}</p>}
                                                               {!isNaN(oRating.min) && !isNaN(oRating.max) && <p className="point-view_value">{oRating.max} {props.t("translate:TO_GREATER")} {oRating.min} {props.t("translate:PTS")}</p>}
                                                               <div className="edit_delete_align">
                                                                  <Edit2 className="svg-icon_light icon-secondary icon-pointer" onClick={() => editRating(oRating, crtIndx, rtIndx)}/>
                                                                  
                                                                  <div className="delete_trash_icon">
                                                                  <Trash className="svg-icon_light icon-secondary icon-pointer icon-space_right" onClick={() => deleteRating(crtIndx, rtIndx)} />
                                                                  </div>
                                                                  
                                                               </div>


                                                            </div>
                                                            <p className="point-view_head">{oRating.rtNm}</p>
                                                            <p className="point-view_cont">
                                                               {oRating.rtDes}
                                                            </p>
                                                               <div className="add-point_table" onClick={() => addRatings(oCriteria.isRang,crtIndx, rtIndx)}>
                                                                  <svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                     <path d="M6 2.5V9.5" stroke="#0D9BE1" stroke-linecap="round" stroke-linejoin="round" />
                                                                     <path d="M2.5 6H9.5" stroke="#0D9BE1" stroke-linecap="round" stroke-linejoin="round" />
                                                                  </svg>
                                                               </div>
                                                         </td>
                                                      )
                                                   })
                                                )}
                                             </tr>
                                          </tbody>
                                       </table>

                                    </td>


                                    <td>
                                       <div className="input-point_value">
                                          {/* onChange={(e) => setCriteriaVal(e, crtIndx, 'MP')} */}
                                       {/* <InputBox className="input-table" value={oCriteria.maxPnt}></InputBox>   */}
                                       </div>
                                       <p className="value-point_total">{oCriteria.maxPnt} {props.t("translate:PTS")}</p>
                                    </td>
                                 </tr>
                              )
                           })
                        )}
                        <tr>
                           <td colspan="100%">
                              <div className="table-footer_point">
                                 {/* <p className="total-point_create" onClick={() => addNewCriteria()}> */}
                                 
                                 {/* <p className="total-point_create" onClick={() => setRubricsModal(true)}>

                                    <Plus className="svg-icon_small icon-primary icon-space_left" />
                                    Criterion
                                 </p> */}

                              {/* <p className="total-point_create" onClick={() => {
                                    setRubricsModal(true);
                                    setCriterionEdit(false);
                                    setCritDesc('');
                                    setCritLongDesc('');
                                 }}>
                                 <Plus className="svg-icon_small icon-primary icon-space_left" />
                                 {props.t("translate:CRITERION")}
                              </p>  */}
                              <div class="dropdown">
                                 <p className="total-point_create" data-toggle="dropdown" data-boundary="window" >
                                    <Plus className="svg-icon_small icon-primary icon-space_left" />
                                    {props.t("translate:CRITERION")}
                                 </p>
                                 <ul class="dropdown-menu criterion-dropdown">
                                    <div onClick={() => {
                                          setRubricsModal(true);
                                          setCriterionEdit(false);
                                          setCritDesc('');
                                          setCritLongDesc('');
                                       }}>
                                       <Button theme="btn-rounded secondary-btn btn-block">{props.t("translate:NEW_CRITERION")}</Button>
                                    </div>
                                    <p className="duplicate-header_label">{props.t("translate:DUPLICATE")}</p>
                                    <div className="duplicate-labels">
                                       {(
                                          aCriterion.map((oCrt, crtIndx) => {
                                             return (
                                                <p onClick={ () => addDuplicateCrt(crtIndx)}>{oCrt.crtNm}</p>
                                             )
                                          })
                                       )}
                                    </div>
                                 </ul>
                              </div>
                                 <p className="total-point-edit_view">{props.t("translate:TOTAL_POINTS")}: {parseFloat(totPnt.toFixed(2))}</p>
                              </div>
                           </td>
                        </tr>
                     </tbody>
                  }
               </table>
            </div>
         </div>
         {isDisCard && <LmsModal open={isDisCard} onClose={()=>setToDiscard(false)}   modalTitle={props.t("translate:DISCARD")+'?'} btnName='discard'  discardBtn={true} onClick={()=>discardChanges()} />}
         {/* Criteria Modal */}
         {rubricsModal && <LmsModal open={rubricsModal} modalTitle="Criterion" rubricsModal={true} onClose={() => setRubricsModal(!rubricsModal)} critEdit = {critEdit} value1={critDesc} value2={critLongDesc} descOnChange={(event) =>setCritDesc(event.target.value)} longDescOnChange={(event) =>setCritLongDesc(event.target.value)} onClick={()=> addNewCriteria()}/>}
         {/* Rating modal */}
         {rubRatModal && <LmsModal open={rubRatModal} modalTitle="Responses to Fellow Students" rubRatModal={true} range={range} ratingsEdit = {ratingsEdit} onClose={() => setRubrRatModal(!rubRatModal)} value1={rtPnt} value2={minPnt} value3={maxPnt} value4={ratDesc} value5={rtLngDesc} ratPntChange={(event) =>ratPntChng(event)} mnPntChng={(event) =>minPntChng(event)} mxPntChng={(event) =>mxPntChng(event)} rtDescChng={(event) =>setRatDesc(event.target.value)} rtLngDescChng={(event) =>setRtLngDesc(event.target.value)} isRtPnEnt = {isRtPnEnt} isRtTtEn = {isRtTtEn} isCrtEnt = {isCrtEnt}  onClick={()=> addNewRating()} isRtPnMax = {isRtPnMax}/>}
      </div>
   );
};
const mapStateToProps = (state) => ({
   ...state.contentReducer,
   ...state.RubricsReducer
});
const mapDispatchToProps = {
   createOrUpdateRubrics,
   getRubrics
};

const TabNavigator = (props) => <RubricsEditComponent {...props} />;
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);
export default withTranslation()(Components);
