import React from 'react'

import cls from './ChatItem.module.scss'


const ChatItem = ({children, item, selectItem, ...props}) => {
    return (
        <div {...props} className={[cls.chat__item, (item === selectItem ? cls.active: "")].join(' ')}>
            {children}
        </div>
    );
};

export default ChatItem