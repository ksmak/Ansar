// React
import React from 'react'

// CSS
import cls from './RoomItem.module.scss'

const RoomItem = ({children, active, ...props}) => {
    return (
        <div {...props} className={cls.room__item + (active ? " active": "")}>
            {children}
        </div>
    );
};

export default RoomItem