import React from "react";
import '../../styles/_dropdownStyle.scss';
// import moment from 'moment';
import UserSession from '../../utils/UserSession';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';


const SelectControl = (props) => {
  const staffOption = (item) => {
    if (
      item.AcYrNm &&
      item.AcYrNm.length > 0 &&
      item.SemName &&
      item.SemName.length > 0
    ) {
      return (
        <option value={item._id}>
          {item.PrCode}, {item.CrCode}, {item.AcYrNm}, {item.SemName}
        </option>
      );
    } else if (item && item.asgnmntGrd) { // For Grade dropdown in Assignment grading
      if (item.GradeNm && item.Grade) {
        return (<option className="grad_option" value={item.Grade}>{item.GradeNm} ({item.MinMrk} - {item.MaxMrk})</option>);
      } else {
        return (<option className="grad_option" value="">{props.t("translate:SELECT_GRADE")} &ensp;</option>);
      }
    }
  };
  // 
    const studentOption =(item)=>{
      if (
        item.acyrNm &&
        item.acyrNm.length > 0 &&
        item.semNm &&
        item.semNm.length > 0
      ) {
        return (
          <option value={item._id}>
            {item.CrCode}, {item.acyrNm}, {item.semNm}
          </option>
        );
      }
    }


  return (
    <select
      onChange={props.onChange}
      className={props.dropdownTheme}
      value={props.value}
      disabled={props?.disabled}
    >
      {UserSession.isStaff() &&
        props.data &&
        props.data.length > 0 &&
        props.data.map((item) => {
        return staffOption(item)
        })}

      {UserSession.isStudent() &&
        props.data &&
        props.data.length > 0 &&
        props.data.map((item) => {
        return studentOption(item)
        })}
    </select>
  );
};

const TabNavigator = (props) => <SelectControl {...props} />

const Components = connect()(TabNavigator);

export default withTranslation()(withRouter(Components));