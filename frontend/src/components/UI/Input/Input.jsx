import React from 'react';
import cls from './Input.module.scss'


const Input = ({children, ...props}) => {
    return (
        <input {...props} className={cls.input}>
            {children}
        </input>
    );
};

export default Input;