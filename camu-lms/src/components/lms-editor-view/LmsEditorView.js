import React from "react";
import ReactHtmlParser from "react-html-parser";
import "../../styles/_lmsEditorStyle.scss";
import "react-quill-with-table/dist/quill.snow.css";
const {loadEditorSupportedFonts} = require("../../utils/helper");


const LmsEditorView = (props) => {
  loadEditorSupportedFonts();
  return(
    <div>
      <div className="ql-snow ql-bubble">
      <div className="ql-editor quill-editor-view">{ReactHtmlParser(props.contentData)}</div>
      </div>
    </div>
  )
};

export default LmsEditorView;
