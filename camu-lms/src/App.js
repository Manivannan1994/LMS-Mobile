import { usePromiseTracker } from "react-promise-tracker";
import './App.css';
import { BrowserRouter as Router } from "react-router-dom";
import ProgressBar from './components/progressbar/Progressbar';
import './styles/_alertStyle.scss';
import './styles/_toasterStyle.scss';
import { RouterSetup } from './Router';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import React, { useEffect, useState } from 'react';
import { Info } from "react-feather";
import i18next from "i18next";
import { connect } from 'react-redux';
import { withTranslation } from "react-i18next";
// import {initializeApp} from 'firebase/app';
// import HTTPService from "./utils/http-util";
import ErrorBoundary from './components/Error-boundary/ErrorBoundary';
import {updateCntViewLog} from './store/actions/AnalyticsAction';
import FIrebaseWrapper from "./components/firebase-wrapper/FirebaseWrapper";
// import { LoginPageComponent } from "./containers/LoginPage";
// import EmailSupport from "./components/email-support/EmailSupport";

function App(props) {
  const { promiseInProgress } = usePromiseTracker();
  const [offline, setOffine] = useState(false); // intial offline value 
  const [isSupport,setIsSupport]=useState(false);
  // Update out time every 30 seconds
  const updateLogIntervally = () => {
    setInterval(() => {
      props.updateCntViewLog();
    }, 1000*30);
  }

  const checkSupport = async ()=>{
    // check using useragent if the device is compatable for firebase temperory fix
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setIsSupport(false);
    } else {
      setIsSupport(true);
    }
  localStorage.setItem("isSupported",isSupport)
  }
  //Similar to componentDidMount and componentDidUpdate
  useEffect(() => {
    //Offline EventListener
    window.addEventListener('offline', () => {
      setOffine(true)
    });
    // initFirbaseConfig();
    updateLogIntervally();
    checkSupport();
  },// eslint-disable-next-line 
  []);

  // function initFirbaseConfig() {
  //   HTTPService.post('/external/auth/get_external_auth_config', {authSrc : "lms_firebase_config"}, null,(status, response) => {                                                                                                                                                                                                                                                                                                        
  //     if(status && status === 200 && response && response.config && response.config.lms_firebase_config){
  //       initializeApp(response.config.lms_firebase_config);
  //     };
  //   });
  // }
  if(isSupport){return (
    <div>
      <FIrebaseWrapper>
        <Router basename="/lms#">
          {promiseInProgress ? <ProgressBar progressBarTheme="progress-bar_top default-progress " /> : null}
          {offline &&
            <div className="internet-issue_label">
              <p>
                <Info className="svg-icon_small icon-white icon-space_left" />
                {i18next.t("translate:OFFLINE")}
              </p>
            </div>
          }
          {/* <EmailSupport/> */}
          <div className="container-box main">
            <div className="content__box">
              <ErrorBoundary>
                <RouterSetup />
              </ErrorBoundary>
            </div>
            <ToastContainer />
          </div>
          {/* <LoginPageComponent/> */}
        </Router>
      </FIrebaseWrapper>
    </div>

  )}else{return (
    <div>
      {/* <FIrebaseWrapper> */}
            {/* <div className="container-box_view--stud">
            <div className="container-box_view--stud-top">
            </div>
            <div className="container-box_view--stud-left">
            </div>
            <div className="container-box_view--stud-right">
            </div>
            <div className="container-box_view--stud-bottom">
            </div>
          </div> */}
      <Router basename="/lms#">
          {promiseInProgress ? <ProgressBar progressBarTheme="progress-bar_top default-progress " /> : null}
          {offline &&
            <div className="internet-issue_label">
              <p>
                <Info className="svg-icon_small icon-white icon-space_left" />
                {i18next.t("translate:OFFLINE")}
              </p>
            </div>
          }
          {/* <EmailSupport/> */}
          <div className="container-box main">
            <div className="content__box">
              <ErrorBoundary>
                <RouterSetup />
              </ErrorBoundary>
            </div>
            <ToastContainer />
          </div>
          {/* <LoginPageComponent/> */}
        </Router>
      {/* </FIrebaseWrapper> */}


    </div>

  );}
  
}
const mapStateToProps = (state) => ({
  ...state.headerReducer    
})

const mapDispatchToProps = {
  updateCntViewLog
}
const TabNavigator = (props) => <App {...props} />

const Components = connect(mapStateToProps, mapDispatchToProps)(TabNavigator)

export default withTranslation()(Components);

// export default App;
