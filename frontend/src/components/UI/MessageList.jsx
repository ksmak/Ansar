import MessageItem from './MessageItem';

const MessageList = ({ items, userId, changeMessage, deleteMessage }) => {
    return (
        <div >
            {items.length > 0 && items.map((item) => (
                <MessageItem
                    key={item.id}
                    item={item}
                    userId={userId}
                    changeMessage={changeMessage}
                    deleteMessage={deleteMessage}
                />
            ))
            }
        </div>
    )
}

export default MessageList;