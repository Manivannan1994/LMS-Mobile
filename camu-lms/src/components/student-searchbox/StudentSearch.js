import React, { Component, lazy } from 'react';
import "../../styles/_searchboxStyle.scss";
import '../../styles/_studentlistStyle.scss';
import '../../styles/_studentsearchStyle.scss';
// import student_img from '../../assets/images/stud-img.png';
import { generateHexDecCode } from '../../utils/helper';

import { Search } from "../icons/Icons";
// import { withTranslation } from "react-i18next";
import i18next from "i18next";
import { connect } from 'react-redux';
import { getSpcAssignMntStudnts } from '../../store/actions/ContentActions';
import $ from 'jquery';
const StudentNameComponent = lazy(() =>
    import('../student-name/StudentName')
);

const InputBox = lazy(() =>
    import('../input-box/InputBox')
);
const Button = lazy(() =>
    import('../button/Button')
);
const CheckBox = lazy(() =>
    import('../checkbox/CheckBox')
);
class StudentSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: undefined,
            studId: ''
        }
    }
    //update the student status
    statusUpdate = (status) => {
        this.setState({ checked: status });
    }
    //Handle the student status based on the selected students
    studStatusHandle = (event, student, stuId) => {
        if (student) {
            this.setState({ checked: false });
            this.setState({ studId: stuId });
        } else {
            this.setState({ checked: true });
            this.setState({ studId: stuId });
        }
    }
    //get selected student details
    // getSelectedStudents = () => {
    //     $('#studentList-model').modal('hide');
    //     this.props.getSpcAssignMntStudnts(this.props.data);
    // }
    render() {
        // eslint-disable-next-line 
        const filteredData = this.props.data && this.props.data.length > 0 && this.props.data.filter((item) => {
            if (this.props.value === undefined || this.props.value === '') {
                return item
            } else if (item.FNa.toLowerCase().includes(this.props.value.toLowerCase())) {
                return item
            } else if (item.AplnNum.toLowerCase().includes(this.props.value.toLowerCase())) {
                return item
            }
        });
        return (
            <div className={this.props.searchBoxTheme}>
                <div className="stud-list">
                    <Search iconStyle="svg-icon_small icon-left icon-default" />
                    {/* <input type="text" placeholder={"search"} className="student-search_list"
         onChange={this.props.onChange} value={this.props.value}/> */}
                    <InputBox placeholder={i18next.t("translate:SEARCH")} className="student-search_list"
                        onChange={this.props.onChange} value={this.props.value}
                    />
                </div>

                <div className="studs-list">
                    <div class="row m-0">
                        {filteredData && filteredData.length > 0 ?
                            (filteredData.map((stud) => {
                                if (this.state.studId === stud.StuID && this.state.checked === false && stud.checked) {
                                    stud.checked = false;
                                } else if ((this.state.studId === stud.StuID) && (this.state.checked || stud.checked)) {
                                    stud.checked = true;
                                }
                                return (
                                    <div class="col-6 p-0">
                                        <div className="student-data">
                                            <div className="select-stud">
                                                <CheckBox className="stud-checkbox" id="exampleCheck1" onChange={(event) => this.studStatusHandle(event, stud.checked, stud.StuID)} checked={stud.checked} />
                                                {/* <input type="checkbox" className="stud-checkbox" id="exampleCheck1" onChange={(event)=>this.studStatusHandle(event,stud.checked,stud.StuID)} checked={stud.checked}/> */}
                                            </div>
                                            <div className="student-img">
                                                {stud && stud.PhotoImgID ? <img src={'/Image/getImage/' + stud.PhotoImgID} className="stud-list_img" alt="user-img" /> : <StudentNameComponent className="student-name_icon" fName={stud.FNa.substring(0, 1)} clrCode={generateHexDecCode(stud.StuID)} />}
                                            </div>
                                            <div className="student-details">
                                                <div>
                                                    <p className="std-name">{stud.FNa} {stud.LNa}</p>
                                                    <p className="std-id">{stud.AplnNum}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })):
                            (
                                <div className="match-result">
                                    <p>{i18next.t("translate:NO_RESULTS_MATCHING")} {`"${this.props.value}"`}</p>
                                    <Button theme="btn-rounded secondary-btn btn-outline" clicked={this.props.clear}>{i18next.t("translate:CLEAR_SEARCH")}</Button>
                                </div>
                            )
                            }
                    </div>
                </div>
                <div class="modal-footer_student">
                    <Button theme="btn-rounded secondary-btn btn-outline" clicked={()=> $('#studentList-model').modal('hide')}>{i18next.t("translate:CANCEL")}</Button>
                    <Button theme="btn-rounded default btn-left" clicked={this.props.getSelectedStudents}>{i18next.t("translate:ASSIGNMENTCONTENTCOMPONENT_ADD_STUDENTS")}</Button>
                </div>
            </div>

        );
    }
}

const mapDispatchToProps = {
    getSpcAssignMntStudnts
}


export default connect(null, mapDispatchToProps)(StudentSearch);

