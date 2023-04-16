// React
import React from 'react'

// CSS
import cls from './MessageItem.module.css'

const MessageItem = ({children, ...props}) => {
    return (
        <div {...props} className={cls.message__item}>
            {children}
        </div>
    );
};

export default MessageItem