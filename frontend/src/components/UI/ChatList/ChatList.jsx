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
                ? items.map((el) => {
                    return (
                        <ChatItem 
                            key={el.item.id}
                            onClick={() => onItemClick(el)}
                            item={el.item}
                            selectItem={selectItem}
                        >
                            {el.item.title || el.item.full_name}
                        </ChatItem>
                    )
                })
                : "Nothing"
            }
        </div>
        : ""
    );
};

export default ChatList;