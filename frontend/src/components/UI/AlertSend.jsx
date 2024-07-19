import {
    Alert,
    Spinner,
    Typography,
} from "@material-tailwind/react";

const AlertSend = ({ title }) => {
    return (
        <Alert color="blue-gray" open={!!title}>
            <Typography className="w-screen px-20 font-medium flex flex-row justify-between items-center">
                {title}
                <Spinner className="h-8 w-8 self-end" />
            </Typography>
        </Alert>
    );
}

export default AlertSend;