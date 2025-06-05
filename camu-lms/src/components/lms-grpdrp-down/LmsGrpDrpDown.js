import React from 'react';
import '../../styles/_dropdownStyle.scss';
import { withTranslation } from "react-i18next";

const LmsGrpDrpDown = (props) => {
    return (
        <select  className={props.className} value={props.value}  disabled={props.defaultDisabled}  onChange={props.onChange}>
            {
                Object.entries(props.oContent).map((key) => {               
                    return (
                        <optgroup label={props.t("translate:" + key[0])}>
                            {key[1] && key[1].length > 0 && key[1].map((item) => {
                                let key = props.keyTag.replace(/^"(.*)"$/, '$1');
                                let name = props.nameTag.replace(/^"(.*)"$/, '$1');
                                return <option value={item[key]} key={item[key]}> {item[name]}</option>
                            })}
                        </optgroup>
                    )
                })
            }
        </select>
    )
}

export default withTranslation()(LmsGrpDrpDown);