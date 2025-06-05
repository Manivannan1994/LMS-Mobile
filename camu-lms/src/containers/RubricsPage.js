import React, { lazy, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { MoreVertical, Plus, Trash2, Edit } from "react-feather";
import "../styles/_commonLmsStyle.scss";
import "../styles/_rubricsListStyle.scss";
import { useHistory, useLocation } from "react-router-dom";
import { getRubrics, createOrUpdateRubrics } from "../store/actions/RubricsActions";
import { connect } from "react-redux";
import { filterArray } from '../../src/utils/filter-util';
import { getSessionDtls } from '../store/actions/HeaderAction';

const Button = lazy(() => import("../../src/components/button/Button"));
const Searchbox = lazy(() => import("../../src/components/searchbox/Searchbox"));
const LmsModal = lazy(() =>
   import("../../src/components/modal/LmsModal")
);
const UIPerWrapper = lazy(() =>
import('../../src/components/ui-per-wrapper/UIPerWrapper')
);
const RubricsPageComponent = (props) => {

  const history = useHistory();
  const location = useLocation();

  const [ shwMod, setShwMod] = useState(false);     // Show modal
  const [ rubNm , setRubNm]  = useState('');        // Rubrics name
  const [ rubId , setRubId]  = useState('');        // Rubric Id
  const [ srchKey, setSearch ] = useState('');
  const [ aRubrics, setRubLst] = useState([]);

  useEffect(() => {
    getRubrics();
    props.getSessionDtls(()=> {})
  },// eslint-disable-next-line
    []);

  // Edit the rubrics

  const editRubrics = (oRubric) => {
    if((oRubric.asgnCnt && oRubric.asgnCnt > 1) || (oRubric.grdCnt && oRubric.grdCnt > 0)){
      // Show the error message if the rubrics is assigned to more than one assignment
    }else{
      history.push({ pathname: "/Rubrics-create", search:`?id=${oRubric._id}`, state: location.state });
    }
  }

  // Show delete rubric pop up

  const delRubModal = (showPopUp, oRubrics) => {
    if(showPopUp){
      setShwMod(true);
      setRubNm(oRubrics.title);
      setRubId(oRubrics._id);
    }else{
      setShwMod(false);
      setRubNm('');
      setRubId('');
    }
  }

  // Delete the rubrics

  const deleteRubric = (rubrcId) => {
    const oReq = {
      _id : rubrcId,
      actn : 'D',    // Delete action
      isInLevel: true
    };
   props.createOrUpdateRubrics(oReq, loadRubrics);
  }

  // Load the rubrics

  const loadRubrics = (isLoad) => {
    if(isLoad){
      delRubModal(false);
      getRubrics();
    }
  }

  const backToList = (isNav, aRbrcs) => {
    setRubLst(aRbrcs);
  }

  // Get the rubrics
  const getRubrics = () => {
    
    // if(location && location.state){
      const oReq = {
        // PrID   : location.state.PrID,
        // CrID   : location.state.CrID,
        // DeptID : location.state.DeptID,
        // SemID  : location.state.SemID,
        // AcYr   : location.state.AcYr,
        // SubID  : location.state.subId,
        isInLevel: true,
        isFrLst : true,
        isFrEdtChk : true, // to allow the edit based on the assigned count
        oProj : { title : 1, aCrtrn : 1}
     };
      props.getRubrics(oReq, backToList);
    // }
  }

  // Go to rubrics creation
  const goToRubricsCreation = () => {
    history.push({ pathname: "/Rubrics-create",state : location.state });
  }

  // assignment search 
  const searchHandling = (event) => {
    setSearch(event.target.value);
    if (event.target.value) {
      setRubLst(filterArray(event.target.value, props.aRubrics, ['title']));
    } else {
      setRubLst(props.aRubrics);
    }
  }

  return (
    <div className="rubrics-list_box dashboard-rubrics_block">
      <div className="rubrics-heading">
        <div className="cont-nav">
          <div className="rubric-name">
            <h6>{props.t("translate:RUBRICS")}</h6>
            <p>{props.t("translate:RUBRICS_DESC")}</p>
          </div>
          {/* {!props.location.state?.isDisabledContent && */}
          {/* <UIPerWrapper perCode={["rp_can_create_or_edit_in_rubrics"]}><div className="manual-setting"> */}
            <Button theme="btn-rounded default " clicked={() => goToRubricsCreation()}>
              <Plus className="svg-icon_small icon-white " />
              {props.t("translate:NEW_RUBRICS")}
            </Button>
            {/* <i class="more-options_view">
              <MoreVertical className="svg-icon_small icon-dark" />
            </i> */}
          {/* </div></UIPerWrapper> */}
          {/* } */}
        </div>
      </div>
      <div className="rubrics-selection">
        <div className="rubrics-search">
          <div class="row m-0">
            <div class="col-6 p-0">
              <div className="cont-search-box">
                <Searchbox
                  placeholder={props.t("translate:SEARCH")}
                  searchBoxTheme="search-default search-box_default search-outline"
                  value={srchKey}
                  onChange={ (event) => searchHandling(event) }
                />
              </div>
            </div>
            <div class="col-6 p-0">
              {/* <div className="rubrics-select">
                <LmsSelectDropDown className="dropdown-default drop-down_arrow">
                  <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                </LmsSelectDropDown>
              </div> */}
            </div>
          </div>
        </div>
        {aRubrics && aRubrics.length > 0 ?
          <div>
            {(
              aRubrics.map((oRubric) => {
                return (
                  <div className="rubrics-lists">
                    <div className="rubrics-titles" onClick={()=>history.push({pathname:"/Rubrics-listview", search:`?id=${oRubric._id}`, state : location.state })}>
                      <p className="rubrics-list_heading">{oRubric.title}</p>
                      <p className="rubrics-list_content">
                        {oRubric.crtCnt} {props.t("translate:CRITERIA")} | {oRubric.totPnt} {props.t("translate:POINTS_POSSIBLE")}
                      </p>
                    </div>
                    {/* {!props.location.state?.isDisabledContent && */}
                    {/* <UIPerWrapper perCode={["rp_can_create_or_edit_in_rubrics"]}> */}
                    <div className="quiz-options">  
                      <div
                        id="dropdownMenuButton"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                        className="option-dropdown"
                      >
                        <MoreVertical className="svg-icon_small icon-dark left-icon icon-pointer" />
                      </div>
                      <div class="dropdown-menu edit-rubrics_cont">
                      <div className={((oRubric.asgnCnt && oRubric.asgnCnt > 1) || (oRubric.grdCnt && oRubric.grdCnt > 0)) && "tooltip-slide_rubric"} style={{ display : ((oRubric.asgnCnt && oRubric.asgnCnt > 1) || (oRubric.grdCnt && oRubric.grdCnt > 0)) && "block"}} data-tooltip= {props.t("translate:RUBRIC_HOVER_INFO")}>
                        <UIPerWrapper perCode={["rp_can_create_or_edit_lms_rubric"]}>
                          <div class="dropdown-item user-info_contents" style={{ cursor : ((oRubric.asgnCnt && oRubric.asgnCnt > 1) || (oRubric.grdCnt && oRubric.grdCnt > 0)) && "not-allowed"}} onClick={() => editRubrics(oRubric)}>
                            <Edit className="svg-icon_light  icon-default" />
                            <span className="rubrics-list_dropdown">
                              {props.t("translate:ASSIGNMENTLISTCOMPONENT_EDIT")}
                            </span>    
                          </div>
                        </UIPerWrapper>
                        </div>
                        <UIPerWrapper perCode={["rp_can_delete_lms_rubrics"]}><div class="dropdown-item user-info_contents" onClick={() => delRubModal(true, oRubric)}>
                          <Trash2 className="svg-icon_light  icon-error" />
                          <span className="rubrics-list_dropdown delete-option_btn">
                            {props.t("translate:DELETE")}
                          </span>
                        </div></UIPerWrapper>
                      </div>
                    </div>
                    {/* </UIPerWrapper> */}
                    {/* } */}
                  </div>
                )
              })
            )}
          </div>
          :
          <div className="rubrics-list_empty">
            <p className="rubrics-label_empty">{props.t("translate:EMPTY_RUBRICS")}</p>
          </div>
        }
      </div>
      {shwMod && <LmsModal open={shwMod} onClose={() => delRubModal(false)}  value={rubNm} rubDel = {true} modalTitle={props.t("translate:DELETE_RUBRIC")} btnName='item' confirmModal={true} onClick={() => deleteRubric(rubId)}/>}
    </div>
  );
};
const mapStateToProps = (state) => ({
  ...state.contentReducer,
  ...state.RubricsReducer
});
const mapDispatchToProps = {
  getRubrics,
  createOrUpdateRubrics,
  getSessionDtls
};

const TabNavigator = (props) => <RubricsPageComponent {...props} />;
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);
export default withTranslation()(Components);
