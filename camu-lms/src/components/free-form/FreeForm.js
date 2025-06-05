import React,{useState} from 'react';
import '../../styles/_freeFormStyle.scss';
import InputBox from '../input-box/InputBox';
import Button from '../button/Button';
import { ArrowLeft, Plus } from 'react-feather';
import {MinusCircle} from '../icons/Icons';
import CheckBox from '../checkbox/CheckBox';
import LmsSelectDropDown from '../lms-selectdropdown/LmsSelectDropDown';
import { withTranslation } from "react-i18next";
import { useHistory,useLocation } from "react-router-dom";
import ReactDatePicker from '../date-picker/DatePicker';

const FreeFormComponent = (props) => {
    const chapListArr=[
        { label: 'Chapter 1', value: 'Chapter 1' },
        { label: 'Chapter 2', value: 'Chapter 2' },
        { label: 'Chapter 3', value: 'Chapter 3' },
        { label: 'Chapter 4', value: 'Chapter 4' }
    ]
    const [chapOption,setChapOption] = useState('');
    const history=useHistory();
    const location=useLocation();
    return (
        
                <div>
                    <div className="liner-form_header">
                    <div className="row m-0">
                        <div className="col-6 p-0">
                            <div className="page-input_title">
                                <div className="page-title_icon">
                                <ArrowLeft className="svg-icon_default icon-dark icon-pointer" onClick={()=>  history.push({pathname:'/home-page/content-page',state:location.state})}  />
                                </div>
                                <div className="page-input_details">
                                <label for="fname" className="form-lable">{props.t("translate:CHAP_TITLE")}</label>
                                <InputBox className="input-block" placeholder="Ethical AI" />
                                </div>
                            </div>
                        </div>
                        <div className="col-6 p-0">
                            <div className="publish-btn">
                                <div className="save-publish_btn">
                                <Button theme="btn-rounded btn-transparent" >{props.t("translate:UNPUBLISHED_LABEL")}</Button>
                                </div>
                                <div className="save-page_btn">
                                <Button theme="btn-rounded secondary-btn btn-outline" >{props.t("translate:SAVE_&_PUBLISH")}</Button>
                                </div>
                                <div className="save-page_btn">
                                <Button theme="btn-rounded default" >{props.t("translate:SAVE")}</Button>
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
                            <p className="course-setting_header">{props.t("translate:ASSIGNMENTCONTENTCOMPONENT_DETAILS_INFORMATION")} </p>
                            <p className="course-setting_content">Define the pre-requisites and conditions for accessing this content.</p>
                        </div>
                        <div className="col-8 p-0">
                            <div className="course-setting">
                                <div className="course-setting_cont">
                                <div className="row m-0">
                                    <div className="col-10 p-0">
                                        <div className="course-setting_label">
                                            <p className="course-form_header">{props.t("translate:LOCK_UNTIL")}</p>
                                            <p className="course-form_content">Students will be able to see the module titles and module item names, but they will not be able to access the module items until after the lock date has passed.</p>
                                        </div>
                                    </div>
                                    <div className="col-2 p-0">
                                        <div className="course-form_select">
                                            <CheckBox className="check-box" />
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div className="course-setting_select">
                                <ReactDatePicker closeOnSelect={true}  type='date'  className="date-picker calendar_icon" dateFormat="DD-MMM-YYYY" />
                                </div>
                            </div>
                            <div className="course-setting">
                                <div className="course-setting_cont">
                                <div className="row m-0">
                                    <div className="col-10 p-0">
                                        <div className="course-setting_label">
                                            <p className="course-form_header">{props.t("translate:PRE_REQUEST")}</p>
                                            <p className="course-form_content">Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.</p>
                                        </div>
                                    </div>
                                    <div className="col-2 p-0">
                                        <div className="course-form_select">
                                            <CheckBox className="check-box" />
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div className="course-setting_select">
                                <div className="requirement-list">
                                    <div className="row m-0">
                                        <div className="col-8 p-0">
                                            {/* <LmsSelectDropDown className="dropdown-select drop-down_arrow" /> */}
                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" value={chapOption} defaultDisabled={false} onChange={(event)=>setChapOption(event.target.value)} dropDown={chapListArr} keyTag="value" nameTag="label"/>
                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="remove-cont-list">
                                            <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="add-requirement_label">
                                    <span>
                                        <Plus className="svg-icon_small icon-primary icon-pointer"/>
                                    </span>
                                 {props.t("translate:ADD_REQUEST")}
                                </p>
                                </div>
                            </div>
                            <div className="course-setting">
                                <div className="course-setting_cont">
                                <div className="row m-0">
                                    <div className="col-10 p-0">
                                        <div className="course-setting_label">
                                            <p className="course-form_header">{props.t("translate:REQUIRE")}</p>
                                            <p className="course-form_content">Design is a plan for arranging elements in such a way as best to accomplish a particular purpose.</p>
                                        </div>
                                    </div>
                                    <div className="col-2 p-0">
                                        <div className="course-form_select">
                                            <CheckBox className="check-box" />
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div className="course-setting_select">
                                <p className="requirement-label">Student must complete one of these requirements</p>
                                <div className="requirement-list">
                                    <div className="row m-0">
                                        <div className="col-5 p-0">
                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" />
                                        </div>
                                        <div className="col-4 p-0">
                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" />
                                        </div>
                                        <div className="col-2 p-0">
                                            <div className="mark-select_box">
                                            <InputBox className="input-table"/>
                                            <span >/50</span>
                                            </div>
                                        </div>
                                        <div className="col-1 p-0">
                                            <div className="remove-cont-list">
                                            <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="requirement-list">
                                    <div className="row m-0">
                                        <div className="col-5 p-0">
                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" />
                                        </div>
                                        <div className="col-4 p-0">
                                            <LmsSelectDropDown className="dropdown-select drop-down_arrow" />
                                        </div>
                                        <div className="col-2 p-0">
                                            <div className="mark-select_box">
                                            <InputBox className="input-table"/>
                                            <span >/50</span>
                                            </div>
                                        </div>
                                        <div className="col-1 p-0">
                                            <div className="remove-cont-list">
                                            <MinusCircle iconStyle="svg-icon_small icon-dark icon-pointer" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="add-requirement_label">
                                    <span>
                                        <Plus className="svg-icon_small icon-primary icon-pointer"/>
                                    </span>
                                    {props.t("translate:ADD_REQUEST")}
                                </p>
                                </div>
                            </div>
                            <div className="course-setting">
                                <div className="row m-0">
                                <div className="col-10 p-0">
                                    <div className="course-setting_label">
                                        <p className="course-form_header">{props.t("translate:ALLOW_CONVERSATION")}</p>
                                        {/* <p className="course-form_content">Lorem ipsum dolor sit amet, consectetur adipiscing.</p> */}
                                    </div>
                                </div>
                                <div className="col-2 p-0">
                                    <div className="course-form_select">
                                        <CheckBox className="check-box" />
                                    </div>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
    );
}

export default withTranslation()(FreeFormComponent) ;