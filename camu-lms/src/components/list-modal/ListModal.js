import React from "react";
import '../../styles/_confirmationalertStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import { withTranslation } from "react-i18next";




const ListModal = (props) => {

   return(
            <div>
                <Modal open={props.open} onClose={props.onClose} center={props.center}>
                    <div className="model-content_box">
                        <div className="model-content_header">
                            <h5 className="model-header_content">{props.modalTitle}</h5>
                        </div>
                        {props.isAnalytics &&  
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
                        }
                    </div>
                </Modal>
                </div>
   )
};
export default withTranslation()(ListModal);
