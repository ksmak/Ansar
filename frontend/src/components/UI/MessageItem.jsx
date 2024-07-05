import React from 'react'
import { ContentState, EditorState } from "draft-js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import htmlToDraft from "html-to-draftjs";
import { Editor } from "react-draft-wysiwyg";
import moment from 'moment';
import 'moment/locale/ru';

const MessageItem = ({children, item, userId, ...props}) => {
    const blocksFromHtml = htmlToDraft(item.text);
    const { contentBlocks, entityMap } = blocksFromHtml;
    const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
    const editorState = EditorState.createWithContent(contentState);
    return (
        <div {...props} 
            className={[
                "text-black p-4 m-4 border-blue-gray-300 border rounded-lg",
                item.from_user === userId ? "bg-messageownercolor" : "bg-messageothercolor"
            ].join(" ")}>
            <div className="font-mono text-black text-sm flex flex-row gap-3 justify-start items-center">
                <FontAwesomeIcon icon={faUser} />
                <div className='text-bold'>{item.fullname}</div>
                <div className='italic'>{moment(item.creation_date).locale('ru').format('LLLL')}</div>
            </div>   
            <Editor toolbarHidden editorState={editorState} readOnly={true} />
        </div>
    );
};

export default MessageItem