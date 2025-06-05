import React, { Component } from 'react';
import blogimg from '../../assets/images/welcome.png';
import '../../styles/_contentoverviewStyle.scss';
import { Block } from '../icons/Icons';

export class ContentoverviewComponent extends Component{
    render(){
        return(
         <div className="modules-list">
         <div className="module-header-right">
            <p>Introduction and Review</p>
            <Block iconStyle="svg-icon_small icon-default"/>
         </div>
         <div className="cont-box-right">
            <h5>Welcome to the course</h5>
            <img src={blogimg} className="welcome-img"/>
            <p>This course introduces students to the basic components of electronics: diodes, transistors, and op amps.  It covers the basic operation and some common applications.</p>
            <ul className="welcome-list">
               <li><span>Inputs</span> - Electrical or mechanical sensors, which take signals from the physical world (in the form of temperature, pressure, etc.) and convert them into electric current and voltage signals.</li>
               <li><span>Signal processing circuits</span> - These consist of electronic components connected together to manipulate, interpret and transform the information contained in the signals.</li>
            </ul>
         </div>
      </div>
        )
    }
}