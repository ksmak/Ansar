import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import 'moment/locale/ru';

const MsgHeader = ({ userId, item, changeMessage, deleteMessage }) => {
    return (
        <div className="w-full font-mono text-black text-sm flex flex-row justify-between items-center">
            <div className='flex flex-row gap-4 items-center'>
                <FontAwesomeIcon icon={faUser} />
                <div className='text-bold'>{item.fullname}</div>
                <div className='italic'>{moment(item.changed_date).locale('ru').format('LLLL')}</div>
            </div>
            {item.state === 1 && item.from_user === userId
                ? < div className='flex flex-row gap-4 items-center'>
                    {!item.file && <FontAwesomeIcon className="justify-items-end hover:cursor-pointer" icon={faPen} onClick={() => changeMessage(item.id)} />}
                    <FontAwesomeIcon className="justify-items-end hover:cursor-pointer" icon={faTrash} onClick={() => deleteMessage(item.id)} />
                </div>
                : null}
        </div>
    );
}

export default MsgHeader;