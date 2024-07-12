import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";
import { Editor } from "react-draft-wysiwyg";

const DialogEditMessage = ({ editItem, setEditItem, editorEditState, onEditorEditStateChange, handleEditMessage }) => {
    return (
        <div className="absolute w-full">
            <Dialog
                open={editItem !== null}
                handler={() => setEditItem(null)}
            >
                <DialogHeader></DialogHeader>
                <DialogBody className="text-center">
                    <Editor
                        editorStyle={{ height: '5rem' }}
                        editorState={editorEditState}
                        toolbarClassName="toolbar-class"
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        onEditorStateChange={onEditorEditStateChange}
                    />
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={() => setEditItem(null)}
                        className="mr-1"
                    >
                        <span>Отмена</span>
                    </Button>
                    <Button
                        variant="gradient"
                        color="blue"
                        size="sm"
                        onClick={handleEditMessage}
                    >
                        <span>Сохранить</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default DialogEditMessage;