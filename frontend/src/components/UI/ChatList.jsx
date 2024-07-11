import React from 'react';
import ChatItem from './ChatItem';

const ChatList = ({ chatType, items, onItemClick, selectItem, countMsg }) => {
    return (
        <div className='p-5 overflow-y-auto'>
            {items.length > 0
                ? items.map(item => (
                    <ChatItem
                        key={item.id}
                        chatType={chatType}
                        item={item}
                        onItemClick={onItemClick}
                        selectItem={selectItem}
                        count={countMsg[`${chatType}_${item.id}`]}
                    />
                ))
                : null
            }
        </div>
    );
};

export default ChatList;