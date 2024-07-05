import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGroup, faUser } from '@fortawesome/free-solid-svg-icons';

const ChatList = ({ chat_type, items, onItemClick, is_visible, selectItem }) => {
    return (
        is_visible ?
        <div className='p-10 overflow-y-auto'>
            {items.length
                ? items.map((item) => {
                    return (
                        <div
                            className={['w-full p-5 border-b-2 border-blue-gray-300 hover:cursor-pointer text-sm flex flex-row gap-5 justify-start items-center', 
                                item === selectItem ? "bg-chatselectcolor": ""
                            ].join(' ')}
                            key={item.id}
                            onClick={() => onItemClick(item)}
                            item={item}
                            selectItem={selectItem}
                        >
                            {chat_type === "user"
                            ? <FontAwesomeIcon icon={faUser} /> 
                            : <FontAwesomeIcon icon={faUserGroup} /> }
                            <span>{item.title || item.full_name}</span>
                        </div>
                    )
                })
                : ""
            }
        </div>
        : ""
    );
};

export default ChatList;