/*
    This service is used to set and get the current page name for analytics
*/

const AnalyticsService = (function() {
    
    let oCurPage = {};

    // Set the current page name
    const setCurrPage = function(pageNm) {
        oCurPage.pgNm = pageNm;
    };

    // Set the current page log ids
    const setLogId = function(oLog) {
        oCurPage.oLogDet = oLog;
    };

    // Set the current page content id
    const setCntId = function(cntId) {
        oCurPage.cntId = cntId;
    };

    // Set the current subject id
    const setSubId = function (subId, AcYr, SemID) {
        oCurPage.subId = subId;
        oCurPage.AcYr = AcYr;
        oCurPage.SemID = SemID;
    }

    // Remove the current page content id
    const rmvePageDetails = function(){
        oCurPage = {};
    }

    // Get the current page name
    const getCurrPageDetails = function() {
        return oCurPage;
    };
    
    return {
        setCurrPage : setCurrPage,
        setLogId    : setLogId,
        setCntId    : setCntId,
        setSubId    : setSubId,
        rmvePageDetails    : rmvePageDetails,
        getCurrPageDetails : getCurrPageDetails

    };
  
})();

export default AnalyticsService;