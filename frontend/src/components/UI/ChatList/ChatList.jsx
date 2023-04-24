// React
import React from 'react'

// Project
import ChatItem from '../ChatItem/ChatItem';

// CSS
import cls from './ChatList.module.scss'

const ChatList = ({ items, onItemClick, is_visible, selectItem }) => {
    return (
        is_visible ?
        <div className={cls.chat__list}>
            {items.length
                ? items.map((item) => {
                    return (
                        <ChatItem 
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            item={item}
                            selectItem={selectItem}
                        >
                            {item.title || item.full_name}
                        </ChatItem>
                    )
                })
                : ""
            }
        </div>
        : ""
    );
};

export default ChatList;