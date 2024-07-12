import { faUser, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Badge, Tooltip, Typography } from "@material-tailwind/react";
import moment from 'moment';
import 'moment/locale/ru';

const ChatItem = ({ chatType, item, onItemClick, selectItem, count }) => {
    const content =
        <Typography>
            {chatType === "user"
                ? item.online?.last_date
                    ? <Tooltip
                        className="hover:cursor-pointer"
                        content={
                            < div className="w-96">
                                <Typography
                                    variant="small"
                                    color="white"
                                    className="font-normal opacity-80"
                                >
                                    {moment(item.online?.last_date).locale('ru').format('LLLL')}
                                </Typography>
                            </div>}
                    >
                        <FontAwesomeIcon icon={faUser} className={item.online?.is_active ? "text-formbgcolor" : "text-blue-gray-500"} />
                    </Tooltip>
                    : <FontAwesomeIcon icon={faUser} className="text-blue-gray-500" />
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