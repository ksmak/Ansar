import {
    Button
} from "@material-tailwind/react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash, faVideo, faVideoSlash } from '@fortawesome/free-solid-svg-icons';

const VideoChat = ({ localVideoRef, handleDisconnetVideoChat, audioMute, setAudioMute, videoMute, setVideoMute, handleRestartConnect }) => {
    return (
        <div className="relative h-screen w-full bg-black">
            <div id='video-container' className="h-full w-full flex flex-row">

            </div>
            <div className="absolute bottom-1 left-1 h-96 w-1/6 border border-yellow">
                <div className="w-full h-full relative">
                    <video
                        className="w-full h-full object-fill"
                        ref={localVideoRef} autoPlay
                    />
                    <div className="absolute bottom-0 end-0 p-5 flex flex-row gap-5 text-white">
                        <FontAwesomeIcon className="hover:cursor-pointer" icon={videoMute ? faVideoSlash : faVideo} size="1x" onClick={() => setVideoMute(!videoMute)} />
                        <FontAwesomeIcon className="hover:cursor-pointer" icon={audioMute ? faMicrophoneSlash : faMicrophone} size="1x" onClick={() => setAudioMute(!audioMute)} />
                    </div>
                </div>
            </div>
            <div className="absolute bottom-5 end-5 flex flex-row gap-4">
                <Button variant="gradient" color="blue" size="sm" onClick={handleRestartConnect}>Обновить</Button>
                <Button variant="gradient" color="red" size="sm" onClick={handleDisconnetVideoChat}>Завершить видеозвонок</Button>
            </div>
        </div>
    )
}

export default VideoChat;