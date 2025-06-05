import React ,{ Component, lazy } from 'react';
import '../../styles/_calendarStyle.scss';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AnalyticsService from '../../service/analytics-service';
import UserSession from '../../utils/UserSession';
const StudentWrapper =  lazy(() =>
   import('../student-wrapper/StudentWrapper')
);
const AnalyticsWrapper = lazy(() =>
   import('../analytics-wrapper/AnalyticsWrapper')
);
const localizer = momentLocalizer(moment);

// Define the content of time slot

const timeSlotContent = (event) => { 
    return ( 
        <div>
            {event.event.isHolOrEv ? (
                <div>{event.event.Name} </div> 
            ) : (
                <div className = "sch-slot">
                    <div className = "sch_time">{event.event.time}</div> 
                    <div>{event.event.DePID} - {event.event.subCd}</div> 
                </div>
            )}
        </div>
    ) 
}
export class CalendarComponent extends Component{
    constructor(props) {
    super(props);
        this.state = {
            name: 'React',
            view : 'week',
            aScrollTimes : []
        };
        this.acalValues = [];
        this.splitDate = [] ;
        this.aFrTime = [];  // From time in time table
        this.setCalendar(this.props);
        AnalyticsService.setCurrPage('OVR_ALL_SCHDL');
    }



    setCalendar = (props) => {
        this.splitDate = [] ;
        this.aFrTime = [];
        if(props.calValues && props.calValues.aSchedules && props.calValues.aSchedules.length){
            this.acalValues = [];
            for(let cal = props.calValues.aSchedules.length - 1; cal >= 0; cal--){
                let oCal = {};
                if(!props.calValues.aSchedules[cal].isHolOrEv && !props.calValues.aSchedules[cal].isNosch){
                    props.calValues.aSchedules[cal].start = moment(props.calValues.aSchedules[cal].start);
                    props.calValues.aSchedules[cal].end = moment(props.calValues.aSchedules[cal].end);
                    oCal = {
                        time         : props.calValues.aSchedules[cal].forFrmTm+" - "+props.calValues.aSchedules[cal].forToTm,
                        start        : new Date(props.calValues.aSchedules[cal].start.year(), props.calValues.aSchedules[cal].start.month(), props.calValues.aSchedules[cal].start.date(), props.calValues.aSchedules[cal].start.hour(), props.calValues.aSchedules[cal].start.minute(), 0, 0),
                        end          : new Date(props.calValues.aSchedules[cal].end.year(), props.calValues.aSchedules[cal].end.month(), props.calValues.aSchedules[cal].end.date(), props.calValues.aSchedules[cal].end.hour(), props.calValues.aSchedules[cal].end.minute(), 0, 0),
                        depColor     : props.calValues.aSchedules[cal].depColor,
                        depTextColor : props.calValues.aSchedules[cal].depTextColor,
                        subCd        : props.calValues.aSchedules[cal].subCd,    
                        InId         : props.calValues.aSchedules[cal].InId,
                        PrID         : props.calValues.aSchedules[cal].PrID,
                        CrID         : props.calValues.aSchedules[cal].CrID,
                        DeptID       : props.calValues.aSchedules[cal].DeptID,
                        AcYr         : props.calValues.aSchedules[cal].AcYr,
                        SemID        : props.calValues.aSchedules[cal].SemID,
                        SecID        : props.calValues.aSchedules[cal].SecID,
                        FacID        : props.calValues.aSchedules[cal].FacID,
                        SubID        : props.calValues.aSchedules[cal].SubID,
                        DePID        : props.calValues.aSchedules[cal].DePID,
                        acyrNm       : props.calValues.aSchedules[cal].acyrNm,
                        crsNm        : props.calValues.aSchedules[cal].crsNm,
                        prgNm        : props.calValues.aSchedules[cal].prgNm,
                        secNm        : props.calValues.aSchedules[cal].secNm,
                        semNm        : props.calValues.aSchedules[cal].semNm,
                        subNm        : props.calValues.aSchedules[cal].subNm
                    };
                    this.acalValues.push(oCal);
                    if (props.calValues.aSchedules[cal].FrTime) {
                        this.aFrTime.push(props.calValues.aSchedules[cal].FrTime);
                    }
                }else{
                    if(props.calValues.aSchedules[cal].isHolOrEv && !props.calValues.aSchedules[cal].isAsgn){
                        props.calValues.aSchedules[cal].HldDtFrom = moment(props.calValues.aSchedules[cal].HldDtFrom).utc();
                        props.calValues.aSchedules[cal].HldDtTo = moment(props.calValues.aSchedules[cal].HldDtTo).utc();
                        oCal = {
                            depColor     : props.calValues.aSchedules[cal].depColor,
                            Name         : props.calValues.aSchedules[cal].Name,
                            isHolOrEv    : props.calValues.aSchedules[cal].isHolOrEv,
                            start        : new Date(props.calValues.aSchedules[cal].HldDtFrom.year(), props.calValues.aSchedules[cal].HldDtFrom.month(), props.calValues.aSchedules[cal].HldDtFrom.date(), 0, 0, 0, 0),
                            end          : new Date(props.calValues.aSchedules[cal].HldDtTo.year(), props.calValues.aSchedules[cal].HldDtTo.month(), props.calValues.aSchedules[cal].HldDtTo.date(), 0, 0, 0, 0)
                        };
                        this.acalValues.push(oCal);
                    }
                }
            }
            this.setState({acalValues : this.acalValues});
        }
    }
   
    componentWillReceiveProps(NextToProps){
        this.setCalendar(NextToProps);
    }
   
    // Auto scrolling the current date period
    scrollTimeHandler = () => {
        if (this.splitDate && this.splitDate.length === 0) {
            if (this.aFrTime && this.aFrTime.length) {
                this.splitDate = this.aFrTime.sort();
                this.splitDate = this.splitDate[0].split(':').map(i => Number(i));
                this.setState({ ...this.state, aScrollTimes: this.splitDate });
            }
        }
        return this.state.aScrollTimes[0] || 10;
    }

    // when select the schedule, it will nevigate to the course schedule
    onSelectSchedule = (oSchdlEvent) => {
        const oSchdlEvt = {};
        oSchdlEvt.isCrWsScdl = true;
        oSchdlEvt.subNa      = oSchdlEvent.subNm;
        oSchdlEvt.SemName    = oSchdlEvent.semNm;
        oSchdlEvt.AcYrNm     = oSchdlEvent.acyrNm;
        oSchdlEvt.CrName     = oSchdlEvent.crsNm;
        oSchdlEvt.SecName    = oSchdlEvent.secNm;
        oSchdlEvt.InId       = oSchdlEvent.InId;
        oSchdlEvt.PrID       = oSchdlEvent.PrID;
        oSchdlEvt.CrID       = oSchdlEvent.CrID;
        oSchdlEvt.DeptID     = oSchdlEvent.DeptID;
        oSchdlEvt.AcYr       = oSchdlEvent.AcYr;
        oSchdlEvt.SemID      = oSchdlEvent.SemID;
        oSchdlEvt.SecID      = oSchdlEvent.SecID;
        oSchdlEvt.subId      = oSchdlEvent.SubID;
        oSchdlEvt.StaffId    = this.props.calValues.session.mappedid;
        oSchdlEvt.selectDate = oSchdlEvent.start;
        oSchdlEvt.stuId = UserSession.getSession()?.stuId || "";
        oSchdlEvt.utype = UserSession.getSession()?.utype || "";
        this.props.calValues.history.push({pathname:"/home-page/schedule-page", state : oSchdlEvt});
    }

    eventStyleGetter = (event, start, end, isSelected) => {
        const style = {
            backgroundColor: event.depColor,
            opacity: 1,
            color: '#091E42',
            border: !event.isHolOrEv ? '0px' : '',
            borderTop: event.isHolOrEv ? 'solid 4px #469B1F' : 'solid 4px '+event.depTextColor
        };
        return {
            style: style
        };
    }
    // Show toolTip for celender
    toolTip = (event) => {
        if (event.isHolOrEv) {
            return event.Name;
        } else {
            return event.DePID + " - " + event.subNm;
        }
    }

    render(){
        return(
            <div>
                <div className="schedule-calender_box" style={{ height: '60rem'}}>
                    <Calendar
                        events={this.acalValues}
                        views={['week']}
                        tooltipAccessor={(this.toolTip)}
                        view={this.state.view}
                        startAccessor="start"
                        endAccessor="end"
                        dateFormat="h t"
                        date={this.props.schdlDate}
                        onNavigate={date => {
                            this.setState({ selectedDate: this.props.schdlDate });
                          }}
                        localizer={localizer}
                        dayLayoutAlgorithm="no-overlap"
                        defaultView='week'
                        eventPropGetter={(this.eventStyleGetter)}
                        components={{
                            event: timeSlotContent
                        }}
                        scrollToTime={moment()
                            .set({ h: this.scrollTimeHandler(), m: 0 })
                            .toDate()}
                        onSelectEvent={event => {this.onSelectSchedule(event)}}
                    />
                </div>
                <StudentWrapper>
                  <AnalyticsWrapper></AnalyticsWrapper>
                </StudentWrapper>
            </div>
        )
    }
}