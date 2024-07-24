import { Tooltip, Typography } from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment/locale/ru';

const CheckReader = ({ readers }) => {
    const content = readers.length > 0 && readers.map(reader => {
        return (
            <div
                key={reader.id}
                className="w-96"
            >
                <Typography
                    variant="small"
                    color="white"
                    className="font-normal opacity-80"
                >
                    {reader.fullname + ", " + moment(reader?.read_date).locale('ru').format('LLLL')}
                </Typography>
            </div>
        )
    });

    return <div className='w-full font-mono flex flex-row gap-4 justify-end items-center'>
        <Tooltip
            className="hover:cursor-pointer"
            content={content}
        >
            <FontAwesomeIcon className='text-formbgcolor' icon={faCheckDouble} />
        </Tooltip>
    </div>
}

export default CheckReader;