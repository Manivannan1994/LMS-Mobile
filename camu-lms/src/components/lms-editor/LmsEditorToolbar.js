import React from "react";
import { Quill } from "react-quill-with-table";
import htmlEditButton from "quill-html-edit-button";
import ImageResize from "quill-image-resize-module-react";
import VideoResize from "quill-video-resize-module";

// Custom Undo button icon component for Quill editor. You can import it directly
// from 'quill/assets/icons/undo.svg' but I found that a number of loaders do not
// handle them correctly
const CustomUndo = () => (
	<svg viewBox="0 0 18 18">
		<polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
		<path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9" />
	</svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
	<svg viewBox="0 0 18 18">
		<polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
		<path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5" />
	</svg>
);

// Undo and redo functions for Custom Toolbar
function undoChange() {
	this.quill.history.undo();
}
function redoChange() {
	this.quill.history.redo();
}

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = ["arial","courierprime","caveat","opensans","ebgaramond","lobster","montserrat","robotomono","timesnewroman"];
Quill.register(Font, true);

//register 3rd party extentions here.
Quill.register("modules/htmlEditButton", htmlEditButton);
Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/VideoResize", VideoResize);

// Modules object for setting up the Quill editor
export const modules = {
	toolbar: {
		handlers: {
			undo: undoChange,
			redo: redoChange,
		},
	},
	history: {
		delay: 500,
		maxStack: 100,
		userOnly: true,
	},
	htmlEditButton: {},
	imageResize: {
		parchment: Quill.import("parchment"),
		modules: ["Resize", "DisplaySize"],
	},
	VideoResize: {
		modules: ["Resize", "DisplaySize"],
	},
	table: false
};

// Formats objects for setting up the Quill editor
export const formats = ["header", "font", "size", "bold", "italic", "underline", "align", "strike", "script", "blockquote", "background", "list", "bullet", "indent", "link", "image", "video", "color", "code-block", "code", "direction", "width", "height"];

// Quill Toolbar component
export const QuillToolbar = (props) => {
	return (
		<div id={props.editorToolbarId}>
			<span className="ql-formats">
				<select className="ql-font" defaultValue="Arial">
					<option value="Arial">Arial</option>
					<option value="courierprime">Courier Prime</option>
					<option value="caveat">Caveat</option>
					<option value="ebgaramond">EB Garamond</option>
					<option value="lobster">Lobster</option>
					<option value="montserrat">Montserrat</option>
					<option value="opensans">Open Sans</option>
					<option value="robotomono">Roboto</option>
					<option value="timesnewroman">Times New Roman</option>
				</select>
				<select className="ql-size" defaultValue="normal">
					<option value="small">Small</option>
					<option value="normal">Normal</option>
					<option value="large">Large</option>
					<option value="huge">Huge</option>
				</select>
			</span>
			<span className="ql-formats">
				<button class="ql-header" value="1" type="button">
					H1
				</button>
				<button class="ql-header" value="2" type="button">
					H2
				</button>
			</span>
			<span className="ql-formats">
				<button className="ql-bold" />
				<button className="ql-italic" />
				<button className="ql-underline" />
				<button className="ql-strike" />
			</span>
			<span className="ql-formats">
				<button className="ql-list" value="ordered" />
				<button className="ql-list" value="bullet" />
				<button className="ql-indent" value="-1" />
				<button className="ql-indent" value="+1" />
			</span>
			<span className="ql-formats">
				<button className="ql-script" value="super" />
				<button className="ql-script" value="sub" />
				<button className="ql-blockquote" />
				<button className="ql-direction" />
			</span>
			<span className="ql-formats">
				<select className="ql-align" />
				<select className="ql-color" />
				<select className="ql-background" />
			</span>
			<span className="ql-formats">
				<button className="ql-link" />
				<button className="ql-image" />
				<button className="ql-video" />
			</span>
			<span className="ql-formats">
				<button className="ql-code-block" />
				<button className="ql-clean" />
			</span>
			<span className="ql-formats">
				<button className="ql-undo">
					<CustomUndo />
				</button>
				<button className="ql-redo">
					<CustomRedo />
				</button>
			</span>
		</div>
	);
};

export default QuillToolbar;
