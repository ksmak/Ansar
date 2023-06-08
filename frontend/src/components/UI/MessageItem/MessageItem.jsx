import React from 'react'

import cls from './MessageItem.module.scss'


const MessageItem = ({children, item, userId, ...props}) => {
    return (
        <div {...props} 
            className={[
                cls.message__item,
                item.selected ? cls.selected : "", 
                item.from_user === userId ? cls.message__owner : cls.message__other,
                item.file ? cls.message__file : "",
            ].join(" ")}>
            {children}
        </div>
    );
};

export default MessageItem