import React,{ useEffect, useState } from 'react';
import { updateNotifyPerm, sendWToken } from '../../store/actions/MsgTokenRegAction';
import { getFCMToken } from '../../service/firebase.config';
import { useSelector, useDispatch } from 'react-redux';
import Usersession from '../../utils/UserSession';


const FIrebaseWrapper = (props) => {
    const dispatch = useDispatch()
    const webToken = useSelector(state => state.MsgTokenRegReducer.fireToken)
    const notifyPerm = useSelector(state => state.MsgTokenRegReducer.permStat)
    const currentSessionUser = Usersession.getSession()

    //request browser notification permission
    const requestNotificationAccess =  () => {
        if ((typeof window !== 'undefined' && window.location.hostname === "localhost") || 
            (typeof window !== 'undefined' && window.location.protocol === "https:")) {
           Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                dispatch(updateNotifyPerm(true))
              console.log('Notification permission granted.');            
            } else {
              console.log('Unable to get permission to notify.');
            }
          });
        }
      }
    
 

      //fetch token only when permission is enabled (firebase only generates when permission enabled)
  const fetchToken = async () => {
    try {
     
        const wtoken = await getFCMToken();
        if (wtoken && !webToken) {
          dispatch(sendWToken({ token: wtoken }))
        }
    } catch (e) {
      console.log("error...........", e)
    }
  }

  const initialCheck = async () => {
    try{
    if (
      !webToken &&
      (window.location.protocol === "https:" ||
      window.location.hostname === "localhost") &&
      currentSessionUser?.mappedid 
      ) {
      fetchToken();
    }
    requestNotificationAccess();
  }
    catch(err){
      console.log("err......",err)
    }
  };
    useEffect(() =>{
        initialCheck();
    },[notifyPerm])

  return <>{props.children}</>;
};

export default FIrebaseWrapper;