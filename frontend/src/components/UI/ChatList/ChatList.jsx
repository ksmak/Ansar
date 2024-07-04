import React from 'react';
import ChatItem from '../ChatItem/ChatItem';
import cls from './ChatList.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faUser } from '@fortawesome/free-solid-svg-icons';

const ChatList = ({ chat_type, items, onItemClick, is_visible, selectItem }) => {
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
                            {chat_type === "user"
                            ? <FontAwesomeIcon icon={faUser} /> 
                            : <FontAwesomeIcon icon={faUserGroup} /> }
                            <span>{item.title || item.full_name}</span>
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