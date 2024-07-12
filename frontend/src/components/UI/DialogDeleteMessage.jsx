import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";

const DialogDeleteMessage = ({ deleteItem, setDeleteItem, handleDeleteMessage }) => {
    return (
        <div className="absolute w-full">
            <Dialog
                size="xs"
                open={deleteItem !== null}
                handler={() => setDeleteItem(null)}
            >
                <DialogHeader></DialogHeader>
                <DialogBody className="text-center">
                    Удалить данное сообщение?
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={() => setDeleteItem(null)}
                        className="mr-1"
                    >
                        <span>Отмена</span>
                    </Button>
                    <Button
                        variant="gradient"
                        color="red"
                        size="sm"
                        onClick={handleDeleteMessage}
                    >
                        <span>Удалить</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default DialogDeleteMessage;