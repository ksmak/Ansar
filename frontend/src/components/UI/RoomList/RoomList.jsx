// React
import React from 'react'

// Project
import RoomItem from '../RoomItem/RoomItem';

// CSS
import cls from './RoomList.module.scss'

const RoomList = ({ items, onItemClick }) => {
    return (
        <div className={cls.room__list}>
            {items.length
                ? items.map((item) => {
                    return (
                        <RoomItem key={item.title} active={item.active} onClick={() => onItemClick(item.id)}>
                            {item.title}
                        </RoomItem>
                    )
                })
                : "Nothing"
            }
        </div>
    );
};

export default RoomList;