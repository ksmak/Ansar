import {
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography
} from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';


const DialogCall = ({ userId, call, handleAcceptCallVideoChat, handleCancelCallVideoChat }) => {
    return (
        <div className="absolute w-full">
            <Dialog
                size="xs"
                open={call !== null}
                handler={handleCancelCallVideoChat}
            >
                <DialogHeader>...</DialogHeader>
                <DialogBody className="text-center flex flex-row justify-center items-center">
                    <Typography>
                        {call?.from_id === userId
                            ? `Ожидание ответа пользователя <${call?.to_title}> ...`
                            : `Видеозвонок от пользователя <${call?.from_fullname}> ...`}
                    </Typography>
                    <FontAwesomeIcon className="text-primary animate-bounce" icon={faPhone} size="2x" />
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
                    {call?.from_id !== userId && <Button
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