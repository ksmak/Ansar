// React
import React from 'react'

// Components
import MessageItem from '../MessageItem/MessageItem'

// CSS
import cls from './MessageList.module.scss'

const MessageList = ({items, userId}) => {
    return (
        <div className={cls.message__list}>
            {items.length 
                ? items.map((item) => 
                            <MessageItem
                                key={item.id}
                                item={item}
                                user_id={userId}
                            >
                                {item.text}
                            </MessageItem>
                    )
                : ""
            }
        </div>
    )
}

export default MessageList