import React, { lazy } from 'react';
import '../../styles/_exportContentStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { ArrowLeft, Download ,AlertOctagon,X} from 'react-feather';
import ProgressBar from '../progressbar/Progressbar';
const Button = lazy(() =>
    import('../button/Button')
);

const ExportContentComponent = () => {

    return (
        <div>
        <div className="export-container">
           <div className="export-header_box">
              <div className="export-header">
                 <ArrowLeft className="svg-icon_large icon-dark icon-pointer" />
                 <p className="export-head_label">Export content</p>
              </div>
           </div>
           <div className="export-container_box">
              <div className="export-start_box">
                 <div className="export-cont_box">
                    <div className="start-export">
                       <p className="start-export_label">Export</p>
                       <p className="start-cont_label">Some detail about what will be exported and what will not be exported</p>
                    </div>
                    <Button theme="btn-rounded default " >Start exporting</Button>
                 </div>
                 <div className="progress-view_box">
                    <ProgressBar studentProgressBar={true} widthprog={30} progressBarTheme="progress-bar_content " />
                    <p className="progress-view_label">The export process has started. This can take awhile for large courses. You can wait or leave the page and come back again.</p>
                 </div>
                 <div className="progress-view_error">
                    <div className="progress-error_cont">
                       <AlertOctagon className="svg-icon_small icon-error"/>
                       <p className="error-report_cont">There was an error exporting your content.</p>
                    </div>
                    <div className="progress-retry_cont">
                       <p className="report-retry_label">Retry exporting</p>
                       <X className="svg-icon_light icon-default icon-pointer"/>
                    </div>
                 </div>
              </div>
              <div className="recent-exports_table">
                 <p className="exports-table_label">Recent exports</p>
                 <div className="exports-table_box">
                    <table class="table table-cont student-grades_table">
                       <thead class="thead-list">
                          <tr>
                             <th class="sortable">Exported file</th>
                             <th class="sortable">Created on</th>
                             <th class="sortable">File size</th>
                             <th class="sortable">Auto delete in</th>
                             <th></th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr>
                             <td >Coursename-12-07-2022,11:35PM.zip</td>
                             <td >12-07-2022,11:35PM</td>
                             <td >32MB</td>
                             <td >48:00hrs</td>
                             <td >
                                <Download className="svg-icon_light icon-dark icon-pointer icon-right_side" />
                             </td>
                          </tr>
                          <tr>
                             <td >Coursename-12-07-2022,11:35PM.zip</td>
                             <td >12-07-2022,11:35PM</td>
                             <td >32MB</td>
                             <td >48:00hrs</td>
                             <td >
                                <Download className="svg-icon_light icon-dark icon-pointer icon-right_side" />
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
     </div>
    )

}

export default ExportContentComponent;