import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileWord, faFileExcel, faFile, faFileArchive } from '@fortawesome/free-solid-svg-icons';

const FileIcon = ({ filename, path }) => {
    const fileExt = filename.split('.').pop().toLowerCase();
    
    return (
        <div>
            {fileExt === "xls" || fileExt === "xlsx"
                ? <FontAwesomeIcon icon={faFileExcel} size="8x" />
                : fileExt === "doc" || fileExt === "docx"
                    ? <FontAwesomeIcon icon={faFileWord} size="8x" />
                    : fileExt === "rar" || fileExt === "zip"
                        ? <FontAwesomeIcon icon={faFileArchive} size="8x" />
                        : fileExt === "jpg" || fileExt === "png" || fileExt === "gif" || fileExt === "bmp" || fileExt === "jpeg"
                            ? <div className="w-96 h-64" style={{
                                backgroundImage: "url('" + path + "')",
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                            }}></div>
                            : <FontAwesomeIcon icon={faFile} size="8x" />}
        </div>
    );
}

export default FileIcon;