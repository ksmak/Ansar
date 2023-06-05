import React from 'react';

import MessageItem from '../MessageItem/MessageItem';
import FileItem from '../FileItem/FileItem';

import cls from './MessageList.module.scss';

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
                                { item.file
                                    ? <FileItem
                                        filename={decodeURI(item.file.slice(item.file.lastIndexOf('/') + 1))}
                                        path={process.env.REACT_APP_API_HOST + item.file} >
                                      </FileItem>  
                                    : item.text
                                }
                            </MessageItem>
                    )
                : ""
            }
        </div>
    )
}

export default MessageList;