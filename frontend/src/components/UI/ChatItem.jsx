import { faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Typography } from "@material-tailwind/react";

const ChatItem = ({ chatType, item, onItemClick, selectItem, count }) => {
    const content =
        <Typography>
            {chatType === "user"
                ? <FontAwesomeIcon icon={faUser} />
                : <FontAwesomeIcon icon={faUserGroup} />}
            <span className="ml-2 text-sm">{item.title || item.full_name}</span>
        </Typography>;

    return (
        <div
            key={item.id}
            className={['w-full p-2 border-b-2 border-blue-gray-300 hover:cursor-pointer text-sm flex flex-row gap-5 justify-start items-center',
                item === selectItem ? "bg-chatselectcolor" : ""
            ].join(' ')}
            onClick={() => onItemClick(item)}
        >
            {!!count
                ? <Badge
                    className="text-xs"
                    content={count}>
                    {content}
                </Badge>
                : content}
        </div>
    );
}

export default ChatItem;