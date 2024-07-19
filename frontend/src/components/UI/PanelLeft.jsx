import {
    Typography,
    Badge,
} from "@material-tailwind/react";
import ChatList from "../UI/ChatList";

const PanelLeft = ({ 
    messageType, 
    setMessageType, 
    selectItem, 
    setSelectItem, 
    handleItemClick, 
    countChatMsg, 
    countUserMsg, 
    users, 
    chats 
}) => {
    return (
        <div className="h-full w-1/4 border-r-2 border-bordercolor flex flex-col">
            <div className="flex flex-row justify-between p-4">
                {!!countChatMsg?.total_count
                    ? <Badge
                        className="text-xs"
                        content={countChatMsg.total_count}>
                        <Typography
                            className="text-sm text-blue-gray-800 underline hover:cursor-pointer font-bold"
                            onClick={() => { setMessageType('chat'); setSelectItem(null) }}>
                            Группы
                        </Typography>
                    </Badge>
                    : <Typography
                        className="text-sm text-blue-gray-800 underline hover:cursor-pointer font-bold"
                        onClick={() => { setMessageType('chat'); setSelectItem(null) }}>
                        Группы
                    </Typography>}
                {!!countUserMsg?.total_count
                    ? <Badge
                        className="text-xs"
                        content={countUserMsg.total_count}>
                        <Typography
                            className="text-sm text-blue-gray-800 underline hover:cursor-pointer font-bold"
                            onClick={() => { setMessageType('user'); setSelectItem(null) }}>
                            Пользователи
                        </Typography>
                    </Badge>
                    : <Typography
                        className="text-sm text-blue-gray-800 underline hover:cursor-pointer font-bold"
                        onClick={() => { setMessageType('user'); setSelectItem(null) }}>
                        Пользователи
                    </Typography>}
            </div>
            <div className="grow overflow-y-auto">
                <ChatList
                    chatType={messageType}
                    items={messageType === 'user' ? users : chats}
                    onItemClick={handleItemClick}
                    selectItem={selectItem}
                    countMsg={messageType === 'user' ? countUserMsg : countChatMsg}
                />
            </div>
        </div>
    );
}

export default PanelLeft;