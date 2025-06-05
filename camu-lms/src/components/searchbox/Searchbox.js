import React from "react";
import "../../styles/_searchboxStyle.scss";
import { Search} from "../../components/icons/Icons";
// import { withTranslation } from "react-i18next";
// import i18next from "i18next";

const SearchBox = (props) => {
  return (
    <div className={props.searchBoxTheme} id="search-view_box">
    <Search iconStyle="svg-icon_small icon-left icon-default" />
    {/* <input type="text"  value={props.value} onChange={props.onChange} placeholder={i18next.t("translate:SEARCH_COURSES")} className="input-seachfield"
       /> */}
       <input type="text"  value={props.value} onChange={props.onChange} placeholder={props.placeholder} className="input-seachfield"/>
    </div>
  );
};
export default (SearchBox);
