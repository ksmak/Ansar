import React from 'react';

import cls from './Label.module.scss';


const Label = ({children, ...props}) => {
    return (
        <label {...props} className={cls.label}>
            {children}
        </label>
    );
};

export default Label;