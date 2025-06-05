import React ,{ lazy,useState, useEffect} from 'react';
import '../../styles/_studentTablesStyle.scss';
import {useLocation,useHistory} from 'react-router-dom';
// import {useHistory} from 'react-router-dom';
import UserSession from '../../utils/UserSession';
import { connect } from 'react-redux';
import {getTheGradingStuds,updateFields} from '../../store/actions/GradeBookActions';
import { withTranslation } from 'react-i18next';
import { generateHexDecCode} from '../../utils/helper';
// import { filterArray } from '../../utils/filter-util';
import no_stud_table from '../../assets/images/studGroup.svg';
import Table from '../table/Table';

// import StudentNameComponent from '../student-name/StudentName';
const StudentNameComponent = lazy(()=>
import('../student-name/StudentName') 
);
const Searchbox = lazy(()=>
import('../searchbox/Searchbox')
);
const NoRecord = lazy(()=>
import('../../components/error-page/Datanotfound')
);




const StudentTablesComponent =(props)=>{
 
   const location=useLocation();
   const history=useHistory();
   const [studSearch, setStudSearch] = useState('');
   const oReq={
      "SecID": location.state.SecID,
      "AcYr":  location.state.AcYr,
      "InId":  location.state.InId,
      "DeptID":location.state.DeptID,
      "PrID":  location.state.PrID,
      "CrID":  location.state.CrID,
      "SemID": location.state.SemID,
      "SubID": location.state.subId,
      "getStuds": true,
      "OID":   location.state.InId,
      "StaffID":location.state.StaffId,
      "isFE": UserSession.getSession().fe ? true:false,
      "isFrmLms" :true
   }
   
   useEffect(() => {
      loadPageItems();
   }, []);
   const studentTableColumns = React.useMemo(
      () => [
         {
            id: "PhotoImgID",
            accessor: "FNa",
            disableSortBy: true,
            Cell: ({ row }) => {
                return (
                  <>
                     {row.original.PhotoImgID && row.original.PhotoImgID.length>0 ? 
                        <><img src={'/Image/getImage/' + row.original.PhotoImgID} alt="img" className="stud-img_list"/></>
                        :<><StudentNameComponent className="student-name_icon" fName={row.original.FNa.substring(0, 1)} clrCode={generateHexDecCode(row.original.StuID)}/></>
                     }
                  </>
               );
            },
            sortType: "basic"
        },
        {
         id: "FNa",
         Header: props.t("translate:FIRST_NAME"),
         accessor: "FNa",
         Cell: ({ row }) => {
            return (
               <>
                     <><span className='stud-grad_name'>{row.original.FNa}</span></>
               </>
            );
         },
         sortType: "basic"
      },
      {
         id: "LNa",
         Header: props.t("translate:LAST_NAME"),
         accessor: "LNa",
         Cell: ({ row }) => {
            return (
               <>
                     <><span className='stud-grad_name'>{row.original.LNa}</span></>
               </>
            );
         },
         sortType: "basic"
      },
        {
            id: "AplnNum",
            Header: props.t("translate:ROLL_NO"),
            accessor: (row) => row.AplnNum || "-",
            sortType: "basic"
        },
        {
            id: "fnGrad",
            Header: props.t("translate:OVERALL_GRADE"),
            accessor: (row)=> row.finWghtInPer||-1,
            Cell: ({ row }) => {
                return (
                    <>
                        {
                           (row.original.fnGrad && row.original.finWghtInPer != null && !isNaN(row.original.finWghtInPer)) ? 
                           <><span className="over-grade_points">{row.original.fnGrad} {row.original.finWghtInPer}%</span></>
                           : ''
                        }
                    </>
                );
            },
            sortType: "basic"
        }
      ],
      []
  );

   // callback function called from TablePagination component
   const loadPageItems = () => {
      oReq.calOvGr = true;
      // Get the Students based on the enterprise selection
      props.getTheGradingStuds(oReq); 
   }


   // Students Items Filter
   const srchStudItem = (event) => {
      setStudSearch(event.target.value);
      oReq.calOvGr = true;
      // minimum of 3 chars for assignment search
      if (event.target.value && event.target.value.length < 3) {
         return;
      }
      // Get the Students based on the enterprise selection
      props.getTheGradingStuds(oReq,event.target.value); 
   };

   const onStudentRowClick = (grdStud)=>{
      history.push({ pathname: '/home-page/student-grade',search: `?stuId=${grdStud.StuID}`,state: location.state })
   }
   
   return (
			<div>
				<div className="student-table_container">
					<div className="student-table_search">
						<div class="row m-0">
							<div class="col-6 p-0">
								<div className="cont-search-box">
									<Searchbox value={studSearch} placeholder={props.t("translate:SEARCH_ITEMS")} onChange={(event) => srchStudItem(event)} searchBoxTheme="search-default search-box_default search-outline" />
								</div>
							</div>
							<div class="col-6 p-0"></div>
						</div>
					</div>
					<Table data={props.aGradStudents} columns={studentTableColumns} onRowClick={onStudentRowClick} defaultSortBy="name" sortDesc={false} />
				</div>
            {!props.aGradStudents || props.aGradStudents.length<=0 &&
               <NoRecord img={no_stud_table} imgSize="no-data_img-small" studsGradContent={true} />
            }
			</div>
		);

}



const mapStateToProps = (state) => ({
   ...state.gradeBookReducer
})
const mapDispatchToProps = {
   getTheGradingStuds,
   updateFields
}

const TabNavigator = (props) => <StudentTablesComponent {...props} />
const Components = connect(mapStateToProps,mapDispatchToProps)(TabNavigator)
export default withTranslation()(Components);
