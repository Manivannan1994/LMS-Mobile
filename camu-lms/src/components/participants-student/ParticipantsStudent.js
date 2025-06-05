import React, {Component, lazy} from 'react';
import '../../styles/_participantsStudentStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import userimg from "../../assets/images/user-profile.png";
import Button from '../button/Button';
import { MoreVertical,MessageCircle } from 'react-feather';
import TablePaginationComponent from '../table-pagination/TablePagination';

 const ParticipantsStudentComponent =()=>{


    return(
        <div>
          <div className="participants-student_container">
            <div className="student-cont_nav">
                <div className="user-profile_view">
                    <div className="user-profile_img">
                        <img src={userimg} className="stud-view_img" alt="img" />
                    </div>
                    <div className="user-profile_cont">
                        <p className="user-name_cont">Micheal Thompson</p>
                        <p className="user-id_cont">UCSA1236 - B.E Computer science</p>
                    </div>
                </div>
                <div className="user-grade-points">
                    <p className="participants-grade_overall">Overall grade</p>
                    <p className="participants-grade_point">A+ 65%</p>
                    <Button theme="btn-rounded secondary-btn ">
                        <MessageCircle className="svg-icon_small icon-dark icon-space_left"/>
                        Message
                    </Button>
                    <div className="view-option_cont">
                        <div id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="option-dropdown">
                        <i class="header-options">
                            <MoreVertical className="svg-icon_small icon-default icon-pointer" />
                        </i>
                        </div>
                        <div class="dropdown-menu participants-options_cont">
                        <div class="dropdown-item participants-info_contents">
                            <span className="participants-options_dropdown">Export content</span>
                        </div>
                        <div class="dropdown-item participants-info_contents">
                            <span className="participants-options_dropdown">Import content</span>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="project-tab">
                <div class="participants-view_tab">
                    <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                        <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">Overview</a>
                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-2" role="tab" aria-selected="false">Progress</a>
                        <a class="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#tab-3" role="tab" aria-selected="false">Activites</a>
                    </div>
                </div>
                <div class="tab-content participants-tabs_view" id="nav-tabContent">
                    <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                        <div className="table-list_participants">
                        <p className="table-list_header">Activites</p>
                        <div className="student-grades_table">
                            <table class="table table-cont student-grades_table">
                                <thead class="thead-list">
                                    <tr className="table-header_label">
                                    <th class="sortable">Date</th>
                                    <th class="sortable">Page view</th>
                                    <th class="sortable">Action taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <TablePaginationComponent />
                        </div>
                        <div className="table-list_participants">
                        <p className="table-list_header">Communication</p>
                        <div className="student-grades_table">
                            <table class="table table-cont student-grades_table">
                                <thead class="thead-list">
                                    <tr className="table-header_label">
                                    <th class="sortable">Date</th>
                                    <th class="sortable">Page view</th>
                                    <th class="sortable">Action taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <TablePaginationComponent />
                        </div>
                        <div className="table-list_participants">
                        <p className="table-list_header">Need grading</p>
                        <div className="student-grades_table">
                            <table class="table table-cont student-grades_table">
                                <thead class="thead-list">
                                    <tr className="table-header_label">
                                    <th class="sortable">Date</th>
                                    <th class="sortable">Page view</th>
                                    <th class="sortable">Action taken</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                    <tr>
                                    <td >12 Oct 2021</td>
                                    <td >3</td>
                                    <td >2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <TablePaginationComponent />
                        </div>
                    </div>
                    <div class="tab-pane fade" id="tab-2" role="tabpanel" aria-labelledby="nav-profile-tab">
                        <p>Pending content</p>
                    </div>
                    <div class="tab-pane fade" id="tab-3" role="tabpanel" aria-labelledby="nav-profile-tab">
                        <p>Groups content</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
        
    )

}

export default ParticipantsStudentComponent;