import React, {useState} from 'react';
import { Info } from 'react-feather';
import '../../styles/_analyticsStyle.scss';
import LmsChart from '../lms-chart/LmsChart';
import LmsSelectDropDown from '../lms-selectdropdown/LmsSelectDropDown';
import '../../styles/_commonLmsStyle.scss';
import FullViewModal from '../modal/FullViewModal';


 const AnalyticsComponent =()=>{
const [analyticsModal,setAnalyticsModal] = useState(false);
    
   const state = {
        options: {
          chart: {
            id: "basic-bar"
          },
          xaxis: {
            categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
          }
        },
        series: [
          {
            name: "series-1",
            data: [30, 40, 45, 50, 49, 60, 70, 91]
          }
        ]
      };


      const lineChart = {
          
        series: [{
            name: "Desktops",
            data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
        }],
        options: {
          chart: {
            height: 350,
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'straight'
          },
          title: {
            text: 'Product Trends by Month',
            align: 'left'
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
              opacity: 0.5
            },
          },
          xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
          }
        },
      
      
      };



     const barChart = {
          
        series: [{
          name: 'Servings',
          data: [44, 55, 41, 67, 22, 43, 21, 33, 45, 31, 87, 65, 35]
        }],
        options: {
          annotations: {
            points: [{
              x: 'Brans',
              seriesIndex: 0,
              label: {
                borderColor: '#775DD0',
                offsetY: 0,
                style: {
                  color: '#fff',
                  background: '#775DD0',
                },
                text: 'Brans are good',
              }
            }]
          },
          chart: {
            height: 350,
            type: 'bar',
          },
          plotOptions: {
            bar: {
              borderRadius: 10,
              columnWidth: '50%',
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            width: 2
          },
          
          grid: {
            row: {
              colors: ['#fff', '#f2f2f2']
            }
          },
          xaxis: {
            labels: {
              rotate: -45
            },
            categories: ['Frank', 'Jack', 'Lisa', 'Ramely', 'Bran', 'Stran',
              'Elan', 'Clara', 'Cyara', 'Arvind', 'Smith', 'Peter', 'Harry'
            ],
            tickPlacement: 'on'
          },
          yaxis: {
            title: {
              text: 'Servings',
            },
          },
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'light',
              type: "horizontal",
              shadeIntensity: 0.25,
              gradientToColors: undefined,
              inverseColors: true,
              opacityFrom: 0.85,
              opacityTo: 0.85,
              stops: [50, 0, 100]
            },
          }
        },
      
      
      };


      const heatMap = {
          
        series: [{
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
        }, {
          name: 'Revenue',
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
        }, {
          name: 'Free Cash Flow',
          data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
        }],
        options: {
          chart: {
            type: 'bar',
            height: 350
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '55%',
              endingShape: 'rounded'
            },
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
          },
          xaxis: {
            categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          },
          yaxis: {
            title: {
              text: '$ (thousands)'
            }
          },
          fill: {
            opacity: 1
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return "$ " + val + " thousands"
              }
            }
          }
        },
      
      
      };
            return(
              <div>
              {/* 
              <CourseHeader />
              */}
              <div className="Analytics-heading">
                 <div className="cont-nav">
                    <div className="course-name">
                       <h6>Analytics</h6>
                       <p>Set up a course, add course content, and much more.</p>
                    </div>
                 </div>
              </div>
              <div className="analytics-selection">
                 <div className="analytics-group">
                    <LmsSelectDropDown className="dropdown-border drop-down_arrow" />
                 </div>
                 <div className="analytics-month">
                    <LmsSelectDropDown className="dropdown-border drop-down_arrow" />
                 </div>
                 <div className="analytics-chapter">
                    <LmsSelectDropDown className="dropdown-border drop-down_arrow" />
                 </div>
              </div>
              <div className="analytics-content">
                 <div className="analytics-content_dashboard">
                    <p className="analytics-head_label">LIVE INSIGHT <span className="analytics-span_label">View all students</span></p>
                    <div className="analytics-dashboard_box">
                       <div className="dashboard-box_list">
                          <p className="dashboard-time_label">5h 34m</p>
                          <p className="dashboard-days_label">
                             Avg time per day 
                             <span>
                                <Info className="svg-icon_extra-small icon-default icon-space_right"/>
                             </span>
                          </p>
                       </div>
                       <div className="dashboard-box_list">
                          <p className="dashboard-time_label">34m</p>
                          <p className="dashboard-days_label">
                             Time spent per session 
                             <span>
                                <Info className="svg-icon_extra-small icon-default icon-space_right"/>
                             </span>
                          </p>
                       </div>
                       <div className="dashboard-box_list">
                          <p className="dashboard-time_label">16h 34m</p>
                          <p className="dashboard-days_label">
                             Total time spent per student 
                             <span>
                                <Info className="svg-icon_extra-small icon-default icon-space_right"/>
                             </span>
                          </p>
                       </div>
                       <div className="dashboard-box_list">
                          <p className="dashboard-time_label">34</p>
                          <p className="dashboard-days_label">
                             Avg session per day 
                             <span>
                                <Info className="svg-icon_extra-small icon-default icon-space_right"/>
                             </span>
                          </p>
                       </div>
                    </div>
                 </div>
                 <div className="analytics-chart_dashboard">
                    <div className="row m-0">
                       <div className="col-6 p-0">
                          <div className="analytics-box_left">
                             <p className="analytics-head_label">OVERALL PROGRESS <span className="analytics-span_label">View all students</span></p>
                             <div className="chart-content_box">
                                <LmsChart options={state.options}series={state.series} type="bar"/>
                             </div>
                          </div>
                       </div>
                       <div className="col-6 p-0">
                          <div className="analytics-box_right">
                             <p className="analytics-head_label">ACTIVE STUDENT BY HOUR </p>
                             <div className="chart-content_box">
                                <LmsChart options={lineChart.options}series={lineChart.series} type="line"/>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="analytics-chart_dashboard">
                 <p className="analytics-head_label">ASSIGNMENT STATUS</p>
                    <table class="table table-cont student-grades_table">
                       <thead class="thead-list">
                          <tr>
                             <th class="sortable">Due date</th>
                             <th class="sortable">Title</th>
                             <th class="sortable">Assigned</th>
                             <th class="sortable">viewed</th>
                             <th class="sortable">Submitted</th>
                             <th class="sortable">Submitted late</th>
                             <th class="sortable">Missed</th>
                             <th class="sortable">Avg score </th>
                             <th class="sortable">Avg completion time</th>
                          </tr>
                       </thead>
                       <tbody>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td  onClick={()=>setAnalyticsModal(true)} className="assignment-view_modal">Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td onClick={()=>setAnalyticsModal(true)} className="assignment-view_modal">Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td onClick={()=>setAnalyticsModal(true)} className="assignment-view_modal">Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td onClick={()=>setAnalyticsModal(true)} className="assignment-view_modal">Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td onClick={()=>setAnalyticsModal(true)} className="assignment-view_modal">Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td >Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td >Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                          <tr>
                             <td >Jan 27, 6:30pm</td>
                             <td >Assignment title</td>
                             <td >50</td>
                             <td >25</td>
                             <td >15</td>
                             <td >7</td>
                             <td >3</td>
                             <td >45/100</td>
                             <td >34m 29s</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
                 <div className="analytics-chart_dashboard">
                    <div className="row m-0">
                       <div className="col-12 p-0">
                          <div className="analytics-box">
                             <p className="analytics-head_label">ACTIVE STUDENT BY DATE</p>
                             <div className="chart-content_box">
                                <LmsChart options={barChart.options}series={barChart.series} type="bar"/>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="analytics-chart_dashboard">
                    <div className="row m-0">
                       <div className="col-12 p-0">
                          <div className="analytics-box">
                             <p className="analytics-head_label">WEEK TREND</p>
                             <div className="chart-content_box">
                                <LmsChart options={heatMap.options}series={heatMap.series} type="bar"/>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
              {analyticsModal && <FullViewModal open={analyticsModal} onClose={()=>setAnalyticsModal(false)} center={true} isAnalytics={true}/>}
           </div>
        
    )

}

export default AnalyticsComponent;