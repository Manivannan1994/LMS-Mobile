import React from 'react';
import Select from 'react-select';
import '../../styles/_selectControlStyle.scss';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';

const customStyles = {  // React select custom style
  control: (base, state) => ({
    ...base,
    background: "#fff",
    // Overwrittes the different states of border
    borderColor: state.isFocused ? "#0D9BE1" : "#DFE1E5",
    borderRadius:"30px",
    borderWidth:"2px",
    fontSize:"13px",
    color:"#091E42",
    minWidth:"300px",
    maxWidth:"500px",
    padding:"0 10px",
    // Removes weird border around container
    boxShadow: state.isFocused ? null : null,
    "&:hover": {
      // Overwrittes the different states of border
      // borderColor: state.isFocused ? "red" : "blue"
    }
  }),
  menuList: (provided) => ({
    ...provided,
    fontSize:"13px",

  }),
  option: (base, state) => ({
    ...base,
    fontSize:"13px",
    color: state.isSelected ? '#fff' : '#091E42',
  })
};

const SelectControl = (props) => {   // React Select
  const [options, setOptions] = useState(props.data || []);   //Set the option for scorm files

  useEffect(() => {
    setOptions(props.data || []);
  }, [props.data]);

  const handleInputChange = (inputValue) => {    //Scorm input changes
    if (props.isApi && props.handleInputChange) {
      props.handleInputChange(inputValue, setOptions);
    }
  };

	return (
    <div className="SelectControl">
      <Select  styles={customStyles}
        value={!isNaN(props.curntIndex) ? props.data[props.curntIndex] : props?.value}
        onChange={props.onChange}
        getOptionLabel={option =>
         props?.name ? option[props?.name] : option['label']
        }
        getOptionValue={option => props?.tag ? option[props?.tag] : option }
        defaultValue={props?.defaultValue}
        options={options}
        placeholder ={props.placeholder || "select your option"}
        isMulti={props.isMulti}
        isDisabled ={props?.disabled}
        onInputChange={handleInputChange}
      />
    </div>
  );
}
const TabNavigator = (props) => <SelectControl {...props} />

const Components = connect()(TabNavigator);

export default withTranslation()(withRouter(Components));