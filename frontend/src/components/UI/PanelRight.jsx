import {
    Button
} from "@material-tailwind/react";
import MessageList from "../UI/MessageList";
import { Editor } from "react-draft-wysiwyg";

const PanelRight = ({ messages, userId, handleOpenEditMessageDialog, handleOpenDeleteMessageDialog, handleSendMessage, handleSendFile, editorState, selectItem, messagesEndRef, onEditorStateChange }) => {
    return (
        <div className="h-full w-3/4 bg-blue-gray-50">
            {selectItem && <div className="h-full flex flex-col">
                <div className="grow overflow-y-auto border-bordercolor border-b-2">
                    <MessageList
                        items={messages}
                        userId={userId}
                        changeMessage={handleOpenEditMessageDialog}
                        deleteMessage={handleOpenDeleteMessageDialog}
                    />
                    <div ref={messagesEndRef} />
                </div>
                <div className="grow-0">
                    <Editor
                        editorStyle={{ height: '5rem' }}
                        editorState={editorState}
                        toolbarClassName="toolbar-class"
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        onEditorStateChange={onEditorStateChange}
                    />
                </div>
                <div className="grow-0 flex flex-row justify-end gap-5 p-2 mr-10">
                    <Button variant="gradient" color="blue" size="sm" onClick={handleSendMessage}>Отправить сообщение</Button>
                    <Button variant="gradient" color="blue" size="sm" onClick={handleSendFile}>Отправить файлы</Button>
                </div>
            </div>}
        </div>
    );
}

export default PanelRight;