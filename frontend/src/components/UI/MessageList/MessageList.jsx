// React
import React from 'react'

// Components
import MessageItem from '../MessageItem/MessageItem'

// CSS
import cls from './MessageList.module.css'

const MessageList = ({items}) => {
    return (
        <div className={cls.message__list}>
            {items.length 
                ? items.map((item) => <MessageItem key={item.id} className={item.selected ? cls.selected : ""}>{item.msg}</MessageItem>)
                : ""
            }
        </div>
    )
}

export default MessageList