import React from 'react';

import cls from './DownloadButton.module.scss';


const DownloadButton = ({children, ...props}) => {
    return (
        <button {...props} className={cls.button}>
            {children}
        </button>
    )
}

export default DownloadButton;