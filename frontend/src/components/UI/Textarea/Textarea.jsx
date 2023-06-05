import React from 'react';

import cls from './Textarea.module.scss';


const Textarea = ({children, ...props}) => {
    return (
        <textarea {...props} className={cls.textarea}>
            {children}
        </textarea>
    );
};

export default Textarea;