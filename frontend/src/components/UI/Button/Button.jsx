import React from 'react';

import cls from './Button.module.scss';


const Button = ({children, ...props}) => {
    return (
        <button {...props} className={cls.button}>
            {children}
        </button>
    )
}

export default Button