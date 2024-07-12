import { Button } from '@material-tailwind/react';
import FileIcon from './FileIcon';

const FileItem = ({ item }) => {
    const filename = decodeURI(item.file.slice(item.file.lastIndexOf('/') + 1));
    const path = process.env.REACT_APP_API_HOST + item.file;

    return (
        <div className='text-primary flex flex-col gap-3 items-center'>
            <p className="text-lg pt-2">{filename}</p>
            <FileIcon filename={filename} path={path} />
            <Button
                variant='gradient'
                color='blue'
                size='sm'
                onClick={() => {
                    let ref = document.createElement('a');
                    ref.href = path;
                    ref.click();
                }}
            >
                Загрузить
            </Button>
        </div>
    )
}

export default FileItem