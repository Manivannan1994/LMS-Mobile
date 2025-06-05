import React, { lazy, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import {
  MoreVertical,
  Trash2,
  Edit,
  X,
} from "react-feather";
import "../../styles/_commonLmsStyle.scss";
import "../../styles/_rubricsViewStyle.scss";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { getRubrics,createOrUpdateRubrics, updateRubrcFields } from "../../store/actions/RubricsActions";
import { updatemultpleStudAsgnmnt } from "../../store/actions/GradeBookActions";
import queryString from "query-string";
import NumberBox from "../numberBox/NumberBox";
const Button = lazy(() => import("../button/Button"));
const LmsModal = lazy(() =>
   import("../modal/LmsModal")
);
const UIPerWrapper = lazy(() =>
import('../ui-per-wrapper/UIPerWrapper')
);

let aGradRubrics = [];    // Store the graded criteria and rating
const RubricsViewComponent = (props) => {
  const history = useHistory();
  const location = useLocation();
  const [ shwMod, setShwMod] = useState(false);     // Show modal
  let rubrcId = undefined;
  // From rubrics grade view assignment or From rubrics grade view
  if(props && props.id){
    rubrcId = props.id;
  }else if(queryString.parse(location.search).id){
    //From rubrics edit
    rubrcId = queryString.parse(location.search).id;
  }
  const [selPnt, setSelPnt]   = useState('');
  const [ shwRatSel, setShwRat] = useState(false);

  useEffect(() => {
    getRubrics();
  },// eslint-disable-next-line  
    []);

  // Rubrics callback
  const rubricsCallback = (isNav, aRubData) => {
    if(props.aSelRatings && props.aSelRatings.length && aRubData && aRubData.length){
      aGradRubrics = props.aSelRatings;
      let selPnt = 0;
      for(let rt = props.aSelRatings.length - 1; rt >=0; rt--){
        outerLoop:
        for(let rb = aRubData[0].aCrtrn.length - 1; rb >= 0; rb--){
          if(aRubData[0].aCrtrn[rb]._id === props.aSelRatings[rt].crtId){
            if(aRubData[0].aCrtrn[rb].aRtngs && aRubData[0].aCrtrn[rb].aRtngs.length){
              for(let rbrt = aRubData[0].aCrtrn[rb].aRtngs.length - 1; rbrt >= 0; rbrt--){
                aRubData[0].aCrtrn[rb].aRtngs[rbrt].isRtSel = false;
                if(aRubData[0].aCrtrn[rb].aRtngs[rbrt]._id === props.aSelRatings[rt].rtRbId){
                  aRubData[0].aCrtrn[rb].aRtngs[rbrt].isRtSel = true;
                  // if(!isNaN(aRubData[0].aCrtrn[rb].aRtngs[rbrt].max)){
                  //   // selPnt += aRubData[0].aCrtrn[rb].aRtngs[rbrt].max;
                  // }
                  if(!isNaN(aRubData[0].aCrtrn[rb].aRtngs[rbrt].rtPnt)){
                    selPnt += aRubData[0].aCrtrn[rb].aRtngs[rbrt].rtPnt;
                  }
                  if (aRubData[0].aCrtrn[rb].aRtngs[rbrt].isRtSel === true) {  // Set selcted value
                    if (aRubData[0].aCrtrn[rb].isRang === false && aRubData[0].aCrtrn[rb].aRtngs[rbrt].rtPnt !== undefined) {
                      aRubData[0].aCrtrn[rb].slRnt = aRubData[0].aCrtrn[rb].aRtngs[rbrt].rtPnt; 
                    } else if (aRubData[0].aCrtrn[rb].isRang === true && aRubData[0].aCrtrn[rb].aRtngs[rbrt].max !== undefined) {
                      // aRubData[0].aCrtrn[rb].slMax = aRubData[0].aCrtrn[rb].aRtngs[rbrt].max;
                      aRubData[0].aCrtrn[rb].rtGvn =  props.aSelRatings[rt].rtGvn
                      selPnt += props.aSelRatings[rt].rtGvn;
                    }
                  }
                  break outerLoop;
                }
              }
            }
          }
        }
      }
      setSelPnt(selPnt);
      props.updateRubrcFields('aRubrics',aRubData);
    }
  }

  // Get the rubrics
  const getRubrics = () => {
    if (rubrcId) {
      aGradRubrics = [];
      const oReq = {
        _id: rubrcId,
        isFrVw :true,
        isFrEdtChk : true,
        oProj: { title: 1, aCrtrn: 1 },
      };
      props.updateRubrcFields('aRubrics',[]);
      props.getRubrics(oReq, rubricsCallback);
    }
  };

  // Show delete rubric pop up showPopUp
  const delRubModal = (showPopUp) => {
    if(showPopUp){
      setShwMod(true);
    }else{
      setShwMod(false);
    }
  }

  // Delete the rubrics
  const deleteRubric = () => {
    const oReq = {
      _id : rubrcId,
      actn : 'D'    // Delete action
    };
    props.createOrUpdateRubrics(oReq, loadRubrics);
  }

  // Load the rubrics
  const loadRubrics = (isLoad) => {
    if(isLoad){
      delRubModal(false);
      backToRubList();
    }
  }

  // Navigation to rubrics list
  const backToRubList = () => {
    history.push({ pathname: "/home-page/rubrics-list", state: location.state });
  }

  
  const editRubrics = () => {
    if(props.aRubrics && props.aRubrics.length && ((props.aRubrics[0].asgnCnt && props.aRubrics[0].asgnCnt > 1) || (props.aRubrics[0].grdCnt && props.aRubrics[0].grdCnt > 0))){
      // Show the error message if the rubrics is assigned to more than one assignment
    }else{
      history.push({ pathname: "/home-page/rubrics-edit", search:`?id=${rubrcId}`, state: location.state });
    }
  }

  const backToGradeBook = (isNav) => {
    if(isNav){
      const oSndData = {
        aRtng : aGradRubrics,
        mark : props.aRubrics[0].totPnt
      }
      props.rubricsVwCallback(oSndData);
    }
  }

  // check grade for type assignment

  const chkGradeAssgn = () => {
    let oRes = {};
    if (props.asgnmntDtls && props.asgnmntDtls.asgmnt && props.asgnmntDtls.asgmnt.grdCnf && props.asgnmntDtls.asgmnt.grdCnf === "GRD") {
      oRes.grdCnf = props.asgnmntDtls.asgmnt.grdCnf;
      if (!isNaN(selPnt)) {
        if (props.asgnmntDtls.aGrades && props.asgnmntDtls.aGrades.length) {
          let mrkTk = (parseFloat(selPnt)*parseFloat(props.asgnmntDtls.aGradeSystem[0].GrdPercent))/parseFloat(props.asgnmntDtls.asgmnt.mxMrk);
          let mrkVal = parseFloat(mrkTk);
          for (let grd = props.asgnmntDtls.aGrades.length - 1; grd >= 0; grd--) {
            if (mrkVal >= props.asgnmntDtls.aGrades[grd].MinMrk && mrkVal <= props.asgnmntDtls.aGrades[grd].MaxMrk) {
              oRes.grad = props.asgnmntDtls.aGrades[grd].Grade;
            }
          }
        }
      } 
    }
    return oRes;
  }

  // Submit rating for student assignment
  const saveRatingAndMark = () => {
    // check Grade

    let oMarks = chkGradeAssgn();

    const osavRat = {
      aRtng : aGradRubrics,
      asgnmntId : props.asCnId,
      studId : props.studId,
      isFrmRb : true
    };
    if(oMarks && oMarks.grdCnf && oMarks.grdCnf === 'GRD'){
      if(oMarks.grad){
        osavRat.grad = oMarks.grad;
      }
    }else{
      osavRat.mark = selPnt;
    }
    props.updatemultpleStudAsgnmnt(osavRat, '', '', '', backToGradeBook);
  }

  // Set the already mapped rating in UI
  
  const gradeRating = (crIndx, rtIndx) => {
    if(props.isFrmGrd && props.aRubrics && props.aRubrics.length && props.aRubrics[0].aCrtrn && props.aRubrics[0].aCrtrn.length) {  // Select grading
      let aRubCopy = [...props.aRubrics];
      let oRatRub = {
        crtId : aRubCopy[0].aCrtrn[crIndx]._id,
        rtRbId : aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx]._id
      };
      if(aRubCopy[0].aCrtrn[crIndx].isRang){
        oRatRub.rtGvn = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].max
      }
      let ratMatch = false;
      let isExists;
      // To unselect other rating
      aRubCopy[0].aCrtrn[crIndx].aRtngs.forEach(item => item.isRtSel = false);
      // To select rating
      if(aGradRubrics && aGradRubrics.length){
        for(let rt = aGradRubrics.length - 1; rt >=0; rt--){
          if(aGradRubrics[rt].crtId === aRubCopy[0].aCrtrn[crIndx]._id){
            ratMatch = true;
            isExists = true;
            aGradRubrics[rt].rtRbId = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx]._id;
            aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel = true;                 // Rating selecte 
            aGradRubrics[rt]['rtRbId'] = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx]._id;
            if(aRubCopy[0].aCrtrn[crIndx].isRang && aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel && !isNaN(aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].max)){
              aGradRubrics[rt].rtGvn = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].max;
            }else if(!aRubCopy[0].aCrtrn[crIndx].isRang && aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel && !isNaN(aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].rtPnt)){
              aGradRubrics[rt].rtGvn = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].rtPnt;
            }
            if(!aRubCopy[0].aCrtrn[crIndx].isRang && !isNaN(aRubCopy[0].aCrtrn[crIndx].slRnt)){
              aRubCopy[0].aCrtrn[crIndx].rtGvn = aRubCopy[0].aCrtrn[crIndx].slRnt;
            }else if(aRubCopy[0].aCrtrn[crIndx].isRang && aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel && !isNaN(aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].max)){
              aRubCopy[0].aCrtrn[crIndx].rtGvn = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].max;
            }
            break;
          }
        }
      }else{
        aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel = true;                 // Rating selecte 
      }
      if(!ratMatch){
        aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel = true;                // Rating selected
        if(!oRatRub.rtGvn && !aRubCopy[0].aCrtrn[crIndx].isRang && aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].isRtSel && !isNaN(aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].rtPnt)){
          oRatRub.rtGvn = aRubCopy[0].aCrtrn[crIndx].aRtngs[rtIndx].rtPnt;
        } 
        aGradRubrics.push(oRatRub);
      } else if(aRubCopy[0].aCrtrn[crIndx].isRang){
    
        if (!isExists) {
          aGradRubrics.push(oRatRub);
        }
      }
      // Calculate selected rating point
      if(aRubCopy[0].aCrtrn && aRubCopy[0].aCrtrn.length){
        let selPnt = 0;
        for(let rb = aRubCopy[0].aCrtrn.length - 1; rb >=0; rb--){
          if(aRubCopy[0].aCrtrn[rb] && !isNaN(aRubCopy[0].aCrtrn[rb].rtGvn)){
            if(aRubCopy[0].aCrtrn[rb].isRang){
              selPnt +=Number(aRubCopy[0].aCrtrn[rb].rtGvn);
            }
          }
          if(aRubCopy[0].aCrtrn[rb].aRtngs && aRubCopy[0].aCrtrn[rb].aRtngs.length){
            for(let rt = aRubCopy[0].aCrtrn[rb].aRtngs.length - 1; rt >=0; rt--){
              if(aRubCopy[0].aCrtrn[rb].aRtngs[rt].isRtSel){
                  if(!aRubCopy[0].aCrtrn[rb].rtGvn && aRubCopy[0].aCrtrn[rb].isRang && !isNaN(aRubCopy[0].aCrtrn[rb].aRtngs[rt].max)){
                    selPnt += aRubCopy[0].aCrtrn[rb].aRtngs[rt].max;
                  }
                  if(!aRubCopy[0].aCrtrn[rb].isRang && !isNaN(aRubCopy[0].aCrtrn[rb].aRtngs[rt].rtPnt)){
                    selPnt += aRubCopy[0].aCrtrn[rb].aRtngs[rt].rtPnt;
                  }
                if (aRubCopy[0].aCrtrn[rb].aRtngs[rt]._id) {
                  if (crIndx === rb && rtIndx === rt) { // selected index
                    if (aRubCopy[0].aCrtrn[crIndx].isRang === false && aRubCopy[0].aCrtrn[rb].aRtngs[rt].rtPnt !== undefined) {
                      aRubCopy[0].aCrtrn[crIndx].slRnt = aRubCopy[0].aCrtrn[rb].aRtngs[rt].rtPnt;
                    } else if (aRubCopy[0].aCrtrn[crIndx].isRang === true && aRubCopy[0].aCrtrn[rb].aRtngs[rt].max !== undefined) {
                      aRubCopy[0].aCrtrn[crIndx].rtGvn = aRubCopy[0].aCrtrn[rb].aRtngs[rt].max;
                      aRubCopy[0].aCrtrn[crIndx].slMax = aRubCopy[0].aCrtrn[rb].aRtngs[rt].max;
                    }
                  }
                }
              }
            }
          }
        }
        if(!props.shwRat && !isNaN(selPnt)){
          setShwRat(true);
        }
        setSelPnt(selPnt);
      }
      props.updateRubrcFields('aRubrics',aRubCopy);
    }
  }
  // Range input handler 
  const rangeHandler = (event, index) => {
    let aRubCopy = [...props.aRubrics];
    aRubCopy[0].aCrtrn[index].rtGvn = event.target.value;
    let userInput = !!event.target.value ? Number(event.target.value):'';
    let markedIndex = null;
    for (let i = 0; i < aRubCopy[0].aCrtrn[index].aRtngs.length; i++) {
      let element = aRubCopy[0].aCrtrn[index].aRtngs[i];
      if (element.min !== undefined && element.max !== undefined) {
        if (userInput === '') {
          markedIndex = i;
          element.isRtSel = false;
        } else {
          if (userInput === 0 && element.min === 0 && element.max === 0) {
            markedIndex = i;
            break;
          } else {
            let condition = element.min < userInput && userInput <= element.max;
            element.isRtSel = condition 
            if (condition) {
              markedIndex = i;
              break;
            }
          }
        }
      } else {
        element.isRtSel = false;
      }
    }
    if (markedIndex != null) {
      aRubCopy[0].aCrtrn[index].aRtngs.forEach((each, i) => { // For no duplicate select
        if(aRubCopy[0].aCrtrn[index].rtGvn){
          each.isRtSel = !isNaN(markedIndex) && markedIndex === i;
        }
      })

      let oRatRub = {
        crtId: aRubCopy[0].aCrtrn[index]._id,
        rtRbId: aRubCopy[0].aCrtrn[index].aRtngs[markedIndex]._id,
        rtGvn: userInput
      };

      let selPntVal = 0;
        if(aGradRubrics && aGradRubrics.length > 0){
          for (let rt = aGradRubrics.length - 1; rt >= 0; rt--) {
            if(oRatRub.crtId && aGradRubrics[rt].crtId === oRatRub.crtId){
              aGradRubrics[rt].rtGvn = oRatRub.rtGvn;
              break;
            }else if(rt === 0){
              aGradRubrics.push(oRatRub);
            }
          }
        }else{
          aGradRubrics.push(oRatRub);
        }
        for (let rt = aGradRubrics.length - 1; rt >= 0; rt--) {
          if(aGradRubrics[rt]['rtGvn'] && !isNaN(aGradRubrics[rt]['rtGvn'])){
            selPntVal +=aGradRubrics[rt]['rtGvn'];
          }
        }
      setSelPnt(selPntVal);
      if(!props.shwRat && !isNaN(selPnt)){
        setShwRat(true);
      }
      props.updateRubrcFields('aRubrics', aRubCopy);
    } else {
      aRubCopy[0].aCrtrn[index].rtGvn = userInput;
      props.updateRubrcFields('aRubrics', aRubCopy);
    }
  } 
  return (
    <div className="rubrics-view_box">
      {
        (!props.isFrmGrd && !props.isFrAsgn) && 
        <div className="rubrics-options">
          <div className="hide-content_view" onClick={() => history.go(-1)}>
            <X className="svg-icon_small icon-dark icon-pointer" />
          </div>
           {!props?.location.state?.isDisabledContent &&
          <div className="view-options">
            <UIPerWrapper perCode={["rp_can_create_or_edit_lms_rubric"]}>
              {
                props.aRubrics && props.aRubrics.length > 0 && 
                <div className={((props.aRubrics[0].asgnCnt && props.aRubrics[0].asgnCnt > 1) || (props.aRubrics[0].grdCnt && props.aRubrics[0].grdCnt > 0)) && "tooltip-edit_rubric"} style={{ display : ((props.aRubrics[0].asgnCnt && props.aRubrics[0].asgnCnt > 1) || (props.aRubrics[0].grdCnt && props.aRubrics[0].grdCnt > 0)) && "block"}} data-tooltip= {props.t("translate:RUBRIC_HOVER_INFO")}>
                  <Edit className="svg-icon_small icon-dark icon-pointer" onClick={() => editRubrics()} />
                </div>
              }
              </UIPerWrapper>

            <UIPerWrapper perCode={["rp_can_delete_lms_rubrics"]}><div className="more-options">
              <div
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                className="option-dropdown"
              >
                <MoreVertical className="svg-icon_small icon-dark icon-pointer left-icon" />
              </div>
              <div class="dropdown-menu edit-chapter_cont">
                {/* <div class="dropdown-item user-info_contents">
                  <X className="svg-icon_light  icon-default" />
                  <span className="option-list_dropdown">
                    {props.t("translate:DISCARD")}
                  </span>
                </div> */}

                <div class="dropdown-item user-info_contents" onClick={() => delRubModal(true)}>
                  <Trash2 className="svg-icon_light  icon-error" />
                  <span className="option-list_dropdown delete-option_btn">
                    {props.t("translate:DELETE")}
                  </span>
                </div>
              </div>
            </div></UIPerWrapper>
          </div>
           }
        </div>
      }
      {props.aRubrics && props.aRubrics.length > 0 && (
        <div className="rubrics-view_content" style={{ padding : props.isFrmGrd && " 0px 24px 24px "}}>
          <div className = {(!props.isFrmGrd && !props.isFrAsgn) ? "rubrics-content_box" : ""}>
            {
              (!props.isFrmGrd && !props.isFrAsgn) && 
              <div className="content-view_rubrics">
                <p className="view-rubrics_heading">{props.aRubrics[0].title}</p>
                <p className="view-rubrics_cont">
                  {props.aRubrics[0].crtCnt} {props.t("translate:CRITERIA")} | {props.aRubrics[0].totPnt}{" "}
                  {props.t("translate:POINTS_POSSIBLE")}
                </p>
              </div>
            }
            {props.aRubrics[0] &&
              props.aRubrics[0].aCrtrn &&
              props.aRubrics[0].aCrtrn.length > 0 && (
                <div className="box-view_rubrics">
                  <table class="table rubrics-full-table_view">
                    <thead class="thead-light_box">
                      <tr>
                        <th className="rubrics-thead">
                          {props.t("translate:CRITERIA")}
                        </th>
                        <th className="rubrics-thead">
                          {props.t("translate:RATINGS")}
                        </th>
                        <th className="rubrics-thead">
                          {props.t("translate:POINTS")}
                        </th>
                      </tr>
                    </thead>
                    {props.aRubrics[0].aCrtrn.map((oCrtrn, crIndx) => {
                      return (
                        <tbody className="rubrics-box_cont_view">
                          <tr>
                            <td>
                              <p className="criteria-head_label">
                               {oCrtrn.crtNm}
                              </p>
                              <p className="criteria-cont_label">
                                {oCrtrn.crtDsc}
                              </p>
                            </td>
                            <td className="rating-point_table_view">
                              <table class="table rubrics-inner-table_view">
                                <tbody>
                                  <tr>
                                  {oCrtrn.aRtngs.length>0 && oCrtrn.aRtngs.map((oRtg, rtIndx) => {
                                  return (
                                    <td onClick={() => gradeRating(crIndx, rtIndx)} className={oRtg.isRtSel ? 'select-model_rubrics' : ''} style={{ cursor : props.isFrmGrd && "pointer"}}>
                                      {!isNaN(oRtg.rtPnt) && <p className="point-view_value" style={{ color : oRtg.isRtSel && "white"}}>{oRtg.rtPnt} {props.t("translate:PTS")}</p>}
                                      {!isNaN(oRtg.min) && !isNaN(oRtg.max) && <p className="point-view_value" style={{ color : oRtg.isRtSel && "white"}}>{oRtg.max} {props.t("translate:TO_GREATER")} {oRtg.min} {props.t("translate:PTS")}</p>}
                                      <p className="point-view_head" style={{ color : oRtg.isRtSel && "white"}}>
                                      {oRtg.rtNm}
                                      </p>
                                      <p className="point-view_cont" style={{ color : oRtg.isRtSel && "white"}}>
                                        {oRtg.rtDes}
                                      </p>
                                    </td>
                                    );
                                  })}
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td>
                            {props.isFrmGrd === undefined &&<p className="value-point_total">{oCrtrn.maxPnt} {props.t("translate:PTS")}</p>}
                             {/* {oCrtrn.isRang === true && oCrtrn.slMax && <p className="value-point_total">{oCrtrn.slMax} {props.t("translate:PTS")}</p> }  */}
                             {/* {oCrtrn.isRang === true && location.pathname === "/home-page/assgnmnt-grad-view"&&<div className="value-point_input">
                               <NumberBox className="input-table" value={oCrtrn.slMax} onChange={(event)=>rangeHandler(event,crIndx)}/>
                               <p className="value-point_view">{oCrtrn.maxPnt} {props.t("translate:PTS")}</p>
                             </div> }  */}
                             {oCrtrn.isRang === true && location.pathname === "/home-page/assgnmnt-grad-view" &&<div className="value-point_input">
                               <NumberBox className="input-table" value={oCrtrn.rtGvn} onChange={(event)=>rangeHandler(event,crIndx)}/>
                               <p className="value-point_view">{oCrtrn.maxPnt} {props.t("translate:PTS")}</p>
                             </div> } 
                             {oCrtrn.isRang === false && location.pathname === "/home-page/assgnmnt-grad-view" && <p className="value-point_total">{oCrtrn.slRnt} /{oCrtrn.maxPnt}{props.t("translate:PTS")}</p> } 
                            </td>
                          </tr>
                          {/* <tr>
                            <td colspan="100%">
                              <p className="total-point_view">
                                {props.t("translate:TOTAL_POINTS")}: 150
                              </p>
                            </td>
                          </tr> */}
                        </tbody>
                      );
                    })}
                  </table>
                </div>
            )}
              <p className="total-point_view">
                {props.t("translate:TOTAL_POINTS")} : {(props.shwRat || shwRatSel) && !isNaN(selPnt) && <span>{selPnt}/ </span>}{props.aRubrics[0].totPnt} 
              </p>
            <div>
            
            </div>
          </div>
          {
            props.isFrmGrd && 
              <div className="rubrics-modal_btn">
                <Button theme="btn-rounded secondary-btn btn-right" clicked = {() => backToGradeBook(true)}>Cancel</Button>
                <Button theme="btn-rounded default" clicked = {() => saveRatingAndMark()}>{props.t("translate:SUBMIT")}</Button>
            </div>
          }
        </div>
      )}
      {shwMod && <LmsModal open={shwMod} onClose={() => delRubModal(false)}  value={props.aRubrics[0] && props.aRubrics[0].title} rubDel = {true} modalTitle={props.t("translate:DELETE_RUBRIC")} btnName='item' confirmModal={true} onClick={() => deleteRubric()}/>}
    </div>
  );
};
const mapStateToProps = (state) => ({
  ...state.contentReducer,
  ...state.RubricsReducer,
});
const mapDispatchToProps = {
  getRubrics,
  createOrUpdateRubrics,
  updateRubrcFields,
  updatemultpleStudAsgnmnt
};

const TabNavigator = (props) => <RubricsViewComponent {...props} />;
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);
export default withTranslation()(Components);
