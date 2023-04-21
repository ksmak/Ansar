// React
import React from 'react'

// CSS
import cls from './MessageItem.module.scss'

const MessageItem = ({children, item, user_id, ...props}) => {
    return (
        <div {...props} 
            className={[
                cls.message__item,
                item.selected ? cls.selected : "", 
                item.from_user === user_id ? cls.message_owner : cls.message_other
            ].join(" ")}>
            {children}
        </div>
    );
};

export default MessageItem