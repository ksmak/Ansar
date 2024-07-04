import React from 'react'
import { ContentState, EditorState } from "draft-js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import htmlToDraft from "html-to-draftjs";
import { Editor } from "react-draft-wysiwyg";
import cls from './MessageItem.module.scss';
import moment from "moment";


const MessageItem = ({children, item, userId, ...props}) => {
    const blocksFromHtml = htmlToDraft(item.text);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);

    return (
        <div {...props} 
            className={[
                cls.message__item,
                item.selected ? cls.selected : "", 
                item.from_user === userId ? cls.message__owner : cls.message__other
            ].join(" ")}>
            <div className={cls.message__userinfo}>
                <FontAwesomeIcon icon={faUser} />
                <strong>{item.fullname}</strong>
                <span>, {moment(item.creation_date).format('LLLL')}</span>
            </div>    
            <Editor toolbarHidden editorState={editorState} readOnly={true} />
        </div>
    );
};

export default MessageItem