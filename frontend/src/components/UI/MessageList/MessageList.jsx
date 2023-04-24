import React from 'react'
import MessageItem from '../MessageItem/MessageItem';
import File from '../File/File';

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
                                { item.text 
                                    ? item.text
                                    : item.file 
                                        ? <File 
                                            filename={item.file}
                                            path={"http://127.0.0.1:8000" + item.file} >
                                          </File>  
                                        : ""
                                }
                            </MessageItem>
                    )
                : ""
            }
        </div>
    )
}

export default MessageList