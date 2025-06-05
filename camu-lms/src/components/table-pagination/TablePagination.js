import React ,{ Component, lazy } from 'react';
import '../../styles/_tablePagination.scss';
import { ChevronDown, ChevronLeft, ChevronRight } from 'react-feather';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';

const LmsSelectDropDown =  lazy(() =>
   import("../lms-selectdropdown/LmsSelectDropDown")
);
class TablePaginationComponent extends Component{

   constructor(props) {
      super(props);
      this.pagState = {
         pageSize : 30,    // Page size or limit
         pageNo   : 1,     // Page number
         minPg    : '',    // minimum page no
         maxPg    : ''     // maximum page no
      };
   }

   componentWillReceiveProps(NextToProps){
      if(this.props.aPages && this.props.aPages.length){
         this.pagState.minPg = this.props.aPages[0].pageNo;
         this.pagState.maxPg = this.props.aPages[this.props.aPages.length - 1].pageNo;
      }
   }

   // Load the initial page values

   componentDidMount(){
      this.props.pageCallback(this.pagState);
   }

   // Go to previous page items

   goToPrevious = () => {
      if((this.pagState.pageNo - 1) >= this.pagState.minPg){
         this.pagState.pageNo -= 1;
         this.props.pageCallback(this.pagState);
      }
   }

   // Go to next page items

   goToNext = () => {
      if((this.pagState.pageNo + 1) <= this.pagState.maxPg){
         this.pagState.pageNo += 1;
         this.props.pageCallback(this.pagState);
      }
   }

   // Go to selected page items

   goToSelectedPage = (event) => {
      this.pagState.pageNo = parseInt(event.target.value);
      this.props.pageCallback(this.pagState);
   }

   render(){
      return(
         <div>
            {this.props.pageData && this.props.pageData.length>0 &&
               <div className="pagination-table">
                  <div className="pagination-table_content">
                     <p className="table-page_name">{this.props.t("translate:PAGE")}</p>
                     <LmsSelectDropDown className='dropdown-default drop-down_arrow' value = {this.pagState.pageNo} dropDown = {this.props.aPages} onChange = {(e) => this.goToSelectedPage(e)} keyTag="" nameTag="pageNo">
                        <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                     </LmsSelectDropDown>
                     <p className="table-page_size">{this.props.t("translate:OF")} {this.pagState.maxPg}</p>
                     <div class="pagination-change_left">
                        <ChevronLeft onClick = {() => this.goToPrevious()} className="svg-icon_small icon-dark" />
                     </div>
                     <div class="pagination-change_right">
                        <ChevronRight onClick = {() => this.goToNext()} className="svg-icon_small icon-dark" />
                     </div>
                  </div>
               </div>}
         </div>
      )
   }
}

const TabNavigator = (props) => <TablePaginationComponent {...props} />

const Components = connect()(TabNavigator);

export default withTranslation()(withRouter(Components));