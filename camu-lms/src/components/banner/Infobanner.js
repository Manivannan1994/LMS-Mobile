import React ,{ Component } from 'react';
import {Alert} from '../alertbox/Alert';
import{Cross} from '../icons/Icons';
import bannerimg from '../../assets/images/bannerimg.jpg';
import '../../styles/_infobannerStyle.scss';

export class InfoBannerComponent extends Component{
    render(){
        return(
         <div>
   <div className="alert-box">
      <Alert alertTheme="alert ">
         <div className="alert-box_cont">
            <div class="row m-0">
               <div class="col-3 p-0">
                  <img src={bannerimg} alt="banner-img" className="banner_img" />
               </div>
               <div class="col-9 p-0">
                  <div className="banner-cont">
                     <h6 className="banner_header">Guidence banner title</h6>
                     <p className="banner_content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam sollicitudin tempor id eu nisl nunc mi. Auctor augue mauris augue neque gravida in fermentum. </p>
                     <p className="banner_cont-list">How to get started <span>.</span> Watch a video <span>.</span>Take a tour</p>
                  </div>
               </div>
            </div>
            <a  data-dismiss="alert" aria-label="close">
               
               <Cross iconStyle="svg-icon_small icon-dark close-icon-banner"/>
            </a>
         </div>
      </Alert>
      <Alert alertTheme="alert ">
         <div className="alert-box_cont">
            <div class="row m-0">
               <div class="col-12 p-0">
                  <h6 className="banner_header">Guidence banner title</h6>
                  <p className="banner_content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam sollicitudin tempor id eu nisl nunc mi. Auctor augue mauris augue neque gravida in fermentum. </p>
                  <p className="banner_cont-list">How to get started <span>.</span> Watch a video <span>.</span>Take a tour</p>
               </div>
            </div>
            <a  data-dismiss="alert" aria-label="close">
               <Cross iconStyle="svg-icon_small icon-dark close-icon-banner"/>
            </a>
         </div>
      </Alert>
      <div className="alert-box_cont">
         <Alert alertTheme="alert ">
            <div class="row m-0">
               <div class="col-3 p-0">
                  <img src={bannerimg} alt="banner-img" className="banner_img" />
               </div>
               <div class="col-9 p-0">
                  <div className="banner-cont">
                     <h6 className="banner_header">Guidence banner title</h6>
                     <p className="banner_content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam sollicitudin tempor id eu nisl nunc mi. Auctor augue mauris augue neque gravida in fermentum. </p>
                     <p className="banner_cont-list">How to get started <span>.</span> Watch a video <span>.</span>Take a tour</p>
                  </div>
               </div>
            </div>
         </Alert>
      </div>
      <div className="alert-box_cont">
         <Alert alertTheme="alert ">
            <div class="row m-0">
               <div class="col-12 p-0">
                  <h6 className="banner_header">Guidence banner title</h6>
                  <p className="banner_content">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. A diam sollicitudin tempor id eu nisl nunc mi. Auctor augue mauris augue neque gravida in fermentum. </p>
                  <p className="banner_cont-list">How to get started <span>.</span> Watch a video <span>.</span>Take a tour</p>
               </div>
            </div>
         </Alert>
      </div>
   </div>
</div>
        )
    }
}