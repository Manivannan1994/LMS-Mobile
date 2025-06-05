import React ,{ Component, lazy } from 'react';
import { Columns,MoreVertical,ChevronDown} from 'react-feather';
import '../../styles/_studentGradesStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
import { withRouter } from 'react-router-dom';
import { getGradeBookItems, updateFields } from '../../store/actions/GradeBookActions';
// import { filterArray } from '../../utils/filter-util';
import {lmsDateAndTimeFormat} from '../../utils/helper';
// import NoRecord  from '../../components/error-page/Datanotfound';
import no_grade_book from '../../assets/images/grade-empty.svg';
import LmsCommonService from '../../service/lms-service';
import Table from '../table/Table';
import moment from 'moment';
const NoRecord = lazy(() =>
import('../../components/error-page/Datanotfound')
);
const Searchbox = lazy(() =>
import('../searchbox/Searchbox')
);
const LmsSelectDropDown = lazy(() => import("../lms-selectdropdown/LmsSelectDropDown"));

class StudentGradesComponent extends Component {

    constructor(props){
        super(props);
        this.state = {
            grItmSrch : '',             // search key
            aGradeBookItems : [],
            aPages : [],
            asmCtg : '',
        };
        this.stGrdState = {
            pageVals : {}
        };
        this.gradeBookItemTableColumns = [
            {
                id: "item",
                Header: this.props.t("translate:ITEM"),
                accessor: "title",
                sortType: "basic",
                Cell: ({ row }) => {
                    return (
                        <div className="details-content_box" onClick={()=>this.props.history.push({pathname:'/home-page/assgnmnt-grad', search:`?id=${row.original._id}`, state : this.props.location.state})}>
                            <Columns className="svg-icon_default icon-dark" />
                            <div className="details-content_label">
                                <p className="details-content_heading">{row.original.title}</p>
                                <p className="details-sub_content">
                                {row.original.asmCtg} | {row.original.submtCnt} of {row.original.totStud} {this.props.t("translate:SUBMITTED")}{" "}
                                    {row.original.asgmnt && (row.original.asgmnt.mxMrk != null && !isNaN(row.original.asgmnt.mxMrk)) && (
                                        <span className="table-sub_content">
                                            | {row.original.asgmnt.mxMrk} {this.props.t("translate:PTS")}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: "asDuDt",
                Header: this.props.t("translate:DUE_DATE"),
                sortType: "basic",
                accessor: (row) => moment(row.asDuDt).unix(),
                Cell: ({ row }) => {
                    return (
                        <>{row.original.asDuDt ? lmsDateAndTimeFormat(row.original.asDuDt) : "-"}</>
                    )
                }
            },
            {
                id: "ndGrdCnt",
                Header: this.props.t("translate:NEED_GRADING"),
                accessor: "ndGrdCnt",
                Cell: ({ row }) => {
                    return (
                        <>
                            {row.original.ndGrdCnt ? row.original.ndGrdCnt : ""}
                            {row.original.allGrad ? this.props.t("translate:ALL_GRADED") : ""}
                        </>
                    );
                },
            },
            {
                id: "moreOption",
                Header: '',
                accessor: '',
                Cell: ({ row }) => {
                    return (
                        <>
                            <div>
                            {!this.props.location.state?.isDisabledContent &&
                              <div class="dropdown grade-right_view">
                                    <div class="dropdown-toggle"  aria-haspopup="true" aria-expanded="false" data-toggle="dropdown">
                                      <MoreVertical className="svg-icon_small icon-dark icon-pointer"/>
                                     </div>
                                    <div class="dropdown-menu option-menu_lists">
                                        <p className="grade-options_dropdown" data-toggle="modal" data-target="#grade-page" onClick={() => this.setData(row.original)}>{this.props.t("translate:DOWNLOAD")}</p>
                                        <p className="grade-options_dropdown" data-toggle="modal" data-target="#grade-upload-page" onClick={() => this.setData(row.original)}>{this.props.t("translate:UPLOAD")}</p>
                                    </div>
                              </div>
                            }
                            </div>
                        </>
                    );
                },
            }
        ];
        this.loadPageItems();
    }

    // Set selected assignment data for download reports

    setData = (gradeSelectData) => {
        gradeSelectData.isFrmGrdList = true;
        this.props.updateFields('selectGradeDwnld',gradeSelectData);
    }

    componentDidMount() {
        //get the domain values
        const oDomainCodes = {
            codes : ['ASSGNMNT_CAT'],
        };

        // Set domain code values
        LmsCommonService.getDomainByCode(oDomainCodes, (err, data)=>{
            if(data && data.length){
            for(let cd = data.length - 1; cd >= 0; cd--){
                if(data[cd].code === "ASSGNMNT_CAT" && data[cd].ccodes && data[cd].ccodes.length){
                    let aCpyCat = [{
                        code : "",
                        text : "All"
                    }];
                    aCpyCat = aCpyCat.concat(data[cd].ccodes);
                    this.props.updateFields('aAsgnmCats', aCpyCat);
                }
            }
            }
        });  
    }

    // Used to pass the value to parent from child component
    componentDidUpdate(){
        if(this.props.oGrdBookItems){
            // this.state.aGradeBookItems = this.props.oGrdBookItems.aGrdBkItems;
            this.props.gradItmCompCallback((this.props.oGrdBookItems.aGrdBkItems && this.props.oGrdBookItems.aGrdBkItems.length) ? this.props.oGrdBookItems.aGrdBkItems.length : 0);
        }
    };

    componentWillReceiveProps(NextToProps){
        this.setState({ aGradeBookItems : (NextToProps.oGrdBookItems.aGrdBkItems && NextToProps.oGrdBookItems.aGrdBkItems.length) ? NextToProps.oGrdBookItems.aGrdBkItems : [], aPages : this.props.oGrdBookItems.aPages});
    }
    
    // Gradable Items Filter
    srchGrdBkItms = (event) => {
        this.setState({ grItmSrch : event.target.value }, () => {
            // Update the array based on search key
            if (event.target.value && event.target.value.length < 3) {
                return;
            }
            const oGrdBk = this.props.location.state;
            oGrdBk.grItmSrch = this.state.grItmSrch;
            oGrdBk.pageNo = this.stGrdState.pageVals.pageNo;
            oGrdBk.pageSize = this.stGrdState.pageVals.pageSize;
            if(this.state.asmCtg){
                oGrdBk.asmCtg = this.state.asmCtg;
            }
            this.props.getGradeBookItems(oGrdBk);
        });
    };

    // set assignment category 

    setCatValue = (event) => {
        this.setState({ asmCtg : event.target.value }, () => {
            const oGrdBk = this.props.location.state;
            oGrdBk.grItmSrch = this.state.grItmSrch;
            oGrdBk.pageNo = this.stGrdState.pageVals.pageNo;
            oGrdBk.pageSize = this.stGrdState.pageVals.pageSize;
            oGrdBk.asmCtg = event.target.value;
            this.props.getGradeBookItems(oGrdBk);
        });
    }

    // Go to student assignment grading page

    // goToStudGrading = (oAssgnmntDtls) => {
    //     this.props.history.push({pathname:'/home-page/assgnmnt-grad', search:`?id=${oAssgnmntDtls._id}`, state : this.props.location.state});
    // }

    // Load page based on page values

    loadPageItems = (pageValues) => {
        //this.stGrdState.pageVals = pageValues;
        const oGrdBk = this.props.location.state;
        // oGrdBk.pageNo = pageValues.pageNo;
        // oGrdBk.pageSize = pageValues.pageSize;
        this.props.getGradeBookItems(oGrdBk);
    }

    render () {
        return(
            <div>
                <div className="student-grades_search">
                    <div class="row m-0">
                        <div class="col-6 p-0">
                            <div className="cont-search-box">
                                <Searchbox 
                                    value = {this.state.grItmSrch}
                                    placeholder = {this.props.t("translate:SEARCH_ITEMS")}
                                    onChange = {(event) =>
                                        this.srchGrdBkItms(event)
                                    }
                                    searchBoxTheme="search-default search-box_default search-outline" />
                            </div>
                        </div>
                        <div class="col-6 p-0">
                            <div className="student-grade_dropdown">
                            {/* <LmsSelectDropDown className="dropdown-border drop-down_arrow" value={this.state.asmCtg} defaultDisabled={false} onChange={this.asignMntCategoryChange} 
                           dropDown={this.state.aCategory} keyTag="code" nameTag="text"/> */}
                                <LmsSelectDropDown className="dropdown-default drop-down_arrow" value={this.state.asmCtg} defaultDisabled={false} 
                                    dropDown={this.props.aAsgnmCats} keyTag="code" nameTag="text" onChange = {(event) =>
                                        this.setCatValue(event)
                                    }>
                                   <ChevronDown className="svg-icon_small close-icon-network icon-dark" />
                                </LmsSelectDropDown>
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.aGradeBookItems && this.state.aGradeBookItems.length>0 ? (
                    <div className="table-list_container">
                        <Table data={this.state.aGradeBookItems} columns={this.gradeBookItemTableColumns} defaultSortBy="item" sortDesc={false} onRowClick={this.goToStudGrading}/>
                    </div>
                ) : <NoRecord img={no_grade_book} imgSize="no-data_img-default" gradBkContent={true}/>}
            </div>
        )
    }
}

// To get the reducers values
const mapStateToProps = (state) => ({
    // ...state.contentReducer,
    // ...state.dashboardReducer,
    // ...state.headerReducer,
    ...state.gradeBookReducer
});
 
const mapDispatchToProps = {
    getGradeBookItems,
    updateFields
};
 
const TabNavigator = (props) => <StudentGradesComponent {...props} />
 
const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator);
 
export default withTranslation()(withRouter(Components));
 