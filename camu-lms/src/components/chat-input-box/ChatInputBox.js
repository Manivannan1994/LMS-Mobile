import React from 'react';
import '../../styles/_chatInputBoxStyle.scss'

const ChatInputBox = (props) => {
    return(
        <>
        <input type="text" id={props.id} name={props.name} className={props.className} value={props.value} onKeyDown={props.onKeyDown} onChange={props.onChange} onBlur = {props.onBlur} placeholder={props.placeholder} disabled={props.defaultDisabled}></input>
        </>
    )
}

export default ChatInputBox;