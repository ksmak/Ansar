import React from 'react';
import MessageItem from '../MessageItem/MessageItem';
import FileItem from '../FileItem/FileItem';
import cls from './MessageList.module.scss';

const MessageList = ({ items, userId }) => {
    return (
        <div className={cls.message__list}>
            {items.length
                ? items.map((item) => (
                    item.file   
                        ? <FileItem
                            key={item.id}
                            item={item}
                            userId={userId}
                            filename={decodeURI(item.file.slice(item.file.lastIndexOf('/') + 1))}
                            path={process.env.REACT_APP_API_HOST + item.file} />
                        : <MessageItem
                            key={item.id}
                            item={item}
                            userId={userId}
                        />
                ))
                : ""}
        </div>
    )
}

export default MessageList;