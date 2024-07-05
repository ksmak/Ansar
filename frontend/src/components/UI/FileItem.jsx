import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWord, faFileExcel, faFile, faFileArchive, faUser } from '@fortawesome/free-solid-svg-icons';
import moment from "moment";
import 'moment/locale/ru';

const FileItem = ({ item, userId, filename, path }) => {
    const fileExt = filename.split('.').pop().toLowerCase();
    return (
        <div className={[
            "w-96 m-4 p-3 border border-blue-gray-300 rounded-lg flex flex-col gap-3",
            item.from_user === userId ? "bg-messageownercolor" : "bg-messageothercolor"
        ].join(" ")}>
            <div className="font-mono text-black text-sm flex flex-row gap-3 justify-start items-center">
                <FontAwesomeIcon icon={faUser} />
                <div className='text-bold'>{item.fullname}</div>
                <div className='italic'>{moment(item.creation_date).locale('ru').format('LLLL')}</div>
            </div>
            <div className='text-primary flex flex-col gap-3 items-center'>
                <p className="text-lg">{filename}</p>
                {fileExt === "xls" || fileExt === "xlsx"
                    ? <FontAwesomeIcon icon={faFileExcel} size="8x" />
                    : fileExt === "doc" || fileExt === "docx"
                        ? <FontAwesomeIcon icon={faFileWord} size="8x" />
                        : fileExt === "rar" || fileExt === "zip"
                            ? <FontAwesomeIcon icon={faFileArchive} size="8x" />
                            : fileExt === "jpg" || fileExt === "png" || fileExt === "gif" || fileExt === "bmp" || fileExt === "jpeg"
                                ? <div className="w-80 h-56" style={{
                                    backgroundImage: "url('" + path + "')",
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                }}></div>
                                : <FontAwesomeIcon icon={faFile} size="8x" />}
            </div>
            <button
                className='font-mono p-2 text-white bg-formbgcolor border border-blue-gray-400 rounded-lg self-center w-fit'
                onClick={() => {
                    let ref = document.createElement('a');
                    ref.href = path;
                    ref.click();
                }}
            >
                Загрузить
            </button>
        </div>
    )
}

export default FileItem