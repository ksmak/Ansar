import React from 'react';

import Button from '../Button/Button';

import cls from './FileItem.module.scss';


const FileItem = ({filename, path}) => {
    return (
        <div className={cls.file__box}>
            <p className={cls.file__title}>{filename}</p>
            <div className={cls.file__img} style={{
                backgroundImage: "url('"+path+"')",
                backgroundRepeat: 'no-repeat', 
                backgroundSize: 'cover',
            }}></div>
            <div className={cls.file__button}>
                <Button>Загрузить</Button>
            </div>
        </div>
  )
}

export default FileItem