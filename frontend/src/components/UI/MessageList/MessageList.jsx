// React
import React from 'react'

// Components
import MessageItem from '../MessageItem/MessageItem'

// CSS
import cls from './MessageList.module.scss'

const MessageList = ({items, user_id}) => {
    return (
        <div className={cls.message__list}>
            {items.length 
                ? items.map((item) => 
                            <MessageItem
                                key={item.id}
                                item={item}
                                user_id={user_id}
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