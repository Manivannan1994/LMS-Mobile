import React from "react";
import LmsFileUploader from "../lms-fileuploader/LmsFileUploader";
import { initializeFileUpload, removeImg } from "../../store/actions/FileUploadAction";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import HTTPServices from "../../utils/http-util";
import { MoreVertical } from "react-feather";
import { hexToRGB } from '../../utils/helper';
import CourseClrSettings from "../course-color-settings/courseColorSettings";
import "../../styles/_courseAppearanceStyle.scss";

function CourseImgColorSetting(props) {
	const [aprncDtls, setAprncDtls] = useState({
		imgUrl: null,                                                     // url initial state
		isBtn: true,
		isDrop: false,
		orgClr : props.orgClr,
		subColor: props.location.state.subColor,
		bgClrCode : props.location.state.bgClr,
		bgColor: props.location.state.bgClr ? JSON.parse(JSON.stringify(hexToRGB(props.location.state.bgClr))) : ''
	});
	

	useEffect(() => {
		if(props.isAprUpd){
			const bgColor = props.location.state.bgClr ? JSON.parse(JSON.stringify(hexToRGB(props.location.state.bgClr, 0.4))) : ''
			const imgUrl = (props.imgUrl) ? props.imgUrl : null;
			setAprncDtls({ ...aprncDtls, subColor: props.location.state.subColor, bgColor : bgColor, imgUrl : imgUrl});
		}
		
	},[props.isAprUpd]);

	useEffect(() => {
		// set Image url from s3
		if (props.attachments.length > 0) {
			if (props.attachments[0].url != undefined) {
				setAprncDtls({ ...aprncDtls, imgUrl: props.attachments[0].url, isDrop: false });
				props.setImgUrl(props.attachments[0]?.url);
			}
		}
	}, [props.attachments[0]?.url]);

	useEffect(() => {
		if (props.location.state.imgUrl) setAprncDtls({ ...aprncDtls, imgUrl: props.location.state.imgUrl });
		else setAprncDtls({ ...aprncDtls, imgUrl: null });
	}, [props.location.state.SecID, props.location.state.subId])

	useEffect(() => {
		// set Color From courseColorSettings
		if (aprncDtls.bgColor !== "") {
			props.setClrCode(aprncDtls.bgClrCode);
		}
	}, [aprncDtls.bgColor]);

	// toggle the saveChanges button
	const fileUploadChange = () => {
		props.isConfiqBtn(true);
	};

	// drop down Change and remove image
	const dropHandler = () => {
		setAprncDtls({ ...aprncDtls, isDrop: !aprncDtls.isDrop });
	};

	// Remove The image
	const dltImgHandler = () => {
		props.isConfiqBtn(true,'noImage');
		setAprncDtls({ ...aprncDtls, isDrop: !aprncDtls.isDrop, imgUrl: null });
	};

	return (
		<div>
			<p className="course-form_header">{props.t("translate:COURSE_IMG_CLR_LMS")}</p>
			<div className="image-color-container" style={{ backgroundColor: aprncDtls.bgColor ? aprncDtls.bgColor : aprncDtls.subColor }}>
				<div className="image-container">
					{aprncDtls.imgUrl !== null && aprncDtls.imgUrl !== "" ? (
						<>
							<div style={{ zIndex: "10" }}>
								<div className="updt-img-content-menu" onClick={dropHandler}>
									<MoreVertical className="svg-icon_small icon-dark icon-pointer" />
								</div>
								{aprncDtls.isDrop ? (
									<div className="updt-img-content">
										<div>
											<LmsFileUploader
												multiple={false}
												accept="image/*"
												forParag={true}
												onFileChange={() => fileUploadChange()}
												isConfiqBtn={props.isConfiqBtn}
												isFileUplod={true}
											>
											</LmsFileUploader>
										</div>
										<div className="upload_file-content" onClick={dltImgHandler}>
											{ props.t("translate:REMOVE_IMAGE")}
										</div>
									</div>)
									:
									(<></>)
								}
							</div>
							<img src={aprncDtls.imgUrl} />
						</>)
						:
						(
							<LmsFileUploader
								multiple={false}
								accept="image/*"
								onFileChange={() => fileUploadChange()}
								btnEnable={aprncDtls.isBtn}
								addImage={props.t("translate:ADD-IMG")}
								isConfiqBtn={props.isConfiqBtn}
								isFileUplod={true}
							>
							</LmsFileUploader>
						)}
				</div>
				<div className="text-container">
					<p>{props.secNm}</p>
					<h6>{props.crsContent}</h6>
				</div>
			</div>
			<CourseClrSettings
				aprncDtls={aprncDtls}
				isAprUpd = {props.isAprUpd}
				setAprncDtls={setAprncDtls}
				isConfiqBtn={props.isConfiqBtn}
			/>
		</div>
	);
}

const mapStateToProps = (state) => ({
	...state.contentReducer,
	...state.fileUploadReducer,
});
const mapDispatchToProps = {
	initializeFileUpload,
	removeImg,
};

// export default CourseImgColorSetting;
const TabNavigator = (props) => <CourseImgColorSetting {...props} />;
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));