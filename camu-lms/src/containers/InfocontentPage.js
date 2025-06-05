import React,{ Component } from 'react';
import '../styles/_infocontentpageStyle.scss';
import { withTranslation } from "react-i18next";



class InfoContentPageComponent extends Component{
    render(){
        return(
            <div>
            <div className="info-content_box">
               <div className="info-content">
                  <div className="form-group">
                     <label className="label-text">{this.props.t("translate:INFOCONTENT_MODULE_NAMES")}</label>
                     <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter name" />
                  </div>
                  <div className="text-area_box">
                  <label className="label-text">{this.props.t("translate:INFOCONTENT_DESCRIPTION")}</label>
                  <textarea className="textarea-box" placeholder="Remember, be nice!"  rows="8"></textarea>
                  </div>
                
                  <div class="panel-group " id="accordionGroupClosed" role="tablist" aria-multiselectable="true">
                     <div class="panel panel-default">
                        <div class="panel-heading" role="tab" id="headingOne">
                           <a class="collapsed label-cont" role="button" data-toggle="collapse" data-parent="#accordionGroupClosed" href="#collapseCloseOne" aria-expanded="true" aria-controls="collapseCloseOne">
                           {this.props.t("translate:INFOCONTENT_DUE_DATE")}
                           </a>
                        </div>
                        <div id="collapseCloseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne">
                           <div class="panel-body-cont">
                              Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon off
                           </div>
                        </div>
                     </div>
                     <div class="panel panel-default">
                        <div class="panel-heading" role="tab" id="headingTwo">
                           <a class="collapsed label-cont" role="button" data-toggle="collapse" data-parent="#accordionGroupClosed" href="#collapseCloseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        {this.props.t("translate:INFOCONTENT_ASSIGN_TO")}
                           </a>
                        </div>
                        <div id="collapseCloseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                           <div class="panel-body-cont">
                              eggings occaecat craft beer farm-to-table,
                              raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                           </div>
                        </div>
                     </div>
                     <div class="panel panel-default">
                        <div class="panel-heading" role="tab" id="headingTwo">
                           <a class="collapsed label-cont" role="button" data-toggle="collapse" data-parent="#accordionGroupClosed" href="#collapseCloseThree" aria-expanded="false" aria-controls="collapseTwo">
                          {this.props.t("translate:INFOCONTENT_QUIZ_RESTRICTIONS")}
                           </a>
                        </div>
                        <div id="collapseCloseThree" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                           <div class="panel-body-cont">
                              eggings occaecat craft beer farm-to-table,
                              raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
        )
    }
}
export default withTranslation()(InfoContentPageComponent);