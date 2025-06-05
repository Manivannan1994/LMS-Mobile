import React, { useRef } from 'react';
import '../../styles/_modelbarStyle.scss';
import '../../styles/_commonLmsStyle.scss';
import userimg from "../../assets/images/user-profile.png";
import InputBox from '../input-box/InputBox';
import LmsEditor from '../lms-editor/LmsEditor';
import Button from '../button/Button';
import { Cross } from '../icons/Icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'
import { useState, useEffect } from 'react';
import { getTheGradingStuds } from '../../store/actions/GradeBookActions';
import { getStaffsforsubjct } from '../../store/actions/StaffAction';
import { filterArray } from '../../utils/filter-util';
import  UserSession from '../../utils/UserSession';
import { createNewGroup } from '../../store/actions/ChatsAction';


const NewMessageModal = () => {
    const [studSearch, setStudSearch] = useState(''); //search text
    const [studData, setStudData] = useState([]);  //dropdown values on search
    const [recipients, setRecipients] = useState([]);  //To users 
    const [showAll,setShowAll]=useState(false);
    const [subject,setSubject] = useState('')
    const [messagecont,setMessagecont] = useState('')
    const [formvalidate, setFormvalidate] = useState(false)
    const { t } = useTranslation();
    const { state } = useLocation();
    const dispatch = useDispatch();
    const enrollStdsCpy = useSelector(state => state.gradeBookReducer.aGradStudentsCpy)
    const subjectStaff = useSelector(state => state.StaffReducer.substaff)
    const currentSession = UserSession.getSession()
    const selectionDivRef=useRef(null);
    const inputRef=useRef(null)

    // Get student details
    const getStudentDtls = () => {
        const oReq = {
            "SecID": state.SecID,
            "AcYr": state.AcYr,
            "InId": state.InId,
            "DeptID": state.DeptID,
            "PrID": state.PrID,
            "CrID": state.CrID,
            "SemID": state.SemID,
            "SubID": state.subId,
            "getStuds": true,
            "OID": state.InId,
            "StaffID": state.StaffId,
            "isFE": currentSession?.fe,
            "TPID": state.TPID,
            "isLms": true,
            "isFrmLms": true
        }
        dispatch(getTheGradingStuds(oReq));
    }

    const handleShowAll=(show)=>{
        if(enrollStdsCpy.length > 0 && studSearch === "" && (studData.length===0 || studData.length===enrollStdsCpy.length) && show){
            setShowAll(show)
        }
        else{
            
                setShowAll(false);
            
        }
    }
    
    useEffect(() => {
        getStudentDtls()
        if(currentSession && currentSession?.utype === "student"){
            let OReq ={
                AcYr:state.AcYr,
                CrID:state.CrID,
                PrID:state.PrID,
                InId:state.InId,
                SecID:state.SecID,
                SemID:state.SemID,
                DeptID:state.DeptID,
                SubjId: state.subId
            }
            dispatch(getStaffsforsubjct(OReq))
        }
    }, [currentSession?.utype])

    useEffect(() => {
        setRecipients(subjectStaff.map((d) => {
            return {std:d,toQuery:{SrID:d._id,uType:'Staff'}}
        }))
    },[subjectStaff])

  // Function to track whether a click occurred inside the selectionDiv
  const handleDocumentClick = (e) => {
    if (selectionDivRef.current && !selectionDivRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
        setShowAll(() => false);
    } 
  };
      // Add a click event listener to the document to track clicks
  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

    // Student search handler
    useEffect(() => {
        if (studSearch !== "") {
            let student = enrollStdsCpy.filter((student) => {
                if (
                    student?.AplnNum?.toLowerCase()?.includes(studSearch?.toLowerCase()) ||
                    student?.FNa?.toLowerCase()?.includes(studSearch?.toLowerCase()) ||
                    student?.CnEmail?.toLowerCase()?.includes(studSearch?.toLowerCase())||
                    student?.LNa?.toLowerCase()?.includes(studSearch?.toLowerCase())
                ) return student
            })
            if(student.length>0 && recipients.length>0){
                student=student.filter((st)=>{
                if(!recipients.some((rc)=>st.StuID === rc.std.StuID)){
                    return st
                }
            })
            }
            setStudData([...student])
        } else {
            setStudData(enrollStdsCpy)
        }
        setShowAll(false)
    }, [studSearch])

    const handleClearStates = () => {
        setStudSearch('')
        setMessagecont('')
        setSubject('')
        setFormvalidate(false)
        if(currentSession?.utype === "Staff"){
        setRecipients([])
        setStudData([])
        setShowAll(false)
        }
    }

    const selectAllRecipt = ()=>{
        if(recipients?.length !== enrollStdsCpy?.length){
            setRecipients(enrollStdsCpy.map((std)=>{
                 let selctedRecip = {SrID:std.StuID,uType:'student'}
                 return {std:std,toQuery:selctedRecip}
             }))
        }
        else{
            setRecipients([])
        }
        setStudSearch('')
        setShowAll(false)
    }

    const handleRecipClick = (std) => {
        let selctedRecip = {SrID:std.StuID,uType:'student'}
        setRecipients([...recipients, {std:std,toQuery:selctedRecip}])
        setStudSearch('')
    }

    const handleRemoverrecip = (StuID) => {
        setRecipients(recipients.filter(d => d.std.StuID !== StuID))
    }

    const handleCreateNew = () =>{

        let OReq ={
            AcYr:state.AcYr,
            CrID:state.CrID,
            PrID:state.PrID,
            InId:state.InId,
            SecID:state.SecID,
            SemID:state.SemID,
            DeptID:state.DeptID,
            subjId: state.subId,
            topicName:subject,
            grpAds:[],
            message:{type:"text",content:messagecont},
            recipients: recipients.map(({std,toQuery}) => toQuery)
        }
        if(OReq.recipients.length === 0 || subject === ""){
            setFormvalidate(true)
             return null
            }else{
                dispatch(createNewGroup(OReq))
                handleClearStates()
            }
    }



    return (

        <div className="modal right fade" id="message-page" role="dialog">
            <div className="modal-dialog">
                <div className="modal-content modal-message-page">
                    <div className="modal-header header-content">
                        <div onClick={() => handleClearStates()} className="close" data-dismiss="modal" aria-label="Close">
                            <Cross iconStyle="svg-icon_small icon-pointer" />
                        </div>
                        <p className="modal-title right-model_heading" id="myModalLabel">{t("translate:NEW_MESSAGE")}</p>
                    </div>
                    <div className="modal-body">
                        <div className=" form-group">
                            <div className="input-details">
                                <label for="fname" className="form-lable">{t("translate:MESSAGE_TO")}</label>
                                {currentSession?.utype === "Staff" ?
                                    <>
                                        <InputBox placeholder={t("translate:MESSAGE_MODAL_TYPE_A_NAME")} className="input-block" value={studSearch} onChange={(e) => setStudSearch(e.target.value)} onFocus={()=>handleShowAll(true)} refer={inputRef}/>
                                        {(subject !=='' & recipients.length ===0) || formvalidate ? <p className='text-required'>Required</p> :<></>}
                                        
                                    {recipients.length > 0 && <div className='recipient-cont' id="scroll-style"> {recipients.map((recip) =>
                                        <div className="recipient">
                                            {recip.std?.FNa || recip.std.FoNa} {recip.std?.LNa || recip.std?.SuNa}
                                            {recip.std?.FNa &&
                                                <span onClick={() => handleRemoverrecip(recip.std?.StuID)}><Cross iconStyle="svg-icon_small icon-pointer" /></span>
                                            }
                                        </div>
                                    )} </div>}</>:<>{ recipients.length === 0 &&
                                    <div className="no-staff_class text-required">
                                        {t("translate:STUDENT_NOT_SELECTED")}
                                    </div>}</>
                                }{
                                    showAll && <div hidden={false} className='recipient-search' ref={selectionDivRef}>
                                    <div>
                                    {<div onClick={(e)=>{e.stopPropagation();selectAllRecipt()}} className="message-lists ">
                                    <div className="messages-titles">
                                                    <p className="message_content">{recipients?.length !== enrollStdsCpy?.length ?"Select all":"Unselect all"}</p>
                                    </div>
                                    </div>}</div></div>
                                }
                                {studSearch !== "" &&
                                    <div hidden={false} className='recipient-search' id="scroll-style">
                                        
                                       
                                            {studData.length > 0 ?<> {<div onClick={selectAllRecipt} className="message-lists ">
                                        <div className="messages-titles">
                                                        <p className="message_content">{recipients?.length !== enrollStdsCpy?.length ?"Select all":"Unselect all"}</p>
                                        </div>
                                        </div>} {studData.map((std) =>
                                                <div onClick={() => handleRecipClick(std)} className="message-lists ">
                                                    <img className='chat-profile-image' src={userimg} alt='primg' />
                                                    <div className="messages-titles">
                                                        <p className="message_heading">{std.FNa} {std.LNa}</p>
                                                        <p className="message_content">{std.AplnNum}</p>
                                                    </div>
                                                </div>
                                            )}</>
                                                : <p> No records available</p>
                                            }
                                        </div>
                                }
                            </div>
                            {/* <div className="input-details">
                              <CheckBox className="check-box" onChange={(event) => { }} />&nbsp;&nbsp;<span>Send an individual message to each recipient</span>
                           </div> */}
                            <div className="input-details">
                                <label for="fname" className="form-lable">{t("translate:MESSAGE_TO_SUBJECT")}</label>
                                <InputBox placeholder={t("translate:MESSAGE_TO_E_SUBJECT")} className="input-block" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                {(subject ===''&  formvalidate) ?<p className='text-required'>Required</p> :<></>}
                            </div>
                            <div className="input-details">
                                <label for="fname" className="form-lable">{t("translate:MESSAGE_TO_MESSAGE")}</label>
                                <LmsEditor value={messagecont}  onChange={(e) => setMessagecont(e)} placeholder={t("translate:MESSAGE_ENTER_MESSAGE")}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='model-footer'>
                        <div className='bottom-section'>
                            <div className='bottom-button-section'>
                                <div className="close" data-dismiss="modal" aria-label="Close">
                                    <Button clicked={() => handleClearStates()} theme="btn-rounded secondary-btn ">{t("translate:MESSAGE_CANCEL")}</Button>
                                </div>
                                <div className="close" data-dismiss={(recipients.length && subject !=="") ? "modal" : ""} aria-label="Close">
                                <Button clicked={() => handleCreateNew()} theme="btn-rounded default">{t("translate:MESSAGE_SEND")}</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewMessageModal