import React, { Component} from 'react';
import '../../styles/_nodataStyle.scss';
import Button from '../button/Button';
import StaffWrapper from '../staff-wrapper/StaffWrapper';
import StudentWrapper from '../student-wrapper/StudentWrapper';
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom';
import { withTranslation } from "react-i18next";
import UIPerWrapper from '../ui-per-wrapper/UIPerWrapper';
// const Button  = lazy(() =>
//  import('../button/Button')
//  );
class NoRecord extends Component {
    render() {
        return (
            <div>
                <div class="data-notfound">
                    {this.props.img && <img src={this.props.img} class={this.props.imgSize} alt="Loading-img"/>}
                    <StudentWrapper>
                        {this.props.courseContent && <p class="data-text">{this.props.t("translate:STU_NOT_HAVE_COURSE_CONTENT")}</p>}
                    </StudentWrapper>
                    <StaffWrapper>
                        {this.props.courseContent && !this.props.location.state?.isDisabledContent && <p class="data-text">{this.props.t("translate:STAFF_NOT_HAVE_COURSE_CONTENT")}</p>}
                    </StaffWrapper>
                    {this.props.courseContentEmpty && <p class="data-text">No content are matching the search query</p>}
                    {this.props.dashboardContent && <p class="data-text">{this.props.t("translate:COURSE_NOT_ASSIGNED_TERM")}</p>}
                    {this.props.archivedEmptyContent && <p class="data-text">{this.props.t(`translate:${this.props.emtyCntTxt}`)}</p>}
                    <StaffWrapper>
                        {this.props.courseContent &&  !this.props.location.state?.isDisabledContent &&
                            <UIPerWrapper perCode={["rp_can_create_or_edit_lms_chap_subchap"]}>
                                <div class="data-btn ">
                                <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=>this.props.history.push({pathname:"/home-page/import-content",state:this.props.location.state})}>{this.props.t("translate:IMPORT_COURSE")}</Button>
                                <Button theme="btn-rounded default" clicked={this.props.clicked}>{this.props.t("translate:ADD_FIRST_CHAPTER")}</Button>
                                </div>
                            </UIPerWrapper>
                        }               
                        {/* {this.props.courseContent && <p class="course-details">How do I add course content?</p>} */}
                        {/* {this.props.dashboardContent &&
                            <div class="data-btn ">
                                <Button theme="btn-rounded secondary-btn btn-outline">Copy from archived course</Button>
                                <Button theme="btn-rounded default" >Create a course</Button>
                              
                            </div>
                        }  */}
                        {/* {this.props.dashboardContent && <p class="course-details">Why i cant see my courses?</p>} */}
                    </StaffWrapper>
                    {this.props.courseContentEmpty &&
                        <div class="data-btn ">
                            <Button theme="btn-rounded secondary-btn btn-outline" clicked={this.props.clicked}>Clear search</Button>
                        </div>
                    }
                    {this.props.noAsgmntCnt && <p class="data-text">{this.props.t("translate:NO_ASGMNT_CONTENT_FOUND")}</p>}
                    {this.props.studsGradContent &&<p class="data-text">{this.props.t("translate:NO_STUD_GRAD_CONTENT_FOUND")}</p>}
                    {this.props.scheduleContent &&<p class="data-text">{this.props.t("translate:NO_SCHEDULES_FOUND")}</p>}
                    {this.props.crseSchdlContnt &&<p class="data-text">{this.props.t("translate:NO_CLASS_SCHDLD")}{this.props.crsname}.</p>}
                    {(this.props.gradBkContent || this.props.studGradeView) && <p class="data-text">{this.props.t("translate:NO_GRADE_ITEMS_FOUND")}</p>}
                    {this.props.gradAsgnContent && this.props.gradAsgnContent === "NG" &&<p class="data-text">{this.props.t("translate:NO_NEED_GRD_ASNMNT_FND")}</p>}
                    {this.props.gradAsgnContent && this.props.gradAsgnContent === "GRD" &&<p class="data-text">{this.props.t("translate:NO_GRD_ASGN_FND")}</p>}
                    {this.props.quizCont && <p class="data-text">{this.props.t("translate:NO_QUIZ_FOUND")}</p>}
                </div>
            </div>
        )
    }
}

const TabNavigator = (props) => <NoRecord {...props} />

const Components = connect()(TabNavigator);

export default withTranslation()(withRouter(Components));
