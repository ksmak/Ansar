import {
    Alert,
    Spinner,
    Typography,
} from "@material-tailwind/react";

const AlertSendFile = ({ files }) => {
    return (
        <div className="absolute opacity-55 w-full">
            <Alert color="blue-gray" open={files.length > 0}>
                <Typography className="font-medium flex flex-row justify-between items-center gap-10">
                    Отправка файлов: {files.map(file => file.name + ", ")}
                    <Spinner className="h-8 w-8" />
                </Typography>
            </Alert>
        </div>
    );
}

export default AlertSendFile;