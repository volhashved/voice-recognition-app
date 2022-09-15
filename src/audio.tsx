import { useRef } from 'react'

const SaveAudio = () => {
    const mediaRecorder = useRef<MediaRecorder>(null)

    const handleSuccess = function(stream: any) {
      const downloadLink = document.getElementById('download');
      const stopButton = document.getElementById('stop');

      const options = {mimeType: 'audio/webm'};
      const recordedChunks: any[] = [];
      // @ts-ignore
      mediaRecorder.current = new MediaRecorder(stream, options);

      mediaRecorder.current.addEventListener('dataavailable', function(e) {
        if (e.data.size > 0) recordedChunks.push(e.data);
      });

      function stopButtonClick () {
        mediaRecorder.current!.stop();
      }

      mediaRecorder.current.addEventListener('stop', function() {
        // @ts-ignore
        downloadLink.href = URL.createObjectURL(new Blob(recordedChunks));
        // @ts-ignore
        downloadLink.download = 'acetest.wav';

        stopButton?.removeEventListener('click', stopButtonClick)
      });

      // @ts-ignore
      stopButton.addEventListener('click', stopButtonClick);

      mediaRecorder.current!.start();
    };

  const handleClick = () => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(handleSuccess);
  }


  return (
    <div className="App">
      <button onClick={handleClick} id="start">Start</button>
    </div>
  );
}

export default SaveAudio;
