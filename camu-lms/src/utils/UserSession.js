const UserSession = (function() {
    let _session;
    let _archCrsDtls;
  
    const getSession = function() {
      return _session;
    };
  
    const setSession = function(session) {
        _session = session;     
    };
    const setArchCrsDtls = function(crsDtls) {
      _archCrsDtls = crsDtls;     
    };
    const getArchCrsDtls = function() {
      return _archCrsDtls;
    };

    // For archive course 
    const archiveCourse = {
      // Can view content
      canViewCnt: function () {
        if (_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs) {
          if (_archCrsDtls.oAvCrsDls.isCntVw) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      },
      // Can view grad
      canViewGrd: function () {
        if (_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs) {
          if (_archCrsDtls.oAvCrsDls.isGrdVw) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      },
      // Can view conversation
      canViewConversation: function () {
        if (_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs) {
          if (_archCrsDtls.oAvCrsDls.isConVw) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    };
    // const isArchiveCrsContentView = function(){
    //   if(_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs){
    //     if(_archCrsDtls.oAvCrsDls.isCntVw){
    //       return true;
    //     }else{
    //       return false;
    //     }
    //   }else{
    //     return true;
    //   } 
    // }

    // const isArchiveCrsGradeView = function(){
    //   if(_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs){
    //     if(_archCrsDtls.oAvCrsDls.isGrdVw){
    //       return true;
    //     }else{
    //       return false;
    //     }
    //   }else{
    //     return true;
    //   } 
    // }

    // const isArchiveCrsConversationView = function(){
    //   if(_archCrsDtls && _archCrsDtls.oAvCrsDls && _archCrsDtls.oAvCrsDls.isAvCrs){
    //     if(_archCrsDtls.oAvCrsDls.isConVw){
    //       return true;
    //     }else{
    //       return false;
    //     }
    //   }else{
    //     return true;
    //   } 
    // }
    const isStudent = function(){
      return _session?_session.utype==="student":false;
    };

    const isStaff = function(){
      return _session?_session.utype==="Staff":false;
    };

    const isGotPerm = function(perCode){
      if(_session && _session.perms && _session.perms.length > 0 && perCode && perCode.length > 0){
        for (let percd = perCode.length - 1; percd >= 0; percd--) {
          if( _session.perms.indexOf(perCode[percd]) >= 0 ){
            return true;
          }
        }
        return false;
      }else{
        return false;
      }
    };
  
    return {
        getSession: getSession,
        setSession: setSession,
        isStudent:isStudent,
        isStaff:isStaff,
        isGotPerm:isGotPerm,
        setArchCrsDtls:setArchCrsDtls,
        // isArchiveCrsContentView:isArchiveCrsContentView,
        // isArchiveCrsGradeView:isArchiveCrsGradeView,
        // isArchiveCrsConversationView:isArchiveCrsConversationView,
        getArchCrsDtls:getArchCrsDtls,
        archiveCourse : archiveCourse
    }
  
  })();
  
  export default UserSession;