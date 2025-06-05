import { useState, useEffect } from 'react'
import { Cross } from '../icons/Icons';
import { useSelector, useDispatch } from 'react-redux'
import ChatInputBox from '../chat-input-box/ChatInputBox';
import Button from '../button/Button'
import '../../styles/_courseMessageModalStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import { useTranslation } from 'react-i18next';
import userimg from "../../assets/images/user-profile.png";
import { sendMessage, getChatMessages } from '../../store/actions/ChatsAction';
import Usersession from '../../utils/UserSession';
import { onMessage } from 'firebase/messaging'
import { messaging } from '../../service/firebase.config';
import LmsEditorView from '../lms-editor-view/LmsEditorView';


const MessageModal = (props) => {
    const [chatinput, setChatinput] = useState("")
    const [stmessages, setStmessages] = useState([])
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const chtMessages = useSelector(state => state.ChatsReducer.chatMessages)
    const chtUsers = useSelector(state => state.ChatsReducer.chatUsers)
    const webToken = useSelector(state => state.MsgTokenRegReducer.fireToken)
    const currentSessionUser = Usersession.getSession()
    //to be checked
    const currentUser = chtUsers.filter(d => d.chtUsrId === currentSessionUser.mappedid)
    const groupId = useSelector(state => state.ChatsReducer.currenGroup);

    const updateMessage = (treq) => {
        let OReq = {
            chtGpId: currentUser[0].chtGpId
        }
        if (treq) OReq.qTime = treq
        dispatch(getChatMessages(OReq, chtMessages))
    }

    useEffect(() => {
        let data = []
        let chtdate = groupId.CrAt;
        let chngDate = '';
        chtMessages.sort((a, b) => new Date(a.CrAt) - new Date(b.CrAt)).forEach((d) => {
            if (chtUsers.length > 0) {
                let usr = chtUsers.filter((user) => user._id === d.srId)
                if (new Date(d.CrAt).getDate() > new Date(chtdate).getDate()) {
                    chngDate = d.CrAt
                    chtdate = d.CrAt
                } else {
                    chngDate = null
                }
                data.push({ ...d, chUser: usr[0], crMsgDt: chngDate })
            }
        })
        setStmessages(data)
    }, [chtUsers, chtMessages])

    if ((typeof window !== 'undefined' && window.location.hostname === "localhost") ||
        (typeof window !== 'undefined' && window.location.protocol === "https:")) {
        onMessage(messaging, (payload) => {
            updateMessage(stmessages[0]?.CrAt)
        });
    }


    const handlesendMessage = (e) => {
        e.preventDefault()
        if (chatinput !== "" & chatinput !== undefined) {
            const OReq = {
                message: {
                    type: "text",
                    content: chatinput,
                    chtGpId: currentUser[0].chtGpId,
                    crUsrId: currentUser[0]._id
                },
                chtGpId: currentUser[0].chtGpId
            }

            dispatch(sendMessage(OReq))
            setChatinput("")
            if(!webToken){
               setTimeout(() =>{updateMessage(stmessages[0]?.CrAt)},300) 
            }

        }
    }


    return (
        <div className="modal-container">
            <div className="message-modal-header">
                <div className="message-header-left-content">
                    <span onClick={() =>
                        props.showmodal(false)}>
                        <Cross iconStyle="svg-icon_small icon-pointer" /></span>
                    <div className="message-header-images">
                        {chtUsers.slice(0, 5).map(d =>
                            d.oUser.PhotoImgID ?<img alt="chtuser_icon" src={`${currentSessionUser?.camuURL}/Image/getImage/${d.oUser.PhotoImgID}`} />
                          : <img alt="chtuser_icon" src={userimg} />
                        )}
                        {chtUsers.length > 5 &&
                            <span className="team-count">+{chtUsers.length - 5}</span>
                        }
                    </div>
                    <div className="message-header-names">
                        {chtUsers.slice(0, 5).map((d, i) =>
                            <p>{i === 0 ? '' : ','}<span>{d.oUser?.FNa ? d.oUser.FNa : d.oUser?.FoNa}</span></p>
                        )}
                        {chtUsers.length > 5 && <p>etc...</p>}
                    </div>
                </div>
            </div>
            {/* chat body */}
            <div className='message-modal-body'>
                {stmessages.length > 0 && stmessages.sort((a, b) => new Date(b.CrAt) - new Date(a.CrAt)).map((d, i) =>
                    <div>
                        {i === stmessages.length - 1 ?
                            <p className='currentDay'>{new Date(d.CrAt).toLocaleString('en-US',{weekday:'long', day:'numeric',month:'short'})}</p>
                            : d.crMsgDt ? <p className='currentDay'>{new Date(d.crMsgDt).toLocaleString('en-US',{weekday:'long', day:'numeric',month:'short'})}</p> : <></>
                        }
                        <div key={i} className={d?.chUser?.chtUsrId === currentSessionUser.mappedid ? "message-right-container" : "message-left-container"}>
                            {d?.chUser?.chtUsrId !== currentSessionUser.mappedid &&
                                <div className="message-left-container-img">
                                    <img className="message-left-image" src={userimg} />
                                </div>}
                            <div className="message-body-message">
                                <p className="message-body-message-username">{
                                    d?.chUser?.oUser?.FoNa ? d?.chUser?.oUser?.FoNa + " " + d?.chUser?.oUser?.SuNa :
                                        d?.chUser?.oUser?.FNa + " " + d?.chUser?.oUser?.LNa}</p>
                                <LmsEditorView contentData={d.mCont} />
                                <p className="message-time">{new Date(d.CrAt).toLocaleString('en-US', { hour: "numeric", minute: 'numeric', hour12: true })}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div>
                <div className="chatinputcontainer">
                    <ChatInputBox value={chatinput} type="text" onKeyDown={(e) => {if(e.code ==="Enter")handlesendMessage(e)}} onChange={(e) => setChatinput(e.target.value)} placeholder="Write a message..." className="chatinputbox" />
                    <Button clicked={(e) => handlesendMessage(e)} theme="chatsendbtn">Send</Button>
                </div>
            </div>
        </div>
    )
}

export default MessageModal;