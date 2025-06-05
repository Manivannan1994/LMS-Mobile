import React from 'react';
import '../../styles/_dropdownStyle.scss';
import i18next from "i18next";


const LmsSelectDropDown = (props) => {
    return (
        <div>
            <select className={props.className} disabled={props.defaultDisabled} value={props.value} onChange={props.onChange}>
            {props.isDeflt && <option value="" disabled selected>{i18next.t("translate:SELECT_YOUR_OPTION")}</option>}
                {props.dropDown && props.dropDown.length > 0 && props.dropDown.map((item) => {
                    // make sure  pass the string with double quotes
                    let key=props.keyTag.replace(/^"(.*)"$/, '$1');
                    let name=props.nameTag.replace(/^"(.*)"$/, '$1'); 
                    return (
                        <>
                            {props.isNtDefltSel && <option value="" disabled selected>{i18next.t("translate:SELECT_YOUR_OPTION")}</option>}
                            <option value={item[key]} key={item[key]}> {item[name]}</option>
                        </>
                    )
                })}
            </select>
        </div>
    );
}

export default LmsSelectDropDown;