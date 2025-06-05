import React, { useEffect, useState, lazy, useRef} from 'react';
import '../../styles/_conversationStyle.scss';
import { MoreHorizontal, Trash2 } from 'react-feather';
import user_img from '../../assets/images/user-profile.png';
// import InputBox from '../input-box/InputBox';
import queryString from 'query-string';
import { useLocation } from 'react-router-dom';
import HTTPService from "../../utils/http-util";
import messageUtil from '../../utils/message-util';
import { lmsTimeFormat } from '../../utils/helper';
import { lmsDateFormat } from '../../utils/helper';
import UserSession from '../../utils/UserSession';
import i18next from "i18next";
import _ from "lodash";
// import { notifyMe,onMessageListener } from '../../firebase/firebase';
// import Button from '../button/Button';
// import InfiniteScroll from "react-infinite-scroll-component";
//  import InfiniteScroll from "../infinite-scroll/InfiniteScroll";
 const InputBox = lazy(() =>
 import('../input-box/InputBox')
 );
 const InfiniteScroll = lazy(() =>
 import("../infinite-scroll/InfiniteScroll")
 );
const UIPerWrapper = lazy(() =>
    import('../ui-per-wrapper/UIPerWrapper')
);
const StudentArchiveConversationWrapper = lazy(() =>
   import('../stud-arch-conver-wrapper/StudentArchiveConversationWrapper') 
);
//  const Button = lazy(() =>
//  import('../button/Button')
//  );
const ConversationComponent = (props) => {
    const [msg, setMsg] = useState('');
    const [relyMsg, setRelyMsg] = useState('');
    const [isRely, setIsRely] = useState(null);
    const [convArr, setConvArr] = useState([]);
    const location = useLocation();
    const [skip, setSkip] = useState(0);
    const isArchCrsEnable = UserSession.getArchCrsDtls();
    let values = queryString.parse(location.search);

    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // get conversation message for page onLoad
    useEffect(() => {
        if (UserSession.archiveCourse &&  UserSession.archiveCourse.canViewConversation()) { // Archive course for conversion
            getConversation();
        }
        // notifyMe();
    }, // eslint-disable-next-line 
    []);

    // onMessageListener().then(payload => {
    //     if(payload && payload.data){
    //         setPshNotifPaylod(payload.data);
    //     }
    // });

    // For future use
    // navigator.serviceWorker.addEventListener('message', function(event) {
    //     if(event && event.data && event.data.payload){
    //         setPshNotifPaylod(event.data.payload);
    //     }
    // });

    // const setPshNotifPaylod = (payload) => {
    //     let mainConvArray = JSON.parse(JSON.stringify(convArr));
    //     payload.CrAt = new Date(payload.CrAt);
    //     payload.isToday = true;
    //     if(payload.cTyp === "R"){
    //         for (let i = mainConvArray.length - 1; i >= 0; i--) {
    //             if(mainConvArray[i]._id && payload.cId && mainConvArray[i]._id === payload.cId){
    //                 if(mainConvArray[i].aReplyAry && mainConvArray[i].aReplyAry.length > 0){
    //                     mainConvArray[i].aReplyAry.unshift(payload);
    //                 }else{
    //                     mainConvArray[i].aReplyAry = [];
    //                     mainConvArray[i].aReplyAry.push(payload);
    //                 }
    //             }
    //         }
    //     }else{
    //         mainConvArray.unshift(payload);
    //     }
    //     setConvArr(mainConvArray);
    // }

    // submit user enter message
    const submitMsg = (event, relySts, relyId) => {
        event.preventDefault();
        let oReq = {
            InId: location.state.InId,
            // PrID: location.state.PrID,
            // CrID: location.state.CrID,
            // DeptID: location.state.DeptID,
            // AcYr: location.state.AcYr,
            // SemID: location.state.SemID,
            // SubjId: location.state.subId,
            // SecID: location.state.SecID,
            cntId: values.id,
            msg: msg,
            type: props.type,
            title:props.title,
            chapId: values.chapId,           
            sChpId:props.sChpId
            // name:UserSession.getSession().uname,
            // PhotoImgID:UserSession.getSession().imageUrl,
            // currentUrl:window.location.href
        }
        if (relySts) {
            oReq.cTyp = relySts;
            oReq.convId = relyId;
            oReq.msg = relyMsg;
        }
        HTTPService.post('/lms/save-conversation', oReq, null, (err, response) => {
            if (response && response.output && response.output.data && response.output.data._id && response.output.data._id.length) {
                response.output.data.name = UserSession.getSession().uname;
                response.output.data.PhotoImgID = UserSession.getSession().imageUrl;
                response.output.data.isToday = true;
                     // student viw hiding the staff msg icon
                if (UserSession.getSession().utype === "student") {
                    if (response.output.data.pId === UserSession.getSession().stuId) {
                        response.output.data.mreIcon = true;
                    } else {
                        response.output.data.mreIcon = false;
                    }
                } else {
                    response.output.data.mreIcon = true
                }
                if (response.output.data.cTyp === "R") {
                    for (let i = convArr.length - 1; i >= 0; i--) {
                        if (convArr[i]._id && response.output.data.cId && convArr[i]._id === response.output.data.cId && response.output.data.mreIcon) {
                            if(convArr[i].aReplyAry && convArr[i].aReplyAry.length > 0){
                                convArr[i].aReplyAry.push(response.output.data);
                            }else{
                                convArr[i].aReplyAry = [];
                                convArr[i].aReplyAry.push(response.output.data);
                            }
                        }
                    }
                    scrollToBottom();
                }else{
                    convArr.unshift(response.output.data);
                }
                setConvArr(convArr);
            }else if(response && response.output && response.output.data && response.output.data.code && response.output.data.code === "ERR_CRE_CONV"){
                messageUtil.showError("ERR_CRE_CONV", true);
            } else {
                messageUtil.showError("UNKNOWN_ERROR", true);
            }
        })
        setMsg('');
        setRelyMsg('');
    }

    //  get conversation message 
    const getConversation = () => {
        let oReq = {
            // InId: location.state.InId,
            cntId: values.id,
            chapId: values.chapId,
            type: props.type,
            sChpId:props.sChpId,
            count: 10
        }
        setSkip(skip+10);
        oReq.dataSkip = skip;
        HTTPService.post('/lms/get-conversation', oReq, null, (err, response) => {
            if (response && response.output && response.output.data) {
                if(response.output.data.length > 0){
                    setConvArr(convArr => [...convArr, ...response.output.data]);
                }
            } else {
                messageUtil.showError("UNKNOWN_ERROR", true);
            }
        })
    }
    //  delete conversation ( main conversation and replay conversation)
    const deleteConver = (deleteId,msgTyp) => {
        HTTPService.post('/lms/delete-conversation', { id: deleteId }, null, (err, response) => {
            if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "UPDATED_SUCCESS") {
                for (let i = convArr.length - 1; i >= 0; i--) {
                    if(msgTyp && msgTyp === 'M' && convArr[i]._id && deleteId && convArr[i]._id === deleteId){
                        convArr.splice(i,1);
                    }else {
                        if(msgTyp && msgTyp === 'R' && convArr[i].aReplyAry && convArr[i].aReplyAry.length > 0){
                            for (let j = convArr[i].aReplyAry.length - 1; j >= 0; j--) {
                                if(convArr[i].aReplyAry[j]._id && deleteId && convArr[i].aReplyAry[j]._id === deleteId){
                                    convArr[i].aReplyAry.splice(j,1);
                                }
                            }
                        }
                    }
                }
                setConvArr(convArr);
                messageUtil.showSuccess("CONVERSATION_DELETED", true);
            } else if (response && response.output && response.output.data && response.output.data.code && response.output.data.code === "NO_DOCS_FOUND") {
                messageUtil.showInfo("CONVERSATION_NOT_DELETED", true);
            } else {
                messageUtil.showError("UNKNOWN_ERROR", false);
            }
        })
    }
    return (
        <div>
            <div className="conversation-container">
                <UIPerWrapper perCode={['rp_can_create_lms_conver','lms_student']}>
                    <StudentArchiveConversationWrapper isConVersationView={_.isEmpty(isArchCrsEnable) ? false : true}>
                    <div className="user-update_form">
                        <img src={UserSession.getSession().imageUrl ? '/Image/getImage/' + UserSession.getSession().imageUrl : user_img} className="user-post_img" alt="img" />
                        <div className="post-update">
                            <form onSubmit={(event) => submitMsg(event)}>
                                <InputBox className="input-block" placeholder="Ask a question or post an update"
                                    value={msg}
                                    onChange={(event) => { setMsg(event.target.value) }}
                                />
                            </form>

                    
                        </div>
                    </div>
                    </StudentArchiveConversationWrapper>
                </UIPerWrapper>
                {/* <div className="reply-btn_option">
                <Button theme="btn-rounded default btn-right">Post reply</Button>
                <Button theme="btn-rounded btn-outline">Cancel</Button>
                </div> */}

              


                {/* <div className="conversation-content">
                    <div className="conversation-content_post">
                        <div className="row m-0">
                            <div className="col-11 p-0">
                                {convArr && convArr.length > 0 && convArr.map((convItems) => {
                                    console.log("convItems", convItems);
                                    // setRelyId(convItems._id)
                                    relyId = convItems._id;
                                    return (
                                        <div>
                                            <div className="staff-content">
                                                <img src={user_img} className="user-post_img" />
                                                <div className="staff-info_content">
                                                    <p className="staff-content_name">Nguyễn Trọng <span>{convItems.pTyp === 'STF' ? 'Teacher' : 'Student'}</span></p>
                                                    <p className="staff-content_label" key={convItems._id}>{convItems.msg}</p>
                                                    <div className="replay-content">
                                                        <div className="replay-content_label">
                                                            <p className="replay_label">reply</p>
                                                            <p className="replay_time">Today <span className="dot-content"></span> 11:00AM</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                            </div>
                            <div className="col-1 p-0">
                                <div class="option-views" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <MoreHorizontal className="svg-icon_small icon-default" />
                                </div>
                                <div class="dropdown-menu con-edit_option">
                                    <a class="dropdown-item user-info_contents">
                                        <Trash2 className="svg-icon_light icon-error" />
                                        <span className="conversation-delete"> Delete</span>

                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="conversation-content_replay">
                        <div className="user-update_replay">
                            <img src={user_img} className="user-post_img" />
                            <div className="post-update">
                                <form onSubmit={(event) => submitMsg(event, true)}>
                                    <InputBox className="form-control title-content" placeholder="Write a reply"
                                        value={relyMsg}
                                        onChange={(event) => { setRelyMsg(event.target.value) }}
                                    />
                                </form>
                            </div>
                        </div>
                        <div className="row m-0">
                            <div className="col-11 p-0">
                                <div className="staff-content">
                                    <img src={user_img} className="user-post_img" />
                                    <div className="staff-info_content">
                                        <p className="staff-content_name">Nguyễn Trọng </p>
                                        <p className="staff-content_label">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tellus ac, accumsan tellus etiam morbi. Eu accumsan proingm porta feugiat consectetur faucibus.</p>
                                        <div className="replay-content">
                                            <div className="replay-content_label">
                                                <p className="replay_label">reply</p>
                                                <p className="replay_time">Today <span className="dot-content"></span> 11:00AM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-1 p-0">
                                <div class="option-views">
                                    <MoreHorizontal className="svg-icon_small icon-default" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div> */}

                <InfiniteScroll
                  dataLength={convArr.length}
                  next={getConversation}
                  hasMore={true}
                >
                {convArr && convArr.length > 0 && convArr.map((convItems, conveIndex) => {
                    return (
                        <div>
                            <div className="conversation-content">
                                <div className="conversation-content_post">
                                    <div className="row m-0">
                                        <div className="col-11 p-0">
                                            <div className="staff-content">
                                                <img src={convItems.PhotoImgID ? '/Image/getImage/' + convItems.PhotoImgID : user_img} className="user-post_img" alt="img" />
                                                <div className="staff-info_content">
                                                    <p className="staff-content_name">{convItems.name}{convItems.pTyp === 'STF' && <span>{'Teacher'}</span>}</p>
                                                    <p className="staff-content_label">{convItems.msg}</p>
                                                    <div className="replay-content">
                                                        <div className="replay-content_label">
                                                            <UIPerWrapper perCode={['rp_can_create_lms_conver','lms_student']}>
                                                                <StudentArchiveConversationWrapper isConVersationView={_.isEmpty(isArchCrsEnable) ? false : true}>
                                                                <p className="replay_label" onClick={() => setIsRely(conveIndex)}>{i18next.t("translate:REPLY")}</p>
                                                                </StudentArchiveConversationWrapper>
                                                            </UIPerWrapper>
                                                            <p className="replay_time">{convItems.isToday ? <span>{i18next.t("translate:TODAY")}</span> : convItems.isYesterday ? <span>{i18next.t("translate:YESTERDAY")}</span> : lmsDateFormat(convItems.CrAt)} <span className="dot-content"></span> {lmsTimeFormat(convItems.CrAt)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <StudentArchiveConversationWrapper isConVersationView={_.isEmpty(isArchCrsEnable) ? false : true}>
                                        <div className="col-1 p-0">
                                                {convItems.mreIcon &&
                                                    <div class="option-views" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <MoreHorizontal className="svg-icon_small icon-default icon-pointer" />
                                                    </div>
                                                }
                                            <div class="dropdown-menu conversation-edit_cont">
                                                <div class="dropdown-item user-info_contents" onClick={() => deleteConver(convItems._id,convItems.cTyp)}>
                                                    <Trash2 className="svg-icon_light icon-error" />
                                                    <span className="conversation-delete"> {i18next.t("translate:DELETE")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        </StudentArchiveConversationWrapper>
                                    </div>
                                </div>
                                {/* replay content start */}
                                <div>
                                    {isRely === conveIndex &&
                                        <div className='user-update_replay'>
                                            <img src={convItems.PhotoImgID ? '/Image/getImage/' + convItems.PhotoImgID : user_img} className="user-post_img" alt="img" />
                                            <div className="post-update">
                                                <form onSubmit={(event) => submitMsg(event, true, convItems._id)}>
                                                    <InputBox className="input-block" placeholder="Write a reply"
                                                        value={relyMsg}
                                                        onChange={(event) => { setRelyMsg(event.target.value) }}
                                                    />
                                                </form>
                                            </div>
                                        </div>
                                       
                                        
                                    }
                                       {/* <div className="reply-btn_option">
                                          <Button theme="btn-rounded default btn-right">Post reply</Button>
                                          <Button theme="btn-rounded btn-outline">Cancel</Button>
                                          </div> */}
                                    {/* <div className="conversation-content_replay"> */}
                                    {/* && index === convItems.aReplyAry.length-1 */}
                                    <div>
                                        {convItems && convItems.aReplyAry && convItems.aReplyAry.map((item, index) => {
                                            return (
                                                <div className='conversation-content_replay'>
                                                    {
                                                        // Scroll down to last reply after entered
                                                        (isRely === conveIndex) && 
                                                        <div ref={messagesEndRef} />
                                                    }
                                                    <div className="row m-0">
                                                        <div className="col-11 p-0">
                                                            <div className="staff-content">
                                                                <img src={item.PhotoImgID ? '/Image/getImage/' + item.PhotoImgID : user_img} className="user-post_img" alt="img"/>
                                                                <div className="staff-info_content">
                                                                    <p className="staff-content_name">{item.name}{item.pTyp === 'STF' && <span>{'Teacher'}</span>}</p>
                                                                    <p className="staff-content_label">{item.msg}</p>
                                                                    <div className="replay-content">
                                                                        <div className="replay-content_label">
                                                                            {/* <p className="replay_label">reply</p> */}
                                                                            <p className="replay_time">{item.isToday ? <span>{i18next.t("translate:TODAY")}</span> : item.isYesterday ? <span>{i18next.t("translate:YESTERDAY")}</span> : lmsDateFormat(item.CrAt)} <span className="dot-content"></span> {lmsTimeFormat(item.CrAt)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-1 p-0">
                                                        {item.mreIcon &&
                                                    <div class="option-views" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                         <MoreHorizontal className="svg-icon_small icon-default icon-pointer" />
                                                    </div>
                                                        }
                                                            <div class="dropdown-menu conversation-edit_cont">
                                                                <div class="dropdown-item user-info_contents" onClick={() => deleteConver(item._id,item.cTyp)}>
                                                                    <Trash2 className="svg-icon_light icon-error" />
                                                                    <span className="conversation-delete"> {i18next.t("translate:DELETE")}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* } */}
                            </div>
                            {/* rely content end */}

                        </div>

                    )
                })}
                </InfiniteScroll>

                {/* put replay convoo */}


                {/* <div className="conversation-content">
                    <div className="conversation-content_post">
                        <div className="row m-0">
                            <div className="col-11 p-0">
                                <div className="staff-content">
                                    <img src={user_img} className="user-post_img" />
                                    <div className="staff-info_content">
                                        <p className="staff-content_name">Nguyễn Trọng <span>Teacher</span></p>
                                        <p className="staff-content_label">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tellus ac, accumsan tellus etiam morbi. Eu accumsan proingm porta feugiat consectetur faucibus.</p>
                                        <div className="replay-content">
                                            <div className="replay-content_label">
                                                <p className="replay_label">reply</p>
                                                <p className="replay_time">Today <span className="dot-content"></span> 11:00AM</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-1 p-0">
                                <div class="option-views">
                                    <MoreHorizontal className="svg-icon_small icon-default" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}











            </div>
        </div>
    )

}

export default ConversationComponent;