import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/_subjectcontentStyle.scss";
import { hexToRGB, isBeforeDate } from '../../utils/helper';
import courseImage from "../../assets/images/course_image.jpg";
import { connect } from "react-redux";

const SubjectContent = (props) => {
  	const isFe = props.session && props.session.fe ? true : false;
	return (
		<div className="sub-inline_box">
			<div class="dashboard-content">
			    {props.subject.map((item, index) => {
			      	return (
			        	<NavLink
			        	  to={{
			        	    pathname: "/home-page/content-page",
			        	    state: {
			        	    	subId: item.SubjId,
			        	    	stfTyp: item.stfTyp,
			        	    	SecID: item.SecID,
			        	    	InId: props.selcDtls.InId,
			        	    	PrID:  isFe  && item.PrID ? item.PrID : props.selcDtls.PrID,
			        	    	CrID: isFe  && item.CrID ? item.CrID : props.selcDtls.CrID,
			        	    	DeptID: item.deptId,
			        	    	SemID: isFe  && item.SemID ? item.SemID : props.selcDtls.SemID,
			        	    	SemName: isFe  && item.SemName ? item.SemName : props.selcDtls.SemName,
			        	    	AcYrNm: isFe  && item.AcYrNm ? item.AcYrNm : props.selcDtls.AcYrNm,
			        	    	CrName: isFe  && item.CrName ? item.CrName : props.selcDtls.CrName,
			        	    	SecName: item.SecNm,
			        	    	subColor: item.color,
			        	    	StaffId: item.StaffId,
			        	    	AcYr: isFe  && item.AcYr ? item.AcYr : props.selcDtls.AcYr,
			        	    	subNa: item.text,
			        	    	imgUrl:((item.aprncDtls &&  item.aprncDtls[0] && item.aprncDtls[0].imgUrl &&  item.aprncDtls[0].imgUrl !== undefined) ? item.aprncDtls[0].imgUrl : ''),
								bgClr:((item.aprncDtls &&  item.aprncDtls[0] && item.aprncDtls[0].bgClr &&  item.aprncDtls[0].bgClr !== undefined) ? item.aprncDtls[0].bgClr : ''),
								isDisabledContent : props?.semConfigDetls?.data?.isCurSem === false ? true : false,
								isEnableAiChat: props.session?.isEnableAiChat,
								utype: props.session?.utype || "",
								stuId: props.session?.stuId || ""

			        	    },
			        	  }}
			        	  class="sub-routing"
			        	>

			        		<div className="information-box" style={{ backgroundColor: (item && item.aprncDtls &&  item.aprncDtls[0] && item.aprncDtls[0].bgClr) ? hexToRGB(item.aprncDtls[0].bgClr) : item.color}}>
								{ item && item.aprncDtls &&  item.aprncDtls[0] && item.aprncDtls[0].imgUrl ?
									<div className="infomation-top-content">
										<img src={item.aprncDtls[0].imgUrl}/>
									</div> : 
									<div className="infomation-top-content">
										<img src={courseImage}/>
									</div>
								}
		    	        		  	<div className="info-content">
		    	        		      	<p>{item.deptCd}<span className="class-separator"></span>{item.SecNm}</p>
		    	        		      	<h6> {item.Code} - {item.SubjNm}</h6>
			        		      	<div className="notification-badge">
			        		      	{/* <div className="badge-list">
			        		      	  1
			        		      	  <Calendar className="notification-icons" />
			        		      	</div>
			        		      	<div className="badge-list">
			        		      	  2
			        		      	  <MessageCircle className="notification-icons" />
			        		      	</div> */}
			        		      	{
			        		        (item.lecHrs || item.tutHrs || item.prcHrs)?
			        		        <div className="badge-list">
			        		        {item.lecHrs||"0"}L<span className="class-separator ml-1 mr -1"></span>{item.prcHrs||"0"}P<span className="class-separator ml-1 mr -1"></span>{item.tutHrs||"0"}T
			        		        </div>:<></>
			        		      	}
			        		    	</div>
			        		  	</div>
			        		</div>
			        	</NavLink>
			      	);
			    })}
			</div>
		</div>
	);
};
const mapStateToProps = (state) => ({
  ...state.headerReducer,
  ...state.dashboardReducer,
  ...state.fileUploadReducer,
});

export default connect(mapStateToProps)(SubjectContent);
