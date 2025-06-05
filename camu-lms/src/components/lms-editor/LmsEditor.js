import React from "react";
import ReactQuill from "react-quill-with-table";
import EditorToolbar, { modules, formats } from "./LmsEditorToolbar";
import "react-quill-with-table/dist/quill.snow.css";
import "../../styles/_lmsEditorStyle.scss";
const {loadEditorSupportedFonts} = require("../../utils/helper");
class LmsEditor extends React.Component {

	constructor(props){
		super(props);
		loadEditorSupportedFonts();
		this.shouldRender = true;
		this.editorToolbarWrapperId = `quill-editor-wrapper-id-${Math.floor(Math.random() * 1000001)}`;
		modules["toolbar"]["container"] = `#${this.editorToolbarWrapperId}`;
	}
	
	shouldComponentUpdate() {
		//this to prevent unwanted re-rendering
		return this.shouldRender;
	}
	
	render() {
		return(
			<div className="editor-box">
			<EditorToolbar editorToolbarId={this.editorToolbarWrapperId} />
			<ReactQuill theme="snow" value={this.props.value || ''} onChange={this.props.onChange}  placeholder={this.props.placeholder} modules={modules} formats={formats} />
			</div>
		)
		
	}

	componentDidUpdate(){
		//this to prevent unwanted re-rendering
		if(!this.props.value || Object.keys(this.props.value).length === 0 || this.props.value.length <= 0){
			this.shouldRender = true;
		}else{
			this.shouldRender = false;
		}
		
	}
}

export default LmsEditor;
