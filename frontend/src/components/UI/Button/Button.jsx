// React
import React from 'react'

// CSS
import cls from './Button.module.scss'

const Button = ({children, ...props}) => {
    return (
        <button {...props} className={cls.button}>
            {children}
        </button>
    )
}

export default Button