
const video = document.querySelector("#videoElement");
const start = document.querySelector("#startButton");
const stop = document.querySelector("#stopButton");
const socket = new WebSocket("ws://localhost:8001");

var mediaRecorder = null;

stop.addEventListener('click', (event) => {
    if (mediaRecorder !== null && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
    }
});

socket.addEventListener('open', (event) => { 
    socket.send('Hello Server!'); 
}); 

socket.addEventListener('message', (event) => { 
    console.log('Message from server ', event.data); 
});

socket.addEventListener('close', (event) => { 
    console.log('The connection has been closed'); 
});

function handleVideoData(event) {
    if (event.data.size > 0) {
        console.log("video chunk data type: " + event.data.type);
        socket.send(event.data);
    }
}

async function main() {
    if (navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = stream;

            var options;
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                options = {
                    mimeType: 'video/webm; codecs=vp9',
                    audioBitsPerSecond : 128000,
                    videoBitsPerSecond : 2500000,
                };
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                options = {mimeType: 'video/webm; codecs=vp8'};
            } else {
                console.log("No supported types available");
                return
            }

            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.ondataavailable = handleVideoData;
            mediaRecorder.start(2000);
        } catch(err) {
            console.log("Something went wrong!");
            console.log(err);
        }
    } else {
        console.log("Access to media denied by user");
    }
}

main()
    .catch((err) => {
        console.log(err);
    });