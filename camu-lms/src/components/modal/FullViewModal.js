import {React} from "react";
import '../../styles/_confirmationalertStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { withTranslation } from "react-i18next";
import RubricsViewComponent from "../rubrics-view/RubricsView";
import RubricsEdit from "../rubrics-edit/RubricsEdit";




const FullViewModal = (props) => {
    // Callback from student assignment grade view
    const rubricGradeCallback =  (oSndData) => {
        props.gradeAsgnCallback(oSndData);
    }
    // Callback from assignment page for edit rubrics
    const assgnmentEditCB = (oRubric) => {
        props.editRubrcsCB(oRubric);
    }
    // Callback from assignment page for new rubrics
    const backToAsgnmntCnt = (oRubric) => {
        props.newRubrcCB(oRubric);
    }

    // Dummy close icon to hide the close in rubrics edit and new modal
    const closeIcon = (
        <div style={{width : '2px', height : '2px'}}></div>
      );

   return(
            <div>
                <Modal open={props.open} onClose={props.onClose}  center={props.center}  closeIcon={(props.shwEdtCompMod || props.shwNwRbrcsMod) && closeIcon}>
                
                        <div className="model-content_header" style={{padding : (props.shwEdtCompMod || props.shwNwRbrcsMod) ? '0px' : ''}}>
                            {
                                (props.isFrmRub || props.isFrAsgn) && 
                                <p className="modal-full_view_label">{props.rubTitle}</p>
                            }
                            {/* <h5 className="model-header_content">Assignment title</h5> */}
                        </div>
                        <div className="full-view_box">
                        {/* Rubrics View modal from assignment*/}
                        {
                            (props.isFrmRub || props.isFrAsgn) && 
                            <RubricsViewComponent aSelRatings = {props.aSelRatings} rubricsVwCallback = {rubricGradeCallback} asCnId = {props.asCnId} shwRat = {props.shwRat} studId = {props.studId} id = {props.rubrcId} isFrAsgn = {props.isFrAsgn} isFrmGrd = {props.isFrmRub} asgnmntDtls = {props.asgnmntDtls}/>
                        }
                        {/* Rubrics edit modal from assignment */}
                        {
                            (props.shwEdtCompMod) && 
                            <RubricsEdit shwEdtCompMod = {props.shwEdtCompMod} rbrcId = {props.id} asgnId = {props.asgnId} rubricsVwCallback = {assgnmentEditCB} title = {props.title} mxMrk = {props.mxMrk}/>
                        }
                        {/* New rubrics modal from assignment */}
                        {
                            props.shwNwRbrcsMod && 
                            <RubricsEdit shwNwRbrcsMod = {props.shwNwRbrcsMod} rubricsVwCallback = {backToAsgnmntCnt}></RubricsEdit>
                        }
                        {/* {props.isAnalytics &&  
                            <div className="table-tab_container">
                                <div class="table-modal_box">
                                <div class="student-table_tab">
                                    <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                                        <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">Assigned <span className="tabs-notification">12</span> </a>
                                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false" >Viewed <span className="tabs-notification">12</span> </a>
                                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Submitted <span className="tabs-notification">12</span> </a>
                                        <a class="nav-item nav-link" id="nav-home-tab" data-toggle="tab" href="#tab-4" role="tab" aria-selected="false">Submitted late <span className="tabs-notification">12</span> </a>
                                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-5" role="tab" aria-selected="false" >Missed <span className="tabs-notification">12</span> </a>
                                    </div>
                                </div>
                                <div class="tab-content student-rating" id="nav-tabContent">
                                    <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                                        <table class="table table-cont student-grades_table table-stud_header">
                                            <thead class="thead-list">
                                            <tr>
                                                <th class="sortable">Full name</th>
                                                <th class="sortable">Assigned date</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td >Michael Thompson</td>
                                                <td >Jan 27, 6:30pm</td>
                                            </tr>
                                            <tr>
                                                <td >Michael Thompson</td>
                                                <td >Jan 27, 6:30pm</td>
                                            </tr>
                                            <tr>
                                                <td >Michael Thompson</td>
                                                <td >Jan 27, 6:30pm</td>
                                            </tr>
                                            <tr>
                                                <td >Michael Thompson</td>
                                                <td >Jan 27, 6:30pm</td>
                                            </tr>
                                            <tr>
                                                <td >Michael Thompson</td>
                                                <td >Jan 27, 6:30pm</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                                        <p>content 1</p>
                                    </div>
                                    <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                                        <p>content 2</p>
                                    </div>
                                </div>
                                </div>
                            </div>
                        } */}
                      
                    </div>
                </Modal>
                </div>
   )
};
export default withTranslation()(FullViewModal);
