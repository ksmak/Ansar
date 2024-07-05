import React from 'react';
import MessageItem from './MessageItem';
import FileItem from './FileItem';

const MessageList = ({ items, userId }) => {
    return (
        <div>
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