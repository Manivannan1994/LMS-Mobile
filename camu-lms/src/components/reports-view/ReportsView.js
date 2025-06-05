import React, { Component ,lazy} from 'react';
import { withTranslation } from "react-i18next";
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import '../../styles/_reportsviewStyle.scss';
import Button from '../button/Button';
import LmsCommonService from '../../service/lms-service';
import messageUtil from '../../utils/message-util';
import helper from '../../utils/helper';
import { updateReportFields, dwnldFailedGrade, createReportQueue, getReportQueues,dwnldEngageTrackRep, dwnldIntractReport } from '../../store/actions/ReportsActions';
import Table from '../table/Table';
import { Download } from "react-feather";
import ReactDatePicker from '../date-picker/DatePicker';
import moment from 'moment';
import { downloadS3Files } from '../../store/actions/FileUploadAction';
const LmsSelectDropDown = lazy(()=>
    import('../lms-selectdropdown/LmsSelectDropDown')
);

let intervalId = undefined;
export class ReportsViewPageComponent extends Component {

   constructor(props){
      super(props);
      this.state = {
         reportType : '',
         aReportQueues : [],
         frmDt : '',
         toDate : '',
         dateValidation:false,
      };
  }

   componentDidMount() {
      //get the domain values
      const oDomainCodes = {
         codes : ['LMS_REPORT_TYPE'],
     };

     // Set domain code values
     LmsCommonService.getDomainByCode(oDomainCodes, (err, data)=>{
         if(data && data.length){
         for(let cd = data.length - 1; cd >= 0; cd--){
             if(data[cd].code === "LMS_REPORT_TYPE" && data[cd].ccodes && data[cd].ccodes.length){
               let aCpyReports = [{
                     text : "Select"
               }];
               aCpyReports = aCpyReports.concat(data[cd].ccodes);
               this.props.updateReportFields('aLMSReports', aCpyReports);
             }
         }
         }
     });  

     this.getReports();

     intervalId = setInterval(() => {
         this.getReports();
      }, 1000 * 30);

      // Table contents

      this.aReportColumns = [
         {
            id: "RefNm",
            Header: this.props.t("translate:REPORT_TYPE"),
            accessor: "RefNm",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <>
                     {row.original.RefNm}
                  </>
               );
            },
         },
         {
            id: "CrAt",
            Header: this.props.t("translate:CREATED_ON"),
            accessor: "CrAt",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <>
                     {row.original.CrAt}
                  </>
               );
            },
         },
         {
            id: "autoDlt",
            Header: this.props.t("translate:AUTO_DELETE_IN"),
            accessor: "autoDlt",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <>
                     {row.original.autoDlt}
                  </>
               );
            },
         },
         {
            id: "Status",
            Header: this.props.t("translate:STATUS"),
            accessor: "Status",
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <div>
                     {
                        row.original.Status === 'P' ?
                        <div className="report-pending_text">{this.props.t("translate:PENDING")}</div>
                        : 
                        row.original.Status === 'I' ?
                        <div className="report-in-progress_text">{this.props.t("translate:IN_PROGRESS")}</div>
                        :
                        row.original.Status === 'C' ?
                        <div className="report-completed_text">{this.props.t("translate:COMPLETED")}</div>
                        :
                        <div className="report-error_text">{this.props.t("translate:ERROR")}</div>
                     }
                  </div>
               );
            },
         },
         {
            id: "url",
            Header: '',
            accessor: "url",
            disableSortBy: true,
            sortType: "basic",
            Cell: ({ row }) => {
               return (
                  <>
                  {
                     row.original.Status && row.original.Status === 'C' &&
                     <span style={{ cursor: "pointer" }} onClick={() => {downloadS3Files({url: row.original.url})}} className="notification-file_download">
                        <Download className="svg-icon_small icon-dark icon-pointer" />
                     </span>
                  }
                  </>
               );
            },
         }
      ];
   }

   componentWillUnmount() {
      // Remove the interval
      if(intervalId){
         clearInterval(intervalId);
      }
   }

   repCallback = (data) => {
      if (data && data.length) {
         this.setState({ aReportQueues : data });
      }
   }

   getReports = () => {
      const oDwnldReq = {
         PrID: this.props.location.state.PrID,
         CrID: this.props.location.state.CrID,
         DeptID: this.props.location.state.DeptID,
         SemID: this.props.location.state.SemID,
         AcYr: this.props.location.state.AcYr,
         SecID: this.props.location.state.SecID,
         subjId: this.props.location.state.subId
      };
      this.props.getReportQueues(oDwnldReq, this.repCallback);
   }

   // Set Report type
   setReportType = (event) => {
      this.setState({ reportType : event.target.value });
   }

   dwnldCallback = (err, data) => {
      if(err && err.status && err.status == 500){
         messageUtil.showError("UNKNOWN_ERROR", false);
      }else{
         helper.dwnldExcelFileWithName(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 'Failed Students Report');
      }
   };

   dwnldIntractCallback = (err, data) => {
      if(err && err.status && err.status == 500){
         messageUtil.showError("UNKNOWN_ERROR", false);
      }else{
         helper.dwnldExcelFileWithName(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 'Course Interaction Report');
      }
   }
   engTrackCalback = (err, data) => {
      if(err && err.status && err.status == 500){
         messageUtil.showError("UNKNOWN_ERROR", false);
      }else{
         helper.dwnldExcelFileWithName(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 'Engagement Tracking Report');
      }
   };

   resRepQue = (data) => {
      if(data){
        this.getReports();
      }
   }

   // Download report
   downloadReport = () => {
      if(this.state.reportType){
         if(this.state.reportType === 'FAIL_STUD_REP'){
            const oDwnldReq = {
                  PrID: this.props.location.state.PrID,
                  CrID: this.props.location.state.CrID,
                  DeptID: this.props.location.state.DeptID,
                  SemID: this.props.location.state.SemID,
                  AcYr: this.props.location.state.AcYr,
                  SecID: this.props.location.state.SecID,
                  subjId: this.props.location.state.subId,
                  TPID : this.props.location.state.TPID
            };
            this.props.dwnldFailedGrade(oDwnldReq, this.dwnldCallback);
         }else if(this.state.reportType === 'STUD_ENGAGE_REP'){
            const oDwnldReq = {
                  PrID: this.props.location.state.PrID,
                  CrID: this.props.location.state.CrID,
                  DeptID: this.props.location.state.DeptID,
                  SemID: this.props.location.state.SemID,
                  AcYr: this.props.location.state.AcYr,
                  SecID: this.props.location.state.SecID,
                  subjId: this.props.location.state.subId,
                  frmDt : this.state.frmDt,
                  toDate : this.state.toDate
            };
            let dateErr = false;
            if(this.state.frmDt || this.state.toDate){
               if(this.state.frmDt.length === 0 || this.state.toDate.length === 0){
                  messageUtil.showInfo("BOTH_DATE_EXISTS_INFO", true);
                  dateErr = true;
               }
               if(this.state.frmDt && this.state.toDate){
                  let frmDat = moment(this.state.frmDt).format("YYYY-MM-DD");
                  let toDat = moment(this.state.toDate).format("YYYY-MM-DD");
                  if(moment(toDat).unix() < moment(frmDat).unix()){
                     messageUtil.showInfo("DATE_INFO", true);
                     dateErr = true;
                  }
               }
            }
            if(dateErr){
               return;
            }else{
               this.props.createReportQueue(oDwnldReq, this.resRepQue);
            }
         }else if(this.state.reportType === 'ENGAGE_INTRACT_REP'){
            const oDwnldReq = {
                  PrID: this.props.location.state.PrID,
                  CrID: this.props.location.state.CrID,
                  DeptID: this.props.location.state.DeptID,
                  SemID: this.props.location.state.SemID,
                  AcYr: this.props.location.state.AcYr,
                  SecID: this.props.location.state.SecID,
                  subjId: this.props.location.state.subId,
                  TPID : this.props.location.state.TPID,
                  frmDt : this.state.frmDt,
                  toDate : this.state.toDate
            };
            if(this.state.frmDt === "" || this.state.toDate ===""){
               this.setState({...this.state,dateValidation:true})
            }else{
            this.props.dwnldIntractReport(oDwnldReq, this.dwnldIntractCallback);
            this.setState({...this.state,dateValidation:false})
            }
         }else if(this.state.reportType === 'ENGAGE_TRACK_REP'){
            const oDwnldReq = {
               PrID: this.props.location.state.PrID,
               CrID: this.props.location.state.CrID,
               DeptID: this.props.location.state.DeptID,
               SemID: this.props.location.state.SemID,
               AcYr: this.props.location.state.AcYr,
               SecID: this.props.location.state.SecID,
               subjId: this.props.location.state.subId,
               TPID : this.props.location.state.TPID
            };
            this.props.dwnldEngageTrackRep(oDwnldReq, this.engTrackCalback);
         }
      }
   }

   // Disable report
   disableReport = () => {
      if(this.state.reportType && this.state.reportType.length){
         return false;
      }else{
         return true;
      }
   }

    render() {
        return (
            <div>
            <div className="report-view_container">
               <div className="report-heading">
                  <div className="report-nav">
                     <div className="report-name">
                        <h6>{this.props.t("translate:REPORTS")}</h6>
                        <p>{this.props.t("translate:REPORT_PAGE_DESC")}</p>
                     </div>
                  </div>
               </div>
               <div className="report-view_list">
                  <p className="report-type_label">{this.props.t("translate:REPORT_TYPE")}</p>
                  <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={this.state.reportType} defaultDisabled={false} 
                     dropDown={this.props.aLMSReports} keyTag="code" nameTag="text" onChange = {(event) => this.setReportType(event)}/>
                     {
                        this.state.reportType && (this.state.reportType === "STUD_ENGAGE_REP" || this.state.reportType === "ENGAGE_INTRACT_REP") &&
                       <div key={this.state.reportType}>
                          <div className="duration-time">
                             <p className="report-type_label date_label">{this.props.t("translate:FROM_DATE")}</p>
                             <p className="report-type_label date_label date_space">{this.props.t("translate:TO_DATE")}</p>
                          </div>
                          <div className="duration-time no_margin">
                             <ReactDatePicker closeOnSelect={true}  className="date-picker calendar_icon" closeOnSelect dateFormat="DD-MMM-YYYY" timeFormat={false} inputProps={{ placeholder: "DD-MMM-YYYY" }} 
                             isValidDate={(d) => {
                              if(this.state.toDate){
                                 return new Date(d) <= new Date(this.state.toDate)
                              }else{
                                 return new Date(d) <= new Date()
                              }
                             } }
                             value={this.state.asDuDt} 
                             onChange={(event) => {
                                if (event) {
                                   this.setState({ frmDt: event })
                                }
                             }} />
                             <ReactDatePicker closeOnSelect={true}  className="date-picker calendar_icon date_space" closeOnSelect dateFormat="DD-MMM-YYYY" timeFormat={false} inputProps={{ placeholder: "DD-MMM-YYYY" }} 
                             isValidDate={(d) => {
                              if(this.state.reportType === "ENGAGE_INTRACT_REP"){
                                 return new Date(d) <= new Date()
                              }else{
                              return new Date(d) >= new Date(this.state.frmDt)
                              }}}
                             value={this.state.asDuDt} 
                             onChange={(event) => {
                                if (event) {
                                   this.setState({ toDate: event })
                                }
                             }} />
                          </div>
                          {(!this.state.frmDt || !this.state.toDate) && this.state.dateValidation &&
                          <span className="report-error_text" >From and To date is mandaroty.</span>
                          }
                        </div>
                          
                     }
                    
                  <div className="download-report_btn">
                     <Button theme="btn-rounded default" clicked = {()=> this.downloadReport()}>{this.props.t("translate:DOWNLOAD_REPORT")}</Button>
                  </div>
               </div>
                 {
                    this.state.aReportQueues && this.state.aReportQueues.length ?
                       <div className="report-view_list">
                          <p className="report-view_batch">{this.props.t("translate:BATCH_REPORTS")}</p>
                          <div className="table-list_container">
                             <Table data={this.state.aReportQueues} columns={this.aReportColumns} defaultSortBy="CrAt" sortDesc = "true"/>
                          </div>
                       </div>
                       : ''
                  }
            </div>
         </div>
        )
    }
}

// To get the reducers values
const mapStateToProps = (state) => ({
   ...state.ReportsReducer
});

const mapDispatchToProps = {
   dwnldEngageTrackRep,
   updateReportFields,
   dwnldFailedGrade,
   createReportQueue,
   getReportQueues,
   dwnldIntractReport
};

const TabNavigator = (props) => <ReportsViewPageComponent {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);

export default withTranslation()(withRouter(Components));





