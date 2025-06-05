import React, { Component } from "react";
import "../../styles/_footerStyle.scss";
import camulogo from "../../assets/images/camulogo.png";
import camuNsdcLogo from "../../assets/images/camu_nsdc_logo.png";
export class FooterComponent extends Component {
	render() {

      //to change logo based on domain
		let logo = camulogo;
		if (window.origin.indexOf("nsdcacademy") >= 0) {
			logo = camuNsdcLogo;
		}
		return (
			<div>
				<div className="footer-cont">
					<div class="row m-0">
						<div class="col-3 p-0">
							<img src={logo} alt="camu-logo" style={{ maxWidth: "130px" }} />
						</div>
						<div class="col-6 p-0">
							<ul class="footer-policy">
								<li>Privacy Policy</li>
								<li>Acceptable Use Policy</li>
								<li>Facebook</li>
								<li>Twitter</li>
							</ul>
						</div>
						{/* <div class="col-3 p-0">
                     <div class="app-link">
                        <Button theme="btn-rounded btn-outline">
                           Get apps &nbsp;&nbsp; 
                           <Ios iconStyle="svg-icon_small"/>
                           &nbsp; 
                           <Android iconStyle="svg-icon_small" />
                           &nbsp; 
                           <Windows iconStyle="svg-icon_small" />
                        </Button>
                     </div>
                  </div> */}
					</div>
				</div>
			</div>
		);
	}
}
