import React from 'react'

import cls from './MessageItem.module.scss'


const MessageItem = ({children, item, user_id, ...props}) => {
    return (
        <div {...props} 
            className={[
                cls.message__item,
                item.selected ? cls.selected : "", 
                item.from_user === user_id ? cls.message__owner : cls.message__other,
                item.file ? cls.message__file : "",
            ].join(" ")}>
            {children}
        </div>
    );
};

export default MessageItem