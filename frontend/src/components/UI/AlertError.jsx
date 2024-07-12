import {
    Alert,
    Typography,
} from "@material-tailwind/react";

const AlertError = ({ error, setError }) => {
    return (
        <div className="absolute w-full">
            <Alert color="red" open={error !== ''} onClose={() => setError('')}>
                <Typography className="font-medium">
                    {error}
                </Typography>
            </Alert>
        </div>
    );
}

export default AlertError;