import { useEffect } from "react";

const VideoChatPage = () => {
    useEffect(() => {
        let localVideo = document.getElementById('local-video');

        const constraints = {
            'video': true,
            'audio': true,
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                localVideo.srcObject = stream;
                localVideo.muted = true;
            })
            .catch(error => {
                console.log('Error accessing media devices', error);
            });

    })
    return (
        <div>
            Video Chat
            <div>
                <video id="local-video" autoPlay></video>
            </div>
        </div>
    )
}

export default VideoChatPage;