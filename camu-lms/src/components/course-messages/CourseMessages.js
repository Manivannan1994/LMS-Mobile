import '../../styles/_courseMessageStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import userimg from "../../assets/images/user-profile.png";
import nomessage from "../../assets/images/nomessage.png";
import Button from '../button/Button';
import { Plus } from 'react-feather';
import Searchbox from '../searchbox/Searchbox';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useState, useEffect} from 'react';
import MessageModal from './MessageModal'
import {useSelector, useDispatch} from 'react-redux'
import { getChatGroups, getChatMessages, getChatUsersOfGroup, updateCrseSetFields } from '../../store/actions/ChatsAction';
import { sendWToken, updateNotifyPerm } from '../../store/actions/MsgTokenRegAction';
import { getFCMToken } from '../../service/firebase.config';
import NotifyAlertModal from './NotifyAlertModal';
import NewMessageModal from "./NewMessageModal";



const CourseMessages = () => {
    const { t } = useTranslation()
    const { state } = useLocation()
    const dispatch = useDispatch()
    const [showmodal, setShowmodal] = useState(true)
    const [chatGroups, setChatgroups] = useState([])
    const [groupSearch, setGroupsearch] = useState('')
    const [messageselect, setMessageselect] = useState(false)
    const chtGroups = useSelector(state => state.ChatsReducer.chatGroups)
    const webToken = useSelector(state => state.MsgTokenRegReducer.fireToken)
    const notifyPerm = useSelector(state => state.MsgTokenRegReducer.permStat)

    const requestNotificationAccess =  () => {
        if ((typeof window !== 'undefined' && window.location.hostname === "localhost" ) || 
        (typeof window !== 'undefined' && window.location.protocol === "https:" )) {
          window.Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                dispatch(updateNotifyPerm(true))
            }
          });
        }
      };
    

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
  
    useEffect(() => {
        checkNotificationAvaliable()
        getallGroups()
    }, [notifyPerm])

    useEffect(() =>{
        if (!webToken || webToken === undefined) {
            fetchToken()
        }
    },[webToken])

    useEffect(() =>{
        if(groupSearch !== ''){
            setChatgroups(chtGroups.filter(d => d.topicName.toLowerCase().includes(groupSearch.toLowerCase())))
        }else{
        setChatgroups(chtGroups)
        }
    },[chtGroups, groupSearch])

    const getallGroups = () =>{
        
        let entUser = {
            InId: state.InId,
            PrID: state.PrID,
            CrID: state.CrID,
            AcYr: state.AcYr,
            DeptID: state.DeptID,
            SemID: state.SemID,
            SecID: state.SecID,
            subjId: state.subId,
        }
        dispatch(getChatGroups(entUser))
    }

    const getAGroupMessages = (grp) =>{
        try {
            let OReq ={
                chtGpId:grp._id
            }
            dispatch(getChatMessages(OReq))
            console.log('getAGroupMessages is hitted', grp)
            dispatch(updateCrseSetFields("currenGroup",grp))
        } catch(e){
            console.log('error of getAGroupMessages catch', e);
        }

    }

    const getChatUsers = (grpId)  =>{
        try {
            let OReq = {
                InId: state.InId,
                PrID: state.PrID,
                CrID: state.CrID,
                AcYr: state.AcYr,
                DeptID: state.DeptID,
                SemID: state.SemID,
                SecID: state.SecID,
                subjId: state.subId,
                chtGpId: grpId
            }
            dispatch(getChatUsersOfGroup(OReq))
            setMessageselect(true)
        } catch(e){
            console.log('error or message getChatUsers catch', e)
        }
    }

    const checkNotificationAvaliable=()=>{
        if(window.Notification){requestNotificationAccess()}
    }
    return (
        <div>
            <div className="message-heading">
                <div className='message-nav'>
                    <div className='message-head-name'>
                        <h6>{t("translate:ASSIGNMENTVIEWCOMPONENT_MESSAGES")}</h6>
                        <p>The easiest way to communicate with students&nbsp;&nbsp;<span></span></p>
                    </div>
                   {!state?.isDisabledContent &&
                    <div>
                        <Button theme="btn-rounded default " clicked={() => setShowmodal(true)}>
                            <span data-toggle="modal" data-target="#message-page">
                                <Plus className="svg-icon_small icon-white " />
                                {t("translate:ASSIGNMENTVIEWCOMPONENT_NEW_MESSAGES")}
                            </span>
                        </Button>
                    </div>
                   }
                </div>
            </div>
            <div className='message-base-content'>
                {/* ...............................all message selection......................  */}
                <div class="project-tab">
                    <div class="message-content_tab">
                        <div class="nav nav-tabs nav-fill" id="nav-tab" role="tablist">
                            <a class="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#tab-1" role="tab" aria-selected="true">{t("translate:MESSAGE_T_ALL_MESSAGES")}</a>
                        </div>
                    </div>
                    <div class="tab-content message-tabs_cont " id="nav-tabContent">
                        {/* Tab 1 content */}
                        <div class="tab-pane fade show active" id="tab-1" role="tabpanel" aria-labelledby="nav-home-tab">
                            <div className="message-list_search">
                                <div class="row m-0">
                                    <div class="col-6 p-0">
                                        <div className="cont-search-box">
                                            <Searchbox value={groupSearch} placeholder="Search" searchBoxTheme="search-default search-box_default search-outline" onChange={(e) => setGroupsearch(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>{chatGroups?.length > 0 ?
                                <div className="grpcontainer">
                                    {chatGroups.sort((a,b) => new Date(b.MoAt) - new Date(a.MoAt)).map((d,i) =>
                                        <div key={i} onClick={() => {
                                            console.log('this is function onclik function  hitted', d);
                                            getChatUsers(d._id)
                                            getAGroupMessages(d)
                                            }} className='message-left-content'>
                                            <div className={messageselect ? "message-lists message-list-width" : "message-lists "}>
                                                <div className='chat-profile-icon'>{d.topicName[0]}</div>
                                                <div className="messages-titles">
                                                    <p className="message_heading">{d.topicName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {
                                        messageselect && 
                                        <MessageModal showmodal={setMessageselect} />
                                    }
                                </div>
                                : groupSearch ==="" && !state?.isDisabledContent ?
                                <div className='message-nocontent'>
                                    <div className='message-nomessage'>
                                        <img src={nomessage} alt='no_message' />
                                    </div>
                                    <div className='no-message-text'>
                                        <p>Start conversation with a student or group.</p>
                                    </div>
                                    <span data-toggle="modal" data-target="#message-page" className='no-newmessage-btn'>
                                        <Button theme="btn-rounded default ">
                                            <Plus className="svg-icon_small icon-white " />
                                            {t("translate:ASSIGNMENTVIEWCOMPONENT_NEW_MESSAGES")}
                                        </Button>
                                    </span>
                                    {/* <a href='/'>know more about messages</a> */}
                                </div>
                                :<div className="nogroup-records">
                                    <p>No records found</p>
                                </div>
                            }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NotifyAlertModal  showmodal={notifyPerm} reqPermission={() => checkNotificationAvaliable()}/>
            <NewMessageModal />
        </div>
    )
}


export default CourseMessages;