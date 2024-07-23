import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
} from "@material-tailwind/react";


const DialogCall = ({ userId, call, handleAcceptCallVideoChat, handleCancelCallVideoChat }) => {
    return (
        <div className="absolute w-full">
            <Dialog
                size="xs"
                open={call !== null}
                handler={handleCancelCallVideoChat}
            >
                <DialogHeader>...</DialogHeader>
                <DialogBody className="text-center">
                    {call?.from_user_id === userId
                        ? `Ожидание ответа пользователя <${call?.title}> ...`
                        : `Видеозвонок от пользователя <${call?.from_user_fullname}> ...`}
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="outlined"
                        color="gray"
                        size="sm"
                        onClick={handleCancelCallVideoChat}
                        className="mr-1"
                    >
                        <span>Отмена</span>
                    </Button>
                    {call?.from_user_id !== userId && <Button
                        variant="gradient"
                        color="green"
                        size="sm"
                        onClick={handleAcceptCallVideoChat}
                        className="mr-1"
                    >
                        <span>Принять</span>
                    </Button>}
                </DialogFooter>
            </Dialog>
        </div>
    );
}

export default DialogCall;