import React from 'react';
import Table from '../components/table/Table';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';

const FilterViewComponent = (props) => {;

  const getParticipantTableColumns = [
    {
      id: 'SubId',
      Header: props.t('translate:COURSE_CODE'),
      accessor: (row) => row.SubId || "-",
      size: '10%',
    },
    {
      id: 'SubjNm',
      Header: props.t('translate:COURSE_NAME'),
      accessor: (row) => row.SubjNm || "-",
      size: '10%',
    },
    {
      id: 'PrId',
      Header: props.t('translate:DEGREE'),
      accessor: (row) => row.PrId || "-",
      size: '10%',
    },
    {
      id: 'CrId',
      Header: props.t('translate:PROGRAM_CODE'),
      accessor: (row) => row.CrId || "-",
      size: '10%',
    },
    {
      id: 'CrNm',
      Header: props.t('translate:PROGRAM_NAME'),
      accessor: (row) => row.CrNm || "-",
      size: '10%',
    },
    {
      id: 'SemNm',
      Header: props.t('translate:TERM'),
      accessor: (row) => row.SemNm || "-",
      size: '10%',
    },
    {
      id: 'SecNm',
      Header: props.t('translate:SECTION'),
      accessor: (row) => row.SecNm || "-",
      size: '10%',
    },

    {
      id: 'StaffCd',
      Header: props.t('translate:FACULTY_CODE'),
      accessor: (row) => row.StaffCd || "-",
      size: '10%',
    },
    {
      id: 'StaffNm',
      Header: props.t('translate:FACULTY_NAME'),
      accessor: (row) => row.StaffNm || "-",
      size: '10%',
    },
    {
      id: 'EnrlStu',
      Header: props.t('translate:ENROLLED_STUDENTS'),
      accessor: (row) => row.EnrlStu ?? "-",
      size: '10%',
    }
  ];

  return (
    <>
      <div className='dashboard-table_box'>
        <Table
          data={props.subject ?? []}
          columns={getParticipantTableColumns}
          defaultSortBy='SubjNm'
          onRowClick={props.onClickRow}
          sortDesc={false}
        />
      </div>
    </>
  );
};

export default withTranslation()(withRouter(FilterViewComponent));
