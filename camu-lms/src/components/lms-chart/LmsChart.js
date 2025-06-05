import React from 'react';
import ReactApexCharts from 'react-apexcharts';



const LmsChart = (props) => {
    return (
        <div>
           <ReactApexCharts options={props.options} series={props.series} type={props.type} />
        </div>
    );
}

export default LmsChart;