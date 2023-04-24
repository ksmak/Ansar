import React from 'react';

import cls from './File.module.scss';

const File = ({filename, path}) => {
    const imgStyle = {
        backgroundImage: "url('"+path+"')",
        backgroundRepeat: 'no-repeat',
        width:'250px' 
    }
    return (
        <div className={cls.file__box}>
            <h3>{filename}</h3>
            <div style={imgStyle}></div>
            <a href={path}>Загрузить123</a>
        </div>
  )
}

export default File