import CheckReader from './CheckReader';
import MsgHeader from './MsgHeader';
import FileItem from './FileItem';
import TextItem from './TextItem';

const MessageItem = ({ item, userId, changeMessage, deleteMessage }) => {
    return (
        <div className={[
            "text-black p-3 m-4 border-blue-gray-300 border rounded-lg",
            item.from_user === userId ? "bg-messageownercolor" : "bg-messageothercolor",
            !!item.file ? "w-1/3" : ""
        ].join(" ")}>
            <MsgHeader userId={userId} item={item} changeMessage={changeMessage} deleteMessage={deleteMessage} />
            {
                item.state === 1
                    ? !!item.file
                        ? <FileItem item={item} />
                        : <TextItem item={item} />
                    : <div className='font-mono italic p-5 text-lg'>Сообщение удалено пользователем.</div>
            }
            {item.readers.length > 0 && <CheckReader readers={item.readers} />}
        </div >
    );
};

export default MessageItem