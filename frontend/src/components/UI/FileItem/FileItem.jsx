import React from 'react';
import DownloadButton from '../DownloadButton/DownloadButton';
import cls from './FileItem.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWord, faFileExcel, faFile, faFileArchive, faUser } from '@fortawesome/free-solid-svg-icons';
import moment from "moment";

const FileItem = ({ item, userId, filename, path }) => {
    const fileExt = filename.split('.').pop().toLowerCase();
    return (
        <div className={[
            cls.file__box,  
            item.selected ? cls.selected : "",
            item.from_user === userId ? cls.file__owner : cls.file__other,
        ].join(" ")}>
            <div className={cls.file__userinfo}>
                <FontAwesomeIcon icon={faUser} />
                <strong>{item.fullname}</strong>
                <span>, {moment(item.creation_date).format('LLLL')}</span>
            </div>   
            <p className={cls.file__title}>{filename}</p>
            {fileExt === "xls" || fileExt === "xlsx"
                ? <FontAwesomeIcon icon={faFileExcel} size="8x" />
                : fileExt === "doc" || fileExt === "docx"
                    ? <FontAwesomeIcon icon={faFileWord} size="8x" />
                    : fileExt === "rar" || fileExt === "zip"
                        ? <FontAwesomeIcon icon={faFileArchive} size="8x" />
                        : fileExt === "jpg" || fileExt === "png" || fileExt === "gif" || fileExt === "bmp" || fileExt === "jpeg"
                            ? <div className={cls.file__img} style={{
                                backgroundImage: "url('" + path + "')",
                                backgroundSize: 'contain',
                                backgroundRepeat: 'no-repeat',
                            }}></div>
                            : <FontAwesomeIcon icon={faFile} size="8x" />}
            <div className={cls.file__button}>
                <DownloadButton
                    onClick={() => {
                        let ref = document.createElement('a');
                        ref.href = path;
                        ref.click();
                    }}
                >
                    Загрузить
                </DownloadButton>
            </div>
        </div>
    )
}

export default FileItem