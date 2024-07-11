import FileIcon from './FileIcon';

const FileItem = ({ item }) => {
    const filename = decodeURI(item.file.slice(item.file.lastIndexOf('/') + 1));
    const path = process.env.REACT_APP_API_HOST + item.file;

    return (
        <div className='text-primary flex flex-col gap-3 items-center'>
            <p className="text-lg pt-2">{filename}</p>
            <FileIcon filename={filename} path={path} />
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