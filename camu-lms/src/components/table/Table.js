import React, { useState, lazy, useEffect } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import "../../styles/_tablePagination.scss";
import { ChevronDown, ChevronLeft, ChevronRight } from "react-feather";
import { withTranslation } from "react-i18next";
const LmsSelectDropDown = lazy(() => import("../lms-selectdropdown/LmsSelectDropDown"));

/* Important ref https://medium.com/@thewidlarzgroup/react-table-7-sorting-filtering-pagination-and-more-6bc28af104d6 */

const Table = (props) => {
	const isEditingInProgress = React.useRef();
	let defaultSortBy = [];
	const [currentPage, setCurrentPage] = useState(1);
	const [prevSortby, setPrevSortby] = useState([]);
	const [prevSortedIndex, setPrevSortedIndex] = useState([]);
	if (props.defaultSortBy) {
		defaultSortBy = [
			{
				id: props.defaultSortBy,
				desc: props.sortDesc || false,
			},
		];
	}
	if (prevSortby && prevSortby.length > 0) {
		defaultSortBy = prevSortby;
	}

	const onCellEdit = (rowIndex, columnId, value, newRowData) => {
		//set isEditingInProgress in order preserve the sorting order
		isEditingInProgress.current = true;
	};
	const {
		getTableProps,
		getTableBodyProps,
		headerGroups,
		page,
		rows,
		prepareRow,
		// below new props related to 'usePagination' hook
		canPreviousPage,
		canNextPage,
		pageOptions,
		pageCount,
		gotoPage,
		nextPage,
		previousPage,
		state: { pageIndex, pageSize, sortBy },
	} = useTable(
		{
			columns: props.columns,
			data: props.data,
			onCellEdit,
			autoResetSortBy: !isEditingInProgress.current,
			autoResetResize:!isEditingInProgress.current,
			autoResetRowState:!isEditingInProgress.current,
			autoResetSelectedRows:!isEditingInProgress.current,
			autoResetPage:!isEditingInProgress.current,
			autoResetPageIndex:!isEditingInProgress.current,
			autoResetFilters:!isEditingInProgress.current,
			initialState: {
				sortBy: defaultSortBy,
				pageIndex: 0,
				pageSize: props.disablePagination?props.data.length:30,
			},
		},
		useSortBy,
		usePagination
	);
	//isEditingInProgress then preserve the sort order 
	if (isEditingInProgress.current && prevSortedIndex.length > 0) {
		page.sort(function (a, b) {
			return prevSortedIndex.indexOf(a.index) - prevSortedIndex.indexOf(b.index);
		});
	}

	useEffect(() => {
		isEditingInProgress.current = false;
		const currentIndexes = page.map((row) => {
			return row.index;
		});
		setPrevSortedIndex(currentIndexes);
		if (sortBy[0]) {
			setPrevSortby(sortBy);
		}
	}, [sortBy]);

	useEffect(() => {
		setCurrentPage(pageIndex + 1);
	}, [pageIndex]);
	
	const pages = pageOptions.map((page) => {
		return { pageNo: page + 1 };
	});

	const goToSelectedPage = (event) => {
		const page = event.target.value ? Number(event.target.value) - 1 : 0;
		gotoPage(page);
	};

	const aTableData = props.disablePagination ? rows : page;

	return (
		<>
			<table {...getTableProps()} class="table table-cont student-grades_table">
				<thead class="thead-list">
					
					{!props?.hideHeader && headerGroups.map((headerGroup) => (
						<tr {...headerGroup.getHeaderGroupProps()} className="table-header_label">
							{headerGroup.headers.map((column) => {
								return (
									<th
										{...column.getHeaderProps(column.getSortByToggleProps())}
										// onClick={(e) => {
										// 	column.getHeaderProps(column.getSortByToggleProps()).onClick(e);
										// 	if (props.onSortClick) {
										// 		//since column.isSortedDesc value is getting wrong this logic is added :(
										// 		props.onSortClick(column, column.isSortedDesc === undefined || column.isSortedDesc === true ? false : true);
										// 	}
										// }}
									>
										{column.render("Header")}
										{column.canSort ? <span className="table-header-font">{column.isSorted ? column.isSortedDesc ? <i className="fa fa-sort-desc"></i> : <i className="fa fa-sort-asc"></i> : <i className="fa fa-sort"></i>}</span> : <></>}
									</th>
								);
							})}
						</tr>
					))}
				</thead>
				<tbody {...getTableBodyProps()}>
					{aTableData.map((row) => {
						prepareRow(row);
						return (
							<>
							<tr {...row.getRowProps()} onClick={() => (props.onRowClick ? props.onRowClick(row.original) : {})} className={props.onRowClick ? "cursor-pointer" : ""}>
								{row.cells.map((cell) => {
									return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
								})}
							</tr>
							{props?.isNested && row.original[props?.nestedKey] && <tr > <td  colSpan={12}> <Table hideHeader={true} disablePagination={true} columns={props?.nestedColumns} data={row.original[props?.nestedKey]} t={props?.t} /> </td> </tr>}
							</>
						);
					})}
				</tbody>
			</table>
			{
				props.disablePagination
				?<></>
				:
				<div className="pagination-table">
					<div className="pagination-table_content">
						<p className="table-page_name">{props.t("translate:PAGE")}</p>
						<LmsSelectDropDown className="dropdown-default drop-down_arrow" value={currentPage} dropDown={pages} onChange={(e) => goToSelectedPage(e)} keyTag="" nameTag="pageNo">
							<ChevronDown className="svg-icon_small close-icon-network icon-dark" />
						</LmsSelectDropDown>
						<p className="table-page_size">
							{" "}
							{props.t("translate:OF")} {"  "}
							{pageCount}
						</p>
						<div class="pagination-change_left">
							<ChevronLeft onClick={previousPage} disabled={!canPreviousPage} className="svg-icon_small icon-dark" />
						</div>
						<div class="pagination-change_right">
							<ChevronRight onClick={nextPage} disabled={!canNextPage} className="svg-icon_small icon-dark" />
						</div>
					</div>
				</div>
			}
			
		</>
	);
};

export default withTranslation()(Table);
